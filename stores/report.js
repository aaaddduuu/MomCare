import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useHealthStore } from '@/stores/health.js'
import { request, API_BASE, getToken, isLoggedIn as isAuthed } from '@/utils/api.js'

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
  if (mapping[chineseType]) return mapping[chineseType]
  const lower = chineseType.toLowerCase()
  for (const [cn, key] of Object.entries(mapping)) {
    if (lower.includes(cn.toLowerCase()) || cn.toLowerCase().includes(lower)) {
      return key
    }
  }
  return ''
}

// ── 本地存储辅助 ──
const STORAGE_KEY = 'YUNTU_REPORTS_DATA'

function _loadStorage() {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    console.error('_loadStorage error:', e)
    return null
  }
}

function _saveStorage(data) {
  try {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('_saveStorage error:', e)
  }
}

function _generateId() {
  return 'rpt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
}

export const useReportStore = defineStore('report', () => {
  let healthStore = null

  // ── State ──
  const reports = ref([])
  const unarchivedReports = ref([])
  const currentFilter = ref({
    tab: 'all',
    keyword: '',
    weekRange: null,
    timeRange: null
  })
  const uploadQueue = ref([])
  const aiStatusMap = ref({})
  const pendingUpload = ref(null)
  const batchItemUpdate = ref(null)
  const listNeedsRefresh = ref(false)

  // ── Persist helper ──
  function _persist() {
    _saveStorage({
      reports: reports.value,
      unarchivedReports: unarchivedReports.value
    })
  }

  // ── Getters ──

  const filteredReports = computed(() => {
    let list = reports.value

    const tabDef = TAB_DEFS.find(t => t.key === currentFilter.value.tab)
    if (tabDef && tabDef.types) {
      list = list.filter(r => tabDef.types.includes(r.report_type))
    }

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

    const wr = currentFilter.value.weekRange
    if (wr) {
      list = list.filter(r => {
        const w = Number(r.week_of_pregnancy)
        return !isNaN(w) && w >= wr.min && w <= wr.max
      })
    }

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

  const hasActiveFilter = computed(() => {
    return currentFilter.value.weekRange != null || currentFilter.value.timeRange != null
  })

  const activeFilterCount = computed(() => {
    let count = 0
    if (currentFilter.value.weekRange) count++
    if (currentFilter.value.timeRange) count++
    return count
  })

  // ── Actions ──

  function getHealthStore() {
    if (!healthStore) {
      healthStore = useHealthStore()
    }
    return healthStore
  }

  // ── Cloud Sync ──

  // Fetch all reports from server and replace local state (cloud is source of truth)
  async function syncReportsFromCloud() {
    if (!isAuthed()) return false

    try {
      const res = await request({
        url: '/api/reports',
        method: 'GET',
      })
      if (res.statusCode === 200 && res.data?.code === 0) {
        const serverReports = res.data.data || []
        reports.value = serverReports.filter(r => r.archive_status === 'archived')
        unarchivedReports.value = serverReports.filter(r => r.archive_status !== 'archived')
        _persist()
        return true
      }
    } catch (e) {
      console.error('syncReportsFromCloud failed:', e)
    }
    return false
  }

  // 查询已归档报告
  async function fetchReports() {
    const data = _loadStorage()
    if (data && data.reports) {
      reports.value = data.reports.map(r => ({
        ...r,
        file_urls: Array.isArray(r.file_urls) ? r.file_urls : (r.file_urls ? [r.file_urls] : [])
      }))
    }
  }

  // 查询未归档报告
  async function fetchUnarchivedReports() {
    const data = _loadStorage()
    if (data && data.unarchivedReports) {
      unarchivedReports.value = data.unarchivedReports.map(r => ({
        ...r,
        file_urls: Array.isArray(r.file_urls) ? r.file_urls : (r.file_urls ? [r.file_urls] : [])
      }))
    }
  }

  // 创建报告记录（上传图片到服务端，同时本地建条目）
  async function createReport(data) {
    if (!data.report_type || !data.report_date) {
      uni.showToast({ title: '请选择报告类型和日期', icon: 'none' })
      return null
    }

    // If the caller already has a server-issued report_id (e.g. from direct upload flow), use it
    if (data._serverReportId && data._serverImageUrl) {
      const record = {
        _id: data._serverReportId,
        report_type: data.report_type,
        report_name: data.report_name || getTypeInfo(data.report_type).label,
        file_urls: [data._serverImageUrl],
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

      // Write-through: update D1 with metadata
      if (isAuthed()) {
        try {
          const res = await request({
            url: `/api/reports/${data._serverReportId}`,
            method: 'PUT',
            data: {
              report_type: data.report_type,
              report_name: record.report_name,
              report_date: data.report_date,
              week_of_pregnancy: data.week_of_pregnancy || null,
              hospital: data.hospital || '',
              notes: data.notes || '',
              archive_status: data.archive_status || 'archived',
            },
          })
          if (res.statusCode !== 200 || res.data?.code !== 0) {
            throw new Error(res.data?.msg || '创建报告失败')
          }
        } catch (e) {
          console.error('createReport: cloud write-through failed', e)
          throw e
        }
      }

      if (record.archive_status === 'archived') {
        reports.value.unshift(record)
      } else {
        unarchivedReports.value.unshift(record)
      }
      _persist()
      listNeedsRefresh.value = true
      return data._serverReportId
    }

    // Fallback: local-only record (no image to upload)
    const newId = _generateId()
    const record = {
      _id: newId,
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

    if (record.archive_status === 'archived') {
      reports.value.unshift(record)
    } else {
      unarchivedReports.value.unshift(record)
    }
    _persist()
    listNeedsRefresh.value = true
    return newId
  }

  // 更新报告信息 (write-through: API first, then local)
  async function updateReport(reportId, data) {
    const allowedFields = ['report_type', 'report_name', 'report_date', 'week_of_pregnancy', 'hospital', 'notes', 'ai_type_guess', 'ai_type_confidence', 'archive_status']
    const updateData = {}
    for (const key of allowedFields) {
      if (data[key] !== undefined) updateData[key] = data[key]
    }

    // Write-through: call API first
    if (isAuthed()) {
      try {
        const res = await request({
          url: `/api/reports/${reportId}`,
          method: 'PUT',
          data: updateData,
        })
        if (res.statusCode !== 200 || res.data?.code !== 0) {
          throw new Error(res.data?.msg || '更新失败')
        }
      } catch (e) {
        console.error('updateReport: cloud write-through failed', e)
        throw e
      }
    }

    // Update local state
    const idx1 = reports.value.findIndex(r => r._id === reportId)
    if (idx1 >= 0) {
      reports.value[idx1] = { ...reports.value[idx1], ...updateData }
    }

    const idx2 = unarchivedReports.value.findIndex(r => r._id === reportId)
    if (idx2 >= 0) {
      unarchivedReports.value[idx2] = { ...unarchivedReports.value[idx2], ...updateData }
    }

    _persist()
    return true
  }

  // 删除报告 (write-through: API first, then local)
  async function deleteReport(reportId) {
    // Write-through: call API first
    if (isAuthed()) {
      try {
        const res = await request({
          url: `/api/reports/${reportId}`,
          method: 'DELETE',
        })
        if (res.statusCode !== 200 || res.data?.code !== 0) {
          throw new Error(res.data?.msg || '删除失败')
        }
      } catch (e) {
        console.error('deleteReport: cloud write-through failed', e)
        throw e
      }
    }

    reports.value = reports.value.filter(r => r._id !== reportId)
    unarchivedReports.value = unarchivedReports.value.filter(r => r._id !== reportId)
    _persist()
    return true
  }

  // 将未归档报告标记为已归档 (write-through)
  async function archiveReport(reportId) {
    const idx = unarchivedReports.value.findIndex(r => r._id === reportId)
    if (idx >= 0) {
      const report = { ...unarchivedReports.value[idx], archive_status: 'archived' }

      // Write-through: update cloud
      if (isAuthed()) {
        try {
          const res = await request({
            url: `/api/reports/${reportId}`,
            method: 'PUT',
            data: { archive_status: 'archived' },
          })
          if (res.statusCode !== 200 || res.data?.code !== 0) {
            throw new Error(res.data?.msg || '归档失败')
          }
        } catch (e) {
          console.error('archiveReport: cloud write-through failed', e)
          throw e
        }
      }

      unarchivedReports.value.splice(idx, 1)
      reports.value.unshift(report)
    }
    _persist()
    return true
  }

  // 批量归档 (write-through)
  async function batchArchive(reportIds) {
    const errors = []
    for (const id of reportIds) {
      const idx = unarchivedReports.value.findIndex(r => r._id === id)
      if (idx >= 0) {
        const report = { ...unarchivedReports.value[idx], archive_status: 'archived' }

        if (isAuthed()) {
          try {
            const res = await request({
              url: `/api/reports/${id}`,
              method: 'PUT',
              data: { archive_status: 'archived' },
            })
            if (res.statusCode !== 200 || res.data?.code !== 0) {
              throw new Error(res.data?.msg || '归档失败')
            }
          } catch (e) {
            console.error('batchArchive: cloud write-through failed for', id, e)
            errors.push({ id, error: e.message || e })
            continue
          }
        }

        unarchivedReports.value.splice(idx, 1)
        reports.value.unshift(report)
      }
    }
    _persist()
    if (errors.length > 0) {
      throw new Error(`部分归档失败：${errors.length} 份`)
    }
    return true
  }

  // Helper: compress & convert local image path to Base64 (raw, no data-URI prefix)
  async function _imageToBase64(filePath) {
    // 1. compress - 降低质量加快处理
    let compressed = filePath
    try {
      const res = await new Promise((resolve, reject) => {
        uni.compressImage({
          src: filePath,
          quality: 20,
          width: '80%',
          success: resolve,
          fail: reject,
        })
      })
      compressed = res.tempFilePath
    } catch {
      // compression failed, use original
    }

    // 2. read as base64 — platform-specific
    // #ifdef H5
    const blob = await fetch(compressed).then(r => r.blob())
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
    return dataUrl.replace(/^data:image\/[a-zA-Z+]+;base64,/, '')
    // #endif

    // #ifndef H5
    return new Promise((resolve, reject) => {
      uni.getFileSystemManager().readFile({
        filePath: compressed,
        encoding: 'base64',
        success: (res) => resolve(res.data),
        fail: reject,
      })
    })
    // #endif
  }

  // Find a report across both arrays
  function _findReport(id) {
    return reports.value.find(r => r._id === id) ||
           unarchivedReports.value.find(r => r._id === id)
  }

  // Update report in whichever array it lives in
  function _updateReportField(id, updates) {
    const idx1 = reports.value.findIndex(r => r._id === id)
    if (idx1 >= 0) {
      reports.value[idx1] = { ...reports.value[idx1], ...updates }
    }
    const idx2 = unarchivedReports.value.findIndex(r => r._id === id)
    if (idx2 >= 0) {
      unarchivedReports.value[idx2] = { ...unarchivedReports.value[idx2], ...updates }
    }
    _persist()
  }

  // 触发 AI 解读流水线 — 同步处理，优化超时
  async function triggerAiPipeline(reportId) {
    const report = _findReport(reportId)
    if (!report) {
      uni.showToast({ title: '报告不存在', icon: 'none' })
      return false
    }
    const health = getHealthStore()
    if (!health.canUseAiInterpret()) {
      uni.showToast({ title: '今日 5 次 AI 解读已用完，明天再来吧', icon: 'none', duration: 3000 })
      return false
    }

    const previousAiStatus = report.ai_status || 'pending'
    const previousOcrStatus = report.ocr_status || 'pending'
    _updateReportField(reportId, { ai_status: 'processing', ocr_status: 'processing' })

    try {
      uni.showLoading({ title: 'AI 正在分析…', mask: true })

      const res = await request({
        url: '/api/analyze-report',
        method: 'POST',
        data: { report_id: reportId },
        timeout: 120000,
      })

      uni.hideLoading()

      if (res.statusCode !== 200 || res.data.code !== 0) {
        if (res.statusCode === 429 || res.data?.code === 429 || /次数|配额|quota|limit/i.test(res.data?.msg || '')) {
          _updateReportField(reportId, { ai_status: previousAiStatus, ocr_status: previousOcrStatus })
          uni.showToast({ title: res.data?.msg || '今日解读次数已用完，明天再来吧', icon: 'none', duration: 3000 })
          return false
        }
        throw new Error(res.data?.msg || 'AI 解读请求失败')
      }

      const aiData = res.data.data

      _updateReportField(reportId, {
        file_urls: [aiData.image_url || report.file_urls[0]],
        ai_status: 'done',
        ocr_status: 'done',
        ocr_text: aiData.ocr_text || '',
        ai_result: aiData,
        abnormal_indicators: aiData.abnormal_indicators || [],
        is_abnormal: (aiData.abnormal_indicators || []).some(i => i.severity === 'danger' || i.severity === 'warning'),
        ai_type_guess: aiData.report_type || '',
      })
      if (aiData.quota) {
        health.updateAiInterpretQuota(aiData.quota)
      } else {
        await health.consumeAiInterpretQuota()
      }

      uni.showToast({ title: '解读完成', icon: 'success' })
      return true
    } catch (err) {
      console.error('AI pipeline failed:', err)
      uni.hideLoading()
      const errMsg = err?.data?.msg || err?.message || ''
      if (err?.statusCode === 429 || err?.data?.code === 429 || /次数|配额|quota|limit/i.test(errMsg)) {
        _updateReportField(reportId, { ai_status: previousAiStatus, ocr_status: previousOcrStatus })
        uni.showToast({ title: errMsg || '今日解读次数已用完，明天再来吧', icon: 'none', duration: 3000 })
        return false
      }
      _updateReportField(reportId, { ai_status: 'failed', ocr_status: 'failed' })

      if (err.errMsg && err.errMsg.includes('timeout')) {
        uni.showToast({ title: 'AI 解读超时，请稍后重试', icon: 'none', duration: 3000 })
      } else {
        uni.showToast({ title: err.message || 'AI 解读失败', icon: 'none' })
      }
      return false
    }
  }

  // 上传文件（本地模式直接返回路径）
  async function uploadFile(filePath) {
    return filePath
  }

  // 上传图片到服务端并创建报告记录（解耦后的新入口）
  async function uploadAndCreateReport(data) {
    if (!data.report_type || !data.report_date) {
      uni.showToast({ title: '请选择报告类型和日期', icon: 'none' })
      return null
    }

    const localPath = (data.localPaths && data.localPaths[0]) || (data.file_urls && data.file_urls[0])
    if (!localPath) {
      uni.showToast({ title: '请选择报告图片', icon: 'none' })
      return null
    }

    try {
      uni.showLoading({ title: '上传中…' })

      // Compress image before upload
      let uploadPath = localPath
      try {
        const compressRes = await new Promise((resolve, reject) => {
          uni.compressImage({
            src: localPath,
            quality: 20,
            success: resolve,
            fail: reject,
          })
        })
        uploadPath = compressRes.tempFilePath
      } catch {
        // compression failed, use original
      }

      const token = getToken()
      const uploadRes = await new Promise((resolve, reject) => {
        uni.uploadFile({
          url: API_BASE + '/api/reports/upload',
          filePath: uploadPath,
          name: 'file',
          header: {
            Authorization: token ? `Bearer ${token}` : '',
          },
          formData: {
            report_type: data.report_type,
            report_name: data.report_name || getTypeInfo(data.report_type).label,
            report_date: data.report_date,
            week_of_pregnancy: data.week_of_pregnancy || '',
            hospital: data.hospital || '',
            notes: data.notes || '',
            archive_status: data.archive_status || 'archived',
          },
          success: (res) => resolve(res),
          fail: (err) => reject(err),
        })
      })
      uni.hideLoading()

      // uni.uploadFile returns res.data as a JSON string, not an object
      const parsed = typeof uploadRes.data === 'string' ? JSON.parse(uploadRes.data) : uploadRes.data

      if (uploadRes.statusCode !== 200 || parsed.code !== 0) {
        throw new Error(parsed?.msg || '上传失败')
      }

      const { report_id, image_url } = parsed.data

      const id = await createReport({
        ...data,
        _serverReportId: report_id,
        _serverImageUrl: image_url,
      })

      return id
    } catch (err) {
      uni.hideLoading()
      console.error('uploadAndCreateReport failed:', err)
      uni.showToast({ title: err.message || '上传失败，请重试', icon: 'none' })
      return null
    }
  }

  // 重试上传队列
  async function retryUploadQueue() {
    uploadQueue.value = []
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
    syncReportsFromCloud,
    createReport,
    updateReport,
    deleteReport,
    archiveReport,
    batchArchive,
    triggerAiPipeline,
    uploadAndCreateReport,
    uploadFile,
    _imageToBase64,
    retryUploadQueue,
    setFilter,
    resetFilter
  }
})
