/**
 * render/companions.js - Companions 渲染
 */

function renderCompanions(data) {
    let comps = data.companions || [];
    let hub = document.getElementById('investigatorsHub');
    // 保留 hub-center
    let html = '<div class="hub-center">我</div>';
    for (let i = 0; i < 8; i++) {
      let c = comps[i] || { charName: '', playerName: '' };
      html += `<div class="hub-node">
        <div class="node-name">${c.charName || '—'}</div>
        <div class="node-player">${c.playerName || ''}</div>
      </div>`;
    }
    hub.innerHTML = html;
  }
