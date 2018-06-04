//app.js
import md5 from 'utils/md5.js';


App({
  globalData: {
    appSecret: '123456',
    baseUrl: 'https://xblc-api.alipaycs.com/api/',
    //baseUrl: 'http://x5ut7n.natappfree.cc/',
    app_code: '9RFT5U02'
  },
  onLaunch: function () {

  },
  makeSign: function (obj) {
    if (!obj) { console.log('需要加密的数组对象为空') }
    var str = '';
    var secret = this.globalData.appSecret;
    if (!secret) { console.log('密钥未获取'); }
    //生成key升序数组
    var arr = Object.keys(obj);
    arr.sort();
    for (var i in arr) {
      if (i >= arr.length - 1) {
        str += arr[i] + '=' + obj[arr[i]];
      } else {
        str += arr[i] + '=' + obj[arr[i]] + '&';
      }
    }

    var encrypted = md5(str + secret);
    return encrypted;
  },
})
