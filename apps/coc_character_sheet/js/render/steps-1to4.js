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

// ----- Random Name Generator -----
function generateRandomName() {
  const surnames = [
    '陈', '林', '张', '王', '李', '赵', '黄', '周', '吴', '徐',
    '孙', '胡', '朱', '高', '何', '郭', '马', '罗', '梁', '宋',
    '郑', '谢', '韩', '唐', '冯', '于', '董', '萧', '程', '曹',
    '袁', '邓', '许', '傅', '沈', '曾', '彭', '吕', '苏', '卢'
  ];
  const givenNames = [
    '怀安', '志远', '明德', '书恒', '承志', '天佑', '文彬', '景行',
    '逸尘', '子轩', '浩然', '思源', '一鸣', '鹏飞', '国栋', '家骏',
    '雅琴', '淑芬', '慧兰', '婉清', '静怡', '雪梅', '玉珍', '秀英',
    '若兰', '梦瑶', '心怡', '紫萱', '语嫣', '诗涵', '晓彤', '佳慧'
  ];
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  return pick(surnames) + pick(givenNames);
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
          <input type="text" id="charName" value="${state.name}" placeholder="输入姓名..." oninput="state.name=this.value;saveState()">
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
          <select id="charEra" onchange="state.era=this.value;saveState()">
            <option value="1920s" ${state.era==='1920s'?'selected':''}>1920年代（经典）</option>
            <option value="现代" ${state.era==='现代'?'selected':''}>现代</option>
            <option value="维多利亚" ${state.era==='维多利亚'?'selected':''}>维多利亚时代</option>
            <option value="其他" ${state.era==='其他'?'selected':''}>其他</option>
          </select>
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
    html += `
      <div class="attr-item">
        <div class="attr-name">${a.name}</div>
        <input type="number" id="attr_${a.key}" value="${displayVal(attrs[a.key])}" min="0" max="99" readonly
          style="appearance:textfield;-moz-appearance:textfield;"
          onchange="updateAttr('${a.key}', this.value)">
        <div class="attr-half">${a.formula} | 半值:${Math.floor(attrs[a.key]/2)} 五分之一:${Math.floor(attrs[a.key]/5)}</div>
      </div>
    `;
  });
  html += `</div>`;
  html += `
      <div style="text-align:center;margin-top:16px;">
        <div class="attr-item" style="display:inline-block;">
          <div class="attr-name">幸运值 LUCK</div>
          <input type="number" id="attr_LUCK" value="${displayVal(state.luck)}" min="0" max="99" readonly
            style="appearance:textfield;-moz-appearance:textfield;"
            onchange="state.luck=clamp(parseInt(this.value)||0,0,99);saveState();renderStep()">
          <div class="attr-half">3D6x5</div>
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
      html += `<tr><td>${k}</td><td>${orig}</td><td>${eff}</td><td class="${cls}">${diff > 0 ? '+' : ''}${diff}</td></tr>`;
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
  let html = `
    <div class="card">
      <div class="card-title"><span class="icon">&#9873;</span> 职业选择</div>
      <p class="section-desc">选择调查员的职业。洛式职业标记有金色标签，适合洛夫克拉夫特式调查。</p>
      <div class="occ-list">
  `;
  OCCUPATIONS.forEach((occ, idx) => {
    let selected = state.occupation && state.occupation.name === occ.name;
    let tag = occ.lovecraft ? '<span class="tag-lovecraft">洛式</span>' : '';
    html += `
      <div class="occ-item ${selected ? 'selected' : ''}" onclick="selectOccupation(${idx})">
        <div class="occ-name">${occ.name} ${tag}</div>
        <div class="occ-cr">信用评级: ${occ.creditRating[0]}-${occ.creditRating[1]} | 技能点: ${occ.skillPoints}</div>
      </div>
    `;
  });
  html += `</div>`;

  if (state.occupation) {
    let occ = state.occupation;
    let pts = occ.getPoints(attrs);

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
          <p>技能点公式: <span>${occ.skillPoints}</span> = <span>${pts}</span> 点</p>
          <p>信用评级范围: <span>${occ.creditRating[0]} - ${occ.creditRating[1]}</span></p>
        </div>

        <div class="occ-fixed-skills">
          <h5>固定技能（自动获得）</h5>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
    `;
    occ.fixedSkills.forEach(s => {
      if (isParentSkill(s)) {
        // 父技能 → 展开为专精选择
        let chosen = state.fixedSpecialtyChoices[s] || null;
        let map = SPECIALTY_MAP[s];
        if (map && map.freeForm) {
          // freeForm 型父技能（语言、生存、操纵）
          let presets = FREEFORM_PRESETS[s] || [];
          html += `<div class="freeform-skill-group" style="padding:6px;background:var(--card-bg);border:1px solid var(--border-color);border-radius:6px;display:inline-flex;flex-wrap:wrap;align-items:center;gap:4px;">
            <span style="font-size:0.8rem;color:var(--text-secondary);">${s}:</span>`;
          presets.forEach(p => {
            let optName = s + '(' + p + ')';
            let isSel = chosen === optName;
            html += `<button class="occ-choice-btn ${isSel ? 'selected' : ''}" style="font-size:0.75rem;padding:2px 6px;"
              onclick="selectFixedSpecialty('${s}','${optName}')">${p}</button>`;
          });
          // 自定义输入
          html += `<input type="text" id="fixedFreeform_${s}" placeholder="自定义…" 
            style="width:80px;padding:2px 6px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:4px;color:var(--text-primary);font-size:0.75rem;"
            onkeydown="if(event.key==='Enter')selectFixedSpecialty('${s}','${s}('+this.value+')')">
            <button class="btn btn-secondary" style="font-size:0.7rem;padding:2px 6px;" 
              onclick="selectFixedSpecialty('${s}','${s}('+document.getElementById('fixedFreeform_${s}').value+')')">✚</button>`;
          if (chosen) {
            html += `<span class="occ-fixed-tag">${getSubFromSpecialty(chosen)}</span>`;
          }
          html += `</div>`;
        } else {
          // 固定列表型父技能（科学、艺术和手艺、格斗、射击）
          let specialtyOpts = getSpecialtyOptions(s);
          html += `<div class="freeform-skill-group" style="padding:6px;background:var(--card-bg);border:1px solid var(--border-color);border-radius:6px;display:inline-flex;flex-wrap:wrap;align-items:center;gap:4px;">
            <span style="font-size:0.8rem;color:var(--text-secondary);">${s}:</span>`;
          specialtyOpts.forEach(opt => {
            let isSel = chosen === opt;
            html += `<button class="occ-choice-btn ${isSel ? 'selected' : ''}" style="font-size:0.75rem;padding:2px 6px;"
              onclick="selectFixedSpecialty('${s}','${opt}')">${getSubFromSpecialty(opt)}</button>`;
          });
          if (chosen) {
            html += `<span class="occ-fixed-tag">✓ ${getSubFromSpecialty(chosen)}</span>`;
          }
          html += `</div>`;
        }
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

      // 收集该组中所有已选的技能（包括自由输入型专精）
      let allGroupOpts = [...expandedOpts];
      group.options.forEach(opt => {
        if (isParentSkill(opt) && SPECIALTY_MAP[opt] && SPECIALTY_MAP[opt].freeForm) {
          state.selectedOccSkills.forEach(s => {
            if (s.startsWith(opt + '(') && !allGroupOpts.includes(s)) allGroupOpts.push(s);
          });
        }
      });
      let groupSelected = state.selectedOccSkills.filter(s => allGroupOpts.includes(s));
      let isComplete = groupSelected.length >= group.count;
      let isFull = groupSelected.length >= group.count;

      html += `
        <div class="occ-choice-group">
          <div class="choice-header">
            <span class="choice-label">${group.label}</span>
            <span class="choice-count ${isComplete ? 'complete' : ''}">${groupSelected.length} / ${group.count}</span>
          </div>
          <div class="occ-choice-options">
      `;

      // 分离普通选项和 freeForm 父技能
      let normalOpts = [];
      let freeFormParents = [];
      group.options.forEach(opt => {
        if (isParentSkill(opt) && SPECIALTY_MAP[opt] && SPECIALTY_MAP[opt].freeForm) {
          freeFormParents.push(opt);
        } else {
          // 非父技能直接加入
          if (!isParentSkill(opt)) normalOpts.push(opt);
        }
      });

      // 渲染普通选项（非 freeForm 父技能）
      expandedOpts.forEach(opt => {
        // 跳过由 freeForm 父技能展开而来的预设专精（它们在 freeForm 区域单独渲染）
        if (isSpecialtySkill(opt)) {
          let parent = getParentFromSpecialty(opt);
          if (parent && SPECIALTY_MAP[parent] && SPECIALTY_MAP[parent].freeForm) {
            // 只有当该专精是从父技能展开来的（不在原始 group.options 中）才跳过
            if (!group.options.includes(opt)) return;
          }
        }
        let isSelected = state.selectedOccSkills.includes(opt);
        let isDisabled = !isSelected && isFull;
        html += `<button class="occ-choice-btn ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}"
          onclick="toggleOccSkillChoice('${opt}')">${opt}</button>`;
      });

      // 渲染 freeForm 专攻区域（预设按钮 + 自定义输入）
      freeFormParents.forEach(parentName => {
        let presets = FREEFORM_PRESETS[parentName] || [];
        let presetOpts = presets.map(s => `${parentName}(${s})`);
        // 也收集玩家已自定义添加的专精（不在预设中的）
        let customAdded = state.selectedOccSkills.filter(s => {
          return s.startsWith(parentName + '(') && !presetOpts.includes(s);
        });

        html += `
          <div class="freeform-skill-group" style="margin-top:8px;padding:8px;background:var(--card-bg);border:1px solid var(--border-color);border-radius:6px;">
            <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:6px;">
              📝 ${parentName}（选择一项或自定义输入）
            </div>
            <div class="freeform-presets" style="display:flex;flex-wrap:wrap;gap:4px;">
        `;

        // 渲染预设按钮
        presetOpts.forEach(opt => {
          let isSelected = state.selectedOccSkills.includes(opt);
          let isDisabled = !isSelected && isFull;
          let subName = getSubFromSpecialty(opt);
          html += `<button class="occ-choice-btn ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}"
            onclick="toggleOccSkillChoice('${opt}')" title="${parentName}(${subName})">${subName}</button>`;
        });

        html += `
            </div>
            <div class="freeform-custom" style="display:flex;gap:4px;align-items:center;margin-top:6px;">
              <input type="text" id="freeform_${gIdx}_${parentName}" placeholder="自定义${parentName}名称…"
                style="flex:1;padding:4px 8px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:4px;color:var(--text-primary);font-size:0.8rem;"
                onkeydown="if(event.key==='Enter')addFreeFormSkill(${gIdx},'${parentName}',this.value)">
              <button class="btn btn-secondary btn-sm" onclick="addFreeFormSkill(${gIdx},'${parentName}',document.getElementById('freeform_${gIdx}_${parentName}').value)">✚ 添加</button>
            </div>
        `;

        // 渲染已自定义添加的专精标签
        if (customAdded.length > 0) {
          html += `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">`;
          customAdded.forEach(s => {
            let isDisabled = isFull && !state.selectedOccSkills.includes(s);
            html += `<button class="occ-choice-btn selected ${isDisabled ? 'disabled' : ''}"
              onclick="toggleOccSkillChoice('${s}')">${getSubFromSpecialty(s)} ✕</button>`;
          });
          html += `</div>`;
        }

        html += `</div>`;
      });

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
  // 也初始化常规技能
  Object.keys(SKILLS_DATA.regular).forEach(name => {
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
