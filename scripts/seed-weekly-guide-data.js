#!/usr/bin/env node

/**
 * 孕周指南数据生成脚本
 * 生成孕 1-40 周的完整指南数据
 * 用法: node scripts/seed-weekly-guide-data.js export
 */

// 现有的 30-40 周数据（从 weekly-guide.vue 提取）
const EXISTING_DATA = {
	30: {
		babyWeight: '1.3kg', babyLength: '40cm', fundalHeight: '30cm',
		baby: {
			icon: '🥥',
			paragraphs: [
				'宝宝约 1.3kg，大脑在快速发育，脑回加深，表面开始出现沟裂。',
				'大脑皮层开始有更复杂的功能分区，宝宝的学习能力正在打基础。'
			],
			highlight: '🎉 从现在开始，宝宝的大脑发育进入冲刺期，DHA补充很关键！'
		},
		mom: {
			items: [
				{ label: '心', text: '心输出量达到孕期峰值，活动后容易气短' },
				{ label: '肿', text: '手脚水肿常见，避免久站久坐' },
				{ label: '腰', text: '腰背酸痛加剧，使用托腹带有帮助' }
			],
			highlight: '💡 气短是因为子宫压迫横膈膜，休息时左侧卧可以缓解'
		},
		foods: [
			{ icon: '🐟', name: '深海鱼', why: 'DHA脑发育' },
			{ icon: '🥩', name: '红肉', why: '补铁防贫血' },
			{ icon: '🥛', name: '牛奶', why: '每天500ml' },
			{ icon: '🥚', name: '鸡蛋', why: '优质蛋白' },
			{ icon: '🥦', name: '西兰花', why: '叶酸+VC' }
		],
		avoidFood: '🚫 避免：生鱼片、高汞鱼（金枪鱼）、酒精、过量咖啡因',
		checkup: [
			{ icon: '✓', text: '孕 30-32 周：产科检查 + 血常规 + 尿常规' },
			{ icon: '✓', text: '胎心监护开始（高危孕妇）' },
			{ icon: '!', text: '注意血压变化，预防妊娠高血压', warn: true }
		],
		preparation: [
			'了解分娩方式选择，与医生讨论分娩计划',
			'开始学习拉玛泽呼吸法',
			'准备待产包清单',
			'确认就诊医院路线和紧急联系方式'
		]
	},
	31: {
		babyWeight: '1.5kg', babyLength: '41cm', fundalHeight: '30cm',
		baby: {
			icon: '🥥',
			paragraphs: [
				'宝宝约 1.5kg，五官已经非常精致，能够转头、做出面部表情。',
				'五感发育更加完善，能感受到光线和声音。'
			],
			highlight: '🎉 宝宝已经能记忆一些反复出现的声音，多和宝宝说话吧！'
		},
		mom: {
			items: [
				{ label: '气', text: '气短和尿频加重，活动后需要多休息' },
				{ label: '胃', text: '胃被挤压，少量多餐很重要' },
				{ label: '便', text: '便秘可能加重，多喝水多吃纤维' }
			],
			highlight: '💡 尝试左侧卧位睡觉，在两腿间夹一个枕头会更舒服'
		},
		foods: [
			{ icon: '🥩', name: '红肉', why: '补铁防贫血' },
			{ icon: '🥛', name: '牛奶', why: '每天500ml' },
			{ icon: '🐟', name: '三文鱼', why: 'DHA脑发育' },
			{ icon: '🥦', name: '深色蔬菜', why: '叶酸/铁/VC' },
			{ icon: '🫐', name: '蓝莓', why: '抗氧化' }
		],
		avoidFood: '🚫 避免：生鱼片、高汞鱼（金枪鱼）、酒精、过量咖啡因',
		checkup: [
			{ icon: '✓', text: '孕 30-32 周：产科检查 + 血常规' },
			{ icon: '✓', text: 'B 超评估胎儿体重、胎位、羊水量' },
			{ icon: '!', text: '出现规律宫缩或出血请立即就医', warn: true }
		],
		preparation: [
			'学习分娩呼吸法，每天练习几分钟',
			'了解母乳喂养基础知识',
			'准备哺乳用品（文胸、防溢乳垫）',
			'安排好产假和工作交接'
		]
	},
	32: {
		babyWeight: '1.8kg', babyLength: '42cm', fundalHeight: '31cm',
		baby: {
			icon: '👶',
			paragraphs: [
				'宝宝进入孕 8 月，体重约 1.8kg，身长约 42cm，皮下脂肪继续积累，皮肤越来越圆润饱满。',
				'大脑皮层快速发育，褶皱（脑回）持续加深，智力基础正在形成；肺部接近成熟，表面活性物质分泌充足。'
			],
			highlight: '🎉 宝宝已经可以在子宫内做出精细动作——吸吮手指、抓握，甚至出现打嗝！'
		},
		mom: {
			items: [
				{ label: '气', text: '横膈膜被上推，气短感加剧，活动后喘气明显' },
				{ label: '胃', text: '胃被挤压，消化变慢，饭后腹胀不适' },
				{ label: '腰', text: '腰背酸痛持续，骨盆韧带松弛' },
				{ label: '肿', text: '脚踝和手部水肿常见，久站后更明显' },
				{ label: '奶', text: '乳房继续增大，少量初乳分泌属正常' }
			],
			highlight: '💡 气短感在孕 36 周宝宝入盆后会明显减轻，再坚持一下！'
		},
		foods: [
			{ icon: '🥩', name: '红肉', why: '补铁防贫血' },
			{ icon: '🥛', name: '牛奶', why: '每天500ml' },
			{ icon: '🐟', name: '三文鱼', why: 'DHA脑发育' },
			{ icon: '🥦', name: '深色蔬菜', why: '叶酸/铁/VC' },
			{ icon: '🥚', name: '鸡蛋', why: '优质蛋白质' },
			{ icon: '🫐', name: '蓝莓', why: '抗氧化' }
		],
		avoidFood: '🚫 避免：生鱼片、高汞鱼（金枪鱼）、酒精、过量咖啡因',
		checkup: [
			{ icon: '✓', text: '孕 32-34 周：产科检查 + 血常规 + 胎心监护（NST）' },
			{ icon: '✓', text: 'B 超评估胎儿体重、胎位、羊水量' },
			{ icon: '✓', text: 'GBS（B 族链球菌）筛查在孕 35-37 周进行' },
			{ icon: '!', text: '若宝宝是臀位，医生可能建议外转胎位术（ECV）', warn: true }
		],
		preparation: [
			'准备待产包：妈妈用品、宝宝用品、证件资料',
			'了解分娩方式（顺产/剖宫产），与医生确认方向',
			'学习拉玛泽呼吸法，帮助分娩时减痛',
			'确认就诊医院、产房及相关手续流程'
		]
	},
	33: {
		babyWeight: '2.0kg', babyLength: '43cm', fundalHeight: '32cm',
		baby: {
			icon: '👶',
			paragraphs: [
				'宝宝约 2kg，皮肤不再那么红皱，皮下脂肪越来越丰富，变得更白嫩。',
				'免疫系统正在发育，从母体接收抗体，为出生后建立抵抗力做准备。'
			],
			highlight: '🎉 给宝宝放轻柔的音乐是很好的早教，宝宝出生后可能会对这些声音更敏感！'
		},
		mom: {
			items: [
				{ label: '骨', text: '骨盆韧带松弛，走路更吃力' },
				{ label: '奶', text: '乳房在为哺乳做准备，初乳分泌增加' },
				{ label: '睡', text: '睡眠质量下降，翻身困难' },
				{ label: '频', text: '尿频加重，夜间需要多次起夜' }
			],
			highlight: '💡 骨盆痛是正常现象，穿低跟舒适的鞋子可以缓解不适'
		},
		foods: [
			{ icon: '🥛', name: '牛奶', why: '每天500ml' },
			{ icon: '🥩', name: '红肉', why: '补铁' },
			{ icon: '🐟', name: '深海鱼', why: 'DHA' },
			{ icon: '🥜', name: '坚果', why: '优质脂肪' },
			{ icon: '🥦', name: '深色蔬菜', why: '铁+VC' }
		],
		avoidFood: '🚫 避免：生食、高糖食品、过量水果（防妊娠糖尿病）',
		checkup: [
			{ icon: '✓', text: '产检改为每两周一次' },
			{ icon: '✓', text: '胎心监护（NST）每次产检都做' },
			{ icon: '!', text: '注意区分破水和漏尿，破水需立即就医', warn: true }
		],
		preparation: [
			'提前安排月嫂或家人陪护',
			'准备新生儿用品（衣服、尿布、奶瓶）',
			'了解哺乳姿势和开奶知识',
			'确认待产包是否齐全'
		]
	},
	34: {
		babyWeight: '2.2kg', babyLength: '44cm', fundalHeight: '32cm',
		baby: {
			icon: '🧠',
			paragraphs: [
				'宝宝约 2.2kg，中枢神经系统继续成熟，肺部也接近完全成熟。',
				'如果现在出生，宝宝已经可以自主呼吸，不需要太多医疗辅助。'
			],
			highlight: '🎉 从这个阶段开始，宝宝的肺部基本成熟，是一个重要的里程碑！'
		},
		mom: {
			items: [
				{ label: '呼', text: '胎头入盆后呼吸会轻松一些' },
				{ label: '频', text: '尿频更加明显，膀胱被压迫' },
				{ label: '肿', text: '手脚水肿继续，抬高双脚有帮助' }
			],
			highlight: '💡 宝宝入盆后你会感觉上腹部轻松了，但下腹部坠胀感会增加'
		},
		foods: [
			{ icon: '🥩', name: '红肉', why: '补铁' },
			{ icon: '🥛', name: '酸奶', why: '钙+益生菌' },
			{ icon: '🍠', name: '红薯', why: '膳食纤维' },
			{ icon: '🥚', name: '鸡蛋', why: '优质蛋白' },
			{ icon: '🍊', name: '橙子', why: '维C' }
		],
		avoidFood: '🚫 避免：高盐食品（加重水肿）、生冷食物、酒精',
		checkup: [
			{ icon: '✓', text: '每两周产检：血压、体重、胎心监护' },
			{ icon: '✓', text: 'GBS筛查安排在下次产检（35-37周）' },
			{ icon: '!', text: '了解早产征兆：规律宫缩、破水、见红', warn: true }
		],
		preparation: [
			'了解分娩流程和入院手续',
			'练习分娩呼吸法',
			'确认待产包已准备齐全',
			'了解新生儿护理基础知识'
		]
	},
	35: {
		babyWeight: '2.4kg', babyLength: '45cm', fundalHeight: '33cm',
		baby: {
			icon: '✨',
			paragraphs: [
				'宝宝约 2.4kg，皮下脂肪越来越丰满，圆润可爱。',
				'肾脏已经发育成熟，肝脏也在积蓄铁质，为出生后做准备。'
			],
			highlight: '🎉 大部分宝宝到这一周已经头部朝下，做好了入盆准备！'
		},
		mom: {
			items: [
				{ label: '奶', text: '初乳开始分泌，乳房在为哺乳做最后准备' },
				{ label: '坠', text: '下腹坠胀感明显，宝宝在向下移动' },
				{ label: '宫', text: '假性宫缩可能更频繁' }
			],
			highlight: '💡 学习哺乳姿势和含接方法，提前了解能减少产后焦虑'
		},
		foods: [
			{ icon: '🥛', name: '牛奶', why: '补钙' },
			{ icon: '🐟', name: '深海鱼', why: 'DHA' },
			{ icon: '🥩', name: '瘦肉', why: '补铁' },
			{ icon: '🥑', name: '牛油果', why: '优质脂肪' },
			{ icon: '🍲', name: '少量多餐', why: '减轻胃部不适' }
		],
		avoidFood: '🚫 避免：高糖食品、咖啡因、生食、辛辣刺激',
		checkup: [
			{ icon: '✓', text: 'GBS（B 族链球菌）筛查本周进行' },
			{ icon: '✓', text: '产检改为每周一次' },
			{ icon: '✓', text: '胎位确认，如为臀位需讨论分娩方案' },
			{ icon: '!', text: '出现规律宫缩（每10分钟1次）请立即联系医院', warn: true }
		],
		preparation: [
			'学习哺乳姿势和开奶知识',
			'保持乳房清洁，准备哺乳文胸和防溢乳垫',
			'了解新生儿疫苗接种计划',
			'安排好产后照护和月子计划'
		]
	},
	36: {
		babyWeight: '2.6kg', babyLength: '46cm', fundalHeight: '34cm',
		baby: {
			icon: '🍈',
			paragraphs: [
				'宝宝约 2.6kg，头部已入盆固定，为分娩做好准备。',
				'肺部已基本成熟，各项器官已具备出生后独立运作的能力。'
			],
			highlight: '🎉 宝宝现在如果出生就是足月了，大部分宝宝都能健康存活！'
		},
		mom: {
			items: [
				{ label: '坠', text: '下腹坠胀感强烈，宝宝完全入盆了' },
				{ label: '频', text: '尿频非常严重，膀胱被完全压迫' },
				{ label: '走', text: '走路更加困难，像企鹅一样摇摆' },
				{ label: '睡', text: '几乎找不到舒服的睡姿' }
			],
			highlight: '💡 每周一次产检非常重要，密切监测胎心和胎位'
		},
		foods: [
			{ icon: '🍯', name: '蜂蜜水', why: '补充能量' },
			{ icon: '🥛', name: '牛奶', why: '补钙' },
			{ icon: '🍌', name: '香蕉', why: '防便秘' },
			{ icon: '🥩', name: '红肉', why: '补铁' },
			{ icon: '🍲', name: '少量多餐', why: '轻松消化' }
		],
		avoidFood: '🚫 避免：辛辣刺激（可能引发宫缩）、高糖高盐、生食',
		checkup: [
			{ icon: '✓', text: '每周产检：胎心监护 + 宫高腹围测量' },
			{ icon: '✓', text: '确认胎位和入盆状态' },
			{ icon: '!', text: '分辨真假宫缩，真宫缩5-6分钟一次且逐渐增强', warn: true }
		],
		preparation: [
			'确认入院流程和手续',
			'准备好所有证件资料',
			'了解无痛分娩选项',
			'确认紧急联系人和医院路线'
		]
	},
	37: {
		babyWeight: '2.9kg', babyLength: '47cm', fundalHeight: '34cm',
		baby: {
			icon: '🍈',
			paragraphs: [
				'宝宝约 2.9kg，肺部已完全成熟，随时可以出生。',
				'从本周起宝宝已足月，免疫系统已准备好迎接外部世界。'
			],
			highlight: '🎉 宝宝已经足月啦！随时准备见面！'
		},
		mom: {
			items: [
				{ label: '松', text: '宝宝入盆后胃部轻松了一些' },
				{ label: '坠', text: '下腹坠胀感更明显' },
				{ label: '宫', text: '假性宫缩频繁，注意区分真假' },
				{ label: '黏', text: '可能出现宫颈黏液栓排出（见红前兆）' }
			],
			highlight: '💡 见红不必慌张，只有出现规律宫缩或破水才需要立即去医院'
		},
		foods: [
			{ icon: '🍯', name: '蜂蜜水', why: '补充能量' },
			{ icon: '🥚', name: '鸡蛋', why: '优质蛋白' },
			{ icon: '🍲', name: '粥类', why: '易消化' },
			{ icon: '🥛', name: '牛奶', why: '补钙' },
			{ icon: '🍌', name: '香蕉', why: '防便秘' }
		],
		avoidFood: '🚫 避免：不易消化的食物、过饱饮食、刺激性食物',
		checkup: [
			{ icon: '✓', text: '每周产检：胎心监护、内检评估宫颈条件' },
			{ icon: '✓', text: '确认分娩方式和入院流程' },
			{ icon: '!', text: '破水后立即平躺去医院，不可洗澡', warn: true }
		],
		preparation: [
			'随时准备入院，待产包放在显眼位置',
			'分辨真假宫缩',
			'破水后立即平躺去医院',
			'保持电话畅通，确认陪产人员'
		]
	},
	38: {
		babyWeight: '3.1kg', babyLength: '48cm', fundalHeight: '35cm',
		baby: {
			icon: '🍉',
			paragraphs: [
				'宝宝约 3.1kg，继续积累脂肪，越来越圆润。',
				'肠道内开始积聚胎便（墨绿色），出生后1-2天会排出。'
			],
			highlight: '🎉 宝宝已经做好了一切准备，随时等待与你见面！'
		},
		mom: {
			items: [
				{ label: '宫', text: '随时可能发动，注意宫缩规律' },
				{ label: '走', text: '走路非常困难，尽量休息' },
				{ label: '睡', text: '几乎无法好好睡觉' }
			],
			highlight: '💡 规律宫缩5-6分钟一次、每次持续30秒以上就该去医院了'
		},
		foods: [
			{ icon: '🍯', name: '蜂蜜水', why: '分娩能量' },
			{ icon: '🍫', name: '巧克力', why: '快速补充能量' },
			{ icon: '🍲', name: '清淡饮食', why: '减轻胃部负担' },
			{ icon: '🥛', name: '牛奶', why: '补钙' }
		],
		avoidFood: '🚫 避免：过饱饮食、不易消化食物、生冷食物',
		checkup: [
			{ icon: '✓', text: '每周产检：密切监测胎心和胎位' },
			{ icon: '!', text: '规律宫缩、破水、大量见红是三大临产信号', warn: true },
			{ icon: '!', text: '超过预产期一周医生会评估是否催产', warn: true }
		],
		preparation: [
			'规律宫缩5-6分钟一次就去医院',
			'见红不必慌张，观察出血量',
			'破水要立即平躺去医院',
			'保持手机充满电，准备好待产包'
		]
	},
	39: {
		babyWeight: '3.3kg', babyLength: '49cm', fundalHeight: '35cm',
		baby: {
			icon: '🍉',
			paragraphs: [
				'宝宝约 3.3kg，已经足月完全成熟，随时准备出生。',
				'宝宝的头部已经深入骨盆，做好了最后的出发准备。'
			],
			highlight: '🎉 宝宝已经在门口等着了，保持好心态，即将见面！'
		},
		mom: {
			items: [
				{ label: '待', text: '随时准备入院待产' },
				{ label: '宫', text: '假性宫缩更加频繁' },
				{ label: '松', text: '可能突然觉得上腹部轻松了（胎儿下降）' }
			],
			highlight: '💡 适当散步有助于胎儿入盆和顺产，但不要过度劳累'
		},
		foods: [
			{ icon: '🍯', name: '蜂蜜水', why: '分娩能量' },
			{ icon: '🍫', name: '巧克力', why: '快速能量' },
			{ icon: '🥚', name: '鸡蛋羹', why: '易消化蛋白' },
			{ icon: '🍲', name: '粥类', why: '清淡饮食' }
		],
		avoidFood: '🚫 避免：大鱼大肉、辛辣刺激、不易消化食物',
		checkup: [
			{ icon: '✓', text: '每周产检：密切关注临产征兆' },
			{ icon: '!', text: '注意胎动变化，明显减少需就医', warn: true }
		],
		preparation: [
			'注意临产征兆：规律宫缩、破水、见红',
			'保持适度活动有助顺产',
			'练习呼吸法，保持好心态',
			'确认待产包已装车，随时出发'
		]
	},
	40: {
		babyWeight: '3.5kg', babyLength: '50cm', fundalHeight: '35cm',
		baby: {
			icon: '🍉',
			paragraphs: [
				'宝宝约 3.5kg，已完全成熟，随时准备出生！',
				'宝宝已经做好了迎接新世界的全部准备，所有器官都已发育成熟。'
			],
			highlight: '🎉 到了预产期别焦虑，只有约5%的宝宝在预产期当天出生！'
		},
		mom: {
			items: [
				{ label: '心', text: '调整好心态，保持积极乐观' },
				{ label: '待', text: '随时准备入院' },
				{ label: '练', text: '继续练习呼吸法' }
			],
			highlight: '💡 超过预产期不必焦虑，医生会在41周评估是否需要催产'
		},
		foods: [
			{ icon: '🍯', name: '蜂蜜水', why: '分娩能量' },
			{ icon: '🍫', name: '巧克力', why: '快速能量' },
			{ icon: '🍲', name: '清淡饮食', why: '保持体力' },
			{ icon: '💧', name: '充足饮水', why: '保持水分' }
		],
		avoidFood: '🚫 避免：大鱼大肉、过饱饮食、生冷食物',
		checkup: [
			{ icon: '!', text: '超过41周医生会评估是否需要催产', warn: true },
			{ icon: '!', text: '胎动明显减少（12小时少于10次）请立即就医', warn: true },
			{ icon: '✓', text: '保持每周产检，密切监测' }
		],
		preparation: [
			'到了预产期别焦虑，耐心等待',
			'超过41周医生会评估催产方案',
			'规律宫缩、破水、见红是三大信号',
			'相信自己和宝宝，即将见面，加油！'
		]
	}
};

