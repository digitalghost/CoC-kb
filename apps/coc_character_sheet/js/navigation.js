// 导航和导出 - Navigation & Export
// 包含函数:
//   - nextStep()           下一步（含各步骤验证逻辑）
//   - prevStep()           上一步
//   - goToStep(step)       跳转到指定步骤（仅允许跳到已完成或当前步骤）
//   - resetAll()           重置所有角色数据
//   - exportCharacter()    导出角色卡为文本文件

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

  if (state.currentStep < 8) {
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
      name: '', age: 25, gender: '男', era: '1920s',
      rawAttrs: { STR: 0, CON: 0, SIZ: 0, DEX: 0, APP: 0, INT: 0, POW: 0, EDU: 0 },
      luck: 0,
      attrsGenerated: false,
      ageAdjusted: false, ageAdjustChoice: 'STR', eduGrowthLog: [],
      occupation: null, creditRating: 0, selectedOccSkills: [],
      occupationalPoints: 0, interestPoints: 0, occupationalUsed: 0, interestUsed: 0,
      skillPoints: {},
      derived: { HP: 0, MP: 0, SAN: 0, DB: '0', build: 0, MOV: 9, dodge: 0, language: 0 },
      background: [],
      keyConnection: -1,
      equipment: [],
      spendingCash: 0,
      completed: false
    };
    renderStep();
    notify('角色数据已重置', 'info');
  }
}

function exportCharacter() {
  calcDerived();
  let attrs = getEffectiveAttrs();
  let d = state.derived;
  let text = `=== 克苏鲁的呼唤 第七版 调查员角色卡 ===\n\n`;
  text += `姓名: ${state.name}\n`;
  text += `年龄: ${state.age} | 性别: ${state.gender} | 时代: ${state.era}\n`;
  text += `职业: ${state.occupation ? state.occupation.name : '未选择'} | 信用评级: ${state.creditRating}\n\n`;
  text += `--- 属性 ---\n`;
  ['STR','CON','SIZ','DEX','APP','INT','POW','EDU'].forEach(k => {
    text += `${k}: ${attrs[k]} (半值:${Math.floor(attrs[k]/2)} 五分之一:${Math.floor(attrs[k]/5)})\n`;
  });
  text += `幸运值: ${state.luck}\n\n`;
  text += `--- 衍生属性 ---\n`;
  text += `HP: ${d.HP} | MP: ${d.MP} | SAN: ${d.SAN} | DB: ${d.DB} | 体格: ${d.build} | MOV: ${d.MOV} | 闪避: ${d.dodge} | 母语: ${d.language}\n\n`;
  text += `--- 技能 ---\n`;
  // 使用专精展开格式导出技能
  let categories = getDisplaySkillCategories();
  categories.forEach(cat => {
    cat.skills.forEach(name => {
      let base = getSkillBase(name, attrs);
      let pts = state.skillPoints[name] || { occ: 0, int: 0 };
      let total = base + pts.occ + pts.int;
      if (total > base) {
        text += `${name}: ${total}`;
        if (pts.occ > 0) text += ` (职业+${pts.occ})`;
        if (pts.int > 0) text += ` (兴趣+${pts.int})`;
        text += `\n`;
      }
    });
  });
  // 导出自由输入型专精技能
  for (let sk in state.skillPoints) {
    let pts = state.skillPoints[sk];
    if ((pts.occ > 0 || pts.int > 0) && isSpecialtySkill(sk)) {
      let parent = getParentFromSpecialty(sk);
      if (parent && SPECIALTY_MAP[parent] && SPECIALTY_MAP[parent].freeForm) {
        let base = getSkillBase(sk, attrs);
        let total = base + pts.occ + pts.int;
        text += `${sk}: ${total}`;
        if (pts.occ > 0) text += ` (职业+${pts.occ})`;
        if (pts.int > 0) text += ` (兴趣+${pts.int})`;
        text += `\n`;
      }
    }
  }
  let bgEntries = state.background.filter(b => b.content && b.content.trim());
  if (bgEntries.length > 0) {
    text += `\n--- 背景故事 ---\n`;
    state.background.forEach((item, idx) => {
      if (item.content && item.content.trim()) {
        let prefix = idx === state.keyConnection ? '⭐ ' : '- ';
        text += `${prefix}[${item.category}] ${item.content}\n`;
      }
    });
  }

  // Equipment
  if (state.equipment.length > 0) {
    let totalSpent = getEquipmentTotalSpent();
    let crInfo = getCreditRatingInfo(state.creditRating);
    text += `\n--- 随身物品 ---\n`;
    text += `信用评级: ${state.creditRating} (${crInfo.level}) | 资产: ${crInfo.assets}\n`;
    state.equipment.forEach(item => {
      text += `- ${item.name}`;
      if (item.type && item.type !== '自定义') text += ` [${item.type}]`;
      if (item.price > 0) text += ` ($${item.price.toFixed(2)})`;
      text += `\n`;
    });
    text += `可支配现金: $${(state.spendingCash - totalSpent).toFixed(2)} (已花费 $${totalSpent.toFixed(2)} / $${state.spendingCash.toFixed(2)})\n`;
  }

  // Create download
  let blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = `${state.name || '调查员'}_角色卡.txt`;
  a.click();
  URL.revokeObjectURL(url);
  notify('角色卡已导出', 'success');
}
