module.exports = function (res, page, musicUrl, play) {
  if (res === '@') return;  //心跳检测
  res = JSON.parse(res);
  /****打印信息 */
  console.log('res', res);
  /****打印信息 end */
  if (res.err === 0) {
    /**查看是否有广播消息**/
    if (res.bullet) {
      page.Doom(res.bullet, Math.ceil(Math.random() * 80), Math.ceil(Math.random() * 5 + 5), page.getRandomColor());
      return;
    }
    /***收集在线人的id */
    if (res.players) {
      let usersId = [];
      for (let i in res.players) {
        usersId.push(res.players[i].user_id);
        if (res.self_id == res.players[i].user_id) {//取出自己的昵称
          page.setData({ self_nickname:res.players[i].nickname })
        }
      }
      page.setData({ usersId: usersId });
    }
    if (res.roomInfo.question) console.log('第首', res.roomInfo.question, '歌曲');
    let my_info = [];
    let you_info = [];
    for (let i = 0; i < res.players.length; i++) {
      if (res.players[i].status == 0 && res.players[i].user_id == res.self_id) {   //status==0为围观
        page.setData({
          mask: true
        });
      }
      if (res.players[i].status == 1) {   //默认自己是pk双方之一
        if (res.players[i].user_id == res.self_id) {
          my_info = res.players[i];
        } else {
          you_info = res.players[i];
        }
      }
    }
    if (my_info.length == 0 || you_info.length == 0) {
      my_info = res.players[0];
      delete my_info['gameStart'];
      if (res.players.length == 1) {
        you_info = { "avatarurl": "", "correct": 0, "gold": 0, "nickname": "请等待...", "status": 1, "user_id": 0 };
      } else {
        if (res.players[1].status == 1) {
          you_info = res.players[1];
        } else {
          you_info = { "avatarurl": "", "correct": 0, "gold": 0, "nickname": "请等待...", "status": 1, "user_id": 0 };
        }

      }
    }
    page.setData({
      my_info: my_info,
      you_info: you_info
    });

    if (res.song && res.song.length != 0) {
      let options = new Object();
      let titles = res.song.options_title;
      for (let x in titles) {
        options[titles[x]] = "default";
      }
      page.setData({
        songList: res.song,
        options: options
      });
    }
    if (res.roomInfo.status == 0) {
      page.setData({
        pkMsg: true,
        wait: true,
        showFram: false,
        success: false,
        err: false,
        showPk: false,
        options: {},
        vs: false,
        time: false,
        gameShow: false,
        option_click: false,
        next: false,
        showGold: false,
      });
    }
    if (res.roomInfo.status == 1) {  //如果房间状态为1点击开始后
      console.log('场景', 1);
      page.stop_Interval();  //清除倒计时
      page.setData({
        pkMsg: false,
        wait: false,
        showPk: true,
        options: {},
        my_num: 0,
        my_pre: false,
        you_num: 0,
        you_pre: false,
        showFram: false,
        success: false,
        err: false,
        vs: false,
        time: false,
        gameShow: false,
        option_click: false,
        next: false,
        showGold: false,
      });
      setTimeout(() => {
        page.setData({
          showPk: false
        });
      }, 2000);
      setTimeout(() => {
        page.setData({
          pkMsg: true,
          vs: false,
          time: true,
          gameShow: true
        });
      }, 2000);
    }
    if (res.roomInfo.status == 2) {
      console.log('场景', 2);
      let song = page.data.songList;
      let src = musicUrl + song.file2;
      page.set_time_interval();//开始倒计时
      page.play_music(src);
      page.setData({
        option_click: true,
        cont: res.roomInfo.question,
        next: true,
        pkMsg: true,
        wait: false,
        circle_count_down_number: 10,
        showFram: false,
        success: false,
        err: false,
        showPk: false,
        vs: false,
        time: true,
        gameShow: true,
        showGold: false,
      });
      setTimeout(() => { page.setData({ next: false }); }, 1500);
    }
    if (res.roomInfo.status == 3 || res.roomInfo.status == 4) {  //如果房间状态为3用户答题完毕后
      console.log('场景', '3 || 4');
      let answer = res.roomInfo.answer;
      if (typeof answer == 'string') answer = JSON.parse(answer);
      let title = page.data.songList.title;
      let options = page.data.options;
      console.log('answer', answer)
      for (let key in answer) {
        if (answer[key] == title) {
          if (page.data.option_click == false) {
            options[answer[key]] = "answer";
          }
        } else {
          options[answer[key]] = "active";
        }
        if (page.data.option_click == false || res.roomInfo.status == 4) {
          options[title] = "answer";
        }
      }
      page.setData({
        options: options,
        pkMsg: true,
        wait: false,
        showFram: false,
        success: false,
        err: false,
        showPk: false,
        vs: false,
        time: true,
        gameShow: true,
        next: false,
        showGold: false,
      });

      if (res.roomInfo.status == 4) {
        console.log('场景', 4);
        let my_num = page.data.my_num;
        let my_pre = page.data.my_pre;
        let you_num = page.data.you_num;
        let you_pre = page.data.you_pre;
        for (let x in answer) {
          if (x == my_info.user_id || x == res.self_id) {//my 连续答对
            if (answer[x] == title) {
              my_pre = true;
              if (my_pre) {
                my_num++;
              } else {
                my_num = 1;
              }
            } else {
              my_pre = false;
              my_num = 0;
            }
          } else {//you 连续答对
            if (answer[x] == title) {
              you_pre = true;
              if (you_pre) {
                you_num++;
              } else {
                you_num = 1;
              }
            } else {
              you_pre = false;
              you_num = 0;
            }
          }
        }
        page.setData({
          my_num: my_num,
          my_pre: my_pre,
          you_num: you_num,
          you_pre: you_pre,
        });
      }

    }
    if (res.roomInfo.status == 4) {  //如果房间状态为4双方答题完毕后
      page.stop_Interval();  //清除倒计时
      page.setData({
        pkMsg: true,
        wait: false,
        showFram: false,
        success: false,
        err: false,
        showPk: false,
        vs: false,
        time: true,
        gameShow: true,
        option_click: false,
        next: false,
        showGold: false,
      });
    }
    if (res.roomInfo.status == 5) { //游戏结束
      play.stop();
      page.stop_Interval();  //清除倒计时
      page.setData({
        gameShow: false,
        time: false,
        pkMsg: true,
        wait: false,
        showFram: false,
        success: false,
        err: false,
        showPk: false,
        vs: false,
        option_click: false,
        next: false,
        showGold: false,
      });

      if (my_info.gold > you_info.gold) {
        page.setData({
          showFram: true,
          success: true,
          err: false,
          showGold: true,
        });
      } else if (my_info.gold == you_info.gold) {
        page.setData({
          showFram: true,
          success: true,
          err: false,
          showGold: false,
        });
      } else {
        page.setData({
          showFram: true,
          err: true,
          success: false,
          showGold: false
        });
      }
    }
  }
}


