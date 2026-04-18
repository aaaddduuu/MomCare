<template>
	<view v-if="visible" class="popup-mask" @tap="handleCancel">
		<view class="popup-container" @tap.stop>
			<!-- 标题 -->
			<view class="popup-header">
				<text class="popup-title">完善个人信息</text>
				<text class="popup-subtitle">设置头像和昵称，开启孕期旅程</text>
			</view>

			<!-- 头像选择 -->
			<view class="avatar-section">
				<button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
					<image v-if="avatarUrl" class="avatar-preview" :src="avatarUrl" mode="aspectFill" />
					<view v-else class="avatar-placeholder">
						<text class="avatar-placeholder-icon">📷</text>
						<text class="avatar-placeholder-text">选择头像</text>
					</view>
				</button>
			</view>

			<!-- 昵称输入 -->
			<view class="nickname-section">
				<text class="field-label">昵称</text>
				<input
					class="nickname-input"
					type="nickname"
					v-model="nickname"
					placeholder="请输入昵称"
					placeholder-class="nickname-placeholder"
					maxlength="20"
					@blur="onNicknameBlur"
				/>
			</view>

			<!-- 按钮组 -->
			<view class="popup-actions">
				<view class="btn btn-cancel" @tap="handleCancel">
					<text class="btn-text btn-text-cancel">稍后再说</text>
				</view>
				<view class="btn btn-confirm" @tap="handleConfirm">
					<text class="btn-text btn-text-confirm">{{ loading ? '保存中...' : '确认' }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { useHealthStore } from '@/stores/health.js'

const props = defineProps({
	visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'success'])

const healthStore = useHealthStore()
const avatarUrl = ref('')
const avatarTempPath = ref('')
const nickname = ref('')
const loading = ref(false)

function onChooseAvatar(e) {
	const tempFilePath = e.detail.avatarUrl
	if (tempFilePath) {
		avatarTempPath.value = tempFilePath
		avatarUrl.value = tempFilePath
	}
}

function onNicknameBlur(e) {
	if (e.detail.value !== undefined) {
		nickname.value = e.detail.value
	}
}

async function handleConfirm() {
	if (loading.value) return
	if (!nickname.value.trim()) {
		uni.showToast({ title: '请输入昵称', icon: 'none' })
		return
	}

	loading.value = true

	try {
		// 1. 先调用 silentLogin 获取 openid
		if (!healthStore.isLoggedIn) {
			const loginOk = await healthStore.silentLogin()
			if (!loginOk) {
				uni.showToast({ title: '登录失败，请重试', icon: 'none' })
				loading.value = false
				return
			}
		}

		// 2. 上传头像（如果选择了）
		let finalAvatar = '🌸'
		if (avatarTempPath.value) {
			try {
				uni.showLoading({ title: '上传头像...' })
				const uploadRes = await uniCloud.uploadFile({
					filePath: avatarTempPath.value,
					cloudPath: `avatars/${healthStore.openid}_${Date.now()}.jpg`
				})
				if (uploadRes.fileID) {
					finalAvatar = uploadRes.fileID
				}
				uni.hideLoading()
			} catch (e) {
				console.error('头像上传失败:', e)
				uni.hideLoading()
				// 头像上传失败不阻断，使用默认头像
			}
		}

		// 3. 更新 store
		healthStore.userInfo.nickname = nickname.value.trim()
		healthStore.userInfo.avatar = finalAvatar

		// 4. 保存到云端
		await healthStore.saveUserProfile()

		loading.value = false
		emit('update:visible', false)
		emit('success')
		uni.showToast({ title: '登录成功', icon: 'success', duration: 1500 })
	} catch (e) {
		loading.value = false
		console.error('登录保存失败:', e)
		uni.showToast({ title: '保存失败，请重试', icon: 'none' })
	}
}

function handleCancel() {
	emit('update:visible', false)
}
</script>

<style scoped lang="scss">
.popup-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.popup-container {
	width: 600rpx;
	background: #FFFFFF;
	border-radius: 32rpx;
	padding: 48rpx 40rpx 40rpx;
	box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.15);
}

.popup-header {
	text-align: center;
	margin-bottom: 40rpx;
}

.popup-title {
	display: block;
	font-size: 36rpx;
	font-weight: 700;
	color: #1C1A17;
	margin-bottom: 8rpx;
}

.popup-subtitle {
	display: block;
	font-size: 24rpx;
	color: #9B9590;
}

/* Avatar */
.avatar-section {
	display: flex;
	justify-content: center;
	margin-bottom: 36rpx;
}

.avatar-btn {
	width: 160rpx;
	height: 160rpx;
	border-radius: 50%;
	padding: 0;
	margin: 0;
	background: transparent;
	border: none;
	line-height: normal;
	overflow: hidden;

	&::after {
		border: none;
	}
}

.avatar-preview {
	width: 160rpx;
	height: 160rpx;
	border-radius: 50%;
}

.avatar-placeholder {
	width: 160rpx;
	height: 160rpx;
	border-radius: 50%;
	background: #F5F2EF;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.avatar-placeholder-icon {
	font-size: 44rpx;
	line-height: 1;
}

.avatar-placeholder-text {
	font-size: 20rpx;
	color: #9B9590;
	margin-top: 4rpx;
}

/* Nickname */
.nickname-section {
	margin-bottom: 40rpx;
}

.field-label {
	display: block;
	font-size: 24rpx;
	font-weight: 500;
	color: #9B9590;
	margin-bottom: 12rpx;
}

.nickname-input {
	width: 100%;
	height: 88rpx;
	background: #F5F2EF;
	border-radius: 20rpx;
	padding: 0 28rpx;
	font-size: 30rpx;
	color: #1C1A17;
	box-sizing: border-box;
}

.nickname-placeholder {
	color: #C8C2BC;
}

/* Actions */
.popup-actions {
	display: flex;
	gap: 20rpx;
}

.btn {
	flex: 1;
	height: 88rpx;
	border-radius: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.btn-cancel {
	background: #F5F2EF;
}

.btn-text-cancel {
	font-size: 28rpx;
	color: #9B9590;
}

.btn-confirm {
	background: linear-gradient(135deg, #C45070, #C2185B);
	box-shadow: 0 8rpx 24rpx rgba(194, 24, 91, 0.25);
}

.btn-confirm:active {
	opacity: 0.85;
}

.btn-text-confirm {
	font-size: 28rpx;
	font-weight: 600;
	color: #FFFFFF;
}
</style>
