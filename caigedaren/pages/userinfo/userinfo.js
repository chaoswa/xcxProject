const app = getApp();
const common = require('../common/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: [],  //用户信息
    prizes: [], //奖品记录
    isHave: false,  //有无奖品记录
    winChallengeRate: 0,
    winPracticeRate: 0,
  },

  myLike: function () {
    wx.navigateTo({
      url: '../myLike/myLike',
    })
  },
  goComplaint: function () {
    wx.navigateTo({
      url: '../ad/ad',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    let skey = app.globalData.loginData.skey;
    let userUrl = common.baseUrl+'personalCenter';
    let userData = {
      skey: skey,
    };
    common.Post(userUrl, userData).then(res => {
      if (res.data.data.prizes.length == 0) {
        this.setData({ isHave: true });
      }
      let userInfo = res.data.data.userInfo;
      // 挑战模式胜率
      let challenge_all = userInfo.challenge_all;
      let challenge_success = userInfo.challenge_success;
      let winChallengeRate = challenge_all == 0 ? 0 : Math.floor((challenge_success / challenge_all) * 100);
      // 联系模式正确率
      let practice_all = userInfo.practice_all;
      let practice_success = userInfo.practice_success;
      let winPracticeRate = practice_all == 0 ? 0 : Math.floor((practice_success / practice_all) * 100);
      console.log(practice_success)
      this.setData({
        prizes: res.data.data.prizes,
        userInfo: userInfo,
        winChallengeRate: winChallengeRate,
        winPracticeRate: winPracticeRate
      });
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
    let loginData = app.globalData.loginData;
    this.setData({ userInfo: loginData });
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

  }
})