// pages/index/index.js
var amapFile = require("../../libs/amap-wx.js");
const app = getApp()
Page({

  data: {
    isDepart: false,
    flatitude: 30.59982,
    flongitude: 114.3096,
    fQRData: '',
    markers: [{}, {}],
    polyline: [],
    deate: '',
    deime: '',
    schedule_id: '',
    startObj: {},
    endObj: {},
    pastTime: '',
    app_code: '',
    pbTimeMon: null,
    pbTimeDay: null,
    baseUrl: ''
  },
  onShow: function () {
    let fScheduleId = wx.getStorageSync('scheduleId');
    if (wx.getStorageSync('departst') == '2') {
      wx.showToast({
        title: '页面已经失效，稍后将跳转排班页面',
        icon: 'none',
        duration: 3000,
        success: function () {
          wx.navigateTo({
            url: '../mySheet/mySheet',
          })
        }
      })
    }
    let tempDrSt = wx.getStorageSync('departst') == '1' ? true : false;
    let fThis = this;
    let glBaseUrl = app.globalData.baseUrl;
    let glappCode = app.globalData.app_code;
    fThis.setData({
      deate: wx.getStorageSync('deate'),
      deime: wx.getStorageSync('deime'),
      isDepart: tempDrSt,
      schedule_id: fScheduleId,
      baseUrl: glBaseUrl,
      app_code: glappCode
    })
    //下面的是公共的高德key
    var myAmapFun = new amapFile.AMapWX({ key: 'c10a8e915cbc962109e73e7a1c4d4c83' });
    //下面的是我的高德key
    //var myAmapFun = new amapFile.AMapWX({ key: '781fb5899a6e621cd2fe213203cbe34a' });
    let ftimestamp = new Date().getTime();
    let tempObj = {
      app_code: fThis.data.app_code,
      timestamp: ftimestamp,
      schedule_id: fScheduleId
    }
    let faSData = app.makeSign(tempObj)
    let tempSObj = {};
    let tempEObj = {};
    wx.request({
      url: fThis.data.baseUrl + 'drivers/arrangeInfo',
      method: "GET",
      data: {
        app_code: fThis.data.app_code,
        timestamp: ftimestamp,
        sign: faSData,
        schedule_id: fScheduleId
      },
      success: function (res) {
        wx.hideLoading();
        let fRData = res.data;
        console.log(fRData)
        if (fRData.code == 0) {
          if (fRData.data.sub_code == 'success') {
            let tempUList = fRData.data.info;

            let startPo = (tempUList.start_point).split(",");
            let endPo = (tempUList.end_point).split(",");
            let startlong = startPo[0];
            let startlati = startPo[1];
            let endlong = endPo[0];
            let endlati = endPo[1];

            let fFSTime = (tempUList.depart_time).split(":");
            fFSTime[0] = fFSTime[0].length > 1 ? fFSTime[0] : '0' + fFSTime[0]
            let fSTTimeArr = (tempUList.depart_date).split("-").concat(fFSTime);
            let fStDCTime = fSTTimeArr[1] + '-' + fSTTimeArr[2] + ' ' + fSTTimeArr[3] + ':' + fSTTimeArr[4];

            let startDateS = new Date(parseInt(fSTTimeArr[0]), parseInt(fSTTimeArr[1]) - 1, parseInt(fSTTimeArr[2]),
              parseInt(fSTTimeArr[3]), parseInt(fSTTimeArr[4]), 0);
            let endDateS = startDateS.getTime() + tempUList.reach_time * 60000;
            let endDateSTs = new Date(endDateS);
            let endMoth = endDateSTs.getMonth() + 1;
            endMoth = endMoth > 9 ? '' + endMoth : '0' + endMoth;
            let endDay = endDateSTs.getDate();
            endDay = endDay > 9 ? '' + endDay : '0' + endDay;
            let endHour = endDateSTs.getHours();
            endHour = endHour > 9 ? '' + endHour : '0' + endHour;
            let endMinu = endDateSTs.getMinutes();
            endMinu = endMinu > 9 ? '' + endMinu : '0' + endMinu;
            let fEndTimeText = endMoth + '-' + endDay + ' ' + endHour + ':' + endMinu;

            tempSObj = {
              fPoint: tempUList.start_point,
              fName: tempUList.start_site,
              fTime: fStDCTime
            }
            tempEObj = {
              fPoint: tempUList.end_point,
              fName: tempUList.end_site,
              fTime: fEndTimeText
            }

            fThis.setData({
              startObj: tempSObj,
              endObj: tempEObj,
              pastTime: tempUList.reach_time,
              flatitude: (Number(startlati) + Number(endlati)) / 2,
              flongitude: (Number(startlong) + Number(endlong)) / 2,
              pbTimeMon: parseInt(fSTTimeArr[1]),
              pbTimeDay: parseInt(fSTTimeArr[2]),
              markers: [{
                iconPath: "../../assets/img/begin.png",
                id: 0,
                latitude: startlati,
                longitude: startlong,
                width: 23,
                height: 33
              }, {
                iconPath: "../../assets/img/end.png",
                id: 0,
                latitude: endlati,
                longitude: endlong,
                width: 24,
                height: 34
              }]
            })

            myAmapFun.getDrivingRoute({
              origin: tempSObj.fPoint,
              destination: tempEObj.fPoint,
              success: function (data) {
                var points = [];
                if (data.paths && data.paths[0] && data.paths[0].steps) {
                  var steps = data.paths[0].steps;
                  for (var i = 0; i < steps.length; i++) {
                    var poLen = steps[i].polyline.split(';');
                    for (var j = 0; j < poLen.length; j++) {
                      points.push({
                        longitude: parseFloat(poLen[j].split(',')[0]),
                        latitude: parseFloat(poLen[j].split(',')[1])
                      })
                    }
                  }
                }
                fThis.setData({
                  polyline: [{
                    points: points,
                    color: "#0091ff",
                    width: 6
                  }]
                });

              },
              fail: function (info) {
                //失败回调

              }
            })
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

  fcomif: function () {
    let fThis = this;

    let nowTime = new Date();
    let nowMon = nowTime.getMonth() + 1;
    let nowDay = nowTime.getDate();
    if (nowMon == fThis.data.pbTimeMon && nowDay == fThis.data.pbTimeDay) {
      wx.showModal({
        title: '是否确定发车',
        content: '请检查乘客是否到齐，确认无误后发车',
        cancelColor: '#1a7bff',
        confirmColor: '#1a7bff',
        success: function (res) {
          if (res.confirm) {
            wx.showLoading({
              title: '正在提交数据',
              mask: true
            });
            let tempSData = wx.getStorageSync('driver_no');
            let tempScheduleId = fThis.data.schedule_id
            let ftimestamp = new Date().getTime();
            let tempObj = {
              app_code: fThis.data.app_code,
              timestamp: ftimestamp,
              driver_no: tempSData,
              schedule_id: tempScheduleId,
              oper_type: '1'
            }
            let faSData = app.makeSign(tempObj)

            wx.request({
              url: fThis.data.baseUrl + 'drivers/confirm',
              method: "GET",
              data: {
                app_code: fThis.data.app_code,
                timestamp: ftimestamp,
                sign: faSData,
                driver_no: tempSData,
                schedule_id: tempScheduleId,
                oper_type: '1'
              },
              success: function (rest) {
                wx.hideLoading();
                let fRData = rest.data;

                if (fRData.code == 0) {
                  if (fRData.data.sub_code == 'success') {
                    fThis.setData({
                      isDepart: true
                    })

                    wx.setStorageSync('departst', '1')
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

          } else if (res.cancel) {
          }
        }
      })
    } else {
      wx.showToast({
        title: '还未到发车日期',
        icon: 'none'
      })
    }

  },
  fFinish: function () {
    let fThis = this;

    let nowTime = new Date();
    let nowMon = nowTime.getMonth() + 1;
    let nowDay = nowTime.getDate();
    if (nowMon == fThis.data.pbTimeMon && nowDay == fThis.data.pbTimeDay) {
      wx.showModal({
        title: '是否到完成行程',
        content: '该行程已结束',
        cancelColor: '#1a7bff',
        confirmColor: '#1a7bff',
        success: function (res) {
          if (res.confirm) {
            wx.showLoading({
              title: '正在提交数据',
              mask: true
            });

            let tempSData = wx.getStorageSync('driver_no');
            let tempScheduleId = fThis.data.schedule_id
            let ftimestamp = new Date().getTime();
            let tempObj = {
              app_code: fThis.data.app_code,
              timestamp: ftimestamp,
              driver_no: tempSData,
              schedule_id: tempScheduleId,
              oper_type: '2'
            }
            let faSData = app.makeSign(tempObj)

            wx.request({
              url: fThis.data.baseUrl + 'drivers/confirm',
              method: "GET",
              data: {
                app_code: fThis.data.app_code,
                timestamp: ftimestamp,
                sign: faSData,
                driver_no: tempSData,
                schedule_id: tempScheduleId,
                oper_type: '2'
              },
              success: function (rest) {
                wx.hideLoading();
                let fRData = rest.data;
                if (fRData.code == 0) {
                  if (fRData.data.sub_code == 'success') {
                    wx.setStorageSync('departst', '2')
                    wx.navigateTo({
                      url: '../mySheet/mySheet',
                    })
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

          } else if (res.cancel) {

          }
        }
      })
    } else {
      wx.showToast({
        title: '还未到发车日期',
        icon: 'none'
      })
    }

  },
  goPagePersonal: function () {
    wx.navigateTo({
      url: '../personal/personal'
    })
  },
  goPageVerifi: function () {
    let fThis = this;
    let nowTime = new Date();
    let nowMon = nowTime.getMonth() + 1;
    let nowDay = nowTime.getDate();
    if (nowMon == fThis.data.pbTimeMon && nowDay == fThis.data.pbTimeDay) {
      wx.navigateTo({
        url: '../verification/verification'
      })
    } else {
      wx.showToast({
        title: '还未到发车日期',
        icon: 'none'
      })
    }
  },
  goUserList: function () {
    wx.navigateTo({
      url: '../userList/userList'
    })
  },
  goSaoMa: function () {
    let fThis = this;
    let nowTime = new Date();
    let nowMon = nowTime.getMonth() + 1;
    let nowDay = nowTime.getDate();
    if (nowMon == fThis.data.pbTimeMon && nowDay == fThis.data.pbTimeDay) {
      wx.scanCode({
        success: (resa) => {
          fThis.setData({
            fQRData: resa.result
          })
          let fridingCode = resa.result;
          wx.showLoading({
            title: '正在获取数据',
            mask: true
          });
          let ftimestamp = new Date().getTime();
          let tempObj = {
            app_code: fThis.data.app_code,
            timestamp: ftimestamp,
            schedule_id: fThis.data.schedule_id,
            riding_code: fridingCode
          }
          let faSData = app.makeSign(tempObj);
          wx.request({
            url: fThis.data.baseUrl + 'drivers/hexiao',
            //url: 'http://97gasw.natappfree.cc/drivers/hexiao',
            method: "GET",
            data: {
              app_code: fThis.data.app_code,
              timestamp: ftimestamp,
              sign: faSData,
              schedule_id: fThis.data.schedule_id,
              riding_code: fridingCode
            },
            success: function (res) {
              wx.hideLoading();
              let fRData = res.data;
              if (fRData.code == 0) {
                if (fRData.data.sub_code == 'success') {
                  let tempRidingNum = fRData.data.result_list[0].riding_num;
                  wx.setStorageSync('deate', tempRidingNum);
                  fThis.setData({
                    deate: tempRidingNum
                  })
                  wx.showToast({
                    title: fRData.data.sub_msg,
                    icon: 'none'
                  })
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
        }
      })
    } else {
      wx.showToast({
        title: '还未到发车日期',
        icon: 'none'
      })
    }
  }
})