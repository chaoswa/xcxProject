// pages/ad/ad.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    complaint: [
      '色情',
      '诱导',
      '骚扰',
      '欺诈',
      '恶意营销',
      '与服务类型不符',
      '违法犯罪',
      '侵权（冒名、诽谤、抄袭）',
      '不实信息',
      '隐私信息收集',
      '其他',
    ],
    currentItem: ''
  },

  click: function (e) {
    console.log(e);
    let id = e.target.dataset.id;
    this.setData({ currentItem: id });
  },
  back:function(){
    wx.showToast({
      title: '投诉成功',
      icon: 'success',
      duration: 1500
    })
    setTimeout(function(){
      wx.navigateBack({
        delta: 1
      })
    },2000);
  },
  
})