// 孕早期数据（1-12周）
const EARLY_PREGNANCY_DATA = {
	icons: ['🌱', '🌿', '🍃', '🌸', '🌺', '🌼', '🌻', '🌷', '🌹', '🥀', '🏵️', '💐'],
	weights: ['几克', '不到1g', '1g', '2g', '3g', '5g', '7g', '10g', '13g', '16g', '20g', '25g'],
	lengths: ['0.5cm', '0.7cm', '1cm', '1.5cm', '2cm', '2.5cm', '3cm', '3.5cm', '4cm', '4.5cm', '5cm', '6cm'],
	fundalHeights: ['未出盆腔', '未出盆腔', '未出盆腔', '未出盆腔', '未出盆腔', '未出盆腔', '耻骨上', '耻骨上', '耻骨上2指', '耻骨上3指', '耻骨上3指', '耻骨上4指'],
	babyParagraphs: [
		['受精卵正在分裂发育，着床在子宫壁上。', '胚胎细胞正在快速分化，形成各个器官的基础。'],
		['胚胎正在迅速发育，心脏开始跳动。', '神经管正在形成，这是大脑和脊髓的基础。'],
		['宝宝的大小像一颗蓝莓，心脏已经完全形成。', '主要器官开始形成，包括肾脏、肝脏和肺。'],
		['宝宝的大小像一颗豆子，手臂和腿芽开始出现。', '面部特征开始形成，眼睛、鼻子和嘴巴可见。'],
		['宝宝的大小像一颗葡萄，尾巴开始消失。', '手指和脚趾开始分离，骨骼开始发育。'],
		['宝宝的大小像一颗李子，可以做出皱眉动作。', '生殖器官开始发育，虽然还无法分辨性别。'],
		['宝宝的大小像一颗桃子，皮肤仍然是透明的。', '眉毛和头发开始生长，肌肉系统开始工作。'],
		['宝宝的大小像一个柠檬，可以吞咽和打嗝了。', '骨骼逐渐变硬，关节可以活动。'],
		['宝宝的大小像一个牛油果，指纹开始形成。', '宝宝的性别可以通过B超辨认了。'],
		['宝宝的大小像一个芒果，可以感受到光线了。', '皮肤开始产生色素，头发继续生长。'],
		['宝宝的大小像一个橘子，可以听到声音了。', '大脑正在快速发育，每分钟产生数千个脑细胞。'],
		['宝宝的大小像一个无花果，反射动作更加完善。', '肾脏开始产生尿液，排入羊水中。']
	],
	momItems: [
		[{ label: '经', text: '可能感觉不到任何变化，月经推迟' }, { label: '酸', text: '可能出现轻微的孕吐反应' }],
		[{ label: '酸', text: '孕吐可能加重，闻到异味就想吐' }, { label: '累', text: '容易疲劳，需要多休息' }],
		[{ label: '酸', text: '孕吐持续，嗅觉敏感' }, { label: '尿', text: '尿频开始，子宫压迫膀胱' }],
		[{ label: '酸', text: '孕吐可能达到高峰' }, { label: '胸', text: '乳房胀痛，乳晕颜色加深' }],
		[{ label: '晕', text: '可能感到头晕，血糖偏低' }, { label: '情', text: '情绪波动大，容易激动' }],
		[{ label: '酸', text: '孕吐开始减轻' }, { label: '食', text: '食欲逐渐恢复' }],
		[{ label: '重', text: '体重开始缓慢增加' }, { label: '腹', text: '腹部开始微微隆起' }],
		[{ label: '胀', text: '腹部胀满感明显' }, { label: '纹', text: '腹部可能出现妊娠纹' }],
		[{ label: '动', text: '可能开始感觉到胎动（初产妇可能感觉不到）' }, { label: '腰', text: '腰部开始感到酸胀' }],
		[{ label: '动', text: '胎动更加明显' }, { label: '便', text: '可能出现便秘' }],
		[{ label: '重', text: '体重持续增加' }, { label: '喘', text: '活动后容易气短' }],
		[{ label: '稳', text: '孕早期结束，进入相对稳定的孕中期' }, { label: '食', text: '食欲恢复，胃口大开' }]
	],
	foods: [
		[{ icon: '🥬', name: '叶酸蔬菜', why: '预防神经管畸形' }, { icon: '🥛', name: '牛奶', why: '补钙' }],
		[{ icon: '🥬', name: '菠菜', why: '叶酸丰富' }, { icon: '🍊', name: '橙子', why: '维生素C' }],
		[{ icon: '🥬', name: '深绿色蔬菜', why: '叶酸+铁' }, { icon: '🥚', name: '鸡蛋', why: '优质蛋白' }],
		[{ icon: '🍎', name: '苹果', why: '维生素+纤维' }, { icon: '🥜', name: '坚果', why: '健康脂肪' }],
		[{ icon: '🐟', name: '三文鱼', why: 'DHA' }, { icon: '🥛', name: '酸奶', why: '益生菌' }],
		[{ icon: '🥩', name: '瘦猪肉', why: '补铁' }, { icon: '🥦', name: '西兰花', why: '叶酸' }],
		[{ icon: '🍊', name: '柑橘类', why: '维生素C' }, { icon: '🥬', name: '芥蓝', why: '钙质' }],
		[{ icon: '🥛', name: '牛奶', why: '每天500ml' }, { icon: '🥚', name: '鸡蛋', why: '每天1个' }],
		[{ icon: '🐟', name: '深海鱼', why: '每周2次' }, { icon: '🥬', name: '绿叶菜', why: '多种维生素' }],
		[{ icon: '🥜', name: '核桃', why: 'DHA' }, { icon: '🍎', name: '水果', why: '适量' }],
		[{ icon: '🥩', name: '红肉', why: '补铁' }, { icon: '🥦', name: '彩色蔬菜', why: '多种营养' }],
		[{ icon: '🥛', name: '乳制品', why: '钙质' }, { icon: '🥬', name: '深色蔬菜', why: '叶酸' }]
	],
	avoidFoods: [
		'🚫 禁止：酒精、吸烟',
		'🚫 禁止：酒精、吸烟、生食',
		'🚫 禁止：生鱼片、生肉、生蛋',
		'🚫 禁止：生食、含咖啡因饮品',
		'🚫 避免：生食、高汞鱼类',
		'🚫 避免：生食、过量咖啡因',
		'🚫 避免：生冷食物、辛辣刺激',
		'🚫 避免：高糖食品、生食',
		'🚫 避免：生食、未经巴氏消毒的奶制品',
		'🚫 避免：生食、高盐食品',
		'🚫 避免：生食、含咖啡因饮品',
		'🚫 避免：生食、酒精'
	]
};

