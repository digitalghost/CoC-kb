// 节点图模块 — 移植自 graph-test.html，与游戏状态对接

let G = null;           // { nodes, edges }
let pos = {};           // id -> {x, y, vx, vy}
let simRunning = false;
let simTick = 0;
const SIM_TICKS = 300;

let canvas = null;
let ctx = null;
let wrap = null;
let animId = null;

let T = { x: 0, y: 0, s: 1 };
let hovered = null;
let lastMouseX = -1, lastMouseY = -1;
let dragStart = null, dragMoved = false;

let flashNode = null;
let flashStart = 0;
const FLASH_DURATION = 1000;

const S = {
  currentNode: 'entry-1',
  visited: new Set(['entry-1']),
  visitedEdges: new Set(),
  showLabels: true,
  showAllEdges: false,
};

const NODE_R = 6;

const FORCE = {
  repulse: 800,
  spring: 0.02,
  springLen: 100,
  centerPull: 0.004,
  damping: 0.6,
  currentPull: 0.08,
};

// ─── 公开 API ────────────────────────────────────────────────────────────────

export function initGraphMap() {
  canvas = document.getElementById('graphCanvas');
  wrap = document.getElementById('graphCanvasWrap');
  if (!canvas || !wrap) return;
  ctx = canvas.getContext('2d');

  bindCanvasEvents();
  bindToolbarEvents();

  // 加载图数据（相对路径，从 app 根目录）
  fetch('js/data/graph-data.json')
    .then(r => r.json())
    .then(data => {
      G = data;
    })
    .catch(() => {});
}

// 打开节点图，同步当前游戏状态
export function openGraphMap(gameState) {
  if (!G) return;

  // 同步游戏状态
  S.currentNode = gameState.currentNodeId || 'entry-1';
  S.visited = new Set(gameState.history || []);
  S.visited.add(S.currentNode);

  // 从历史路径重建已走过的边
  S.visitedEdges = new Set();
  const hist = gameState.history || [];
  for (let i = 0; i < hist.length - 1; i++) {
    S.visitedEdges.add(hist[i] + '>' + hist[i + 1]);
  }
  if (hist.length) {
    S.visitedEdges.add(hist[hist.length - 1] + '>' + S.currentNode);
  }

  // 等 DOM 可见后再测量尺寸
  requestAnimationFrame(() => {
    resizeCanvas();
    initPositions();
    startSim();
  });
}

export function closeGraphMap() {
  if (animId) {
    cancelAnimationFrame(animId);
    animId = null;
  }
  simRunning = false;
}

// ─── 布局 ────────────────────────────────────────────────────────────────────

function resizeCanvas() {
  canvas.width = wrap.clientWidth;
  canvas.height = wrap.clientHeight;
}

function initPositions() {
  const cx = canvas.width / 2, cy = canvas.height / 2;
  const ids = Object.keys(G.nodes);
  const dist = bfsDistance(S.currentNode);

  ids.forEach(id => {
    const d = dist[id] ?? 999;
    const angle = Math.random() * Math.PI * 2;
    const r = d === 0 ? 0 : Math.min(d * 80 + Math.random() * 40, 500);
    pos[id] = { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, vx: 0, vy: 0 };
  });

  T = { x: 0, y: 0, s: 1 };
}

function bfsDistance(startId) {
  const dist = { [startId]: 0 };
  const queue = [startId];
  const adj = {};
  G.edges.forEach(e => {
    if (!adj[e.f]) adj[e.f] = [];
    if (!adj[e.t]) adj[e.t] = [];
    adj[e.f].push(e.t);
    adj[e.t].push(e.f);
  });
  while (queue.length) {
    const cur = queue.shift();
    (adj[cur] || []).forEach(nb => {
      if (dist[nb] === undefined) { dist[nb] = dist[cur] + 1; queue.push(nb); }
    });
  }
  return dist;
}

// ─── 模拟 ────────────────────────────────────────────────────────────────────

function startSim() {
  simRunning = true;
  simTick = 0;
  if (animId) cancelAnimationFrame(animId);
  loop();
}

