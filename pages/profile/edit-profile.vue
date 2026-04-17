<template>
	<view class="page">
		<!-- NavBar -->
		<NavBar theme="light" title="编辑资料">
			<template #right>
				<view class="nav-save-btn" @tap="handleSave">
					<text class="nav-save-text">保存</text>
				</view>
			</template>
		</NavBar>

		<!-- Scrollable Content -->
		<scroll-view scroll-y class="scroll-content">
			<!-- 头像 -->
			<view class="avatar-section">
				<view class="avatar-wrap" @tap="handleAvatarTap">
					<image v-if="isCustomAvatar" class="avatar-img" :src="form.avatar" mode="aspectFill" />
					<text v-else class="avatar-emoji">{{ form.avatar }}</text>
					<view class="avatar-edit-badge">
						<text class="avatar-edit-icon">📷</text>
					</view>
				</view>
				<text class="avatar-hint">点击更换头像</text>
			</view>

			<!-- 昵称 -->
			<view class="section-card">
				<view class="section-header">
					<view class="section-icon">
						<text class="section-icon-text">✏️</text>
					</view>
					<text class="section-title">基本信息</text>
				</view>

				<view class="form-field">
					<text class="field-label">昵称</text>
					<view class="field-input-wrap">
						<input
							class="field-input field-input-lg"
							v-model="form.nickname"
							placeholder="请输入昵称"
							placeholder-class="field-placeholder"
							maxlength="20"
						/>
					</view>
				</view>
			</view>

			<view class="bottom-spacer"></view>
		</scroll-view>

		<!-- Fixed Bottom Save Bar -->
		<view class="save-bar">
			<view class="save-bar-inner">
				<view class="save-btn" @tap="handleSave">
					<text class="save-btn-text">保存</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useHealthStore } from '@/stores/health.js'
import NavBar from '@/components/NavBar.vue'

const healthStore = useHealthStore()

const form = reactive({
	nickname: '',
	avatar: '🌸'
})

const isCustomAvatar = computed(() => {
	return form.avatar.startsWith('http://') || form.avatar.startsWith('https://') || form.avatar.startsWith('cloud://')
})

onMounted(() => {
	form.nickname = healthStore.userInfo.nickname || ''
	form.avatar = healthStore.userInfo.avatar || '🌸'
})

function handleAvatarTap() {
	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: async (res) => {
			if (res.tempFilePaths && res.tempFilePaths.length > 0) {
				const tempPath = res.tempFilePaths[0]
				uni.showLoading({ title: '上传中...' })
				try {
					const uploadRes = await uniCloud.uploadFile({
						filePath: tempPath,
						cloudPath: `avatars/${healthStore.openid || 'local'}_${Date.now()}.jpg`
					})
					if (uploadRes.fileID) {
						form.avatar = uploadRes.fileID
					}
				} catch (e) {
					console.error('头像上传失败:', e)
					uni.showToast({ title: '上传失败', icon: 'error' })
				} finally {
					uni.hideLoading()
				}
			}
		}
	})
}

async function handleSave() {
	if (!form.nickname.trim()) {
		uni.showToast({ title: '请输入昵称', icon: 'none' })
		return
	}

	// 更新 store
	healthStore.userInfo.nickname = form.nickname.trim()
	healthStore.userInfo.avatar = form.avatar

	uni.showLoading({ title: '保存中...' })

	try {
		await healthStore.saveUserProfile()
		uni.hideLoading()
		uni.showToast({ title: '保存成功', icon: 'success', duration: 1500 })
		setTimeout(() => {
			uni.navigateBack()
		}, 1500)
	} catch (e) {
		uni.hideLoading()
		uni.showToast({ title: '保存失败', icon: 'error', duration: 2000 })
	}
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

.scroll-content {
	flex: 1;
}

/* Avatar Section */
.avatar-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 48rpx 0 32rpx;
}

.avatar-wrap {
	position: relative;
	width: 180rpx;
	height: 180rpx;
	border-radius: 50%;
	background: rgba(194, 24, 91, 0.1);
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
}

.avatar-img {
	width: 100%;
	height: 100%;
}

.avatar-emoji {
	font-size: 88rpx;
}

.avatar-edit-badge {
	position: absolute;
	right: 0;
	bottom: 0;
	width: 52rpx;
	height: 52rpx;
	border-radius: 50%;
	background: #C2185B;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 4rpx solid #FFFFFF;
}

.avatar-edit-icon {
	font-size: 24rpx;
}

.avatar-hint {
	margin-top: 16rpx;
	font-size: 24rpx;
	color: #9B9590;
}

/* Section Card */
.section-card {
	background: #FFFFFF;
	border-radius: 32rpx;
	box-shadow: 0 4rpx 28rpx rgba(60, 30, 10, 0.07);
	overflow: hidden;
	margin: 20rpx 24rpx 0;
	padding: 0 32rpx 32rpx;
}

.section-header {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 32rpx 0 16rpx;
	border-bottom: 1px solid #F5F2EF;
	margin-bottom: 8rpx;
}

.section-icon {
	width: 52rpx;
	height: 52rpx;
	border-radius: 16rpx;
	background: #FAF0EE;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.section-icon-text {
	font-size: 28rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #1C1A17;
}

/* Form Field */
.form-field {
	padding: 20rpx 0;
}

.field-label {
	display: block;
	font-size: 22rpx;
	font-weight: 500;
	color: #9B9590;
	text-transform: uppercase;
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
	transition: all 0.2s ease;
	box-sizing: border-box;
}

.field-input-lg {
	font-size: 34rpx;
	font-weight: 500;
}

.field-placeholder {
	color: #C8C2BC;
	font-size: 28rpx;
}

/* Bottom Spacer */
.bottom-spacer {
	height: 180rpx;
}

/* Fixed Bottom Save Bar */
.save-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	background: #FFFFFF;
	padding: 20rpx 32rpx;
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	box-shadow: 0 -4rpx 24rpx rgba(60, 30, 10, 0.06);
	z-index: 100;
}

.save-bar-inner {
	display: flex;
	align-items: center;
	justify-content: center;
}

.save-btn {
	width: 100%;
	height: 96rpx;
	border-radius: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #7FB88F, #5A9E6F);
	box-shadow: 0 8rpx 24rpx rgba(90, 158, 111, 0.3);
}

.save-btn:active {
	opacity: 0.85;
	transform: scale(0.98);
	transition: all 0.15s ease;
}

.save-btn-text {
	font-size: 32rpx;
	font-weight: 600;
	color: #FFFFFF;
	letter-spacing: 2rpx;
}

/* NavBar right save button */
.nav-save-btn {
	padding: 8rpx 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.nav-save-text {
	font-size: 30rpx;
	color: #E8637A;
	font-weight: 600;
}
</style>
