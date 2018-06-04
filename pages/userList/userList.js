// pages/userList/userList.js
const app = getApp()
Page({
  data: {
    baseUrl: '',
    noCheckList: [],
    isCheckList: [],
    scheduleId: '',
    app_code: '',
    isSendSce: 60,
    isSend: false, //是否发送
    isDataNull: false,  //是否有数据
    hasNoCheck: false  //是否有未上车的乘客
  },
  onShow: function () {
    let glappCode = app.globalData.app_code;
    let glBaseUrl = app.globalData.baseUrl;
    let teScheduleId = wx.getStorageSync('scheduleId');
    console.log(teScheduleId)
    this.setData({
      baseUrl: glBaseUrl,
      scheduleId: teScheduleId,
      app_code: glappCode
    })
    let fThis = this;
    wx.showLoading({
      title: '正在获取数据',
      mask: true
    });
    let ftimestamp = new Date().getTime();
    let tempObj = {
      app_code: fThis.data.app_code,
      timestamp: ftimestamp,
      schedule_id: teScheduleId
    }
    let faSData = app.makeSign(tempObj);
    let teNoCheckList = [];
    let teIsCheckList = [];
    wx.request({
      url: fThis.data.baseUrl + 'drivers/arrangeUser',
      //url: 'http://97gasw.natappfree.cc/drivers/arrangeUser',
      method: "GET",
      data: {
        app_code: fThis.data.app_code,
        timestamp: ftimestamp,
        sign: faSData,
        schedule_id: teScheduleId
      },
      success: function (res) {
        wx.hideLoading();
        let fRData = res.data;
        if (fRData.code == 0) {
          if (fRData.data.sub_code == 'success') {
            if (fRData.data.sub_msg == '暂无排班的乘客') {
              fThis.setData({
                isDataNull: true
              })
            } else {
              let tempUList = fRData.data.result_list;
              console.log(fRData)
              for (var i = 0; i < tempUList.length; i++) {
                if (tempUList[i].is_checked == 0) {
                  teNoCheckList.push(tempUList[i])
                } else if (tempUList[i].is_checked == 1) {
                  teIsCheckList.push(tempUList[i])
                }
              }
              fThis.setData({
                noCheckList: teNoCheckList,
                isCheckList: teIsCheckList
              })
              if (teNoCheckList.length > 0) {
                fThis.setData({
                  hasNoCheck: true
                })
              } else {
                fThis.setData({
                  hasNoCheck: false
                })
              }
            }

          } else {
            wx.showToast({
              title: fRData.data.sub_msg,
              icon: 'none'
            })
          }
        } else {
          wx.showToast({
            title: fRData.msg,
            icon: 'none'
          })
        }
      },
      fail:function(error){
        wx.hideLoading();
        console.log(error)
        wx.showToast({
          title: error,
          icon: 'none'
        })
      }
    })
  },
  doNotBtn: function () {
    let fThis = this;
    wx.hideLoading();
    let ftt = null;
    if (fThis.data.isSend) {
      let isSenSces = 60;
      ftt = setInterval(function () {
        if (isSenSces <= 0) {
          isSenSces = 60;
          clearInterval(ftt);
          fThis.setData({
            isSend: false,
            isSendSce: isSenSces
          })
        } else {
          isSenSces--;
          fThis.setData({
            isSendSce: isSenSces
          })
        }
      }, 1000)
    }
  },
  sendmsg: function () {
    let fThis = this;
    wx.showLoading({
      title: '正在发送短信',
      mask: true
    });
    let msgList = fThis.data.noCheckList;
    let tempAppCode = fThis.data.app_code;
    let ftimestamp = new Date().getTime();
    let teScheduleId = wx.getStorageSync('scheduleId');
    let phoneList = [];
    for (let i = 0; i < msgList.length; i++) {
      phoneList.push(msgList[i].mobile)
      //phoneList.push('18271801785')
    }
    let phoneJson = JSON.stringify(phoneList);
    let tempObj = {
      app_code: tempAppCode,
      timestamp: ftimestamp,
      schedule_id: teScheduleId,
      phones: phoneJson
    }
    let faSData = app.makeSign(tempObj);

    wx.request({
      url: fThis.data.baseUrl + '/drivers/sendMsg',
      //url: 'http://139.129.207.223:18282/web_wx/wx/api/msg_code/',
      method: "GET",
      data: {
        app_code: tempAppCode,
        timestamp: ftimestamp,
        sign: faSData,
        schedule_id: teScheduleId,
        phones: phoneJson
      },
      success: function (res) {

        let fRData = res.data;
        if (fRData.code == 0) {
          if (fRData.data.sub_code == 'success') {

            console.log(fRData)
            wx.hideLoading();

            wx.showToast({
              title: fRData.data.sub_msg,
              icon: 'none'
            })

            fThis.setData({
              isSend: true
            })
            let ftt = null;
            let isSenSces = 60;
            ftt = setInterval(function () {
              if (isSenSces <= 0) {
                isSenSces = 60;
                fThis.setData({
                  isSend: false,
                  isSendSce: isSenSces
                })
                clearInterval(ftt);
              } else {
                isSenSces--;
                fThis.setData({
                  isSendSce: isSenSces
                })
              }
            }, 1000)

          } else {
            wx.showToast({
              title: fRData.data.sub_msg,
              icon: 'none'
            })
          }
        } else {
          wx.showToast({
            title: fRData.msg,
            icon: 'none'
          })
        }
      }
    })

  },

  conSendmsg: function () {
    wx.showToast({
      title: '请不要重复操作',
      icon: 'none'
    });
  }

})