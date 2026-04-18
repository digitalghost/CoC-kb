// 骰子物理引擎 - Dice Physics Engine
// 包含: ATTR_LIST, createDiceFaceHTML(), DICE_PHYSICS, DICE_ROTATIONS,
//       getTopFace(), nearestFaceRotation(), initDiceOverlay(),
//       createFloatingDie(), physicsTick(), launchDice(),
//       clearDice(), animRoll(), rollAllAttributes()

// ----- Step 2: Attribute Generation -----
const ATTR_LIST = [
  { key: 'STR', name: '力量 STR', formula: '3D6x5' },
  { key: 'CON', name: '体质 CON', formula: '3D6x5' },
  { key: 'SIZ', name: '体型 SIZ', formula: '(2D6+6)x5' },
  { key: 'DEX', name: '敏捷 DEX', formula: '3D6x5' },
  { key: 'APP', name: '外貌 APP', formula: '3D6x5' },
  { key: 'INT', name: '智力 INT', formula: '(2D6+6)x5' },
  { key: 'POW', name: '意志 POW', formula: '3D6x5' },
  { key: 'EDU', name: '教育 EDU', formula: '(2D6+6)x5' }
];

function createDiceFaceHTML(num) {
  // Realistic D6 pip layouts using absolute positioning
  const layouts = {
    1: '<div class="pip" style="top:50%;left:50%;transform:translate(-50%,-50%)"></div>',
    2: '<div class="pip" style="top:25%;left:75%;transform:translate(-50%,-50%)"></div>'
      + '<div class="pip" style="top:75%;left:25%;transform:translate(-50%,-50%)"></div>',
    3: '<div class="pip" style="top:25%;left:75%;transform:translate(-50%,-50%)"></div>'
      + '<div class="pip" style="top:50%;left:50%;transform:translate(-50%,-50%)"></div>'
      + '<div class="pip" style="top:75%;left:25%;transform:translate(-50%,-50%)"></div>',
    4: '<div class="pip" style="top:25%;left:25%;transform:translate(-50%,-50%)"></div>'
      + '<div class="pip" style="top:25%;left:75%;transform:translate(-50%,-50%)"></div>'
      + '<div class="pip" style="top:75%;left:25%;transform:translate(-50%,-50%)"></div>'
      + '<div class="pip" style="top:75%;left:75%;transform:translate(-50%,-50%)"></div>',
    5: '<div class="pip" style="top:25%;left:25%;transform:translate(-50%,-50%)"></div>'
      + '<div class="pip" style="top:25%;left:75%;transform:translate(-50%,-50%)"></div>'
      + '<div class="pip" style="top:50%;left:50%;transform:translate(-50%,-50%)"></div>'
      + '<div class="pip" style="top:75%;left:25%;transform:translate(-50%,-50%)"></div>'
      + '<div class="pip" style="top:75%;left:75%;transform:translate(-50%,-50%)"></div>',
    6: '<div class="pip" style="top:20%;left:25%;transform:translate(-50%,-50%)"></div>'
      + '<div class="pip" style="top:50%;left:25%;transform:translate(-50%,-50%)"></div>'
      + '<div class="pip" style="top:80%;left:25%;transform:translate(-50%,-50%)"></div>'
      + '<div class="pip" style="top:20%;left:75%;transform:translate(-50%,-50%)"></div>'
      + '<div class="pip" style="top:50%;left:75%;transform:translate(-50%,-50%)"></div>'
      + '<div class="pip" style="top:80%;left:75%;transform:translate(-50%,-50%)"></div>'
  };
  return layouts[num] || layouts[1];
}

// Full-page physics dice system — top-down table model
const DICE_PHYSICS = {
  friction: 0.982,
  bounce: 0.45,
  angularFriction: 0.975,
  diceSize: 70,
  settled: false,
  dice: [],
  animId: null,
  container: null,
  popup: null
};

