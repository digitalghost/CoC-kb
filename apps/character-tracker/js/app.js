/**
 * app.js - 调查员追踪器主入口
 * 负责初始化、渲染编排、状态管理、数据持久化、编辑模式、操作日志
 */

(function() {
  'use strict';

  // ===== 状态管理 =====
  let currentData = null;
  let editMode = false;       // L2 编辑模式（技能/武器/背景/装备等）
  let keeperMode = false;     // 守秘人模式（属性编辑）
  let logExpanded = false;     // 日志面板展开状态

  // ===== 操作日志系统 =====
  let actionLog = [];          // { id, time, desc, undo: function }

  function pushLog(desc, undoFn) {
    let entry = {
      id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      desc: desc,
      undo: undoFn
    };
    actionLog.push(entry);
    // 限制日志数量，防止内存膨胀
    if (actionLog.length > 200) actionLog = actionLog.slice(-200);
    renderLogPanel();
  }

  function undoLog(id) {
    let idx = actionLog.findIndex(e => e.id === id);
    if (idx === -1) return;
    let entry = actionLog[idx];
    if (typeof entry.undo === 'function') {
      entry.undo();
      // 从日志中移除该条
      actionLog.splice(idx, 1);
      renderLogPanel();
      showToast('↩ 已撤回：' + entry.desc);
    }
  }

  function clearLog() {
    actionLog = [];
    renderLogPanel();
    showToast('日志已清空');
  }

  function toggleLogPanel() {
    logExpanded = !logExpanded;
    renderLogPanel();
  }

  function renderLogPanel() {
    let panel = document.getElementById('logPanel');
    if (!panel) return;

    let count = actionLog.length;
    let badge = count > 0 ? `<span class="log-badge">${count}</span>` : '';
    let chevron = logExpanded ? '▼' : '▶';

    let listHtml = '';
    if (logExpanded) {
      // 最新的在最上面
      let reversed = actionLog.slice().reverse();
      reversed.forEach(entry => {
        listHtml += `<div class="log-entry">
          <span class="log-time">${entry.time}</span>
          <span class="log-desc">${entry.desc}</span>
          <button class="log-undo-btn" onclick="undoLog('${entry.id}')" title="撤回">↩</button>
        </div>`;
      });
      if (count === 0) {
        listHtml = '<div class="log-empty">暂无操作记录</div>';
      }
    }

    panel.innerHTML = `
      <div class="log-header" onclick="toggleLogPanel()">
        <span class="log-title">📋 操作日志</span>
        ${badge}
        <span class="log-chevron">${chevron}</span>
      </div>
      <div class="log-body${logExpanded ? ' expanded' : ''}">
        ${listHtml}
        ${count > 0 ? '<button class="log-clear-btn" onclick="clearLog()">清空日志</button>' : ''}
      </div>`;
  }

  // ===== 数据持久化 =====
  function saveData() {
    if (!currentData) return;
    localStorage.setItem('coc-tracker-data', JSON.stringify(currentData));
  }

  // ===== 衍生属性计算 =====
  function recalcDerived(data) {
    let attrs = data.effectiveAttrs || data.rawAttrs || {};
    let sp = data.skillPoints || {};
    let d = data.derived = data.derived || {};

    d.HP = Math.floor((attrs.CON + attrs.SIZ) / 10);
    d.MP = Math.floor(attrs.POW / 5);

    let cthulhuMythos = 0;
    let cmSp = sp['克苏鲁神话'];
    if (cmSp) cthulhuMythos = (cmSp.occ || 0) + (cmSp.int || 0);
    d.SAN_MAX = 99 - cthulhuMythos;

    if (d.SAN_START === undefined) d.SAN_START = attrs.POW;
    if (d.SAN === undefined) d.SAN = attrs.POW;
    if (d.SAN > d.SAN_MAX) d.SAN = d.SAN_MAX;

    let strSiz = attrs.STR + attrs.SIZ;
    if (strSiz <= 64) { d.DB = '-2'; d.build = -2; }
    else if (strSiz <= 84) { d.DB = '-1'; d.build = -1; }
    else if (strSiz <= 124) { d.DB = '0'; d.build = 0; }
    else if (strSiz <= 164) { d.DB = '+1D4'; d.build = 1; }
    else if (strSiz <= 204) { d.DB = '+1D6'; d.build = 2; }
    else if (strSiz <= 284) { d.DB = '+2D6'; d.build = 3; }
    else if (strSiz <= 364) { d.DB = '+3D6'; d.build = 4; }
    else if (strSiz <= 444) { d.DB = '+4D6'; d.build = 5; }
    else { d.DB = '+5D6'; d.build = 6; }

    let mov = 8;
    if (attrs.DEX < attrs.SIZ && attrs.STR < attrs.SIZ) mov = 7;
    else if (attrs.DEX > attrs.SIZ && attrs.STR > attrs.SIZ) mov = 9;
    let age = data.age || 0;
    if (age >= 80) mov -= 5;
    else if (age >= 70) mov -= 4;
    else if (age >= 60) mov -= 3;
    else if (age >= 50) mov -= 2;
    else if (age >= 40) mov -= 1;
    d.MOV = Math.max(1, mov);

    let dodgeSp = sp['闪避'];
    let dodgeBonus = dodgeSp ? (dodgeSp.occ || 0) + (dodgeSp.int || 0) : 0;
    d.dodge = Math.floor(attrs.DEX / 2) + dodgeBonus;
    d.language = attrs.EDU;

    if (d.HP_current === undefined) d.HP_current = d.HP;
    if (d.HP_current > d.HP) d.HP_current = d.HP;
    if (d.MP_current === undefined) d.MP_current = d.MP;
    if (d.MP_current > d.MP) d.MP_current = d.MP;
  }

  // ===== 渲染编排 =====
  function renderCharacter(data) {
    currentData = data;
    recalcDerived(data);
    renderBasicInfo(data);
    renderAttributes(data);
    renderTrackers(data);
    renderSkills(data);
    renderWeapons(data);
    renderBackstory(data);
    renderEquipment(data);
    renderCompanions(data);
    updateModeButtons();
    bindDiceButtons();
  }

  // ===== 模式切换 =====
  function toggleEditMode() {
    editMode = !editMode;
    if (editMode) keeperMode = false;
    renderCharacter(currentData);
    showToast(editMode ? '✏️ 编辑模式已开启' : '🔒 已退出编辑模式');
  }

  function toggleKeeperMode() {
    if (!keeperMode) {
      showConfirmDialog(
        '🔓 解锁属性编辑',
        '此操作允许修改调查员的基础属性（力量、体质等），修改后将自动重算所有衍生属性（HP、MP、DB、MOV 等）。确定继续？',
        function() {
          keeperMode = true;
          editMode = false;
          renderCharacter(currentData);
          showToast('🔓 守秘人模式已开启 — 属性可编辑');
        }
      );
    } else {
      keeperMode = false;
      renderCharacter(currentData);
      showToast('🔒 守秘人模式已关闭');
    }
  }

  function updateModeButtons() {
    let editBtn = document.getElementById('editModeBtn');
    let keeperBtn = document.getElementById('keeperModeBtn');
    if (editBtn) {
      editBtn.textContent = editMode ? '✅ 保存并退出编辑' : '✏️ 编辑模式';
      editBtn.className = 'import-btn' + (editMode ? ' active' : '');
    }
    if (keeperBtn) {
      keeperBtn.textContent = keeperMode ? '🔒 锁定属性' : '⚙ 守秘人模式';
      keeperBtn.className = 'import-btn' + (keeperMode ? ' active' : '');
    }
  }

  // ===== Toast 提示 =====
  function showToast(msg, isError) {
    let toast = document.getElementById('importToast');
    toast.textContent = msg;
    toast.className = 'import-toast show' + (isError ? ' error' : '');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.className = 'import-toast'; }, 2500);
  }

  // ===== 确认对话框 =====
  function showConfirmDialog(title, message, onConfirm) {
    let old = document.getElementById('confirmOverlay');
    if (old) old.remove();
    let overlay = document.createElement('div');
    overlay.id = 'confirmOverlay';
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-dialog">
        <div class="confirm-title">${title}</div>
        <div class="confirm-message">${message}</div>
        <div class="confirm-actions">
          <button class="confirm-btn cancel" id="confirmCancel">取消</button>
          <button class="confirm-btn ok" id="confirmOk">确认解锁</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById('confirmCancel').onclick = function() { overlay.remove(); };
    document.getElementById('confirmOk').onclick = function() { overlay.remove(); onConfirm(); };
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  }

  // ===== 内联编辑工具 =====
  function makeEditable(el, value, onSave, options) {
    options = options || {};
    let input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.className = 'inline-edit-input' + (options.wide ? ' wide' : '');
    let rect = el.getBoundingClientRect();
    input.style.width = Math.max(rect.width, 30) + 'px';
    input.style.height = rect.height + 'px';
    el.replaceWith(input);
    input.focus();
    input.select();

    function commit() {
      let newVal = input.value.trim();
      if (options.type === 'number') {
        newVal = parseInt(newVal) || 0;
      }
      let result = onSave(newVal);
      if (result !== false) {
        saveData();
      }
    }

    input.addEventListener('blur', commit);
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { input.value = value; input.blur(); }
    });
  }

  // ===== L1 数据修改函数（始终可编辑） =====
  window.modifyHP = function(delta) {
    if (!currentData) return;
    let d = currentData.derived;
    let oldVal = d.HP_current !== undefined ? d.HP_current : d.HP;
    d.HP_current = Math.max(0, oldVal + delta);
    if (d.HP_current > d.HP) {
      showToast('⚠️ 当前 HP 超过最大值 ' + d.HP, true);
    }
    saveData();
    renderTrackers(currentData);
    let sign = delta > 0 ? '+' : '';
    pushLog(`HP ${sign}${delta} → ${d.HP_current}`, function() {
      d.HP_current = oldVal;
      saveData();
      renderTrackers(currentData);
    });
  };

  window.editHP = function(el) {
    if (!currentData) return;
    let d = currentData.derived;
    let oldVal = d.HP_current !== undefined ? d.HP_current : d.HP;
    makeEditable(el, oldVal, function(val) {
      d.HP_current = val;
      if (val > d.HP) {
        showToast('⚠️ 当前 HP 超过最大值 ' + d.HP, true);
      }
      renderTrackers(currentData);
      pushLog(`HP 设为 ${val}`, function() {
        d.HP_current = oldVal;
        saveData();
        renderTrackers(currentData);
      });
    }, { type: 'number' });
  };

  window.modifyMP = function(delta) {
    if (!currentData) return;
    let d = currentData.derived;
    let oldVal = d.MP_current !== undefined ? d.MP_current : d.MP;
    d.MP_current = Math.max(0, oldVal + delta);
    if (d.MP_current > d.MP) {
      showToast('⚠️ 当前 MP 超过最大值 ' + d.MP, true);
    }
    saveData();
    renderTrackers(currentData);
    let sign = delta > 0 ? '+' : '';
    pushLog(`MP ${sign}${delta} → ${d.MP_current}`, function() {
      d.MP_current = oldVal;
      saveData();
      renderTrackers(currentData);
    });
  };

  window.editMP = function(el) {
    if (!currentData) return;
    let d = currentData.derived;
    let oldVal = d.MP_current !== undefined ? d.MP_current : d.MP;
    makeEditable(el, oldVal, function(val) {
      d.MP_current = val;
      if (val > d.MP) {
        showToast('⚠️ 当前 MP 超过最大值 ' + d.MP, true);
      }
      renderTrackers(currentData);
      pushLog(`MP 设为 ${val}`, function() {
        d.MP_current = oldVal;
        saveData();
        renderTrackers(currentData);
      });
    }, { type: 'number' });
  };

  window.modifySAN = function(delta) {
    if (!currentData) return;
    let d = currentData.derived;
    let oldVal = d.SAN || 0;
    d.SAN = Math.max(0, oldVal + delta);
    if (d.SAN > d.SAN_MAX) {
      showToast('⚠️ 当前 SAN 超过最大值 ' + d.SAN_MAX, true);
    }
    saveData();
    renderTrackers(currentData);
    let sign = delta > 0 ? '+' : '';
    pushLog(`SAN ${sign}${delta} → ${d.SAN}`, function() {
      d.SAN = oldVal;
      saveData();
      renderTrackers(currentData);
    });
  };

  window.editSAN = function(el) {
    if (!currentData) return;
    let d = currentData.derived;
    let oldVal = d.SAN || 0;
    makeEditable(el, oldVal, function(val) {
      d.SAN = val;
      if (val > d.SAN_MAX) {
        showToast('⚠️ 当前 SAN 超过最大值 ' + d.SAN_MAX, true);
      }
      renderTrackers(currentData);
      pushLog(`SAN 设为 ${val}`, function() {
        d.SAN = oldVal;
        saveData();
        renderTrackers(currentData);
      });
    }, { type: 'number' });
  };

  window.editLuck = function(el) {
    if (!currentData) return;
    let oldVal = currentData.luck || 0;
    makeEditable(el, oldVal, function(val) {
      currentData.luck = val;
      renderTrackers(currentData);
      pushLog(`幸运值 ${oldVal} → ${val}`, function() {
        currentData.luck = oldVal;
        saveData();
        renderTrackers(currentData);
      });
    }, { type: 'number' });
  };

  window.toggleStatus = function(type) {
    if (!currentData) return;
    let d = currentData.derived;
    if (!d.statuses) d.statuses = {};
    let oldVal = !!d.statuses[type];
    d.statuses[type] = !oldVal;
    saveData();
    renderTrackers(currentData);
    let labels = {
      majorWound: '重伤', dying: '濒死', unconscious: '昏迷',
      temporaryInsanity: '临时性疯狂', indefiniteInsanity: '不定性疯狂', permanentInsanity: '永久性疯狂'
    };
    let label = labels[type] || type;
    pushLog(`${label}：${!oldVal ? "开启" : "关闭"}`, function() {
      d.statuses[type] = oldVal;
      saveData();
      renderTrackers(currentData);
    });
  };

  // ===== L2 编辑模式函数 =====
  window.editSkillValue = function(skillName, el) {
    if (!editMode || !currentData) return;
    let attrs = currentData.effectiveAttrs || currentData.rawAttrs;
    let sp = currentData.skillPoints || {};
    let oldTotal = calcSkillTotal(skillName, attrs, sp);
    makeEditable(el, oldTotal, function(val) {
      let diff = val - oldTotal;
      if (!sp[skillName]) sp[skillName] = { occ: 0, int: 0 };
      let oldInt = sp[skillName].int || 0;
      sp[skillName].int = Math.max(0, oldInt + diff);
      renderSkills(currentData);
      pushLog(`技能 ${skillName}：${oldTotal} → ${val}`, function() {
        sp[skillName].int = oldInt;
        saveData();
        renderSkills(currentData);
      });
    }, { type: 'number' });
  };

  window.toggleGrowthMark = function(skillName, checkbox) {
    if (!currentData) return;
    if (!currentData.growthMarks) currentData.growthMarks = {};
    let oldVal = !!currentData.growthMarks[skillName];
    currentData.growthMarks[skillName] = checkbox.checked;
    saveData();
    pushLog(`成长标记 ${skillName}：${checkbox.checked ? "勾选" : "取消"}`, function() {
      currentData.growthMarks[skillName] = oldVal;
      saveData();
      renderSkills(currentData);
    });
  };

  window.deleteWeapon = function(index) {
    if (!editMode || !currentData) return;
    let removed = JSON.parse(JSON.stringify(currentData.weapons[index]));
    let removedIdx = index;
    currentData.weapons.splice(index, 1);
    saveData();
    renderWeapons(currentData);
    pushLog(`删除武器：${removed.name}`, function() {
      currentData.weapons.splice(removedIdx, 0, removed);
      saveData();
      renderWeapons(currentData);
    });
  };

  window.addWeapon = function() {
    if (!editMode || !currentData) return;
    let newWeapon = {
      name: '新武器', skill: '', damage: '1D3',
      armorPiercing: false, baseRange: '接触',
      attacksPerRound: '1', capacity: '-', malfunction: null
    };
    currentData.weapons.push(newWeapon);
    let addedIdx = currentData.weapons.length - 1;
    saveData();
    renderWeapons(currentData);
    pushLog(`添加武器：${newWeapon.name}`, function() {
      currentData.weapons.splice(addedIdx, 1);
      saveData();
      renderWeapons(currentData);
    });
  };

  window.editWeaponField = function(index, field, el) {
    if (!editMode || !currentData) return;
    let w = currentData.weapons[index];
    let oldVal = w[field] || '';
    makeEditable(el, oldVal, function(val) {
      w[field] = val;
      renderWeapons(currentData);
      let fieldLabels = { name: '武器名', damage: '伤害', baseRange: '射程', attacksPerRound: '次数', capacity: '装弹量', malfunction: '故障值' };
      pushLog(`武器[${w.name}] ${fieldLabels[field] || field}：${oldVal} → ${val}`, function() {
        w[field] = oldVal;
        saveData();
        renderWeapons(currentData);
      });
    });
  };

  // 背景故事 textarea 实时更新（编辑模式 oninput 触发）
  window.updateBackstoryContent = function(category, value) {
    if (!editMode || !currentData) return;
    let items = currentData.background.filter(b => b.category === category);
    if (items.length === 0) {
      // 首次输入时自动创建条目
      let newItem = { category: category, content: value, isKey: false };
      currentData.background.push(newItem);
    } else {
      items[0].content = value;
    }
    saveData();
  };

  window.toggleKeyConnection = function(category, index) {
    if (!editMode || !currentData) return;
    let items = currentData.background.filter(b => b.category === category);
    if (!items[index]) return;
    let item = items[index];
    let oldIsKey = item.isKey;
    let oldKeyConn = currentData.keyConnection;
    item.isKey = !oldIsKey;
    if (item.isKey) {
      currentData.keyConnection = currentData.background.indexOf(item);
    } else if (currentData.keyConnection === currentData.background.indexOf(item)) {
      currentData.keyConnection = -1;
    }
    saveData();
    renderBackstory(currentData);
    pushLog(`关键连接[${category}]：${!oldIsKey ? "设置" : "取消"}`, function() {
      item.isKey = oldIsKey;
      currentData.keyConnection = oldKeyConn;
      saveData();
      renderBackstory(currentData);
    });
  };

  window.editEquipmentItem = function(index, el) {
    if (!editMode || !currentData) return;
    let e = currentData.equipment[index];
    let oldName = e.name;
    let oldPrice = e.price || 0;
    let row = el.closest('.equipment-line-row') || el.parentElement;

    // 替换为双字段编辑行
    let editRow = document.createElement('div');
    editRow.className = 'equipment-edit-row';
    editRow.innerHTML = `
      <input type="text" class="inline-edit-input equip-name-input" value="${oldName}" placeholder="物品名称">
      <span class="equip-price-sep">$</span>
      <input type="number" class="inline-edit-input equip-price-input" value="${oldPrice}" placeholder="价格" min="0" style="width:60px;">
    `;
    row.replaceWith(editRow);

    let nameInput = editRow.querySelector('.equip-name-input');
    let priceInput = editRow.querySelector('.equip-price-input');
    nameInput.focus();
    nameInput.select();

    function commit() {
      let newName = nameInput.value.trim() || '未命名';
      let newPrice = parseInt(priceInput.value) || 0;
      e.name = newName;
      e.price = newPrice;
      saveData();
      renderEquipment(currentData);
      pushLog(`装备修改：${oldName}($${oldPrice}) → ${newName}($${newPrice})`, function() {
        e.name = oldName;
        e.price = oldPrice;
        saveData();
        renderEquipment(currentData);
      });
    }

    nameInput.addEventListener('keydown', function(ev) {
      if (ev.key === 'Enter') { ev.preventDefault(); priceInput.focus(); priceInput.select(); }
      if (ev.key === 'Escape') { nameInput.value = oldName; priceInput.value = oldPrice; commit(); }
    });
    priceInput.addEventListener('keydown', function(ev) {
      if (ev.key === 'Enter') { ev.preventDefault(); commit(); }
      if (ev.key === 'Escape') { nameInput.value = oldName; priceInput.value = oldPrice; commit(); }
    });
    // 失去焦点时保存（延迟以允许 name→price 的焦点切换）
    let blurTimer = null;
    function handleBlur() {
      blurTimer = setTimeout(function() {
        if (!editRow.contains(document.activeElement)) commit();
      }, 150);
    }
    nameInput.addEventListener('blur', handleBlur);
    priceInput.addEventListener('blur', handleBlur);
    editRow.addEventListener('mousedown', function() { if (blurTimer) clearTimeout(blurTimer); });
  };

  window.addEquipment = function() {
    if (!editMode || !currentData) return;
    let newItem = { name: '新物品', type: '', price: 0, detail: '' };
    currentData.equipment.push(newItem);
    let addedIdx = currentData.equipment.length - 1;
    saveData();
    renderEquipment(currentData);
    pushLog(`添加物品：${newItem.name}`, function() {
      currentData.equipment.splice(addedIdx, 1);
      saveData();
      renderEquipment(currentData);
    });
    // 自动进入编辑状态
    setTimeout(function() {
      let rows = document.querySelectorAll('.equipment-line-row');
      let lastRow = rows[rows.length - 1];
      if (lastRow) {
        let editableEl = lastRow.querySelector('.editable-value');
        if (editableEl) editEquipmentItem(addedIdx, editableEl);
      }
    }, 50);
  };

  window.deleteEquipment = function(index) {
    if (!editMode || !currentData) return;
    let removed = JSON.parse(JSON.stringify(currentData.equipment[index]));
    let removedIdx = index;
    currentData.equipment.splice(index, 1);
    saveData();
    renderEquipment(currentData);
    pushLog(`删除物品：${removed.name}`, function() {
      currentData.equipment.splice(removedIdx, 0, removed);
      saveData();
      renderEquipment(currentData);
    });
  };

  window.editCreditRating = function(el) {
    if (!editMode || !currentData) return;
    let oldVal = currentData.creditRating || 0;
    makeEditable(el, oldVal, function(val) {
      currentData.creditRating = val;
      renderEquipment(currentData);
      pushLog(`信用评级：${oldVal} → ${val}`, function() {
        currentData.creditRating = oldVal;
        saveData();
        renderEquipment(currentData);
      });
    }, { type: 'number' });
  };

  window.editSpendingCash = function(el) {
    if (!editMode || !currentData) return;
    let oldVal = currentData.spendingCash || 0;
    makeEditable(el, oldVal, function(val) {
      currentData.spendingCash = val;
      renderEquipment(currentData);
      pushLog(`可支配现金：$${oldVal} → $${val}`, function() {
        currentData.spendingCash = oldVal;
        saveData();
        renderEquipment(currentData);
      });
    }, { type: 'number' });
  };

  window.editCompanionName = function(index, el) {
    if (!editMode || !currentData) return;
    let c = currentData.companions[index] || {};
    let oldVal = c.charName || '';
    makeEditable(el, oldVal, function(val) {
      if (!currentData.companions[index]) currentData.companions[index] = { charName: '', playerName: '' };
      currentData.companions[index].charName = val;
      renderCompanions(currentData);
      pushLog(`同伴[${index}] 名字：${oldVal} → ${val}`, function() {
        currentData.companions[index].charName = oldVal;
        saveData();
        renderCompanions(currentData);
      });
    });
  };

  window.editCompanionPlayer = function(index, el) {
    if (!editMode || !currentData) return;
    let c = currentData.companions[index] || {};
    let oldVal = c.playerName || '';
    makeEditable(el, oldVal, function(val) {
      if (!currentData.companions[index]) currentData.companions[index] = { charName: '', playerName: '' };
      currentData.companions[index].playerName = val;
      renderCompanions(currentData);
      pushLog(`同伴[${index}] 玩家：${oldVal} → ${val}`, function() {
        currentData.companions[index].playerName = oldVal;
        saveData();
        renderCompanions(currentData);
      });
    });
  };

  // ===== 守秘人模式：属性编辑 =====
  window.editAttribute = function(key, el) {
    if (!keeperMode || !currentData) return;
    let oldVal = currentData.effectiveAttrs[key] || currentData.rawAttrs[key] || 0;
    makeEditable(el, oldVal, function(newVal) {
      currentData.rawAttrs[key] = newVal;
      currentData.effectiveAttrs[key] = newVal;
      recalcDerived(currentData);
      renderCharacter(currentData);
      showToast('属性 ' + key + ' 已修改为 ' + newVal + '，衍生属性已重算');
      pushLog(`属性 ${key}：${oldVal} → ${newVal}`, function() {
        currentData.rawAttrs[key] = oldVal;
        currentData.effectiveAttrs[key] = oldVal;
        recalcDerived(currentData);
        renderCharacter(currentData);
      });
    }, { type: 'number' });
  };

  // ===== 暴露到全局 =====
  window.renderCharacter = renderCharacter;
  window.saveData = saveData;
  window.toggleEditMode = toggleEditMode;
  window.toggleKeeperMode = toggleKeeperMode;
  window.isEditMode = function() { return editMode; };
  window.isKeeperMode = function() { return keeperMode; };
  window.showToast = showToast;
  window.toggleLogPanel = toggleLogPanel;
  window.undoLog = undoLog;
  window.clearLog = clearLog;

  // ===== 骰子按钮绑定 =====
  function bindDiceButtons() {
    document.querySelectorAll('.dice-btn').forEach(btn => {
      let newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (window.openDicePanel) window.openDicePanel();
      });
    });
  }

  // ===== 初始化 =====
  function init() {
    document.getElementById('importBtn').addEventListener('click', () => {
      document.getElementById('importFileInput').click();
    });
    document.getElementById('importFileInput').addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        window.importCharacter(e.target.files[0]);
        e.target.value = '';
      }
    });
    document.getElementById('clearDataBtn').addEventListener('click', () => window.clearData());
    document.getElementById('editModeBtn').addEventListener('click', toggleEditMode);
    document.getElementById('keeperModeBtn').addEventListener('click', toggleKeeperMode);

    // 初始化日志面板
    renderLogPanel();

    // 尝试从 localStorage 加载
    let saved = localStorage.getItem('coc-tracker-data');
    if (saved) {
      try {
        let data = JSON.parse(saved);
        if (data && data.name && data.rawAttrs) {
          renderCharacter(data);
          return;
        }
      } catch (e) { /* 忽略解析错误 */ }
    }
    renderCharacter(DEFAULT_DATA);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
