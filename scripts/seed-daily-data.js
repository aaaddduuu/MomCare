/**
 * 孕期每日变化数据填充脚本
 * 用法: node scripts/seed-daily-data.js
 *
 * 需要先配置 uniCloud serverSDK:
 * 1. 在项目根目录创建 uni-cloud-local-config.json
 * 2. 填入 spaceId 和 clientSecret
 */

// ── 基础数据（复用现有硬编码数据） ──

// 孕 4-40 周摘要数据（来自原 DailyChanges.vue WEEKLY_CHANGES）
const WEEKLY_SUMMARY = {
  4: {
    baby: { icon: '🫘', text: '胚胎刚着床，约罂粟籽大小，细胞快速分裂' },
    mom: { icon: '🌡', text: '可能出现轻微腹痛，类似经前感' },
    tips: ['开始补充叶酸，每天0.4mg', '避免剧烈运动和高温环境', '远离烟酒和有害化学物质', '确认怀孕后尽早建档', '记录末次月经日期，计算预产期']
  },
  5: {
    baby: { icon: '🍎', text: '约苹果籽大小，心脏开始形成并跳动' },
    mom: { icon: '💊', text: '早孕反应可能出现，恶心嗜睡' },
    tips: ['少食多餐缓解孕吐', '保持充足睡眠', '选择清淡易消化食物', '准备早孕试纸确认怀孕', '开始记录孕期日记']
  },
  6: {
    baby: { icon: '🫐', text: '约蓝莓大小，面部五官开始成形' },
    mom: { icon: '😴', text: '嗜睡乏力明显，乳房胀痛' },
    tips: ['孕吐严重可尝试生姜水', '穿舒适的内衣减轻胀痛', '避免长时间站立', '多喝水保持水分', '情绪波动是正常的，适当休息']
  },
  7: {
    baby: { icon: '🫐', text: '约蓝莓大小，手指脚趾开始分化' },
    mom: { icon: '🤢', text: '孕吐高峰期，嗅觉变得敏感' },
    tips: ['柠檬水有助缓解恶心', '远离刺激性气味', '维B6可能缓解孕吐', '饭后不要立即躺下', '如果孕吐严重无法进食请就医']
  },
  8: {
    baby: { icon: '🍇', text: '约葡萄大小，四肢可活动，尾巴消失' },
    mom: { icon: '🩲', text: '腰围开始变粗，子宫如拳头大' },
    tips: ['选择宽松舒适的孕妇装', '第一次B超检查可以安排', '继续补充叶酸', '记录体重变化', '适当散步有助缓解不适']
  },
  9: {
    baby: { icon: '🍒', text: '约樱桃大小，所有器官已初步形成' },
    mom: { icon: '😤', text: '情绪波动大，容易烦躁或哭泣' },
    tips: ['与伴侣分享你的感受', '听舒缓音乐放松心情', '适当运动改善情绪', '孕期瑜伽是不错的选择', '加入孕妈交流群获取支持']
  },
  10: {
    baby: { icon: '🍓', text: '约草莓大小，手指脚趾完全分开' },
    mom: { icon: '💫', text: '孕吐开始减轻，食欲逐渐恢复' },
    tips: ['营养均衡，增加蛋白质摄入', '可以选择合适的孕妇奶粉', '开始做孕妇操', '注意口腔卫生', '预约11-13周NT检查']
  },
  11: {
    baby: { icon: '🍋', text: '约柠檬大小，生殖器开始发育' },
    mom: { icon: '😊', text: '早孕反应消退，进入舒适期' },
    tips: ['趁精力好，规划产检时间表', '学习孕期营养知识', '选购孕妇装', '可以开始轻柔的产前运动', '告诉家人和朋友好消息']
  },
  12: {
    baby: { icon: '🍋', text: '约柠檬大小，骨骼硬化，能做表情' },
    mom: { icon: '💪', text: '流产风险降低，身体更稳定' },
    tips: ['NT检查最佳时间（11-13周+6）', '开始建档和全面产检', '血压和体重基线检测', '告知单位怀孕消息', '拍摄孕照留念']
  },
  13: {
    baby: { icon: '🍑', text: '约桃子大小，指纹已形成' },
    mom: { icon: '🌟', text: '孕中期开始，精力恢复，食欲好' },
    tips: ['进入孕中期，注意营养均衡', '体重增长每周约0.5kg为正常', '适当增加运动量', '开始涂抹妊娠纹预防霜', '学习数胎动的方法']
  },
  14: {
    baby: { icon: '🍋', text: '约柠檬大小，长出细软胎毛' },
    mom: { icon: '🎀', text: '腹部微微隆起，可能长妊娠线' },
    tips: ['左侧卧位有助于血液循环', '开始进行凯格尔运动', '注意补钙，每天800mg', '保持规律作息', '可以选择孕妇游泳']
  },
  15: {
    baby: { icon: '🍑', text: '约桃子大小，可以听到声音了' },
    mom: { icon: '🎈', text: '肚子逐渐变大，可以感受到胎动' },
    tips: ['开始和宝宝说话，进行胎教', '注意补充铁和钙', '避免提重物', '定期产检', '保持好心情']
  },
  16: {
    baby: { icon: '🥑', text: '约牛油果大小，可能在吸吮手指' },
    mom: { icon: '🎈', text: '肚子明显隆起，开始显怀' },
    tips: ['唐筛/无创DNA最佳时间', '开始感受胎动（初产妇可能还早）', '选择舒适的平底鞋', '注意补铁预防贫血', '可以开始胎教音乐']
  },
  17: {
    baby: { icon: '🥭', text: '约芒果大小，皮下脂肪开始积累' },
    mom: { icon: '🦵', text: '体重增加，注意控制' },
    tips: ['注意体重管理', '补充DHA', '适当运动', '定期产检', '避免久坐久站']
  },
  18: {
    baby: { icon: '🫑', text: '约甜椒大小，能听到声音了' },
    mom: { icon: '🦶', text: '胎动明显，初产妇感受到第一次' },
    tips: ['记录第一次胎动的时间', '和宝宝说话、听音乐', '增加DHA摄入促进宝宝大脑', '侧卧时用枕头支撑腹部', '预约20-24周大排畸B超']
  },
  19: {
    baby: { icon: '🍌', text: '约香蕉大小，感觉器官发育' },
    mom: { icon: '🩲', text: '腹部增大，需要孕妇装' },
    tips: ['准备孕妇装', '注意胎动', '补充铁和钙', '适当运动', '保持好心情']
  },
  20: {
    baby: { icon: '🍌', text: '约香蕉大小，全身覆盖胎脂' },
    mom: { icon: '📐', text: '宫底到肚脐，肚子越来越大' },
    tips: ['大排畸B超（20-24周）', '每天规律数胎动', '注意是否有宫缩', '准备孕妇托腹带', '学习拉玛泽呼吸法']
  },
  21: {
    baby: { icon: '🥭', text: '约芒果大小，眉毛睫毛生长' },
    mom: { icon: '💪', text: '精力充沛，享受孕期' },
    tips: ['注意胎动规律', '补充蛋白质', '适当运动', '定期产检', '准备待产包']
  },
  22: {
    baby: { icon: '🥭', text: '约芒果大小，眉毛眼睑成型' },
    mom: { icon: '🦵', text: '腿部可能开始抽筋' },
    tips: ['睡前拉伸小腿预防抽筋', '补充钙和镁', '监测血压', '保持适度运动', '开始准备宝宝用品清单']
  },
  23: {
    baby: { icon: '🌽', text: '约玉米大小，肺部发育' },
    mom: { icon: '🦵', text: '腿部抽筋可能加重' },
    tips: ['继续补钙', '注意腿部按摩', '适当运动', '监测体重', '准备待产包']
  },
  24: {
    baby: { icon: '🌽', text: '约玉米大小，肺部快速发育' },
    mom: { icon: '🔍', text: '肚子更圆更大，重心前移' },
    tips: ['糖耐量试验(OGTT)最佳时间', '注意妊娠糖尿病风险', '控制甜食和水果摄入', '产检频率变为每两周一次', '开始考虑待产包清单']
  },
  25: {
    baby: { icon: '🥬', text: '约生菜大小，眼睛睁开' },
    mom: { icon: '💤', text: '睡眠质量下降' },
    tips: ['使用孕妇枕', '左侧卧', '注意胎位', '监测体重', '了解早产征兆']
  },
  26: {
    baby: { icon: '🥬', text: '约生菜大小，眼睛能睁开了' },
    mom: { icon: '💤', text: '睡眠质量下降，翻身困难' },
    tips: ['使用孕妇枕改善睡眠', '避免仰卧位', '注意胎位是否正常', '监测体重增长速度', '了解早产征兆']
  },
  27: {
    baby: { icon: '🥬', text: '约生菜大小，视力发育' },
    mom: { icon: '🦵', text: '水肿可能加重' },
    tips: ['抬高双脚缓解水肿', '注意休息', '监测血压', '准备待产包', '了解分娩征兆']
  },
  28: {
    baby: { icon: '🍆', text: '约茄子大小，约1kg，能做梦了' },
    mom: { icon: '📊', text: '进入孕晚期，产检更频繁' },
    tips: ['开始数胎动，每天3次每次1小时', '产检改为每两周一次', '注意是否有水肿', '了解胎位不正的纠正方法', '开始准备待产包']
  },
  29: {
    baby: { icon: '🥥', text: '约椰子大小，骨骼在快速钙化' },
    mom: { icon: '📋', text: '假性宫缩可能出现' },
    tips: ['区分真假宫缩', '了解早产征兆', '继续数胎动', '注意休息避免劳累', '确认待产医院路线']
  },
  30: {
    baby: { icon: '🥥', text: '约椰子大小，约1.3kg，大脑快速发育' },
    mom: { icon: '💓', text: '心输出量达到峰值，容易气短' },
    tips: ['补充DHA和铁', '避免长时间站立', '了解分娩征兆', '和医生讨论分娩计划', '练习拉玛泽呼吸']
  },
  31: {
    baby: { icon: '🥥', text: '约椰子大小，五官精致，能转头' },
    mom: { icon: '🫁', text: '气短尿频加重' },
    tips: ['少量多餐减轻胃部不适', '保持大便通畅', '学习分娩呼吸法', '了解无痛分娩选项', '准备哺乳用品']
  },
  32: {
    baby: { icon: '👶', text: '约1.8kg，头部开始朝下入盆' },
    mom: { icon: '💆', text: '子宫扩大，气短与胃部不适明显' },
    tips: ['少量多餐，每天记录胎动', '12小时胎动少于10次请就医', '准备待产包', '了解剖腹产指征', '确认陪产人员']
  },
  33: {
    baby: { icon: '👶', text: '约2kg，皮肤不再那么红皱' },
    mom: { icon: '🦵', text: '骨盆韧带松弛，走路更吃力' },
    tips: ['产检改为每周一次', '注意区分破水和漏尿', '了解催产素', '准备新生儿用品', '提前安排月嫂或家人陪护']
  },
  34: {
    baby: { icon: '🧠', text: '约2.2kg，中枢神经系统成熟中' },
    mom: { icon: '🫁', text: '胎头入盆后呼吸轻松一些' },
    tips: ['了解分娩流程', '练习分娩呼吸', '确认待产包是否齐全', '了解新生儿护理基础', '准备宝宝的衣服和尿布']
  },
  35: {
    baby: { icon: '✨', text: '约2.4kg，皮下脂肪丰满起来' },
    mom: { icon: '🤱', text: '初乳开始分泌' },
    tips: ['学习哺乳姿势', '了解开奶知识', '保持乳房清洁', '准备哺乳文胸和防溢乳垫', '了解新生儿疫苗接种']
  },
  36: {
    baby: { icon: '🍈', text: '约2.6kg，头部入盆固定' },
    mom: { icon: '💪', text: '下腹坠胀感，尿频严重' },
    tips: ['每周产检一次', '了解入院流程', '准备证件资料', '了解无痛分娩', '确认紧急联系人']
  },
  37: {
    baby: { icon: '🍈', text: '约2.9kg，肺部已成熟，随时可出生' },
    mom: { icon: '🎯', text: '宝宝入盆，胃部轻松些了' },
    tips: ['已足月，随时准备入院', '分辨真假宫缩', '破水后立即去医院', '准备好证件和待产包', '保持电话畅通']
  },
  38: {
    baby: { icon: '🍉', text: '约3.1kg，继续积累脂肪' },
    mom: { icon: '⏰', text: '随时可能发动，注意征兆' },
    tips: ['规律宫缩5-6分钟一次就去医院', '见红不必慌张，观察量', '破水要立即平躺去医院', '保持手机充满电', '深呼吸保持冷静']
  },
  39: {
    baby: { icon: '🍉', text: '约3.3kg，已经足月完全成熟' },
    mom: { icon: '🏥', text: '随时准备入院待产' },
    tips: ['注意临产征兆', '保持适度活动有助顺产', '练习呼吸法', '确认待产包已装车', '保持好心态']
  },
  40: {
    baby: { icon: '🍉', text: '约3.5kg，已完全成熟，准备出生' },
    mom: { icon: '🌹', text: '临产在即，调整好心态' },
    tips: ['到了预产期别焦虑', '超过41周医生会评估催产', '规律宫缩、破水、见红是三大信号', '相信自己和宝宝', '即将见面，加油！']
  }
}

