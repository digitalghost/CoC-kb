// 技能数据定义 - Skill Data
// 从 coc_character_creator.html 提取

const SKILLS_DATA = {
  // Regular skills: name -> base value
  regular: {
    '会计': 5, '操作重型机械': 1, '动物驯养': 5, '考古学': 1,
    '信用评级': 0, '克苏鲁神话': 0,
    '闪避': 'DEX/2', '汽车驾驶': 20, '电气维修': 10, '电子学': 10,
    '跳跃': 20, '恐吓': 15, '历史': 5, '投掷': 20, '急救': 30,
    '图书馆使用': 20, '聆听': 20, '锁匠': 1, '机械维修': 10,
    '医学': 1, '博物学': 10, '导航': 10, '妙手': 5, '说服': 10,
    '心理学': 10, '骑术': 5,
    '潜行': 20, '游泳': 20,
    '母语': 'EDU', '侦查': 25, '追踪': 10,
    '人类学': 1, '估价': 5, '神秘学': 5, '话术': 5, '乔装': 5,
    '取悦': 15, '法律': 5, '精神分析': 1
  },
  // Combat specialties
  combat: {
    '斧': 15, '斗殴': 25, '链锯': 10, '连枷': 10, '绞索': 15, '矛': 20, '刀剑': 20, '鞭': 5
  },
  // Firearms specialties
  firearms: {
    '弓': 15, '手枪': 20, '重武器': 10, '火焰喷射器': 10, '机枪': 10, '步枪/霰弹枪': 25, '冲锋枪': 15
  },
  // Science specialties
  science: {
    '天文学': 1, '生物学': 1, '化学': 1, '密码学': 1, '工程学': 1, '地质学': 1,
    '数学': 10, '气象学': 1, '药学': 1, '物理学': 1, '动物学': 1, '司法科学': 1
  },
  // Art & Craft specialties
  artCraft: {
    '表演': 5, '美术': 5, '伪造文书': 5, '摄影': 5, '写作': 5,
    '理发': 5, '书法': 5, '木工': 5, '烹饪': 5,
    '舞蹈': 5, '雕刻': 5, '粉刷': 5, '陶艺': 5, '吹制真空管': 5
  },
  // Survival specialties
  survival: {
    '沙漠': 10, '丛林': 10, '极地': 10, '山区': 10, '海洋': 10
  },
  // Pilot/Operate specialties (freeForm only)
  pilot: {}
};

// ============================================================
// 父技能 → 专精映射（SPECIALTY_MAP）
// 定义哪些"父技能"具有专精子技能，不能直接被选择或投入点数
// key: 父技能名
// value: { category: 数据分类, prefix: 专精显示前缀, freeForm: 是否自由输入 }
// ============================================================
const SPECIALTY_MAP = {
  '格斗':     { category: 'combat',    prefix: '格斗',     freeForm: false },
  '射击':     { category: 'firearms',  prefix: '射击',     freeForm: false },
  '科学':     { category: 'science',   prefix: '科学',     freeForm: false },
  '艺术和手艺': { category: 'artCraft', prefix: '艺术和手艺', freeForm: false },
  '语言':     { category: null,        prefix: '语言',     freeForm: true  },
  '生存':     { category: null,        prefix: '生存',     freeForm: true  },
  '操纵':     { category: null,        prefix: '操纵',     freeForm: true  }
};

// 自由输入型专攻的预设选项（用于 UI 快捷选择）
const FREEFORM_PRESETS = {
  '语言': ['英语', '法语', '德语', '西班牙语', '俄语', '日语', '拉丁语', '阿拉伯语', '古希腊语', '中文'],
  '生存': ['沙漠', '丛林', '极地', '山区', '海洋', '城市', '荒野'],
  '操纵': ['飞行器', '船舶', '汽车', '火车', '马车']
};

// 获取父技能的所有专精名称列表
// 返回格式: ['科学(天文学)', '科学(生物学)', ...]
function getSpecialtyOptions(parentName) {
  let map = SPECIALTY_MAP[parentName];
  if (!map) return [parentName];
  if (map.freeForm) {
    // 自由输入型：返回预设选项
    let presets = FREEFORM_PRESETS[parentName] || [];
    return presets.map(s => `${parentName}(${s})`);
  }
  let specialties = Object.keys(SKILLS_DATA[map.category]);
  return specialties.map(s => `${parentName}(${s})`);
}

// 判断一个技能名是否是父技能
function isParentSkill(skillName) {
  return skillName in SPECIALTY_MAP;
}

// 判断一个技能名是否是专精技能（如 "科学(天文学)"）
function isSpecialtySkill(skillName) {
  for (let parent in SPECIALTY_MAP) {
    if (skillName.startsWith(parent + '(') && skillName.endsWith(')')) {
      return true;
    }
  }
  return false;
}

// 从专精技能名中提取父技能名（如 "科学(天文学)" → "科学"）
function getParentFromSpecialty(skillName) {
  for (let parent in SPECIALTY_MAP) {
    if (skillName.startsWith(parent + '(') && skillName.endsWith(')')) {
      return parent;
    }
  }
  return null;
}

// 从专精技能名中提取子技能名（如 "科学(天文学)" → "天文学"）
function getSubFromSpecialty(skillName) {
  let parent = getParentFromSpecialty(skillName);
  if (!parent) return skillName;
  let inner = skillName.match(new RegExp('^' + parent + '\\((.+)\\)$'));
  return inner ? inner[1] : skillName;
}

