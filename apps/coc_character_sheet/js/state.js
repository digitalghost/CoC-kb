// 应用状态管理 - Application State Management
// 包含函数: state, saveState(), loadState(), notify()

// ============================================================
// STATE
// ============================================================

let state = {
  currentStep: 0,
  // Step 1
  name: '',
  age: 25,
  gender: '男',
  era: '1920s',
  // Step 2 - raw rolled values
  rawAttrs: { STR: 0, CON: 0, SIZ: 0, DEX: 0, APP: 0, INT: 0, POW: 0, EDU: 0 },
  luck: 0,
  attrsGenerated: false,
  ageAdjusted: false,
  ageAdjustChoice: 'STR', // which attr to reduce for 40+
  eduGrowthLog: [],
  // Step 4
  occupation: null,
  creditRating: 0,
  selectedOccSkills: [],  // Step 4 - skill selection from choiceGroups
  fixedSpecialtyChoices: {},  // Step 4 - { parentName: 'chosenSpecialty' } 固定技能中父技能的专精选择
  // Step 5
  occupationalPoints: 0,
  interestPoints: 0,
  occupationalUsed: 0,
  interestUsed: 0,
  skillPoints: {}, // skillKey -> { occ: number, int: number }
  // Step 6
  derived: { HP: 0, MP: 0, SAN: 0, DB: '0', build: 0, MOV: 9, dodge: 0, language: 0 },
  // Step 7
  background: [],  // 每项: { category: '形象描述', content: '...', isKey: false }
  keyConnection: -1,  // 关键连接的索引
  // Final
  completed: false
};

function notify(msg, type) {
  let el = document.createElement('div');
  el.className = 'notification ' + type;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

function saveState() {
  try { localStorage.setItem('coc_char_state', JSON.stringify(state)); } catch(e) {}
}

function loadState() {
  try {
    let s = localStorage.getItem('coc_char_state');
    if (s) {
      let parsed = JSON.parse(s);
      state = { ...state, ...parsed };
      return true;
    }
  } catch(e) {}
  return false;
}
