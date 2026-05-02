// 工具函数 - Utility Functions
// 包含函数: roll3d6(), roll2d6plus6(), roll1d100(), roll1d10(),
//           clamp(), getEffectiveAttrs(), getEduGrowthTotal(),
//           calcDB(), calcMOV(), calcDerived(),
//           getSkillBase(), getAllSkillNames(), getDisplaySkillNames(),
//           getSelectedOccupationalSkills(), toggleOccSkillChoice(),
//           isOccupationalSkill(), expandSkillOptions()

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function roll3d6() {
  return Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
}
function roll2d6plus6() {
  return Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1 + 6;
}
function roll1d100() {
  return Math.floor(Math.random() * 100) + 1;
}
function roll1d10() {
  return Math.floor(Math.random() * 10) + 1;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function getEffectiveAttrs() {
  let a = { ...state.rawAttrs };
  if (state.ageAdjusted) {
    let ageInfo = AGE_TABLE.find(r => state.age >= r.min && state.age <= r.max);
    if (ageInfo) {
      a.EDU = clamp(a.EDU + getEduGrowthTotal(), 0, 99);
      if (ageInfo.strConDexCount > 0) {
        a[state.ageAdjustChoice] = clamp(a[state.ageAdjustChoice] + ageInfo.strConDex, 0, 99);
      }
      if (state.age >= 15 && state.age <= 19) {
        a.STR = clamp(a.STR - 5, 0, 99);
        a.SIZ = clamp(a.SIZ - 5, 0, 99);
        a.EDU = clamp(a.EDU - 5, 0, 99);
      }
      a.APP = clamp(a.APP + ageInfo.app, 0, 99);
    }
  }
  return a;
}

function getEduGrowthTotal() {
  let total = 0;
  state.eduGrowthLog.forEach(e => { total += e.gained; });
  return total;
}

function calcDB(strSiz) {
  for (let row of DB_TABLE) {
    if (strSiz >= row.min && strSiz <= row.max) return { db: row.db, build: row.build };
  }
  if (strSiz > 524) return { db: '+5D6', build: 6 };
  return { db: '-2', build: -2 };
}

function calcMOV(dex, siz, str, age) {
  let mov = 8;
  if (dex < siz && str < siz) mov = 7;
  else if (str > siz && dex > siz) mov = 9;
  let ageInfo = AGE_TABLE.find(r => age >= r.min && age <= r.max);
  if (ageInfo) mov += ageInfo.movPenalty;
  return Math.max(1, mov);
}

function calcDerived() {
  let a = getEffectiveAttrs();
  let strSiz = a.STR + a.SIZ;
  let dbInfo = calcDB(strSiz);
  state.derived = {
    HP: Math.floor((a.CON + a.SIZ) / 10),
    MP: Math.floor(a.POW / 5),
    SAN: a.POW,
    DB: dbInfo.db,
    build: dbInfo.build,
    MOV: calcMOV(a.DEX, a.SIZ, a.STR, state.age),
    dodge: Math.floor(a.DEX / 2),
    language: a.EDU
  };
}

// ============================================================
// 技能基础值
// ============================================================

function getSkillBase(skillName, attrs) {
  if (skillName === '闪避') return Math.floor(attrs.DEX / 2);
  if (skillName === '母语') return attrs.EDU;

  // 专精技能（如 "科学(天文学)"）→ 从对应分类中获取子技能基础值
  if (isSpecialtySkill(skillName)) {
    let parent = getParentFromSpecialty(skillName);
    let sub = getSubFromSpecialty(skillName);
    let map = SPECIALTY_MAP[parent];
    if (map && map.category && SKILLS_DATA[map.category]) {
      let val = SKILLS_DATA[map.category][sub];
      if (val !== undefined) return val;
      // 子技能不在预设列表中（自定义输入），走 freeForm 默认值逻辑
    }
    // 自由输入型专精（如 "语言(法语)"、"生存(沙漠)"、"艺术和手艺(捏泥人)"）
    if (map && map.freeForm) {
      // 生存专精基础值为 10%，艺术和手艺专精基础值为 5%，其余自由输入型为 1%
      if (parent === '生存') return 10;
      if (parent === '艺术和手艺') return 5;
      return 1;
    }
    return 0;
  }

  // Check regular skills
  let v = SKILLS_DATA.regular[skillName];
  if (v !== undefined) {
    if (typeof v === 'object') return v.base;
    if (typeof v === 'string') {
      if (v === 'DEX/2') return Math.floor(attrs.DEX / 2);
      if (v === 'EDU') return attrs.EDU;
    }
    return v;
  }
  // Check combat
  if (SKILLS_DATA.combat[skillName] !== undefined) return SKILLS_DATA.combat[skillName];
  // Check firearms
  if (SKILLS_DATA.firearms[skillName] !== undefined) return SKILLS_DATA.firearms[skillName];
  // Check science
  if (SKILLS_DATA.science[skillName] !== undefined) return SKILLS_DATA.science[skillName];
  // Check art/craft
  if (SKILLS_DATA.artCraft[skillName] !== undefined) return SKILLS_DATA.artCraft[skillName];
  // Check survival
  if (SKILLS_DATA.survival[skillName] !== undefined) return SKILLS_DATA.survival[skillName];
  // BUG-033: Check unconventional
  if (SKILLS_DATA.unconventional && SKILLS_DATA.unconventional[skillName] !== undefined)
    return SKILLS_DATA.unconventional[skillName];
  return 0;
}

// ============================================================
// 技能名称列表
// ============================================================

// 获取所有可用于分配点数的技能名（原始数据名，不含父技能）
function getAllSkillNames() {
  let names = [];
  for (let k in SKILLS_DATA.regular) names.push(k);
  for (let k in SKILLS_DATA.combat) names.push(k);
  for (let k in SKILLS_DATA.firearms) names.push(k);
  for (let k in SKILLS_DATA.science) names.push(k);
  for (let k in SKILLS_DATA.artCraft) names.push(k);
  for (let k in SKILLS_DATA.survival) names.push(k);
  // BUG-033: 非常规技能
  if (SKILLS_DATA.unconventional) {
    for (let k in SKILLS_DATA.unconventional) names.push(k);
  }
  return names;
}

// 获取用于显示的技能分类列表（用于第5步和第8步的渲染）
// 返回格式: [{ title, skills: ['格斗(斧)', '格斗(斗殴)', ...] }, ...]
// 根据当前年代过滤掉不可用的技能
function getDisplaySkillCategories() {
  let isModern = state.era === '现代';
  let filterSkill = (name) => {
    // 1920年代过滤掉现代专属技能
    if (!isModern && MODERN_ONLY_SKILLS.includes(name)) return false;
    // BUG-001: 克苏鲁神话不在技能分配界面显示
    if (name === '克苏鲁神话') return false;
    return true;
  };

  // 收集玩家已选/已投入的自由输入型专精（按父技能分组）
  let customByParent = {}; // { '语言': ['语言(法语)', '语言(拉丁语)'], ... }
  if (state.occupation) {
    let allSelected = getSelectedOccupationalSkills();
    allSelected.forEach(s => {
      if (isSpecialtySkill(s)) {
        let parent = getParentFromSpecialty(s);
        if (parent && SPECIALTY_MAP[parent] && SPECIALTY_MAP[parent].freeForm) {
          if (!customByParent[parent]) customByParent[parent] = [];
          if (!customByParent[parent].includes(s)) customByParent[parent].push(s);
        }
      }
    });
    for (let sk in state.skillPoints) {
      let pts = state.skillPoints[sk];
      if ((pts.occ > 0 || pts.int > 0) && isSpecialtySkill(sk)) {
        let parent = getParentFromSpecialty(sk);
        if (parent && SPECIALTY_MAP[parent] && SPECIALTY_MAP[parent].freeForm) {
          if (!customByParent[parent]) customByParent[parent] = [];
          if (!customByParent[parent].includes(sk)) customByParent[parent].push(sk);
        }
      }
    }
  }

  // 合并预设 + 自定义，生成各 freeForm 父技能的分类
  function buildFreeFormCategory(title, parentName) {
    let presets = (FREEFORM_PRESETS[parentName] || []).map(s => `${parentName}(${s})`);
    let customs = customByParent[parentName] || [];
    let all = [];
    let existing = new Set();
    presets.forEach(s => { if (!existing.has(s)) { all.push(s); existing.add(s); } });
    customs.forEach(s => { if (!existing.has(s)) { all.push(s); existing.add(s); } });
    return { title, skills: all.filter(filterSkill) };
  }

  // 收集所有标准技能名（用于识别自定义技能）
  let standardSkills = new Set();
  let standardCats = [
    { title: '常规技能', skills: Object.keys(SKILLS_DATA.regular).filter(filterSkill) },
    { title: '格斗专攻', parentName: '格斗', skills: Object.keys(SKILLS_DATA.combat).map(s => '格斗(' + s + ')').filter(filterSkill) },
    { title: '射击专攻', parentName: '射击', skills: Object.keys(SKILLS_DATA.firearms).map(s => '射击(' + s + ')').filter(filterSkill) },
    { title: '科学专攻', parentName: '科学', skills: Object.keys(SKILLS_DATA.science).map(s => '科学(' + s + ')').filter(filterSkill) },
    Object.assign(buildFreeFormCategory('艺术和手艺专攻', '艺术和手艺'), { parentName: '艺术和手艺' }),
    Object.assign(buildFreeFormCategory('语言专攻', '语言'), { parentName: '语言' }),
    Object.assign(buildFreeFormCategory('生存专攻', '生存'), { parentName: '生存' }),
    Object.assign(buildFreeFormCategory('操纵专攻', '操纵'), { parentName: '操纵' }),
    Object.assign(buildFreeFormCategory('学识专攻', '学识'), { parentName: '学识' }),
    // BUG-033: 非常规技能独立分类
    { title: '非常规技能', skills: Object.keys(SKILLS_DATA.unconventional || {}).filter(filterSkill) },
  ];
  standardCats.forEach(cat => cat.skills.forEach(s => standardSkills.add(s)));

  // 收集自定义技能（在 selectedOccSkills 或 skillPoints 中但不在标准分类中的）
  let customSkills = [];
  if (state.occupation) {
    let seen = new Set();
    let allSelected = getSelectedOccupationalSkills();
    allSelected.forEach(s => {
      if (!standardSkills.has(s) && !seen.has(s)) { customSkills.push(s); seen.add(s); }
    });
    for (let sk in state.skillPoints) {
      let pts = state.skillPoints[sk];
      if ((pts.occ > 0 || pts.int > 0) && !standardSkills.has(sk) && !seen.has(sk)) {
        customSkills.push(sk); seen.add(sk);
      }
    }
  }

  let result = [...standardCats];
  if (customSkills.length > 0) {
    result.push({ title: '自定义技能', skills: customSkills });
  }
  return result;
}

// ============================================================
// 职业技能相关
// ============================================================

function getSelectedOccupationalSkills() {
  if (!state.occupation) return [];
  // 从 OCCUPATIONS 数组中重新查找职业对象（localStorage 序列化会丢失函数）
  let occObj = OCCUPATIONS.find(o => o.name === state.occupation.name) || state.occupation;
  let result = [];
  occObj.fixedSkills.forEach(s => {
    if (isParentSkill(s) && state.fixedSpecialtyChoices[s]) {
      // 纯父技能已被选择为具体专精
      result.push(state.fixedSpecialtyChoices[s]);
    } else if (isParentSkill(s)) {
      // 纯父技能尚未选择 → 跳过
    } else {
      // 普通技能或已指定子类型（如 "科学(工程学)"、"艺术和手艺(工程制图)"）→ 直接使用
      result.push(s);
    }
  });
  return [...result, ...state.selectedOccSkills];
}

// 计算某个 choiceGroup 中已选技能的数量（包括自定义技能）
function getGroupSelectedCount(group, groupIdx) {
  let expandedOpts = expandSkillOptions(group.options);
  // 也包含所有父技能的已选专精
  group.options.forEach(opt => {
    if (isParentSkill(opt) && SPECIALTY_MAP[opt]) {
      state.selectedOccSkills.forEach(s => {
        if (s.startsWith(opt + '(')) expandedOpts.push(s);
      });
    }
  });
  // 也包含该组中通过自定义输入添加的技能（需匹配 groupIdx）
  if (state.customSkillGroups && groupIdx !== undefined) {
    for (let skill in state.customSkillGroups) {
      if (state.customSkillGroups[skill] === groupIdx && state.selectedOccSkills.includes(skill)) {
        expandedOpts.push(skill);
      }
    }
  }
  return state.selectedOccSkills.filter(s => expandedOpts.includes(s)).length;
}

// 将技能选项列表中的父技能展开为专精选项
// 例如: ['科学', '会计'] → ['科学(天文学)', '科学(生物学)', ..., '会计']
function expandSkillOptions(options) {
  let expanded = [];
  options.forEach(opt => {
    if (isParentSkill(opt)) {
      let specialtyOpts = getSpecialtyOptions(opt);
      if (specialtyOpts.length > 0) {
        expanded = expanded.concat(specialtyOpts);
      }
      // freeForm 类型的父技能（如"语言"、"生存"）不在此展开，由 UI 动态处理
    } else {
      expanded.push(opt);
    }
  });
  return expanded;
}

function toggleOccSkillChoice(skillName) {
  if (!state.occupation) return;
  // 年代校验：1920年代不允许选择现代专属技能
  if (state.era !== '现代' && MODERN_ONLY_SKILLS.includes(skillName)) return;
  let occ = state.occupation;
  let idx = state.selectedOccSkills.indexOf(skillName);
  if (idx >= 0) {
    // Deselect
    state.selectedOccSkills.splice(idx, 1);
  } else {
    // Select - find which choiceGroup this skill belongs to
    let foundGroup = null;
    let foundGroupIdx = -1;
    for (let i = 0; i < occ.choiceGroups.length; i++) {
      let group = occ.choiceGroups[i];
      // 展开后的选项中查找
      let expandedOpts = expandSkillOptions(group.options);
      if (expandedOpts.includes(skillName)) {
        foundGroup = group;
        foundGroupIdx = i;
        break;
      }
      // 也检查原始选项（兼容非父技能）
      if (group.options.includes(skillName)) {
        foundGroup = group;
        foundGroupIdx = i;
        break;
      }
      // 专精技能（如 "格斗(斗殴)"）→ 检查父技能是否在 options 中
      if (isSpecialtySkill(skillName)) {
        let parent = getParentFromSpecialty(skillName);
        if (parent && SPECIALTY_MAP[parent]) {
          if (group.options.includes(parent)) {
            foundGroup = group;
            foundGroupIdx = i;
            break;
          }
        }
      }
    }
    if (!foundGroup) return;
    // Count how many from this group are already selected (including custom skills)
    let groupSelected = getGroupSelectedCount(foundGroup, foundGroupIdx);
    if (groupSelected >= foundGroup.count) return; // Already at max
    state.selectedOccSkills.push(skillName);
  }
  saveState();
  renderStep();
}

function isOccupationalSkill(skillName) {
  if (!state.occupation) return false;
  let selected = getSelectedOccupationalSkills();
  return selected.some(s => {
    // 精确匹配
    if (s === skillName) return true;

    // 专精技能匹配（如 "科学(天文学)" 匹配 "科学"）
    if (isSpecialtySkill(skillName)) {
      let parent = getParentFromSpecialty(skillName);
      // 如果职业列表中有对应的父技能，则该专精属于职业技能
      if (s === parent) return true;
      // 如果职业列表中有完全相同的专精名
      if (s === skillName) return true;
    }

    // 反向：职业列表中的专精匹配当前技能
    if (isSpecialtySkill(s)) {
      let parent = getParentFromSpecialty(s);
      if (skillName === parent) return true;
      if (skillName === s) return true;
    }

    // Handle "格斗(斗殴)" pattern - combat/firearms already in specialty format
    if (s.startsWith('格斗(') || s.startsWith('射击(')) {
      let inner = s.match(/\((.+)\)/);
      if (inner) {
        return skillName === inner[1] || skillName === s;
      }
    }
    if (s.startsWith('艺术和手艺(')) {
      let inner = s.match(/\((.+)\)/);
      if (inner) {
        return skillName === '艺术和手艺' || skillName === s || skillName === inner[1];
      }
    }
    if (s.startsWith('科学(')) {
      let inner = s.match(/\((.+)\)/);
      if (inner) {
        return skillName === '科学' || skillName === s || skillName === inner[1];
      }
    }
    if (s.startsWith('生存(')) {
      let inner = s.match(/\((.+)\)/);
      if (inner) {
        return skillName === '生存' || skillName === s || skillName === inner[1];
      }
    }
    if (s.startsWith('语言(')) {
      let inner = s.match(/\((.+)\)/);
      if (inner) {
        return skillName === '语言' || skillName === s || skillName === inner[1];
      }
    }
    if (s.startsWith('修理(')) {
      return skillName === s || skillName === '机械维修' || skillName === '电气维修';
    }
    if (s.startsWith('自然科学')) {
      return skillName === '博物学' || skillName === '自然科学';
    }
    if (s.startsWith('计算机使用')) {
      return skillName === '计算机使用' || skillName === '电子学';
    }
    if (s.startsWith('隐藏')) {
      return skillName === '隐藏' || skillName === '潜行';
    }
    if (s.startsWith('攀爬')) {
      return skillName === '攀爬' || skillName === '跳跃';
    }
    if (s.startsWith('战术')) {
      return skillName === '战术' || skillName === '侦查';
    }
    if (s.startsWith('摄影')) {
      return skillName === '摄影' || skillName === '艺术和手艺';
    }
    return false;
  });
}