// 孕中期数据（13-27周）
const MID_PREGNANCY_DATA = {
	weights: ['140g', '160g', '190g', '220g', '260g', '300g', '350g', '400g', '450g', '500g', '550g', '600g', '650g', '700g', '800g'],
	lengths: ['12cm', '13cm', '14cm', '15cm', '16cm', '17cm', '18cm', '19cm', '21cm', '22cm', '23cm', '24cm', '25cm', '26cm', '27cm'],
	fundalHeights: ['耻骨上5指', '耻骨上6指', '耻骨上7指', '脐下2指', '脐下1指', '脐平', '脐上1指', '脐上2指', '脐上3指', '脐上4指', '脐上5指', '脐上6指', '脐上7指', '脐上8指', '脐上9指'],
	checkupData: [
		{ week: 13-16, checkup: [{ icon: '✓', text: '建档产检：血常规、尿常规、肝肾功能' }, { icon: '✓', text: 'NT检查（12-14周）' }] },
		{ week: 16-18, checkup: [{ icon: '✓', text: '唐氏筛查（15-20周）' }, { icon: '✓', text: '羊水穿刺（35岁以上）' }] },
		{ week: 20-24, checkup: [{ icon: '✓', text: '大排畸B超（20-24周）' }, { icon: '�', text: '血糖筛查（24周）' }] },
		{ week: 24-28, checkup: [{ icon: '✓', text: '糖耐量测试（24-28周）' }, { icon: '✓', text: '血常规复查（查贫血）' }] }
	]
};

