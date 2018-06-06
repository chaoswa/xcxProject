const app = getApp();
const common = require('../common/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    prizes: [],
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

  goClassify: function () {
    wx.redirectTo({
      url: '../classify/classify',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showShareMenu({
      withShareTicket: true
    });
    let getRuleUrl = common.baseUrl+'getRules';
    common.Get(getRuleUrl).then(res => {
      console.log(res.data[0]);
      this.setData({ prizes:res.data[0]});
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
              let shareUrl = common.baseUrl+'shareG';
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
                    title: `${res.data.msg}`,
                    icon: 'none',
                    duration: 2000
                  })
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
          let shareFIncTimesUrl = common.baseUrl+'shareFIncTimes';
          let shareFIncTimesData = {
            skey: skey
          }
          common.Post(shareFIncTimesUrl, shareFIncTimesData).then(res => {
            if (res.data.err == 0) {
              wx.showToast({
                title: `${res.data.msg}`,
                icon: 'none',
                duration: 2000
              })
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