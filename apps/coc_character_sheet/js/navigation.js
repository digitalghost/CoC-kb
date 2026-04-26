// 导航和导出 - Navigation & Export
// 包含函数:
//   - nextStep()           下一步（含各步骤验证逻辑）
//   - prevStep()           上一步
//   - goToStep(step)       跳转到指定步骤（仅允许跳到已完成或当前步骤）
//   - resetAll()           重置所有角色数据
//   - exportCharacter()    导出角色卡为压缩 JSON 文件
//   - compressState(st)    将 state 压缩为紧凑格式
//   - decompressState(d)   将紧凑格式还原为 state

// ============================================================
// 状态压缩/解压 - CoC Character State Codec
// 版本 1: 属性键映射 + 布尔位掩码 + 技能点压缩 + Base64
// ============================================================

const ATTR_KEYS = ['STR','CON','SIZ','DEX','APP','INT','POW','EDU'];
const ATTR_IDX = { STR:0, CON:1, SIZ:2, DEX:3, APP:4, INT:5, POW:6, EDU:7 };

function compressState(st) {
  // 布尔位掩码: bit0=attrsGenerated, bit1=ageAdjusted, bit2=completed
  let flags = 0;
  if (st.attrsGenerated) flags |= 1;
  if (st.ageAdjusted)   flags |= 2;
  if (st.completed)     flags |= 4;

  // 属性数组: [STR, CON, SIZ, DEX, APP, INT, POW, EDU]（原始值）
  let attrs = ATTR_KEYS.map(k => st.rawAttrs[k] || 0);

  // 有效属性数组: 经过年龄调整后的实际值（追踪器需要此值来正确显示）
  let effectiveAttrs = ATTR_KEYS.map(k => {
    // 尝试从 getEffectiveAttrs 获取，如果不可用则回退到 rawAttrs
    try {
      let eff = getEffectiveAttrs();
      return eff[k] || st.rawAttrs[k] || 0;
    } catch(e) {
      return st.rawAttrs[k] || 0;
    }
  });

  // 衍生属性: [HP, MP, SAN, DB, build, MOV, dodge, language]
  let d = st.derived;
  let derived = [d.HP, d.MP, d.SAN, d.DB, d.build, d.MOV, d.dodge, d.language];

  // 技能点: { skillName: "occ,int" } → 只保留有值的
  let skills = {};
  for (let k in st.skillPoints) {
    let p = st.skillPoints[k];
    if (p.occ > 0 || p.int > 0) skills[k] = p.occ + ',' + p.int;
  }

  // 背景故事: [{c: category, t: content, k: isKey}]
  let bg = st.background.map(b => ({
    c: b.category,
    t: b.content,
    k: b.isKey ? 1 : 0
  }));

  // 同伴: [{n: charName, p: playerName}]
  let comp = st.companions.map(c => ({ n: c.charName, p: c.playerName }));

  // 装备: [{n: name, t: type, r: price, d: detail}]
  let equip = st.equipment.map(e => ({ n: e.name, t: e.type, r: e.price, d: e.detail || '' }));

  // 武器: 完整保留
  let wpns = st.weapons || [];

  // 职业: 预设职业只保留名称（导入时从 OCCUPATIONS 数组还原），自定义职业保留完整对象
  let occ = null;
  let occCustom = null;
  if (st.occupation) {
    occ = st.occupation.name;
    if (st.occupation.custom) {
      occCustom = {
        name: st.occupation.name,
        eras: st.occupation.eras || [st.era],
        creditRating: st.occupation.creditRating,
        skillPoints: st.occupation.skillPoints,
        fixedSkills: st.occupation.fixedSkills || ['信用评级'],
        choiceGroups: st.occupation.choiceGroups || [],
        custom: true
      };
    }
  }

  // 构建紧凑对象
  let compact = {
    v: 1,
    f: flags,
    s: {  // step 1
      n: st.name,
      p: st.playerName || 'COC-PL',
      r: st.residence || '',
      h: st.hometown || '',
      a: st.age,
      g: st.gender,
      e: st.era,
      av: st.avatar || ''
    },
    at: attrs,       // rawAttrs（原始掷骰值）
    ea: effectiveAttrs, // effectiveAttrs（年龄调整后的有效值）
    l: st.luck,      // luck
    ac: st.ageAdjustChoice,  // ageAdjustChoice
    el: st.eduGrowthLog || [],  // eduGrowthLog
    o: occ,           // occupation name
    oc: occCustom,    // custom occupation full object (null for preset)
    cr: st.creditRating,
    os: st.selectedOccSkills || [],
    fs: st.fixedSpecialtyChoices || {},
    // 展开后的完整固定技能名称列表（追踪器用来标记"职"）
    ofsl: (function() {
      if (!st.occupation) return [];
      let occObj = OCCUPATIONS.find(o => o.name === st.occupation.name) || st.occupation;
      let list = [];
      (occObj.fixedSkills || []).forEach(function(s) {
        if (typeof isParentSkill === 'function' && isParentSkill(s) && st.fixedSpecialtyChoices && st.fixedSpecialtyChoices[s]) {
          list.push(st.fixedSpecialtyChoices[s]);
        } else if (typeof isParentSkill === 'function' && isParentSkill(s)) {
          // 纯父技能尚未选择专精 → 跳过
        } else {
          list.push(s);
        }
      });
      return list;
    })(),
    cg: st.customSkillGroups || {},
    cf: st.customOccForm || { name:'', creditRatingMin:0, creditRatingMax:99, occupationalPoints:0, selectedSkills:[] },
    op: st.occupationalPoints,
    ip: st.interestPoints,
    ou: st.occupationalUsed,
    iu: st.interestUsed,
    sk: skills,       // skillPoints (compressed)
    dv: derived,      // derived
    bg: bg,           // background
    kc: st.keyConnection,
    cp: comp,         // companions
    eq: equip,        // equipment
    wp: wpns,         // weapons
    sc: st.spendingCash
  };

  return compact;
}