const DICE_ROTATIONS = {
  1: { rx: 0, ry: 0 },
  2: { rx: -90, ry: 0 },
  3: { rx: 0, ry: -90 },
  4: { rx: 0, ry: 90 },
  5: { rx: 90, ry: 0 },
  6: { rx: 0, ry: 180 }
};

// Determine which face is pointing "up" (toward viewer in top-down view) based on rotation angles
// CSS transform: rotateX(rx) rotateY(ry) rotateZ(rz) is INTRINSIC XYZ rotation
// which equals EXTRINSIC ZYX rotation, so matrix M = Rx * Ry * Rz
function getTopFace(rx, ry, rz) {
  const toRad = Math.PI / 180;
  const ax = rx * toRad, ay = ry * toRad, az = rz * toRad;
  const cosX = Math.cos(ax), sinX = Math.sin(ax);
  const cosY = Math.cos(ay), sinY = Math.sin(ay);
  const cosZ = Math.cos(az), sinZ = Math.sin(az);
  // M = Rx * Ry * Rz (intrinsic XYZ = extrinsic ZYX)
  const m20 = sinX*sinZ - cosX*sinY*cosZ;
  const m21 = sinX*cosZ + cosX*sinY*sinZ;
  const m22 = cosX*cosY;
  // Face normals: [front, back, right, left, top, bottom]
  const normals = [
    [0,0,1],[0,0,-1],[1,0,0],[-1,0,0],[0,-1,0],[0,1,0]
  ];
  let maxZ = -Infinity, topIdx = 0;
  for (let i = 0; i < 6; i++) {
    const [nx,ny,nz] = normals[i];
    const tz = m20*nx + m21*ny + m22*nz;
    if (tz > maxZ) { maxZ = tz; topIdx = i; }
  }
  return [1, 6, 3, 4, 2, 5][topIdx];
}

// Find the nearest canonical rotation where a face is perfectly aligned toward viewer
// Returns {rx, ry, rz} in degrees — guaranteed to be close to input angles
function nearestFaceRotation(rxIn, ryIn, rzIn) {
  // 24 possible orientations of a cube (rotation group)
  const orientations = [
    [0,0,0],[0,0,90],[0,0,180],[0,0,270],
    [0,180,0],[0,180,90],[0,180,180],[0,180,270],
    [0,-90,0],[0,-90,90],[0,-90,180],[0,-90,270],
    [0,90,0],[0,90,90],[0,90,180],[0,90,270],
    [90,0,0],[90,0,90],[90,0,180],[90,0,270],
    [-90,0,0],[-90,0,90],[-90,0,180],[-90,0,270]
  ];
  let best = null, bestDist = Infinity;
  for (const [orx, ory, orz] of orientations) {
    // Snap each axis to nearest 360° multiple of the canonical angle
    const trx = orx + Math.round((rxIn - orx) / 360) * 360;
    const try_ = ory + Math.round((ryIn - ory) / 360) * 360;
    const trz = orz + Math.round((rzIn - orz) / 360) * 360;
    const drx = trx - rxIn, dry = try_ - ryIn, drz = trz - rzIn;
    const dist = drx*drx + dry*dry + drz*drz;
    if (dist < bestDist) { bestDist = dist; best = { rx: trx, ry: try_, rz: trz }; }
  }
  return best;
}

function initDiceOverlay() {
  if (DICE_PHYSICS.container) return;

  const c = document.createElement('div');
  c.className = 'dice-float-container';
  c.id = 'diceFloatContainer';
  document.body.appendChild(c);
  DICE_PHYSICS.container = c;

  const pop = document.createElement('div');
  pop.className = 'dice-result-popup';
  pop.id = 'diceResultPopup';
  pop.innerHTML = '<div class="drp-formula" id="drpFormula"></div><div class="drp-value" id="drpValue"></div>';
  document.body.appendChild(pop);
  DICE_PHYSICS.popup = pop;
}

