var Api = require('../../utils/api.js');
var Tools = require('../../helpers/Md5.js');
const App = getApp()
Page({
	data: {
		logged: !1
	},
    onLoad() {},
    onShow() {
    	const token = App.WxService.getStorageSync('token')
    	this.setData({
    		logged: !!token
    	})
    	token && setTimeout(this.goIndex, 1500)
    },
    login() {
        wx.showNavigationBarLoading() //在标题栏中显示加载
        var that = this;
        var password = Tools.hexMD5("111111");
        wx.request({
          method: 'POST',
          url: Api.login({
            loginName: 13641809500,
            password: password
          }),
          success: function (res) {
            console.log("---------token-----------" + res.data.token);
            try {
              wx.setStorageSync('user', res.data.model);
              //存用户TOKEN
              wx.setStorageSync('token', res.data.token);
              App.WxService.switchTab({
                url: '/pages/index/index'
              })
            } catch (e) {

            }
          }
        })

    
    },
    goIndex() {
    	App.WxService.switchTab({
    		url: '/pages/index/index'
    	})
    },
	showModal() {
		App.WxService.showModal({
            title: '友情提示', 
            content: '获取用户登录状态失败，请重新登录', 
            showCancel: !1, 
        })
	},
	wechatDecryptData() {
		let code

		App.WxService.login()
		.then(data => {
			console.log('wechatDecryptData', data.code)
			code = data.code
			return App.WxService.getUserInfo()
		})
		.then(data => {
			return App.HttpService.wechatDecryptData({
				encryptedData: data.encryptedData, 
				iv: data.iv, 
				rawData: data.rawData, 
				signature: data.signature, 
				code: code, 
			})
		})
		.then(data => {
			console.log(data)
		})
	},
	wechatSignIn(cb) {
		if (App.WxService.getStorageSync('token')) return
		App.WxService.login()
		.then(data => {
			console.log('wechatSignIn', data.code)
			return App.HttpService.wechatSignIn({
				code: data.code
			})
		})
		.then(data => {
			console.log('wechatSignIn', data)
			if (data.meta.code == 0) {
				App.WxService.setStorageSync('token', data.data.token)
				cb()
			} else if(data.meta.code == 40029) {
				App.showModal()
			} else {
				App.wechatSignUp(cb)
			}
		})
	},
	wechatSignUp(cb) {
		App.WxService.login()
		.then(data => {
			console.log('wechatSignUp', data.code)
			return App.HttpService.wechatSignUp({
				code: data.code
			})
		})
		.then(data => {
			console.log('wechatSignUp', data)
			if (data.meta.code == 0) {
				App.WxService.setStorageSync('token', data.data.token)
				cb()
			} else if(data.meta.code == 40029) {
				App.showModal()
			}
		})
	},
	signIn(cb) {
		if (App.WxService.getStorageSync('token')) return
		App.HttpService.signIn({
			username: 'mingxing609', 
			password: 'Guimingxing1314', 
		})
		.then(data => {
			console.log(data)
			if (data.meta.code == 0) {
				App.WxService.setStorageSync('token', data.data.token)
				cb()
			}
		})
	},
})