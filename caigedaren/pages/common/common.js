const baseUrl = 'https://xcx004.chaosuduokai.com/index/api/';
// const baseUrl = 'http://192.168.24.9/index.php/index/api/';  //本地

function Post(url,data) {
  return new Promise(
    (resolve,reject)=>{
      wx.request({
        method: 'POST',
        url: url,
        data: data,
        
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          resolve(res)
        },
        fail: function (res) {
          reject(res);
        }
      })
    }
  )
  
};

function Get(url) {
  return new Promise(
    (resolve, reject) => {
      wx.request({
        method: 'GET',
        url: url,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          resolve(res)
        },
        fail: function (res) {
          reject(res);
        },
        complete: function () {
          console.log('complete');
        }
      })
    }
  )

};


// 用户登录
function userLogin() {
  return new Promise(
    (resolve, reject) => {
      wx.login({
        success: function (res) {
          resolve(res)
        },
        fail: function (res) {
          reject(res);
        }
      });
    }
  )
};

// 获取用户当前设置
function userSetting() {
  return new Promise(
    (resolve, reject) => {
      wx.getSetting({
        success: function (res) {
          resolve(res)
        },
        fail: function (res) {
          reject(res);
        }
      });
    }
  )
};

// 获取用户信息
function userInfo() {
  return new Promise(
    (resolve, reject) => {
      wx.getUserInfo({
        success: function (res) {
          resolve(res)
        },
        fail: function (res) {
          reject(res);
        }
      });
    }
  )
};



module.exports.Post = Post
exports.Get = Get
exports.userInfo = userInfo
exports.userSetting = userSetting
exports.userLogin = userLogin
exports.baseUrl = baseUrl