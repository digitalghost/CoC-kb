// 步骤1-4渲染 - Steps 1-4 Rendering
// 包含函数:
//   - generateRandomName()         生成随机调查员名字（1920年代风格）
//   - renderStep1(container)      步骤1：基本信息表单（姓名、性别、年龄、时代）
//   - renderStep2(container)      步骤2：属性生成（属性网格、掷骰按钮、幸运值）
//   - updateAttr(key, val)        更新属性值（STR/CON/SIZ/DEX/APP/INT/POW/EDU）
//   - renderStep3(container)      步骤3：年龄调整（显示调整信息、应用/重置调整）
//   - applyAgeAdjustment()        执行年龄调整（EDU成长、幸运值、属性减值）
//   - resetAgeAdjustment()        重置年龄调整
//   - renderStep4(container)      步骤4：职业选择（职业列表、技能组选择、信用评级）
//   - selectOccupation(idx)       选择职业并初始化技能点
// 注意: rollAllAttributes 在 dice-physics.js 中（与骰子动画紧密相关）

// ----- Random Name Generator (1920s New England style, Chinese transliteration) -----
function generateRandomName() {
  const firstNames = [
    '亨利', '查尔斯', '爱德华', '乔治', '詹姆斯', '威廉', '罗伯特', '托马斯',
    '亚瑟', '弗朗西斯', '阿尔伯特', '弗雷德里克', '赫伯特', '沃尔特', '哈罗德', '塞缪尔',
    '霍华德', '理查德', '欧内斯特', '雷蒙德', '拉尔夫', '埃德温', '克拉伦斯', '珀西',
    '阿格尼丝', '爱丽丝', '克拉拉', '多萝西', '埃莉诺', '伊丽莎白', '弗洛伦丝', '格蕾丝',
    '海伦', '艾琳', '玛格丽特', '玛莎', '米尔德丽德', '罗丝', '露丝', '维奥莱特',
    '凯瑟琳', '莉莲', '伊迪丝', '碧翠丝', '康斯坦丝', '哈丽雅特', '约瑟芬'
  ];
  const lastNames = [
    '哈特韦尔', '布莱克伍德', '马洛', '惠特莫尔', '卡特', '辛克莱', '阿什沃思',
    '温斯洛', '哈格罗夫', '斯特林', '彭伯顿', '桑顿', '克劳福德', '莫里森',
    '黑斯廷斯', '普雷斯科特', '兰福德', '奥尔德里奇', '蒙塔古', '惠特菲尔德', '万斯',
    '布拉德利', '霍洛韦', '克雷文', '马什', '吉尔曼', '德比', '皮克曼',
    '阿米蒂奇', '赖斯', '摩根', '沃伦', '道格拉斯', '格雷', '查普曼', '弗莱彻',
    '赖特', '亨特', '考特', '弗林德斯', '霍布豪斯', '怀亚特', '斯通'
  ];
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  return pick(firstNames) + ' ' + pick(lastNames);
}

// ----- Step 1: Basic Info -----
function renderStep1(container) {
  // 如果没有名字，自动生成一个
  if (!state.name) {
    state.name = generateRandomName();
    saveState();
  }
  container.innerHTML = `
    <div class="card">
      <div class="card-title"><span class="icon">&#9788;</span> 基本信息</div>
      <p class="section-desc">填写调查员的基本个人信息。这些信息将显示在角色卡上。</p>
      <div class="form-row">
        <div class="form-group">
          <label>调查员姓名</label>
          <div style="display:flex;gap:6px;">
            <input type="text" id="charName" value="${state.name}" placeholder="输入姓名..." style="flex:1;" oninput="state.name=this.value;saveState()">
            <button class="btn btn-secondary btn-sm" onclick="document.getElementById('charName').value=generateRandomName();state.name=document.getElementById('charName').value;saveState()" title="随机生成新名字">🎲</button>
          </div>
        </div>
        <div class="form-group">
          <label>性别</label>
          <select id="charGender" onchange="state.gender=this.value;saveState()">
            <option value="男" ${state.gender==='男'?'selected':''}>男</option>
            <option value="女" ${state.gender==='女'?'selected':''}>女</option>
            <option value="其他" ${state.gender==='其他'?'selected':''}>其他</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>年龄</label>
          <input type="number" id="charAge" value="${state.age}" min="15" max="89" oninput="state.age=clamp(parseInt(this.value)||15,15,89);saveState()">
        </div>
        <div class="form-group">
          <label>时代</label>
          <select id="charEra" onchange="onEraChange(this.value)">
            <option value="1920s" ${state.era==='1920s'?'selected':''}>1920年代（经典洛式）</option>
            <option value="现代" ${state.era==='现代'?'selected':''}>现代</option>
          </select>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">
            ${state.era==='1920s' ? '📖 禁酒令、爵士乐、黑帮崛起的黄金年代' : '💻 科技发达的现代世界，拥有计算机与互联网'}
          </div>
        </div>
      </div>
    </div>
  `;
}

function updateAttr(key, val) {
  state.rawAttrs[key] = clamp(parseInt(val) || 0, 0, 99);
  saveState();
  renderStep();
}

