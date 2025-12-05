// pages/chat/chat-detail.js
const app = getApp()

Page({
  data: {
    contactId: '',
    contactName: '',
    contact: {},
    userAvatar: '',
    messages: [],
    inputText: '',
    isVoiceMode: false,
    isRecording: false,
    showMorePanel: false,
    showQuickReply: false,
    showContactDetail: false,
    showVoiceHint: false,
    voiceHintText: '录音中...',
    scrollToMessage: '',
    loadingMoreMessages: false,
    noMoreMessages: false,
    inputFocus: false,

    // 快捷回复消息
    quickReplyMessages: [
      {
        id: '1',
        text: '好的，我知道了',
        description: '确认收到消息'
      },
      {
        id: '2',
        text: '谢谢关心',
        description: '表达感谢'
      },
      {
        id: '3',
        text: '我很好，放心吧',
        description: '告知身体状况'
      },
      {
        id: '4',
        text: '需要帮助时联系你',
        description: '需要协助时'
      },
      {
        id: '5',
        text: '记得按时吃饭',
        description: '提醒用餐'
      },
      {
        id: '6',
        text: '药已经吃过了',
        description: '确认服药'
      },
      {
        id: '7',
        text: '今天天气不错',
        description: '分享日常'
      },
      {
        id: '8',
        text: '想你啦',
        description: '表达思念'
      }
    ]
  },

  onLoad(options) {
    const { contactId, contactName } = options
    this.setData({
      contactId,
      contactName
    })

    this.loadContactData()
    this.loadMessages()
  },

  onShow() {
    // 每次显示时更新消息状态
    this.updateMessageStatus()
    this.scrollToBottom()
  },

  onUnload() {
    // 停止录音
    if (this.data.isRecording) {
      this.stopRecording()
    }

    // 保存聊天记录
    this.saveMessages()
  },

  // 加载联系人数据
  loadContactData() {
    try {
      const contacts = wx.getStorageSync('contacts') || []
      const contact = contacts.find(c => c.id === this.data.contactId)

      if (contact) {
        this.setData({
          contact,
          userAvatar: wx.getStorageSync('userInfo')?.avatar || this.generateAvatar('我')
        })
      } else {
        wx.showToast({
          title: '联系人不存在',
          icon: 'error'
        })
        wx.navigateBack()
      }
    } catch (error) {
      console.error('加载联系人数据失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  // 生成头像
  generateAvatar(name) {
    const colors = ['#4CAF50', '#FF9800', '#2196F3', '#F44336', '#9C27B0']
    const colorIndex = name.charCodeAt(0) % colors.length
    const firstChar = name.charAt(0)
    return `https://via.placeholder.com/80x80/${colors[colorIndex]}/FFFFFF?text=${firstChar}`
  },

  // 加载消息记录
  loadMessages() {
    try {
      const chatMessages = wx.getStorageSync('chatMessages') || {}
      const messages = chatMessages[this.data.contactId] || []

      // 如果没有消息，生成一些示例消息
      if (messages.length === 0) {
        const sampleMessages = this.generateSampleMessages()
        this.setData({ messages: sampleMessages })
        this.saveMessagesToStorage(sampleMessages)
      } else {
        this.setData({ messages })
      }

      // 滚动到底部
      this.scrollToBottom()

    } catch (error) {
      console.error('加载消息失败:', error)
      // 生成示例消息作为备选
      const sampleMessages = this.generateSampleMessages()
      this.setData({ messages: sampleMessages })
    }
  },

  // 生成示例消息
  generateSampleMessages() {
    const now = new Date()
    return [
      {
        id: '1',
        type: 'received',
        contentType: 'text',
        content: '爸/妈，今天身体怎么样？',
        timestamp: new Date(now - 2 * 60 * 60 * 1000), // 2小时前
        isRead: true
      },
      {
        id: '2',
        type: 'sent',
        contentType: 'text',
        content: '我很好，别担心',
        timestamp: new Date(now - 1.8 * 60 * 60 * 1000), // 1.8小时前
        sendStatus: 'success'
      },
      {
        id: '3',
        type: 'received',
        contentType: 'text',
        content: '记得按时吃药哦',
        timestamp: new Date(now - 1 * 60 * 60 * 1000), // 1小时前
        isRead: true
      },
      {
        id: '4',
        type: 'sent',
        contentType: 'text',
        content: '已经吃过了，谢谢提醒',
        timestamp: new Date(now - 50 * 60 * 1000), // 50分钟前
        sendStatus: 'success'
      },
      {
        id: '5',
        type: 'system',
        contentType: 'text',
        content: '对方正在输入...',
        timestamp: new Date(now - 10 * 60 * 1000) // 10分钟前
      }
    ]
  },

  // 保存消息到存储
  saveMessagesToStorage(messages) {
    try {
      const chatMessages = wx.getStorageSync('chatMessages') || {}
      chatMessages[this.data.contactId] = messages
      wx.setStorageSync('chatMessages', chatMessages)

      // 同步到云端
      this.syncMessagesToCloud(messages)

    } catch (error) {
      console.error('保存消息失败:', error)
    }
  },

  // 保存消息
  saveMessages() {
    this.saveMessagesToStorage(this.data.messages)
  },

  // 同步消息到云端
  async syncMessagesToCloud(messages) {
    // 检查网络连接和云开发可用性
    if (app.globalData.networkType === 'none') {
      console.warn('网络不可用，跳过云同步')
      return
    }

    // 检查云开发是否可用
    if (!app.globalData.cloudAvailable) {
      console.warn('云开发不可用，跳过云同步')
      return
    }

    try {
      const db = wx.cloud.database()
      await db.collection('chatMessages').add({
        data: {
          contactId: this.data.contactId,
          messages: messages,
          updateTime: new Date()
        }
      })
    } catch (error) {
      console.warn('同步消息到云端失败:', error)
      // 云同步失败不影响本地功能，只记录警告
    }
  },

  // 更新消息状态
  updateMessageStatus() {
    const updatedMessages = this.data.messages.map(msg => {
      if (msg.type === 'received' && !msg.isRead) {
        return { ...msg, isRead: true }
      }
      return msg
    })

    if (JSON.stringify(updatedMessages) !== JSON.stringify(this.data.messages)) {
      this.setData({ messages: updatedMessages })
      this.saveMessages()

      // 更新联系人的未读消息数
      this.updateContactUnreadCount()
    }
  },

  // 更新联系人未读消息数
  updateContactUnreadCount() {
    try {
      const contacts = wx.getStorageSync('contacts') || []
      const updatedContacts = contacts.map(contact => {
        if (contact.id === this.data.contactId) {
          return { ...contact, unreadCount: 0 }
        }
        return contact
      })

      wx.setStorageSync('contacts', updatedContacts)
    } catch (error) {
      console.error('更新联系人未读数失败:', error)
    }
  },

  // 滚动到底部
  scrollToBottom() {
    setTimeout(() => {
      if (this.data.messages.length > 0) {
        const lastMessage = this.data.messages[this.data.messages.length - 1]
        this.setData({
          scrollToMessage: `msg-${lastMessage.id}`
        })
      }
    }, 100)
  },

  // 格式化时间
  formatTime(timestamp) {
    const now = new Date()
    const messageTime = new Date(timestamp)
    const diff = now - messageTime

    // 1分钟内
    if (diff < 60 * 1000) {
      return '刚刚'
    }

    // 1小时内
    if (diff < 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 1000))}分钟前`
    }

    // 24小时内
    if (diff < 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
    }

    // 超过24小时显示具体时间
    return messageTime.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  },

  // 格式化日期
  formatDate(timestamp) {
    const now = new Date()
    const messageDate = new Date(timestamp)
    const diff = now - messageDate

    // 今天
    if (diff < 24 * 60 * 60 * 1000 &&
        now.getDate() === messageDate.getDate()) {
      return '今天'
    }

    // 昨天
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (messageDate.getDate() === yesterday.getDate()) {
      return '昨天'
    }

    // 其他日期
    return messageDate.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  },

  // 文字输入
  onInputText(e) {
    this.setData({
      inputText: e.detail.value,
      showMorePanel: false
    })
  },

  // 发送文字消息
  sendMessage() {
    const content = this.data.inputText.trim()

    if (!content) return

    const newMessage = {
      id: Date.now().toString(),
      type: 'sent',
      contentType: 'text',
      content: content,
      timestamp: new Date(),
      sendStatus: 'success'
    }

    const updatedMessages = [...this.data.messages, newMessage]

    this.setData({
      messages: updatedMessages,
      inputText: '',
      showMorePanel: false
    })

    this.saveMessages()
    this.scrollToBottom()

    // 语音反馈
    app.playVoice('消息已发送')

    // 模拟对方回复
    this.simulateReply()
  },

  // 模拟对方回复
  simulateReply() {
    setTimeout(() => {
      const replies = [
        '好的，收到了',
        '明白了',
        '没问题',
        '知道了，谢谢',
        '好的，我会注意的'
      ]

      const replyMessage = {
        id: (Date.now() + 1).toString(),
        type: 'received',
        contentType: 'text',
        content: replies[Math.floor(Math.random() * replies.length)],
        timestamp: new Date(),
        isRead: false
      }

      const updatedMessages = [...this.data.messages, replyMessage]
      this.setData({ messages: updatedMessages })
      this.saveMessages()
      this.scrollToBottom()

      // 语音提示
      app.playVoice('收到新消息')
    }, 2000 + Math.random() * 3000) // 2-5秒后回复
  },

  // 切换语音输入模式
  toggleVoiceInput() {
    this.setData({
      isVoiceMode: !this.data.isVoiceMode,
      showMorePanel: false,
      inputFocus: !this.data.isVoiceMode
    })

    app.playVoice(this.data.isVoiceMode ? '切换到键盘输入' : '切换到语音输入')
  },

  // 开始录音
  startRecording(e) {
    if (this.data.isRecording) return

    const recorderManager = wx.getRecorderManager()

    recorderManager.onStart(() => {
      this.setData({
        isRecording: true,
        showVoiceHint: true,
        voiceHintText: '录音中，松开发送'
      })
    })

    recorderManager.onStop((res) => {
      this.setData({
        isRecording: false,
        showVoiceHint: false
      })

      if (res.duration > 500) { // 最短0.5秒
        this.sendVoiceMessage(res.tempFilePath, Math.round(res.duration / 1000))
      } else {
        wx.showToast({
          title: '录音时间太短',
          icon: 'none'
        })
      }
    })

    recorderManager.onError((err) => {
      console.error('录音失败:', err)
      this.setData({
        isRecording: false,
        showVoiceHint: false
      })

      wx.showToast({
        title: '录音失败',
        icon: 'error'
      })
    })

    recorderManager.start({
      duration: 60000, // 最长60秒
      format: 'mp3'
    })
  },

  // 停止录音
  stopRecording() {
    if (!this.data.isRecording) return

    const recorderManager = wx.getRecorderManager()
    recorderManager.stop()
  },

  // 语音触摸移动
  onVoiceTouchMove(e) {
    const touch = e.touches[0]
    const { clientY } = touch

    // 如果上滑超过100rpx，取消录音
    if (clientY < e.currentTarget.offsetTop - 100) {
      this.setData({
        voiceHintText: '上滑取消发送'
      })

      if (this.data.isRecording) {
        this.cancelRecording()
      }
    }
  },

  // 取消录音
  cancelRecording() {
    const recorderManager = wx.getRecorderManager()
    recorderManager.stop()

    this.setData({
      isRecording: false,
      showVoiceHint: false
    })

    wx.showToast({
      title: '已取消录音',
      icon: 'none'
    })
  },

  // 发送语音消息
  sendVoiceMessage(tempFilePath, duration) {
    const newMessage = {
      id: Date.now().toString(),
      type: 'sent',
      contentType: 'voice',
      content: tempFilePath,
      duration: duration,
      timestamp: new Date(),
      sendStatus: 'success'
    }

    const updatedMessages = [...this.data.messages, newMessage]
    this.setData({
      messages: updatedMessages
    })

    this.saveMessages()
    this.scrollToBottom()

    app.playVoice('语音消息已发送')
  },

  // 播放语音
  playVoice(e) {
    const message = e.currentTarget.dataset.message

    if (this.data.playingVoiceId === message.id) {
      // 如果正在播放，停止播放
      if (this.data.innerAudioContext) {
        this.data.innerAudioContext.stop()
      }
      this.setData({ playingVoiceId: null })
      return
    }

    // 停止之前的播放
    if (this.data.innerAudioContext) {
      this.data.innerAudioContext.stop()
    }

    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.src = message.content

    innerAudioContext.onPlay(() => {
      this.setData({
        playingVoiceId: message.id,
        innerAudioContext
      })
    })

    innerAudioContext.onEnded(() => {
      this.setData({ playingVoiceId: null })
    })

    innerAudioContext.onError((err) => {
      console.error('播放语音失败:', err)
      this.setData({ playingVoiceId: null })
      wx.showToast({
        title: '播放失败',
        icon: 'error'
      })
    })

    innerAudioContext.play()
  },

  // 切换更多功能面板
  toggleMorePanel() {
    this.setData({
      showMorePanel: !this.data.showMorePanel,
      isVoiceMode: false
    })
  },

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const images = res.tempFilePaths
        images.forEach(imagePath => {
          this.sendImageMessage(imagePath)
        })
      },
      fail: (err) => {
        console.error('选择图片失败:', err)
        wx.showToast({
          title: '选择图片失败',
          icon: 'error'
        })
      }
    })

    this.setData({ showMorePanel: false })
  },

  // 拍照
  takePhoto() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: (res) => {
        if (res.tempFilePaths.length > 0) {
          this.sendImageMessage(res.tempFilePaths[0])
        }
      },
      fail: (err) => {
        console.error('拍照失败:', err)
        wx.showToast({
          title: '拍照失败',
          icon: 'error'
        })
      }
    })

    this.setData({ showMorePanel: false })
  },

  // 发送图片消息
  sendImageMessage(imagePath) {
    const newMessage = {
      id: Date.now().toString(),
      type: 'sent',
      contentType: 'image',
      content: imagePath,
      timestamp: new Date(),
      sendStatus: 'success'
    }

    const updatedMessages = [...this.data.messages, newMessage]
    this.setData({
      messages: updatedMessages
    })

    this.saveMessages()
    this.scrollToBottom()

    app.playVoice('图片已发送')
  },

  // 预览图片
  previewImage(e) {
    const src = e.currentTarget.dataset.src
    wx.previewImage({
      urls: [src],
      current: src
    })
  },

  // 选择位置
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.sendLocationMessage(res)
      },
      fail: (err) => {
        console.error('选择位置失败:', err)
        if (err.errMsg.includes('cancel')) {
          return
        }

        wx.showModal({
          title: '提示',
          content: '无法获取位置信息，请检查位置权限',
          showCancel: false
        })
      }
    })

    this.setData({ showMorePanel: false })
  },

  // 发送位置消息
  sendLocationMessage(locationInfo) {
    const newMessage = {
      id: Date.now().toString(),
      type: 'sent',
      contentType: 'location',
      location: {
        name: locationInfo.name || '当前位置',
        address: locationInfo.address || '详细地址',
        latitude: locationInfo.latitude,
        longitude: locationInfo.longitude
      },
      timestamp: new Date(),
      sendStatus: 'success'
    }

    const updatedMessages = [...this.data.messages, newMessage]
    this.setData({
      messages: updatedMessages
    })

    this.saveMessages()
    this.scrollToBottom()

    app.playVoice('位置已发送')
  },

  // 发送快捷消息
  sendQuickMessage() {
    this.setData({
      showQuickReply: true,
      showMorePanel: false
    })
  },

  // 选择快捷回复
  selectQuickReply(e) {
    const message = e.currentTarget.dataset.message

    const newMessage = {
      id: Date.now().toString(),
      type: 'sent',
      contentType: 'text',
      content: message.text,
      timestamp: new Date(),
      sendStatus: 'success'
    }

    const updatedMessages = [...this.data.messages, newMessage]
    this.setData({
      messages: updatedMessages,
      showQuickReply: false
    })

    this.saveMessages()
    this.scrollToBottom()

    app.playVoice(message.text)
  },

  // 关闭快捷回复
  closeQuickReply() {
    this.setData({ showQuickReply: false })
  },

  // 发送健康数据
  sendHealthData() {
    wx.showActionSheet({
      itemList: ['血压数据', '血糖数据', '心率数据', '运动数据'],
      success: (res) => {
        const healthTypes = ['血压', '血糖', '心率', '运动']
        const healthType = healthTypes[res.tapIndex]

        const newMessage = {
          id: Date.now().toString(),
          type: 'sent',
          contentType: 'text',
          content: `刚刚更新了${healthType}数据`,
          timestamp: new Date(),
          sendStatus: 'success'
        }

        const updatedMessages = [...this.data.messages, newMessage]
        this.setData({
          messages: updatedMessages
        })

        this.saveMessages()
        this.scrollToBottom()

        app.playVoice(`${healthType}数据已发送`)
      }
    })

    this.setData({ showMorePanel: false })
  },

  // 发送紧急求助
  sendEmergencyAlert() {
    wx.showModal({
      title: '紧急求助',
      content: '确定要发送紧急求助信号吗？',
      confirmText: '发送',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.sendEmergencyMessage()
        }
      }
    })

    this.setData({ showMorePanel: false })
  },

  // 发送紧急消息
  sendEmergencyMessage() {
    const emergencyMessage = {
      id: Date.now().toString(),
      type: 'sent',
      contentType: 'text',
      content: '🆘 紧急求助！请立即联系我！',
      timestamp: new Date(),
      sendStatus: 'success'
    }

    const updatedMessages = [...this.data.messages, emergencyMessage]
    this.setData({
      messages: updatedMessages
    })

    this.saveMessages()
    this.scrollToBottom()

    app.playVoice('紧急求助信号已发送')

    // 同时拨打紧急联系人电话
    this.emergencyCall()
  },

  // 加载更多消息
  loadMoreMessages() {
    if (this.data.loadingMoreMessages || this.data.noMoreMessages) return

    this.setData({ loadingMoreMessages: true })

    // 模拟加载
    setTimeout(() => {
      this.setData({
        loadingMoreMessages: false,
        noMoreMessages: true
      })
    }, 1000)
  },

  // 显示联系人详情
  showContactInfo() {
    this.setData({ showContactDetail: true })
  },

  // 关闭联系人详情
  closeContactDetail() {
    this.setData({ showContactDetail: false })
  },

  // 拨打电话
  makePhoneCall() {
    if (this.data.contact.phone) {
      wx.makePhoneCall({
        phoneNumber: this.data.contact.phone,
        success: () => {
          app.playVoice(`正在拨打${this.data.contact.name}的电话`)
        },
        fail: (err) => {
          console.error('拨打电话失败:', err)
          wx.showToast({
            title: '拨打失败',
            icon: 'error'
          })
        }
      })
    } else {
      wx.showToast({
        title: '该联系人没有电话',
        icon: 'none'
      })
    }
  },

  // 视频通话
  makeVideoCall() {
    wx.showModal({
      title: '视频通话',
      content: '视频通话功能暂未开放',
      showCancel: false
    })

    app.playVoice('视频通话功能暂未开放')
  },

  // 查看健康数据
  viewHealthData() {
    wx.showToast({
      title: '健康数据功能开发中',
      icon: 'none'
    })

    this.setData({ showContactDetail: false })
  },

  // 发送位置
  sendLocation() {
    this.chooseLocation()
    this.setData({ showContactDetail: false })
  },

  // 切换紧急联系人
  toggleEmergencyContact() {
    const updatedContact = {
      ...this.data.contact,
      isEmergency: !this.data.contact.isEmergency
    }

    this.setData({ contact: updatedContact })

    // 更新本地存储
    try {
      const contacts = wx.getStorageSync('contacts') || []
      const updatedContacts = contacts.map(contact => {
        if (contact.id === this.data.contactId) {
          return updatedContact
        }
        return contact
      })

      wx.setStorageSync('contacts', updatedContacts)

      wx.showToast({
        title: updatedContact.isEmergency ? '已设为紧急联系人' : '已取消紧急联系人',
        icon: 'success'
      })

    } catch (error) {
      console.error('更新紧急联系人状态失败:', error)
    }
  },

  // 紧急呼叫
  emergencyCall() {
    const contacts = wx.getStorageSync('contacts') || []
    const emergencyContacts = contacts.filter(c => c.isEmergency)

    if (emergencyContacts.length === 0) {
      wx.showModal({
        title: '提示',
        content: '未设置紧急联系人',
        showCancel: false
      })
      return
    }

    // 拨打第一个紧急联系人
    wx.makePhoneCall({
      phoneNumber: emergencyContacts[0].phone,
      success: () => {
        console.log('紧急电话拨打成功')
      },
      fail: (err) => {
        console.error('紧急电话拨打失败:', err)
      }
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: `与${this.data.contact.name}的聊天`,
      path: `/pages/chat/chat-detail?contactId=${this.data.contactId}&contactName=${this.data.contactName}`
    }
  }
})