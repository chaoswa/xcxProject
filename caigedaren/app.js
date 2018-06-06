//app.js
App({
  onLaunch: function () {
    let that=this;
    // 获取设备信息
    wx.getSystemInfo({
      success: (res) => {
        let system = res.system;
        system = system.substr(0, 3);
        this.globalData.system = system;
      }
    });
    
  },
  globalData: {
    system: '',   // And/iOS
    config: null,
    loginData: null,
    userInfo: null,
    user_detail: null,  //用户授权信息
  }
})