// ----- Era Change Handler -----
// 切换年代时重置后续步骤数据，防止数据不一致
function onEraChange(newEra) {
  if (state.era === newEra) return;
  let oldEra = state.era;
  state.era = newEra;
  // 重置职业相关数据
  state.occupation = null;
  state.creditRating = 0;
  state.selectedOccSkills = [];
  state.fixedSpecialtyChoices = {};
  state.customSkillGroups = {};
  state.customOccForm = { name: '', creditRatingMin: 0, creditRatingMax: 99, occupationalPoints: 0, selectedSkills: [] };
  state.occupationalPoints = 0;
  state.interestPoints = 0;
  state.occupationalUsed = 0;
  state.interestUsed = 0;
  state.skillPoints = {};
  // 重置装备数据
  state.equipment = [];
  state.spendingCash = 0;
  saveState();
  notify(`时代已切换为「${newEra === '1920s' ? '1920年代' : '现代'}」，后续步骤数据已重置`, 'info');
  renderStep();
}

// ----- Step 2: Attributes -----
function renderStep2(container) {
  let attrs = state.rawAttrs;
  let attrList = ATTR_LIST;
  let generated = state.attrsGenerated;
  let displayVal = (v) => generated ? v : '-';

  let html = `
    <div class="card">
      <div class="card-title"><span class="icon">&#9861;</span> 属性生成</div>
      <p class="section-desc">点击"掷骰"按钮自动生成属性，或直接在数值框中手动输入。</p>
      <div style="text-align:center;margin-bottom:16px;">
        <button class="btn btn-gold" id="btnRollAll" onclick="rollAllAttributes()">&#9861; 掷骰生成全部属性</button>
      </div>
      <div class="attr-grid">
  `;
  attrList.forEach(a => {
    let v = attrs[a.key];
    html += `
      <div class="attr-item" id="attr_${a.key}">
        <div class="attr-name">${a.name}</div>
        <div class="check-cell">
          <div class="ck-main">${generated ? v : '-'}</div>
          <div class="ck-half">${generated ? Math.floor(v/2) : '-'}</div>
          <div class="ck-fifth">${generated ? Math.floor(v/5) : '-'}</div>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  html += `
      <div style="text-align:center;margin-top:16px;">
        <div class="attr-item" id="attr_LUCK" style="display:inline-block;">
          <div class="attr-name">幸运值 LUCK</div>
          <div class="check-cell">
            <div class="ck-main">${generated ? state.luck : '-'}</div>
            <div class="ck-half">${generated ? Math.floor(state.luck/2) : '-'}</div>
            <div class="ck-fifth">${generated ? Math.floor(state.luck/5) : '-'}</div>
          </div>
        </div>
      </div>
    </div>
  `;
  container.innerHTML = html;
}

// ----- Step 3: Age Adjustment -----
function renderStep3(container) {
  let ageInfo = AGE_TABLE.find(r => state.age >= r.min && state.age <= r.max);
  if (!ageInfo) {
    container.innerHTML = '<div class="card"><p>年龄超出范围（15-89）。</p></div>';
    return;
  }

  let attrs = state.rawAttrs;
  let html = `
    <div class="card">
      <div class="card-title"><span class="icon">&#9200;</span> 年龄调整</div>
      <p class="section-desc">根据调查员的年龄自动调整属性。年龄 ${state.age} 岁属于 ${ageInfo.min}-${ageInfo.max} 岁年龄段。</p>
      <table class="age-adjust-table">
        <tr><th>调整项</th><th>数值</th></tr>
        <tr><td>EDU成长次数</td><td>${ageInfo.eduGrowth}次</td></tr>
  `;
  if (ageInfo.strConDexCount > 0) {
    html += `<tr><td>STR/CON/DEX 减值</td><td class="negative">${ageInfo.strConDex}</td></tr>`;
  }
  if (state.age >= 15 && state.age <= 19) {
    html += `<tr><td>STR/SIZ/EDU 减值（15-19岁）</td><td class="negative">-5</td></tr>`;
    html += `<tr><td>幸运值</td><td class="positive">掷两次取高</td></tr>`;
  }
  if (ageInfo.app !== 0) {
    html += `<tr><td>APP 调整</td><td class="${ageInfo.app > 0 ? 'positive' : 'negative'}">${ageInfo.app}</td></tr>`;
  }
  if (ageInfo.movPenalty !== 0) {
    html += `<tr><td>MOV 调整</td><td class="negative">${ageInfo.movPenalty}</td></tr>`;
  }
  html += `</table>`;

  if (ageInfo.strConDexCount > 0) {
    html += `
      <div class="form-group">
        <label>选择降低的属性（STR/CON/DEX中选一）：</label>
        <div class="age-adjust-select">
          <label><input type="radio" name="ageAdjChoice" value="STR" ${state.ageAdjustChoice==='STR'?'checked':''} onchange="state.ageAdjustChoice='STR';saveState()"> STR 力量</label>
          <label><input type="radio" name="ageAdjChoice" value="CON" ${state.ageAdjustChoice==='CON'?'checked':''} onchange="state.ageAdjustChoice='CON';saveState()"> CON 体质</label>
          <label><input type="radio" name="ageAdjChoice" value="DEX" ${state.ageAdjustChoice==='DEX'?'checked':''} onchange="state.ageAdjustChoice='DEX';saveState()"> DEX 敏捷</label>
        </div>
      </div>
    `;
  }

  html += `<div style="text-align:center;margin:16px 0;">
    <button class="btn btn-gold" onclick="applyAgeAdjustment()">&#9881; 应用年龄调整</button>
    ${state.ageAdjusted ? '<button class="btn btn-secondary btn-sm" onclick="resetAgeAdjustment()" style="margin-left:8px;">重置调整</button>' : ''}
  </div>`;

  if (state.ageAdjusted) {
    let effective = getEffectiveAttrs();
    html += `
      <div class="ornament">&#9830; &#9830; &#9830;</div>
      <h3 style="font-size:1rem;margin-bottom:12px;">调整结果</h3>
      <table class="age-adjust-table">
        <tr><th>属性</th><th>原始值</th><th>调整后</th><th>变化</th></tr>
    `;
    ['STR','CON','SIZ','DEX','APP','INT','POW','EDU'].forEach(k => {
      let orig = attrs[k];
      let eff = effective[k];
      let diff = eff - orig;
      let cls = diff > 0 ? 'positive' : (diff < 0 ? 'negative' : '');
      html += `<tr><td>${k}</td><td>${orig}</td><td><div class="check-cell-inline">
          <div class="ck-main">${eff}</div>
          <div class="ck-half">${Math.floor(eff/2)}</div>
          <div class="ck-fifth">${Math.floor(eff/5)}</div>
        </div></td><td class="${cls}">${diff > 0 ? '+' : ''}${diff}</td></tr>`;
    });
    html += `</table>`;
  }

  if (state.eduGrowthLog.length > 0) {
    html += `
      <div class="ornament">&#9830; &#9830; &#9830;</div>
      <h4 style="font-size:0.9rem;margin-bottom:8px;">EDU成长记录</h4>
      <div class="edu-growth-log">
    `;
    state.eduGrowthLog.forEach(e => {
      let cls = e.success ? 'log-success' : 'log-fail';
      html += `<div class="log-entry ${cls}">
        <span>第${e.round}次成长:</span>
        <span>掷出 ${e.roll} vs EDU ${e.currentEdu}</span>
        <span>${e.success ? '成功！EDU +' + e.gained : '失败'}</span>
      </div>`;
    });
    html += `</div>`;
  }

  html += `</div>`;
  container.innerHTML = html;
}

function applyAgeAdjustment() {
  let ageInfo = AGE_TABLE.find(r => state.age >= r.min && state.age <= r.max);
  if (!ageInfo) return;

  state.eduGrowthLog = [];
  let currentEdu = state.rawAttrs.EDU;

  for (let i = 0; i < ageInfo.eduGrowth; i++) {
    let roll = roll1d100();
    let success = roll > currentEdu;
    let gained = 0;
    if (success) {
      gained = roll1d10();
      currentEdu = clamp(currentEdu + gained, 0, 99);
    }
    state.eduGrowthLog.push({
      round: i + 1,
      roll: roll,
      currentEdu: currentEdu - gained,
      success: success,
      gained: gained
    });
  }

  // Lucky roll for 15-19
  if (state.age >= 15 && state.age <= 19) {
    let luck1 = roll3d6() * 5;
    let luck2 = roll3d6() * 5;
    state.luck = Math.max(luck1, luck2);
  }

  state.ageAdjusted = true;
  saveState();
  renderStep();
  notify('年龄调整已应用！', 'success');
}

function resetAgeAdjustment() {
  state.ageAdjusted = false;
  state.eduGrowthLog = [];
  saveState();
  renderStep();
}

// ----- Step 4: Occupation -----
function renderStep4(container) {
  let attrs = getEffectiveAttrs();
  let currentEra = state.era || '1920s';
  let eraLabel = currentEra === '1920s' ? '1920年代' : '现代';

  // 根据年代过滤职业
  let filteredOccs = OCCUPATIONS.filter(occ => occ.eras && occ.eras.includes(currentEra));

  let html = `
    <div class="card">
      <div class="card-title"><span class="icon">&#9873;</span> 职业选择</div>
      <p class="section-desc">
        当前时代：<strong>${eraLabel}</strong> — 共 ${filteredOccs.length} 个可用职业。
        洛式职业标记有金色标签，适合洛夫克拉夫特式调查。
      </p>
      <div class="occ-list">
  `;
  filteredOccs.forEach((occ) => {
    // 使用原始 OCCUPATIONS 数组中的索引，确保 selectOccupation 能正确找到
    let origIdx = OCCUPATIONS.indexOf(occ);
    let selected = state.occupation && state.occupation.name === occ.name;
    let tag = occ.lovecraft ? '<span class="tag-lovecraft">洛式</span>' : '';
    let eraTag = '';
    if (occ.eras.length === 2) {
      eraTag = '<span style="font-size:0.7rem;color:var(--text-muted);border:1px solid var(--border-color);border-radius:3px;padding:0 4px;margin-left:4px;">通用</span>';
    }
    html += `
      <div class="occ-item ${selected ? 'selected' : ''}" onclick="selectOccupation(${origIdx})">
        <div class="occ-name">${occ.name} ${tag}${eraTag}</div>
        <div class="occ-cr">信用评级: ${occ.creditRating[0]}-${occ.creditRating[1]} | 技能点: ${occ.skillPoints}</div>
      </div>
    `;
  });
  html += `</div>`;

  // 判断是否正在编辑自定义职业
  let isEditingCustom = !state.occupation && state.customOccForm && state.customOccForm.name !== undefined;

  // 创建自定义职业按钮（始终显示，已选职业时显示为"切换"）
  if (!isEditingCustom) {
    let triggerLabel = state.occupation ? '切换到自定义职业' : '创建自定义职业';
    let triggerHint = state.occupation ? '放弃当前选择，创建全新的自定义职业' : '所有技能由你自由选择';
    html += `
      <div class="occ-custom-occ-trigger" onclick="resetToCustomOccupation()">
        <span class="occ-custom-occ-icon">✦</span>
        <span>${triggerLabel}</span>
        <span style="font-size:0.7rem;color:var(--text-muted);margin-left:auto;">${triggerHint}</span>
      </div>
    `;
  }

  // 自定义职业编辑面板
  if (isEditingCustom) {
    let form = state.customOccForm;
    let availableSkills = getCustomOccAvailableSkills();
    let selected = form.selectedSkills || [];
    let maxSkills = 8;

    html += `
      <div class="occ-custom-occ-panel">
        <div class="occ-custom-occ-header">
          <h4>✦ 创建自定义职业</h4>
          <button class="btn btn-secondary btn-sm" onclick="cancelCustomOccupation()">取消</button>
        </div>
        <div class="occ-custom-occ-hint">
          自定义职业允许你自由选择技能组合。信用评级自动包含，最多再选 8 项技能（信用评级不计入，总计 9 项）。
        </div>

        <div class="occ-custom-occ-form">
          <div class="form-row">
            <div class="form-group" style="flex:2;">
              <label>职业名称</label>
              <input type="text" id="customOccName" value="${form.name}" placeholder="输入职业名称…"
                oninput="state.customOccForm.name=this.value;saveState()">
            </div>
            <div class="form-group" style="flex:1;">
              <label>信用评级范围</label>
              <div style="display:flex;gap:4px;align-items:center;">
                <input type="number" id="customOccCRMin" value="${form.creditRatingMin}" min="0" max="99"
                  class="occ-cr-input"
                  oninput="state.customOccForm.creditRatingMin=parseInt(this.value)||0;saveState()">
                <span style="color:var(--text-muted);">—</span>
                <input type="number" id="customOccCRMax" value="${form.creditRatingMax}" min="0" max="99"
                  class="occ-cr-input"
                  oninput="state.customOccForm.creditRatingMax=parseInt(this.value)||99;saveState()">
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group" style="flex:1;">
              <label>本职技能点数</label>
              <div style="display:flex;align-items:center;gap:6px;">
                <input type="number" id="customOccPts" value="${form.occupationalPoints || ''}" min="0" max="999"
                  placeholder="输入技能点数…"
                  class="occ-pts-input"
                  oninput="state.customOccForm.occupationalPoints=parseInt(this.value)||0;saveState()">
                <span style="font-size:0.7rem;color:var(--text-muted);white-space:nowrap;">点</span>
              </div>
            </div>
            <div class="form-group" style="flex:1;">
              <label>已选技能</label>
              <div style="font-size:0.85rem;color:var(--gold);font-weight:bold;">
                信用评级 + ${selected.length} 项 = ${1 + selected.length} / 9
              </div>
            </div>
          </div>
        </div>

        <div class="occ-custom-occ-divider"></div>

        <div class="occ-custom-occ-skills">
          <div class="occ-custom-occ-skills-header">
            <span>选择职业技能（最多 ${maxSkills} 项）</span>
            <span class="occ-custom-occ-count ${selected.length >= maxSkills ? 'full' : ''}">${selected.length} / ${maxSkills}</span>
          </div>
          <div class="occ-custom-occ-skills-grid">
    `;

    // 分离普通技能和父技能
    let normalSkills = [];
    let parentSkills = [];
    availableSkills.forEach(sk => {
      if (isParentSkill(sk) && SPECIALTY_MAP[sk]) {
        parentSkills.push(sk);
      } else {
        normalSkills.push(sk);
      }
    });

    // 渲染普通技能按钮
    normalSkills.forEach(sk => {
      let isSelected = selected.includes(sk);
      let isDisabled = !isSelected && selected.length >= maxSkills;
      html += `<button class="occ-choice-btn ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}"
        onclick="toggleCustomOccSkill('${sk.replace(/'/g, "\\'")}')">${sk}</button>`;
    });

    html += `</div>`;

    // 渲染父技能专攻选择器
    parentSkills.forEach(parentName => {
      let map = SPECIALTY_MAP[parentName];
      let isFreeForm = map && map.freeForm;
      let chosenOpt = selected.find(s => s.startsWith(parentName + '(')) || null;
      let inputId = `customOcc_freeform_${parentName}`;
      let onAddExpr = `addCustomOccFreeForm('${parentName}',document.getElementById('${inputId}').value)`;
      // 收集已自定义添加的专精
      let extraOpts = undefined;
      if (isFreeForm) {
        let presetOpts = new Set(getSpecialtyOptions(parentName));
        extraOpts = selected.filter(s => s.startsWith(parentName + '(') && !presetOpts.has(s));
      }

      html += renderSpecialtySelector({
        parentName: parentName,
        chosen: chosenOpt,
        mode: 'custom',
        isFull: selected.length >= maxSkills,
        onSelect: `toggleCustomOccSkill({opt})`,
        inputId: isFreeForm ? inputId : undefined,
        onAdd: isFreeForm ? onAddExpr : undefined,
        extraOpts: extraOpts,
      });
    });

    // 自定义技能输入区域
    let customSkills = selected.filter(s => s.startsWith('__custom__:'));
    let customDisplay = customSkills.map(s => s.slice(10)); // 去掉 __custom__: 前缀
    html += `
      <div class="occ-custom-section">
        <div class="occ-custom-divider"></div>
        <div class="occ-custom-label">✏️ 自定义技能</div>
    `;
    if (customDisplay.length > 0) {
      html += `<div class="occ-custom-tags">`;
      customDisplay.forEach(sk => {
        html += `<span class="occ-custom-tag">
          ${sk}
          <span class="occ-custom-tag-remove" onclick="removeCustomOccSkillItem('${sk.replace(/'/g, "\\'")}')">✕</span>
        </span>`;
      });
      html += `</div>`;
    }
    html += `
        <div style="display:flex;gap:4px;align-items:center;margin-top:6px;">
          <input type="text" id="customOcc_skillInput" placeholder="输入自定义技能名称…"
            style="flex:1;padding:4px 8px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:4px;color:var(--text-primary);font-size:0.8rem;"
            onkeydown="if(event.key==='Enter')addCustomOccSkillItem()">
          <button class="btn btn-secondary btn-sm" onclick="addCustomOccSkillItem()">✚ 添加</button>
        </div>
      </div>
    `;

    html += `
          </div>
        </div>

        <div class="occ-custom-occ-actions">
          <button class="btn btn-gold" onclick="confirmCustomOccupation()">✓ 确认创建</button>
          <button class="btn btn-secondary" onclick="cancelCustomOccupation()">取消</button>
        </div>
      </div>
    `;
  }

  if (state.occupation) {
    let occName = state.occupation.name;
    let occ = OCCUPATIONS.find(o => o.name === occName);
    if (!occ) occ = state.occupation; // fallback（自定义职业走这里）
    let attrs = getEffectiveAttrs();
    let pts = occ.getPoints ? occ.getPoints(attrs) : (state.occupationalPoints || 0);

    // Check if all choice groups are satisfied
    let allGroupsComplete = true;
    occ.choiceGroups.forEach(group => {
      let expandedOpts = expandSkillOptions(group.options);
      let groupSelected = state.selectedOccSkills.filter(s => expandedOpts.includes(s));
      if (groupSelected.length < group.count) allGroupsComplete = false;
    });

    html += `
      <div class="occ-detail">
        <h4>${occ.name}</h4>
        <div class="occ-info">
          <p>本职技能点: <span>${pts}</span> 点</p>
          <p>信用评级范围: <span>${occ.creditRating[0]} - ${occ.creditRating[1]}</span></p>
        </div>

        <div class="occ-fixed-skills">
          <h5>固定技能（自动获得）</h5>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
    `;
    occ.fixedSkills.forEach(s => {
      // 检查是否是父技能的已指定子类型（如 "艺术和手艺(工程制图)"、"科学(工程学)"）
      let parentMatch = null;
      for (let p in SPECIALTY_MAP) {
        if (s.startsWith(p + '(') && s.endsWith(')')) {
          parentMatch = { parent: p, sub: s.slice(p.length + 1, -1) };
          break;
        }
      }

      if (parentMatch) {
        // 已明确指定子类型 → 直接显示标签，不需要选择
        html += `<span class="occ-fixed-tag">${s}</span>`;
      } else if (isParentSkill(s)) {
        // 纯父技能（无默认子类型）→ 使用统一的专攻选择器
        let chosen = state.fixedSpecialtyChoices[s] || null;
        let map = SPECIALTY_MAP[s];
        let inputId = 'fixedFreeform_' + s;
        let onAddExpr = `selectFixedSpecialty('${s}','${s}('+document.getElementById('${inputId}').value+')')`;
        html += renderSpecialtySelector({
          parentName: s,
          chosen: chosen,
          mode: 'fixed',
          isFull: false,
          onSelect: `selectFixedSpecialty('${s}',{opt})`,
          inputId: map && map.freeForm ? inputId : undefined,
          onAdd: map && map.freeForm ? onAddExpr : undefined,
        });
      } else {
        html += `<span class="occ-fixed-tag">${s}</span>`;
      }
    });
    html += `
          </div>
        </div>
    `;

    // Render choice groups
    occ.choiceGroups.forEach((group, gIdx) => {
      let expandedOpts = expandSkillOptions(group.options);

      // 根据年代过滤现代专属技能（如电子学、计算机使用在1920年代不可选）
      let isModern = (state.era === '现代');
      expandedOpts = expandedOpts.filter(opt => {
        if (!isModern && MODERN_ONLY_SKILLS.includes(opt)) return false;
        return true;
      });

      // 计算该组已选技能数量（包括自定义技能）
      let groupSelectedCount = getGroupSelectedCount(group, gIdx);
      let isComplete = groupSelectedCount >= group.count;
      let isFull = groupSelectedCount >= group.count;

      html += `
        <div class="occ-choice-group">
          <div class="choice-header">
            <span class="choice-label">${group.label}</span>
            <span class="choice-count ${isComplete ? 'complete' : ''}">${groupSelectedCount} / ${group.count}</span>
          </div>
          <div class="occ-choice-options">
      `;

      // 分离三类选项：普通技能、freeForm 父技能、固定列表型父技能
      let normalOpts = [];
      let freeFormParents = [];
      let fixedListParents = [];
      group.options.forEach(opt => {
        if (isParentSkill(opt) && SPECIALTY_MAP[opt]) {
          if (SPECIALTY_MAP[opt].freeForm) {
            freeFormParents.push(opt);
          } else {
            fixedListParents.push(opt);
          }
        } else {
          normalOpts.push(opt);
        }
      });

      // 收集所有需要跳过的专精（由父技能展开而来，在各自区域单独渲染）
      let skipOpts = new Set();
      freeFormParents.forEach(p => {
        getSpecialtyOptions(p).forEach(o => skipOpts.add(o));
      });
      fixedListParents.forEach(p => {
        getSpecialtyOptions(p).forEach(o => skipOpts.add(o));
      });

      // 渲染普通选项（非父技能 + 在原始 options 中明确列出的子专精）
      expandedOpts.forEach(opt => {
        // 跳过由父技能展开而来的专精（它们在各自的区域单独渲染）
        if (skipOpts.has(opt) && !group.options.includes(opt)) return;
        let isSelected = state.selectedOccSkills.includes(opt);
        let isDisabled = !isSelected && isFull;
        html += `<button class="occ-choice-btn ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}"
          onclick="toggleOccSkillChoice('${opt}')">${opt}</button>`;
      });

      // 渲染所有父技能的选择区域（统一使用 renderSpecialtySelector）
      let allParentSkills = [...freeFormParents, ...fixedListParents];
      allParentSkills.forEach(parentName => {
        let map = SPECIALTY_MAP[parentName];
        let isFreeForm = map && map.freeForm;
        // 找到该父技能下已选中的专精
        let chosenOpt = state.selectedOccSkills.find(s => s.startsWith(parentName + '(')) || null;
        let inputId = `freeform_${gIdx}_${parentName}`;
        let onAddExpr = `addFreeFormSkill(${gIdx},'${parentName}',document.getElementById('${inputId}').value)`;
        // 收集已自定义添加的专精（不在预设中的，用于 freeForm 类型显示）
        let extraOpts = undefined;
        if (isFreeForm) {
          let presetOpts = new Set(getSpecialtyOptions(parentName));
          extraOpts = state.selectedOccSkills.filter(s => s.startsWith(parentName + '(') && !presetOpts.has(s));
        }

        html += renderSpecialtySelector({
          parentName: parentName,
          chosen: chosenOpt,
          mode: 'choice',
          isFull: isFull,
          onSelect: `toggleOccSkillChoice({opt})`,
          inputId: isFreeForm ? inputId : undefined,
          onAdd: isFreeForm ? onAddExpr : undefined,
          extraOpts: extraOpts,
        });
      });

      // 自定义技能输入（仅"任意X项"组显示，占用该组名额）
      if (group.label.includes('任意')) {
        // 收集该组已添加的自定义技能
        let customSkillsInGroup = [];
        if (state.customSkillGroups) {
          for (let sk in state.customSkillGroups) {
            if (state.customSkillGroups[sk] === gIdx && state.selectedOccSkills.includes(sk)) {
              customSkillsInGroup.push(sk);
            }
          }
        }
        let customInputId = `customSkill_${gIdx}`;
        html += `
          <div class="occ-custom-section">
            <div class="occ-custom-divider"></div>
            <div class="occ-custom-label">✏️ 自定义技能</div>
        `;
        // 渲染已添加的自定义技能标签（可删除）
        if (customSkillsInGroup.length > 0) {
          html += `<div class="occ-custom-tags">`;
          customSkillsInGroup.forEach(sk => {
            html += `<span class="occ-custom-tag">
              ${sk}
              <span class="occ-custom-tag-remove" onclick="removeCustomOccSkill(${gIdx},'${sk.replace(/'/g, "\\'")}')">✕</span>
            </span>`;
          });
          html += `</div>`;
        }
        html += `
            <div style="display:flex;gap:4px;align-items:center;margin-top:6px;">
              <input type="text" id="${customInputId}" placeholder="输入自定义技能名称…"
                style="flex:1;padding:4px 8px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:4px;color:var(--text-primary);font-size:0.8rem;"
                onkeydown="if(event.key==='Enter')addCustomOccSkill(${gIdx})">
              <button class="btn btn-secondary btn-sm" onclick="addCustomOccSkill(${gIdx})">✚ 添加</button>
            </div>
          </div>
        `;
      }

      html += `
          </div>
        </div>
      `;
    });

    // Credit rating input
    html += `
        <div class="cr-input-group">
          <label>信用评级:</label>
          <input type="number" id="creditRating" value="${state.creditRating}" min="${occ.creditRating[0]}" max="${occ.creditRating[1]}"
            onchange="updateCreditRating(this.value,${occ.creditRating[0]},${occ.creditRating[1]})">
          <span class="cr-range">(${occ.creditRating[0]} - ${occ.creditRating[1]})</span>
        </div>
    `;

    // Summary of selected occupational skills
    let allSelected = getSelectedOccupationalSkills();
    html += `
        <div class="occ-summary">
          <h5>已选职业技能（共 ${allSelected.length} 项）${allGroupsComplete ? '' : ' - 请完成所有技能选择'}</h5>
          <div class="summary-skills">
    `;
    allSelected.forEach(s => {
      html += `<span class="summary-tag">${s}</span>`;
    });
    html += `
          </div>
        </div>
    `;
  }

  html += `</div>`;
  container.innerHTML = html;
}

