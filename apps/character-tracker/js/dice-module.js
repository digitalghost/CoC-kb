/**
 * dice-module.js - 3D 骰子检定模块 (ES Module)
 */

import DiceBox from '../dice-box/dice-box.es.min.js';

// ===== 骰子类型定义 =====
const DICE_TYPES = [
  { id: 'd4',   label: 'D4'   },
  { id: 'd6',   label: 'D6'   },
  { id: 'd8',   label: 'D8'   },
  { id: 'd10',  label: 'D10'  },
  { id: 'd12',  label: 'D12'  },
  { id: 'd20',  label: 'D20'  },
  { id: 'd100', label: 'D100' },
];

// ===== 状态 =====
let diceBox = null;
let isRolling = false;
let diceBoxReady = false;
const selectedDice = {};
DICE_TYPES.forEach(d => selectedDice[d.id] = 0);

// ===== DOM 引用 =====
const container = document.getElementById('dice-box-container');
const selectorEl = document.getElementById('diceSelector');
const rollBtn = document.getElementById('diceRollBtn');
const clearBtn = document.getElementById('diceClearBtn');
const closeBtn = document.getElementById('diceCloseBtn');
const notationInput = document.getElementById('diceNotationInput');
const resultsPanel = document.getElementById('diceResultsPanel');
const resultsContent = document.getElementById('diceResultsContent');
const resultsClose = document.getElementById('diceResultsClose');

// ===== 初始化骰子选择器 UI =====
DICE_TYPES.forEach(dice => {
  const btn = document.createElement('button');
  btn.className = 'dice-type-btn';
  btn.id = `dbtn-${dice.id}`;
  btn.innerHTML = `${dice.label}<span class="dice-count" id="dcnt-${dice.id}">0</span>`;
  btn.addEventListener('click', () => addDice(dice.id));
  selectorEl.appendChild(btn);
});

function addDice(id) {
  if (selectedDice[id] < 20) {
    selectedDice[id]++;
    updateSelectorUI();
  }
}

function updateSelectorUI() {
  DICE_TYPES.forEach(dice => {
    const btn = document.getElementById(`dbtn-${dice.id}`);
    const count = document.getElementById(`dcnt-${dice.id}`);
    const n = selectedDice[dice.id];
    count.textContent = n;
    btn.classList.toggle('active', n > 0);
  });
}

// ===== 初始化 DiceBox =====
async function initDiceBox() {
  try {
    // 自动计算 assetPath：window.location.href 始终指向 HTML 页面
    const baseDir = new URL('.', window.location.href).pathname;
    diceBox = new DiceBox({
      id: 'dice-canvas',
      assetPath: baseDir + 'dice-box/assets/',
      origin: window.location.origin,
      container: '#dice-box-canvas',
      theme: 'coc',
      offscreen: false,
      scale: 4,
      gravity: 1.5,
      friction: 0.6,
      linearDamping: 0.5,
      angularDamping: 0.5,
      throwForce: 4,
      spinForce: 3,
      restitution: 0,
      enableShadows: true,
      lightIntensity: 0.9,
      startingHeight: 6,
    });

    await diceBox.init();

    diceBox.onRollComplete = (results) => {
      setTimeout(() => {
        diceBox.clear();
        displayResults(results);
        isRolling = false;
        rollBtn.disabled = false;
      }, 600);
    };

    diceBoxReady = true;
    console.log('✅ DiceBox 初始化完成 (CoC 主题)');
  } catch (err) {
    console.error('❌ DiceBox 初始化失败:', err);
    document.getElementById('dice-box-canvas').innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--red);font-size:16px;">骰子初始化失败</div>';
  }
}

// ===== 打开/关闭骰子面板 =====
function openDicePanel() {
  container.classList.add('open');
  if (!diceBoxReady) {
    initDiceBox();
  } else {
    // 重新调整 canvas 尺寸
    setTimeout(() => diceBox.resize(), 100);
  }
}

function closeDicePanel() {
  container.classList.remove('open');
  hideResults();
}

