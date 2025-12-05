// pages/food-identify/food-identify.js
const app = getApp()

Page({
  data: {
    imagePreview: '',
    flashOn: false,
    identifying: false,
    saving: false,
    recognitionResult: null,
    recentHistory: []
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
      const foodRecords = records.filter(record => record.type === 'food')

      // 获取最近的5条记录
      const recentRecords = foodRecords
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
        that.identifyFood(tempFilePath)
      },
      fail: (err) => {
        console.error('拍照失败:', err)
        wx.showToast({
          title: '拍照失败',
          icon: 'error'
        })
      }
    })

    app.playVoice('正在拍照')
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
        that.identifyFood(tempFilePath)
      },
      fail: (err) => {
        console.error('选择图片失败:', err)
        wx.showToast({
          title: '选择图片失败',
          icon: 'error'
        })
      }
    })

    app.playVoice('正在选择图片')
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

  // 识别菜品（模拟AI识别）
  async identifyFood(imagePath) {
    this.setData({ identifying: true })

    try {
      // 模拟网络延迟
      await this.delay(2000)

      // 模拟AI识别结果
      const mockResults = this.getMockFoodResults()
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
      app.playVoice(`识别成功：${result.dishName}，置信度${confidence}%`)

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

  // 获取模拟菜品识别结果
  getMockFoodResults() {
    return [
      {
        dishName: '宫保鸡丁',
        description: '经典川菜，鸡肉嫩滑，花生香脆，口感丰富，营养均衡。',
        nutrition: {
          calories: '180',
          protein: '18.5',
          carbs: '12.3',
          fat: '8.7'
        },
        suggestions: [
          '蛋白质含量丰富，适合补充体力',
          '花生富含不饱和脂肪酸，有益心血管健康',
          '建议搭配蔬菜一起食用，营养更均衡',
          '辣度适中，有助于促进食欲'
        ],
        allergens: ['花生', '辣椒']
      },
      {
        dishName: '西红柿炒鸡蛋',
        description: '家常菜代表，色彩鲜艳，口感酸甜，老少皆宜，营养丰富。',
        nutrition: {
          calories: '120',
          protein: '12.8',
          carbs: '8.5',
          fat: '7.2'
        },
        suggestions: [
          '富含维生素和蛋白质，营养全面',
          '西红柿含番茄红素，抗氧化效果好',
          '热量适中，适合减重人群食用',
          '制作简单，容易消化吸收'
        ],
        allergens: []
      },
      {
        dishName: '红烧肉',
        description: '传统名菜，色泽红亮，肥而不腻，入口即化，深受喜爱。',
        nutrition: {
          calories: '320',
          protein: '15.2',
          carbs: '8.9',
          fat: '28.3'
        },
        suggestions: [
          '热量较高，建议适量食用',
          '富含蛋白质，有助于肌肉生长',
          '含铁量高，有助于预防贫血',
          '建议搭配蔬菜，增加膳食纤维'
        ],
        allergens: []
      },
      {
        dishName: '清蒸鱼',
        description: '健康烹饪，保持鱼肉鲜美，口感嫩滑，营养价值高。',
        nutrition: {
          calories: '95',
          protein: '20.1',
          carbs: '1.2',
          fat: '2.3'
        },
        suggestions: [
          '优质蛋白质来源，脂肪含量低',
          '富含Omega-3脂肪酸，有益大脑健康',
          '易消化，适合老年人食用',
          '有助降低心血管疾病风险'
        ],
        allergens: ['鱼类']
      },
      {
        dishName: '麻婆豆腐',
        description: '四川传统名菜，麻辣鲜香，豆腐嫩滑，开胃下饭。',
        nutrition: {
          calories: '140',
          protein: '11.5',
          carbs: '10.8',
          fat: '8.9'
        },
        suggestions: [
          '豆腐富含植物蛋白，营养价值高',
          '辣椒有助于促进血液循环',
          '热量适中，适合日常食用',
          '富含钙质，有助骨骼健康'
        ],
        allergens: ['大豆', '辣椒', '花椒']
      },
      {
        dishName: '蒸蛋羹',
        description: '口感嫩滑，营养丰富，制作简单，老少皆宜的家常菜。',
        nutrition: {
          calories: '90',
          protein: '11.2',
          carbs: '3.5',
          fat: '4.8'
        },
        suggestions: [
          '易消化吸收，适合肠胃功能较弱者',
          '富含优质蛋白质，有助于肌肉生长',
          '制作过程少油，相对健康',
          '适合老年人补充营养'
        ],
        allergens: ['鸡蛋']
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

    app.playVoice('请重新拍照或选择图片')
  },

  // 保存记录
  async saveRecord() {
    if (this.data.saving) return

    this.setData({ saving: true })

    try {
      const record = {
        id: Date.now().toString(),
        type: 'food',
        dishName: this.data.recognitionResult.dishName,
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

      app.playVoice('识别记录已保存')

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

  // 分享结果
  shareResult() {
    const { dishName, nutrition, suggestions } = this.data.recognitionResult

    const shareText = `我刚刚识别了【${dishName}】\n\n` +
                     `营养信息（每100g）：\n` +
                     `热量：${nutrition.calories}千卡\n` +
                     `蛋白质：${nutrition.protein}g\n` +
                     `碳水：${nutrition.carbs}g\n` +
                     `脂肪：${nutrition.fat}g\n\n` +
                     `健康建议：\n${suggestions.slice(0, 2).join('，')}`

    wx.setClipboardData({
      data: shareText,
      success: () => {
        wx.showModal({
          title: '分享成功',
          content: '识别结果已复制到剪贴板，可以分享给朋友了',
          showCancel: false
        })
      }
    })

    app.playVoice('识别结果已复制')
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

    app.playVoice(`已加载${item.dishName}的识别结果`)

    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },

  // 开始语音输入
  startVoiceInput() {
    wx.showModal({
      title: '语音识别',
      content: '请说出您想要识别的菜品名称',
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
      const mockDishes = [
        '宫保鸡丁', '西红柿炒鸡蛋', '红烧肉', '清蒸鱼',
        '麻婆豆腐', '蒸蛋羹', '青椒肉丝', '糖醋里脊'
      ]

      const recognizedDish = mockDishes[Math.floor(Math.random() * mockDishes.length)]

      wx.hideLoading()

      wx.showModal({
        title: '语音识别结果',
        content: `识别到菜品：${recognizedDish}\n\n是否显示详细信息？`,
        confirmText: '查看详情',
        cancelText: '重新识别',
        success: (res) => {
          if (res.confirm) {
            // 查找对应的结果数据
            const mockResults = this.getMockFoodResults()
            const result = mockResults.find(r => r.dishName === recognizedDish) || mockResults[0]

            const recognitionResult = {
              ...result,
              confidence: 85 + Math.floor(Math.random() * 10),
              imagePath: '/images/food-placeholder.jpg', // 使用默认图片
              timestamp: new Date()
            }

            this.setData({
              recognitionResult: recognitionResult
            })

            app.playVoice(`已显示${recognizedDish}的详细信息`)
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
      title: '智能菜品识别 - 让饮食更健康',
      path: '/pages/food-identify/food-identify',
      imageUrl: '/images/share-food.jpg'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '智能菜品识别 - 让饮食更健康',
      query: '',
      imageUrl: '/images/share-food.jpg'
    }
  }
})