// 生成1-12周数据
function generateEarlyWeek(week) {
	const idx = week - 1;
	return {
		week,
		baby_weight: EARLY_PREGNANCY_DATA.weights[idx],
		baby_length: EARLY_PREGNANCY_DATA.lengths[idx],
		fundal_height: EARLY_PREGNANCY_DATA.fundalHeights[idx],
		baby: {
			icon: EARLY_PREGNANCY_DATA.icons[idx],
			paragraphs: EARLY_PREGNANCY_DATA.babyParagraphs[idx],
			highlight: `🎉 孕${week}周，宝宝${EARLY_PREGNANCY_DATA.weights[idx]}，${EARLY_PREGNANCY_DATA.lengths[idx]}长！`
		},
		mom: {
			items: EARLY_PREGNANCY_DATA.momItems[idx],
			highlight: '💡 孕早期是器官发育关键期，注意补充叶酸，避免接触有害物质'
		},
		foods: EARLY_PREGNANCY_DATA.foods[idx],
		avoid_food: EARLY_PREGNANCY_DATA.avoidFoods[idx],
		checkup: [
			{ icon: '✓', text: week <= 12 ? '孕12周左右进行NT检查（颈项透明层扫描）' : '定期产检，监测胎儿发育' }
		],
		preparation: [
			'补充叶酸，每天400微克',
			'避免接触有害物质和辐射',
			'保持规律作息，避免剧烈运动',
			'如有出血或腹痛，及时就医'
		]
	};
}

