const app = getApp();
const common = require('../common/common.js');
const regeneratorRuntime = require('../common/runtime.js');
// pages/checkPoint/checkPoint.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    friend:true,
    world:false, //控制好友排行和世界排行的样式
    rank_friend:['','','','','',''],
    rank_world:[''],//好友列表和世界列表
    my_info:[],//个人信息
    practice_num:1//关卡数
  },
  
  //点击好友排行事件
  select_friend:function(){
    this.setData({
      friend: true,
      world: false
    })
  },
  
  //点击世界排行事件
  select_world:function(){
    this.setData({
      friend: false,
      world: true
    });
    let loginData = app.globalData.loginData;
    let skey = loginData.skey;
    this.get_rank_info({ skey: skey }).then(res => {   //世界排行榜信息
      console.log(res.data.list[1])
      this.setData({
        rank_world: res.data.list[0],
        my_info: res.data.list[1]
      })
    });
  },
  
  //跳转到管卡地图
  to_Map:function(){

  },
  
  //跳转到游戏界面
  start_game:function(){
    wx.navigateTo({
      url: "../checkGame/checkGame"
    })
  },

  //世界排行榜信息
  get_rank_info: async function (data) {
    let that = this;
    let url = common.baseUrl+'practiceWordRank';
    let info = await common.Post(url, data);
    return info;
  },
  //好友排行榜信息
  get_friend_info: async function (data) {
    let that = this;
    let url = common.baseUrl+'practiceFriendRank';
    let info = await common.Post(url, data);
    return info;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    
    let loginData = app.globalData.loginData;
    let skey = loginData.skey;
    console.log(skey)
    that.setData({ practice_num: loginData.practice_num});
    
    that.get_friend_info({ skey: skey }).then(res => {   //好友排行榜信息
      console.log(res.data.list[1])
      that.setData({
        rank_friend: res.data.list[0],
        my_info: res.data.list[1]
      })
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
    let that = this;
    let loginData = app.globalData.loginData;

    that.setData({ practice_num: loginData.practice_num });
  },

})