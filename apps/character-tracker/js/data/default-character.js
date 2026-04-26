/**
 * default-character.js - 默认示例角色数据
 */

  const DEFAULT_DATA = {
    name: '亨利·阿什克罗夫特', playerName: '守秘人',
    occupation: '私家侦探', age: 34, gender: '男',
    residence: '波士顿，马萨诸塞州', hometown: '纽约，纽约州',
    era: '1920s', avatar: '',
    rawAttrs: { STR:60, CON:50, SIZ:55, DEX:70, APP:50, INT:75, POW:60, EDU:65 },
    effectiveAttrs: { STR:60, CON:50, SIZ:55, DEX:70, APP:50, INT:75, POW:60, EDU:65 },
    luck: 55,
    derived: { HP:10, MP:12, SAN:55, DB:'0', build:-1, MOV:8, dodge:35, language:65 },
    skillPoints: {
      '会计': {occ:0,int:0}, '人类学': {occ:0,int:0}, '估价': {occ:10,int:0},
      '考古学': {occ:0,int:0}, '取悦': {occ:10,int:0}, '攀爬': {occ:0,int:0},
      '信用评级': {occ:40,int:0}, '克苏鲁神话': {occ:4,int:0}, '闪避': {occ:0,int:0},
      '汽车驾驶': {occ:20,int:0}, '电气维修': {occ:0,int:0}, '电子学': {occ:0,int:0},
      '话术': {occ:25,int:0}, '格斗(斗殴)': {occ:15,int:0}, '射击(手枪)': {occ:40,int:0},
      '急救': {occ:10,int:0}, '历史': {occ:10,int:0}, '恐吓': {occ:25,int:0},
      '跳跃': {occ:0,int:0}, '语言(法语)': {occ:4,int:0}, '母语': {occ:0,int:0},
      '法律': {occ:30,int:0}, '图书馆使用': {occ:30,int:0}, '聆听': {occ:20,int:0},
      '锁匠': {occ:29,int:0}, '机械维修': {occ:0,int:0}, '医学': {occ:0,int:0},
      '博物学': {occ:0,int:0}, '导航': {occ:0,int:0}, '神秘学': {occ:15,int:0},
      '说服': {occ:35,int:0}, '操作重型机械': {occ:0,int:0}, '精神分析': {occ:0,int:0},
      '骑术': {occ:0,int:0}, '潜行': {occ:30,int:0}, '游泳': {occ:0,int:0},
      '投掷': {occ:5,int:0}, '追踪': {occ:25,int:0}, '心理学': {occ:0,int:0},
      '乔装': {occ:0,int:0}, '射击(步枪/霰弹枪)': {occ:0,int:0},
      '艺术和手艺(摄影)': {occ:20,int:0}, '妙手': {occ:10,int:0}
    },
    weapons: [
      { name: '徒手（拳打脚踢）', skill: '格斗(斗殴)', damage: '1D3+DB', armorPiercing: false, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null },
      { name: '.32 左轮手枪', skill: '射击(手枪)', damage: '1D8', armorPiercing: false, baseRange: '15', attacksPerRound: '1', capacity: '6', malfunction: '98' },
      { name: '霰弹枪', skill: '射击(步枪/霰弹枪)', damage: '2D6+4', armorPiercing: false, baseRange: '20', attacksPerRound: '1', capacity: '6', malfunction: '98' },
      { name: '战斗匕首', skill: '格斗(斗殴)', damage: '1D4+db', armorPiercing: false, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null }
    ],
    background: [
      { category: '形象描述', content: '身材中等偏瘦，深棕色头发略显凌乱，总是穿着一件洗得发白的灰色风衣。\n眼神锐利但带着疲惫，下巴有一道浅浅的疤痕。左手无名指上有一枚旧婚戒。\n口袋里总揣着一包骆驼牌香烟和一盒火柴。', isKey: false },
      { category: '特质', content: '观察力敏锐，善于从细节中发现线索。性格孤僻但重承诺。\n对超自然现象持怀疑态度，但近期的经历让他开始动摇。\n偶尔失眠，常被噩梦困扰。', isKey: false },
      { category: '思想与信念', content: '"真相永远藏在暗处，而暗处的东西……最好不要去看。"\n相信科学与理性，但内心深处恐惧有些事物无法被解释。', isKey: false },
      { category: '创伤和疤痕', content: '下巴疤痕——三年前追踪窃贼时被碎玻璃划伤。\n右肩枪伤——1924年码头走私案中留下的。', isKey: false },
      { category: '重要之人', content: '艾琳·阿什克罗夫特（前妻）——因他的工作性质而分居。\n老马库斯·里德（退休警探，导师）——教会他调查技巧。\n萨拉·詹金斯（线人）——波士顿地下世界的消息来源。', isKey: true },
      { category: '恐惧症和躁狂症', content: '幽闭恐惧症——在狭窄封闭空间中会感到焦虑。', isKey: false },
      { category: '意义非凡之地', content: '波士顿警察局——曾经工作过的地方，有美好也有痛苦的回忆。\n英斯茅斯——最近调查的一桩失踪案让他对这个小镇产生了不安。', isKey: false },
      { category: '典籍、法术和神话造物', content: '《蠕虫之秘》残页——从英斯茅斯案件中获得的几页泛黄手稿。\n一枚奇怪的石质护符——表面刻有无法辨认的符号。', isKey: false },
      { category: '宝贵之物', content: '父亲的怀表——唯一留存的家庭纪念品。\n一把柯尔特侦探特装左轮——陪伴多年的老伙计。', isKey: false },
      { category: '第三类接触', content: '在英斯茅斯废弃教堂地下室的梦境——至今无法确定是梦还是现实。', isKey: false }
    ],
    equipment: [
      { name: '.32 左轮手枪（柯尔特侦探特装）×1，弹药 24 发', type: '', price: 0, detail: '' },
      { name: '战斗匕首 ×1', type: '', price: 0, detail: '' },
      { name: '骆驼牌香烟 ×2，火柴 ×1', type: '', price: 0, detail: '' },
      { name: '笔记本、铅笔、钢笔', type: '', price: 0, detail: '' },
      { name: '手电筒（备用电池 ×2）', type: '', price: 0, detail: '' },
      { name: '放大镜、指纹粉', type: '', price: 0, detail: '' },
      { name: '急救包（绷带、碘酒、止痛药）', type: '', price: 0, detail: '' },
      { name: '银质怀表（父亲遗物）', type: '', price: 0, detail: '' },
      { name: '钥匙串（办公室、公寓、储物柜）', type: '', price: 0, detail: '' },
      { name: '棕色皮质公文包（内含案件档案）', type: '', price: 0, detail: '' },
      { name: '石质护符（来历不明）', type: '', price: 0, detail: '' }
    ],
    companions: [
      { charName: '玛格丽特', playerName: '玩家A' },
      { charName: '杰克', playerName: '玩家B' },
      { charName: '陈教授', playerName: '玩家C' },
      { charName: '多萝西', playerName: '玩家D' },
      { charName: '维克多', playerName: '玩家E' },
      { charName: '露西', playerName: '玩家F' },
      { charName: '山姆', playerName: '玩家G' },
      { charName: '伊莎贝尔', playerName: '玩家H' }
    ],
    spendingCash: 150,
    occSkills: ['法律', '乔装', '图书馆使用', '心理学', '艺术和手艺(摄影)', '侦查', '信用评级', '话术', '射击(手枪)'],
    keyConnection: -1,
  };

  
