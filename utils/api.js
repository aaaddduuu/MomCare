export const API_BASE = 'https://momcare-api.dpc7775223.workers.dev'

const TOKEN_KEY = 'momcare_token'

function buildUrl(url) {
  if (/^https?:\/\//i.test(url)) return url
  return `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`
}

export function getToken() {
  try {
    return uni.getStorageSync(TOKEN_KEY) || ''
  } catch (e) {
    console.warn('getToken failed:', e)
    return ''
  }
}

export function setToken(token) {
  try {
    uni.setStorageSync(TOKEN_KEY, token || '')
  } catch (e) {
    console.warn('setToken failed:', e)
  }
}

export function removeToken() {
  try {
    uni.removeStorageSync(TOKEN_KEY)
  } catch (e) {
    console.warn('removeToken failed:', e)
  }
}

export function isLoggedIn() {
  return Boolean(getToken())
}

export function request(options = {}) {
  const token = getToken()
  const headers = {
    ...(options.header || options.headers || {})
  }

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`
  }

  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      url: buildUrl(options.url || ''),
      header: headers,
      success: (res) => {
        if (res.statusCode === 401 && !options.skipAuthRedirect) {
          removeToken()
          uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
          setTimeout(() => {
            uni.redirectTo({ url: '/pages/login/index' })
          }, 600)
        }
        resolve(res)
      },
      fail: reject
    })
  })
}