function createFloatingDie(id) {
  const wrap = document.createElement('div');
  wrap.className = 'dice-float';
  wrap.id = id;
  const cube = document.createElement('div');
  cube.className = 'dice-float-cube';
  cube.id = id + '_cube';
  const faces = [
    { cls: 'front', num: 1 }, { cls: 'back', num: 6 },
    { cls: 'right', num: 3 }, { cls: 'left', num: 4 },
    { cls: 'top', num: 2 }, { cls: 'bottom', num: 5 }
  ];
  faces.forEach(f => {
    const face = document.createElement('div');
    face.className = 'dice-float-face ' + f.cls;
    face.innerHTML = '<div class="dice-float-pips">' + createDiceFaceHTML(f.num) + '</div>';
    cube.appendChild(face);
  });
  wrap.appendChild(cube);
  return wrap;
}

function physicsTick() {
  const dp = DICE_PHYSICS;
  const W = window.innerWidth;
  const H = window.innerHeight;
  const S = dp.diceSize;
  let allSettled = true;
  dp.frameCount = (dp.frameCount || 0) + 1;

  for (const d of dp.dice) {
    if (d.settled) continue;

    // Table friction (no gravity — top-down view)
    d.vx *= dp.friction;
    d.vy *= dp.friction;

    // Update position
    d.x += d.vx;
    d.y += d.vy;

    // Update rotation
    d.rx += d.vrx;
    d.ry += d.vry;
    d.rz += d.vrz;
    d.vrx *= dp.angularFriction;
    d.vry *= dp.angularFriction;
    d.vrz *= dp.angularFriction;

    // Bounce off all four walls (table edges)
    if (d.x < 0) { d.x = 0; d.vx = Math.abs(d.vx) * dp.bounce; d.vrz += (Math.random()-0.5)*3; }
    if (d.x > W - S) { d.x = W - S; d.vx = -Math.abs(d.vx) * dp.bounce; d.vrz += (Math.random()-0.5)*3; }
    if (d.y < 0) { d.y = 0; d.vy = Math.abs(d.vy) * dp.bounce; d.vrz += (Math.random()-0.5)*3; }
    if (d.y > H - S) { d.y = H - S; d.vy = -Math.abs(d.vy) * dp.bounce; d.vrz += (Math.random()-0.5)*3; }

    // Extra friction when very slow (simulates felt table surface)
    const speed = Math.sqrt(d.vx*d.vx + d.vy*d.vy);
    if (speed < 2) {
      d.vx *= 0.96;
      d.vy *= 0.96;
    }
    if (speed < 0.5) {
      d.vx *= 0.9;
      d.vy *= 0.9;
    }

    // When angular speed is low, gradually align to nearest face (simulates dice settling flat)
    const angSpeed = Math.sqrt(d.vrx*d.vrx + d.vry*d.vry + d.vrz*d.vrz);
    if (angSpeed < 3 && speed < 3) {
      const target = nearestFaceRotation(d.rx, d.ry, d.rz);
      const lerpFactor = angSpeed < 1 ? 0.08 : 0.03;
      d.rx += (target.rx - d.rx) * lerpFactor;
      d.ry += (target.ry - d.ry) * lerpFactor;
      d.rz += (target.rz - d.rz) * lerpFactor;
      // Dampen angular velocity more aggressively during alignment
      d.vrx *= 0.92;
      d.vry *= 0.92;
      d.vrz *= 0.92;
    }
  }

  // Dice-to-dice collision detection
  for (let i = 0; i < dp.dice.length; i++) {
    for (let j = i + 1; j < dp.dice.length; j++) {
      const a = dp.dice[i], b = dp.dice[j];
      if (a.settled && b.settled) continue;
      const cx1 = a.x + S/2, cy1 = a.y + S/2;
      const cx2 = b.x + S/2, cy2 = b.y + S/2;
      const dx = cx2 - cx1, dy = cy2 - cy1;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const minDist = S * 0.95;
      if (dist < minDist && dist > 0.01) {
        const nx = dx / dist, ny = dy / dist;
        const overlap = minDist - dist;
        // Separate dice
        if (!a.settled) { a.x -= nx * overlap * 0.5; a.y -= ny * overlap * 0.5; }
        if (!b.settled) { b.x += nx * overlap * 0.5; b.y += ny * overlap * 0.5; }
        // Elastic collision response
        const relVx = a.vx - b.vx, relVy = a.vy - b.vy;
        const relVn = relVx * nx + relVy * ny;
        if (relVn > 0) {
          const restitution = 0.5;
          const impulse = relVn * (1 + restitution) * 0.5;
          if (!a.settled) { a.vx -= impulse * nx; a.vy -= impulse * ny; }
          if (!b.settled) { b.vx += impulse * nx; b.vy += impulse * ny; }
          // Add spin from collision
          if (!a.settled) { a.vrx += (Math.random()-0.5)*3; a.vry += (Math.random()-0.5)*3; }
          if (!b.settled) { b.vrx += (Math.random()-0.5)*3; b.vry += (Math.random()-0.5)*3; }
        }
      }
    }
  }

  // Second pass: check settled + apply transforms
  for (const d of dp.dice) {
    if (d.settled) continue;
    const speed = Math.sqrt(d.vx*d.vx + d.vy*d.vy);
    const angSpeed = Math.sqrt(d.vrx*d.vrx + d.vry*d.vry + d.vrz*d.vrz);

    if ((speed < 0.3 && angSpeed < 0.8) || dp.frameCount > 250) {
      d.settleFrames = (d.settleFrames || 0) + 1;
      if (d.settleFrames > 10) {
        d.settled = true;
        d.vx = 0; d.vy = 0;
        d.vrx = 0; d.vry = 0; d.vrz = 0;
        // Read actual top face from final rotation — no forced snap
        d.resultFace = getTopFace(d.rx, d.ry, d.rz);
      }
    } else {
      d.settleFrames = 0;
    }

    if (!d.settled) allSettled = false;

    // Apply transform
    const el = document.getElementById(d.id);
    const cube = document.getElementById(d.id + '_cube');
    if (el) {
      el.style.left = d.x + 'px';
      el.style.top = d.y + 'px';
    }
    if (cube) {
      cube.style.transform = 'rotateX(' + d.rx + 'deg) rotateY(' + d.ry + 'deg) rotateZ(' + d.rz + 'deg)';
    }
  }

  if (allSettled) {
    dp.settled = true;
    if (dp.animId) { cancelAnimationFrame(dp.animId); dp.animId = null; }
    if (dp.onSettled) dp.onSettled();
  } else {
    dp.animId = requestAnimationFrame(physicsTick);
  }
}