// 孕 28-40 周详细数据（来自原 daily-data.js）
const DETAILED_WEEKS = {
  28: {
    baby: { icon: '🫁', detail: '宝宝约 1kg，肺部快速发育中，肺泡表面活性物质开始分泌。宝宝已经有了规律的睡眠和清醒周期，在做梦时眼球会快速转动（REM）。', highlight: '💡 从现在开始，宝宝如果早产，存活率已大幅提高，但仍需要在 NICU 接受专业护理。' },
    mom: { icon: '📊', detail: '进入孕晚期，产检频率将增加。子宫底部高度约 28cm，肚子明显更大了，行动开始变得不太方便。注意监测血压和体重变化。' },
    diet: ['增加铁质摄入：红肉、菠菜、豆腐，配合维C促进吸收', '每天保证 1000mg 钙：牛奶、酸奶、虾皮', '补充 DHA：深海鱼每周 2 次', '控制甜食摄入，预防妊娠糖尿病'],
    care: ['开始数胎动，每天 3 次，每次 1 小时', '12 小时胎动少于 10 次需就医', '产检改为每两周一次', '注意是否有水肿加重的情况']
  },
  29: {
    baby: { icon: '🦴', detail: '宝宝的骨骼在快速钙化，变得更硬更结实。肌肉也在发育，运动更有力。五官已经非常精致，能做出各种面部表情。', highlight: '💡 宝宝现在能感受到光线变化，用手电筒照肚子，宝宝可能会有反应哦！' },
    mom: { icon: '📋', detail: '假性宫缩（Braxton Hicks）可能出现，感觉肚子突然变硬然后放松，这是子宫在为分娩做练习。如果宫缩变得规律或伴有疼痛，需要立即联系医生。' },
    diet: ['继续补充钙和维生素D，促进宝宝骨骼发育', '增加蛋白质摄入，支持宝宝肌肉生长', '多吃富含铁的食物，预防孕晚期贫血', '少量多餐，避免胃部不适'],
    care: ['学会区分真假宫缩', '了解早产征兆：规律宫缩、破水、见红', '继续每天数胎动', '注意休息，避免过度劳累', '确认待产医院路线']
  },
  30: {
    baby: { icon: '🧠', detail: '宝宝约 1.3kg，大脑快速发育，脑回加深，表面出现更多沟裂。大脑皮层开始有更复杂的功能分区，为出生后的学习能力打基础。', highlight: '💡 从现在开始，宝宝的大脑发育进入冲刺期，DHA 补充非常关键！' },
    mom: { icon: '💓', detail: '心输出量达到孕期峰值，活动后容易气短。手脚水肿常见，避免久站久坐，休息时抬高双脚。腰背酸痛加剧，使用托腹带有帮助。' },
    diet: ['每天补充 DHA 200mg：深海鱼或藻油', '补铁防贫血：红肉、动物肝脏（每周1次）', '每天 500ml 牛奶补钙', '多吃富含纤维的食物防便秘'],
    care: ['了解分娩方式选择，与医生讨论分娩计划', '开始学习拉玛泽呼吸法', '准备待产包清单', '确认就诊医院路线和紧急联系方式', '注意血压变化，预防妊娠高血压']
  },
  31: {
    baby: { icon: '👶', detail: '宝宝约 1.5kg，五官已经非常精致，能够转头、做出面部表情。五感发育更加完善，能感受到光线和声音的变化。宝宝已经能记忆一些反复出现的声音。', highlight: '💡 多和宝宝说话、放音乐，宝宝出生后可能会对这些声音更敏感！' },
    mom: { icon: '🫁', detail: '气短和尿频加重，活动后需要多休息。胃被挤压，少量多餐很重要。便秘可能加重，多喝水多吃富含纤维的食物。' },
    diet: ['少量多餐，每天 5-6 餐减轻胃部不适', '保持大便通畅：多喝水、多吃蔬菜水果', '补充益生菌有助于消化', '继续补充铁和钙'],
    care: ['学习分娩呼吸法，每天练习几分钟', '了解母乳喂养基础知识', '准备哺乳用品（文胸、防溢乳垫）', '安排好产假和工作交接', '出现规律宫缩或出血请立即就医']
  },
  32: {
    baby: { icon: '👶', detail: '宝宝体重约 1.8kg，已开始尝试将头部转向下方，为分娩做准备。大脑褶皱不断加深，脑容量快速增长。双眼可以感知光亮，对强光有反应。', highlight: '💡 从现在到出生，宝宝体重还将增加约 1.5kg，大部分都是皮下脂肪哦！' },
    mom: { icon: '💆', detail: '子宫底部高度约 31cm，随着宝宝成长，横膈膜被向上推，导致气短感加剧。胃也受到挤压，饭后容易感到饱胀不适。保持少量多餐的饮食习惯非常重要。' },
    diet: ['增加铁质摄入：红肉、菠菜、豆腐，配合维C促进吸收', '每天保证 1000mg 钙：牛奶、酸奶、虾皮', '少量多餐，每餐七八分饱', '补充 DHA：深海鱼（三文鱼、鳕鱼）每周 2 次'],
    care: ['每天数胎动 3 次，每次 1 小时', '12 小时胎动少于 10 次需就医', '避免长时间站立，适当抬高双脚缓解水肿', '出现规律宫缩（每10分钟1次）请立即联系医院']
  },
  33: {
    baby: { icon: '👶', detail: '宝宝约 2kg，皮肤不再那么红皱，皮下脂肪越来越丰富，变得更白嫩。免疫系统正在发育，从母体接收抗体，为出生后建立抵抗力做准备。', highlight: '💡 给宝宝放轻柔的音乐是很好的早教，宝宝出生后可能会对这些声音更敏感！' },
    mom: { icon: '🦵', detail: '骨盆韧带松弛，走路更吃力。乳房在为哺乳做准备，初乳分泌增加。睡眠质量下降，翻身困难。尿频加重，夜间需要多次起夜。' },
    diet: ['继续补充钙：每天 500ml 牛奶', '补铁食物：红肉、动物肝脏', '坚果作为零食：核桃、杏仁补充优质脂肪', '深色蔬菜补充叶酸和铁'],
    care: ['产检改为每两周一次', '注意区分破水和漏尿', '提前安排月嫂或家人陪护', '准备新生儿用品', '了解哺乳姿势和开奶知识']
  },
  34: {
    baby: { icon: '🧠', detail: '宝宝约 2.2kg，中枢神经系统继续成熟，肺部也接近完全成熟。如果现在出生，宝宝已经可以自主呼吸，不需要太多医疗辅助。', highlight: '🎉 从这个阶段开始，宝宝的肺部基本成熟，是一个重要的里程碑！' },
    mom: { icon: '🫁', detail: '胎头入盆后呼吸会轻松一些，但尿频更加明显，膀胱被压迫。手脚水肿继续，抬高双脚有帮助。' },
    diet: ['继续补铁和钙', '红薯等膳食纤维食物防便秘', '酸奶补充钙和益生菌', '橙子等水果补充维C'],
    care: ['了解分娩流程和入院手续', '练习分娩呼吸法', '确认待产包已准备齐全', '了解新生儿护理基础知识', '了解早产征兆：规律宫缩、破水、见红']
  },
  35: {
    baby: { icon: '✨', detail: '宝宝约 2.4kg，皮下脂肪越来越丰满，圆润可爱。肾脏已经发育成熟，肝脏也在积蓄铁质，为出生后做准备。', highlight: '🎉 大部分宝宝到这一周已经头部朝下，做好了入盆准备！' },
    mom: { icon: '🤱', detail: '初乳开始分泌，乳房在为哺乳做最后准备。下腹坠胀感明显，宝宝在向下移动。假性宫缩可能更频繁。' },
    diet: ['继续补钙和补铁', '深海鱼补充 DHA', '牛油果等优质脂肪', '少量多餐减轻胃部不适'],
    care: ['GBS（B 族链球菌）筛查本周进行', '产检改为每周一次', '胎位确认，如为臀位需讨论分娩方案', '学习哺乳姿势和开奶知识', '出现规律宫缩请立即联系医院']
  },
  36: {
    baby: { icon: '🍈', detail: '宝宝约 2.6kg，头部已入盆固定，为分娩做好准备。肺部已基本成熟，各项器官已具备出生后独立运作的能力。', highlight: '🎉 宝宝现在如果出生就是足月了，大部分宝宝都能健康存活！' },
    mom: { icon: '💪', detail: '下腹坠胀感强烈，宝宝完全入盆了。尿频非常严重，膀胱被完全压迫。走路更加困难。几乎找不到舒服的睡姿。' },
    diet: ['蜂蜜水补充能量', '牛奶继续补钙', '香蕉防便秘', '少量多餐轻松消化'],
    care: ['每周产检：胎心监护 + 宫高腹围测量', '确认胎位和入盆状态', '了解入院流程和手续', '准备好所有证件资料', '了解无痛分娩选项']
  },
  37: {
    baby: { icon: '🍈', detail: '宝宝约 2.9kg，肺部已完全成熟，随时可以出生。免疫系统已准备好迎接外部世界，从母体获得了大量抗体。', highlight: '🎉 宝宝已经足月啦！随时准备见面！' },
    mom: { icon: '🎯', detail: '宝宝入盆后胃部轻松了一些，但下腹坠胀感更明显。假性宫缩频繁。可能出现宫颈黏液栓排出（见红前兆）。' },
    diet: ['蜂蜜水补充能量', '鸡蛋补充优质蛋白', '粥类等易消化食物', '保持充足水分'],
    care: ['随时准备入院，待产包放在显眼位置', '分辨真假宫缩', '破水后立即平躺去医院', '保持电话畅通，确认陪产人员']
  },
  38: {
    baby: { icon: '🍉', detail: '宝宝约 3.1kg，继续积累脂肪，越来越圆润。肠道内开始积聚胎便（墨绿色），出生后 1-2 天会排出。', highlight: '🎉 宝宝已经做好了一切准备，随时等待与你见面！' },
    mom: { icon: '⏰', detail: '随时可能发动，注意宫缩规律。走路非常困难，尽量休息。几乎无法好好睡觉。' },
    diet: ['蜂蜜水、巧克力备好，随时补充分娩能量', '清淡饮食减轻胃部负担', '保持充足水分', '不要过饱饮食'],
    care: ['规律宫缩 5-6 分钟一次就去医院', '见红不必慌张，观察出血量', '破水要立即平躺去医院', '保持手机充满电', '超过预产期一周医生会评估是否催产']
  },
  39: {
    baby: { icon: '🍉', detail: '宝宝约 3.3kg，已经足月完全成熟，随时准备出生。头部已深入骨盆，做好了最后的出发准备。', highlight: '🎉 宝宝已经在门口等着了，保持好心态，即将见面！' },
    mom: { icon: '🏥', detail: '随时准备入院待产。假性宫缩更加频繁。可能突然觉得上腹部轻松了（胎儿下降感）。' },
    diet: ['蜂蜜水、巧克力备好', '鸡蛋羹等易消化蛋白', '粥类清淡饮食', '保持充足水分'],
    care: ['注意临产征兆：规律宫缩、破水、见红', '保持适度活动有助顺产', '练习呼吸法，保持好心态', '确认待产包已装车']
  },
  40: {
    baby: { icon: '🍉', detail: '宝宝约 3.5kg，已完全成熟，随时准备出生。所有器官都已发育成熟，做好了迎接新世界的全部准备。', highlight: '🎉 到了预产期别焦虑，只有约 5% 的宝宝在预产期当天出生！' },
    mom: { icon: '🌹', detail: '调整好心态，保持积极乐观。随时准备入院。继续练习呼吸法。' },
    diet: ['蜂蜜水补充分娩能量', '巧克力快速补充能量', '清淡饮食保持体力', '充足饮水保持水分'],
    care: ['到了预产期别焦虑，耐心等待', '超过 41 周医生会评估催产方案', '规律宫缩、破水、见红是三大信号', '相信自己和宝宝，即将见面，加油！']
  }
}

