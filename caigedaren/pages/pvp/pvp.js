const app = getApp();
const common = require('../common/common.js');
const websocket = require('../common/connect.js');
const msgReceived = require('../common/msgHandler.js');
const innerAudioContext = wx.createInnerAudioContext();//主音频组件
const backgroundAudioManager = wx.getBackgroundAudioManager();//背景音乐组件
const musicUrl = 'https://jixiancaige.chaosuduokai.com/music/20180518/Music/';//音乐歌曲路径
var Timer = true;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    pkMsg: true,  //对战双方信息
    wait: true,     //等待
    ready: false, //开始答题
    showPk: false,
    gameShow: false, //游戏界面
    vs: true,     //对战vs
    time: false,   //倒计时
    circle_count_down: true,
    circle_count_down_number: 10,
    interval: null,      //定时器函数
    songList: [],
    options: {},
    option_click: true,//控制选项能否点击
    room_id: 0,  //房间号
    next: false, //第几首遮罩
    cont: 1, //第几首
    my_info: { "gold": 0 },
    you_info: { "gold": 0 },
    showFram: false,  //失败成功弹窗
    err: false,  //失败
    success: false,  //成功
    mask: false,  //围观遮罩
    abandon: false, //放弃弹窗
    my_num: 0,  //连续答对
    you_num: 0,
    my_pre: false,
    you_pre: false,
    showGold: true,
    returnImg: [
      '../../images/pk_share1.jpg',
      '../../images/pk_share1.jpg',
      '../../images/pk_share2.jpg',
      '../../images/pk_share2.jpg'],
    returnText: [
      '快来试试看，你能猜出这是什么歌吗？',
      '玩儿猜歌游戏，免费领娃娃！',
      '快来帮我猜猜这是什么歌，猜对领娃娃！',
      '90%的人通过猜歌领了娃娃，你也一起来吧！',
    ],
    bullet: '',
    doommData: [], //接收弹幕信息
    usersId: [], //所有用户的id
    self_nickname: '',
    inPlayBullet: false,//是否在播放弹幕
    //热词数组
    array: [
      "快点吧~我等到花儿都谢了~", "你也忒厉害了呀", "扎心了，老铁",
      "请开始你的表演", "疯狂打call！", "已耗尽洪荒之力",
      "意不意外，惊不惊喜", "我能怎么办，我也很绝望啊", "你们尽管猜，猜对了算我输",
    ]       
  },

  // 点击热词输入到文本框
  bindPickerChange: function (e) {
    let arr = this.data.array;
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      bullet: arr[e.detail.value]
    });
    this.send();
  },

  // 获取弹幕文本框value值
  getBullet: function (e) { this.setData({ bullet: e.detail.value }); },
  // 发送弹幕
  send: function () {
    if (this.data.bullet == '') return;
    let users_id = this.data.usersId;
    let bullet = this.data.self_nickname + ':' + this.data.bullet;
    websocket.send({
      'operation': 'BroadCast',
      'players': users_id,
      'bullet': bullet
    });
    this.setData({ bullet: '', });
  },

  // 点击选择答案事件
  select_click: function (res) {
    let that = this;
    let loginData = app.globalData.loginData;
    let room_id = that.data.room_id;
    let index = res.currentTarget.id;//用户选择的选项下标
    let option_click = that.data.option_click;//控制选项能否被点击
    console.log('点击状态', option_click);
    //控制选项选择时的样式
    let data_select = res.target.dataset.select;
    if (option_click) {
      that.setData({ option_click: false });
    }
    if (option_click == true) {
      websocket.send({
        'skey': loginData.skey,
        'room_id': room_id,
        'operation': 'ShowOption',
        'option': data_select
      });
    }
  },

  //点击放弃弹出框
  abandon: function () { this.setData({ abandon: true }); },
  //点击取消弹出框
  closeAbandon: function () { this.setData({ abandon: false }); },

  //点击确定返回首页
  gobackIndex: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  // 再来一局
  againRound: function () {
    let that = this;
    let loginData = app.globalData.loginData;
    let room_id = that.data.room_id;
    websocket.send({
      'skey': loginData.skey,
      'room_id': room_id,
      'operation': 'GameAgain',
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    let that = this;
    let loginData = app.globalData.loginData;
    let room_id;
    let roomUrl = common.baseUrl + 'createRoom';
    let roomData = {
      skey: loginData.skey
    };
    if ('room_id' in e) {
      room_id = e.room_id;
      that.setData({ room_id: room_id });
      that.connect(loginData.skey, room_id);
    } else {
      common.Post(roomUrl, roomData).then(res => {
        console.log('建立房间', res.data);
        that.setData({ room_id: res.data.room_id });
        room_id = res.data.room_id;
        that.connect(loginData.skey, room_id);
      });
    }
  },

  connect: function (skey, rid) {
    if (!websocket.socketOpened) {
      websocket.setReceiveCallback(msgReceived, this, musicUrl, innerAudioContext);
      websocket.connect();
      websocket.send({
        'skey': skey,
        'room_id': rid,
        'operation': 'JoinRoom'
      });
      this.heartbeat();
    } else {
      websocket.send({
        'skey': skey,
        'room_id': rid,
        'operation': 'JoinRoom'
      });
      this.heartbeat();
    }
  },

  startGame: function () {
    console.log(111);
    var that = this;
    let loginData = app.globalData.loginData;
    let room_id = that.data.room_id;
    websocket.send({
      'skey': loginData.skey,
      'room_id': room_id,
      'operation': 'GameStart'
    });
  },

  // 设置倒计时的定时器
  set_time_interval: function () {
    let that = this;
    that.setData({
      circle_count_down_number: 10
    });
    let currentTime = that.data.circle_count_down_number;
    let interval = setInterval(function () {
      currentTime--;
      that.setData({
        circle_count_down_number: currentTime
      })
      if (currentTime <= 0) {
        //这里是倒计时为零时游戏结束事件
        that.stop_Interval();  //清除倒计时
        innerAudioContext.stop();
      }
    }, 1000)

    that.setData({
      interval: interval
    })
  },

  // 清除倒计时
  stop_Interval: function () {
    let that = this;
    let timeInterval = that.data.interval;
    clearInterval(timeInterval);
  },

  //播放音乐事件
  play_music: function (src) {
    console.log(innerAudioContext.paused);
    if (innerAudioContext.paused == true) {
      innerAudioContext.src = src;
      innerAudioContext.play();
    } else {
      innerAudioContext.stop();
      innerAudioContext.src = src;
      innerAudioContext.play();
    }
  },

  heartbeat: function () {
    let that = this;
    if (Timer) {
      setTimeout(function () {
        websocket.send('@');
        that.heartbeat();
      }, 5000);
    }
  },

  Doom: function (text, top, time, color) {
    let doomm = {};
    console.log(text);
    doomm.text = text;
    doomm.top = top;
    doomm.time = time;
    doomm.color = color;
    doomm.display = true;
    let doommList = this.data.doommData;
    if (doommList.length > 5) {
      doommList.splice(doommList.indexOf(this), 1);
    }
    doommList.push(doomm);
    this.setData({
      doommData: doommList,
      inPlayBullet: true
    })
    setTimeout(() => {
      doommList.splice(doommList.indexOf(this), 1);//动画完成，从列表中移除这项
      this.setData({
        doommData: doommList,
        inPlayBullet: false,
      })
      console.log(doommList);
    }, doomm.time * 1000)//定时器动画完成后执行。
  },
  autoPlayBullet: function () {
    if (this.data.mask === false) return;
    let that = this;
    setTimeout(function () {
      if (that.data.inPlayBullet === false && that.data.doommData.length > 0) {
        let doommData = that.data.doommData;
        doommData.splice(doommData.indexOf(this), 1);
        that.setData({ doommData: doommData })
      }
      that.autoPlayBullet()
    }, 3000);
  },
  getRandomColor: function () {
    let rgb = []
    for (let i = 0; i < 3; ++i) {
      let color = Math.floor(Math.random() * 256).toString(16)
      color = color.length == 1 ? '0' + color : color
      rgb.push(color)
    }
    return '#' + rgb.join('')
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.heartbeat();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    Timer = true;
    this.autoPlayBullet();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    Timer = false;
    innerAudioContext.stop();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    Timer = false;
    innerAudioContext.stop();
    websocket.close();
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
    let that = this;
    let loginData = app.globalData.loginData;
    let skey = loginData.skey;
    let room_id = that.data.room_id;

    var radNum = Math.floor(Math.random() * 3) + 1;
    let returnImg = that.data.returnImg;
    let returnUrl = returnImg[radNum];
    var returnText = that.data.returnText;
    let returnTit = returnText[radNum];

    var shareObj = {
      title: `【${loginData.nickname}@我】${returnTit}`,
      imageUrl: `${returnUrl}`,
      path: '/pages/index/index?room_id=' + room_id,
      success: function (res) {
        console.log(res);
      }
    };
    return shareObj;
  }
})



