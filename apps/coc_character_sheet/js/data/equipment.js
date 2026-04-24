// 装备数据库 - Equipment Database
// 包含:
//   - CREDIT_RATING_TABLE  信用评级对应现金和资产表
//   - EQUIPMENT_DATABASE   常用随身物品分类列表
//   - searchEquipment(query) 模糊搜索物品
//   - getCreditRatingInfo(creditRating) 根据信用评级获取现金和资产信息

// ============================================================
// 信用评级对应现金和资产表（表2：现金和资产）
// ============================================================
const CREDIT_RATING_TABLE = {
  '1920s': [
    { min: 0, max: 9, level: '赤贫', cash: 0.5, assets: '身无分文' },
    { min: 10, max: 29, level: '贫穷', cash: 5, assets: '无资产' },
    { min: 30, max: 49, level: '标准', cash: 50, assets: '无资产' },
    { min: 50, max: 69, level: '小康', cash: 500, assets: '普通汽车或小公寓' },
    { min: 70, max: 89, level: '富裕', cash: 5000, assets: '大房子或好车' },
    { min: 90, max: 99, level: '豪富', cash: 50000, assets: '豪宅+仆人' },
  ],
  '现代': [
    { min: 0, max: 9, level: '赤贫', cash: 50, assets: '身无分文' },
    { min: 10, max: 29, level: '贫穷', cash: 500, assets: '旧车或租房' },
    { min: 30, max: 49, level: '标准', cash: 5000, assets: '普通汽车或小公寓' },
    { min: 50, max: 69, level: '小康', cash: 50000, assets: '好车或大公寓' },
    { min: 70, max: 89, level: '富裕', cash: 500000, assets: '豪宅或豪车' },
    { min: 90, max: 99, level: '豪富', cash: 5000000, assets: '庄园+豪车+游艇' },
  ]
};