// 孕 0-3 周的基础数据（孕前/着床前）
const EARLY_WEEKS = [
  { week: 0, days: 7, baby: { icon: '🫘', text: '卵子正在成熟，等待受精' }, mom: { icon: '🩺', text: '月经开始，记录周期日期' }, tips: ['记录末次月经日期', '保持健康生活方式', '开始补充叶酸', '戒烟戒酒'] },
  { week: 1, days: 7, baby: { icon: '🥚', text: '排卵期，卵子即将释放' }, mom: { icon: '📅', text: '排卵期，容易受孕' }, tips: ['记录排卵日期', '保持心情放松', '补充叶酸', '避免剧烈运动'] },
  { week: 2, days: 7, baby: { icon: '💕', text: '受精卵正在分裂' }, mom: { icon: '🌡', text: '可能着床，体温略升' }, tips: ['注意休息', '避免用药', '补充叶酸', '保持好心情'] },
  { week: 3, days: 7, baby: { icon: '🫘', text: '胚胎正在着床' }, mom: { icon: '🌡', text: '可能出现轻微着床出血' }, tips: ['注意休息', '避免性生活', '补充叶酸', '远离有害物质'] }
]

// ── 数据生成函数 ──

/**
 * 根据孕天生成完整数据
 * @param {number} totalDays - 孕总天数 (0-279)
 */