function launchDice(diceConfigs, onSettled) {
  initDiceOverlay();
  const dp = DICE_PHYSICS;
  const W = window.innerWidth;
  const H = window.innerHeight;
  const S = dp.diceSize;

  // Clear previous
  dp.container.innerHTML = '';
  dp.dice = [];
  dp.settled = false;
  dp.frameCount = 0;
  if (dp.animId) { cancelAnimationFrame(dp.animId); dp.animId = null; }

  const spacing = S + 20;
  const totalWidth = diceConfigs.length * spacing;
  const startX = (W - totalWidth) / 2;

  for (let i = 0; i < diceConfigs.length; i++) {
    const cfg = diceConfigs[i];
    const el = createFloatingDie(cfg.id);
    dp.container.appendChild(el);

    // Dice start below screen center (player's eye position) and are thrown onto the table
    const die = {
      id: cfg.id,
      x: W/2 + (Math.random() - 0.5) * 60,
      y: H + S * 0.5,
      vx: (Math.random() - 0.5) * 14,
      vy: -(15 + Math.random() * 10),  // strong upward throw
      vz: 0,
      rx: Math.random() * 720 - 360,
      ry: Math.random() * 720 - 360,
      rz: Math.random() * 360,
      vrx: (Math.random() - 0.5) * 30 + 12,
      vry: (Math.random() - 0.5) * 30 + 12,
      vrz: (Math.random() - 0.5) * 18,
      settled: false,
      settleFrames: 0
    };
    dp.dice.push(die);
  }

  dp.onSettled = onSettled;
  dp.animId = requestAnimationFrame(physicsTick);
}