// ============================================================
// 常用随身物品分类列表（1920年代价格）
// 数据来源: equipment.md / weapons.md
// ============================================================
const EQUIPMENT_DATABASE = {
  '1920s': {
  // ===== 1920年代装备（来自 equipment.md）=====

  '男装': [
    { name: '卡其牛仔布', price: 1.79, category: '男装' },
    { name: '精纺毛料礼服', price: 17.95, category: '男装' },
    { name: '羊绒礼服', price: 18.50, category: '男装' },
    { name: '毛呢或亚麻短衬裤', price: 2.98, category: '男装' },
    { name: '马海毛西装', price: 13.85, category: '男装' },
    { name: '卡其牛仔布短衬裤', price: 1.79, category: '男装' },
    { name: '林场连衫裤', price: 0.69, category: '男装' },
    { name: '灰色毛呢短衬裤', price: 2.98, category: '男装' },
    { name: '外套', price: 9.95, category: '男装', priceDisplay: '$9.95-$35.00' },
    { name: '卡其紧身裤', price: 0.98, category: '男装' },
    { name: '切斯特菲尔德大衣（软领长大衣）', price: 19.95, category: '男装' },
    { name: '户外靴', price: 2.59, category: '男装' },
    { name: '泳衣', price: 4.95, category: '男装' },
    { name: '牛津式皮鞋', price: 6.95, category: '男装' },
    { name: '泳帽', price: 0.40, category: '男装' },
    { name: '革制工作鞋', price: 4.95, category: '男装' },
    { name: '泵式鞋（船形高跟鞋）', price: 1.29, category: '男装' },
    { name: '白色法兰绒休闲裤', price: 8.00, category: '男装' },
    { name: '密织棉布衬衫', price: 0.79, category: '男装', priceDisplay: '$0.79-$1.25' },
    { name: '细平布礼服衬衫', price: 1.95, category: '男装' },
    { name: '运动羊毛衫', price: 7.69, category: '男装' },
    { name: '费多拉帽', price: 4.95, category: '男装' },
    { name: '毛料高尔夫帽', price: 0.79, category: '男装' },
    { name: '毡帽', price: 1.95, category: '男装' },
    { name: '革制橄榄球头盔', price: 3.65, category: '男装' },
    { name: '运动衫', price: 0.98, category: '男装' },
    { name: '丝质领带', price: 0.50, category: '男装' },
    { name: '吊袜带', price: 0.39, category: '男装' },
    { name: '袖扣', price: 0.40, category: '男装' },
    { name: '皮带', price: 1.35, category: '男装' },
    { name: '背带', price: 0.79, category: '男装' },
    { name: '登山靴', price: 7.25, category: '男装' },
    { name: '泳衣（运动款）', price: 3.45, category: '男装' },
  ],

  '女装': [
    { name: '定制时装礼服', price: 90, category: '女装', priceDisplay: '$90+' },
    { name: '塔夫绸礼服', price: 10.95, category: '女装' },
    { name: '查米尤斯绉缎礼服', price: 10.95, category: '女装' },
    { name: '花格布连衣裙', price: 2.59, category: '女装' },
    { name: '丝质百褶裙', price: 7.95, category: '女装' },
    { name: '棉质衬衫', price: 1.98, category: '女装' },
    { name: '精纺毛衣', price: 9.48, category: '女装' },
    { name: '棉绉纱便服', price: 0.88, category: '女装' },
    { name: '巴黎式高跟鞋', price: 4.45, category: '女装' },
    { name: '皮制单带拖鞋', price: 0.98, category: '女装' },
    { name: '天鹅绒暖帽', price: 4.44, category: '女装' },
    { name: '软缎无檐帽', price: 3.69, category: '女装' },
    { name: '人造人丝弹性紧身胸衣', price: 2.59, category: '女装' },
    { name: '绣花连衣长衬裙', price: 1.59, category: '女装' },
    { name: '长筒丝袜（3双）', price: 2.25, category: '女装' },
    { name: '丝织灯笼裤', price: 3.98, category: '女装', priceDisplay: '$3.98-$4.98' },
    { name: '粗呢夹克，备全衬', price: 3.95, category: '女装' },
    { name: '毛皮饰边的天鹅绒大衣', price: 39.75, category: '女装' },
    { name: '棕色狐皮大衣', price: 198.00, category: '女装' },
    { name: '棉质束腰风衣', price: 3.98, category: '女装' },
    { name: '真丝手袋', price: 4.98, category: '女装' },
    { name: '装饰发梳', price: 0.98, category: '女装' },
  ],

  '住宿': [
    { name: '普通旅馆（每晚）', price: 4.50, category: '住宿' },
    { name: '普通旅馆（每周，含服务）', price: 10.00, category: '住宿' },
    { name: '廉价小旅馆', price: 0.75, category: '住宿' },
    { name: '高级旅馆（每晚）', price: 9.00, category: '住宿' },
    { name: '高级旅馆（每周，含服务）', price: 24.00, category: '住宿' },
    { name: '豪华宾馆', price: 30, category: '住宿', priceDisplay: '$30+' },
    { name: '基督教青年会（YMCA）带家具房间', price: 5.00, category: '住宿' },
    { name: '大型房屋，每年', price: 1000.00, category: '住宿' },
    { name: '中型房屋，每月', price: 55.00, category: '住宿' },
    { name: '度假别墅，每季', price: 350.00, category: '住宿' },
    { name: '公寓楼，每周', price: 12.50, category: '住宿' },
    { name: '一般公寓，每周', price: 10.00, category: '住宿' },
    { name: '高级公寓，每周', price: 40.00, category: '住宿' },
  ],

  '房产': [
    { name: '乡村别墅', price: 20000, category: '房产', priceDisplay: '$20,000+' },
    { name: '大型房屋', price: 7000, category: '房产', priceDisplay: '$7,000+' },
    { name: '城镇房屋', price: 4000, category: '房产', priceDisplay: '$4,000-$8,000' },
    { name: '普通房屋', price: 2900, category: '房产', priceDisplay: '$2,900+' },
    { name: '平房', price: 3100, category: '房产', priceDisplay: '$3,100' },
    { name: '小型（6房间）预设房屋', price: 1175, category: '房产', priceDisplay: '$1,175' },
    { name: '中型（8房间）预设房屋', price: 2135, category: '房产', priceDisplay: '$2,135' },
    { name: '大型（9房间）预设房屋', price: 3278, category: '房产', priceDisplay: '$3,278' },
    { name: '巨型（24房间公寓）预设房屋', price: 4492, category: '房产', priceDisplay: '$4,492' },
  ],

  '医疗用品': [
    { name: '阿司匹林（12片）', price: 0.10, category: '医疗用品' },
    { name: '泻盐', price: 0.90, category: '医疗用品' },
    { name: '消化不良药', price: 0.25, category: '医疗用品' },
    { name: "Nature's Remedy 牌轻泻剂", price: 0.25, category: '医疗用品' },
    { name: '医药箱', price: 10.45, category: '医疗用品' },
    { name: '镊子', price: 3.59, category: '医疗用品' },
    { name: '手术刀套装', price: 1.39, category: '医疗用品' },
    { name: '皮下注射器', price: 12.50, category: '医疗用品' },
    { name: '喷雾器', price: 1.39, category: '医疗用品' },
    { name: '纱布绷带（5m）', price: 0.69, category: '医疗用品' },
    { name: '体温计', price: 0.69, category: '医疗用品' },
    { name: '医用酒精（2L）', price: 0.20, category: '医疗用品' },
    { name: '硬橡胶针筒', price: 0.69, category: '医疗用品' },
    { name: '便盆', price: 1.79, category: '医疗用品' },
    { name: '轮椅', price: 39.95, category: '医疗用品' },
    { name: '枫木拐杖', price: 1.59, category: '医疗用品' },
    { name: '橡皮膏', price: 0.29, category: '医疗用品' },
    { name: '金属足弓支撑垫', price: 1.98, category: '医疗用品' },
    { name: '皮革护踝', price: 0.98, category: '医疗用品' },
  ],

  '外出用餐': [
    { name: '吃鸡大餐', price: 2.50, category: '外出用餐' },
    { name: '早餐', price: 0.45, category: '外出用餐' },
    { name: '午餐', price: 0.65, category: '外出用餐' },
    { name: '正餐', price: 1.25, category: '外出用餐' },
    { name: '劣质杜松子酒（少量）', price: 0.10, category: '外出用餐' },
    { name: '鸡尾酒', price: 0.25, category: '外出用餐' },
    { name: '红酒（杯）', price: 0.75, category: '外出用餐' },
    { name: '啤酒（杯）', price: 0.20, category: '外出用餐' },
    { name: '威士忌（杯）', price: 0.25, category: '外出用餐' },
    { name: '可口可乐（350ml）', price: 0.05, category: '外出用餐' },
  ],

  '户外与旅行装备': [
    { name: '炊具箱', price: 8.98, category: '户外与旅行装备' },
    { name: '野炊炉', price: 6.10, category: '户外与旅行装备' },
    { name: '真空杯', price: 0.89, category: '户外与旅行装备' },
    { name: '折叠浴缸', price: 6.79, category: '户外与旅行装备' },
    { name: '防水毯', price: 5.06, category: '户外与旅行装备' },
    { name: '行军床', price: 3.65, category: '户外与旅行装备' },
    { name: '电石灯', price: 2.59, category: '户外与旅行装备' },
    { name: '罐装电石（1kg）', price: 0.25, category: '户外与旅行装备' },
    { name: '探照灯', price: 5.95, category: '户外与旅行装备' },
    { name: '汽油灯', price: 6.59, category: '户外与旅行装备' },
    { name: '煤油灯', price: 1.39, category: '户外与旅行装备' },
    { name: '带遮光装置的提灯', price: 1.68, category: '户外与旅行装备' },
    { name: '手电筒', price: 1.35, category: '户外与旅行装备', priceDisplay: '$1.35-$2.25' },
    { name: '电池', price: 0.60, category: '户外与旅行装备' },
    { name: '笔型手电筒', price: 1.00, category: '户外与旅行装备' },
    { name: '一次性信号火炬', price: 0.27, category: '户外与旅行装备' },
    { name: '15小时蜡烛（12支）', price: 0.62, category: '户外与旅行装备' },
    { name: '防水盒装火柴', price: 0.48, category: '户外与旅行装备' },
    { name: '帐篷（7x7英尺）', price: 11.48, category: '户外与旅行装备' },
    { name: '帐篷（12x16英尺）', price: 28.15, category: '户外与旅行装备' },
    { name: '帐篷（16x24英尺）', price: 53.48, category: '户外与旅行装备' },
    { name: '汽车帐篷（7x7英尺）', price: 12.80, category: '户外与旅行装备' },
    { name: '铁质帐篷桩（12支）', price: 1.15, category: '户外与旅行装备' },
    { name: '车载折叠床', price: 8.95, category: '户外与旅行装备' },
    { name: '水壶（1L）', price: 1.69, category: '户外与旅行装备' },
    { name: '保温水箱（20L）', price: 3.98, category: '户外与旅行装备' },
    { name: '水袋（4L）', price: 0.80, category: '户外与旅行装备' },
    { name: '水袋（20L）', price: 2.06, category: '户外与旅行装备' },
    { name: '化学灭火器', price: 13.85, category: '户外与旅行装备' },
    { name: '重型帆布背包', price: 3.45, category: '户外与旅行装备' },
    { name: '雨伞', price: 1.79, category: '户外与旅行装备' },
    { name: '香烟（包）', price: 0.10, category: '户外与旅行装备' },
    { name: '雪茄（盒）', price: 2.29, category: '户外与旅行装备' },
    { name: '蜡烛（4支）', price: 0.38, category: '户外与旅行装备' },
    { name: '土耳其水烟斗', price: 0.99, category: '户外与旅行装备' },
  ],

  '调查工具': [
    { name: '单筒望远镜', price: 3.45, category: '调查工具' },
    { name: '手铐', price: 3.35, category: '调查工具' },
    { name: '手铐备用钥匙', price: 0.28, category: '调查工具' },
    { name: '警哨', price: 0.30, category: '调查工具' },
    { name: '双筒望远镜', price: 28.50, category: '调查工具' },
    { name: '宝石指南针', price: 3.25, category: '调查工具' },
    { name: '电话录音机', price: 39.95, category: '调查工具' },
    { name: '钢丝录音机', price: 129.95, category: '调查工具' },
    { name: '带盖指南针', price: 2.85, category: '调查工具' },
    { name: '猎刀', price: 2.35, category: '调查工具' },
    { name: '双刃折刀', price: 1.20, category: '调查工具' },
    { name: '手斧', price: 0.98, category: '调查工具' },
    { name: '小型动物陷阱（小型捕兽笼）', price: 2.48, category: '调查工具' },
    { name: '螺旋弹簧动物陷阱（弹簧捕兽夹）', price: 5.98, category: '调查工具' },
    { name: '捕熊陷阱', price: 11.43, category: '调查工具' },
    { name: '鱼竿和钓具', price: 9.35, category: '调查工具' },
    { name: '麻包线', price: 0.27, category: '调查工具' },
    { name: '便携显微镜', price: 0.58, category: '调查工具' },
    { name: '计步器', price: 1.70, category: '调查工具' },
    { name: '110倍桌上显微镜', price: 17.50, category: '调查工具' },
    { name: '落地保险柜（450kg）', price: 62.50, category: '调查工具' },
    { name: '全套潜水装备', price: 1200.00, category: '调查工具' },
    { name: '钢质划艇（4人）', price: 35.20, category: '调查工具' },
    { name: '2马力电动划艇', price: 79.95, category: '调查工具' },
    { name: '帆布和木质独木舟', price: 75.00, category: '调查工具' },
    { name: '野外望远镜（3-6倍）', price: 8500, category: '调查工具', priceDisplay: '$8,500-$23,000' },
  ],

  '工具': [
    { name: '工具套装（20件套）', price: 14.90, category: '工具' },
    { name: '手钻（带8钻头）', price: 6.15, category: '工具' },
    { name: '大型铁滑轮', price: 1.75, category: '工具' },
    { name: '挂锁', price: 0.95, category: '工具' },
    { name: '绳索（15m）', price: 8.60, category: '工具' },
    { name: '轻绞链（每30cm）', price: 0.10, category: '工具' },
    { name: '修表工具箱', price: 7.74, category: '工具' },
    { name: '撬棍', price: 2.25, category: '工具' },
    { name: '手锯', price: 1.65, category: '工具' },
    { name: '汽油喷灯', price: 4.45, category: '工具' },
    { name: '电工手套', price: 1.98, category: '工具' },
    { name: '高空作业工具腰带和安全带', price: 3.33, category: '工具' },
    { name: '抓绳器', price: 2.52, category: '工具' },
    { name: '首饰加工工具48件套', price: 15.98, category: '工具' },
    { name: '砂轮机', price: 6.90, category: '工具' },
    { name: '工兵铲', price: 0.95, category: '工具' },
    { name: '家用工具箱', price: 14.90, category: '工具' },
  ],

  '文具与书籍': [
    { name: '自来水笔', price: 1.80, category: '文具与书籍' },
    { name: '自动铅笔', price: 0.85, category: '文具与书籍' },
    { name: '写字板', price: 0.20, category: '文具与书籍' },
    { name: '紧身衣', price: 9.50, category: '文具与书籍' },
    { name: '画板', price: 0.25, category: '文具与书籍' },
    { name: '雷明顿牌打字机', price: 40.00, category: '文具与书籍' },
    { name: '哈里斯牌打字机', price: 66.75, category: '文具与书籍' },
    { name: '全本辞典', price: 6.75, category: '文具与书籍' },
    { name: '十卷本百科全书', price: 49.00, category: '文具与书籍' },
    { name: '《圣经》', price: 3.98, category: '文具与书籍' },
    { name: '公文包', price: 1.48, category: '文具与书籍' },
    { name: '地球仪', price: 9.95, category: '文具与书籍' },
    { name: '折叠书桌', price: 16.65, category: '文具与书籍' },
    { name: '玻璃门香木书橱', price: 24.65, category: '文具与书籍' },
    { name: '婴儿车', price: 34.45, category: '文具与书籍' },
    { name: '修表眼镜', price: 0.45, category: '文具与书籍' },
    { name: '湿海绵呼吸器', price: 1.95, category: '文具与书籍' },
    { name: '便携放大镜', price: 1.68, category: '文具与书籍' },
  ],

  '交通运输': [
    { name: '常规航班（每10km）', price: 1.25, category: '交通运输' },
    { name: '国际航班（每100km）', price: 12.00, category: '交通运输' },
    { name: '瑟布莱斯复翼教练机', price: 300.00, category: '交通运输' },
    { name: 'Travel Air 2000 复翼机', price: 3000.00, category: '交通运输' },
    { name: '50英里铁路', price: 2.00, category: '交通运输' },
    { name: '100英里铁路', price: 3.00, category: '交通运输' },
    { name: '500英里铁路', price: 6.00, category: '交通运输' },
    { name: '诺顿摩托车', price: 95, category: '交通运输' },
    { name: '别克 Du-45', price: 1020, category: '交通运输' },
    { name: '凯迪拉克 55', price: 2240, category: '交通运输' },
    { name: '雪佛兰 Capitol', price: 695, category: '交通运输' },
    { name: '雪佛兰敞篷车', price: 570, category: '交通运输' },
    { name: '克莱斯勒 F-58', price: 1045, category: '交通运输' },
    { name: '道奇 S/1', price: 985, category: '交通运输' },
    { name: '杜森堡 J 型车', price: 20000, category: '交通运输' },
    { name: '福特 T型车', price: 360, category: '交通运输' },
    { name: '福特 A型车', price: 450, category: '交通运输' },
    { name: '哈德孙超级六系 J 型车', price: 1750, category: '交通运输' },
    { name: '奥兹摩比 43-AT', price: 1345, category: '交通运输' },
    { name: '帕卡德双六缸房车', price: 2950, category: '交通运输' },
    { name: '皮尔斯箭，1921年', price: 6000, category: '交通运输' },
    { name: '庞帝克 6-28 轿车', price: 745, category: '交通运输' },
    { name: '斯图贝克标准/独裁者', price: 1165, category: '交通运输' },
    { name: '斯图贝克房车（限载5人）', price: 995, category: '交通运输' },
    { name: '雪佛兰皮卡', price: 545, category: '交通运输' },
    { name: '道奇半吨小卡车', price: 1085, category: '交通运输' },
    { name: '福特 TT 卡车', price: 490, category: '交通运输' },
    { name: '二手雪佛兰 F.B. 轿车（1920年）', price: 300, category: '交通运输' },
    { name: '二手别克（1917年）', price: 75, category: '交通运输' },
    { name: '轮胎', price: 10.95, category: '交通运输' },
    { name: '轮胎修理工具', price: 0.32, category: '交通运输' },
    { name: '轮胎雪地防滑链', price: 4.95, category: '交通运输' },
    { name: '千斤顶', price: 1.00, category: '交通运输' },
    { name: '电瓶', price: 14.15, category: '交通运输' },
    { name: '散热器', price: 8.69, category: '交通运输' },
    { name: '替换汽车头灯', price: 0.30, category: '交通运输' },
    { name: '便携气泵', price: 3.25, category: '交通运输' },
    { name: '聚光灯', price: 2.95, category: '交通运输' },
    { name: '车载行李架', price: 1.35, category: '交通运输' },
    { name: '英国宾利 3升型', price: 9000, category: '交通运输' },
    { name: '德国宝马迪克西', price: 1225, category: '交通运输' },
    { name: '法国雪铁龙 C3', price: 800, category: '交通运输' },
    { name: '西班牙希斯帕诺-苏扎阿方索', price: 4000, category: '交通运输' },
    { name: '意大利蓝旗亚兰姆达 214', price: 4050, category: '交通运输' },
    { name: '德国梅塞迪斯-奔驰 SS', price: 7750, category: '交通运输' },
    { name: '法国雷诺 AX', price: 500, category: '交通运输' },
    { name: '英国劳斯莱斯银魅', price: 6750, category: '交通运输' },
    { name: '英国劳斯莱斯幻影Ⅰ型', price: 10800, category: '交通运输' },
  ],

  '通讯': [
    { name: '电报（12字以内）', price: 0.25, category: '通讯' },
    { name: '电报（每加一字）', price: 0.02, category: '通讯' },
    { name: '国际电报（每字）', price: 1.25, category: '通讯' },
    { name: '邮费（每盎司）', price: 0.02, category: '通讯' },
    { name: '明信片', price: 0.05, category: '通讯', priceDisplay: '5-20¢' },
    { name: '台式收音机', price: 49.95, category: '通讯' },
  ],

  '娱乐': [
    { name: '手风琴', price: 8.95, category: '娱乐' },
    { name: '四弦琴（带配件）', price: 2.75, category: '娱乐' },
    { name: '吉他（带配件）', price: 9.95, category: '娱乐' },
    { name: '小提琴（带配件）', price: 14.95, category: '娱乐' },
    { name: '军号', price: 3.45, category: '娱乐' },
    { name: '风琴', price: 127.00, category: '娱乐' },
    { name: '四弦班卓琴', price: 7.45, category: '娱乐' },
    { name: '黄铜萨克斯', price: 69.75, category: '娱乐' },
    { name: '自动钢琴', price: 447.00, category: '娱乐' },
    { name: '柜式留声机', price: 98.00, category: '娱乐' },
    { name: '留声机唱片', price: 0.75, category: '娱乐' },
    { name: '电影票（有座）', price: 0.15, category: '娱乐' },
    { name: '五分电影票', price: 0.05, category: '娱乐' },
    { name: '职业棒球赛门票', price: 1.00, category: '娱乐' },
    { name: '音乐会（普通座）', price: 4.00, category: '娱乐' },
    { name: '音乐会（包厢）', price: 10.00, category: '娱乐' },
  ],

  '摄影': [
    { name: '柯达可折叠一号相机', price: 4.29, category: '摄影' },
    { name: '伊斯曼商用相机', price: 140.00, category: '摄影' },
    { name: '16mm 电影胶片与放映机', price: 335.00, category: '摄影' },
    { name: '便携式摄像机', price: 65.00, category: '摄影' },
    { name: '布朗尼盒式相机', price: 3.15, category: '摄影' },
    { name: '胶卷（24张）', price: 0.38, category: '摄影' },
    { name: '胶片显影工具', price: 4.95, category: '摄影' },
  ],

  '航海': [
    { name: '座机（桥式）', price: 15.75, category: '航海' },
    { name: '发报机', price: 4.25, category: '航海' },
    { name: '头等舱（单程）', price: 120.00, category: '航海' },
    { name: '头等舱（往返）', price: 200.00, category: '航海' },
    { name: '统舱', price: 35.00, category: '航海' },
    { name: '四人热气球', price: 1800, category: '航海', priceDisplay: '$1,800+' },
    { name: '有轨电车票', price: 0.10, category: '航海' },
    { name: '公交车票', price: 0.05, category: '航海' },
    { name: '报纸', price: 0.05, category: '航海' },
  ],

  '腕表': [
    { name: '腕表', price: 5.95, category: '腕表' },
    { name: '金怀表', price: 35.10, category: '腕表' },
  ],

  // ===== 弹药（来自 equipment.md，弹药不属于武器）=====
  '弹药': [
    { name: '.22 长步枪弹（100发）', price: 0.54, category: '弹药' },
    { name: '.22 空尖弹（100发）', price: 0.53, category: '弹药' },
    { name: '.25 边缘发火弹（100发）', price: 1.34, category: '弹药' },
    { name: '.30-06 春田步枪弹（100发）', price: 7.63, category: '弹药' },
    { name: '.32 温彻斯特 Special（100发）', price: 5.95, category: '弹药' },
    { name: '.32-20 自动步枪弹（100发）', price: 2.97, category: '弹药' },
    { name: '.38 短头弹（100发）', price: 1.75, category: '弹药' },
    { name: '.38-55 自动步枪弹（100发）', price: 6.60, category: '弹药' },
    { name: '.44 大威力手枪弹（100发）', price: 4.49, category: '弹药' },
    { name: '.45 自动手枪子弹（100发）', price: 4.43, category: '弹药' },
    { name: '10号霰弹（25发）', price: 1.00, category: '弹药' },
    { name: '10号霰弹（100发）', price: 3.91, category: '弹药' },
    { name: '12号霰弹（25发）', price: 0.93, category: '弹药' },
    { name: '12号霰弹（100发）', price: 3.63, category: '弹药' },
    { name: '16号霰弹（25发）', price: 0.86, category: '弹药' },
    { name: '16号霰弹（100发）', price: 3.34, category: '弹药' },
    { name: '20号霰弹（25发）', price: 0.85, category: '弹药' },
    { name: '20号霰弹（100发）', price: 3.30, category: '弹药' },
    { name: '手枪附加弹夹', price: 1.90, category: '弹药' },
  ],
  },
  '现代': {
    // ===== 现代装备（严格按 wiki 数据） =====
    '男装': [
      { name: '定制真丝正装', price: 1000, category: '男装', priceDisplay: '$1,000+' },
      { name: '羊毛细条纹正装', price: 350, category: '男装' },
      { name: '人造丝混纺正装', price: 200, category: '男装' },
      { name: '宽松慢跑服', price: 50, category: '男装' },
      { name: '飞行员皮夹克', price: 200, category: '男装' },
      { name: '皮军大衣', price: 250, category: '男装' },
      { name: '大码斜纹衬衫', price: 35, category: '男装' },
      { name: '双褶直筒裤', price: 36, category: '男装' },
      { name: '圆领棉毛衣', price: 35, category: '男装' },
      { name: '牛仔裤', price: 40, category: '男装', priceDisplay: '$40+' },
      { name: '船底休闲皮鞋', price: 50, category: '男装' },
      { name: '交叉训练运动鞋', price: 100, category: '男装' },
      { name: '真丝领带', price: 35, category: '男装' },
      { name: '保暖内衣', price: 15, category: '男装' },
      { name: '尼龙泳裤', price: 15, category: '男装' },
      { name: '有袋马甲', price: 60, category: '男装' },
      { name: '高级登山鞋', price: 200, category: '男装' },
      { name: '防弹背心', price: 600, category: '男装', priceDisplay: '$600+' },
    ],
    '女装': [
      { name: '设计师定制礼服（上身一次）', price: 500, category: '女装', priceDisplay: '$500+' },
      { name: '高级真丝垂边礼服', price: 400, category: '女装' },
      { name: '腈纶西服', price: 150, category: '女装' },
      { name: '编织人造丝长大衣', price: 90, category: '女装' },
      { name: '涤纶无褶裤', price: 25, category: '女装' },
      { name: '水洗蓝牛仔裤', price: 35, category: '女装' },
      { name: '机车皮夹克', price: 260, category: '女装' },
      { name: '羊毛混纺外套', price: 190, category: '女装' },
      { name: '纽扣高领毛衣', price: 35, category: '女装' },
      { name: '时装印花薄毛裙', price: 50, category: '女装' },
      { name: '时装轻舞鞋', price: 100, category: '女装' },
      { name: '时装长靴', price: 160, category: '女装' },
      { name: '高级登山鞋', price: 200, category: '女装' },
      { name: '挎包', price: 350, category: '女装' },
      { name: '弹性氨纶自行车运动服', price: 20, category: '女装' },
      { name: '有袋马甲', price: 60, category: '女装' },
      { name: '防弹背心', price: 600, category: '女装', priceDisplay: '$600+' },
    ],
    '住宿': [
      { name: '经济型汽车旅馆', price: 40, category: '住宿' },
      { name: '一般旅馆', price: 90, category: '住宿', priceDisplay: '$90+' },
      { name: '每周（带服务）', price: 500, category: '住宿' },
      { name: '高级旅馆', price: 200, category: '住宿', priceDisplay: '$200+' },
      { name: '大酒店', price: 600, category: '住宿', priceDisplay: '$600+' },
      { name: '房子（年租）', price: 20000, category: '住宿', priceDisplay: '$20,000+' },
      { name: '公寓（周租）', price: 350, category: '住宿', priceDisplay: '$350+' },
    ],
    '医疗用品': [
      { name: '医疗箱', price: 100, category: '医疗用品' },
      { name: '一次性防毒面罩', price: 30, category: '医疗用品' },
      { name: '完整急救箱', price: 60, category: '医疗用品' },
      { name: '烧伤急救工具', price: 160, category: '医疗用品' },
      { name: '便携式氧气瓶', price: 70, category: '医疗用品' },
    ],
    '户外与旅行装备': [
      { name: '4人用炊具', price: 25, category: '户外与旅行装备' },
      { name: '丙烷野炊炉', price: 60, category: '户外与旅行装备' },
      { name: '便携化学厕所', price: 110, category: '户外与旅行装备' },
      { name: '涤纶/棉睡袋', price: 30, category: '户外与旅行装备' },
      { name: '极地睡袋', price: 200, category: '户外与旅行装备' },
      { name: '6W荧光灯', price: 30, category: '户外与旅行装备' },
      { name: '防抖双筒望远镜', price: 1300, category: '户外与旅行装备' },
      { name: '求生刀', price: 65, category: '户外与旅行装备' },
      { name: '瑞士军刀', price: 30, category: '户外与旅行装备' },
      { name: '廉价开山刀', price: 20, category: '户外与旅行装备' },
      { name: '10.5mm干绳索（50米）', price: 250, category: '户外与旅行装备' },
      { name: '手持GPS', price: 260, category: '户外与旅行装备' },
      { name: '登山装备（单人）', price: 2000, category: '户外与旅行装备' },
      { name: '旅行皮划艇（单人）', price: 1000, category: '户外与旅行装备' },
      { name: '高级水肺装备', price: 2500, category: '户外与旅行装备', priceDisplay: '$2,500+' },
      { name: '信号枪', price: 100, category: '户外与旅行装备' },
      { name: '3房间家庭帐篷', price: 70, category: '户外与旅行装备' },
      { name: '3人测地帐篷', price: 300, category: '户外与旅行装备' },
      { name: '温尼贝戈 RV 房车', price: 120000, category: '户外与旅行装备', priceDisplay: '$120,000+' },
      { name: '发电机（1500W）', price: 200, category: '户外与旅行装备' },
    ],
    '电子器材': [
      { name: '警用无线电监听器¹', price: 90, category: '电子器材' },
      { name: '三波段步话机', price: 35, category: '电子器材' },
      { name: '雷达天线', price: 40, category: '电子器材' },
      { name: '35mm数码单反相机', price: 450, category: '电子器材' },
      { name: '袖珍一次性相机', price: 10, category: '电子器材' },
      { name: '金属探测器', price: 240, category: '电子器材' },
      { name: '盖革计数器', price: 400, category: '电子器材' },
      { name: '运动感应急报警器', price: 200, category: '电子器材' },
      { name: '红外线边界报警器', price: 260, category: '电子器材' },
      { name: '电话变声器', price: 60, category: '电子器材' },
      { name: '笔式摄像机', price: 250, category: '电子器材' },
      { name: '电话窃听检测器', price: 400, category: '电子器材' },
      { name: '窃听扫描工具', price: 900, category: '电子器材' },
      { name: '穿戴式间谍相机', price: 200, category: '电子器材' },
      { name: '隐蔽录音设备', price: 300, category: '电子器材', priceDisplay: '$300+' },
      { name: '窃听设备', price: 200, category: '电子器材', priceDisplay: '$200+' },
      { name: '夜视仪', price: 600, category: '电子器材', priceDisplay: '$600+' },
    ],
    '工具': [
      { name: '60加仑空气压缩机', price: 600, category: '工具' },
      { name: '五金工具箱（255件套）', price: 500, category: '工具' },
      { name: '焊接设备', price: 1400, category: '工具' },
      { name: '开锁工具', price: 90, category: '工具' },
    ],
    '机动车': [
      { name: '宝马摩托车', price: 23000, category: '机动车' },
      { name: '杜卡迪街霸摩托车', price: 13000, category: '机动车' },
      { name: '劳斯莱斯幽灵轿车', price: 260000, category: '机动车' },
      { name: '阿斯顿马丁 DB9', price: 200500, category: '机动车' },
      { name: '凯迪拉克 SUV', price: 62000, category: '机动车' },
      { name: '宝马 1系', price: 38000, category: '机动车' },
      { name: '雪佛兰科尔维特折篷跑车', price: 54000, category: '机动车' },
      { name: '道奇 SUV', price: 33000, category: '机动车' },
      { name: '丰田普锐斯', price: 27000, category: '机动车' },
      { name: '福特福克斯', price: 16500, category: '机动车' },
    ],
    '通讯': [
      { name: '本地电话业务', price: 20, category: '通讯' },
      { name: '无绳电话', price: 50, category: '通讯' },
      { name: '手机', price: 50, category: '通讯' },
      { name: '智能手机', price: 99, category: '通讯' },
    ],
    '计算机': [
      { name: '廉价 PC', price: 100, category: '计算机', priceDisplay: '$100+' },
      { name: '笔记本电脑', price: 400, category: '计算机', priceDisplay: '$400+' },
      { name: '高级 PC', price: 1500, category: '计算机', priceDisplay: '$1,500+' },
      { name: '高级笔记本', price: 1300, category: '计算机', priceDisplay: '$1,300+' },
      { name: '平板电脑', price: 400, category: '计算机' },
      { name: '邮件管理软件', price: 200, category: '计算机' },
    ],
    '旅行': [
      { name: '机票（每10km）', price: 0.85, category: '旅行', priceDisplay: '$0.85-$6.00' },
      { name: '国际航班（每100km）', price: 13.50, category: '旅行', priceDisplay: '$13.50-$17.50' },
      { name: '75km 火车', price: 6.25, category: '旅行' },
      { name: '200km 火车', price: 12.5, category: '旅行' },
      { name: '1000km 火车', price: 62.5, category: '旅行' },
      { name: '头等舱（单程）航海', price: 3500, category: '旅行', priceDisplay: '$3,500+' },
      { name: '标准舱（单程）航海', price: 1600, category: '旅行', priceDisplay: '$1,600+' },
      { name: '货船运费', price: 1400, category: '旅行', priceDisplay: '$1,400+' },
    ],
    '枪械弹药': [
      { name: '.22 长步枪弹（500发）', price: 21, category: '枪械弹药' },
      { name: '.220 斯威夫特步枪弹（50发）', price: 24, category: '枪械弹药' },
      { name: '.25 自动手枪子弹（50发）', price: 15, category: '枪械弹药' },
      { name: '.30 卡宾枪弹（50发）', price: 15, category: '枪械弹药' },
      { name: '.30-06 春田式步枪弹（50发）', price: 15, category: '枪械弹药' },
      { name: '.357 马格南子弹（50发）', price: 22, category: '枪械弹药' },
      { name: '.38 Special（50发）', price: 17, category: '枪械弹药' },
      { name: '5.56mm（50发）', price: 24, category: '枪械弹药' },
      { name: '9mm 鲁格弹（50发）', price: 12, category: '枪械弹药' },
      { name: '.44 马格南子弹（50发）', price: 39, category: '枪械弹药' },
      { name: '.45 自动手枪子弹（100发）', price: 23, category: '枪械弹药' },
      { name: '10号霰弹（25发）', price: 40, category: '枪械弹药' },
      { name: '12号霰弹（25发）', price: 30, category: '枪械弹药' },
      { name: '16号霰弹（25发）', price: 26, category: '枪械弹药' },
      { name: '20号霰弹（25发）', price: 28, category: '枪械弹药' },
    ],
    '战斗装备': [
      { name: '非法消音器（手枪）', price: 1000, category: '战斗装备', priceDisplay: '$1,000+' },
      { name: '激光瞄准器', price: 300, category: '战斗装备', priceDisplay: '$300+' },
      { name: '光学瞄准镜', price: 200, category: '战斗装备', priceDisplay: '$200+' },
      { name: '手持电击器', price: 50, category: '战斗装备', priceDisplay: '$50+' },
      { name: '电击警棍', price: 65, category: '战斗装备' },
      { name: '辣椒喷雾剂', price: 16, category: '战斗装备' },
      { name: '铝指虎', price: 20, category: '战斗装备' },
      { name: '复合弩', price: 600, category: '战斗装备', priceDisplay: '$600+' },
      { name: '弩箭（12支）', price: 38, category: '战斗装备' },
      { name: '吹箭筒（带镖）', price: 35, category: '战斗装备' },
      { name: '弹药带', price: 60, category: '战斗装备' },
      { name: '双节棍', price: 25, category: '战斗装备' },
    ],
  },
};

