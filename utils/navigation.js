/**
 * 安全导航工具 - 封装 uni.navigateTo，静默 timeout 错误
 * 微信小程序 DevTools 中 navigateTo 频繁触发 timeout，
 * 但页面实际加载成功，因此静默处理避免 UnhandledPromiseRejection
 */
export function navigateToPage(url) {
	uni.navigateTo({
		url,
		fail: (err) => {
			if (!err.errMsg || !err.errMsg.includes('timeout')) {
				console.warn('navigateTo fail:', err)
			}
		}
	})
}
