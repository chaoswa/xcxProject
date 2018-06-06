//获取应用实例
const app = getApp();
const common = require('../common/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user_msg: [],   //login-data数据
    showLogin: false,
    showIndex: true,
    guide: false,   //是否显示公众号引导
    loginAward: false, //每日登陆显示
    loginAwardList: [], //每日登陆金币数组
    subscribe: false,   //控制公众号显示隐藏
    is_new_user: false,  //快捷方式显示隐藏
    is_onShow_data: false, //控制是否加载onShow
    subscribeShow: false,
    contactShow: true,
    room_id: 0,
    load_e: '',  //分享者的skey
  },

  // 拒绝授权
  scope: function () {
    wx.showToast({
      title: '无法获取您相关信息，无法开始挑战',
      icon: 'none',
      duration: 1000
    })


  },

  // 授权模态框点击
  getUserInfo: function (e) {
    console.log(e);
    let room_id = this.data.room_id;
    let url = '../index/index';
    if (room_id != 0) url = url + '?room_id=' + room_id;

    if (e.detail.errMsg == 'getUserInfo:ok') {
      wx.setStorage({
        key: 'showLogin',
        data: false,
        success: function () {
          wx.reLaunch({
            url: url,
          });
        }
      });
    } else {
      wx.openSetting({
        success: (res) => {
          if (res.authSetting['scope.userInfo']) {
            this.setData({ showLogin: false });
            wx.setStorage({
              key: 'showLogin',
              data: false,
            })
            let e = this.data.load_e;
            this.login(e);
          } else {
            this.scope();
          }
        }
      })
    }
  },

  // 跳转对战
  toPVP: function () {
    wx.navigateTo({
      url: '../pvp/pvp',
    })
  },

  // 底部点击广告跳转好礼引导
  toPrizes: function () {
    wx.navigateTo({
      url: '../guidance/guidance',
    })
  },

  // 快捷方式弹窗关闭
  closeShortcut: function () {
    this.setData({ is_new_user: false });
  },

  // 参与挑战赢好礼
  toGuidance: function () {
    wx.navigateTo({
      url: '../guidance/guidance',
    })
  },

  // 引导关注公众号显示
  openGuide: function () {
    this.setData({ guide: true });
  },
  // 引导关注公众号显示隐藏
  hideGuide: function () {
    this.setData({ guide: false });
    let loginData = app.globalData.loginData;
    let url = common.baseUrl + 'refresh';
    let data = { skey: loginData.skey };
    common.Post(url, data).then(res => {
      console.log('refresh', res.data);
      if (res.data.data.subscribe == 1) {
        loginData.score = res.data.data.score;
        this.setData({
          'user_msg.score': res.data.data.score,
          subscribe: true, //关注大奖显示
          subscribeShow: false,  //关注公众号按钮隐藏
          guide: false,   //引导图隐藏
          contactShow: true  //客服小助手显示
        });
      }
    });
  },
  getSubscribe: function () {
    this.setData({ subscribe: false });
    wx.showToast({
      title: '恭喜您领取关注大奖，积分+50',
      icon: 'none',
      duration: 2000,
    });
  },
  // 每日登陆立即领取
  loginAwardGet: function () {
    let getGoldUrl = common.baseUrl + 'getGold';
    let skey = this.data.user_msg.skey;
    let goldData = { skey: skey };
    common.Post(getGoldUrl, goldData).then(res => {
      console.log(res.data);
      if (res.data.err == 0) {
        app.globalData.loginData.score = res.data.score;
        this.setData({
          'user_msg.score': res.data.score
        });
        wx.showToast({
          title: '登陆奖励领取成功!',
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: '已经领取过啦!',
          icon: 'none'
        })
      }
      this.setData({ loginAward: false });
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    let that = this;
    if (e.room_id) that.setData({ room_id: e.room_id });
    that.setData({ load_e: e });
    //通过取缓存处理是否显示授权弹窗
    wx.getStorage({
      key: 'showLogin',
      success: function (res) {
        console.log('showLogin', res.data)
        if (res.data === false) {
          that.setData({ showLogin: false });
          that.login(e);
          console.log('success:getStorage', res.data);
        }
      },
      fail: function (res) {
        that.setData({ showLogin: true });
        console.log('fail:getStorage', res);
      }
    })

    wx.setStorageSync('adClick', true);//控制提交地址不能连续点击
  },
  /**
   * 登陆
   */
  login: function (e) {
    wx.login({
      success: res => {
        // console.log('code', res.code)
        let code = res.code;
        if (code) {
          wx.getSetting({
            success: res => {
              if (res.authSetting['scope.userInfo']) {
                wx.getUserInfo({
                  success: res => {
                    let scene = e.scene;
                    //通过场景值判断appId的值，进行数据统计
                    let appId = (scene == 1037 ? e.referrerInfo.appId : 0);
                    let loginUrl = common.baseUrl + 'login';
                    let data = {
                      code: code,
                      iv: res.iv,
                      encryptedData: res.encryptedData,
                      appid: appId
                    }
                    common.Post(loginUrl, data).then(res => {
                      if (res.data.data.is_new_user === 1) this.setData({ is_new_user: true });
                      if (res.data.data.getGoldDate > 0) this.setData({ loginAward: true });
                      if (res.data.data.subscribe == 0) this.setData({ subscribeShow: true, contactShow: false });

                      console.log('login', res);
                      app.globalData.config = res.data.config;  //游戏配置信息
                      app.globalData.loginData = res.data.data;  //用户游戏数据
                      // app.globalData.userInfo = res.data.userInfo;  //用户基本信息
                      this.setData({
                        user_msg: res.data.data,
                        loginAwardList: res.data.config.getGoldConfig,
                        is_onShow_data: true //控制是否加载onShow
                      });
                      // console.log('onload',e);
                      if ('skey' in e) {
                        // 分享进入成为好友
                        let pullInUrl = common.baseUrl + 'pullIn';
                        let pullInData = {
                          shareId: e.skey,
                          friendId: res.data.data.skey
                        };
                        common.Post(pullInUrl, pullInData).then(res => {
                          console.log('拉人进来', res.data);
                        });
                      };
                      // 是否从对战进入
                      if ('room_id' in e) {
                        this.jumpRoom(e.room_id);
                      }
                    });
                  }
                });
              }
            }
          });
        }
      }
    });
    wx.showToast({
      title: '登陆成功',
      icon: 'success',
      mask: true
    });
  },

  jumpRoom: function (option) {
    let that = this;
    let skey = app.globalData.loginData.skey;
    if (skey == 0) {
      setTimeout(function () {
        that.jumpRoom(option)
      }, 1000)
    } else {
      wx.navigateTo({
        url: '../pvp/pvp?room_id=' + option,
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    let is_onShow_data = that.data.is_onShow_data;//控制是否加载onShow
    let loginData = app.globalData.loginData;  //用户基本信息

    if (is_onShow_data == true) that.setData({ user_msg: loginData });
  },
})
