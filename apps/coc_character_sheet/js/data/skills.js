// 技能数据定义 - Skill Data
// 从 coc_character_creator.html 提取

// ============================================================
// 年代专属技能标记
// ============================================================
const MODERN_ONLY_SKILLS = ['电子学', '计算机使用'];
// 1920年代不可用的技能（在现代中可用）
const MODERN_SKILLS = ['电子学', '计算机使用'];

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
    '潜行': 20, '游泳': 20, '攀爬': 20,
    '母语': 'EDU', '侦查': 25, '追踪': 10,
    '人类学': 1, '估价': 5, '神秘学': 5, '话术': 5, '乔装': 5,
    '取悦': 15, '法律': 5, '精神分析': 1,
    '计算机使用': 5,
    // 非常规技能（不会在标准角色卡上出现，但可通过自定义职业或"任意技能"选择）
    '催眠': 1, '潜水': 1, '爆破': 1, '炮术': 1, '读唇': 1
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
    '沙漠': 10, '极地': 10, '海洋': 10
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
  '艺术和手艺': { category: 'artCraft', prefix: '艺术和手艺', freeForm: true },
  '语言':     { category: null,        prefix: '语言',     freeForm: true  },
  '生存':     { category: null,        prefix: '生存',     freeForm: true  },
  '操纵':     { category: null,        prefix: '操纵',     freeForm: true  },
  '学识':     { category: null,        prefix: '学识',     freeForm: true  }
};

// 自由输入型专攻的预设选项（用于 UI 快捷选择）
const FREEFORM_PRESETS = {
  '语言': ['英语', '法语', '德语', '西班牙语', '俄语', '日语', '拉丁语', '阿拉伯语', '古希腊语', '中文'],
  '生存': ['沙漠', '海洋', '极地'],
  '艺术和手艺': ['表演', '美术', '伪造文书', '摄影', '写作', '理发', '书法', '木工', '烹饪', '舞蹈', '雕刻', '粉刷', '陶艺', '吹制真空管', '耕作', '工程制图', '乐器'],
  '操纵': ['飞行器', '船舶'],
  '学识': []
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

// ============================================================
// 统一的专攻技能选择器渲染
// ============================================================

/**
 * 获取父技能的所有可选专精列表
 * 固定列表型：从 SKILLS_DATA 中获取（如格斗→格斗(斧)、格斗(斗殴)…）
 * 自由输入型：从 FREEFORM_PRESETS 获取 + 已自定义添加的
 * @param {string} parentName - 父技能名
 * @param {string[]} [customAdded] - 已自定义添加的专精（仅 freeForm 用）
 * @returns {string[]} 专精全名列表，如 ['格斗(斧)', '格斗(斗殴)', ...]
 */
function getAllSpecialtyOptions(parentName, customAdded) {
  let map = SPECIALTY_MAP[parentName];
  if (!map) return [parentName];
  if (map.freeForm) {
    let presets = (FREEFORM_PRESETS[parentName] || []).map(s => `${parentName}(${s})`);
    if (customAdded) presets = presets.concat(customAdded);
    return presets;
  }
  return Object.keys(SKILLS_DATA[map.category]).map(s => `${parentName}(${s})`);
}

/**
 * 统一渲染专攻技能选择器 HTML
 * @param {Object} opts
 * @param {string} opts.parentName - 父技能名（如"格斗"、"科学"、"语言"）
 * @param {string|null} opts.chosen - 当前已选中的专精全名（如"格斗(斗殴)"），null 表示未选
 * @param {string} opts.mode - 'fixed'（固定技能单选）或 'choice'（任选组，受名额限制）
 * @param {boolean} opts.isFull - 是否已满额（仅 mode='choice' 时有效）
 * @param {string} opts.onSelect - 选中时的 onclick JS 代码，其中 {opt} 会被替换为专精全名
 * @param {string} [opts.inputId] - 自定义输入框的 HTML id（仅 freeForm 用）
 * @param {string} [opts.onAdd] - 自定义添加时的 onclick JS 代码（仅 freeForm 用）
 * @param {string[]} [opts.extraOpts] - 额外的专精选项（如已自定义添加的专精，仅 freeForm 用）
 * @returns {string} HTML 字符串
 */
function renderSpecialtySelector(opts) {
  let { parentName, chosen, mode, isFull, onSelect, inputId, onAdd, extraOpts } = opts;
  let map = SPECIALTY_MAP[parentName];
  let isFreeForm = map && map.freeForm;
  let specialtyOpts = getSpecialtyOptions(parentName);
  // 合入额外选项（如已自定义添加的专精）
  if (extraOpts && extraOpts.length > 0) {
    let existing = new Set(specialtyOpts);
    extraOpts.forEach(o => { if (!existing.has(o)) specialtyOpts.push(o); });
  }
  let icon = isFreeForm ? '📝' : '📋';
  let hint = isFreeForm ? '选择一项或自定义输入' : '选择一项子专精';
  let btnSize = mode === 'fixed' ? 'font-size:0.75rem;padding:2px 6px;' : '';

  let html = `<div class="specialty-selector" style="margin-top:${mode === 'fixed' ? '0' : '8px'};padding:${mode === 'fixed' ? '6px' : '8px'};background:var(--card-bg);border:1px solid var(--border-color);border-radius:6px;">`;
  html += `<div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:6px;">${icon} ${parentName}（${hint}）</div>`;
  html += `<div style="display:flex;flex-wrap:wrap;gap:4px;">`;

  // 渲染专精按钮
  specialtyOpts.forEach(opt => {
    let isSel = chosen === opt;
    let isDis = false;
    if (mode === 'choice' && !isSel && isFull) isDis = true;
    let subName = getSubFromSpecialty(opt);
    let clickHandler = onSelect.replace(/\{opt\}/g, "'" + opt.replace(/'/g, "\\'") + "'");
    html += `<button class="occ-choice-btn ${isSel ? 'selected' : ''} ${isDis ? 'disabled' : ''}" 
      style="${btnSize}" onclick="${clickHandler}" title="${opt}">${subName}</button>`;
  });

  html += `</div>`;

  // freeForm 类型：添加自定义输入
  if (isFreeForm && inputId && onAdd) {
    html += `<div style="display:flex;gap:4px;align-items:center;margin-top:6px;">
      <input type="text" id="${inputId}" placeholder="自定义${parentName}名称…"
        style="flex:1;padding:4px 8px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:4px;color:var(--text-primary);font-size:0.8rem;"
        onkeydown="if(event.key==='Enter')${onAdd}">
      <button class="btn btn-secondary btn-sm" onclick="${onAdd}">✚ 添加</button>
    </div>`;
  }

  // 已选中标记
  if (chosen) {
    let subName = getSubFromSpecialty(chosen);
    html += `<div style="margin-top:4px;font-size:0.75rem;color:var(--accent);">✓ 已选：${subName}</div>`;
  }

  html += `</div>`;
  return html;
}

