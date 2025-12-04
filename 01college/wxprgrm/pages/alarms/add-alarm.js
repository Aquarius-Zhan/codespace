// pages/alarms/add-alarm.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 时间选择相关
    selectedTime: '',
    currentTime: '12:00',
    showTimePopup: false,

    // 重复频率相关
    selectedRepeat: 'daily',
    selectedRepeatText: '每天',
    showRepeatPopup: false,
    repeatOptions: [
      { value: 'once', text: '仅一次', checked: false },
      { value: 'daily', text: '每天', checked: true },
      { value: 'weekly', text: '每周', checked: false },
      { value: 'custom', text: '自定义', checked: false }
    ],

    // 药品选择相关
    selectedMedicine: null,
    selectedMedicineText: '',
    showMedicinePopup: false,
    medicineOptions: [],

    // 备注相关
    note: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadMedicines()
    this.initializeDefaultTime()
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
      title: '添加服药提醒闹钟',
      path: '/pages/alarms/add-alarm'
    }
  },

  /**
   * 初始化默认时间
   */
  initializeDefaultTime() {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const defaultTime = `${hours}:${minutes}`

    this.setData({
      currentTime: defaultTime,
      selectedTime: defaultTime
    })
  },

  /**
   * 加载药品列表
   */
  loadMedicines() {
    try {
      // 从本地存储加载已识别的药品
      const medicines = wx.getStorageSync('medicines') || []

      // 如果没有药品，提供一些示例药品
      if (medicines.length === 0) {
        const sampleMedicines = [
          { id: 1, name: '阿司匹林', dosage: '100mg/片', type: '感冒药' },
          { id: 2, name: '布洛芬', dosage: '200mg/片', type: '止痛药' },
          { id: 3, name: '感冒灵', dosage: '1片/次', type: '感冒药' },
          { id: 4, name: '维生素C', dosage: '100mg/片', type: '保健品' }
        ]
        this.setData({ medicineOptions: sampleMedicines })
      } else {
        this.setData({ medicineOptions: medicines })
      }
    } catch (error) {
      console.error('加载药品失败:', error)
      wx.showToast({
        title: '加载药品失败',
        icon: 'none',
        duration: 1500
      })
    }
  },

  /**
   * 备注输入事件
   */
  onNoteInput(e) {
    this.setData({
      note: e.detail.value
    })
  },

  /**
   * 时间选择器相关方法
   */
  showTimePicker() {
    this.setData({ showTimePopup: true })
  },

  hideTimePicker() {
    this.setData({ showTimePopup: false })
  },

  onTimeConfirm(e) {
    const time = e.detail.value
    this.setData({
      selectedTime: time,
      showTimePopup: false
    })
  },

  /**
   * 重复频率选择器相关方法
   */
  showRepeatPicker() {
    this.setData({ showRepeatPopup: true })
  },

  hideRepeatPicker() {
    this.setData({ showRepeatPopup: false })
  },

  selectRepeat(e) {
    const selectedValue = e.currentTarget.dataset.value
    const updatedOptions = this.data.repeatOptions.map(option => ({
      ...option,
      checked: option.value === selectedValue
    }))

    this.setData({ repeatOptions: updatedOptions })
  },

  confirmRepeat() {
    const checkedOption = this.data.repeatOptions.find(option => option.checked)
    if (checkedOption) {
      this.setData({
        selectedRepeat: checkedOption.value,
        selectedRepeatText: checkedOption.text,
        showRepeatPopup: false
      })
    }
  },

  /**
   * 药品选择器相关方法
   */
  showMedicinePicker() {
    this.setData({ showMedicinePopup: true })
  },

  hideMedicinePicker() {
    this.setData({ showMedicinePopup: false })
  },

  selectMedicine(e) {
    const selectedId = parseInt(e.currentTarget.dataset.id)
    const updatedOptions = this.data.medicineOptions.map(medicine => ({
      ...medicine,
      checked: medicine.id === selectedId
    }))

    this.setData({ medicineOptions: updatedOptions })
  },

  confirmMedicine() {
    const checkedMedicine = this.data.medicineOptions.find(medicine => medicine.checked)
    if (checkedMedicine) {
      this.setData({
        selectedMedicine: checkedMedicine,
        selectedMedicineText: `${checkedMedicine.name} (${checkedMedicine.dosage})`,
        showMedicinePopup: false
      })
    }
  },

  /**
   * 保存闹钟
   */
  saveAlarm() {
    // 表单验证
    if (!this.data.selectedTime) {
      wx.showToast({
        title: '请选择提醒时间',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!this.data.selectedMedicine) {
      wx.showToast({
        title: '请选择药品',
        icon: 'none',
        duration: 2000
      })
      return
    }

    try {
      // 创建闹钟对象
      const newAlarm = {
        id: Date.now(), // 使用时间戳作为唯一ID
        time: this.data.selectedTime,
        repeat: this.data.selectedRepeat,
        repeatText: this.data.selectedRepeatText,
        medicine: this.data.selectedMedicine,
        note: this.data.note,
        enabled: true,
        createdAt: new Date().toISOString()
      }

      // 获取现有闹钟列表
      const existingAlarms = wx.getStorageSync('alarms') || []

      // 添加新闹钟
      existingAlarms.push(newAlarm)

      // 保存到本地存储
      wx.setStorageSync('alarms', existingAlarms)

      // 显示成功提示
      wx.showToast({
        title: '闹钟添加成功',
        icon: 'success',
        duration: 2000
      })

      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)

    } catch (error) {
      console.error('保存闹钟失败:', error)
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none',
        duration: 2000
      })
    }
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack()
  }
})