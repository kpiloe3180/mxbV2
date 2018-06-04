// pages/login/login.js
const app = getApp()

Page({

  data: {
    isSumbit: true,
    baseUrl: '',
    app_code: ''
  },

  onLoad: function (options) {
    wx.getNetworkType({
      success: function (res) {
        wx.showToast({
          title: '您当前使用的是' + res.networkType + '网络',
          icon: 'none'
        })
      },
    });
    let glBaseUrl = app.globalData.baseUrl;
    let glappCode = app.globalData.app_code;
    this.setData({
      baseUrl: glBaseUrl,
      app_code: glappCode
    });
  },
  fSubmit: function (e) {
    let fThis = this;
    let userDetail = e.detail.value;
    if (userDetail.username == '') {
      wx.showToast({
        title: '用户名不能为空',
        icon: 'none'
      })
    } else if (userDetail.password == '') {
      wx.showToast({
        title: '密码不能为空',
        icon: 'none'
      })
    } else {
      wx.showLoading({
        title: '正在尝试登陆',
        mask: true
      });
      let ftimestamp = new Date().getTime();

      let tempObj = {
        app_code: fThis.data.app_code,
        timestamp: ftimestamp,
        mobile: userDetail.username,
        password: userDetail.password
      }
      let faSData = app.makeSign(tempObj)
      wx.request({
        url: fThis.data.baseUrl + 'drivers/login',
        method: "GET",
        data: {
          app_code: fThis.data.app_code,
          timestamp: ftimestamp,
          sign: faSData,
          mobile: userDetail.username,
          password: userDetail.password
        },
        success: function (res) {
          wx.hideLoading();
          let fRData = res.data;
          if (fRData.code == 0) {
            if (fRData.data.sub_code == 'success') {
              wx.setStorageSync('driver_no', fRData.data.driver_no)

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
    }
  }
})