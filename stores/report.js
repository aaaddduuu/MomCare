import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 报告类型映射
export const REPORT_TYPES = [
  { key: 'blood_routine', label: '血常规', icon: '🩸', typeClass: 'type-blood' },
  { key: 'ultrasound', label: 'B 超', icon: '📊', typeClass: 'type-ultrasound' },
  { key: 'down_screening', label: '唐氏筛查', icon: '🧬', typeClass: 'type-screen' },
  { key: 'ogtt', label: '糖耐量', icon: '🍬', typeClass: 'type-sugar' },
  { key: 'urine', label: '尿常规', icon: '🔬', typeClass: 'type-urine' },
  { key: 'nipt', label: '无创 DNA', icon: '🧾', typeClass: 'type-screen' },
  { key: 'obstetric', label: '产科记录', icon: '🩺', typeClass: 'type-other' },
  { key: 'biochemical', label: '生化全套', icon: '🧪', typeClass: 'type-blood' },
  { key: 'other', label: '其他', icon: '📋', typeClass: 'type-other' }
]

// Tab 分组定义
export const TAB_DEFS = [
  { key: 'all', name: '全部' },
  { key: 'blood', name: '血液检查', types: ['blood_routine', 'biochemical', 'ogtt'] },
  { key: 'ultrasound', name: 'B 超', types: ['ultrasound'] },
  { key: 'screening', name: '筛查', types: ['down_screening', 'nipt'] },
  { key: 'urine', name: '尿常规', types: ['urine'] },
  { key: 'obstetric', name: '产科记录', types: ['obstetric'] },
  { key: 'other', name: '其他', types: ['other'] }
]

export function getTypeInfo(typeKey) {
  return REPORT_TYPES.find(t => t.key === typeKey) || REPORT_TYPES[REPORT_TYPES.length - 1]
}

// 将 AI 返回的中文报告类型映射为系统 key
function mapChineseTypeToKey(chineseType) {
  if (!chineseType) return ''
  const mapping = {
    '血常规': 'blood_routine',
    '尿常规': 'urine',
    'b超': 'ultrasound',
    'B超': 'ultrasound',
    '彩超': 'ultrasound',
    '唐筛': 'down_screening',
    '唐氏筛查': 'down_screening',
    '糖耐': 'ogtt',
    '糖耐量': 'ogtt',
    '葡萄糖耐量': 'ogtt',
    '无创dna': 'nipt',
    '无创DNA': 'nipt',
    '无创': 'nipt',
    '产科': 'obstetric',
    '产科记录': 'obstetric',
    '生化': 'biochemical',
    '生化全套': 'biochemical',
    '大排畸': 'ultrasound',
    '小排畸': 'ultrasound',
    '三维': 'ultrasound',
    '四维': 'ultrasound',
    '胎心监护': 'obstetric'
  }
  // 精确匹配
  if (mapping[chineseType]) return mapping[chineseType]
  // 模糊匹配
  const lower = chineseType.toLowerCase()
  for (const [cn, key] of Object.entries(mapping)) {
    if (lower.includes(cn.toLowerCase()) || cn.toLowerCase().includes(lower)) {
      return key
    }
  }
  return ''
}

