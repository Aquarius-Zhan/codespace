// app.js
App({
  onLaunch() {
    // 初始化云开发
    if (wx.cloud) {
      try {
        wx.cloud.init({
          env: 'your-env-id', // 请替换为您的云环境ID
          traceUser: true
        })
        this.globalData.cloudAvailable = true
        console.log('云开发初始化成功')
      } catch (error) {
        console.warn('云开发初始化失败，将使用本地存储:', error)
        this.globalData.cloudAvailable = false
      }
    } else {
      console.warn('当前环境不支持云开发，将使用本地存储')
      this.globalData.cloudAvailable = false
    }

    // 获取系统信息
    const systemInfo = wx.getWindowInfo()
    this.globalData.systemInfo = systemInfo

    // 检查网络状态
    this.checkNetworkStatus()

    // 初始化本地存储
    this.initLocalStorage()

    // 语音播放初始化
    this.initVoiceSettings()

    console.log('老年健康助手启动完成')
  },

  onShow() {
    // 应用显示时检查闹钟状态
    this.checkAlarms()
  },

  onHide() {
    // 应用隐藏时保存数据
    this.saveDataToCloud()
  },

  // 检查网络状态
  checkNetworkStatus() {
    wx.getNetworkType({
      success: (res) => {
        this.globalData.networkType = res.networkType
        if (res.networkType === 'none') {
          wx.showToast({
            title: '网络连接不可用，使用本地数据',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })

    // 监听网络状态变化
    wx.onNetworkStatusChange((res) => {
      this.globalData.networkType = res.networkType
      if (!res.isConnected) {
        wx.showToast({
          title: '网络断开，使用本地数据',
          icon: 'none',
          duration: 1500
        })
      }
    })
  },

  // 初始化本地存储
  initLocalStorage() {
    try {
      // 初始化用户数据
      if (!wx.getStorageSync('userInfo')) {
        wx.setStorageSync('userInfo', {
          nickname: '用户',
          avatar: '',
          createTime: new Date().getTime()
        })
      }

      // 初始化联系人数据
      if (!wx.getStorageSync('contacts')) {
        wx.setStorageSync('contacts', [])
      }

      // 初始化闹钟数据
      if (!wx.getStorageSync('alarms')) {
        wx.setStorageSync('alarms', [])
      }

      // 初始化识别记录
      if (!wx.getStorageSync('identifyRecords')) {
        wx.setStorageSync('identifyRecords', [])
      }

      // 初始化聊天记录
      if (!wx.getStorageSync('chatMessages')) {
        wx.setStorageSync('chatMessages', {})
      }

    } catch (error) {
      console.error('本地存储初始化失败:', error)
    }
  },

  // 语音设置初始化
  initVoiceSettings() {
    this.globalData.voiceSettings = {
      enabled: true,
      volume: 0.8,
      rate: 0.8  // 语速，适合老年人
    }
  },

  // 播放语音提示
  playVoice(text) {
    if (!this.globalData.voiceSettings.enabled) return

    // 先停止之前的播放
    if (this.globalData.innerAudioContext) {
      this.globalData.innerAudioContext.stop()
    }

    this.globalData.innerAudioContext = wx.createInnerAudioContext()

    // 使用系统TTS
    wx.showToast({
      title: text,
      icon: 'none',
      duration: 2000
    })

    // 震动反馈
    wx.vibrateShort({
      type: 'light'
    })
  },

  // 检查闹钟状态
  checkAlarms() {
    const alarms = wx.getStorageSync('alarms') || []
    const now = new Date()

    alarms.forEach(alarm => {
      if (alarm.enabled && this.isAlarmTime(alarm, now)) {
        this.triggerAlarm(alarm)
      }
    })
  },

  // 判断是否到了闹钟时间
  isAlarmTime(alarm, now) {
    const alarmTime = new Date(alarm.time)
    return now.getHours() === alarmTime.getHours() &&
           now.getMinutes() === alarmTime.getMinutes()
  },

  // 触发闹钟
  triggerAlarm: function(alarm) {
    this.playVoice('闹钟提醒：' + (alarm.title || ('该' + (alarm.type === 'medicine' ? '吃药' : '用餐') + '了')))

    wx.showModal({
      title: '闹钟提醒',
      content: alarm.title || ('该' + (alarm.type === 'medicine' ? '吃药' : '用餐') + '了'),
      showCancel: true,
      confirmText: '知道了',
      cancelText: '稍后提醒',
      success: (res) => {
        if (res.confirm) {
          // 记录闹钟响应
          this.recordAlarmResponse(alarm.id, true)
        } else {
          // 5分钟后再次提醒
          this.scheduleSnooze(alarm)
        }
      }
    })
  },

  // 记录闹钟响应
  recordAlarmResponse: function(alarmId, responded) {
    const responseKey = `alarm_response_${alarmId}_${new Date().toDateString()}`
    wx.setStorageSync(responseKey, {
      responded,
      timestamp: new Date().getTime()
    })
  },

  // 延迟提醒
  scheduleSnooze: function(alarm) {
    setTimeout(() => {
      this.triggerAlarm(alarm)
    }, 5 * 60 * 1000) // 5分钟后
  },

  // 保存数据到云端
  saveDataToCloud: async function() {
    if (this.globalData.networkType === 'none') {
      console.log('网络不可用，跳过云端同步')
      return
    }

    // 检查云开发是否可用
    if (!this.globalData.cloudAvailable) {
      console.log('云开发不可用，数据已保存在本地')
      return
    }

    try {
      const db = wx.cloud.database()
      const _ = db.command

      // 保存用户数据
      const userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        await db.collection('users').doc(userInfo._id || 'default').set({
          data: userInfo
        })
      }

      // 保存闹钟数据
      const alarms = wx.getStorageSync('alarms')
      if (alarms && alarms.length > 0) {
        await db.collection('alarms').add({
          data: {
            userId: userInfo._id || 'default',
            alarms: alarms,
            updateTime: new Date()
          }
        })
      }

      console.log('数据同步到云端完成')
    } catch (error) {
      console.warn('数据同步失败，数据仍保存在本地:', error)
      // 不再抛出错误，静默处理
    }
  },

  // 从云端加载数据
  loadDataFromCloud: async function() {
    if (this.globalData.networkType === 'none') {
      console.log('网络不可用，跳过云端加载')
      return false
    }

    // 检查云开发是否可用
    if (!this.globalData.cloudAvailable) {
      console.log('云开发不可用，使用本地数据')
      return false
    }

    try {
      const db = wx.cloud.database()

      // 加载用户数据
      const userRes = await db.collection('users').limit(1).get()
      if (userRes.data.length > 0) {
        wx.setStorageSync('userInfo', userRes.data[0])
      }

      // 加载闹钟数据
      const alarmRes = await db.collection('alarms')
        .orderBy('updateTime', 'desc')
        .limit(1)
        .get()

      if (alarmRes.data.length > 0) {
        wx.setStorageSync('alarms', alarmRes.data[0].alarms || [])
      }

      console.log('从云端加载数据完成')
      return true
    } catch (error) {
      console.warn('从云端加载数据失败，将使用本地数据:', error)
      return false
    }
  },

  globalData: {
    systemInfo: null,
    networkType: 'wifi',
    voiceSettings: null,
    innerAudioContext: null,
    cloudAvailable: false
  }
})