function decompressState(d) {
  if (!d || d.v !== 1) return null;

  // 还原布尔位掩码
  let flags = d.f || 0;

  // 还原属性
  let rawAttrs = {};
  ATTR_KEYS.forEach((k, i) => { rawAttrs[k] = d.at[i] || 0; });

  // 还原有效属性（年龄调整后的值），如果没有则回退到 rawAttrs
  let effectiveAttrsArr = d.ea || d.at || [];
  let effectiveAttrs = {};
  ATTR_KEYS.forEach((k, i) => { effectiveAttrs[k] = effectiveAttrsArr[i] || rawAttrs[k] || 0; });

  // 还原技能点
  let skillPoints = {};
  if (d.sk) {
    for (let k in d.sk) {
      let parts = String(d.sk[k]).split(',');
      skillPoints[k] = { occ: parseInt(parts[0]) || 0, int: parseInt(parts[1]) || 0 };
    }
  }

  // 还原背景故事
  let background = (d.bg || []).map(b => ({
    category: b.c,
    content: b.t,
    isKey: !!b.k
  }));

  // 还原同伴
  let companions = (d.cp || []).map(c => ({
    charName: c.n || '',
    playerName: c.p || ''
  }));

  // 还原装备
  let equipment = (d.eq || []).map(e => ({
    name: e.n,
    type: e.t,
    price: e.r || 0,
    detail: e.d || ''
  }));

  // 还原职业对象（从 OCCUPATIONS 数组查找）
  let occupation = null;
  if (d.o) {
    // 优先还原自定义职业（如果有完整数据）
    if (d.oc && d.oc.custom) {
      occupation = {
        ...d.oc,
        getPoints: function(attrs) {
          let pts = parseInt(this.skillPoints) || 0;
          return pts;
        }
      };
    } else {
      occupation = OCCUPATIONS.find(o => o.name === d.o) || { name: d.o };
    }
  }

  // 还原衍生属性
  let dv = d.dv || [0,0,0,'0',0,9,0,0];
  let derived = { HP: dv[0], MP: dv[1], SAN: dv[2], DB: dv[3], build: dv[4], MOV: dv[5], dodge: dv[6], language: dv[7] };

  return {
    currentStep: 7,
    name: d.s.n || '',
    playerName: d.s.p || 'COC-PL',
    residence: d.s.r || '',
    hometown: d.s.h || '',
    age: d.s.a || 25,
    gender: d.s.g || '男',
    era: d.s.e || '1920s',
    avatar: d.s.av || '',
    rawAttrs,
    effectiveAttrs,
    luck: d.l || 0,
    attrsGenerated: !!(flags & 1),
    ageAdjusted: !!(flags & 2),
    ageAdjustChoice: d.ac || 'STR',
    eduGrowthLog: d.el || [],
    occupation,
    creditRating: d.cr || 0,
    selectedOccSkills: d.os || [],
    fixedSpecialtyChoices: d.fs || {},
    customSkillGroups: d.cg || {},
    customOccForm: d.cf || { name:'', creditRatingMin:0, creditRatingMax:99, occupationalPoints:0, selectedSkills:[] },
    occupationalPoints: d.op || 0,
    interestPoints: d.ip || 0,
    occupationalUsed: d.ou || 0,
    interestUsed: d.iu || 0,
    skillPoints,
    derived,
    background,
    keyConnection: d.kc !== undefined ? d.kc : -1,
    companions,
    equipment,
    weapons: d.wp || [
      { name: '徒手（拳打脚踢）', skill: '格斗(斗殴)', damage: '1D3+DB', armorPiercing: false, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: null, priceModern: null, era: '默认', category: '常规武器' }
    ],
    spendingCash: d.sc || 0,
    completed: !!(flags & 4)
  };
}

