/**
 * render/companions.js - Companions 渲染（支持 L2 编辑模式）
 */

function renderCompanions(data) {
    let comps = data.companions || [];
    let hub = document.getElementById('investigatorsHub');
    let em = window.isEditMode ? window.isEditMode() : false;
    let html = '<div class="hub-center">我</div>';
    for (let i = 0; i < 8; i++) {
      let c = comps[i] || { charName: '', playerName: '' };
      if (em) {
        html += `<div class="hub-node">
          <div class="node-name editable-value" onclick="editCompanionName(${i}, this)">${c.charName || '—'}</div>
          <div class="node-player editable-value" onclick="editCompanionPlayer(${i}, this)">${c.playerName || ''}</div>
        </div>`;
      } else {
        html += `<div class="hub-node">
          <div class="node-name">${c.charName || '—'}</div>
          <div class="node-player">${c.playerName || ''}</div>
        </div>`;
      }
    }
    hub.innerHTML = html;
  }
