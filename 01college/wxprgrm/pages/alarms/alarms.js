// pages/alarms/alarms.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    alarms: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadAlarms()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadAlarms()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadAlarms()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '我的闹钟提醒',
      path: '/pages/alarms/alarms'
    }
  },

  /**
   * 加载闹钟列表
   */
  loadAlarms() {
    try {
      const alarms = wx.getStorageSync('alarms') || []
      this.setData({
        alarms: alarms
      })
    } catch (error) {
      console.error('加载闹钟失败:', error)
      this.setData({
        alarms: []
      })
    }
  },

  /**
   * 跳转到添加闹钟页面
   */
  goToAddAlarm() {
    wx.navigateTo({
      url: '/pages/alarms/add-alarm'
    })
  },

  /**
   * 切换闹钟开关状态
   */
  toggleAlarm(e) {
    const alarmId = e.currentTarget.dataset.id
    const alarms = this.data.alarms.map(alarm => {
      if (alarm.id === alarmId) {
        return {
          ...alarm,
          enabled: !alarm.enabled
        }
      }
      return alarm
    })

    this.setData({ alarms })
    this.saveAlarms(alarms)

    // 提示用户
    const alarm = alarms.find(a => a.id === alarmId)
    wx.showToast({
      title: alarm.enabled ? '闹钟已开启' : '闹钟已关闭',
      icon: 'none',
      duration: 1500
    })
  },

  /**
   * 删除闹钟
   */
  deleteAlarm(e) {
    const alarmId = e.currentTarget.dataset.id

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个闹钟吗？',
      success: (res) => {
        if (res.confirm) {
          const alarms = this.data.alarms.filter(alarm => alarm.id !== alarmId)
          this.setData({ alarms })
          this.saveAlarms(alarms)

          wx.showToast({
            title: '闹钟已删除',
            icon: 'success',
            duration: 1500
          })
        }
      }
    })
  },

  /**
   * 保存闹钟到本地存储
   */
  saveAlarms(alarms) {
    try {
      wx.setStorageSync('alarms', alarms)
    } catch (error) {
      console.error('保存闹钟失败:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'none',
        duration: 1500
      })
    }
  }
})