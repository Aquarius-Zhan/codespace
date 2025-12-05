// pages/medicine-identify/medicine-identify.js
const app = getApp()

Page({
  data: {
    imagePreview: '',
    flashOn: false,
    identifying: false,
    saving: false,
    recognitionResult: null,
    recentHistory: [],
    commonMedicines: [
      {
        id: '1',
        name: '感冒药',
        type: '非处方药',
        icon: 'flower-o'
      },
      {
        id: '2',
        name: '降压药',
        type: '处方药',
        icon: 'heart-o'
      },
      {
        id: '3',
        name: '糖尿病药',
        type: '处方药',
        icon: 'label-o'
      },
      {
        id: '4',
        name: '维生素',
        type: '保健品',
        icon: 'star-o'
      }
    ]
  },

  onLoad(options) {
    this.loadRecentHistory()
  },

  onShow() {
    // 页面显示时刷新历史记录
    this.loadRecentHistory()
  },

  // 加载最近的历史记录
  loadRecentHistory() {
    try {
      const records = wx.getStorageSync('identifyRecords') || []
      const medicineRecords = records.filter(record => record.type === 'medicine')

      // 获取最近的5条记录
      const recentRecords = medicineRecords
        .slice(-5)
        .reverse()
        .map(record => ({
          ...record,
          time: this.formatTime(record.timestamp)
        }))

      this.setData({ recentHistory: recentRecords })

    } catch (error) {
      console.error('加载历史记录失败:', error)
    }
  },

  // 格式化时间
  formatTime(timestamp) {
    const now = new Date()
    const recordTime = new Date(timestamp)
    const diff = now - recordTime

    if (diff < 60 * 1000) {
      return '刚刚'
    }

    if (diff < 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 1000))}分钟前`
    }

    if (diff < 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
    }

    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
    }

    return recordTime.toLocaleDateString('zh-CN')
  },

  // 拍照
  takePhoto() {
    const that = this

    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      flash: that.data.flashOn ? 'on' : 'off',
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        that.setData({ imagePreview: tempFilePath })
        that.identifyMedicine(tempFilePath)
      },
      fail: (err) => {
        console.error('拍照失败:', err)
        wx.showToast({
          title: '拍照失败',
          icon: 'error'
        })
      }
    })

    app.playVoice('正在拍摄药物')
  },

  // 从相册选择图片
  chooseImage() {
    const that = this

    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        that.setData({ imagePreview: tempFilePath })
        that.identifyMedicine(tempFilePath)
      },
      fail: (err) => {
        console.error('选择图片失败:', err)
        wx.showToast({
          title: '选择图片失败',
          icon: 'error'
        })
      }
    })

    app.playVoice('正在选择药物图片')
  },

  // 选择新图片（重新上传）
  chooseNewImage() {
    this.chooseImage()
  },

  // 重新拍照
  retakePhoto() {
    this.takePhoto()
  },

  // 切换闪光灯
  toggleFlash() {
    this.setData({
      flashOn: !this.data.flashOn
    })

    app.playVoice(this.data.flashOn ? '闪光灯已关闭' : '闪光灯已开启')
  },

  // 识别药物（模拟AI识别）
  async identifyMedicine(imagePath) {
    this.setData({ identifying: true })

    try {
      // 模拟网络延迟
      await this.delay(2000)

      // 模拟AI识别结果
      const mockResults = this.getMockMedicineResults()
      const result = mockResults[Math.floor(Math.random() * mockResults.length)]

      // 添加一些随机性
      const confidence = 75 + Math.floor(Math.random() * 20) // 75-95%

      const recognitionResult = {
        ...result,
        confidence: confidence,
        imagePath: imagePath,
        timestamp: new Date()
      }

      this.setData({
        recognitionResult: recognitionResult,
        identifying: false
      })

      // 语音播报识别结果
      app.playVoice(`识别成功：${result.medicineName}，置信度${confidence}%`)

      wx.showToast({
        title: '识别成功',
        icon: 'success'
      })

    } catch (error) {
      console.error('识别失败:', error)
      this.setData({ identifying: false })

      wx.showToast({
        title: '识别失败，请重试',
        icon: 'error'
      })
    }
  },

  // 获取模拟药物识别结果
  getMockMedicineResults() {
    return [
      {
        medicineName: '阿司匹林肠溶片',
        brand: '拜耳',
        specification: '100mg × 30片',
        type: '解热镇痛抗炎药',
        description: '阿司匹林是一种非甾体抗炎药，具有解热、镇痛、抗炎和抑制血小板聚集的作用。用于预防心脑血管疾病。',
        indications: [
          '预防心肌梗死复发',
          '预防脑卒中复发',
          '不稳定型心绞痛',
          '急性心肌梗死',
          '暂时性脑缺血发作'
        ],
        dosage: {
          adult: '每日1片，口服',
          elderly: '每日1片，需在医生指导下使用',
          method: '整片吞服，不可嚼碎',
          timing: '餐后服用'
        },
        warnings: [
          '对本品过敏者禁用',
          '有出血倾向者慎用',
          '孕妇及哺乳期妇女慎用',
          '严重肝肾功能不全者禁用',
          '避免与其他抗凝药物合用'
        ],
        contraindications: ['活动性消化道溃疡', '严重肝肾功能不全', '出血性疾病', '妊娠晚期'],
        sideEffects: [
          { name: '胃肠道不适', probability: '常见 (1-10%)' },
          { name: '过敏反应', probability: '偶见 (0.1-1%)' },
          { name: '出血倾向', probability: '罕见 (<0.1%)' },
          { name: '肝肾功能异常', probability: '罕见 (<0.1%)' }
        ]
      },
      {
        medicineName: '氨氯地平片',
        brand: '络活喜',
        specification: '5mg × 7片',
        type: '钙通道阻滞剂',
        description: '氨氯地平是一种钙通道阻滞剂，主要用于治疗高血压和心绞痛。通过阻断钙离子进入心肌和血管平滑肌细胞而发挥作用。',
        indications: [
          '原发性高血压',
          '稳定性心绞痛',
          '变异型心绞痛',
          '冠心病',
          '慢性心力衰竭'
        ],
        dosage: {
          adult: '初始剂量2.5mg，每日1次',
          elderly: '初始剂量2.5mg，需谨慎使用',
          method: '口服，可随餐服用或空腹服用',
          timing: '每日固定时间服用'
        },
        warnings: [
          '严重肝功能不全者禁用',
          '心动过缓者慎用',
          '避免与葡萄柚汁同服',
          '突然停药可能导致症状加重',
          '用药期间避免驾驶'
        ],
        contraindications: ['严重肝功能不全', '心源性休克', '重度主动脉瓣狭窄'],
        sideEffects: [
          { name: '水肿', probability: '常见 (1-10%)' },
          { name: '头痛', probability: '常见 (1-10%)' },
          { name: '面部潮红', probability: '偶见 (0.1-1%)' },
          { name: '心悸', probability: '偶见 (0.1-1%)' }
        ]
      },
      {
        medicineName: '二甲双胍片',
        brand: '格华止',
        specification: '500mg × 20片',
        type: '双胍类降糖药',
        description: '二甲双胍是一种双胍类口服降糖药，主要通过减少肝脏葡萄糖产生和增加外周组织对葡萄糖的利用来降低血糖。',
        indications: [
          '2型糖尿病',
          '糖尿病前期',
          '多囊卵巢综合征',
          '妊娠期糖尿病'
        ],
        dosage: {
          adult: '初始剂量500mg，每日2-3次',
          elderly: '初始剂量500mg，每日1次，需缓慢加量',
          method: '随餐服用或餐后立即服用',
          timing: '每日分次服用'
        },
        warnings: [
          '严重肾功能不全者禁用',
          '避免与酒精同服',
          '碘造影检查前需停药',
          '乳酸酸中毒风险',
          '维生素B12缺乏风险'
        ],
        contraindications: ['严重肾功能不全', '急性心力衰竭', '严重感染', '代谢性酸中毒'],
        sideEffects: [
          { name: '胃肠道反应', probability: '常见 (1-10%)' },
          { name: '乳酸酸中毒', probability: '罕见 (<0.1%)' },
          { name: '维生素B12缺乏', probability: '偶见 (0.1-1%)' },
          { name: '体重下降', probability: '偶见 (0.1-1%)' }
        ]
      },
      {
        medicineName: '奥美拉唑胶囊',
        brand: '洛赛克',
        specification: '20mg × 14粒',
        type: '质子泵抑制剂',
        description: '奥美拉唑是一种质子泵抑制剂，通过抑制胃壁细胞的质子泵来减少胃酸分泌，用于治疗胃酸相关性疾病。',
        indications: [
          '胃溃疡',
          '十二指肠溃疡',
          '胃食管反流病',
          '卓-艾综合征',
          '应激性溃疡'
        ],
        dosage: {
          adult: '每日1-2粒，早晨服用',
          elderly: '常规剂量，无需调整',
          method: '整粒吞服，不可嚼碎',
          timing: '早餐前30分钟'
        },
        warnings: [
          '长期使用可能导致骨折风险',
          '可能引起维生素B12缺乏',
          '避免与氯吡格雷同服',
          '肝功能不全者需减量',
          '突然停药可能导致复发'
        ],
        contraindications: '对奥美拉唑过敏',
        sideEffects: [
          { name: '头痛', probability: '常见 (1-10%)' },
          { name: '腹泻', probability: '常见 (1-10%)' },
          { name: '恶心', probability: '偶见 (0.1-1%)' },
          { name: '皮疹', probability: '偶见 (0.1-1%)' }
        ]
      },
      {
        medicineName: '复方氨酚烷胺片',
        brand: '快克',
        specification: '12片',
        type: '复方感冒药',
        description: '复方氨酚烷胺片是治疗感冒症状的复方制剂，含有对乙酰氨基酚、盐酸金刚烷胺等成分，可缓解发热、头痛、鼻塞等症状。',
        indications: [
          '普通感冒',
          '流行性感冒',
          '发热',
          '头痛',
          '鼻塞流涕'
        ],
        dosage: {
          adult: '每次1片，每日2次',
          elderly: '每次1片，每日1-2次',
          method: '口服，温水送服',
          timing: '早晚饭后服用'
        },
        warnings: [
          '驾驶机动车期间禁用',
          '避免与其他感冒药同服',
          '严重肝肾功能不全者禁用',
          '孕妇及哺乳期妇女慎用',
          '服用期间避免饮酒'
        ],
        contraindications: ['严重肝肾功能不全', '孕妇及哺乳期妇女'],
        sideEffects: [
          { name: '嗜睡', probability: '常见 (1-10%)' },
          { name: '头晕', probability: '常见 (1-10%)' },
          { name: '乏力', probability: '偶见 (0.1-1%)' },
          { name: '恶心', probability: '偶见 (0.1-1%)' }
        ]
      },
      {
        medicineName: '维生素D3软胶囊',
        brand: '星鲨',
        specification: '400IU × 100粒',
        type: '维生素补充剂',
        description: '维生素D3是维持钙磷代谢平衡的重要维生素，有助于钙的吸收和骨质的形成，预防骨质疏松症。',
        indications: [
          '维生素D缺乏症',
          '骨质疏松症预防',
          '佝偻病预防',
          '儿童生长发育',
          '老年人骨健康'
        ],
        dosage: {
          adult: '每日1粒，400IU',
          elderly: '每日1-2粒，400-800IU',
          method: '口服，可随餐服用',
          timing: '每日固定时间'
        },
        warnings: [
          '高钙血症患者禁用',
          '肾功能不全者慎用',
          '避免过量服用',
          '定期监测血钙水平',
          '配合钙剂效果更佳'
        ],
        contraindications: ['高钙血症', '维生素D过多症'],
        sideEffects: [
          { name: '高钙血症', probability: '罕见 (<0.1%)' },
          { name: '恶心呕吐', probability: '罕见 (<0.1%)' },
          { name: '便秘', probability: '罕见 (<0.1%)' },
          { name: '食欲不振', probability: '罕见 (<0.1%)' }
        ]
      }
    ]
  },

  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  // 重新识别
  identifyAgain() {
    this.setData({
      imagePreview: '',
      recognitionResult: null
    })

    app.playVoice('请重新拍摄药物')
  },

  // 保存记录
  async saveRecord() {
    if (this.data.saving) return

    this.setData({ saving: true })

    try {
      const record = {
        id: Date.now().toString(),
        type: 'medicine',
        medicineName: this.data.recognitionResult.medicineName,
        image: this.data.recognitionResult.imagePath,
        result: this.data.recognitionResult,
        timestamp: new Date()
      }

      // 获取现有记录
      const records = wx.getStorageSync('identifyRecords') || []
      records.push(record)

      // 限制最多保存100条记录
      if (records.length > 100) {
        records.splice(0, records.length - 100)
      }

      wx.setStorageSync('identifyRecords', records)

      // 同步到云端
      await this.syncRecordToCloud(record)

      this.setData({ saving: false })

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

      app.playVoice('药物识别记录已保存')

      // 刷新历史记录
      this.loadRecentHistory()

    } catch (error) {
      console.error('保存记录失败:', error)
      this.setData({ saving: false })

      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    }
  },

  // 同步记录到云端
  async syncRecordToCloud(record) {
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
      await db.collection('identifyRecords').add({
        data: record
      })
    } catch (error) {
      console.warn('同步记录到云端失败:', error)
      // 云同步失败不影响本地功能，只记录警告
    }
  },

  // 设置用药提醒
  setReminder() {
    const medicine = this.data.recognitionResult

    wx.showModal({
      title: '设置用药提醒',
      content: `是否为【${medicine.medicineName}】设置用药提醒？\n\n用量：${medicine.dosage.adult}\n用法：${medicine.dosage.timing}`,
      confirmText: '设置提醒',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.createMedicineAlarm(medicine)
        }
      }
    })
  },

  // 创建药物闹钟
  createMedicineAlarm(medicine) {
    const alarm = {
      id: Date.now().toString(),
      type: 'medicine',
      title: `吃药：${medicine.medicineName}`,
      time: this.getDefaultAlarmTime(),
      enabled: true,
      medicineInfo: {
        name: medicine.medicineName,
        dosage: medicine.dosage.adult,
        method: medicine.dosage.method,
        timing: medicine.dosage.timing
      },
      repeatDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      createdAt: new Date()
    }

    // 获取现有闹钟
    const alarms = wx.getStorageSync('alarms') || []
    alarms.push(alarm)

    wx.setStorageSync('alarms', alarms)

    wx.showModal({
      title: '提醒设置成功',
      content: `已为【${medicine.medicineName}】设置每日用药提醒\n时间：${this.formatAlarmTime(alarm.time)}`,
      showCancel: false,
      success: () => {
        // 可以跳转到闹钟页面查看
        wx.switchTab({
          url: '/pages/alarms/alarms'
        })
      }
    })

    app.playVoice('用药提醒设置成功')
  },

  // 获取默认闹钟时间（当前时间+1小时）
  getDefaultAlarmTime() {
    const now = new Date()
    now.setHours(now.getHours() + 1)
    now.setMinutes(0)
    now.setSeconds(0)
    return now
  },

  // 格式化闹钟时间
  formatAlarmTime(time) {
    const date = new Date(time)
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  },

  // 快速识别（点击常用药物）
  quickIdentify(e) {
    const medicine = e.currentTarget.dataset.medicine

    wx.showModal({
      title: '快速识别',
      content: `是否识别【${medicine.name}】的详细信息？`,
      confirmText: '识别',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.showQuickMedicineResult(medicine)
        }
      }
    })

    app.playVoice(`正在识别${medicine.name}`)
  },

  // 显示快速药物结果
  async showQuickMedicineResult(medicine) {
    // 根据类型显示相应的模拟结果
    const mockResults = this.getMockMedicineResults()
    const result = mockResults.find(r => r.type.includes(medicine.type)) || mockResults[0]

    const recognitionResult = {
      ...result,
      confidence: 95, // 快速识别置信度设为95%
      imagePath: '/images/medicine-placeholder.jpg',
      timestamp: new Date()
    }

    this.setData({
      recognitionResult: recognitionResult,
      imagePreview: '/images/medicine-placeholder.jpg'
    })

    app.playVoice(`已显示${medicine.name}的详细信息`)
  },

  // 查看全部历史
  viewAllHistory() {
    wx.switchTab({
      url: '/pages/records/records'
    })

    app.playVoice('正在打开识别记录')
  },

  // 加载历史项目
  loadHistoryItem(e) {
    const item = e.currentTarget.dataset.item

    this.setData({
      imagePreview: item.image,
      recognitionResult: item.result
    })

    app.playVoice(`已加载${item.medicineName}的识别结果`)

    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },

  // 开始语音输入
  startVoiceInput() {
    wx.showModal({
      title: '语音识别',
      content: '请说出您想要识别的药物名称',
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
  async processVoiceInput(tempFilePath) {
    wx.showLoading({
      title: '识别中...',
      mask: true
    })

    try {
      // 模拟语音识别延迟
      await this.delay(2000)

      // 模拟语音识别结果
      const mockMedicines = [
        '阿司匹林', '氨氯地平', '二甲双胍', '奥美拉唑',
        '复方氨酚烷胺', '维生素D3', '降压药', '感冒药'
      ]

      const recognizedMedicine = mockMedicines[Math.floor(Math.random() * mockMedicines.length)]

      wx.hideLoading()

      wx.showModal({
        title: '语音识别结果',
        content: `识别到药物：${recognizedMedicine}\n\n是否显示详细信息？`,
        confirmText: '查看详情',
        cancelText: '重新识别',
        success: (res) => {
          if (res.confirm) {
            // 查找对应的结果数据
            const mockResults = this.getMockMedicineResults()
            const result = mockResults.find(r => r.medicineName.includes(recognizedMedicine)) || mockResults[0]

            const recognitionResult = {
              ...result,
              confidence: 85 + Math.floor(Math.random() * 10),
              imagePath: '/images/medicine-placeholder.jpg',
              timestamp: new Date()
            }

            this.setData({
              recognitionResult: recognitionResult,
              imagePreview: '/images/medicine-placeholder.jpg'
            })

            app.playVoice(`已显示${recognizedMedicine}的详细信息`)
          } else {
            this.startVoiceInput()
          }
        }
      })

    } catch (error) {
      wx.hideLoading()
      console.error('语音识别失败:', error)

      wx.showToast({
        title: '语音识别失败',
        icon: 'error'
      })
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadRecentHistory()
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
      title: '智能药物识别 - 让用药更安全',
      path: '/pages/medicine-identify/medicine-identify',
      imageUrl: '/images/share-medicine.jpg'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '智能药物识别 - 让用药更安全',
      query: '',
      imageUrl: '/images/share-medicine.jpg'
    }
  }
})