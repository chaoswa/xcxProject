const app = getApp();
const common = require('../common/common.js');
const regeneratorRuntime = require('../common/runtime.js');
const innerAudioContext = wx.createInnerAudioContext();//主音频组件
const backgroundAudioManager = wx.getBackgroundAudioManager();//背景音乐组件
const musicUrl = 'https://jixiancaige.chaosuduokai.com/music/20180518/Music/';//音乐歌曲路径
// pages/Challenge/Challenge.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user_msg: [], //用户数据
    hint: false,   //进入前弹窗提示
    type_id: 1,//歌曲类型
    insufficient: false,  //金币不足
    // 需要钱
    money: true,
    Consume: 0,  //消耗积分
    songAllList: [],  //选择歌单
    songLoveList: [],  //我的歌单
    // game_click: true,
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

  // 关闭提示弹窗
  Close: function () {
    this.setData({
      hint: false,
    })
  },

  //关闭分享弹框
  money_close: function () {
    this.setData({
      insufficient: false,
    })
  },

  // 请求歌曲信息
  get_music_info: async function (data) {
    let that = this;
    let url = common.baseUrl + 'challenge';
    let info = await common.Post(url, data);
    return info;
  },


  // 跳转猜歌
  Togame: function (e) {
    let that = this;
    let loginData = app.globalData.loginData;
    let Consume = that.data.Consume;
    let skey = loginData.skey;
    let type_id = e.currentTarget.dataset.type;
    let score = that.data.user_msg.score;
    if (loginData.score < Consume) {
      that.setData({ insufficient: true });
    } else if (loginData.score >= Consume) {
      that.setData({ hint: true, type_id: type_id });
    } else {
      return
    }
  },

  orderSign: function (e) {
    // console.log(e.detail.formId);
    let that = this;
    let loginData = app.globalData.loginData;
    let skey = loginData.skey;
    let type_id = that.data.type_id;
    let form_id = e.detail.formId;

    let data = { skey: skey, song_type: type_id, form_id: form_id };

    //进入游戏请求歌曲
    wx.showLoading({
      title: '加载中',
    });
    that.setData({ hint: false });
    that.get_music_info(data).then(res => {
      console.log(res.data.data)
      if (res.data.err == 1) {
        // that.setData({ insufficient: true });
        wx.hideLoading();
        wx.showToast({
          title: `${res.data.msg}`,
          icon: 'none',
          duration: 2000
        });
      } else {
        wx.setStorageSync('songList', res.data.data);//请求歌曲信息存于缓存
        loginData.score = res.data.score;
        that.Close();
        wx.navigateTo({
          url: `../challenge/challenge?num_money=${res.data.score}`
        })
        wx.hideLoading();
      }
    });
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let songListUrl = common.baseUrl + 'challengeSongList';
    let loginData = app.globalData.loginData;
    let skey = loginData.skey;
    common.Post(songListUrl, { skey: skey }).then(res => {
      // console.log(res.data);
      this.setData({
        songAllList: res.data[0],
        songLoveList: res.data[1]
      });
    });
    wx.showShareMenu({
      withShareTicket: true
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
    // console.log('用户数据', app.globalData.loginData);
    let Consume = Math.abs(app.globalData.config.challengeConsume);
    this.setData({
      user_msg: app.globalData.loginData,
      Consume: Consume
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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
    let userInfo = app.globalData.loginData;
    let skey = app.globalData.loginData.skey;
    var radNum = Math.floor(Math.random() * 3) + 1;
    let returnImg = that.data.returnImg;
    let returnUrl = returnImg[radNum];
    var returnText = that.data.returnText;
    let returnTit = returnText[radNum];

    var shareObj = {
      title: `【${userInfo.nickname}@我】${returnTit}`,
      imageUrl: `${returnUrl}`,
      path: '/pages/index/index?skey=' + skey,
      success: function (res) {
        console.log(res);
        //获取分享成功返回对象的长度
        let tmp = Object.keys(res);
        let res_length = tmp.length;

        if (res.errMsg == 'shareAppMessage:ok' && res_length == 2) {
          var shareTickets = res.shareTickets;
          wx.getShareInfo({
            shareTicket: shareTickets[0],
            success: function (res) {
              let shareUrl = common.baseUrl + 'shareG';
              let data = {
                sense: 1,
                skey: skey,
                encryptedData: res.encryptedData,
                iv: res.iv
              };
              common.Post(shareUrl, data).then(res => {
                console.log('shareG', res.data);
                if (res.data.err == 0) {
                  wx.showToast({
                    title: `${res.data.msg},+30积分`,
                    icon: 'none',
                    duration: 2000
                  });
                  app.globalData.loginData.score = userInfo.score + 30;
                  that.money_close();
                } else {
                  wx.showToast({
                    title: `${res.data.msg}`,
                    icon: 'none',
                    duration: 2000
                  })
                }
              });
            },
            fail: function (res) {
              console.log(res)
            }
          });
        }
        if (res.errMsg == 'shareAppMessage:ok' && res_length == 1) {
          console.log('分享到个人');
          let shareFIncTimesUrl = common.baseUrl + 'shareFIncTimes';
          let shareFIncTimesData = {
            skey: skey
          }
          common.Post(shareFIncTimesUrl, shareFIncTimesData).then(res => {
            if (res.data.err == 0) {
              wx.showToast({
                title: `${res.data.msg},+10积分`,
                icon: 'none',
                duration: 2000
              });
              app.globalData.loginData.score = userInfo.score + 10;
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