function clearDice() {
  const dp = DICE_PHYSICS;
  if (dp.animId) { cancelAnimationFrame(dp.animId); dp.animId = null; }
  if (dp.container) dp.container.innerHTML = '';
  dp.dice = [];
  dp.settled = false;
  if (dp.popup) dp.popup.classList.remove('show');
}

async function animRoll(name, cnt, ftype) {
  initDiceOverlay();
  const pop = DICE_PHYSICS.popup;
  const fm = document.getElementById('drpFormula');
  const fv = document.getElementById('drpValue');

  pop.classList.remove('show');

  // 如果已跳过，直接返回随机结果
  if (animRoll._skipped) {
    let rolls = [];
    let sum = 0;
    for (let i = 0; i < cnt; i++) {
      let r = Math.floor(Math.random() * 6) + 1;
      rolls.push(r);
      sum += r;
    }
    if (ftype === '2d6+6') sum += 6;
    let val = sum * 5;
    return { rolls, sum, val };
  }

  // Create dice configs (no pre-determined face — physics decides)
  let diceConfigs = [];
  for (let i = 0; i < cnt; i++) {
    diceConfigs.push({ id: 'fd_' + Date.now() + '_' + i });
  }

  // Launch physics dice and read actual results when settled
  return new Promise((resolve) => {
    animRoll._resolve = resolve;
    animRoll._ftype = ftype;
    launchDice(diceConfigs, () => {
      // Read actual face values from physics result
      let rolls = DICE_PHYSICS.dice.map(d => d.resultFace || 1);
      let sum = rolls.reduce((a, b) => a + b, 0);
      if (ftype === '2d6+6') sum += 6;
      let val = sum * 5;

      let ft = rolls.join(' + ');
      if (ftype === '2d6+6') {
        fm.innerHTML = '(' + ft + ') <span style="color:#E8944A;font-weight:bold;">+ 6</span> = ' + sum + '  |  x5 = ' + val;
      } else {
        fm.textContent = ft + ' = ' + sum + '  |  x5 = ' + val;
      }
      fv.textContent = val;
      pop.classList.add('show');

      setTimeout(() => {
        pop.classList.remove('show');
        if (DICE_PHYSICS.container) DICE_PHYSICS.container.innerHTML = '';
        DICE_PHYSICS.dice = [];
        DICE_PHYSICS.settled = false;
        animRoll._resolve = null;
        animRoll._ftype = null;
        resolve({ rolls, sum, val });
      }, 800);
    });
  });
}

