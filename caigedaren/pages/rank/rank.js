const app = getApp();
const common = require('../common/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    friend: true,
    world: false, //控制好友排行和世界排行的样式
    rank_friend: ['', '', ''],
    rank_world: [''],//好友列表和世界列表
    my_rank:[],
    isNoRank: false //控制好友排行为空时显示图片
  },


  //点击好友排行事件
  select_friend: function () {
    let that = this;
    // that.show_friend_pic();
    that.setData({
      friend: true,
      world: false,
      // isNoRank: false
    });
  },

  //点击世界排行事件
  select_world: function () {
    let that = this;
    let loginData = app.globalData.loginData;
    let skey = loginData.skey;
    that.setData({
      friend: false,
      world: true,
      isNoRank: false
    });
    // 世界排名
    let wordRankUrl = common.baseUrl+'challengesWordRank';
    let wordRankData = {
      skey: skey
    };
    common.Post(wordRankUrl, wordRankData).then(res => {
      console.log(res.data.list);
      this.setData({
        rank_world: res.data.list[0],
        my_rank: res.data.list[1]
      });
    });
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let loginData = app.globalData.loginData;
    let skey = loginData.skey;

    // 好友排名
    let friendRankUrl = common.baseUrl+'challengesFriendRank';
    let friendRankData = {
      skey: skey
    };
    common.Post(friendRankUrl, friendRankData).then(res => {
      console.log(res.data.list);
      if (res.data.list[0].length == 0){
        this.setData({ isNoRank: false });
      }
      this.setData({
        rank_friend: res.data.list[0],
        my_rank: res.data.list[1]
      });
    });

    //好友排行为空时显示图片
  },

})