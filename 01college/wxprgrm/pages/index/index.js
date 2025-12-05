// pages/index/index.js
const app = getApp()

Page({
  data: {
    greeting: '早上好',
    userName: '用户',
    currentDate: '',
    currentTime: '',
    showVoiceHint: false,

    // 顶部联系人 - 最多显示4个
    topContacts: [
      {
        id: '1',
        name: '小明',
        relation: '儿子',
        avatar: 'https://via.placeholder.com/120x120/4CAF50/FFFFFF?text=明',
        phone: '13800138000',
        unreadCount: 2
      },
      {
        id: '2',
        name: '小红',
        relation: '女儿',
        avatar: 'https://via.placeholder.com/120x120/FF9800/FFFFFF?text=红',
        phone: '13800138001',
        unreadCount: 0
      },
      {
        id: '3',
        name: '老伴',
        relation: '配偶',
        avatar: 'https://via.placeholder.com/120x120/2196F3/FFFFFF?text=伴',
        phone: '13800138002',
        unreadCount: 5
      },
      {
        id: '4',
        name: '小华',
        relation: '孙子',
        avatar: 'https://via.placeholder.com/120x120/F44336/FFFFFF?text=华',
        phone: '13800138003',
        unreadCount: 0
      }
    ],

    // 今日提醒
    todayReminders: [
      {
        id: '1',
        type: 'medicine',
        title: '降压药服用时间',
        time: '08:00',
        icon: 'bulb-o',
        color: '#FF9800'
      },
      {
        id: '2',
        type: 'food',
        title: '早餐时间',
        time: '08:30',
        icon: 'restaurant-o',
        color: '#4CAF50'
      },
      {
        id: '3',
        type: 'medicine',
        title: '维生素补充',
        time: '12:00',
        icon: 'bulb-o',
        color: '#FF9800'
      }
    ]
  },

  onLoad(options) {
    this.initPage()
    this.startClock()
  },

  onShow() {
    // 页面显示时更新数据
    this.updateContacts()
    this.updateReminders()

    // 显示语音提示
    if (app.globalData.voiceSettings.enabled) {
      this.showVoiceHint()
    }
  },

  onHide() {
    // 清除定时器
    if (this.data.timeInterval) {
      clearInterval(this.data.timeInterval)
    }
  },

  // 初始化页面
  initPage() {
    const userInfo = wx.getStorageSync('userInfo') || {}
    this.setData({
      userName: userInfo.nickname || '用户'
    })

    // 设置问候语
    this.setGreeting()

    // 加载联系人和提醒数据
    this.loadPageData()
  },

  // 设置问候语
  setGreeting() {
    const hour = new Date().getHours()
    let greeting = '早上好'

    if (hour >= 6 && hour < 12) {
      greeting = '早上好'
    } else if (hour >= 12 && hour < 18) {
      greeting = '下午好'
    } else if (hour >= 18 && hour < 22) {
      greeting = '晚上好'
    } else {
      greeting = '夜深了'
    }

    this.setData({ greeting })
  },

  // 启动时钟
  startClock() {
    const updateTime = () => {
      const now = new Date()

      const dateOptions = {
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }

      const timeOptions = {
        hour: '2-digit',
        minute: '2-digit'
      }

      this.setData({
        currentDate: now.toLocaleDateString('zh-CN', dateOptions),
        currentTime: now.toLocaleTimeString('zh-CN', timeOptions)
      })
    }

    updateTime()

    const timeInterval = setInterval(updateTime, 60000) // 每分钟更新

    this.setData({ timeInterval })
  },

  // 加载页面数据
  loadPageData() {
    this.loadContacts()
    this.loadReminders()
  },

  // 加载联系人数据
  loadContacts() {
    const contacts = wx.getStorageSync('contacts') || []

    // 如果有自定义联系人，优先显示前4个
    if (contacts.length > 0) {
      const topContacts = contacts.slice(0, 4).map(contact => ({
        ...contact,
        unreadCount: Math.floor(Math.random() * 5) // 模拟未读消息数
      }))

      // 如果联系人不足4个，用默认数据补充
      while (topContacts.length < 4) {
        const defaultContact = this.data.topContacts[topContacts.length]
        if (defaultContact) {
          topContacts.push(defaultContact)
        } else {
          break
        }
      }

      this.setData({ topContacts })
    }
  },

  // 更新联系人数据
  updateContacts() {
    this.loadContacts()
  },

  // 加载提醒数据
  loadReminders() {
    const alarms = wx.getStorageSync('alarms') || []
    const now = new Date()
    const todayReminders = []

    // 处理今日闹钟
    alarms.forEach(alarm => {
      if (alarm.enabled && this.isToday(alarm)) {
        todayReminders.push({
          id: alarm.id,
          type: alarm.type === 'medicine' ? 'medicine' : 'food',
          title: alarm.title || (alarm.type === 'medicine' ? '吃药提醒' : '用餐提醒'),
          time: this.formatTime(alarm.time),
          icon: alarm.type === 'medicine' ? 'bulb-o' : 'restaurant-o',
          color: alarm.type === 'medicine' ? '#FF9800' : '#4CAF50'
        })
      }
    })

    // 如果没有闹钟，显示默认提醒
    if (todayReminders.length === 0) {
      todayReminders.push(...this.data.todayReminders)
    }

    // 按时间排序
    todayReminders.sort((a, b) => a.time.localeCompare(b.time))

    this.setData({ todayReminders })
  },

  // 更新提醒数据
  updateReminders() {
    this.loadReminders()
  },

  // 判断是否是今天
  isToday(alarm) {
    const alarmDate = new Date(alarm.time)
    const today = new Date()

    return alarmDate.toDateString() === today.toDateString()
  },

  // 格式化时间
  formatTime(timeString) {
    const date = new Date(timeString)
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  },

  // 导航到聊天页面
  navigateToChat(e) {
    const contact = e.currentTarget.dataset.contact

    wx.navigateTo({
      url: `/pages/chat/chat-detail?contactId=${contact.id}&contactName=${contact.name}`
    })

    // 播放语音提示
    app.playVoice(`正在打开与${contact.name}的聊天`)
  },

  // 导航到菜品识别
  navigateToFoodIdentify() {
    wx.navigateTo({
      url: '/pages/food-identify/food-identify'
    })

    app.playVoice('正在打开菜品识别')
  },

  // 导航到药物识别
  navigateToMedicineIdentify() {
    wx.navigateTo({
      url: '/pages/medicine-identify/medicine-identify'
    })

    app.playVoice('正在打开药物识别')
  },

  // 导航到记录页面
  navigateToRecords() {
    wx.switchTab({
      url: '/pages/records/records'
    })

    app.playVoice('正在打开识别记录')
  },

  // 导航到闹钟页面
  navigateToAlarms() {
    wx.switchTab({
      url: '/pages/alarms/alarms'
    })

    app.playVoice('正在打开闹钟管理')
  },

  // 紧急呼叫
  emergencyCall() {
    wx.showModal({
      title: '紧急呼叫',
      content: '是否要拨打紧急联系人电话？',
      confirmText: '立即拨打',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.makeEmergencyCall()
        }
      }
    })

    app.playVoice('紧急呼叫功能已启动')
  },

  // 执行紧急呼叫
  makeEmergencyCall() {
    const contacts = wx.getStorageSync('contacts') || []
    const emergencyContact = contacts.find(contact => contact.isEmergency)

    if (emergencyContact && emergencyContact.phone) {
      wx.makePhoneCall({
        phoneNumber: emergencyContact.phone,
        success: () => {
          console.log('紧急电话拨打成功')
        },
        fail: (err) => {
          console.error('紧急电话拨打失败:', err)
          wx.showToast({
            title: '拨打失败，请检查网络',
            icon: 'none'
          })
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '未设置紧急联系人，请在联系人页面进行设置',
        showCancel: false
      })
    }
  },

  // 语音助手
  voiceAssistant() {
    wx.showModal({
      title: '语音助手',
      content: '您可以对我说：\n• "识别菜品"\n• "设置闹钟"\n• "给儿子打电话"\n• "查看记录"',
      showCancel: false,
      confirmText: '知道了'
    })

    app.playVoice('语音助手正在听您说话')
  },

  // 显示语音提示
  showVoiceHint() {
    this.setData({ showVoiceHint: true })

    // 3秒后自动隐藏
    setTimeout(() => {
      this.hideVoiceHint()
    }, 3000)
  },

  // 隐藏语音提示
  hideVoiceHint() {
    this.setData({ showVoiceHint: false })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadPageData()

    setTimeout(() => {
      wx.stopPullDownRefresh()
      wx.showToast({
        title: '刷新完成',
        icon: 'success'
      })
    }, 1000)
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '老年健康助手 - 让生活更美好',
      path: '/pages/index/index',
      imageUrl: '/images/share.jpg'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '老年健康助手 - 专业的健康管理应用',
      query: '',
      imageUrl: '/images/share.jpg'
    }
  }
})