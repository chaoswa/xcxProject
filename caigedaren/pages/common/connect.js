module.exports = (function () {
  // var webSocketUrl = 'ws://192.168.24.9:55151',
  var webSocketUrl = 'wss://wss.chaosuduokai.com',
    socketOpened = false, // 标记websocket是否已经打开
    socketMsgQueue = [],
    socketState = false,  //连接状态
    connCallback = null,
    msgReceived = {};

  function connect(callback) { // 发起链接
    wx.connectSocket({
      url: webSocketUrl
    });
    connCallback = callback;
  }

  function initEvent() { // 初始化一些webSocket事件
    wx.onSocketOpen(function (res) { // webSocket打开事件处理
      socketOpened = true;
      console.log('websocket opened.');
      // 处理一下没发出去的消息
      while (socketMsgQueue.length > 0) {
        var msg = socketMsgQueue.pop();
        sendSocketMessage(msg);
      }
      connCallback && connCallback.call(null);
    });
    wx.onSocketMessage(function (res) { // 收到服务器消息时的处理
      // console.log('received msg: ' + res.data);
      msgReceived.callback && msgReceived.callback.call(null, res.data, ...msgReceived.params);
    });
    wx.onSocketError(function (res) { // 链接出错时的处理
      socketOpened = false;
      console.log('webSocket fail');
    });

    wx.onSocketClose(function (res) {  //链接关闭时的处理
      socketOpened = false;
      console.log("WebSocket 已关闭！")
    })
  }

  function close() {
    console.log("关闭了连接");
    wx.closeSocket();
  }

  function sendSocketMessage(msg) {
    if (typeof (msg) === 'object') {
      msg = JSON.stringify(msg);
    }
    if (socketOpened) {
      wx.sendSocketMessage({
        data: msg
      });
    } else { // 发送的时候，链接还没建立 
      socketMsgQueue.push(msg);
    }
  }

  function setReceiveCallback(callback, ...params) {
    if (callback) {
      msgReceived.callback = callback;
      msgReceived.params = params;
    }
  }

  function init() {
    initEvent();
  }

  init();
  return {
    connect: connect,
    close: close,
    send: sendSocketMessage,
    setReceiveCallback: setReceiveCallback,
    socketOpened: socketOpened
  };
})();