function nextStep() {
  // Validation
  if (state.currentStep === 0) {
    if (!state.name.trim()) {
      notify('请输入调查员姓名', 'error');
      return;
    }
  }
  if (state.currentStep === 1) {
    let allZero = Object.values(state.rawAttrs).every(v => v === 0);
    if (allZero) {
      notify('请先生成或输入属性值', 'error');
      return;
    }
  }
  if (state.currentStep === 2 && !state.ageAdjusted) {
    notify('请先应用年龄调整', 'error');
    return;
  }
  if (state.currentStep === 3 && !state.occupation) {
    notify('请选择一个职业', 'error');
    return;
  }
  if (state.currentStep === 3 && state.occupation) {
    // 从 OCCUPATIONS 数组中重新查找职业对象（localStorage 序列化会丢失函数）
    let occObj = OCCUPATIONS.find(o => o.name === state.occupation.name) || state.occupation;

    // Check all fixedSkills pure parent skills have specialty selected
    for (let s of occObj.fixedSkills) {
      if (isParentSkill(s) && !state.fixedSpecialtyChoices[s]) {
        notify('请完成所有固定技能的专攻选择', 'error');
        return;
      }
    }

    // Check all choice groups are satisfied
    let allComplete = true;
    for (let i = 0; i < occObj.choiceGroups.length; i++) {
      let group = occObj.choiceGroups[i];
      let groupSelected = getGroupSelectedCount(group, i);
      if (groupSelected < group.count) {
        allComplete = false;
        break;
      }
    }
    if (!allComplete) {
      notify('请完成所有职业技能组的选择', 'error');
      return;
    }
  }
  if (state.currentStep === 4) {
    let occRemain = state.occupationalPoints - state.occupationalUsed;
    let intRemain = state.interestPoints - state.interestUsed;
    if (occRemain < 0 || intRemain < 0) {
      notify('技能点超支！请调整分配。', 'error');
      return;
    }
  }

  if (state.currentStep < 7) {
    state.currentStep++;
    saveState();
    renderStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function prevStep() {
  if (state.currentStep > 0) {
    state.currentStep--;
    saveState();
    renderStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function goToStep(step) {
  // Allow going to completed steps or current step
  if (step <= state.currentStep) {
    state.currentStep = step;
    saveState();
    renderStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function resetAll() {
  if (confirm('确定要重新创建角色吗？当前数据将被清除。')) {
    localStorage.removeItem('coc_char_state');
    state = {
      currentStep: 0,
      name: '', playerName: 'COC-PL', residence: '', hometown: '',
      age: 25, gender: '男', avatar: '', era: '1920s',
      rawAttrs: { STR: 0, CON: 0, SIZ: 0, DEX: 0, APP: 0, INT: 0, POW: 0, EDU: 0 },
      luck: 0,
      attrsGenerated: false,
      ageAdjusted: false, ageAdjustChoice: 'STR', eduGrowthLog: [],
      occupation: null, creditRating: 0, selectedOccSkills: [],
      fixedSpecialtyChoices: {},
      customSkillGroups: {},
      customOccForm: { name: '', creditRatingMin: 0, creditRatingMax: 99, occupationalPoints: 0, selectedSkills: [] },
      occupationalPoints: 0, interestPoints: 0, occupationalUsed: 0, interestUsed: 0,
      skillPoints: {},
      derived: { HP: 0, MP: 0, SAN: 0, DB: '0', build: 0, MOV: 9, dodge: 0, language: 0 },
      background: [],
      keyConnection: -1,
      companions: [],
      equipment: [],
      weapons: [
        { name: '徒手（拳打脚踢）', skill: '格斗(斗殴)', damage: '1D3+DB', armorPiercing: false, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: null, priceModern: null, era: '默认', category: '常规武器' },
      ],
      spendingCash: 0,
      completed: false
    };
    renderStep();
    notify('角色数据已重置', 'info');
  }
}

function exportCharacter() {
  calcDerived();

  // 压缩完整 state 数据
  let compact = compressState(state);
  let jsonStr = JSON.stringify(compact);

  // Base64 编码，增加不可读性
  let encoded = btoa(unescape(encodeURIComponent(jsonStr)));

  // 构建导出文件内容: 轻量头部 + 编码数据
  let exportData = {
    _format: 'coc7-char-v1',
    _app: 'coc-character-sheet',
    _encoded: encoded
  };

  let blob = new Blob([JSON.stringify(exportData)], { type: 'application/json;charset=utf-8' });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = `${state.name || '调查员'}_角色卡.coc7`;
  a.click();
  URL.revokeObjectURL(url);
  notify('角色卡已导出（.coc7 格式）', 'success');
}