// 生成13-27周数据
function generateMidWeek(week) {
	const idx = week - 13;
	const phase = Math.floor(idx / 4); // 0-3, 每个阶段约4周

	let checkup = [];
	if (week >= 13 && week <= 16) {
		checkup = [
			{ icon: '✓', text: '建档产检：血常规、尿常规、肝肾功能' },
			{ icon: '✓', text: 'NT检查（12-14周，如未做）' }
		];
	} else if (week >= 16 && week <= 18) {
		checkup = [
			{ icon: '✓', text: '唐氏筛查（15-20周）' },
			{ icon: '!', text: '35岁以上建议羊水穿刺', warn: true }
		];
	} else if (week >= 20 && week <= 24) {
		checkup = [
			{ icon: '✓', text: '大排畸B超（20-24周）' },
			{ icon: '✓', text: '测量宫高腹围，评估胎儿大小' }
		];
	} else if (week >= 24 && week <= 28) {
		checkup = [
			{ icon: '✓', text: '糖耐量测试（24-28周）' },
			{ icon: '!', text: '注意妊娠糖尿病筛查', warn: true }
		];
	}

	const trimesterIcons = ['🤰', '🤰', '🤰', '🤰', '🤰', '🤰', '🤰', '🤰', '🤰', '🤰', '🤰', '🤰', '🤰', '🤰', '🤰'];

	return {
		week,
		baby_weight: MID_PREGNANCY_DATA.weights[idx],
		baby_length: MID_PREGNANCY_DATA.lengths[idx],
		fundal_height: MID_PREGNANCY_DATA.fundalHeights[idx],
		baby: {
			icon: trimesterIcons[idx] || '👶',
			paragraphs: [
				`宝宝约 ${MID_PREGNANCY_DATA.weights[idx]}，身长约 ${MID_PREGNANCY_DATA.lengths[idx]}。`,
				'皮下脂肪开始积累，皮肤逐渐变得不再那么透明。'
			],
			highlight: `🎉 孕中期是宝宝快速发育的时期，注意均衡营养！`
		},
		mom: {
			items: [
				{ label: '显', text: '腹部明显隆起，孕味十足' },
				{ label: '动', text: '胎动越来越明显' },
				{ label: '食', text: '食欲增加，注意控制体重' }
			],
			highlight: '💡 孕中期相对舒适，适合进行适量运动，如散步、孕妇瑜伽'
		},
		foods: [
			{ icon: '🥩', name: '瘦肉', why: '补铁' },
			{ icon: '🥛', name: '牛奶', why: '补钙' },
			{ icon: '🐟', name: '鱼类', why: 'DHA' },
			{ icon: '🥦', name: '蔬菜', why: '维生素' },
			{ icon: '🍚', name: '全谷物', why: '膳食纤维' }
		],
		avoid_food: '🚫 避免：生食、高糖高盐、过量咖啡因',
		checkup,
		preparation: [
			'开始准备婴儿用品清单',
			'了解分娩知识和产房情况',
			'保持适当运动，控制体重增长',
			'学习数胎动的方法'
		]
	};
}