function selectOccupation(idx) {
  state.occupation = OCCUPATIONS[idx];
  state.selectedOccSkills = [];
  state.fixedSpecialtyChoices = {};
  let attrs = getEffectiveAttrs();
  let pts = state.occupation.getPoints(attrs);
  state.occupationalPoints = pts;
  state.interestPoints = attrs.INT * 2;
  state.occupationalUsed = 0;
  state.interestUsed = 0;
  state.creditRating = state.occupation.creditRating[0];

  // Initialize skill points - 使用专精格式名
  state.skillPoints = {};
  getDisplaySkillCategories().forEach(cat => {
    cat.skills.forEach(name => {
      state.skillPoints[name] = { occ: 0, int: 0 };
    });
  });
  // 也初始化常规技能（根据年代过滤现代专属技能）
  let isModern = (state.era === '现代');
  Object.keys(SKILLS_DATA.regular).forEach(name => {
    if (!isModern && MODERN_ONLY_SKILLS.includes(name)) return;
    state.skillPoints[name] = { occ: 0, int: 0 };
  });
  // 信用评级：将第4步设置的值同步到 skillPoints
  state.skillPoints['信用评级'].occ = state.creditRating;
  state.occupationalUsed = state.creditRating;

  saveState();
  renderStep();
}

// 更新信用评级（同步到 skillPoints 和 occupationalUsed）
function updateCreditRating(value, min, max) {
  let newVal = clamp(parseInt(value) || 0, min, max);
  let oldVal = state.creditRating;
  state.creditRating = newVal;

  // 同步到 skillPoints，计入职业技能点消耗
  if (!state.skillPoints['信用评级']) {
    state.skillPoints['信用评级'] = { occ: 0, int: 0 };
  }
  // 信用评级的基础值为 0，所以投入的点数 = creditRating 本身
  state.skillPoints['信用评级'].occ = newVal;

  // 重新计算 occupationalUsed
  state.occupationalUsed = 0;
  for (let sk in state.skillPoints) {
    state.occupationalUsed += (state.skillPoints[sk].occ || 0);
  }
  saveState();
  renderStep();
}

