// 游戏表格数据 - Game Tables
// 从 coc_character_creator.html 提取

const AGE_TABLE = [
  { min: 15, max: 19, eduGrowth: 0, strConDex: -5, strConDexCount: 0, app: -5, movPenalty: 0, luckyTwice: true },
  { min: 20, max: 39, eduGrowth: 1, strConDex: 0, strConDexCount: 0, app: 0, movPenalty: 0, luckyTwice: false },
  { min: 40, max: 49, eduGrowth: 2, strConDex: -5, strConDexCount: 1, app: -5, movPenalty: -1, luckyTwice: false },
  { min: 50, max: 59, eduGrowth: 3, strConDex: -10, strConDexCount: 1, app: -10, movPenalty: -2, luckyTwice: false },
  { min: 60, max: 69, eduGrowth: 4, strConDex: -20, strConDexCount: 1, app: -15, movPenalty: -3, luckyTwice: false },
  { min: 70, max: 79, eduGrowth: 4, strConDex: -40, strConDexCount: 1, app: -20, movPenalty: -4, luckyTwice: false },
  { min: 80, max: 89, eduGrowth: 4, strConDex: -80, strConDexCount: 1, app: -25, movPenalty: -5, luckyTwice: false }
];

const DB_TABLE = [
  { min: 2, max: 64, db: '-2', build: -2 },
  { min: 65, max: 84, db: '-1', build: -1 },
  { min: 85, max: 124, db: '0', build: 0 },
  { min: 125, max: 164, db: '+1D4', build: 1 },
  { min: 165, max: 204, db: '+1D6', build: 2 },
  { min: 205, max: 284, db: '+2D6', build: 3 },
  { min: 285, max: 364, db: '+3D6', build: 4 },
  { min: 365, max: 444, db: '+4D6', build: 5 },
  { min: 445, max: 524, db: '+5D6', build: 6 }
];

const STEP_NAMES = [
  '基本信息', '属性生成', '年龄调整', '职业选择', '技能分配', '衍生属性', '背景故事', '完成'
];

