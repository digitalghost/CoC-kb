/**
 * render/equipment.js - Equipment 渲染
 */

function renderEquipment(data) {
    let equip = data.equipment || [];
    let cash = data.spendingCash || 0;
    let equipHtml = '';
    if (equip.length > 0) {
      equip.forEach(e => {
        let detail = e.name || '';
        if (e.type) detail += ` [${e.type}]`;
        if (e.price) detail += ` $${e.price}`;
        if (e.detail) detail += ` — ${e.detail}`;
        equipHtml += `<div class="equipment-line">${detail}</div>`;
      });
    } else {
      equipHtml = '<div class="equipment-line"></div><div class="equipment-line"></div><div class="equipment-line"></div>';
    }

    document.getElementById('middleSection').innerHTML = `
      <div class="equipment-panel">
        <div class="section-header">随身物品 EQUIPMENT</div>
        <div class="equipment-lines">${equipHtml}</div>
      </div>
      <div class="assets-panel">
        <div class="section-header">资产 ASSETS</div>
        <div class="asset-field">
          <div class="asset-label">信用评级 Credit Rating</div>
          <div class="asset-line">${data.creditRating || 0}</div>
        </div>
        <div class="asset-field">
          <div class="asset-label">可支配现金 Spending Cash</div>
          <div class="asset-line">$${cash}</div>
        </div>
      </div>`;
  }