function loop() {
  if (simRunning) {
    tick();
    simTick++;
    if (simTick > SIM_TICKS) simRunning = false;
    if (lastMouseX >= 0) {
      const n = nodeAt(lastMouseX, lastMouseY);
      const newH = n ? n.id : null;
      if (newH !== hovered) {
        hovered = newH;
        if (n && S.visited.has(n.id)) showPanel(n);
        else hidePanel();
      }
    }
  }
  draw();
  animId = requestAnimationFrame(loop);
}

function tick() {
  const ids = Object.keys(pos);
  const cx = canvas.width / 2, cy = canvas.height / 2;

  for (let i = 0; i < ids.length; i++) {
    const a = pos[ids[i]];
    for (let j = i + 1; j < ids.length; j++) {
      const b = pos[ids[j]];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d2 = dx * dx + dy * dy + 1;
      if (d2 > 300 * 300) continue;
      const f = FORCE.repulse / d2;
      a.vx += dx * f; a.vy += dy * f;
      b.vx -= dx * f; b.vy -= dy * f;
    }
  }

  G.edges.forEach(e => {
    const a = pos[e.f], b = pos[e.t];
    if (!a || !b) return;
    const dx = b.x - a.x, dy = b.y - a.y;
    const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
    const f = (d - FORCE.springLen) * FORCE.spring;
    const fx = dx / d * f, fy = dy / d * f;
    a.vx += fx; a.vy += fy;
    b.vx -= fx; b.vy -= fy;
  });

  const cur = pos[S.currentNode];
  if (cur) { cur.x = cx; cur.y = cy; cur.vx = 0; cur.vy = 0; }

  ids.forEach(id => {
    if (id === S.currentNode) return;
    const p = pos[id];
    p.vx += (cx - p.x) * FORCE.centerPull;
    p.vy += (cy - p.y) * FORCE.centerPull;
    p.vx *= FORCE.damping;
    p.vy *= FORCE.damping;
    p.x += p.vx;
    p.y += p.vy;
  });
}

// ─── 绘制 ────────────────────────────────────────────────────────────────────

function worldToScreen(wx, wy) { return { x: wx * T.s + T.x, y: wy * T.s + T.y }; }
function screenToWorld(sx, sy) { return { x: (sx - T.x) / T.s, y: (sy - T.y) / T.s }; }

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!G) return;
  ctx.save();
  ctx.translate(T.x, T.y);
  ctx.scale(T.s, T.s);
  drawEdges();
  drawNodes();
  ctx.restore();
}

function drawEdges() {
  G.edges.forEach(e => {
    const a = pos[e.f], b = pos[e.t];
    if (!a || !b) return;
    const isVisited = S.visitedEdges.has(e.f + '>' + e.t);
    const isCurrent = e.f === S.currentNode || e.t === S.currentNode;
    if (!S.showAllEdges && !isVisited && !isCurrent) return;

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    const mx = (a.x + b.x) / 2 + (b.y - a.y) * 0.08;
    const my = (a.y + b.y) / 2 - (b.x - a.x) * 0.08;
    ctx.quadraticCurveTo(mx, my, b.x, b.y);

    if (isVisited) {
      ctx.strokeStyle = '#3D8B6E55'; ctx.lineWidth = 1.2 / T.s;
    } else if (isCurrent) {
      ctx.strokeStyle = '#C9A84C44'; ctx.lineWidth = 1 / T.s;
    } else {
      ctx.strokeStyle = '#ffffff08'; ctx.lineWidth = 0.5 / T.s;
    }
    ctx.setLineDash(e.c ? [4 / T.s, 3 / T.s] : []);
    ctx.stroke();
    ctx.setLineDash([]);

    if (isVisited) drawArrow(a, b, '#3D8B6E66');
    else if (isCurrent) drawArrow(a, b, '#C9A84C55');
  });
}

