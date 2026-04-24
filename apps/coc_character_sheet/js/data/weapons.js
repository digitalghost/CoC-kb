// 武器数据库 - Weapons Database
// 数据来源: wiki/concepts/weapons.md（严格按 wiki 内容，不自行发挥）
// 包含:
//   - WEAPONS_DATABASE       武器分类列表（按年代）
//   - WEAPON_CATEGORY_ICONS  武器分类图标映射
//   - getCurrentWeaponsDB()  获取当前年代的武器数据库
//   - searchWeapons(query)   模糊搜索武器名称
//   - getWeaponCategories()  获取当前年代的所有武器分类名称

// ============================================================
// 武器数据库
// ============================================================
const WEAPONS_DATABASE = {
  '1920s': {

    // ===== 常规武器 =====
    '常规武器': [
      { name: '黄铜指虎', skill: '格斗(斗殴)', damage: '1D3+1+DB', armorPiercing: false, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 1, priceModern: 10, era: '1920s，现代', category: '常规武器' },
      { name: '长鞭', skill: '格斗(鞭)', damage: '1D3+半DB', armorPiercing: false, baseRange: '3m', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 5, priceModern: 50, era: '1920s', category: '常规武器' },
      { name: '燃烧的火把', skill: '格斗(斗殴)', damage: '1D6+燃烧', armorPiercing: false, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 0.05, priceModern: 0.5, era: '1920s，现代', category: '常规武器' },
      { name: '包革金属棒（大头棍、护身棒）', skill: '格斗(斗殴)', damage: '1D8+DB', armorPiercing: false, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 2, priceModern: 15, era: '1920s，现代', category: '常规武器' },
      { name: '大型棍棒（棒球棒、板球棒、拨火棍）', skill: '格斗(斗殴)', damage: '1D8+DB', armorPiercing: false, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 3, priceModern: 35, era: '1920s，现代', category: '常规武器' },
      { name: '小型棍棒（警棍）', skill: '格斗(斗殴)', damage: '1D6+DB', armorPiercing: false, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 3, priceModern: 35, era: '1920s，现代', category: '常规武器' },
      { name: '弩', skill: '射击(弓)', damage: '1D8+2', armorPiercing: true, baseRange: '50m', attacksPerRound: '1/2', capacity: '1', malfunction: 96, price20s: 10, priceModern: 100, era: '1920s，现代', category: '常规武器' },
      { name: '绞索', skill: '格斗(绞索)', damage: '1D6+DB', armorPiercing: true, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 0.5, priceModern: 3, era: '1920s，现代', category: '常规武器' },
      { name: '手斧/镰刀', skill: '格斗(斧)', damage: '1D6+1+DB', armorPiercing: true, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 3, priceModern: 9, era: '1920s，现代', category: '常规武器' },
      { name: '大型刀具（骑兵军刀等）', skill: '格斗(斗殴)', damage: '1D8+DB', armorPiercing: true, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 4, priceModern: 50, era: '1920s，现代', category: '常规武器' },
      { name: '中型刀具（切肉刀等）', skill: '格斗(斗殴)', damage: '1D4+2+DB', armorPiercing: true, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 2, priceModern: 15, era: '1920s，现代', category: '常规武器' },
      { name: '小型刀具（折叠刀等）', skill: '格斗(斗殴)', damage: '1D4+DB', armorPiercing: true, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 2, priceModern: 6, era: '1920s，现代', category: '常规武器' },
      { name: '双节棍', skill: '格斗(连枷)', damage: '1D8+DB', armorPiercing: false, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 1, priceModern: 10, era: '1920s，现代', category: '常规武器' },
      { name: '投石', skill: '投掷', damage: '1D4+半DB', armorPiercing: false, baseRange: 'STR/5m', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: null, priceModern: null, era: '1920s，现代', category: '常规武器' },
      { name: '手里剑', skill: '投掷', damage: '1D3+半DB', armorPiercing: true, baseRange: 'STR/5m', attacksPerRound: '2', capacity: '一次性', malfunction: 100, price20s: 0.5, priceModern: 3, era: '1920s，现代', category: '常规武器' },
      { name: '矛（骑枪）', skill: '格斗(矛)', damage: '1D8+1', armorPiercing: true, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 25, priceModern: 150, era: '1920s，现代', category: '常规武器' },
      { name: '投矛', skill: '投掷', damage: '1D8+半DB', armorPiercing: true, baseRange: 'STR/5m', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 1, priceModern: 25, era: '稀有', category: '常规武器' },
      { name: '大型刀剑（马刀）', skill: '格斗(刀剑)', damage: '1D8+1+DB', armorPiercing: true, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 30, priceModern: 75, era: '1920s，现代', category: '常规武器' },
      { name: '中型刀剑（长剑、重剑）', skill: '格斗(刀剑)', damage: '1D6+1+DB', armorPiercing: true, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 15, priceModern: 100, era: '1920s，现代', category: '常规武器' },
      { name: '轻型刀剑（花剑、剑杖）', skill: '格斗(刀剑)', damage: '1D6+DB', armorPiercing: true, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 25, priceModern: 100, era: '1920s，现代', category: '常规武器' },
      { name: '战斗回力镖', skill: '投掷', damage: '1D8+半DB', armorPiercing: false, baseRange: 'STR/5m', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 2, priceModern: 4, era: '稀有', category: '常规武器' },
      { name: '伐木斧', skill: '格斗(斧)', damage: '1D8+2+DB', armorPiercing: true, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 5, priceModern: 10, era: '1920s，现代', category: '常规武器' },
    ],

    // ===== 手枪（贯穿） =====
    '手枪': [
      { name: '燧发手枪', skill: '射击(手枪)', damage: '1D6+1', armorPiercing: true, baseRange: '10m', attacksPerRound: '1/4', capacity: '1', malfunction: 95, price20s: 30, priceModern: 300, era: '稀有', category: '手枪' },
      { name: '.22 自动手枪', skill: '射击(手枪)', damage: '1D6', armorPiercing: true, baseRange: '10m', attacksPerRound: '1(3)', capacity: '6', malfunction: 100, price20s: 25, priceModern: 190, era: '1920s，现代', category: '手枪' },
      { name: '.25 德林杰手枪（单管）', skill: '射击(手枪)', damage: '1D6', armorPiercing: true, baseRange: '3m', attacksPerRound: '1', capacity: '1', malfunction: 100, price20s: 12, priceModern: 55, era: '1920s', category: '手枪' },
      { name: '.32/7.65mm 左轮手枪', skill: '射击(手枪)', damage: '1D8', armorPiercing: true, baseRange: '15m', attacksPerRound: '1(3)', capacity: '6', malfunction: 100, price20s: 15, priceModern: 200, era: '1920s，现代', category: '手枪' },
      { name: '.32/7.65mm 自动手枪', skill: '射击(手枪)', damage: '1D8', armorPiercing: true, baseRange: '15m', attacksPerRound: '1(3)', capacity: '8', malfunction: 99, price20s: 20, priceModern: 350, era: '1920s，现代', category: '手枪' },
      { name: '.38/9mm 左轮手枪', skill: '射击(手枪)', damage: '1D10', armorPiercing: true, baseRange: '15m', attacksPerRound: '1(3)', capacity: '6', malfunction: 100, price20s: 25, priceModern: 200, era: '1920s，现代', category: '手枪' },
      { name: '.38/9mm 自动手枪', skill: '射击(手枪)', damage: '1D10', armorPiercing: true, baseRange: '15m', attacksPerRound: '1(3)', capacity: '8', malfunction: 99, price20s: 30, priceModern: 375, era: '1920s，现代', category: '手枪' },
      { name: '9mm 鲁格 P08', skill: '射击(手枪)', damage: '1D10', armorPiercing: true, baseRange: '15m', attacksPerRound: '1(3)', capacity: '8', malfunction: 99, price20s: 75, priceModern: 600, era: '1920s，现代', category: '手枪' },
      { name: '.41 左轮手枪', skill: '射击(手枪)', damage: '1D10', armorPiercing: true, baseRange: '15m', attacksPerRound: '1(3)', capacity: '8', malfunction: 100, price20s: 30, priceModern: null, era: '1920s，稀有', category: '手枪' },
      { name: '.45 左轮手枪', skill: '射击(手枪)', damage: '1D10+2', armorPiercing: true, baseRange: '15m', attacksPerRound: '1(3)', capacity: '6', malfunction: 100, price20s: 30, priceModern: 300, era: '1920s，现代', category: '手枪' },
      { name: '.45 自动手枪', skill: '射击(手枪)', damage: '1D10+2', armorPiercing: true, baseRange: '15m', attacksPerRound: '1(3)', capacity: '7', malfunction: 100, price20s: 40, priceModern: 375, era: '1920s，现代', category: '手枪' },
    ],

    // ===== 步枪（贯穿） =====
    '步枪': [
      { name: '.58 春田燧发步枪', skill: '射击(步枪)', damage: '1D10+4', armorPiercing: true, baseRange: '60m', attacksPerRound: '1/4', capacity: '1', malfunction: 95, price20s: 25, priceModern: 350, era: '稀有', category: '步枪' },
      { name: '.22 栓动步枪', skill: '射击(步枪)', damage: '1D6+1', armorPiercing: true, baseRange: '30m', attacksPerRound: '1', capacity: '6', malfunction: 99, price20s: 13, priceModern: 70, era: '1920s，现代', category: '步枪' },
      { name: '.30 杠杆步枪', skill: '射击(步枪)', damage: '2D6', armorPiercing: true, baseRange: '50m', attacksPerRound: '1', capacity: '6', malfunction: 98, price20s: 19, priceModern: 150, era: '1920s，现代', category: '步枪' },
      { name: '.45 马蒂尼-亨利步枪', skill: '射击(步枪)', damage: '1D8+1D6+3', armorPiercing: true, baseRange: '80m', attacksPerRound: '1/3', capacity: '1', malfunction: 100, price20s: 20, priceModern: 200, era: '1920s', category: '步枪' },
      { name: '莫兰上校的气动步枪', skill: '射击(步枪)', damage: '2D6+1', armorPiercing: true, baseRange: '20m', attacksPerRound: '1/3', capacity: '1', malfunction: 88, price20s: 200, priceModern: null, era: '1920s', category: '步枪' },
      { name: '.303 李-恩菲尔德步枪', skill: '射击(步枪)', damage: '2D6+4', armorPiercing: true, baseRange: '110m', attacksPerRound: '1', capacity: '10', malfunction: 100, price20s: 50, priceModern: 300, era: '1920s，现代', category: '步枪' },
      { name: '.30-06(7.62mm) 栓动步枪', skill: '射击(步枪)', damage: '2D6+4', armorPiercing: true, baseRange: '110m', attacksPerRound: '1', capacity: '5', malfunction: 100, price20s: 75, priceModern: 175, era: '1920s，现代', category: '步枪' },
      { name: '双管猎象枪', skill: '射击(步枪)', damage: '3D6+4', armorPiercing: true, baseRange: '100m', attacksPerRound: '1或2', capacity: '2', malfunction: 100, price20s: 400, priceModern: 1800, era: '1920s，现代', category: '步枪' },
    ],

    // ===== 霰弹枪 =====
    '霰弹枪': [
      { name: '20号双管霰弹枪', skill: '射击(霰弹枪)', damage: '2D6/1D6/1D3', armorPiercing: false, baseRange: '10/20/50m', attacksPerRound: '1或2', capacity: '2', malfunction: 100, price20s: 35, priceModern: null, era: '1920s', category: '霰弹枪' },
      { name: '16号双管霰弹枪', skill: '射击(霰弹枪)', damage: '2D6+2/1D6+1/1D4', armorPiercing: false, baseRange: '10/20/50m', attacksPerRound: '1或2', capacity: '2', malfunction: 100, price20s: 40, priceModern: null, era: '1920s', category: '霰弹枪' },
      { name: '12号双管霰弹枪', skill: '射击(霰弹枪)', damage: '4D6/2D6/1D6', armorPiercing: false, baseRange: '10/20/50m', attacksPerRound: '1或2', capacity: '2', malfunction: 100, price20s: 40, priceModern: 200, era: '1920s，现代', category: '霰弹枪' },
      { name: '12号双管霰弹枪（锯短枪管）', skill: '射击(霰弹枪)', damage: '4D6/1D6', armorPiercing: false, baseRange: '5/10m', attacksPerRound: '1或2', capacity: '2', malfunction: 100, price20s: null, priceModern: null, era: '1920s', category: '霰弹枪' },
      { name: '10号双管霰弹枪', skill: '射击(霰弹枪)', damage: '4D6+2/2D6+1/1D4', armorPiercing: false, baseRange: '10/20/50m', attacksPerRound: '1或2', capacity: '2', malfunction: 100, price20s: null, priceModern: null, era: '1920s，稀有', category: '霰弹枪' },
    ],

    // ===== 冲锋枪（贯穿） =====
    '冲锋枪': [
      { name: '贝格曼 MP18/MP28', skill: '射击(冲锋枪)', damage: '1D10', armorPiercing: true, baseRange: '20m', attacksPerRound: '1(2)或全自动', capacity: '20/30/32', malfunction: 96, price20s: 1000, priceModern: 20000, era: '1920s', category: '冲锋枪' },
      { name: '汤普森冲锋枪', skill: '射击(冲锋枪)', damage: '1D10+2', armorPiercing: true, baseRange: '20m', attacksPerRound: '1或全自动', capacity: '20/30/50', malfunction: 96, price20s: 200, priceModern: 1600, era: '1920s', category: '冲锋枪' },
    ],

    // ===== 机枪（贯穿） =====
    '机枪': [
      { name: '1882年式手摇加特林', skill: '射击(机枪)', damage: '2D6+4', armorPiercing: true, baseRange: '100m', attacksPerRound: '全自动', capacity: '200', malfunction: 96, price20s: 2000, priceModern: 14000, era: '1920s，稀有', category: '机枪' },
      { name: 'M1918 勃朗宁自动步枪', skill: '射击(机枪)', damage: '2D6+4', armorPiercing: true, baseRange: '90m', attacksPerRound: '1(2)或全自动', capacity: '20', malfunction: 100, price20s: 800, priceModern: 1500, era: '1920s', category: '机枪' },
      { name: '勃朗宁 M1917A1 (.30-06/7.62mm)', skill: '射击(机枪)', damage: '2D6+4', armorPiercing: true, baseRange: '150m', attacksPerRound: '全自动', capacity: '250', malfunction: 96, price20s: 3000, priceModern: 30000, era: '1920s', category: '机枪' },
      { name: '布伦轻机枪', skill: '射击(机枪)', damage: '2D6+4', armorPiercing: true, baseRange: '110m', attacksPerRound: '1或全自动', capacity: '30/100', malfunction: 96, price20s: 3000, priceModern: 50000, era: '1920s', category: '机枪' },
      { name: '刘易斯 MK.I 型机枪', skill: '射击(机枪)', damage: '2D6+4', armorPiercing: true, baseRange: '110m', attacksPerRound: '全自动', capacity: '47/97', malfunction: 96, price20s: 3000, priceModern: 20000, era: '1920s', category: '机枪' },
      { name: '维克斯 .303 机枪', skill: '射击(机枪)', damage: '2D6+4', armorPiercing: true, baseRange: '110m', attacksPerRound: '全自动', capacity: '250', malfunction: 99, price20s: null, priceModern: null, era: '1920s', category: '机枪' },
    ],

    // ===== 爆炸物、重武器和其他武器（贯穿） =====
    '爆炸物': [
      { name: '莫洛托夫鸡尾酒', skill: '投掷', damage: '2D6+燃烧', armorPiercing: true, baseRange: 'STR/5m', attacksPerRound: '1/2', capacity: '一次性', malfunction: 95, price20s: null, priceModern: null, era: '1920s，现代', category: '爆炸物' },
      { name: '信号枪', skill: '射击(手枪)', damage: '1D10+1D3 燃烧', armorPiercing: true, baseRange: '10m', attacksPerRound: '1/2', capacity: '1', malfunction: 100, price20s: 15, priceModern: 75, era: '1920s，现代', category: '爆炸物' },
      { name: '炸药棒', skill: '投掷', damage: '4D10/3m', armorPiercing: true, baseRange: 'STR/5m', attacksPerRound: '1/2', capacity: '一次性', malfunction: 99, price20s: 2, priceModern: 5, era: '1920s，现代', category: '爆炸物' },
      { name: '雷管', skill: '电气维修', damage: '2D10/1m', armorPiercing: true, baseRange: 'N/A', attacksPerRound: '-', capacity: '一次性', malfunction: 100, price20s: 1, priceModern: 20, era: '1920s，现代', category: '爆炸物' },
      { name: '管状土制炸弹', skill: '爆破', damage: '1D10/3m', armorPiercing: true, baseRange: '原地布设', attacksPerRound: '一次性', capacity: '一次性', malfunction: 95, price20s: null, priceModern: null, era: '1920s', category: '爆炸物' },
      { name: '手榴弹', skill: '投掷', damage: '4D10/3m', armorPiercing: true, baseRange: 'STR/5m', attacksPerRound: '1/2', capacity: '一次性', malfunction: 99, price20s: null, priceModern: null, era: '1920s，现代', category: '爆炸物' },
      { name: '75mm 野战炮', skill: '炮术', damage: '10D10/2m', armorPiercing: true, baseRange: '500m', attacksPerRound: '1/4', capacity: '独立装弹', malfunction: 99, price20s: 1500, priceModern: null, era: '1920s，现代', category: '爆炸物' },
      { name: '火焰喷射器', skill: '射击(火焰喷射器)', damage: '2D6+燃烧', armorPiercing: true, baseRange: '25m', attacksPerRound: '1', capacity: '至少10', malfunction: 93, price20s: null, priceModern: null, era: '1920s，现代', category: '爆炸物' },
    ],

    // ===== 1920年代非法武器（仅名称和价格） =====
    '1920年代非法武器': [
      { name: '汤普森冲锋枪（每支）', price: '1D6×$50', category: '1920年代非法武器', era: '1920s' },
      { name: '.30 口径机枪（每支）', price: '1D100×$50', category: '1920年代非法武器', era: '1920s' },
      { name: '.30 口径穿甲弹（一战时生产）', price: '$25/500颗', category: '1920年代非法武器', era: '1920s' },
      { name: '.50 口径水冷式机枪（每支）', price: '1D100×$30+$300', category: '1920年代非法武器', era: '1920s' },
      { name: '.50 口径穿甲弹（一战时生产）', price: '$45/500颗', category: '1920年代非法武器', era: '1920s' },
      { name: '60mm 野战迫击炮（每门）', price: '1D6×$200', category: '1920年代非法武器', era: '1920s' },
      { name: '60mm 榴弹（每枚）', price: '$2', category: '1920年代非法武器', era: '1920s' },
      { name: '60mm 照明弹', price: '十万烛光，可悬停25秒', category: '1920年代非法武器', era: '1920s' },
      { name: '75mm 野战火炮（每门）', price: '1D100×$100+$800', category: '1920年代非法武器', era: '1920s' },
      { name: '75mm 穿甲弹或照明弹（一战时生产）', price: '$10/枚', category: '1920年代非法武器', era: '1920s' },
    ],

    // ===== 1920年代近战武器（仅名称和价格） =====
    '1920年代近战武器': [
      { name: '西洋剑', price: 12.50, category: '1920年代近战武器', era: '1920s' },
      { name: '刺刀', price: 3.75, category: '1920年代近战武器', era: '1920s' },
      { name: '匕首', price: 2.50, category: '1920年代近战武器', era: '1920s' },
      { name: '直刃剃刀', price: '0.65-5.25', category: '1920年代近战武器', era: '1920s' },
      { name: '铜指虎', price: 1.00, category: '1920年代近战武器', era: '1920s' },
      { name: '警棍（30cm）', price: 1.98, category: '1920年代近战武器', era: '1920s' },
      { name: '马鞭', price: 0.60, category: '1920年代近战武器', era: '1920s' },
      { name: '4磅伐木斧', price: 1.95, category: '1920年代近战武器', era: '1920s' },
      { name: '5米牛鞭', price: 1.75, category: '1920年代近战武器', era: '1920s' },
    ],
  },

  '现代': {

    // ===== 常规武器 =====
    '常规武器': [
      { name: '弓箭', skill: '射击(弓)', damage: '1D6+半DB', armorPiercing: false, baseRange: '30m', attacksPerRound: '1', capacity: '1', malfunction: 97, price20s: 7, priceModern: 75, era: '现代', category: '常规武器' },
      { name: '黄铜指虎', skill: '格斗(斗殴)', damage: '1D3+1+DB', armorPiercing: false, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 1, priceModern: 10, era: '1920s，现代', category: '常规武器' },
      { name: '燃烧的火把', skill: '格斗(斗殴)', damage: '1D6+燃烧', armorPiercing: false, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 0.05, priceModern: 0.5, era: '1920s，现代', category: '常规武器' },
      { name: '链锯', skill: '格斗(链锯)', damage: '2D8', armorPiercing: false, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: 95, price20s: null, priceModern: 300, era: '现代', category: '常规武器' },
      { name: '包革金属棒（大头棍、护身棒）', skill: '格斗(斗殴)', damage: '1D8+DB', armorPiercing: false, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 2, priceModern: 15, era: '1920s，现代', category: '常规武器' },
      { name: '大型棍棒（棒球棒、板球棒、拨火棍）', skill: '格斗(斗殴)', damage: '1D8+DB', armorPiercing: false, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 3, priceModern: 35, era: '1920s，现代', category: '常规武器' },
      { name: '小型棍棒（警棍）', skill: '格斗(斗殴)', damage: '1D6+DB', armorPiercing: false, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 3, priceModern: 35, era: '1920s，现代', category: '常规武器' },
      { name: '弩', skill: '射击(弓)', damage: '1D8+2', armorPiercing: true, baseRange: '50m', attacksPerRound: '1/2', capacity: '1', malfunction: 96, price20s: 10, priceModern: 100, era: '1920s，现代', category: '常规武器' },
      { name: '绞索', skill: '格斗(绞索)', damage: '1D6+DB', armorPiercing: true, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 0.5, priceModern: 3, era: '1920s，现代', category: '常规武器' },
      { name: '手斧/镰刀', skill: '格斗(斧)', damage: '1D6+1+DB', armorPiercing: true, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 3, priceModern: 9, era: '1920s，现代', category: '常规武器' },
      { name: '大型刀具（骑兵军刀等）', skill: '格斗(斗殴)', damage: '1D8+DB', armorPiercing: true, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 4, priceModern: 50, era: '1920s，现代', category: '常规武器' },
      { name: '中型刀具（切肉刀等）', skill: '格斗(斗殴)', damage: '1D4+2+DB', armorPiercing: true, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 2, priceModern: 15, era: '1920s，现代', category: '常规武器' },
      { name: '小型刀具（折叠刀等）', skill: '格斗(斗殴)', damage: '1D4+DB', armorPiercing: true, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 2, priceModern: 6, era: '1920s，现代', category: '常规武器' },
      { name: '220V通电导线', skill: '格斗(斗殴)', damage: '2D8+晕眩', armorPiercing: false, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: 95, price20s: null, priceModern: null, era: '现代', category: '常规武器' },
      { name: '催泪喷雾', skill: '格斗(斗殴)', damage: '晕眩', armorPiercing: false, baseRange: '2m', attacksPerRound: '1', capacity: '25次', malfunction: null, price20s: null, priceModern: 10, era: '现代', category: '常规武器' },
      { name: '双节棍', skill: '格斗(连枷)', damage: '1D8+DB', armorPiercing: false, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 1, priceModern: 10, era: '1920s，现代', category: '常规武器' },
      { name: '投石', skill: '投掷', damage: '1D4+半DB', armorPiercing: false, baseRange: 'STR/5m', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: null, priceModern: null, era: '1920s，现代', category: '常规武器' },
      { name: '手里剑', skill: '投掷', damage: '1D3+半DB', armorPiercing: true, baseRange: 'STR/5m', attacksPerRound: '2', capacity: '一次性', malfunction: 100, price20s: 0.5, priceModern: 3, era: '1920s，现代', category: '常规武器' },
      { name: '矛（骑枪）', skill: '格斗(矛)', damage: '1D8+1', armorPiercing: true, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 25, priceModern: 150, era: '1920s，现代', category: '常规武器' },
      { name: '投矛', skill: '投掷', damage: '1D8+半DB', armorPiercing: true, baseRange: 'STR/5m', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 1, priceModern: 25, era: '稀有', category: '常规武器' },
      { name: '大型刀剑（马刀）', skill: '格斗(刀剑)', damage: '1D8+1+DB', armorPiercing: true, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 30, priceModern: 75, era: '1920s，现代', category: '常规武器' },
      { name: '中型刀剑（长剑、重剑）', skill: '格斗(刀剑)', damage: '1D6+1+DB', armorPiercing: true, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 15, priceModern: 100, era: '1920s，现代', category: '常规武器' },
      { name: '轻型刀剑（花剑、剑杖）', skill: '格斗(刀剑)', damage: '1D6+DB', armorPiercing: true, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 25, priceModern: 100, era: '1920s，现代', category: '常规武器' },
      { name: '电击器', skill: '格斗(斗殴)', damage: '1D3+晕眩', armorPiercing: false, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: 97, price20s: null, priceModern: 200, era: '现代', category: '常规武器' },
      { name: '泰瑟枪', skill: '射击(手枪)', damage: '1D3+晕眩', armorPiercing: false, baseRange: '5m', attacksPerRound: '1', capacity: '3', malfunction: 95, price20s: null, priceModern: 400, era: '现代', category: '常规武器' },
      { name: '战斗回力镖', skill: '投掷', damage: '1D8+半DB', armorPiercing: false, baseRange: 'STR/5m', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 2, priceModern: 4, era: '稀有', category: '常规武器' },
      { name: '伐木斧', skill: '格斗(斧)', damage: '1D8+2+DB', armorPiercing: true, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: 5, priceModern: 10, era: '1920s，现代', category: '常规武器' },
    ],

    // ===== 手枪（贯穿） =====
    '手枪': [
      { name: '燧发手枪', skill: '射击(手枪)', damage: '1D6+1', armorPiercing: true, baseRange: '10m', attacksPerRound: '1/4', capacity: '1', malfunction: 95, price20s: 30, priceModern: 300, era: '稀有', category: '手枪' },
      { name: '.22 自动手枪', skill: '射击(手枪)', damage: '1D6', armorPiercing: true, baseRange: '10m', attacksPerRound: '1(3)', capacity: '6', malfunction: 100, price20s: 25, priceModern: 190, era: '1920s，现代', category: '手枪' },
      { name: '.32/7.65mm 左轮手枪', skill: '射击(手枪)', damage: '1D8', armorPiercing: true, baseRange: '15m', attacksPerRound: '1(3)', capacity: '6', malfunction: 100, price20s: 15, priceModern: 200, era: '1920s，现代', category: '手枪' },
      { name: '.32/7.65mm 自动手枪', skill: '射击(手枪)', damage: '1D8', armorPiercing: true, baseRange: '15m', attacksPerRound: '1(3)', capacity: '8', malfunction: 99, price20s: 20, priceModern: 350, era: '1920s，现代', category: '手枪' },
      { name: '.357 马格南左轮手枪', skill: '射击(手枪)', damage: '1D8+1D4', armorPiercing: true, baseRange: '15m', attacksPerRound: '1(3)', capacity: '6', malfunction: 100, price20s: null, priceModern: 425, era: '现代', category: '手枪' },
      { name: '.38/9mm 左轮手枪', skill: '射击(手枪)', damage: '1D10', armorPiercing: true, baseRange: '15m', attacksPerRound: '1(3)', capacity: '6', malfunction: 100, price20s: 25, priceModern: 200, era: '1920s，现代', category: '手枪' },
      { name: '.38/9mm 自动手枪', skill: '射击(手枪)', damage: '1D10', armorPiercing: true, baseRange: '15m', attacksPerRound: '1(3)', capacity: '8', malfunction: 99, price20s: 30, priceModern: 375, era: '1920s，现代', category: '手枪' },
      { name: '贝瑞塔 M9', skill: '射击(手枪)', damage: '1D10', armorPiercing: true, baseRange: '15m', attacksPerRound: '1(3)', capacity: '15', malfunction: 98, price20s: null, priceModern: 500, era: '现代', category: '手枪' },
      { name: '9mm 格洛克 17', skill: '射击(手枪)', damage: '1D10', armorPiercing: true, baseRange: '15m', attacksPerRound: '1(3)', capacity: '17', malfunction: 98, price20s: null, priceModern: 500, era: '现代', category: '手枪' },
      { name: '9mm 鲁格 P08', skill: '射击(手枪)', damage: '1D10', armorPiercing: true, baseRange: '15m', attacksPerRound: '1(3)', capacity: '8', malfunction: 99, price20s: 75, priceModern: 600, era: '1920s，现代', category: '手枪' },
      { name: '.41 左轮手枪', skill: '射击(手枪)', damage: '1D10', armorPiercing: true, baseRange: '15m', attacksPerRound: '1(3)', capacity: '8', malfunction: 100, price20s: 30, priceModern: null, era: '1920s，稀有', category: '手枪' },
      { name: '.44 马格南左轮手枪', skill: '射击(手枪)', damage: '1D10+1D4+2', armorPiercing: true, baseRange: '15m', attacksPerRound: '1(3)', capacity: '6', malfunction: 100, price20s: null, priceModern: 475, era: '现代', category: '手枪' },
      { name: '.45 左轮手枪', skill: '射击(手枪)', damage: '1D10+2', armorPiercing: true, baseRange: '15m', attacksPerRound: '1(3)', capacity: '6', malfunction: 100, price20s: 30, priceModern: 300, era: '1920s，现代', category: '手枪' },
      { name: '.45 自动手枪', skill: '射击(手枪)', damage: '1D10+2', armorPiercing: true, baseRange: '15m', attacksPerRound: '1(3)', capacity: '7', malfunction: 100, price20s: 40, priceModern: 375, era: '1920s，现代', category: '手枪' },
      { name: 'IMI 沙漠之鹰', skill: '射击(手枪)', damage: '1D10+1D6+3', armorPiercing: true, baseRange: '15m', attacksPerRound: '1(3)', capacity: '7', malfunction: 94, price20s: null, priceModern: 650, era: '现代', category: '手枪' },
    ],

    // ===== 步枪（贯穿） =====
    '步枪': [
      { name: '.58 春田燧发步枪', skill: '射击(步枪)', damage: '1D10+4', armorPiercing: true, baseRange: '60m', attacksPerRound: '1/4', capacity: '1', malfunction: 95, price20s: 25, priceModern: 350, era: '稀有', category: '步枪' },
      { name: '.22 栓动步枪', skill: '射击(步枪)', damage: '1D6+1', armorPiercing: true, baseRange: '30m', attacksPerRound: '1', capacity: '6', malfunction: 99, price20s: 13, priceModern: 70, era: '1920s，现代', category: '步枪' },
      { name: '.30 杠杆步枪', skill: '射击(步枪)', damage: '2D6', armorPiercing: true, baseRange: '50m', attacksPerRound: '1', capacity: '6', malfunction: 98, price20s: 19, priceModern: 150, era: '1920s，现代', category: '步枪' },
      { name: '加兰德 M1、M2 步枪', skill: '射击(步枪)', damage: '2D6+4', armorPiercing: true, baseRange: '110m', attacksPerRound: '1', capacity: '8', malfunction: 100, price20s: null, priceModern: 400, era: '二战及以后', category: '步枪' },
      { name: 'SKS 半自动步枪', skill: '射击(步枪)', damage: '2D6+1', armorPiercing: true, baseRange: '90m', attacksPerRound: '1(2)', capacity: '10', malfunction: 97, price20s: null, priceModern: 500, era: '现代', category: '步枪' },
      { name: '.303 李-恩菲尔德步枪', skill: '射击(步枪)', damage: '2D6+4', armorPiercing: true, baseRange: '110m', attacksPerRound: '1', capacity: '10', malfunction: 100, price20s: 50, priceModern: 300, era: '1920s，现代', category: '步枪' },
      { name: '.30-06(7.62mm) 栓动步枪', skill: '射击(步枪)', damage: '2D6+4', armorPiercing: true, baseRange: '110m', attacksPerRound: '1', capacity: '5', malfunction: 100, price20s: 75, priceModern: 175, era: '1920s，现代', category: '步枪' },
      { name: '.30-06(7.62mm) 半自动步枪', skill: '射击(步枪)', damage: '2D6+4', armorPiercing: true, baseRange: '110m', attacksPerRound: '1', capacity: '5', malfunction: 100, price20s: null, priceModern: 275, era: '现代', category: '步枪' },
      { name: '.444 马林杠杆步枪', skill: '射击(步枪)', damage: '2D8+4', armorPiercing: true, baseRange: '110m', attacksPerRound: '1', capacity: '5', malfunction: 98, price20s: null, priceModern: 400, era: '现代', category: '步枪' },
      { name: '双管猎象枪', skill: '射击(步枪)', damage: '3D6+4', armorPiercing: true, baseRange: '100m', attacksPerRound: '1或2', capacity: '2', malfunction: 100, price20s: 400, priceModern: 1800, era: '1920s，现代', category: '步枪' },
    ],

    // ===== 霰弹枪 =====
    '霰弹枪': [
      { name: '12号双管霰弹枪', skill: '射击(霰弹枪)', damage: '4D6/2D6/1D6', armorPiercing: false, baseRange: '10/20/50m', attacksPerRound: '1或2', capacity: '2', malfunction: 100, price20s: 40, priceModern: 200, era: '1920s，现代', category: '霰弹枪' },
      { name: '12号泵动式霰弹枪', skill: '射击(霰弹枪)', damage: '4D6/2D6/1D6', armorPiercing: false, baseRange: '10/20/50m', attacksPerRound: '1', capacity: '5', malfunction: 100, price20s: null, priceModern: 100, era: '现代', category: '霰弹枪' },
      { name: '12号半自动霰弹枪', skill: '射击(霰弹枪)', damage: '4D6/2D6/1D6', armorPiercing: false, baseRange: '10/20/50m', attacksPerRound: '1(2)', capacity: '5', malfunction: 100, price20s: null, priceModern: 100, era: '现代', category: '霰弹枪' },
      { name: '12号伯奈利 M3 霰弹枪（折叠枪托）', skill: '射击(霰弹枪)', damage: '4D6/2D6/1D6', armorPiercing: false, baseRange: '10/20/50m', attacksPerRound: '1(2)', capacity: '7', malfunction: 100, price20s: null, priceModern: 895, era: '现代', category: '霰弹枪' },
      { name: '12号 SPAS 霰弹枪（折叠枪托）', skill: '射击(霰弹枪)', damage: '4D6/2D6/1D6', armorPiercing: false, baseRange: '10/20/50m', attacksPerRound: '1', capacity: '8', malfunction: 98, price20s: null, priceModern: 600, era: '现代', category: '霰弹枪' },
    ],

    // ===== 突击步枪（贯穿） =====
    '突击步枪': [
      { name: 'AK-47 或 AKM', skill: '射击(步枪)', damage: '2D6+1', armorPiercing: true, baseRange: '100m', attacksPerRound: '1(2)或全自动', capacity: '30', malfunction: 100, price20s: null, priceModern: 200, era: '现代', category: '突击步枪' },
      { name: 'AK-74', skill: '射击(步枪)', damage: '2D6+1', armorPiercing: true, baseRange: '110m', attacksPerRound: '1(2)或全自动', capacity: '30', malfunction: 97, price20s: null, priceModern: 1000, era: '现代', category: '突击步枪' },
      { name: '巴雷特 M82 反器材步枪', skill: '射击(步枪)', damage: '2D10+1D8+6', armorPiercing: true, baseRange: '250m', attacksPerRound: '1', capacity: '11', malfunction: 96, price20s: null, priceModern: 3000, era: '现代', category: '突击步枪' },
      { name: 'FN FAL 突击步枪', skill: '射击(步枪)', damage: '2D6+4', armorPiercing: true, baseRange: '110m', attacksPerRound: '1(2)或3发点射', capacity: '20', malfunction: 97, price20s: null, priceModern: 1500, era: '现代', category: '突击步枪' },
      { name: '加利尔突击步枪', skill: '射击(步枪)', damage: '2D6', armorPiercing: true, baseRange: '110m', attacksPerRound: '1(2)或全自动', capacity: '20', malfunction: 98, price20s: null, priceModern: 2000, era: '现代', category: '突击步枪' },
      { name: 'M16A2', skill: '射击(步枪)', damage: '2D6', armorPiercing: true, baseRange: '110m', attacksPerRound: '1或3发点射', capacity: '30', malfunction: 97, price20s: null, priceModern: null, era: '现代', category: '突击步枪' },
      { name: 'M4', skill: '射击(步枪)', damage: '2D6', armorPiercing: true, baseRange: '90m', attacksPerRound: '1或3发点射', capacity: '30', malfunction: 97, price20s: null, priceModern: null, era: '现代', category: '突击步枪' },
      { name: '斯太尔 AUG', skill: '射击(步枪)', damage: '2D6', armorPiercing: true, baseRange: '110m', attacksPerRound: '1(2)或全自动', capacity: '30', malfunction: 99, price20s: null, priceModern: 1100, era: '现代', category: '突击步枪' },
      { name: '贝雷塔 M70/90', skill: '射击(步枪)', damage: '2D6', armorPiercing: true, baseRange: '110m', attacksPerRound: '1或全自动', capacity: '30', malfunction: 99, price20s: null, priceModern: 2800, era: '现代', category: '突击步枪' },
    ],

    // ===== 冲锋枪（贯穿） =====
    '冲锋枪': [
      { name: 'H&K MP5', skill: '射击(冲锋枪)', damage: '1D10', armorPiercing: true, baseRange: '20m', attacksPerRound: '1(2)或全自动', capacity: '15/30', malfunction: 97, price20s: null, priceModern: null, era: '现代', category: '冲锋枪' },
      { name: 'MAC-11', skill: '射击(冲锋枪)', damage: '1D10', armorPiercing: true, baseRange: '15m', attacksPerRound: '1(3)或全自动', capacity: '32', malfunction: 96, price20s: null, priceModern: 750, era: '现代', category: '冲锋枪' },
      { name: '蝎式冲锋枪', skill: '射击(冲锋枪)', damage: '1D8', armorPiercing: true, baseRange: '15m', attacksPerRound: '1(3)或全自动', capacity: '20', malfunction: 96, price20s: null, priceModern: null, era: '现代', category: '冲锋枪' },
      { name: '乌兹冲锋枪', skill: '射击(冲锋枪)', damage: '1D10', armorPiercing: true, baseRange: '20m', attacksPerRound: '1(2)或全自动', capacity: '32', malfunction: 98, price20s: null, priceModern: 1000, era: '现代', category: '冲锋枪' },
    ],

    // ===== 机枪（贯穿） =====
    '机枪': [
      { name: '1882年式手摇加特林', skill: '射击(机枪)', damage: '2D6+4', armorPiercing: true, baseRange: '100m', attacksPerRound: '全自动', capacity: '200', malfunction: 96, price20s: 2000, priceModern: 14000, era: '1920s，稀有', category: '机枪' },
      { name: '转管速射机枪 (7.62mm)', skill: '射击(机枪)', damage: '2D6+4', armorPiercing: true, baseRange: '200m', attacksPerRound: '全自动', capacity: '4000', malfunction: 98, price20s: null, priceModern: null, era: '现代', category: '机枪' },
      { name: 'FN 米尼米机枪 (5.56mm)', skill: '射击(机枪)', damage: '2D6', armorPiercing: true, baseRange: '110m', attacksPerRound: '全自动', capacity: '30/200', malfunction: 99, price20s: null, priceModern: null, era: '现代', category: '机枪' },
    ],

    // ===== 爆炸物、重武器和其他武器（贯穿） =====
    '爆炸物': [
      { name: '莫洛托夫鸡尾酒', skill: '投掷', damage: '2D6+燃烧', armorPiercing: true, baseRange: 'STR/5m', attacksPerRound: '1/2', capacity: '一次性', malfunction: 95, price20s: null, priceModern: null, era: '1920s，现代', category: '爆炸物' },
      { name: '信号枪', skill: '射击(手枪)', damage: '1D10+1D3 燃烧', armorPiercing: true, baseRange: '10m', attacksPerRound: '1/2', capacity: '1', malfunction: 100, price20s: 15, priceModern: 75, era: '1920s，现代', category: '爆炸物' },
      { name: 'M79 榴弹发射器', skill: '射击(重武器)', damage: '3D10/2m', armorPiercing: true, baseRange: '20m', attacksPerRound: '1/3', capacity: '1', malfunction: 99, price20s: null, priceModern: null, era: '现代', category: '爆炸物' },
      { name: '炸药棒', skill: '投掷', damage: '4D10/3m', armorPiercing: true, baseRange: 'STR/5m', attacksPerRound: '1/2', capacity: '一次性', malfunction: 99, price20s: 2, priceModern: 5, era: '1920s，现代', category: '爆炸物' },
      { name: '雷管', skill: '电气维修', damage: '2D10/1m', armorPiercing: true, baseRange: 'N/A', attacksPerRound: '-', capacity: '一次性', malfunction: 100, price20s: 1, priceModern: 20, era: '1920s，现代', category: '爆炸物' },
      { name: '塑胶炸弹(C-4) 100g/4盎司', skill: '爆破', damage: '6D10/3m', armorPiercing: true, baseRange: '原地布设', attacksPerRound: '一次性', capacity: '一次性', malfunction: 99, price20s: null, priceModern: null, era: '现代', category: '爆炸物' },
      { name: '手榴弹', skill: '投掷', damage: '4D10/3m', armorPiercing: true, baseRange: 'STR/5m', attacksPerRound: '1/2', capacity: '一次性', malfunction: 99, price20s: null, priceModern: null, era: '1920s，现代', category: '爆炸物' },
      { name: '81mm 迫击炮', skill: '炮术', damage: '6D10/6m', armorPiercing: true, baseRange: '500m', attacksPerRound: '1', capacity: '独立装弹', malfunction: 100, price20s: null, priceModern: null, era: '现代', category: '爆炸物' },
      { name: '75mm 野战炮', skill: '炮术', damage: '10D10/2m', armorPiercing: true, baseRange: '500m', attacksPerRound: '1/4', capacity: '独立装弹', malfunction: 99, price20s: 1500, priceModern: null, era: '1920s，现代', category: '爆炸物' },
      { name: '120mm 坦克炮', skill: '炮术', damage: '15D10/2m', armorPiercing: true, baseRange: '2000m', attacksPerRound: '1', capacity: '独立装弹', malfunction: 100, price20s: null, priceModern: null, era: '现代', category: '爆炸物' },
      { name: '5英寸(127mm)舰载炮', skill: '炮术', damage: '12D10/4m', armorPiercing: true, baseRange: '3000m', attacksPerRound: '1', capacity: '自动上弹', malfunction: 98, price20s: null, priceModern: null, era: '现代', category: '爆炸物' },
      { name: '反步兵地雷', skill: '爆破', damage: '4D10/5m', armorPiercing: true, baseRange: '原地布设', attacksPerRound: '布设', capacity: '一次性', malfunction: 99, price20s: null, priceModern: null, era: '现代', category: '爆炸物' },
      { name: '阔剑地雷', skill: '爆破', damage: '6D6/20m', armorPiercing: true, baseRange: '原地布设', attacksPerRound: '布设', capacity: '一次性', malfunction: 99, price20s: null, priceModern: null, era: '现代', category: '爆炸物' },
      { name: '火焰喷射器', skill: '射击(火焰喷射器)', damage: '2D6+燃烧', armorPiercing: true, baseRange: '25m', attacksPerRound: '1', capacity: '至少10', malfunction: 93, price20s: null, priceModern: null, era: '1920s，现代', category: '爆炸物' },
      { name: 'M72 反坦克火箭筒', skill: '射击(重武器)', damage: '8D10/1m', armorPiercing: true, baseRange: '150m', attacksPerRound: '1', capacity: '1', malfunction: 98, price20s: null, priceModern: null, era: '现代', category: '爆炸物' },
    ],
  },
};