// 选择固定技能中父技能的具体专精
function selectFixedSpecialty(parentName, specialtyName) {
  let sub = specialtyName.match(new RegExp('^' + parentName + '\\((.+)\\)$'));
  if (!sub || !sub[1] || !sub[1].trim()) {
    notify('请输入有效的专精名称', 'error');
    return;
  }
  // 如果点击已选中的，取消选择
  if (state.fixedSpecialtyChoices[parentName] === specialtyName) {
    delete state.fixedSpecialtyChoices[parentName];
  } else {
    state.fixedSpecialtyChoices[parentName] = specialtyName;
  }
  // 确保该专精在 skillPoints 中有初始化
  if (!state.skillPoints[specialtyName]) {
    state.skillPoints[specialtyName] = { occ: 0, int: 0 };
  }
  saveState();
  renderStep();
}

// 添加自由输入型专精技能（如"语言(法语)"、"生存(沙漠)"、"操纵(飞行器)"）
function addFreeFormSkill(groupIdx, parentName, value) {
  value = (value || '').trim();
  if (!value) {
    notify('请输入技能名称', 'error');
    return;
  }
  let skillName = parentName + '(' + value + ')';
  if (state.selectedOccSkills.includes(skillName)) {
    notify('该技能已选择', 'error');
    return;
  }
  toggleOccSkillChoice(skillName);
  // 清空输入框
  let input = document.getElementById('freeform_' + groupIdx + '_' + parentName);
  if (input) input.value = '';
}