// ============================================================
// 分类图标映射
// ============================================================
const EQUIPMENT_CATEGORY_ICONS = {
  // 1920年代分类
  '男装': '&#128084;',
  '女装': '&#128087;',
  '外出用餐': '&#127860;',
  '户外与旅行装备': '&#9978;',
  '航海': '&#9973;',
  '腕表': '&#8986;',
  '房产': '&#127969;',
  '霰弹枪': '&#128298;',
  '冲锋枪': '&#128163;',
  '机枪': '&#128163;',
  '爆炸物': '&#128165;',
  // 通用分类
  '住宿': '&#127968;',
  '医疗用品': '&#129657;',
  '调查工具': '&#128269;',
  '工具': '&#128295;',
  '文具与书籍': '&#128214;',
  '交通运输': '&#128663;',
  '通讯': '&#128222;',
  '摄影': '&#128247;',
  '弹药': '&#128162;',
  // 现代分类
  '电子器材': '&#128187;',
  '机动车': '&#128663;',
  '计算机': '&#128187;',
  '旅行': '&#9992;',
  '枪械弹药': '&#128162;',
  '战斗装备': '&#128737;',
  '自定义': '&#11088;',
  '特殊物品': '&#11088;',
};

// ============================================================
// 获取当前年代的装备数据库
// ============================================================
function getCurrentEquipmentDB() {
  let era = (typeof state !== 'undefined' && state.era) ? state.era : '1920s';
  return EQUIPMENT_DATABASE[era] || EQUIPMENT_DATABASE['1920s'];
}

// ============================================================
// 搜索建议函数 - 模糊匹配物品名称（在当前年代装备库中搜索）
// ============================================================
function searchEquipment(query) {
  if (!query || !query.trim()) return [];
  query = query.trim().toLowerCase();
  let db = getCurrentEquipmentDB();
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
// 根据信用评级获取现金和资产信息（根据年代选择对应表）
// ============================================================
function getCreditRatingInfo(creditRating) {
  let era = (typeof state !== 'undefined' && state.era) ? state.era : '1920s';
  let table = CREDIT_RATING_TABLE[era] || CREDIT_RATING_TABLE['1920s'];
  for (let row of table) {
    if (creditRating >= row.min && creditRating <= row.max) {
      return row;
    }
  }
  // 默认返回最低档
  return table[0];
}

// ============================================================
// 获取当前年代的所有分类名称
// ============================================================
function getEquipmentCategories() {
  return Object.keys(getCurrentEquipmentDB());
}
