// pages/chat/chat.js
const app = getApp()

Page({
  data: {
    searchKeyword: '',
    contacts: [],
    quickContacts: [],
    filteredContacts: [],
    loadingMore: false,
    noMoreData: false,
    showAddContact: false,
    savingContact: false,

    // 新联系人表单
    newContact: {
      name: '',
      relation: '',
      phone: '',
      avatar: '',
      isEmergency: false,
      isOnline: false,
      unreadCount: 0
    }
  },

  onLoad(options) {
    this.loadContacts()
  },

  onShow() {
    // 每次显示时刷新数据
    this.loadContacts()
  },

  onPullDownRefresh() {
    this.loadContacts().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载联系人数据
  async loadContacts() {
    try {
      // 从本地存储加载联系人
      let contacts = wx.getStorageSync('contacts') || []

      // 如果本地没有数据，使用默认联系人
      if (contacts.length === 0) {
        contacts = this.getDefaultContacts()
        wx.setStorageSync('contacts', contacts)
      }

      // 为每个联系人添加头像
      contacts = contacts.map(contact => ({
        ...contact,
        avatar: contact.avatar || this.generateAvatar(contact.name),
        lastMessage: contact.lastMessage || '暂无消息',
        lastMessageTime: this.formatMessageTime(contact.lastMessageTime || new Date())
      }))

      this.setData({
        contacts,
        filteredContacts: contacts,
        quickContacts: contacts.slice(0, 5) // 前5个作为快速联系人
      })

      // 尝试从云端同步联系人
      this.syncContactsFromCloud()

    } catch (error) {
      console.error('加载联系人失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  // 获取默认联系人
  getDefaultContacts() {
    return [
      {
        id: '1',
        name: '小明',
        relation: '儿子',
        phone: '13800138000',
        avatar: '',
        isEmergency: true,
        isOnline: true,
        unreadCount: 2,
        lastMessageTime: new Date(Date.now() - 30 * 60 * 1000) // 30分钟前
      },
      {
        id: '2',
        name: '小红',
        relation: '女儿',
        phone: '13800138001',
        avatar: '',
        isEmergency: true,
        isOnline: false,
        unreadCount: 0,
        lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2小时前
      },
      {
        id: '3',
        name: '老伴',
        relation: '配偶',
        phone: '13800138002',
        avatar: '',
        isEmergency: true,
        isOnline: true,
        unreadCount: 5,
        lastMessageTime: new Date(Date.now() - 10 * 60 * 1000) // 10分钟前
      },
      {
        id: '4',
        name: '小华',
        relation: '孙子',
        phone: '13800138003',
        avatar: '',
        isEmergency: false,
        isOnline: false,
        unreadCount: 0,
        lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1天前
      },
      {
        id: '5',
        name: '张医生',
        relation: '家庭医生',
        phone: '13800138004',
        avatar: '',
        isEmergency: true,
        isOnline: false,
        unreadCount: 0,
        lastMessageTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3天前
      }
    ]
  },

  // 生成头像URL
  generateAvatar(name) {
    const colors = ['#4CAF50', '#FF9800', '#2196F3', '#F44336', '#9C27B0']
    const colorIndex = name.charCodeAt(0) % colors.length
    const firstChar = name.charAt(0)
    return `https://via.placeholder.com/120x120/${colors[colorIndex]}/FFFFFF?text=${firstChar}`
  },

  // 格式化消息时间
  formatMessageTime(time) {
    const now = new Date()
    const messageTime = new Date(time)
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

    // 7天内
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
    }

    // 超过7天显示具体日期
    return messageTime.toLocaleDateString('zh-CN')
  },

  // 搜索联系人
  onSearchInput(e) {
    const keyword = e.detail.value.trim()
    this.setData({ searchKeyword: keyword })

    if (keyword) {
      const filtered = this.data.contacts.filter(contact =>
        contact.name.includes(keyword) ||
        contact.relation.includes(keyword) ||
        contact.phone.includes(keyword)
      )
      this.setData({ filteredContacts: filtered })
    } else {
      this.setData({
        filteredContacts: this.data.contacts,
        quickContacts: this.data.contacts.slice(0, 5)
      })
    }
  },

  // 导航到聊天详情
  navigateToChatDetail(e) {
    const contact = e.currentTarget.dataset.contact

    // 清除该联系人的未读消息
    const updatedContacts = this.data.contacts.map(c => {
      if (c.id === contact.id) {
        return { ...c, unreadCount: 0 }
      }
      return c
    })

    this.setData({
      contacts: updatedContacts,
      filteredContacts: this.data.searchKeyword
        ? updatedContacts.filter(c =>
            c.name.includes(this.data.searchKeyword) ||
            c.relation.includes(this.data.searchKeyword) ||
            c.phone.includes(this.data.searchKeyword)
          )
        : updatedContacts
    })

    // 保存更新后的联系人
    wx.setStorageSync('contacts', updatedContacts)

    wx.navigateTo({
      url: `/pages/chat/chat-detail?contactId=${contact.id}&contactName=${contact.name}`
    })

    // 语音提示
    app.playVoice(`正在打开与${contact.name}的聊天`)
  },

  // 添加联系人
  addContact() {
    this.setData({ showAddContact: true })
    app.playVoice('正在添加新联系人')
  },

  // 关闭添加联系人弹窗
  closeAddContact() {
    this.setData({
      showAddContact: false,
      newContact: {
        name: '',
        relation: '',
        phone: '',
        avatar: '',
        isEmergency: false,
        isOnline: false,
        unreadCount: 0
      }
    })
  },

  // 联系人姓名输入
  onContactNameInput(e) {
    this.setData({
      'newContact.name': e.detail.value
    })
  },

  // 联系人关系输入
  onContactRelationInput(e) {
    this.setData({
      'newContact.relation': e.detail.value
    })
  },

  // 联系人电话输入
  onContactPhoneInput(e) {
    this.setData({
      'newContact.phone': e.detail.value
    })
  },

  // 切换紧急联系人状态
  toggleEmergency() {
    this.setData({
      'newContact.isEmergency': !this.data.newContact.isEmergency
    })
  },

  // 保存联系人
  async saveContact() {
    const { newContact } = this.data

    // 验证必填字段
    if (!newContact.name.trim()) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'error'
      })
      return
    }

    if (!newContact.phone.trim()) {
      wx.showToast({
        title: '请输入电话',
        icon: 'error'
      })
      return
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(newContact.phone)) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'error'
      })
      return
    }

    try {
      this.setData({ savingContact: true })

      // 生成新联系人
      const contact = {
        ...newContact,
        id: Date.now().toString(),
        avatar: this.generateAvatar(newContact.name),
        lastMessage: '暂无消息',
        lastMessageTime: new Date()
      }

      // 保存到本地存储
      const contacts = [...this.data.contacts, contact]
      wx.setStorageSync('contacts', contacts)

      // 更新界面
      this.setData({
        contacts,
        filteredContacts: contacts,
        quickContacts: contacts.slice(0, 5),
        savingContact: false,
        showAddContact: false,
        newContact: {
          name: '',
          relation: '',
          phone: '',
          avatar: '',
          isEmergency: false,
          isOnline: false,
          unreadCount: 0
        }
      })

      wx.showToast({
        title: '添加成功',
        icon: 'success'
      })

      // 同步到云端
      this.syncContactsToCloud()

    } catch (error) {
      console.error('保存联系人失败:', error)
      this.setData({ savingContact: false })
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    }
  },

  // 加载更多联系人
  loadMoreContacts() {
    // 这里可以用于分页加载，目前是全部加载
    if (this.data.noMoreData) return

    this.setData({ loadingMore: true })

    setTimeout(() => {
      this.setData({
        loadingMore: false,
        noMoreData: true
      })
    }, 1000)
  },

  // 语音输入
  startVoiceInput() {
    wx.showModal({
      title: '语音输入',
      content: '请说出您要联系的人名',
      confirmText: '开始录音',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.startRecording()
        }
      }
    })
  },

  // 开始录音
  startRecording() {
    const recorderManager = wx.getRecorderManager()

    recorderManager.onStart(() => {
      wx.showLoading({
        title: '录音中...',
        mask: true
      })
    })

    recorderManager.onStop((res) => {
      wx.hideLoading()
      this.processVoiceInput(res.tempFilePath)
    })

    recorderManager.onError((err) => {
      wx.hideLoading()
      console.error('录音失败:', err)
      wx.showToast({
        title: '录音失败',
        icon: 'error'
      })
    })

    recorderManager.start({
      duration: 5000, // 最长5秒
      format: 'mp3'
    })
  },

  // 处理语音输入
  processVoiceInput(tempFilePath) {
    // 这里应该调用语音识别API
    // 目前模拟识别结果
    wx.showLoading({
      title: '识别中...',
      mask: true
    })

    setTimeout(() => {
      wx.hideLoading()

      // 模拟识别结果
      const recognizedName = '小明'
      const contact = this.data.contacts.find(c => c.name.includes(recognizedName))

      if (contact) {
        wx.showToast({
          title: `找到联系人：${contact.name}`,
          icon: 'success'
        })

        setTimeout(() => {
          this.navigateToChatDetail({ currentTarget: { dataset: { contact } } })
        }, 1500)
      } else {
        wx.showToast({
          title: '未找到该联系人',
          icon: 'error'
        })
      }
    }, 2000)
  },

  // 紧急呼叫
  emergencyCall() {
    const emergencyContacts = this.data.contacts.filter(c => c.isEmergency)

    if (emergencyContacts.length === 0) {
      wx.showModal({
        title: '提示',
        content: '未设置紧急联系人，请先添加紧急联系人',
        showCancel: false
      })
      return
    }

    if (emergencyContacts.length === 1) {
      // 只有一个紧急联系人，直接拨打
      this.makePhoneCall(emergencyContacts[0])
    } else {
      // 多个紧急联系人，让用户选择
      const contactNames = emergencyContacts.map(c => c.name).join('、')
      wx.showModal({
        title: '紧急呼叫',
        content: `检测到多个紧急联系人：${contactNames}\n将拨打第一个紧急联系人`,
        confirmText: '拨打',
        cancelText: '选择联系人',
        success: (res) => {
          if (res.confirm) {
            this.makePhoneCall(emergencyContacts[0])
          } else {
            // 这里可以显示紧急联系人列表让用户选择
            this.showEmergencyContacts(emergencyContacts)
          }
        }
      })
    }
  },

  // 拨打电话
  makePhoneCall(contact) {
    wx.makePhoneCall({
      phoneNumber: contact.phone,
      success: () => {
        app.playVoice(`正在拨打${contact.name}的电话`)
      },
      fail: (err) => {
        console.error('拨打电话失败:', err)
        wx.showToast({
          title: '拨打失败',
          icon: 'error'
        })
      }
    })
  },

  // 显示紧急联系人列表
  showEmergencyContacts(contacts) {
    wx.showActionSheet({
      itemList: contacts.map(c => `${c.name} (${c.relation})`),
      success: (res) => {
        if (res.tapIndex >= 0) {
          this.makePhoneCall(contacts[res.tapIndex])
        }
      }
    })
  },

  // 从云端同步联系人
  async syncContactsFromCloud() {
    if (app.globalData.networkType === 'none') {
      console.log('网络不可用，跳过云端同步')
      return
    }

    if (!app.globalData.cloudAvailable) {
      console.log('云开发不可用，跳过云端同步')
      return
    }

    try {
      const db = wx.cloud.database()
      const res = await db.collection('contacts').get()

      if (res.data.length > 0) {
        const cloudContacts = res.data[0].contacts || []
        if (cloudContacts.length > this.data.contacts.length) {
          wx.showModal({
            title: '发现云端联系人',
            content: '云端有更多的联系人数据，是否同步？',
            confirmText: '同步',
            cancelText: '稍后',
            success: (res) => {
              if (res.confirm) {
                this.setData({
                  contacts: cloudContacts,
                  filteredContacts: cloudContacts,
                  quickContacts: cloudContacts.slice(0, 5)
                })
                wx.setStorageSync('contacts', cloudContacts)
                wx.showToast({
                  title: '同步成功',
                  icon: 'success'
                })
              }
            }
          })
        }
      }
    } catch (error) {
      console.warn('云端同步失败，将使用本地联系人:', error)
    }
  },

  // 同步联系人到云端
  async syncContactsToCloud() {
    if (app.globalData.networkType === 'none') {
      console.log('网络不可用，跳过云端同步')
      return
    }

    if (!app.globalData.cloudAvailable) {
      console.log('云开发不可用，联系人已保存在本地')
      return
    }

    try {
      const db = wx.cloud.database()
      await db.collection('contacts').add({
        data: {
          contacts: this.data.contacts,
          updateTime: new Date()
        }
      })
    } catch (error) {
      console.warn('同步到云端失败，联系人仍保存在本地:', error)
    }
  }
})