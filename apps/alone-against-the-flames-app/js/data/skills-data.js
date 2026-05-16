// CoC 7e 技能基础值数据 — 来源: character-tracker/js/data/skills.js
// 转为 ES Module 供向火独行 app 使用

export const SKILLS_DATA = {
  regular: {
    '会计': 5, '操作重型机械': 1, '考古学': 1,
    '信用评级': 0, '克苏鲁神话': 0,
    '闪避': 'DEX/2', '汽车驾驶': 20, '电气维修': 10, '电子学': 10,
    '跳跃': 20, '恐吓': 15, '历史': 5, '投掷': 20, '急救': 30,
    '图书馆使用': 20, '聆听': 20, '锁匠': 1, '机械维修': 10,
    '医学': 1, '博物学': 10, '导航': 10, '妙手': 5, '说服': 10,
    '心理学': 10, '骑术': 5,
    '潜行': 20, '游泳': 20, '攀爬': 20,
    '母语': 'EDU', '侦查': 25, '追踪': 10,
    '人类学': 1, '估价': 5, '神秘学': 5, '话术': 5, '乔装': 5,
    '取悦': 15, '魅惑': 15, '法律': 5, '精神分析': 1,
    '计算机使用': 5
  },
  combat: {
    '斧': 15, '斗殴': 25, '链锯': 10, '连枷': 10, '绞索': 15, '矛': 20, '刀剑': 20, '鞭': 5
  },
  firearms: {
    '弓': 15, '手枪': 20, '重武器': 10, '火焰喷射器': 10, '机枪': 10, '步枪/霰弹枪': 25, '冲锋枪': 15
  },
  science: {
    '天文学': 1, '生物学': 1, '化学': 1, '密码学': 1, '工程学': 1, '地质学': 1,
    '数学': 10, '气象学': 1, '药学': 1, '物理学': 1, '动物学': 1, '司法科学': 1,
    '植物学': 1
  },
  artCraft: {
    '表演': 5, '美术': 5, '伪造文书': 5, '摄影': 5, '写作': 5,
    '理发': 5, '书法': 5, '木工': 5, '烹饪': 5,
    '舞蹈': 5, '雕刻': 5, '粉刷': 5, '陶艺': 5, '吹制真空管': 5
  },
  survival: {
    '沙漠': 10, '极地': 10, '海洋': 10
  },
  unconventional: {
    '动物驯养': 5, '催眠': 1, '潜水': 1, '爆破': 1, '炮术': 1, '读唇': 1
  },
  pilot: {}
};

export const SPECIALTY_MAP = {
  '格斗':     { category: 'combat',    prefix: '格斗',     freeForm: false },
  '射击':     { category: 'firearms',  prefix: '射击',     freeForm: false },
  '科学':     { category: 'science',   prefix: '科学',     freeForm: false },
  '艺术和手艺': { category: 'artCraft', prefix: '艺术和手艺', freeForm: true },
  '语言':     { category: null,        prefix: '语言',     freeForm: true },
  '生存':     { category: null,        prefix: '生存',     freeForm: true },
  '操纵':     { category: null,        prefix: '操纵',     freeForm: true },
  '学识':     { category: null,        prefix: '学识',     freeForm: true }
};

export const ATTR_KEYS = ['STR', 'CON', 'SIZ', 'DEX', 'APP', 'INT', 'POW', 'EDU'];

export const ATTR_NAMES = {
  STR: '力量', CON: '体质', SIZ: '体型', DEX: '敏捷',
  APP: '外貌', INT: '智力', POW: '意志', EDU: '教育'
};

export const BACKSTORY_CATEGORIES = [
  { key: '形象描述', label: '个人描述' },
  { key: '特质', label: '特质' },
  { key: '思想与信念', label: '思想与信念' },
  { key: '创伤和疤痕', label: '伤口和疤痕' },
  { key: '重要之人', label: '重要之人' },
  { key: '恐惧症和躁狂症', label: '恐惧症和狂躁症' },
  { key: '意义非凡之地', label: '意义非凡之地' },
  { key: '典籍、法术和神话造物', label: '神话典籍与咒文' },
  { key: '宝贵之物', label: '宝贵之物' },
  { key: '第三类接触', label: '第三类接触' }
];

// 向火独行模组中实际引用的技能（用于种子角色的"活跃技能"分组）
export const MODULE_SKILLS = [
  '侦查', '聆听', '潜行', '攀爬', '图书馆使用', '心理学',
  '话术', '魅惑', '恐吓', '急救', '博物学', '考古学',
  '闪避', '骑术', '追踪', '乔装', '母语', '斗殴',
  '科学(植物学)', '格斗(斗殴)', '法律', '艺术和手艺（摄影）'
];
