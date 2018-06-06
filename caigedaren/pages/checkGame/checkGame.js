const app = getApp();
const common = require('../common/common.js');
const regeneratorRuntime = require('../common/runtime.js');
const innerAudioContext = wx.createInnerAudioContext();//主音频组件
const backgroundAudioManager = wx.getBackgroundAudioManager();//背景音乐组件
const musicUrl ='https://jixiancaige.chaosuduokai.com/music/20180518/Music/';//音乐歌曲路径
Page({

  /**
   * 页面的初始数据
   */
  data: {
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
    musicInfo:null,//当前歌曲信息
    songer:'周杰伦',//歌手
    music_name:'告白气球',//歌名
    option_click:true,//控制选项能否点击
    dataSelect: null, //用于控制选项被选择时的样式
    isCollect:false,  //是否收藏歌曲
    isSucess:false,//控制回答成功时的弹窗 
    isErr:false,//控制回答错误时的弹窗 
    isTen:false,//控制连续回答10题的弹窗 
    times:15,//倒计时
    timeInterval:null //倒计时事件函数
  },

  // 控制是否收藏歌曲
  collect_click:function(){
    let that=this;
    let loginData = app.globalData.loginData;
    let skey = loginData.skey;
    let isCollect = that.data.isCollect;
    let musicInfo = that.data.musicInfo;
    let url = common.baseUrl+'storeSong';
    that.setData({ isCollect:true });
    if (isCollect==false){
      let data = {
        skey: skey,
        song_id: musicInfo.data.song.id
      }
      common.Post(url, data).then(res=>{
        wx.showToast({
          title: '收藏歌曲成功',
          icon: 'success',
          duration: 1000
        })
      })
    }
  },


  //开始倒计时
  time_count_down: function () {
    let that = this;
    let times = that.data.times;

    let timeInterval = setInterval(() => {
      times--;
      that.setData({ times: times });
      if (times == 0) that.gameOver();
    }, 1000);
    that.setData({ timeInterval: timeInterval });
  },
  

  // 清除倒计时
  stop_Interval: function () {
    let that = this;
    let timeInterval = that.data.timeInterval;
    clearInterval(timeInterval);
  },

  // 回答错误时点击关闭按钮时的事件
  model_close_click:function(){
    let that=this;
    innerAudioContext.stop(); 
    that.setData({ isErr:false});
    wx.navigateBack({
      delta: 1
    })
  },

  // 去挑战模式事件
  go_challenge_click:function(){
    let that=this;
    innerAudioContext.stop(); 
    that.setData({ isErr:false});
    wx.navigateBack({
      delta: 2
    })
  },

  // 游戏结束时的事件
  gameOver:function(){
    let that=this;
    let musicInfo = that.data.musicInfo;
    let src = `${musicUrl}${musicInfo.data.song.file2}`;//歌曲高潮音乐
    that.setData({
      songer: musicInfo.data.song.singer,//歌手
      music_name: musicInfo.data.song.title//歌名
    })
    that.stop_Interval();//停止倒计时
    that.setData({ isErr:true });//显示回答错误弹窗
    that.play_music(src)//播放高潮音乐
  },

  // 回答正确进入下一关时触发的事件
  next_customs:function(){
    let that=this;
    let musicInfo = that.data.musicInfo;
    let src = `${musicUrl}${musicInfo.data.song.file2}`;//歌曲高潮音乐
    that.setData({ isSucess:true });//显示回答正确的弹窗
    that.play_music(src)//播放高潮音乐
  },


  //点击下一首歌
  next_song_click:function(){
    let that = this;
    let musicInfo = that.data.musicInfo;
    let src = `${musicUrl}${musicInfo.data.song.file1}`;//歌曲音乐
    innerAudioContext.stop(); 
    that.setData({ times: 15, isSucess: false, isTen: false, isCollect:false,dataSelect:null});
    that.play_music(src)//播放音乐
    that.time_count_down();//开始倒计时
    that.setData({ option_click: true });//控制选项能够点击
  },




  // 点击选择答案事件
  select_click:function(res){
    let that=this;
    let index = res.currentTarget.id;//用户选择的选项下标
    let loginData = app.globalData.loginData;
    let skey = loginData.skey;
    let musicInfo = that.data.musicInfo;//当前歌曲信息
    let option_click = that.data.option_click;//控制选项能否被点击
    let data={
      skey: skey,
      song_id: musicInfo.data.song.id,//当前歌曲id
      option: musicInfo.data.song.options_title[index],//用户选项
      mkey: musicInfo.data.mkey//防刷分key
    }

    that.stop_Interval();//停止定时器
    innerAudioContext.stop(); //停止音乐播放

    //控制选项选择时的样式
    let data_select = res.target.dataset.select;
    if (option_click){
      that.setData({
        dataSelect: data_select,
        option_click: false
      });
    }

   //成功和失败时弹出框歌曲和歌手
    that.setData({
      songer: musicInfo.data.song.singer,//歌手
      music_name: musicInfo.data.song.title,//歌名
    })

    //请求下一首歌曲
    if (option_click){//控制选项能否点击
      that.get_music_info(data).then(res => {
 
        if (res.data.song_answer) {
          /*********回答正确时**************/
          backgroundAudioManager.src = 'http://mp3tiaozhandashi.chaosuduokai.com/sucss.mp3';// //播放提示音
          backgroundAudioManager.title = '回答正确';
          backgroundAudioManager.onEnded(()=>{
            loginData.practice_num = res.data.practice_num;//保存当前关卡数
            let src = `${musicUrl}${musicInfo.data.song.file2}`;//歌曲高潮音乐
            that.setData({ isSucess: true });//显示回答正确的弹窗
            if (res.data.practice_num == 10) that.setData({ isTen: true });//答对10到题时的弹窗
            that.play_music(src);//播放高潮音乐
            that.setData({ musicInfo: res });
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
  play_music:function(src){

    if (innerAudioContext.paused==true){
      innerAudioContext.src = src;
      innerAudioContext.play();
    }else{
      innerAudioContext.stop(); 
      innerAudioContext.src = src;
      innerAudioContext.play();
    }
    
  },


  // 请求歌曲信息
  get_music_info: async function(data){
    let that = this;
    let url = common.baseUrl+'practice';
    let info= await common.Post(url,data);
    return info;
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    
    let loginData = app.globalData.loginData;

    let skey = loginData.skey;


    wx.showShareMenu({
      withShareTicket: true
    });
    
  
    //进入游戏后请求第一首歌曲
    that.get_music_info({skey:skey}).then(res=>{
      let song = res.data.song;
      let src = `${musicUrl}${song.file1}`;
      let practice_num = res.data.practice_num + 1;
      that.setData({ musicInfo: res });
      that.play_music(src)//播放音乐
      that.time_count_down();//开始倒计时
    }); 
    

    /*******音频组件回调事件*************/
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
      console.log(innerAudioContext.src)
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
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    let that=this;
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
    let that = this;
    var radNum = Math.floor(Math.random() * 3) + 1;
    let returnImg = that.data.returnImg;
    let returnUrl = returnImg[radNum];
    var returnText = that.data.returnText;
    let returnTit = returnText[radNum];

    let userInfo = app.globalData.loginData;
    var shareObj = {
      title: `【${userInfo.nickname}@我】${returnTit}`,
      imageUrl: `${returnUrl}`,
      path: '/pages/index/index',
      success: function (res) {
        console.log(res);
      }
    }
    return shareObj;
  }
})