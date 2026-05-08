<template>
	<view v-if="visible" class="cm-overlay" @tap="handleCancel">
		<view class="cm-card" @tap.stop>
			<text class="cm-title">{{ title }}</text>
			<text class="cm-desc">{{ content }}</text>
			<input
				v-if="editable"
				class="cm-input"
				v-model="inputValue"
				:placeholder="placeholder"
				placeholder-class="cm-input-placeholder"
				:focus="visible && editable"
			/>
			<view class="cm-actions">
				<view class="cm-btn cm-btn-cancel" @tap="handleCancel">
					<text class="cm-btn-text">{{ cancelText }}</text>
				</view>
				<view class="cm-btn cm-btn-confirm" :class="confirmType === 'danger' ? 'cm-btn-danger' : 'cm-btn-primary'" @tap="handleConfirm">
					<text class="cm-btn-text cm-btn-text-white">{{ confirmText }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
	visible: { type: Boolean, default: false },
	title: { type: String, default: '提示' },
	content: { type: String, default: '' },
	confirmText: { type: String, default: '确定' },
	cancelText: { type: String, default: '取消' },
	confirmType: { type: String, default: 'primary' },
	editable: { type: Boolean, default: false },
	placeholder: { type: String, default: '请输入' }
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

const inputValue = ref('')

watch(() => props.visible, (val) => {
	if (val) inputValue.value = ''
})

function handleConfirm() {
	emit('update:visible', false)
	emit('confirm', inputValue.value)
}

function handleCancel() {
	emit('update:visible', false)
	emit('cancel')
}
</script>

<style scoped lang="scss">
.cm-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.4);
	backdrop-filter: blur(4px);
	-webkit-backdrop-filter: blur(4px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
}

.cm-card {
	width: 80%;
	background: #FFFFFF;
	border-radius: 48rpx;
	padding: 48rpx 40rpx 36rpx;
	box-shadow: 0 16rpx 64rpx rgba(0, 0, 0, 0.15);
}

.cm-title {
	display: block;
	text-align: center;
	font-size: 36rpx;
	font-weight: 700;
	color: #333333;
}

.cm-desc {
	display: block;
	text-align: center;
	font-size: 28rpx;
	color: #666666;
	line-height: 1.7;
	margin-top: 20rpx;
	white-space: pre-line;
}

.cm-input {
	width: 100%;
	height: 88rpx;
	background: #F5F2EF;
	border-radius: 20rpx;
	padding: 0 28rpx;
	font-size: 30rpx;
	color: #1C1A17;
	box-sizing: border-box;
	margin-top: 24rpx;
}

.cm-input-placeholder {
	color: #C8C2BC;
}

.cm-actions {
	display: flex;
	gap: 24rpx;
	margin-top: 40rpx;
}

.cm-btn {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 88rpx;
	border-radius: 88rpx;
}

.cm-btn-text {
	font-size: 30rpx;
	font-weight: 600;
}

.cm-btn-cancel {
	background: #F5F5F5;
}

.cm-btn-cancel .cm-btn-text {
	color: #333333;
}

.cm-btn-confirm {
	box-shadow: 0 8rpx 24rpx rgba(194, 24, 91, 0.2);
}

.cm-btn-text-white {
	color: #FFFFFF;
}

.cm-btn-primary {
	background: linear-gradient(135deg, #C45070, #C2185B);
}

.cm-btn-danger {
	background: linear-gradient(135deg, #E05050, #C62828);
}
</style>
