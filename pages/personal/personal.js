// pages/personal/personal.js
const app = getApp()
Page({
  data: {
    baseUrl: '',
    userName: '',
    app_code: '',
    mobile: ''
  },
  onShow: function () {
    wx.showLoading({
      title: '正在获取数据',
      mask: true
    });
    let fThis = this;
    let glBaseUrl = app.globalData.baseUrl;
    let glappCode = app.globalData.app_code;
    let tempSData = wx.getStorageSync('driver_no');
    this.setData({
      baseUrl: glBaseUrl,
      app_code: glappCode
    })
    let ftimestamp = new Date().getTime();
    let tempObj = {
      app_code: fThis.data.app_code,
      timestamp: ftimestamp,
      driver_no: tempSData
    }
    let faSData = app.makeSign(tempObj);
    wx.request({
      url: fThis.data.baseUrl + 'drivers/userInfo',
      method: "GET",
      data: {
        app_code: fThis.data.app_code,
        timestamp: ftimestamp,
        sign: faSData,
        driver_no: tempSData
      },
      success: function (res) {
        let fRData = res.data;
        wx.hideLoading();

        if (fRData.code == 0) {
          if (fRData.data.sub_code == 'success') {
            let fDList = fRData.data.info
            fThis.setData({
              userName: fDList[0].driver_name,
              mobile: fDList[0].mobile
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
  goVerification() {
    wx.navigateTo({
      url: '../verification/verification',
    })
  },
  goSheet() {
    wx.navigateTo({
      url: '../mySheet/mySheet',
    })
  },
  callPhoneA() {
    wx.makePhoneCall({
      phoneNumber: '02782289990'
    })
  },
  goLogin(){
    wx.navigateTo({
      url: '../login/login'
    })
  }
})