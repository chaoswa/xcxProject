const app = getApp();
const common = require('../common/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gift_id:''
  },


  formSubmit: function (e) {
    var warn = "";
    var that = this;
    var flag = false;
    let loginData = app.globalData.loginData;
    let skey = loginData.skey;
    var adClick=wx.getStorageSync('adClick');//控制提交地址不能连续点击
    var gift_id = that.data.gift_id;
    if (e.detail.value.user == "") {
      warn = "请填写您的姓名！";
    } else if (e.detail.value.tel == "") {
      warn = "请填写您的手机号！";
    } else if (!(/^1(3|4|5|7|8)\d{9}$/.test(e.detail.value.tel))) {
      warn = "手机号格式不正确";
    } else if (e.detail.value.adds == "") {
      warn = "请输入您的微信号";
    } else {
      flag = true;
      console.log('form发生了submit事件，携带数据为：', e.detail.value)

      if (adClick){
        
        wx.setStorageSync('adClick',false);//控制提交地址不能连续点击

        wx.request({
          url: common.baseUrl+'addAddr',
          method: 'POST',
          data: {
            skey: skey,
            receiver: e.detail.value.user,//收货人
            address: e.detail.value.adds,//地址
            remark: e.detail.value.bz,//微信号
            receiver_tel: e.detail.value.tel,//手机号
            gift_id: gift_id//礼品id
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            console.log(res)
            if (res.data.err==0) {
              wx.showModal({
                title: '提示',
                content: '添加地址成功',
                success: function (res) {
                  wx.reLaunch({
                    url: "../index/index"
                  });
                }
              })
            } else {
              wx.showModal({
                title: '提示',
                content: res.data.msg
              })
            }
          }
        })
      }
 
    }
    if (flag == false) {
      wx.showModal({
        title: '提示',
        content: warn
      })
    }


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let gift_id = options.gift_id;
    console.log(gift_id)
    if (gift_id){
      this.setData({
        gift_id: gift_id
      })
    }
    wx.showShareMenu({
      withShareTicket: true
    });
  },
})