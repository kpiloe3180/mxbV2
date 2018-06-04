// pages/mySheet/mySheet.js
const util = require('../../utils/util.js')
const app = getApp()
Page({
  data: {
    isDoneA: false, //是否切换已完成
    notList: [],
    hasList: [],
    nowList: [],
    driverNo: 0,
    app_code: '',
    baseUrl: '',
    isleftDataNull: false,
    isrightDataNull:false
  },
  onShow: function () {
    let tempSData = wx.getStorageSync('driver_no');
    let fThis = this;
    let nowDate = new Date();
    let fNowDate = util.formatTime(nowDate)
    // let fNowDate = '2018-05-20';
    let glBaseUrl = app.globalData.baseUrl;
    let glappCode = app.globalData.app_code;
    fThis.setData({
      driverNo: tempSData,
      baseUrl: glBaseUrl,
      app_code: glappCode
    })
    wx.showLoading({
      title: '正在获取数据',
      mask: true
    });
    let ftimestamp = new Date().getTime();
    let tempObj = {
      app_code: fThis.data.app_code,
      timestamp: ftimestamp,
      driver_no: tempSData,
      depart_date: fNowDate
    }
    let faSData = app.makeSign(tempObj)
    wx.request({
      url: fThis.data.baseUrl + 'drivers/arrange',
      method: "GET",
      data: {
        app_code: fThis.data.app_code,
        timestamp: ftimestamp,
        sign: faSData,
        driver_no: tempSData,
        depart_date: fNowDate
      },
      success: function (res) {
        let fRData = res.data;
        wx.hideLoading();
        let teNotList = [];
        let teHasList = [];
        let teNowList = [];
        if (fRData.code == 0) {
          if (fRData.data.sub_code == 'success') {
            let fDList = fRData.data.result_list
            console.log(fDList)
            for (let j = 0; j < fDList.length; j++) {
              if (fDList[j].depart_status == 2) {
                //将已完成放入数组
                teHasList.push(fDList[j]);
              } else if (fDList[j].depart_status == 1) {
                //将正在进行放入数组
                teNowList.push(fDList[j]);
              } else {
                //将未完成放入数组
                teNotList.push(fDList[j]);
              }
            }

            if (teNowList.length == 0) {
              //如果没有正在进行的排班
              if (teNotList.length != 0) {
                let tetFiList = teNotList.shift();
                teNowList.push(tetFiList)
              } else if (teNotList.length == 0) {
                fThis.setData({
                  isleftDataNull:true
                })
              }
              fThis.setData({
                notList: teNotList,
                hasList: teHasList,
                nowList: teNowList
              })
            } else {
              //有正在进行的排班
              fThis.setData({
                notList: teNotList,
                hasList: teHasList,
                nowList: teNowList
              })
            }
            if (teHasList.length == 0){
              fThis.setData({
                isrightDataNull:true
              })
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

      }
    })
  },
  notDoneClick() {
    this.setData({
      isDoneA: false
    });
  },
  isDoneClick() {
    this.setData({
      isDoneA: true
    });
  },
  goAway: function (e) {
    //获取班次
    let scheduleId = e.currentTarget.dataset.schedulid;
    //获取状态
    let departst = e.currentTarget.dataset.departst;
    //获取乘客数
    let deate = e.currentTarget.dataset.deate;
    let deime = e.currentTarget.dataset.deime;
    wx.setStorageSync('scheduleId', scheduleId);
    wx.setStorageSync('deate', deate);
    wx.setStorageSync('deime', deime);
    wx.setStorageSync('departst', departst);
    let tedriverNo = this.data.driverNo;
    wx.navigateTo({
      // url: '../index/index?scheduleId=' + scheduleId + '&driverNo=' + tedriverNo + '&deate=' + deate + '&deime=' + deime + '&departst=' + departst,
      url: '../index/index'
    })

  },
  goUserList: function (e) {
    //获取班次
    let scheduleId = e.currentTarget.dataset.schedulid;
    //获取状态
    let departst = e.currentTarget.dataset.departst;
    let tedriverNo = this.data.driverNo;
    wx.setStorageSync('scheduleId', scheduleId);
    console.log(scheduleId)
    wx.navigateTo({
      // url: '../userList/userList?scheduleId=' + scheduleId
      url: '../userList/userList'
    })
  },
  goGRZX: function () {
    wx.navigateTo({
      url: '../personal/personal'
    })
  }
})