// 添加自定义职业技能（占用对应 choiceGroup 的名额）
function addCustomOccSkill(groupIdx) {
  let input = document.getElementById('customSkill_' + groupIdx);
  let value = (input ? input.value : '').trim();
  if (!value) {
    notify('请输入技能名称', 'error');
    return;
  }
  // 年代校验：1920年代不允许添加现代专属技能
  if (state.era !== '现代' && MODERN_ONLY_SKILLS.includes(value)) {
    notify('当前年代不可选择该技能', 'error');
    return;
  }
  if (state.selectedOccSkills.includes(value)) {
    notify('该技能已选择', 'error');
    return;
  }
  // 检查该组名额是否已满（包括已添加的自定义技能）
  let occ = OCCUPATIONS.find(o => o.name === state.occupation.name) || state.occupation;
  if (!occ.choiceGroups || !occ.choiceGroups[groupIdx]) return;
  let group = occ.choiceGroups[groupIdx];
  let groupSelected = getGroupSelectedCount(group, groupIdx);
  if (groupSelected >= group.count) {
    notify('该组技能名额已满（' + group.count + '项）', 'error');
    return;
  }
  state.selectedOccSkills.push(value);
  // 记录该自定义技能属于哪个 group
  if (!state.customSkillGroups) state.customSkillGroups = {};
  state.customSkillGroups[value] = groupIdx;
  saveState();
  renderStep();
  notify('已添加自定义技能：' + value, 'success');
}