function generateDayData(totalDays) {
  const week = Math.floor(totalDays / 7)
  const dayInWeek = totalDays % 7

  // 孕 0-3 周特殊处理
  if (week <= 3) {
    const earlyWeek = EARLY_WEEKS[week]
    return {
      total_days: totalDays,
      week: week,
      day_in_week: dayInWeek,
      baby_icon: earlyWeek.baby.icon,
      baby_summary: earlyWeek.baby.text,
      baby_detail: earlyWeek.baby.text + '。保持健康的生活方式，为宝宝的到来做好准备。',
      baby_highlight: '',
      mom_icon: earlyWeek.mom.icon,
      mom_summary: earlyWeek.mom.text,
      mom_detail: earlyWeek.mom.text + '。注意休息，补充叶酸，远离有害物质。',
      tip_icon: '💡',
      tip_text: earlyWeek.tips[dayInWeek % earlyWeek.tips.length],
      diet_tips: ['补充叶酸每天0.4mg', '均衡饮食，营养全面', '多吃新鲜蔬菜水果', '避免生冷食物'],
      care_tips: earlyWeek.tips
    }
  }

  // 孕 4-27 周：使用 WEEKLY_SUMMARY，通过 dayInWeek 产生差异
  if (week >= 4 && week <= 27) {
    const weekData = WEEKLY_SUMMARY[week] || WEEKLY_SUMMARY[4]
    // 根据 dayInWeek 轮换 tips 产生日间差异
    const rotatedTips = [...weekData.tips.slice(dayInWeek), ...weekData.tips.slice(0, dayInWeek)]
    return {
      total_days: totalDays,
      week: week,
      day_in_week: dayInWeek,
      baby_icon: weekData.baby.icon,
      baby_summary: weekData.baby.text,
      baby_detail: `${weekData.baby.text}。宝宝的发育每天都在进步，妈妈们要保持良好的心态。`,
      baby_highlight: '',
      mom_icon: weekData.mom.icon,
      mom_summary: weekData.mom.text,
      mom_detail: `${weekData.mom.text}。注意休息，保持营养均衡。`,
      tip_icon: '💡',
      tip_text: rotatedTips[0] || weekData.tips[0],
      diet_tips: ['均衡营养，多吃蛋白质', '补充叶酸和维生素', '多吃新鲜蔬菜水果', '保持充足水分'],
      care_tips: rotatedTips.slice(0, 5)
    }
  }

  // 孕 28-40 周：使用 DETAILED_WEEKS，通过 dayInWeek 轮换 diet 和 care
  if (week >= 28 && week <= 40) {
    const weekData = DETAILED_WEEKS[week] || DETAILED_WEEKS[28]
    const rotatedDiet = [...weekData.diet.slice(dayInWeek), ...weekData.diet.slice(0, dayInWeek)]
    const rotatedCare = [...weekData.care.slice(dayInWeek), ...weekData.care.slice(0, dayInWeek)]
    return {
      total_days: totalDays,
      week: week,
      day_in_week: dayInWeek,
      baby_icon: weekData.baby.icon,
      baby_summary: weekData.baby.detail.substring(0, 50),
      baby_detail: weekData.baby.detail,
      baby_highlight: weekData.baby.highlight || '',
      mom_icon: weekData.mom.icon,
      mom_summary: weekData.mom.detail.substring(0, 50),
      mom_detail: weekData.mom.detail,
      tip_icon: '💡',
      tip_text: weekData.care[dayInWeek % weekData.care.length],
      diet_tips: rotatedDiet,
      care_tips: rotatedCare
    }
  }

  // 默认兜底
  return {
    total_days: totalDays,
    week: Math.min(week, 40),
    day_in_week: dayInWeek,
    baby_icon: '👶',
    baby_summary: '宝宝持续成长中',
    baby_detail: '宝宝正在持续成长发育中，每天都会有新变化。',
    baby_highlight: '',
    mom_icon: '💆',
    mom_summary: '注意休息，保持好心情',
    mom_detail: '注意休息，保持良好的心态。规律作息和均衡饮食很重要。',
    tip_icon: '💡',
    tip_text: '保持规律作息，按时产检',
    diet_tips: ['保持营养均衡', '补充蛋白质和维生素', '多喝水', '避免生冷食物'],
    care_tips: ['保持规律作息', '按时产检', '保持心情愉快', '有异常及时就医']
  }
}