function drawArrow(a, b, color) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return;
  const ux = dx / len, uy = dy / len;
  const al = 7 / T.s;
  const tip = { x: b.x - ux * (NODE_R + 1), y: b.y - uy * (NODE_R + 1) };
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(tip.x - ux * al + uy * al * 0.4, tip.y - uy * al - ux * al * 0.4);
  ctx.lineTo(tip.x - ux * al - uy * al * 0.4, tip.y - uy * al + ux * al * 0.4);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawNodes() {
  const dist = bfsDistance(S.currentNode);
  Object.values(G.nodes).forEach(n => {
    const p = pos[n.id];
    if (!p) return;
    const isCurrent = n.id === S.currentNode;
    const isVisited = S.visited.has(n.id);
    const isHovered = n.id === hovered;
    const d = dist[n.id] ?? 999;
    const alpha = isCurrent ? 1 : isVisited ? 0.9 : Math.max(0.15, 1 - d * 0.12);
    let fill, stroke, r = NODE_R;

    if (isCurrent) {
      fill = '#C9A84C'; stroke = '#fff8e0'; r = NODE_R + 3;
    } else if (n.isEnding) {
      fill = isVisited ? '#A63D40' : `rgba(166,61,64,${alpha * 0.5})`;
      stroke = `rgba(166,61,64,${alpha})`;
    } else if (isVisited) {
      fill = '#3D8B6E'; stroke = '#5aaa8a';
    } else {
      fill = `rgba(30,42,58,${alpha})`; stroke = `rgba(74,90,110,${alpha})`;
    }

    if (n.id === flashNode) {
      const elapsed = performance.now() - flashStart;
      if (elapsed < FLASH_DURATION) {
        const t = elapsed / FLASH_DURATION;
        const pulse = Math.abs(Math.sin(t * Math.PI * 3));
        const flashR = r + 6 + pulse * 20;
        const grd = ctx.createRadialGradient(p.x, p.y, r, p.x, p.y, flashR);
        grd.addColorStop(0, `rgba(255,240,180,${pulse * 0.7})`);
        grd.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(p.x, p.y, flashR, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();
      } else { flashNode = null; }
    }

    if (isCurrent) {
      const grd = ctx.createRadialGradient(p.x, p.y, r, p.x, p.y, r + 18);
      grd.addColorStop(0, '#C9A84C30'); grd.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(p.x, p.y, r + 18, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();
    }
    if (isHovered) {
      ctx.beginPath(); ctx.arc(p.x, p.y, r + 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill();
    }

    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = stroke; ctx.lineWidth = (isCurrent ? 2 : 1) / T.s; ctx.stroke();

    if (S.showLabels) {
      const minScale = isCurrent ? 0.2 : isVisited ? 0.35 : 0.6;
      if (T.s >= minScale) {
        const fs = Math.max(7, Math.min(11, (isCurrent ? 10 : 8) / T.s));
        ctx.font = `${fs}px monospace`;
        ctx.fillStyle = isCurrent ? '#fff' : isVisited ? '#a0d0b8' : `rgba(80,100,120,${alpha})`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(n.num, p.x, p.y);
      }
    }
  });
}

// ─── 命中检测 ────────────────────────────────────────────────────────────────

function nodeAt(sx, sy) {
  const w = screenToWorld(sx, sy);
  const hitR = Math.max(NODE_R + 4, 10 / T.s);
  let best = null, bd = Infinity;
  Object.values(G.nodes).forEach(n => {
    const p = pos[n.id];
    if (!p) return;
    const dx = p.x - w.x, dy = p.y - w.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < hitR && d < bd) { best = n; bd = d; }
  });
  return best;
}

// ─── 面板 ────────────────────────────────────────────────────────────────────

function showPanel(node) {
  const panel = document.getElementById('graphNodePanel');
  if (!panel) return;
  const outEdges = G.edges.filter(e => e.f === node.id);
  const inEdges = G.edges.filter(e => e.t === node.id);
  const outHtml = outEdges.map(e => {
    const visited = S.visitedEdges.has(e.f + '>' + e.t);
    const label = e.l && e.l.length > 1 && !/^\d+$/.test(e.l) ? e.l : '继续';
    const targetNum = G.nodes[e.t]?.num ?? '?';
    return `<a class="${visited ? 'is-visited' : ''}">→ 条目${targetNum}：${label.slice(0, 18)}</a>`;
  }).join('');
  panel.innerHTML = `
    <h3>条目 ${node.num}${node.isEnding ? ' ·【结局】' : ''}</h3>
    <div class="gnp-preview">${node.preview}…</div>
    <div class="gnp-meta">入度 ${inEdges.length} · 出度 ${outEdges.length}</div>
    ${outHtml ? `<div class="gnp-links">${outHtml}</div>` : ''}
  `;
  panel.style.display = 'block';
}

function hidePanel() {
  const panel = document.getElementById('graphNodePanel');
  if (panel) panel.style.display = 'none';
}

// ─── 重排 ────────────────────────────────────────────────────────────────────

function reLayout() {
  const cx = canvas.width / 2, cy = canvas.height / 2;
  const dist = bfsDistance(S.currentNode);
  Object.keys(pos).forEach(id => { pos[id].vx = 0; pos[id].vy = 0; });
  pos[S.currentNode].x = cx; pos[S.currentNode].y = cy;
  Object.keys(pos).forEach(id => {
    if (id === S.currentNode) return;
    const d = dist[id] ?? 999;
    const p = pos[id];
    const angle = Math.atan2(p.y - cy, p.x - cx);
    const targetR = Math.min(d * 90 + 30, 480);
    p.x = cx + Math.cos(angle) * targetR;
    p.y = cy + Math.sin(angle) * targetR;
  });
  T = { x: 0, y: 0, s: 1 };
  simTick = 0; simRunning = true;
}

// ─── 鼠标事件 ────────────────────────────────────────────────────────────────

function bindCanvasEvents() {
  canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    dragStart = { mx: e.clientX - rect.left, my: e.clientY - rect.top, tx: T.x, ty: T.y };
    dragMoved = false;
    canvas.classList.add('grabbing');
  });

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
    lastMouseX = cx; lastMouseY = cy;
    if (dragStart) {
      const dx = cx - dragStart.mx, dy = cy - dragStart.my;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragMoved = true;
      T.x = dragStart.tx + dx; T.y = dragStart.ty + dy;
      return;
    }
    if (!G) return;
    const n = nodeAt(cx, cy);
    const newH = n ? n.id : null;
    if (newH !== hovered) {
      hovered = newH;
      if (n && S.visited.has(n.id)) showPanel(n);
      else hidePanel();
    }
  });

  canvas.addEventListener('mouseup', e => {
    canvas.classList.remove('grabbing');
    dragStart = null;
  });

  canvas.addEventListener('mouseleave', () => {
    dragStart = null;
    canvas.classList.remove('grabbing');
    hovered = null; lastMouseX = -1; lastMouseY = -1;
    hidePanel();
  });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const f = e.deltaY < 0 ? 1.12 : 0.89;
    T.x = mx - (mx - T.x) * f;
    T.y = my - (my - T.y) * f;
    T.s = Math.max(0.05, Math.min(10, T.s * f));
  }, { passive: false });
}

// ─── 工具栏事件 ──────────────────────────────────────────────────────────────

function bindToolbarEvents() {
  const btnLabels = document.getElementById('graphBtnLabels');
  const btnAllEdges = document.getElementById('graphBtnAllEdges');
  const btnRelayout = document.getElementById('graphBtnRelayout');

  if (btnLabels) {
    btnLabels.classList.add('is-active');
    btnLabels.addEventListener('click', () => {
      S.showLabels = !S.showLabels;
      btnLabels.classList.toggle('is-active', S.showLabels);
    });
  }

  if (btnAllEdges) {
    btnAllEdges.addEventListener('click', () => {
      S.showAllEdges = !S.showAllEdges;
      btnAllEdges.classList.toggle('is-active', S.showAllEdges);
    });
  }

  if (btnRelayout) {
    btnRelayout.addEventListener('click', () => {
      if (!G) return;
      initPositions();
      startSim();
    });
  }
}
