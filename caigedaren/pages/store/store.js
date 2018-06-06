const app = getApp();
const common = require('../common/common.js');
const regeneratorRuntime = require('../common/runtime.js');
// pages/store/store.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: 'https://xcx004.chaosuduokai.com//uploads/',//图片路径
    score: false,
    prize: true,
    rank_score: ['', '', '', '', '', ''],
    rank_change: [],
    rank_prize: ['', ''],
    rank_current:[],
    prize_id: 1,//奖品id
    not_have_icon: false,//积分不足弹窗
    get_gift: false//兑换礼物弹窗
  },

  toGame: function () {
    wx.navigateBack({ delta: 1 });
  },

  //点击获得积分事件
  select_score: function () {
    let that = this;
    that.setData({
      score: true,
      prize: false,
    });
  },

  //点击兑换奖品事件
  select_prize: function () {
    let that = this;
    that.setData({
      score: false,
      prize: true,
    })
  },


  //跳转到填写地址页面事件
  address_click: function () {
    let that = this;
    let data = that.data.prize_id;
    wx.reLaunch({
      url: `../address/address?gift_id=${data}`
    })
  },



  //积分兑换奖品的请求接口
  get_gift: function () {
    let that = this;
    let url = common.baseUrl + 'shop';
    common.Get(url).then(res => {
      console.log(res)
      that.setData({
        rank_score: res.data.exchange.pay,
        rank_change: res.data.exchange.change,
        rank_prize: res.data.gift
      })
    })
  },

  //音乐币的兑换
  change_icon: function (e) {
    let that = this;
    let loginData = app.globalData.loginData;
    let skey = loginData.skey;
    let index = e.currentTarget.id;
    let url = common.baseUrl + 'goExchange';
    let data = { skey: skey };
    common.Post(url, data).then(res => {
      wx.showToast({
        title: `${res.data.msg}`,
        icon: 'none',
        duration: 1000
      })
    })
  },

  //娃娃奖品的兑换
  change_gift: function (e) {
    let that = this;
    let loginData = app.globalData.loginData;
    let skey = loginData.skey;
    let index = e.currentTarget.id;
    let rank_prize = that.data.rank_prize[index];
    let url = common.baseUrl + 'changeGift';
    let data = { skey: skey, prize_id: rank_prize.id };
    that.setData({ rank_current: rank_prize, prize_id: rank_prize.id });//保存奖品id
    common.Post(url, data).then(res => {
      if (res.data.err == 1) that.setData({ not_have_icon: true });
      if (res.data.err == 0) that.setData({ get_gift: true });
    })
  },

  // 关闭弹窗
  model_close_click: function () {
    let that = this;
    that.setData({
      not_have_icon: false,
      get_gift: false
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let that = this;


    that.get_gift();

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