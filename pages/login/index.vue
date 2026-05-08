<template>
	<view class="page">
		<!-- Status bar spacer -->
		<view :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- Logo area -->
		<view class="logo-area">
			<text class="logo-emoji">🤰</text>
			<text class="logo-title">孕途伴侣</text>
			<text class="logo-sub">您的贴心孕期管家</text>
		</view>

		<!-- Form -->
		<view class="form-card">
			<view class="form-field">
				<text class="field-label">手机号</text>
				<view class="field-input-wrap">
					<input
						class="field-input"
						type="number"
						v-model="phone"
						placeholder="请输入手机号"
						placeholder-class="field-placeholder"
						maxlength="11"
					/>
				</view>
			</view>

			<view class="form-field">
				<text class="field-label">密码</text>
				<view class="field-input-wrap">
					<input
						class="field-input"
						type="text"
						v-model="password"
						placeholder="请输入密码"
						placeholder-class="field-placeholder"
						:password="!showPassword"
					/>
					<text class="field-eye" @tap="showPassword = !showPassword">{{ showPassword ? '👁' : '👁‍🗨' }}</text>
				</view>
			</view>

			<!-- Login Button -->
			<view
				class="btn-primary"
				:class="{ 'btn-disabled': !canLogin }"
				@tap="handleLogin"
			>
				<text class="btn-text">登 录</text>
			</view>

			<!-- Register link -->
			<view class="bottom-link">
				<text class="link-text">还没有账号？</text>
				<text class="link-action" @tap="goRegister">立即注册</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { request, setToken } from '@/utils/api.js'
import { useHealthStore } from '@/stores/health.js'

const statusBarHeight = ref(0)
const app = getApp()
if (app && app.globalData) {
	statusBarHeight.value = app.globalData.statusBarHeight || 0
}

const phone = ref('')
const password = ref('')
const showPassword = ref(false)

const canLogin = computed(() => phone.value.length >= 11 && password.value.length >= 6)

async function handleLogin() {
	if (!canLogin.value) return

	uni.showLoading({ title: '登录中...' })
	try {
		const res = await request({
			url: '/api/login',
			method: 'POST',
			data: { phone: phone.value, password: password.value },
			skipAuthRedirect: true,
		})

		uni.hideLoading()

		if (res.data && res.data.code === 0) {
			const { token, user } = res.data.data
			setToken(token)
			uni.setStorageSync('momcare_user', JSON.stringify(user))

			const healthStore = useHealthStore()
			await healthStore.syncCloudData()

			uni.showToast({ title: '登录成功', icon: 'success' })
			setTimeout(() => {
				if (healthStore.dueDate || healthStore.lmpDate) {
					uni.switchTab({ url: '/pages/index/index' })
				} else {
					uni.redirectTo({ url: '/pages/profile/onboarding' })
				}
			}, 800)
		} else {
			uni.showToast({ title: (res.data && res.data.msg) || '登录失败', icon: 'none' })
		}
	} catch (e) {
		uni.hideLoading()
		uni.showToast({ title: '网络错误', icon: 'none' })
	}
}

function goRegister() {
	uni.navigateTo({ url: '/pages/register/index' })
}
</script>

<style scoped lang="scss">
.page {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #FBF7F2;
	box-sizing: border-box;
}

.logo-area {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 120rpx;
	margin-bottom: 60rpx;
}

.logo-emoji {
	font-size: 100rpx;
	margin-bottom: 16rpx;
}

.logo-title {
	font-size: 48rpx;
	font-weight: 700;
	color: #C45070;
	margin-bottom: 8rpx;
}

.logo-sub {
	font-size: 26rpx;
	color: #9C9890;
}

.form-card {
	background: #FFFFFF;
	border-radius: 32rpx;
	box-shadow: 0 4rpx 28rpx rgba(60, 30, 10, 0.07);
	margin: 0 40rpx;
	padding: 8rpx 36rpx 48rpx;
}

.form-field {
	padding: 20rpx 0;
}

.field-label {
	display: block;
	font-size: 22rpx;
	font-weight: 500;
	color: #9B9590;
	letter-spacing: 2rpx;
	margin-bottom: 12rpx;
}

.field-input-wrap {
	position: relative;
	display: flex;
	align-items: center;
}

.field-input {
	flex: 1;
	height: 88rpx;
	background: #F5F2EF;
	border-radius: 20rpx;
	padding: 0 28rpx;
	font-size: 28rpx;
	color: #1C1A17;
	border: 2rpx solid transparent;
	box-sizing: border-box;
}

.field-placeholder {
	color: #C8C2BC;
	font-size: 28rpx;
}

.field-eye {
	position: absolute;
	right: 28rpx;
	font-size: 28rpx;
	padding: 8rpx;
}

.btn-primary {
	margin-top: 32rpx;
	height: 96rpx;
	border-radius: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #E8637A, #C45070);
	box-shadow: 0 8rpx 24rpx rgba(196, 80, 112, 0.3);
}

.btn-primary:active {
	opacity: 0.85;
	transform: scale(0.98);
	transition: all 0.15s ease;
}

.btn-disabled {
	background: #E8E4E0;
	box-shadow: none;
}

.btn-text {
	font-size: 32rpx;
	font-weight: 600;
	color: #FFFFFF;
	letter-spacing: 4rpx;
}

.btn-disabled .btn-text {
	color: #B5AFA9;
}

.bottom-link {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 36rpx;
	gap: 8rpx;
}

.link-text {
	font-size: 26rpx;
	color: #9C9890;
}

.link-action {
	font-size: 26rpx;
	color: #C45070;
	font-weight: 600;
}
</style>