/**
 * 生成完整的 280 天数据
 */
function generateAllData() {
  const records = []
  for (let totalDays = 0; totalDays < 280; totalDays++) {
    records.push(generateDayData(totalDays))
  }
  return records
}

// ── uniCloud 写入逻辑 ──

/**
 * 将数据写入 uniCloud 数据库
 * 需要在 uniCloud 控制台配置 serverSDK
 */
async function seedToUniCloud() {
  try {
    // 引入 uniCloud serverSDK（需要在本地环境配置）
    const uniCloud = require('@dcloudio/uni-cloud-router')
    const cloud = uniCloud.init({
      provider: 'aliyun',
      spaceId: process.env.UNI_CLOUD_SPACE_ID || '',
      clientSecret: process.env.UNI_CLOUD_CLIENT_SECRET || '',
      endpoint: process.env.UNI_CLOUD_ENDPOINT || ''
    })

    const db = cloud.database()
    const collection = db.collection('pregnancy_daily')

    // 生成所有数据
    const allData = generateAllData()
    console.log(`生成 ${allData.length} 条记录，准备写入...`)

    // 批量写入（uniCloud 限制每次最多 500 条）
    const batchSize = 500
    const batches = []
    for (let i = 0; i < allData.length; i += batchSize) {
      batches.push(allData.slice(i, i + batchSize))
    }

    let totalWritten = 0
    let totalUpdated = 0

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      for (const record of batch) {
        try {
          // 先查询是否存在
          const { data: existing } = await collection.where({
            total_days: record.total_days
          }).get()

          if (existing && existing.length > 0) {
            // 更新
            await collection.doc(existing[0]._id).update(record)
            totalUpdated++
          } else {
            // 新增
            await collection.add(record)
            totalWritten++
          }
        } catch (err) {
          console.error(`写入 total_days=${record.total_days} 失败:`, err)
        }
      }
      console.log(`批次 ${i + 1}/${batches.length} 完成`)
    }

    console.log(`\n✓ 数据填充完成！`)
    console.log(`  新增: ${totalWritten} 条`)
    console.log(`  更新: ${totalUpdated} 条`)
    console.log(`  总计: ${totalWritten + totalUpdated} 条`)

  } catch (err) {
    console.error('uniCloud 连接失败:', err)
    console.log('\n请确保已配置 uniCloud serverSDK:')
    console.log('1. 在项目根目录创建 uni-cloud-local-config.json')
    console.log('2. 或设置环境变量 UNI_CLOUD_SPACE_ID 和 UNI_CLOUD_CLIENT_SECRET')
    process.exit(1)
  }
}

