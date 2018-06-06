const app = getApp();
const common = require('../common/common.js');
const regeneratorRuntime = require('../common/runtime.js');
const innerAudioContext = wx.createInnerAudioContext();//主音频组件
const backgroundAudioManager = wx.getBackgroundAudioManager();//背景音乐组件
const musicUrl = 'https://jixiancaige.chaosuduokai.com/yinyue-tiaozhan/';//音乐歌曲路径

Page({

  /**
   * 页面的初始数据
   */
  data: {
    config: null,//配置文件
    resurgence_num: 0,//复活次数
    dataSelect: null,//控制选项样式
    // 答案错误
    answer: true,
    count_down: true,
    circle_count_down: true,
    circle_count_down_number: 15,
    count: 0,// 当前关卡
    // 当前金币数
    num_money: 200,
    interval: null,      //定时器函数
    isErr: false,  //挑战失败
    ok: false,    //挑战成功
    resurgence: false,  //复活
    isSucess: false,          //回答正确
    musicInfo: null,//当前歌曲信息
    songList: [],//30首歌曲列表信息
    option_click: true,//控制选项能否点击
    sense: 1,//分享判断值
    returnImg: [
      '../../images/share.jpg',
      '../../images/share.jpg',
      '../../images/share1.jpg',
      '../../images/share1.jpg'],
    returnText: [
      '快来试试看，你能猜出这是什么歌吗？',
      '玩儿猜歌游戏，免费领娃娃！',
      '快来帮我猜猜这是什么歌，猜对领娃娃！',
      '90%的人通过猜歌领了娃娃，你也一起来吧！',
    ],
  },


  change_sense: function () {
    let that = this;
    wx.navigateBack({ delta: 1 })
  },

  //点击复活时改变sense值
  play_game_once: function () {
    let that = this;
    that.setData({ sense: 2 });
  },

  // 挑战失败返回主页
  goBackIndex: function () {
    wx.navigateBack({
      delta: 2
    })
  },
  // 继续游戏
  goBackClassify: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  // 兑换奖励
  goBackStore: function () {
    wx.redirectTo({
      url: '../store/store',
    })
  },

  // 复活关闭按钮
  resurgenceClose: function () {
    let that = this;
    that.setData({
      resurgence: false,
      isErr:true
    });
  },


  // 设置倒计时的定时器
  set_time_interval: function () {
    let that = this;
    let currentTime = that.data.circle_count_down_number;
    let interval = setInterval(function () {
      currentTime--;
      that.setData({
        circle_count_down_number: currentTime
      })
      if (currentTime <= 0) {
        //这里是倒计时为零时游戏结束事件
        that.gameOver();
      }
    }, 1000)

    that.setData({
      interval: interval
    })
  },

  // 清除倒计时
  stop_Interval: function () {
    let that = this;
    let timeInterval = that.data.interval;
    clearInterval(timeInterval);
  },


  //游戏结束时触发的事件
  gameOver: function () {
    let that = this;
    let resurgence_num = that.data.resurgence_num;//复活次数
    let interval = that.data.interval;
    let config = app.globalData.config;
    clearInterval(interval);//清除定时器
    if (resurgence_num < config.challengeRevivalTimes && config.shareStatus==true) that.setData({ resurgence: true })//弹出失败窗口
    else if (resurgence_num >= config.challengeRevivalTimes || config.shareStatus == false) {
      that.setData({ isErr: true });//弹出失败窗口
    } else {
      return
    }
  },



  //点击下一首歌
  next_song_click: function () {
    let that = this;
    let musicInfo = that.data.musicInfo;
    let src = `${musicUrl}${musicInfo.path}`;//歌曲音乐
    innerAudioContext.stop();
    that.setData({ circle_count_down_number: 15, dataSelect: null });
    that.play_music(src)//播放音乐
    that.set_time_interval();//开始倒计时
    that.setData({ option_click: true });//控制选项能够点击
  },

  // 点击选择答案事件
  select_click: function (res) {
    let that = this;
    let index = res.currentTarget.id;//用户选择的选项下标
    let loginData = app.globalData.loginData;
    let skey = loginData.skey;
    let musicInfo = that.data.musicInfo;//当前歌曲信息
    let songList = that.data.songList;//30首歌曲列表信息
    let count = that.data.count;//当前歌曲关卡
    let option_click = that.data.option_click;//控制选项能否被点击
    let data = {
      skey: skey,
      song_id: musicInfo.id,//当前歌曲id
      options: musicInfo.options_title[index],//用户选项
      style: musicInfo.type//猜歌首还是猜歌名
    }

    that.stop_Interval();//停止定时器
    innerAudioContext.stop(); //停止音乐播放

    //控制选项选择时的样式
    let data_select = res.target.dataset.select;
    that.setData({
      dataSelect: data_select,
      option_click: false
    });



    //请求下一首歌曲
    if (option_click) {//控制选项能否点击
      that.get_music_info(data).then(res => {
        console.log('userSelect',res.data);
        if (res.data.err == 0) {
          /*********回答正确时**************/
          count = count >= 30 ? 30 : count + 1;
          backgroundAudioManager.src = 'http://mp3tiaozhandashi.chaosuduokai.com/sucss.mp3';// //播放提示音
          backgroundAudioManager.title = '回答正确';
          backgroundAudioManager.onEnded(() => {
            that.setData({ isSucess: true });//显示回答正确的弹窗,关数加1；
            setTimeout(() => {
              if (count <= 29) {
                that.setData({ isSucess: false, count: count });
                that.setData({ musicInfo: songList[count] });
                that.setData({ num_money: res.data.score });
                app.globalData.loginData.score = res.data.score;
                that.next_song_click()//进入下一关
              }
              if (count == 30) {//当用户答对30道题目时

                let url = common.baseUrl+'playSuccess';
                common.Post(url, { skey: skey }).then(res => {
                  console.log(res);
                  loginData.score = res.data.score;//保存当前分数
                  that.setData({ isSucess: false, ok: true, count: count - 1 });
                });
              }
            }, 1000)
          });
        } else {
          /*********回答错误时**************/
          backgroundAudioManager.src = 'http://p.jdenter.cn/sound/sound_no.mp3';//播放提示音
          backgroundAudioManager.title = '回答错误';
          backgroundAudioManager.onEnded(() => {
            that.gameOver();
          })
        }
      });
    }
  },


  //播放音乐事件
  play_music: function (src) {
    console.log(innerAudioContext.paused);
    if (innerAudioContext.paused == true) {
      innerAudioContext.src = src;
      innerAudioContext.play();
    } else {
      innerAudioContext.stop();
      innerAudioContext.src = src;
      innerAudioContext.play();
    }
  },

  // 判断选择是否正确
  get_music_info: async function (data) {
    let that = this;
    let url = common.baseUrl+'userSelect';
    let info = await common.Post(url, data);
    return info;
  },

  //复活游戏
  resurgenceGame: function () {
    let that = this;
    let musicInfo = that.data.musicInfo;
    let src = `${musicUrl}${musicInfo.path}`;//歌曲音乐
    that.audioCtx = wx.createAudioContext('myAudio');
    that.setData({
      circle_count_down_number: 15,
      resurgence: false,
      option_click: true,
      dataSelect: null
    });
    console.log(src)
    that.play_music(src);
    that.set_time_interval();
  },




  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let that = this;

    let loginData = app.globalData.loginData;
    let config = app.globalData.config;

    let skey = loginData.skey;

    let count = that.data.count;//当前关卡

    let score = options.num_money;//用户当前金币

    wx.showShareMenu({
      withShareTicket: true
    });

    //进入游戏后请求第一首歌曲
    let songList = wx.getStorageSync('songList');
    let first_song = songList[count];//当前歌曲
    let src = `${musicUrl}${first_song.path}`;
    that.setData({
      songList: songList,//30首歌曲列表信息
      musicInfo: first_song,
      num_money: score,
      config: config
    });
    that.play_music(src)//播放音乐
    that.set_time_interval();//开始倒计时



    /*******音频组件回调事件*************/
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    });

    innerAudioContext.onStop(() => {
      console.log('播放停止')
    });
    innerAudioContext.onEnded(() => {
      console.log('播放结束')
    });

    innerAudioContext.onError((res) => {
      console.log(res);
      console.log(res.errMsg)
    });


  },




  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that=this;
    let config = app.globalData.config;
    that.setData({ config: config});
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    let that = this;
    innerAudioContext.stop();
    that.stop_Interval();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    let that = this;
    innerAudioContext.stop();
    that.stop_Interval();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this;
    let loginData = app.globalData.loginData;
    let skey = loginData.skey;
    let resurgence_num = that.data.resurgence_num;//复活次数
    var radNum = Math.floor(Math.random() * 3) + 1;
    let returnImg = that.data.returnImg;
    let returnUrl = returnImg[radNum];
    var returnText = that.data.returnText;
    let returnTit = returnText[radNum];

    var shareObj = {
      title: `【${loginData.nickname}@我】${returnTit}`,
      imageUrl: `${returnUrl}`,
      path: `/pages/index/index?skey=${skey}`,
      success: function (res) {
        //获取分享成功返回对象的长度
        let tmp = Object.keys(res);
        let res_length = tmp.length;

        if (res.errMsg == 'shareAppMessage:ok' && res_length == 2) {
          var shareTickets = res.shareTickets;
          wx.getShareInfo({
            shareTicket: shareTickets[0],
            success: function (res) {
              let sense = that.data.sense;
              let encData = res.encryptedData;
              let vi = res.iv;
              let url = common.baseUrl+'shareG';
              let data = { skey: skey, encryptedData: encData, iv: vi, sense: sense };
              common.Post(url, data).then(res => {
                if (res.data.err == 0) {
                  resurgence_num += 1;
                  that.setData({ resurgence_num: resurgence_num });
                  that.resurgenceGame();
                } else {
                  wx.showToast({
                    title: `${res.data.msg}`,
                    icon: 'none',
                    duration: 2000
                  })
                }
              });
            }
          })
        }

        if (res.errMsg == 'shareAppMessage:ok' && res_length == 1) {
          console.log('分享到个人');
          let shareFIncTimesUrl = common.baseUrl+'shareFIncTimes';
          let shareFIncTimesData = {
            skey: skey
          }
          common.Post(shareFIncTimesUrl, shareFIncTimesData).then(res => {
            if (res.data.err == 0) {
              wx.showToast({
                title: `${res.data.msg},+10积分`,
                icon: 'none',
                duration: 2000
              })
              that.money_close();
            } else {
              wx.showToast({
                title: `${res.data.msg}`,
                icon: 'none',
                duration: 2000
              })
            }
          })
        }
      }
    }
    return shareObj;
  }
})