// 移除已添加的自定义职业技能
function removeCustomOccSkill(groupIdx, skillName) {
  let idx = state.selectedOccSkills.indexOf(skillName);
  if (idx < 0) return;
  state.selectedOccSkills.splice(idx, 1);
  // 清理 customSkillGroups 记录
  if (state.customSkillGroups && state.customSkillGroups[skillName] !== undefined) {
    delete state.customSkillGroups[skillName];
  }
  saveState();
  renderStep();
  notify('已移除自定义技能：' + skillName, 'info');
}

// ============================================================
// 自定义职业 - Custom Occupation
// ============================================================

// 获取当前年代可用的所有技能列表（用于自定义职业技能选择）
function getCustomOccAvailableSkills() {
  let isModern = (state.era === '现代');
  let skills = [];

  // 常规技能
  for (let k in SKILLS_DATA.regular) {
    if (!isModern && MODERN_ONLY_SKILLS.includes(k)) continue;
    skills.push(k);
  }
  // 所有父技能（固定列表型和 freeForm 型）都只返回父技能名，由 renderSpecialtySelector 单独渲染
  for (let p in SPECIALTY_MAP) {
    skills.push(p);
  }

  return skills;
}

// 切换自定义职业技能选择
function toggleCustomOccSkill(skillName) {
  let selected = state.customOccForm.selectedSkills;
  let idx = selected.indexOf(skillName);
  if (idx >= 0) {
    selected.splice(idx, 1);
  } else {
    // 如果是父技能的专精，先移除同一父技能下已选的旧专精（同族互斥）
    for (let p in SPECIALTY_MAP) {
      if (skillName.startsWith(p + '(')) {
        selected = selected.filter(s => !s.startsWith(p + '('));
        state.customOccForm.selectedSkills = selected;
        break;
      }
    }
    if (selected.length >= 8) {
      notify('最多选择 8 项技能（信用评级自动包含，共 9 项）', 'error');
      return;
    }
    selected.push(skillName);
  }
  saveState();
  renderStep();
}