// ── 导出数据（用于调试或手动导入） ──

/**
 * 导出为 uniCloud 导入格式（每行一个 JSON 对象）
 */
function exportToJSON() {
  const fs = require('fs')
  const allData = generateAllData()

  const outputPath = './scripts/pregnancy-daily-data.json'
  // uniCloud 导入格式：每行一个 JSON 对象，无逗号分隔
  const lines = allData.map(record => JSON.stringify(record))
  fs.writeFileSync(outputPath, lines.join('\n'), 'utf8')

  console.log(`\n✓ 数据已导出到: ${outputPath}`)
  console.log(`  共 ${allData.length} 条记录`)
  console.log(`  格式：每行一个 JSON 对象（uniCloud 导入格式）`)
}

// ── 主入口 ──

if (require.main === module) {
  const args = process.argv.slice(2)
  const command = args[0] || 'help'

  switch (command) {
    case 'seed':
      seedToUniCloud()
      break
    case 'export':
      exportToJSON()
      break
    case 'help':
    default:
      console.log(`
孕期每日变化数据填充脚本

用法:
  node scripts/seed-daily-data.js <command>

命令:
  seed    - 将数据写入 uniCloud 数据库（需要配置 serverSDK）
  export  - 导出为 JSON 文件（可手动导入到 uniCloud 控制台）

示例:
  node scripts/seed-daily-data.js export
  node scripts/seed-daily-data.js seed

注意:
  - 首次使用建议先执行 export，检查生成的 JSON 文件
  - 然后在 uniCloud 控制台手动导入，或配置 serverSDK 后执行 seed
      `)
  }
}

module.exports = { generateDayData, generateAllData }