// ============================================================
// 武器分类图标映射
// ============================================================
const WEAPON_CATEGORY_ICONS = {
  '常规武器': '&#9876;',
  '手枪': '&#128299;',
  '步枪': '&#127942;',
  '霰弹枪': '&#128298;',
  '突击步枪': '&#128163;',
  '冲锋枪': '&#128163;',
  '机枪': '&#128163;',
  '爆炸物': '&#128165;',
  '1920年代非法武器': '&#128299;',
  '1920年代近战武器': '&#9876;',
};

// ============================================================
// 获取当前年代的武器数据库
// ============================================================
function getCurrentWeaponsDB() {
  let era = (typeof state !== 'undefined' && state.era) ? state.era : '1920s';
  return WEAPONS_DATABASE[era] || WEAPONS_DATABASE['1920s'];
}

// ============================================================
// 模糊搜索武器名称（在当前年代武器库中搜索）
// ============================================================
function searchWeapons(query) {
  if (!query || !query.trim()) return [];
  query = query.trim().toLowerCase();
  let db = getCurrentWeaponsDB();
  let results = [];
  for (let cat in db) {
    for (let item of db[cat]) {
      if (item.name.toLowerCase().includes(query)) {
        results.push({ ...item });
      }
    }
  }
  return results;
}

// ============================================================
// 获取当前年代的所有武器分类名称
// ============================================================
function getWeaponCategories() {
  return Object.keys(getCurrentWeaponsDB());
}

// 在 index.html 中通过 <script> 标签加载