// 自定义职业中添加自由输入型专精（如"语言(俄语)"、"操纵(飞艇)"）
function addCustomOccFreeForm(parentName, subName) {
  subName = (subName || '').trim();
  if (!subName) {
    notify('请输入专精名称', 'error');
    return;
  }
  let fullName = parentName + '(' + subName + ')';
  let selected = state.customOccForm.selectedSkills;
  // 移除同一父技能下已选的旧专精
  selected = selected.filter(s => !s.startsWith(parentName + '('));
  state.customOccForm.selectedSkills = selected;
  if (selected.length >= 8) {
    notify('最多选择 8 项技能（信用评级自动包含，共 9 项）', 'error');
    return;
  }
  selected.push(fullName);
  saveState();
  renderStep();
  notify('已添加：' + fullName, 'success');
}

// 自定义职业中添加完全自定义的技能（非父技能专精）
function addCustomOccSkillItem() {
  let input = document.getElementById('customOcc_skillInput');
  let value = (input ? input.value : '').trim();
  if (!value) {
    notify('请输入技能名称', 'error');
    return;
  }
  let marker = '__custom__:' + value;
  let selected = state.customOccForm.selectedSkills;
  if (selected.includes(marker)) {
    notify('该技能已添加', 'error');
    return;
  }
  if (selected.length >= 8) {
    notify('最多选择 8 项技能（信用评级自动包含，共 9 项）', 'error');
    return;
  }
  selected.push(marker);
  saveState();
  renderStep();
  notify('已添加自定义技能：' + value, 'success');
}

