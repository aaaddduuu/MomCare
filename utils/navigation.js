const TAB_PAGES = new Set([
  '/pages/index/index',
  '/pages/knowledge/index',
  '/pages/archives/index',
  '/pages/profile/index'
])

function normalizeUrl(url) {
  if (!url) return ''
  return url.startsWith('/') ? url : `/${url}`
}

export function navigateToPage(url) {
  const normalized = normalizeUrl(url)
  const path = normalized.split('?')[0]

  if (TAB_PAGES.has(path)) {
    uni.switchTab({ url: path })
    return
  }

  uni.navigateTo({
    url: normalized,
    fail: () => {
      uni.redirectTo({ url: normalized })
    }
  })
}
