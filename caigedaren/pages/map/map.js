const app = getApp();
const common = require('../common/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: [], //用户信息
    mapList: [],
  },

  goMap: function (e) {
    // console.log(e.currentTarget.dataset.key);
    wx.navigateTo({
      url: '../checkGame/checkGame',
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let loginData = app.globalData.loginData;
    let page = Math.ceil(loginData.practice_num / 200);
    let key = 1;
    let count = 200;
    let list = [];
    for (let i = 1; i <= page; i++) {
      if (i == 1) {
        list[i - 1] = { 'key': key, 'count': count }
      } else {
        key += 200;
        count += 200;
        list[i - 1] = { 'key': key, 'count': count }
      }
    }
    console.log(list);
    this.setData({
      userInfo: loginData,
      mapList: list
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

  }
})