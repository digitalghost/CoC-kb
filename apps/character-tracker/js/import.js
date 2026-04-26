/**
 * import.js - 角色卡导入/清除功能
 */

function decompressState(d) {
  if (!d || d.v !== 1) return null;
  let flags = d.f || 0;

  // 还原原始属性
  let rawAttrs = {};
  ATTR_KEYS.forEach((k, i) => { rawAttrs[k] = d.at[i] || 0; });

  // 还原有效属性（年龄调整后的值），优先使用 ea，回退到 at
  let eaArr = d.ea || d.at || [];
  let effectiveAttrs = {};
  ATTR_KEYS.forEach((k, i) => { effectiveAttrs[k] = eaArr[i] || rawAttrs[k] || 0; });

  let skillPoints = {};
  if (d.sk) {
    for (let k in d.sk) {
      let parts = String(d.sk[k]).split(',');
      skillPoints[k] = { occ: parseInt(parts[0]) || 0, int: parseInt(parts[1]) || 0 };
    }
  }
  let background = (d.bg || []).map(b => ({ category: b.c, content: b.t, isKey: !!b.k }));
  let companions = (d.cp || []).map(c => ({ charName: c.n || '', playerName: c.p || '' }));
  let equipment = (d.eq || []).map(e => ({ name: e.n, type: e.t, price: e.r || 0, detail: e.d || '' }));
  let occupation = d.o || '';
  // 如果有自定义职业数据，保留完整名称（追踪器端只需要名称字符串）
  let dv = d.dv || [0,0,0,'0',0,9,0,0];
  let derived = { HP: dv[0], MP: dv[1], SAN: dv[2], DB: dv[3], build: dv[4], MOV: dv[5], dodge: dv[6], language: dv[7] };

  // 还原完整职业技能列表：展开后的固定技能(d.ofsl) + 选择组技能(d.os)
  let fixedSkillNames = d.ofsl || [];
  let choiceSkills = d.os || [];
  let occSkills = [...fixedSkillNames, ...choiceSkills];

  return {
    name: d.s.n || '', playerName: d.s.p || '',
    residence: d.s.r || '', hometown: d.s.h || '',
    age: d.s.a || 25, gender: d.s.g || '男',
    era: d.s.e || '1920s', avatar: d.s.av || '',
    rawAttrs,          // 原始掷骰值（保留用于技能基础值计算的回退）
    effectiveAttrs,    // 年龄调整后的有效属性（优先用于显示）
    luck: d.l || 0,
    occupation, creditRating: d.cr || 0,
    skillPoints, derived, background,
    keyConnection: d.kc !== undefined ? d.kc : -1,
    companions, equipment,
    weapons: d.wp || [{ name: '徒手（拳打脚踢）', skill: '格斗(斗殴)', damage: '1D3+DB', armorPiercing: false, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: null, priceModern: null, era: '默认', category: '常规武器' }],
    spendingCash: d.sc || 0,
    occSkills,         // 完整职业技能列表（固定 + 选择）
    completed: !!(flags & 4)
  };
}

function showToast(msg, isError) {
  let toast = document.getElementById('importToast');
  toast.textContent = msg;
  toast.className = 'import-toast show' + (isError ? ' error' : '');
  setTimeout(() => { toast.className = 'import-toast'; }, 3000);
}

function importCharacter(file) {
  let reader = new FileReader();
  reader.onload = function(e) {
    try {
      let json = JSON.parse(e.target.result);
      if (json._format !== 'coc7-char-v1') {
        showToast('无效的 .coc7 文件格式', true);
        return;
      }
      let encoded = json._encoded;
      let decoded = JSON.parse(decodeURIComponent(escape(atob(encoded))));
      let state = decompressState(decoded);
      if (!state) {
        showToast('角色数据解压失败', true);
        return;
      }
      // renderCharacter 由 app.js 暴露到 window 上
      window.renderCharacter(state);
      localStorage.setItem('coc-tracker-data', JSON.stringify(state));
      showToast('✅ 角色卡导入成功：' + (state.name || '未命名'));
    } catch (err) {
      console.error('导入失败:', err);
      showToast('导入失败：' + err.message, true);
    }
  };
  reader.readAsText(file);
}

function clearData() {
  if (confirm('确定要清除已导入的角色数据吗？将恢复为默认示例角色。')) {
    localStorage.removeItem('coc-tracker-data');
    window.renderCharacter(DEFAULT_DATA);
    showToast('已清除角色数据，恢复为默认示例');
  }
}