// 自定义职业中移除自定义技能
function removeCustomOccSkillItem(displayName) {
  let marker = '__custom__:' + displayName;
  let selected = state.customOccForm.selectedSkills;
  let idx = selected.indexOf(marker);
  if (idx < 0) return;
  selected.splice(idx, 1);
  saveState();
  renderStep();
  notify('已移除自定义技能：' + displayName, 'info');
}

// 确认创建自定义职业
function confirmCustomOccupation() {
  let form = state.customOccForm;
  let name = form.name.trim();
  if (!name) {
    notify('请输入职业名称', 'error');
    return;
  }
  if (form.selectedSkills.length === 0) {
    notify('请至少选择 1 项技能', 'error');
    return;
  }
  let crMin = parseInt(form.creditRatingMin) || 0;
  let crMax = parseInt(form.creditRatingMax) || 99;
  if (crMin < 0) crMin = 0;
  if (crMax > 99) crMax = 99;
  if (crMin > crMax) { let t = crMin; crMin = crMax; crMax = t; }

  // 构造虚拟职业对象（与 OCCUPATIONS 格式兼容）
  // 将 __custom__: 前缀还原为真实技能名
  let cleanSkills = form.selectedSkills.map(s => {
    if (s.startsWith('__custom__:')) return s.slice(10);
    return s;
  });
  let userPts = parseInt(form.occupationalPoints) || 0;
  if (userPts < 0) userPts = 0;
  let customOcc = {
    name: name,
    eras: [state.era],
    lovecraft: false,
    custom: true,
    creditRating: [crMin, crMax],
    skillPoints: userPts + ' 点',
    getPoints: () => userPts,
    fixedSkills: ['信用评级'],
    choiceGroups: [{
      label: '自选技能（任意 ' + cleanSkills.length + ' 项）',
      count: cleanSkills.length,
      options: [...cleanSkills]
    }]
  };

  // 选择该职业
  state.occupation = customOcc;
  state.selectedOccSkills = [...cleanSkills];
  state.fixedSpecialtyChoices = {};
  state.customSkillGroups = {};

  // 初始化技能点
  let attrs = getEffectiveAttrs();
  state.occupationalPoints = userPts;
  state.interestPoints = attrs.INT * 2;
  state.occupationalUsed = 0;
  state.interestUsed = 0;
  state.creditRating = crMin;

  state.skillPoints = {};
  getDisplaySkillCategories().forEach(cat => {
    cat.skills.forEach(name => {
      state.skillPoints[name] = { occ: 0, int: 0 };
    });
  });
  let isModern = (state.era === '现代');
  Object.keys(SKILLS_DATA.regular).forEach(name => {
    if (!isModern && MODERN_ONLY_SKILLS.includes(name)) return;
    state.skillPoints[name] = { occ: 0, int: 0 };
  });
  state.skillPoints['信用评级'].occ = state.creditRating;
  state.occupationalUsed = state.creditRating;

  saveState();
  renderStep();
  notify('已创建自定义职业：' + name, 'success');
}

// 取消自定义职业编辑
function cancelCustomOccupation() {
  state.customOccForm = { name: '', creditRatingMin: 0, creditRatingMax: 99, occupationalPoints: 0, selectedSkills: [] };
  saveState();
  renderStep();
}

// 重置当前职业选择，进入自定义职业编辑模式
function resetToCustomOccupation() {
  state.occupation = null;
  state.creditRating = 0;
  state.selectedOccSkills = [];
  state.fixedSpecialtyChoices = {};
  state.customSkillGroups = {};
  state.occupationalPoints = 0;
  state.interestPoints = 0;
  state.occupationalUsed = 0;
  state.interestUsed = 0;
  state.skillPoints = {};
  state.customOccForm = { name: '', creditRatingMin: 0, creditRatingMax: 99, occupationalPoints: 0, selectedSkills: [] };
  saveState();
  renderStep();
}