// 生成28-29周数据（衔接30周）
function generateLateWeek(week) {
	const baseWeek = 30;
	return {
		week,
		baby_weight: week === 28 ? '1.1kg' : '1.2kg',
		baby_length: week === 28 ? '38cm' : '39cm',
		fundal_height: '28cm',
		baby: {
			icon: '🥥',
			paragraphs: [
				`宝宝约 ${week === 28 ? '1.1kg' : '1.2kg'}，大脑持续快速发育。`,
				'肺部继续成熟，为出生后的呼吸做准备。'
			],
			highlight: `🎉 距离孕晚期越来越近，宝宝正在为出生做最后准备！`
		},
		mom: {
			items: [
				{ label: '气', text: '可能开始感到气短' },
				{ label: '胀', text: '腹部增大，消化变慢' },
				{ label: '累', text: '容易疲劳，需要多休息' }
			],
			highlight: '💡 进入孕晚期前，提前了解分娩知识和准备待产包'
		},
		foods: [
			{ icon: '🐟', name: '深海鱼', why: 'DHA脑发育' },
			{ icon: '🥩', name: '红肉', why: '补铁防贫血' },
			{ icon: '🥛', name: '牛奶', why: '每天500ml' },
			{ icon: '🥚', name: '鸡蛋', why: '优质蛋白' },
			{ icon: '🥦', name: '深色蔬菜', why: '维生素' }
		],
		avoid_food: '🚫 避免：生鱼片、高汞鱼、酒精、过量咖啡因',
		checkup: [
			{ icon: '✓', text: '每两周产检一次' },
			{ icon: '!', text: '注意血压变化，预防妊娠高血压', warn: true }
		],
		preparation: [
			'开始准备待产包清单',
			'了解分娩方式选择',
			'学习拉玛泽呼吸法',
			'确认就诊医院路线'
		]
	};
}