export const useReportStore = defineStore('report', () => {
  // ── State ──
  const reports = ref([])          // 已归档报告列表
  const unarchivedReports = ref([]) // 未归档报告列表
  const currentFilter = ref({
    tab: 'all',
    keyword: '',
    weekRange: null,  // { min: 1, max: 40 }
    timeRange: null   // '1m' | '3m' | '6m' | null
  })
  const uploadQueue = ref([])       // 上传队列
  const aiStatusMap = ref({})       // { [reportId]: 'pending' | 'processing' | 'done' | 'failed' }
  const pendingUpload = ref(null)   // 待确认的上传数据 { fileUrls, localPaths, fileType }
  const batchItemUpdate = ref(null) // 批量页面条目更新信息 { itemIdx, reportType, dateText }
  const listNeedsRefresh = ref(false) // 列表需要刷新标志（AI解读后设置）

  // ── Getters ──

  // 按当前 Tab 过滤
  const filteredReports = computed(() => {
    let list = reports.value

    // Tab 过滤
    const tabDef = TAB_DEFS.find(t => t.key === currentFilter.value.tab)
    if (tabDef && tabDef.types) {
      list = list.filter(r => tabDef.types.includes(r.report_type))
    }

    // 关键词过滤
    const kw = (currentFilter.value.keyword || '').trim().toLowerCase()
    if (kw) {
      list = list.filter(r => {
        const typeInfo = getTypeInfo(r.report_type)
        const typeName = typeInfo ? typeInfo.label : ''
        const date = r.report_date || ''
        const week = r.week_of_pregnancy != null ? String(r.week_of_pregnancy) : ''
        return typeName.toLowerCase().includes(kw) ||
               date.includes(kw) ||
               date.replace(/-/g, '/').includes(kw) ||
               week.includes(kw)
      })
    }

    // 孕周范围过滤
    const wr = currentFilter.value.weekRange
    if (wr) {
      list = list.filter(r => {
        const w = Number(r.week_of_pregnancy)
        return !isNaN(w) && w >= wr.min && w <= wr.max
      })
    }

    // 时间范围过滤
    const tr = currentFilter.value.timeRange
    if (tr) {
      const now = new Date()
      let months
      if (tr === '1m') months = 1
      else if (tr === '3m') months = 3
      else if (tr === '6m') months = 6
      if (months) {
        const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate())
        list = list.filter(r => {
          const d = new Date(r.report_date)
          return d >= cutoff
        })
      }
    }

    return list
  })

  // 按月分组
  const groupedReports = computed(() => {
    const groups = {}
    const sorted = [...filteredReports.value].sort((a, b) => {
      const da = a.report_date || a.create_time || ''
      const db = b.report_date || b.create_time || ''
      return db.localeCompare(da)
    })
    for (const r of sorted) {
      const dateStr = r.report_date || ''
      let monthKey = ''
      if (dateStr) {
        const d = new Date(dateStr)
        if (!isNaN(d.getTime())) {
          monthKey = `${d.getFullYear()} 年 ${d.getMonth() + 1} 月`
        }
      }
      if (!monthKey) monthKey = '未知日期'
      if (!groups[monthKey]) groups[monthKey] = []
      groups[monthKey].push(r)
    }
    return Object.entries(groups).map(([month, reports]) => ({ month, reports }))
  })

  // Tab 角标数量
  const tabCounts = computed(() => {
    return TAB_DEFS.map(tab => {
      if (tab.key === 'all') {
        const count = reports.value.length
        return count > 99 ? '99+' : count
      }
      const count = reports.value.filter(r => tab.types.includes(r.report_type)).length
      return count > 99 ? '99+' : count
    })
  })

  // 筛选条件是否激活
  const hasActiveFilter = computed(() => {
    return currentFilter.value.weekRange != null || currentFilter.value.timeRange != null
  })

  // 筛选条件数量
  const activeFilterCount = computed(() => {
    let count = 0
    if (currentFilter.value.weekRange) count++
    if (currentFilter.value.timeRange) count++
    return count
  })

  // ── Actions ──

  // 查询已归档报告
  async function fetchReports() {
    try {
      const db = uniCloud.database()
      const res = await db.collection('momcare_reports')
        .where({ archive_status: 'archived' })
        .orderBy('create_time', 'desc')
        .get()
      if (res.result && res.result.data) {
        reports.value = res.result.data
      }
    } catch (e) {
      console.error('fetchReports error:', e)
      // 如果是配额错误，保留现有数据
      if (e.errMsg && e.errMsg.includes('resource exhausted')) {
        console.warn('Database quota exhausted, keeping existing data')
        // 不清空 reports，保留现有数据供用户查看
        throw e // 继续抛出错误以便页面处理
      }
      // 其他错误也保留现有数据
      console.warn('Fetch failed, keeping existing data')
      throw e
    }
  }

  // 查询未归档报告
  async function fetchUnarchivedReports() {
    try {
      const db = uniCloud.database()
      const res = await db.collection('momcare_reports')
        .where({ archive_status: 'unarchived' })
        .orderBy('create_time', 'desc')
        .get()
      if (res.result && res.result.data) {
        unarchivedReports.value = res.result.data
      }
    } catch (e) {
      console.error('fetchUnarchivedReports error:', e)
      // 如果是配额错误，保留现有数据
      if (e.errMsg && e.errMsg.includes('resource exhausted')) {
        console.warn('Database quota exhausted, keeping existing data')
        throw e
      }
      console.warn('Fetch failed, keeping existing data')
      throw e
    }
  }

  // 创建报告记录
  async function createReport(data) {
    if (!data.report_type || !data.report_date) {
      uni.showToast({ title: '请选择报告类型和日期', icon: 'none' })
      return null
    }
    try {
      const record = {
        user_id: 'default_user',
        report_type: data.report_type,
        report_name: data.report_name || getTypeInfo(data.report_type).label,
        file_urls: data.file_urls || [],
        file_type: data.file_type || 'image',
        report_date: data.report_date,
        week_of_pregnancy: data.week_of_pregnancy || null,
        hospital: data.hospital || '',
        notes: data.notes || '',
        archive_status: data.archive_status || 'archived',
        ocr_status: 'pending',
        ocr_text: '',
        ai_status: 'pending',
        ai_result: {},
        abnormal_indicators: [],
        is_abnormal: false,
        create_time: Date.now(),
        ocr_confidence: null,
        ai_type_guess: data.ai_type_guess || '',
        ai_type_confidence: data.ai_type_confidence || null
      }
      const db = uniCloud.database()
      const res = await db.collection('momcare_reports').add(record)
      const newId = res.result && (res.result.id || res.result._id)
      if (newId) {
        // 刷新列表（失败不影响返回结果）
        try {
          if (record.archive_status === 'archived') {
            await fetchReports()
          } else {
            await fetchUnarchivedReports()
          }
        } catch (e) {
          console.warn('refresh after create failed:', e)
        }
        return newId
      }
      return null
    } catch (e) {
      console.error('createReport error:', e)
      return null
    }
  }

  // 更新报告信息
  async function updateReport(reportId, data) {
    try {
      const db = uniCloud.database()
      const updateData = {}
      const allowedFields = ['report_type', 'report_name', 'report_date', 'week_of_pregnancy', 'hospital', 'notes', 'ai_type_guess', 'ai_type_confidence', 'archive_status']
      for (const key of allowedFields) {
        if (data[key] !== undefined) updateData[key] = data[key]
      }
      await db.collection('momcare_reports').doc(reportId).update(updateData)
      // 刷新列表
      await fetchReports()
      await fetchUnarchivedReports()
      return true
    } catch (e) {
      console.error('updateReport error:', e)
      return false
    }
  }

  // 删除报告
  async function deleteReport(reportId) {
    try {
      const db = uniCloud.database()
      // 先获取报告以删除关联文件
      const res = await db.collection('momcare_reports').doc(reportId).get()
      const report = res.result && res.result.data && res.result.data[0]
      if (report && report.file_urls && report.file_urls.length > 0) {
        // 尝试删除存储文件
        for (const fileUrl of report.file_urls) {
          try {
            await uniCloud.deleteFile({ fileList: [fileUrl] })
          } catch (e) {
            console.warn('deleteFile warning:', e)
          }
        }
      }
      await db.collection('momcare_reports').doc(reportId).remove()
      // 刷新列表
      reports.value = reports.value.filter(r => r._id !== reportId)
      unarchivedReports.value = unarchivedReports.value.filter(r => r._id !== reportId)
      return true
    } catch (e) {
      console.error('deleteReport error:', e)
      return false
    }
  }

  // 将未归档报告标记为已归档
  async function archiveReport(reportId) {
    try {
      const db = uniCloud.database()
      await db.collection('momcare_reports').doc(reportId).update({
        archive_status: 'archived'
      })
      unarchivedReports.value = unarchivedReports.value.filter(r => r._id !== reportId)
      await fetchReports()
      return true
    } catch (e) {
      console.error('archiveReport error:', e)
      return false
    }
  }

  // 批量归档
  async function batchArchive(reportIds) {
    try {
      const db = uniCloud.database()
      const tasks = reportIds.map(id =>
        db.collection('momcare_reports').doc(id).update({ archive_status: 'archived' })
      )
      await Promise.all(tasks)
      unarchivedReports.value = unarchivedReports.value.filter(r => !reportIds.includes(r._id))
      await fetchReports()
      return true
    } catch (e) {
      console.error('batchArchive error:', e)
      return false
    }
  }

  // 触发 AI 解读流水线
  async function triggerAiPipeline(reportId) {
    try {
      const db = uniCloud.database()
      // 1. 获取报告
      const res = await db.collection('momcare_reports').doc(reportId).get()
      const report = res.result && res.result.data && res.result.data[0]
      if (!report) return false

      // 2. 触发 OCR
      aiStatusMap.value[reportId] = 'processing'
      await db.collection('momcare_reports').doc(reportId).update({ ai_status: 'processing' })

      const fileUrl = report.file_urls && report.file_urls[0]
      if (!fileUrl) {
        aiStatusMap.value[reportId] = 'failed'
        await db.collection('momcare_reports').doc(reportId).update({ ai_status: 'failed' })
        return false
      }

      // 3. 调用 OCR 云函数
      const ocrRes = await uniCloud.callFunction({
        name: 'extractReportOCR',
        data: { fileID: fileUrl }
      })

      let ocrText = ''
      const ocrResult = ocrRes.result
      if (ocrResult && ocrResult.errCode === 0 && ocrResult.data) {
        ocrText = ocrResult.data.text || ''
        await db.collection('momcare_reports').doc(reportId).update({
          ocr_text: ocrText,
          ocr_status: 'done'
        })
      } else {
        // OCR 失败
        const errMsg = (ocrResult && ocrResult.errMsg) || 'OCR 识别失败'
        console.error('OCR failed:', errMsg)
        aiStatusMap.value[reportId] = 'failed'
        await db.collection('momcare_reports').doc(reportId).update({ ai_status: 'failed' })
        return false
      }

      // 4. 调用 AI 解读云函数
      const aiRes = await uniCloud.callFunction({
        name: 'analyzeReportAI',
        data: { ocrText, modelChoice: 'deepseek' }
      })

      const aiResult = aiRes.result
      if (aiResult && aiResult.errCode === 0 && aiResult.data) {
        const data = aiResult.data
        const abnormalIndicators = data.abnormal_indicators || []
        // 将 AI 识别的中文类型映射到系统 key
        const guessedType = mapChineseTypeToKey(data.report_type)
        await db.collection('momcare_reports').doc(reportId).update({
          ai_status: 'done',
          ai_result: data,
          abnormal_indicators: abnormalIndicators,
          is_abnormal: abnormalIndicators.length > 0,
          ai_type_guess: data.report_type || '',
          ai_type_confidence: null,
          llm_used: data.llm_used || 'deepseek',
          // 自动分类：如果 AI 识别到类型且当前是 other，则更新
          ...(guessedType && report.report_type === 'other' ? {
            report_type: guessedType,
            report_name: getTypeInfo(guessedType).label
          } : {})
        })
        aiStatusMap.value[reportId] = 'done'
        listNeedsRefresh.value = true // 设置刷新标志
        return true
      } else {
        const errMsg = (aiResult && aiResult.errMsg) || 'AI 解读失败'
        console.error('AI analysis failed:', errMsg)
        aiStatusMap.value[reportId] = 'failed'
        await db.collection('momcare_reports').doc(reportId).update({ ai_status: 'failed' })
        return false
      }
    } catch (e) {
      console.error('triggerAiPipeline error:', e)
      aiStatusMap.value[reportId] = 'failed'
      try {
        const db = uniCloud.database()
        await db.collection('momcare_reports').doc(reportId).update({ ai_status: 'failed' })
      } catch (e2) { /* ignore */ }
      return false
    }
  }

  // 上传文件到 uniCloud 存储
  async function uploadFile(filePath) {
    try {
      const res = await uniCloud.uploadFile({
        filePath,
        cloudPath: `reports/${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      })
      return res.fileID
    } catch (e) {
      console.error('uploadFile error:', e)
      // 加入重试队列
      uploadQueue.value.push({ filePath, status: 'pending', retries: 0 })
      return null
    }
  }

  // 重试上传队列
  async function retryUploadQueue() {
    const pending = uploadQueue.value.filter(u => u.status === 'pending' && u.retries < 3)
    for (const item of pending) {
      item.retries++
      const fileID = await uploadFile(item.filePath)
      if (fileID) {
        uploadQueue.value = uploadQueue.value.filter(u => u !== item)
      }
    }
  }

  // 设置筛选条件
  function setFilter(filter) {
    currentFilter.value = { ...currentFilter.value, ...filter }
  }

  // 重置筛选条件
  function resetFilter() {
    currentFilter.value = {
      tab: currentFilter.value.tab,
      keyword: '',
      weekRange: null,
      timeRange: null
    }
  }

  return {
    // state
    reports,
    unarchivedReports,
    currentFilter,
    uploadQueue,
    aiStatusMap,
    pendingUpload,
    batchItemUpdate,
    listNeedsRefresh,
    // getters
    filteredReports,
    groupedReports,
    tabCounts,
    hasActiveFilter,
    activeFilterCount,
    // actions
    fetchReports,
    fetchUnarchivedReports,
    createReport,
    updateReport,
    deleteReport,
    archiveReport,
    batchArchive,
    triggerAiPipeline,
    uploadFile,
    retryUploadQueue,
    setFilter,
    resetFilter
  }
})
