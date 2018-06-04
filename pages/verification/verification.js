// pages/verification/verification.js
const app = getApp()
Page({

  data: {
    fQRData: '',
    baseUrl: '',
    scheduleId: '',
    app_code: '',
  },
  onShow: function () {
    let fThis = this;
    let glappCode = app.globalData.app_code;
    let glBaseUrl = app.globalData.baseUrl;
    let teScheduleId = wx.getStorageSync('scheduleId');


    this.setData({
      baseUrl: glBaseUrl,
      scheduleId: teScheduleId,
      app_code: glappCode
    })

  },
  goVerification: function (e) {
    let fThis = this;
    let fridingCode = e.detail.value.verifiData;
    wx.showLoading({
      title: '正在获取数据',
      mask: true
    });
    let ftimestamp = new Date().getTime();
    let tempObj = {
      app_code: fThis.data.app_code,
      timestamp: ftimestamp,
      schedule_id: fThis.data.scheduleId,
      riding_code: fridingCode
    }
    console.log(tempObj)
    let faSData = app.makeSign(tempObj);
    wx.request({
      url: fThis.data.baseUrl + 'drivers/hexiao',
      //url: 'http://97gasw.natappfree.cc/drivers/hexiao',
      method: "GET",
      data: {
        app_code: fThis.data.app_code,
        timestamp: ftimestamp,
        sign: faSData,
        schedule_id: fThis.data.scheduleId,
        riding_code: fridingCode
      },
      success: function (res) {
        wx.hideLoading();
        let fRData = res.data;
        console.log(fRData)
        if (fRData.code == 0) {
          if (fRData.data.sub_code == 'success') {
            let tempRidingNum = fRData.data.result_list[0].riding_num;
            wx.setStorageSync('deate', tempRidingNum);

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
      fail: function (error) {
        console.log('调用失败' + error)
      }
    })

  },
  verSaoMa: function () {
    let fThis = this;
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
          schedule_id: fThis.data.scheduleId,
          riding_code: fridingCode
        }
        console.log(tempObj)
        let faSData = app.makeSign(tempObj);
        wx.request({
          url: fThis.data.baseUrl + 'drivers/hexiao',
          //url: 'http://97gasw.natappfree.cc/drivers/hexiao',
          method: "GET",
          data: {
            app_code: fThis.data.app_code,
            timestamp: ftimestamp,
            sign: faSData,
            schedule_id: fThis.data.scheduleId,
            riding_code: fridingCode
          },
          success: function (res) {
            wx.hideLoading();
            let fRData = res.data;
            console.log(fRData)
            if (fRData.code == 0) {
              if (fRData.data.sub_code == 'success') {
                let tempRidingNum = fRData.data.result_list[0].riding_num;
                wx.setStorageSync('deate', tempRidingNum);

              } else {
                if (fRData.data.sub_msg == '订单已核销'){
                  wx.showModal({
                    content: '该用户已上车',
                    success: function (res) {
                      if (res.confirm) {
                        console.log('用户点击确定')
                      } else if (res.cancel) {
                        console.log('用户点击取消')
                      }
                    }
                  })
                } else {
                  wx.showToast({
                    title: fRData.data.sub_msg,
                    icon: 'none'
                  })
                }
              }
            } else {
              wx.showToast({
                title: fRData.msg,
                icon: 'none'
              })
            }
          },
          fail: function (error) {
            console.log('调用失败' + error)
          }
        })


      }
    })
  }
})