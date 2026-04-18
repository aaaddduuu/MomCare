'use strict'
const db = uniCloud.database()

// 微信小程序配置（也可通过环境变量覆盖）
const APPID = process.env.WX_APPID || 'wxf131140360855218'
const APPSECRET = process.env.WX_APPSECRET || 'afceed7bad9b0c1430ff2021c6a3f89d'

exports.main = async (event, context) => {
	const { action } = event

	// 保存用户资料（前端无法直接写数据库，走云函数绕过权限）
	if (action === 'saveProfile') {
		return await saveProfile(event)
	}

	// 默认：微信登录
	const { code } = event

	if (!code) {
		return { code: 400, msg: '缺少 code 参数' }
	}

	if (!APPID || !APPSECRET) {
		console.error('wxLogin: 未配置 WX_APPID 或 WX_APPSECRET 环境变量')
		return { code: 500, msg: '服务端配置错误' }
	}

	// 1. 调用微信 jscode2session 接口
	let openid = ''
	try {
		const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${APPSECRET}&js_code=${code}&grant_type=authorization_code`
		const res = await uniCloud.httpclient.request(url, {
			method: 'GET',
			dataType: 'json',
			timeout: 10000
		})

		if (res.status !== 200 || !res.data || !res.data.openid) {
			console.error('wxLogin: 微信接口返回错误', JSON.stringify(res.data))
			return { code: 502, msg: '微信登录服务异常' }
		}

		openid = res.data.openid
	} catch (e) {
		console.error('wxLogin: 请求微信接口失败', e.message)
		return { code: 502, msg: '微信登录服务异常' }
	}

	// 2. 查询或创建用户记录
	const now = new Date()
	let userInfo = null
	let isNewUser = false

	try {
		const queryRes = await db.collection('mom_users')
			.where({ openid })
			.limit(1)
			.get()

		if (queryRes.data && queryRes.data.length > 0) {
			// 已有用户，更新登录时间
			const existingDoc = queryRes.data[0]
			await db.collection('mom_users')
				.doc(existingDoc._id)
				.update({ last_login_time: now })

			userInfo = {
				nickname: existingDoc.nickname || '宝妈',
				avatar: existingDoc.avatar || '🌸',
				hospital: existingDoc.hospital || '',
				babyNickname: existingDoc.baby_nickname || '',
				doctor: existingDoc.doctor || '',
				hospitalPhone: existingDoc.hospital_phone || '',
				preWeight: existingDoc.pre_weight || '',
				height: existingDoc.height || ''
			}

			// 如果有孕期日期也返回
			if (existingDoc.lmp_date) {
				userInfo.lmpDate = existingDoc.lmp_date
			}
			if (existingDoc.due_date) {
				userInfo.dueDate = existingDoc.due_date
			}
		} else {
			// 新用户，创建记录
			isNewUser = true
			const newDoc = {
				openid,
				nickname: '宝妈',
				avatar: '🌸',
				status: 0,
				is_vip: false,
				ai_quota_monthly: 3,
				ai_used_current_month: 0,
				last_login_time: now,
				create_time: now,
				update_time: now
			}
			await db.collection('mom_users').add(newDoc)

			userInfo = {
				nickname: '宝妈',
				avatar: '🌸',
				hospital: '',
				babyNickname: '',
				doctor: '',
				hospitalPhone: '',
				preWeight: '',
				height: ''
			}
		}
	} catch (e) {
		console.error('wxLogin: 数据库操作失败', e.message)
		return { code: 500, msg: '数据库操作失败' }
	}

	return {
		code: 200,
		data: { openid, userInfo, isNewUser }
	}
}

// 保存用户资料到云端
async function saveProfile(event) {
	const { openid, profileData } = event
	if (!openid) {
		return { code: 400, msg: '缺少 openid' }
	}

	try {
		const now = new Date()
		// 查询是否已有记录
		const queryRes = await db.collection('mom_users')
			.where({ openid })
			.limit(1)
			.get()

		// 构建更新数据，过滤掉空值
		const updateData = { update_time: now }
		if (profileData.nickname !== undefined) updateData.nickname = profileData.nickname
		if (profileData.avatar !== undefined) updateData.avatar = profileData.avatar
		if (profileData.hospital !== undefined) updateData.hospital = profileData.hospital
		if (profileData.baby_nickname !== undefined) updateData.baby_nickname = profileData.baby_nickname
		if (profileData.doctor !== undefined) updateData.doctor = profileData.doctor
		if (profileData.hospital_phone !== undefined) updateData.hospital_phone = profileData.hospital_phone
		if (profileData.pre_weight !== undefined) updateData.pre_weight = profileData.pre_weight
		if (profileData.height !== undefined) updateData.height = profileData.height
		if (profileData.lmp_date) updateData.lmp_date = profileData.lmp_date
		if (profileData.due_date) updateData.due_date = profileData.due_date

		if (queryRes.data && queryRes.data.length > 0) {
			// 更新已有记录
			await db.collection('mom_users')
				.doc(queryRes.data[0]._id)
				.update(updateData)
		} else {
			// 新建记录
			await db.collection('mom_users').add({
				...updateData,
				openid,
				create_time: now
			})
		}

		return { code: 200, msg: '保存成功' }
	} catch (e) {
		console.error('saveProfile 失败:', e.message)
		return { code: 500, msg: '保存失败' }
	}
}