async function rollAllAttributes() {
  const nav = document.getElementById('navButtons');
  const btnRoll = document.getElementById('btnRollAll');
  if (nav) nav.classList.add('frozen');
  if (btnRoll) btnRoll.disabled = true;

  // 创建跳过按钮
  let skipBtn = document.createElement('button');
  skipBtn.className = 'btn btn-secondary';
  skipBtn.id = 'btnSkipDice';
  skipBtn.textContent = '⏩ 跳过动画';
  skipBtn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:100;padding:10px 20px;font-size:0.9rem;';
  skipBtn.onclick = () => { if (rollAllAttributes._skip) rollAllAttributes._skip(); };
  document.body.appendChild(skipBtn);

  const A = [
    { k: 'STR', n: '力量 STR', t: '3d6' }, { k: 'CON', n: '体质 CON', t: '3d6' },
    { k: 'SIZ', n: '体型 SIZ', t: '2d6+6' }, { k: 'DEX', n: '敏捷 DEX', t: '3d6' },
    { k: 'APP', n: '外貌 APP', t: '3d6' }, { k: 'INT', n: '智力 INT', t: '2d6+6' },
    { k: 'POW', n: '意志 POW', t: '3d6' }, { k: 'EDU', n: '教育 EDU', t: '2d6+6' }
  ];

  let skipped = false;
  rollAllAttributes._skip = () => {
    skipped = true;
    animRoll._skipped = true;
    // 如果当前有挂起的 animRoll Promise，手动 resolve 它
    if (animRoll._resolve) {
      let cnt = animRoll._ftype === '3d6' ? 3 : 2;
      let rolls = [], sum = 0;
      for (let i = 0; i < cnt; i++) { let r = Math.floor(Math.random() * 6) + 1; rolls.push(r); sum += r; }
      if (animRoll._ftype === '2d6+6') sum += 6;
      let val = sum * 5;
      let resolve = animRoll._resolve;
      animRoll._resolve = null;
      animRoll._ftype = null;
      resolve({ rolls, sum, val });
    }
    clearDice();
    let pop = DICE_PHYSICS.popup;
    if (pop) pop.classList.remove('show');
  };

  for (const a of A) {
    const cnt = a.t === '3d6' ? 3 : 2;
    const r = await animRoll(a.n, cnt, a.t);
    state.rawAttrs[a.k] = r.val;
    if (!state.attrsGenerated) {
      state.attrsGenerated = true;
      for (const prev of A) {
        if (state.rawAttrs[prev.k]) {
          let prevInp = document.getElementById('attr_' + prev.k);
          if (prevInp) prevInp.value = state.rawAttrs[prev.k];
        }
      }
      renderNavButtons();
    }
    let inp = document.getElementById('attr_' + a.k);
    if (inp) inp.value = state.rawAttrs[a.k];
    let card = inp ? inp.closest('.attr-item') : null;
    if (card) {
      let hf = card.querySelector('.attr-half');
      if (hf) {
        let attrDef = ATTR_LIST.find(x => x.key === a.k);
        if (attrDef) hf.textContent = attrDef.formula + ' | 半值:' + Math.floor(state.rawAttrs[a.k]/2) + ' 五分之一:' + Math.floor(state.rawAttrs[a.k]/5);
      }
      card.classList.remove('flash');
      void card.offsetWidth;
      card.classList.add('flash');
      setTimeout(() => card.classList.remove('flash'), 1000);
    }
    saveState();
    if (!skipped) await new Promise(r => setTimeout(r, 200));
  }

  // 幸运值
  if (state.age >= 15 && state.age <= 19) {
    const r1 = await animRoll('幸运值（第一次）', 3, '3d6');
    const r2 = await animRoll('幸运值（第二次，取高）', 3, '3d6');
    state.luck = Math.max(r1.val, r2.val);
  } else {
    const r = await animRoll('幸运值 LUCK', 3, '3d6');
    state.luck = r.val;
  }
  let li = document.getElementById('attr_LUCK');
  if (li) {
    li.value = state.luck;
    let luckCard = li.closest('.attr-item');
    if (luckCard) {
      luckCard.classList.remove('flash');
      void luckCard.offsetWidth;
      luckCard.classList.add('flash');
      setTimeout(() => luckCard.classList.remove('flash'), 1000);
    }
  }

  // 移除跳过按钮
  let sb = document.getElementById('btnSkipDice');
  if (sb) sb.remove();
  rollAllAttributes._skip = null;
  animRoll._skipped = false;

  state.attrsGenerated = true;
  if (nav) nav.classList.remove('frozen');
  if (btnRoll) btnRoll.disabled = false;
  saveState(); renderStep(); notify('属性生成完成！', 'success');
}
