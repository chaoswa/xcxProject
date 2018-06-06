const app = getApp();
const common = require('../common/common.js');
const regeneratorRuntime = require('../common/runtime.js');
const innerAudioContext = wx.createInnerAudioContext();
const musicUrl = 'https://jixiancaige.chaosuduokai.com/music/20180518/Music/';//音乐歌曲路径
// pages/myLike/myLike.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    music_list: ['', ''],
    have_music: true, //歌单列表为空时的文字显示
    isPlay: false,//控制歌曲播放暂停图标切换
    dataPlay: null
  },

  //判断是否显示文字
  show_text: function () {
    let that = this;
    let list = that.data.music_list;
    if (list.length > 0) that.setData({ have_music: false })
  },

  //跳转到游戏界面
  start_game: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  //删除收藏的歌曲
  del_click: function (e) {
    let that = this;
    let loginData = app.globalData.loginData;
    let skey = loginData.skey;
    let index = e.currentTarget.id;//点击的歌曲下标
    let music_list = that.data.music_list;
    let music = that.data.music_list[index];
    console.log(music)
    wx.showModal({
      title: '提示',
      content: '确定要删除此收藏歌曲吗？',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          let url = common.baseUrl+'delSong';
          let data = { skey: skey, song_id: music.id };
          common.Post(url, data).then(res => {
            music_list.splice(index, 1);
            that.setData({ music_list: music_list });
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  //点击播放歌曲
  start_play: function (res) {
    let that = this;
    let is_Play = that.data.isPlay;
    let dataset = res.currentTarget.dataset.play;
    let index = res.currentTarget.id;//点击的歌曲下标
    let music = that.data.music_list[index];
    let src = `${musicUrl}${music.file2}`;//歌曲音乐

    if (is_Play == true) {
      that.setData({ isPlay: false });
      //点击暂停音乐事件
      console.log('暂停了')
      innerAudioContext.stop();
    } else {
      that.setData({ isPlay: true });
      //点击播放音乐事件
      console.log('播放了')
      that.play_music(src);
    }
    that.setData({ dataPlay: dataset });
  },


  //播放音乐事件
  play_music: function (src) {
    // console.log(innerAudioContext.paused);
    if (innerAudioContext.paused == true) {
      innerAudioContext.src = src;
      innerAudioContext.play();
    } else {
      innerAudioContext.stop();
      innerAudioContext.src = src;
      innerAudioContext.play();
    }

  },

  // 请求歌曲信息
  get_music_info: async function (data) {
    let that = this;
    let url = common.baseUrl+'favoriteSongList';
    let info = await common.Post(url, data);
    return info;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;

    let loginData = app.globalData.loginData;

    let skey = loginData.skey;

    that.show_text();

    that.get_music_info({ skey: skey }).then(res => {
      if (res.data.err == 0) {
        that.setData({ music_list: res.data.songs })
      } else {
        that.setData({
          music_list: [],
          have_music:true
        })
      }

    })
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
    innerAudioContext.stop();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    innerAudioContext.stop();
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