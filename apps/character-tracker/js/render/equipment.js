/**
 * render/equipment.js - Equipment 渲染（支持 L2 编辑模式）
 */

function renderEquipment(data) {
    let equip = data.equipment || [];
    let cash = data.spendingCash || 0;
    let em = window.isEditMode ? window.isEditMode() : false;
    let equipHtml = '';

    if (equip.length > 0) {
      equip.forEach((e, idx) => {
        let detail = e.name || '';
        if (e.type) detail += ` [${e.type}]`;
        if (e.price) detail += ` $${e.price}`;
        if (e.detail) detail += ` — ${e.detail}`;
        if (em) {
          equipHtml += `<div class="equipment-line-row">
            <div class="equipment-line editable-value" onclick="editEquipmentItem(${idx}, this)">${detail}</div>
            <button class="equip-del-btn" onclick="deleteEquipment(${idx})" title="删除">✕</button>
          </div>`;
        } else {
          equipHtml += `<div class="equipment-line">${detail}</div>`;
        }
      });
    } else {
      equipHtml = '<div class="equipment-line"></div><div class="equipment-line"></div><div class="equipment-line"></div>';
    }

    let addBtn = em ? '<button class="equip-add-btn" onclick="addEquipment()">+ 添加物品</button>' : '';
    let crContent = em
      ? `<div class="asset-line editable-value" onclick="editCreditRating(this)">${data.creditRating || 0}</div>`
      : `<div class="asset-line">${data.creditRating || 0}</div>`;
    let cashContent = em
      ? `<div class="asset-line editable-value" onclick="editSpendingCash(this)">$${cash}</div>`
      : `<div class="asset-line">$${cash}</div>`;

    document.getElementById('middleSection').innerHTML = `
      <div class="equipment-panel">
        <div class="section-header">随身物品 EQUIPMENT</div>
        ${addBtn}
        <div class="equipment-lines">${equipHtml}</div>
      </div>
      <div class="assets-panel">
        <div class="section-header">资产 ASSETS</div>
        <div class="asset-field">
          <div class="asset-label">信用评级 Credit Rating</div>
          ${crContent}
        </div>
        <div class="asset-field">
          <div class="asset-label">可支配现金 Spending Cash</div>
          ${cashContent}
        </div>
      </div>`;
  }