// ===== 掷骰 =====
function rollDice() {
  if (isRolling || !diceBox) return;

  const notations = [];
  for (const [id, count] of Object.entries(selectedDice)) {
    if (count > 0) notations.push(`${count}${id}`);
  }

  if (notations.length === 0) {
    const input = notationInput.value.trim();
    if (input) {
      notations.push(input);
    } else {
      return;
    }
  }

  isRolling = true;
  rollBtn.disabled = true;
  hideResults();

  try {
    diceBox.roll(notations);
  } catch (err) {
    console.error('掷骰失败:', err);
    isRolling = false;
    rollBtn.disabled = false;
  }
}

// ===== 显示结果 =====
function displayResults(rawResults) {
  if (!Array.isArray(rawResults) || rawResults.length === 0) {
    resultsPanel.classList.remove('show');
    return;
  }

  const grouped = {};
  rawResults.forEach(die => {
    const sides = die.sides || die.side || 6;
    let rolls = [];
    let value = 0;

    if (die.rolls && Array.isArray(die.rolls)) {
      rolls = die.rolls.map(r => typeof r === 'object' ? (r.value || 0) : (r || 0));
      value = rolls.reduce((a, b) => a + b, 0);
    } else if (typeof die.value === 'number') {
      rolls = [die.value];
      value = die.value;
    }

    if (!grouped[sides]) {
      grouped[sides] = { qty: 0, sides, rolls: [], value: 0 };
    }
    grouped[sides].qty += rolls.length;
    grouped[sides].rolls.push(...rolls);
    grouped[sides].value += value;
  });

  const groups = Object.values(grouped);
  let html = '';

  groups.forEach(g => {
    html += `
      <div class="dice-result-group">
        <span class="dice-result-label">${g.qty}d${g.sides}</span>
        <div class="dice-result-rolls">
          ${g.rolls.map(r => `<span class="dice-result-die">${r}</span>`).join('')}
        </div>
        <span class="dice-result-value">${g.value}</span>
      </div>
    `;
  });

  const total = groups.reduce((sum, g) => sum + g.value, 0);
  if (groups.length > 1) {
    html += `
      <div class="dice-result-total">
        <span class="dice-result-total-label">总结果</span>
        <span class="dice-result-total-value">${total}</span>
      </div>
    `;
  }

  resultsContent.innerHTML = html;
  resultsPanel.classList.add('show');
}

function hideResults() {
  resultsPanel.classList.remove('show');
}

// ===== 清空 =====
function clearAll() {
  DICE_TYPES.forEach(d => selectedDice[d.id] = 0);
  updateSelectorUI();
  notationInput.value = '';
  hideResults();
  if (diceBox) diceBox.clear();
}

// ===== 事件绑定 =====
rollBtn.addEventListener('click', rollDice);
clearBtn.addEventListener('click', clearAll);
closeBtn.addEventListener('click', closeDicePanel);
resultsClose.addEventListener('click', hideResults);

// ESC 关闭骰子面板
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && container.classList.contains('open')) {
    closeDicePanel();
  }
  // Enter 掷骰
  if (e.key === 'Enter' && container.classList.contains('open')) {
    if (document.activeElement !== notationInput) {
      e.preventDefault();
      rollDice();
    }
  }
});

// ===== 将 openDicePanel 暴露到全局，供角色卡上的骰子按钮调用 =====
window.openDicePanel = openDicePanel;
window.rollDiceCheck = function(notation) {
  // 便捷方法：直接掷骰并打开面板
  openDicePanel();
  if (!diceBoxReady) {
    // 等待初始化完成后掷骰
    const waitInit = setInterval(() => {
      if (diceBoxReady) {
        clearInterval(waitInit);
        notationInput.value = notation;
        diceBox.roll([notation]);
        isRolling = true;
        rollBtn.disabled = true;
        hideResults();
      }
    }, 200);
    // 超时保护
    setTimeout(() => clearInterval(waitInit), 10000);
  } else {
    notationInput.value = notation;
    diceBox.roll([notation]);
    isRolling = true;
    rollBtn.disabled = true;
    hideResults();
  }
};

// ===== 给角色卡上所有 .dice-btn 按钮绑定事件 =====
document.querySelectorAll('.dice-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openDicePanel();
  });
});

console.log('🎲 骰子模块已加载');