// 转换为数据库格式
function toDbFormat(week, data) {
	// 处理 babyWeight -> baby_weight, babyLength -> baby_length, fundalHeight -> fundal_height
	return {
		week,
		baby_weight: data.babyWeight || data.baby_weight,
		baby_length: data.babyLength || data.baby_length,
		fundal_height: data.fundalHeight || data.fundal_height,
		baby: data.baby,
		mom: data.mom,
		foods: data.foods,
		avoid_food: data.avoidFood || data.avoid_food,
		checkup: data.checkup,
		preparation: data.preparation
	};
}

// 生成完整的40周数据
function generateAllWeeks() {
	const allData = [];

	// 1-12周：孕早期
	for (let week = 1; week <= 12; week++) {
		const data = generateEarlyWeek(week);
		allData.push(toDbFormat(week, data));
	}

	// 13-27周：孕中期
	for (let week = 13; week <= 27; week++) {
		const data = generateMidWeek(week);
		allData.push(toDbFormat(week, data));
	}

	// 28-29周：孕晚期前
	for (let week = 28; week <= 29; week++) {
		const data = generateLateWeek(week);
		allData.push(toDbFormat(week, data));
	}

	// 30-40周：使用现有数据
	for (let week = 30; week <= 40; week++) {
		if (EXISTING_DATA[week]) {
			allData.push(toDbFormat(week, EXISTING_DATA[week]));
		}
	}

	return allData;
}

// 导出命令
function exportData() {
	const allData = generateAllWeeks();
	const lines = allData.map(d => JSON.stringify(d));
	const output = lines.join('\n');

	console.log(`Generated ${allData.length} weeks of pregnancy guide data`);
	console.log(`Output file: scripts/pregnancy-weekly-guide-data.json`);

	// 写入文件
	const fs = require('fs');
	const path = require('path');
	const outputFile = path.join(__dirname, 'pregnancy-weekly-guide-data.json');
	fs.writeFileSync(outputFile, output, 'utf8');

	console.log('✓ Export complete!');
}

// CLI入口
const args = process.argv.slice(2);
const command = args[0];

if (command === 'export') {
	exportData();
} else {
	console.log('Usage: node scripts/seed-weekly-guide-data.js export');
	console.log('  export  - 导出数据到 JSON 文件（uniCloud 导入格式）');
	process.exit(1);
}
