// 步骤5-8渲染 - Steps 5-8 Rendering
// 包含函数:
//   - renderStep5(container)        步骤5：技能点分配（职业/兴趣技能点）
//   - updateSkillPoint(name, type, val)  更新技能点分配
//   - renderStep6(container)        步骤6：衍生属性（HP/MP/SAN/DB/Build/MOV等）
//   - renderStep7(container)        步骤7：背景故事（十大类别背景条目 + 关键连接）
//   - generateBackground(category)  为指定类别生成随机背景内容
//   - addBackgroundItem(category)   添加一个背景条目
//   - removeBackgroundItem(idx)     移除一个背景条目
//   - randomizeBackgroundItem(idx)  重新随机生成某个条目
//   - setKeyConnection(idx)         设置/取消关键连接
//   - updateBackgroundContent(idx, content) 更新背景条目内容
//   - renderStep8(container)        步骤8：最终角色卡（可编辑的综合视图）
//   - updateFinalSkill(name, val)   编辑最终技能值
//   - recalcAndRender()             重新计算并渲染

// ----- Step 5: Skill Points -----
function renderStep5(container) {
  if (!state.occupation) {
    container.innerHTML = '<div class="card"><p style="color:var(--red);">请先在上一步选择职业。</p></div>';
    return;
  }

  let attrs = getEffectiveAttrs();
  let occRemain = state.occupationalPoints - state.occupationalUsed;
  let intRemain = state.interestPoints - state.interestUsed;

  let html = `
    <div class="card">
      <div class="card-title"><span class="icon">&#9998;</span> 技能点分配</div>
      <p class="section-desc">将技能点分配到各项技能中。绿色标记为职业技能，金色数值为技能点输入框。</p>
      <div class="skill-points-info">
        <div class="sp-item">
          <div class="sp-label">职业技能点</div>
          <div class="sp-value ${occRemain < 0 ? 'over' : ''}">${occRemain} / ${state.occupationalPoints}</div>
        </div>
        <div class="sp-item">
          <div class="sp-label">兴趣技能点</div>
          <div class="sp-value ${intRemain < 0 ? 'over' : ''}">${intRemain} / ${state.interestPoints}</div>
        </div>
        <div class="sp-item">
          <div class="sp-label">职业</div>
          <div class="sp-value" style="font-size:0.9rem;">${state.occupation.name}</div>
        </div>
      </div>
  `;

  // Render skill categories - 使用专精展开格式
  const categories = getDisplaySkillCategories();

  // 收集已选的自由输入型专精技能（如"语言(法语)"、"生存(沙漠)"、"操纵(飞行器)"）
  let freeFormSkills = [];
  if (state.occupation) {
    let allSelected = getSelectedOccupationalSkills();
    allSelected.forEach(s => {
      if (isSpecialtySkill(s)) {
        let parent = getParentFromSpecialty(s);
        if (parent && SPECIALTY_MAP[parent] && SPECIALTY_MAP[parent].freeForm) {
          freeFormSkills.push(s);
        }
      }
    });
    // 也检查 skillPoints 中有投入的自由输入型专精
    for (let sk in state.skillPoints) {
      let pts = state.skillPoints[sk];
      if ((pts.occ > 0 || pts.int > 0) && isSpecialtySkill(sk)) {
        let parent = getParentFromSpecialty(sk);
        if (parent && SPECIALTY_MAP[parent] && SPECIALTY_MAP[parent].freeForm && !freeFormSkills.includes(sk)) {
          freeFormSkills.push(sk);
        }
      }
    }
  }

  categories.forEach(cat => {
    html += `<div class="skill-category">
      <div class="skill-category-title" onclick="this.nextElementSibling.classList.toggle('hidden')">
        ${cat.title} <span class="toggle">&#9660;</span>
      </div>
      <table class="skill-table">
        <tr><th>技能</th><th>基础值</th><th>职业点</th><th>兴趣点</th><th>总计</th></tr>
    `;
    cat.skills.forEach(name => {
      let base = getSkillBase(name, attrs);
      let isOcc = isOccupationalSkill(name);
      let pts = state.skillPoints[name] || { occ: 0, int: 0 };
      let total = base + pts.occ + pts.int;
      let occTag = isOcc ? '<span class="tag-occ">职</span>' : '';
      html += `<tr data-skill="${name}">
        <td class="skill-name">${name} ${occTag}</td>
        <td class="skill-base">${base}</td>
        <td>${makeSkillSlider(name,'occ',pts.occ,base)}</td>
        <td>${makeSkillSlider(name,'int',pts.int,base)}</td>
        <td class="skill-total">${total}</td>
      </tr>`;
    });
    html += `</table></div>`;
  });

  // 渲染自由输入型专精技能区域
  if (freeFormSkills.length > 0) {
    html += `<div class="skill-category">
      <div class="skill-category-title" onclick="this.nextElementSibling.classList.toggle('hidden')">
        自定义专精技能 <span class="toggle">&#9660;</span>
      </div>
      <table class="skill-table">
        <tr><th>技能</th><th>基础值</th><th>职业点</th><th>兴趣点</th><th>总计</th></tr>
    `;
    freeFormSkills.forEach(name => {
      let base = getSkillBase(name, attrs);
      let isOcc = isOccupationalSkill(name);
      let pts = state.skillPoints[name] || { occ: 0, int: 0 };
      let total = base + pts.occ + pts.int;
      let occTag = isOcc ? '<span class="tag-occ">职</span>' : '';
      html += `<tr data-skill="${name}">
        <td class="skill-name">${name} ${occTag}</td>
        <td class="skill-base">${base}</td>
        <td>${makeSkillSlider(name,'occ',pts.occ,base)}</td>
        <td>${makeSkillSlider(name,'int',pts.int,base)}</td>
        <td class="skill-total">${total}</td>
      </tr>`;
    });
    html += `</table></div>`;
  }

  html += `</div>`;
  container.innerHTML = html;
}

// 生成技能点调整控件的 HTML
function makeSkillSlider(skillName, type, value, base) {
  let color = type === 'occ' ? 'var(--gold)' : 'var(--cyan)';
  return `<div class="skill-slider" data-skill="${skillName}" data-type="${type}" data-base="${base}"
    style="--slider-color:${color}">
    <span class="slider-btn slider-dec" 
      onmousedown="sliderHoldStart(event,-1)" 
      ontouchstart="sliderHoldStart(event,-1)">−</span>
    <span class="slider-val">${value}</span>
    <span class="slider-btn slider-inc" 
      onmousedown="sliderHoldStart(event,1)" 
      ontouchstart="sliderHoldStart(event,1)">+</span>
  </div>`;
}

// ===== 按住持续增减交互 =====
let _holdTimer = null;
let _holdInterval = null;

function sliderHoldStart(e, dir) {
  e.preventDefault();
  let el = e.currentTarget.parentElement;
  // 立即执行一次
  sliderApply(el, dir);
  // 按住 400ms 后开始连续增减
  _holdTimer = setTimeout(() => {
    _holdInterval = setInterval(() => sliderApply(el, dir), 80);
  }, 400);
  // 绑定释放事件
  let onRelease = () => {
    clearTimeout(_holdTimer);
    clearInterval(_holdInterval);
    _holdTimer = null;
    _holdInterval = null;
    document.removeEventListener('mouseup', onRelease);
    document.removeEventListener('touchend', onRelease);
    document.removeEventListener('touchcancel', onRelease);
  };
  document.addEventListener('mouseup', onRelease);
  document.addEventListener('touchend', onRelease);
  document.addEventListener('touchcancel', onRelease);
}

function sliderApply(el, delta) {
  let skillName = el.dataset.skill;
  let type = el.dataset.type;
  let base = parseInt(el.dataset.base) || 0;
  if (!state.skillPoints[skillName]) state.skillPoints[skillName] = { occ: 0, int: 0 };
  let oldVal = state.skillPoints[skillName][type];
  let otherType = type === 'occ' ? 'int' : 'occ';
  let otherVal = state.skillPoints[skillName][otherType];
  // 计算新值，确保总值不超过 99 且不超出剩余点数
  let newVal = Math.max(0, oldVal + delta);
  let maxAllowed = 99 - base - otherVal;
  newVal = Math.min(newVal, maxAllowed);
  // 确保不超出剩余可分配点数
  if (delta > 0) {
    let remain = type === 'occ'
      ? (state.occupationalPoints - state.occupationalUsed)
      : (state.interestPoints - state.interestUsed);
    newVal = Math.min(newVal, oldVal + remain);
  }
  if (newVal === oldVal) return;
  state.skillPoints[skillName][type] = newVal;
  // 更新 used 计数
  if (type === 'occ') {
    state.occupationalUsed += (newVal - oldVal);
  } else {
    state.interestUsed += (newVal - oldVal);
  }
  saveState();
  // 局部更新 UI（不重新渲染整个页面）
  let valEl = el.querySelector('.slider-val');
  if (valEl) valEl.textContent = newVal;
  // 更新该行的总计
  let row = el.closest('tr');
  if (row) {
    let totalEl = row.querySelector('.skill-total');
    if (totalEl) totalEl.textContent = base + state.skillPoints[skillName].occ + state.skillPoints[skillName].int;
  }
  // 更新剩余点数显示
  updatePointsDisplay();
}

function updatePointsDisplay() {
  let occRemain = state.occupationalPoints - state.occupationalUsed;
  let intRemain = state.interestPoints - state.interestUsed;
  let info = document.querySelector('.skill-points-info');
  if (!info) return;
  let spItems = info.querySelectorAll('.sp-value');
  if (spItems[0]) {
    spItems[0].textContent = occRemain + ' / ' + state.occupationalPoints;
    spItems[0].className = 'sp-value' + (occRemain < 0 ? ' over' : '');
  }
  if (spItems[1]) {
    spItems[1].textContent = intRemain + ' / ' + state.interestPoints;
    spItems[1].className = 'sp-value' + (intRemain < 0 ? ' over' : '');
  }
}

function updateSkillPoint(name, type, val) {
  let v = parseInt(val) || 0;
  if (!state.skillPoints[name]) state.skillPoints[name] = { occ: 0, int: 0 };
  let base = getSkillBase(name, getEffectiveAttrs());
  let otherType = type === 'occ' ? 'int' : 'occ';
  let otherVal = state.skillPoints[name][otherType];
  // 确保总值不超过 99
  let maxAllowed = 99 - base - otherVal;
  v = Math.max(0, Math.min(v, maxAllowed));
  // 确保不超出剩余可分配点数
  let old = state.skillPoints[name][type];
  let remain = type === 'occ'
    ? (state.occupationalPoints - state.occupationalUsed)
    : (state.interestPoints - state.interestUsed);
  if (v > old + remain) v = old + remain;
  state.skillPoints[name][type] = v;
  if (type === 'occ') {
    state.occupationalUsed += (v - old);
  } else {
    state.interestUsed += (v - old);
  }
  saveState();
  renderStep();
}

// ----- Step 6: Derived Attributes -----
function renderStep6(container) {
  calcDerived();
  let attrs = getEffectiveAttrs();
  let d = state.derived;

  let html = `
    <div class="card">
      <div class="card-title"><span class="icon">&#9874;</span> 衍生属性</div>
      <p class="section-desc">以下属性根据基础属性自动计算得出。</p>
      <div class="derived-grid">
        <div class="derived-item">
          <div class="d-name">生命值 HP</div>
          <div class="d-value">${d.HP}</div>
          <div class="d-formula">(CON ${attrs.CON} + SIZ ${attrs.SIZ}) ÷ 10</div>
        </div>
        <div class="derived-item">
          <div class="d-name">魔法值 MP</div>
          <div class="d-value">${d.MP}</div>
          <div class="d-formula">POW ${attrs.POW} ÷ 5</div>
        </div>
        <div class="derived-item">
          <div class="d-name">理智值 SAN</div>
          <div class="d-value">${d.SAN}</div>
          <div class="d-formula">= POW</div>
        </div>
        <div class="derived-item">
          <div class="d-name">伤害加值 DB</div>
          <div class="d-value">${d.DB}</div>
          <div class="d-formula">STR ${attrs.STR} + SIZ ${attrs.SIZ} = ${attrs.STR + attrs.SIZ}</div>
        </div>
        <div class="derived-item">
          <div class="d-name">体格 Build</div>
          <div class="d-value">${d.build}</div>
          <div class="d-formula">STR ${attrs.STR} + SIZ ${attrs.SIZ} = ${attrs.STR + attrs.SIZ}</div>
        </div>
        <div class="derived-item">
          <div class="d-name">移动速度 MOV</div>
          <div class="d-value">${d.MOV}</div>
          <div class="d-formula">DEX ${attrs.DEX} / SIZ ${attrs.SIZ} / STR ${attrs.STR}</div>
        </div>
        <div class="derived-item">
          <div class="d-name">闪避 Dodge</div>
          <div class="d-value">${d.dodge}</div>
          <div class="d-formula">DEX ${attrs.DEX} ÷ 2</div>
        </div>
        <div class="derived-item">
          <div class="d-name">母语 Language</div>
          <div class="d-value">${d.language}</div>
          <div class="d-formula">= EDU</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title"><span class="icon">&#9776;</span> 属性总览</div>
      <div class="attr-grid">
  `;
  ['STR','CON','SIZ','DEX','APP','INT','POW','EDU'].forEach(k => {
    let eff = attrs[k];
    html += `
      <div class="attr-item">
        <div class="attr-name">${k}</div>
        <div class="attr-value">${eff}</div>
        <div class="attr-half">半值:${Math.floor(eff/2)} 五分之一:${Math.floor(eff/5)}</div>
      </div>
    `;
  });
  html += `
      </div>
      <div style="text-align:center;margin-top:12px;">
        <div class="attr-item" style="display:inline-block;">
          <div class="attr-name">幸运值</div>
          <div class="attr-value">${state.luck}</div>
        </div>
      </div>
    </div>
  `;
  container.innerHTML = html;
  saveState();
}

// ----- Step 7: Background -----
// 背景条目十大类别
const BG_CATEGORIES_CREATABLE = ['形象描述', '思想与信念', '重要之人', '意义非凡之地', '宝贵之物', '特质'];
const BG_CATEGORIES_INGAME = ['创伤和疤痕', '恐惧症和躁狂症', '典籍、法术和神话造物', '第三类接触'];

// ===== Wiki 随机灵感表 =====
// 严格基于 investigator-creation.md 第140-266行的随机灵感表

// 辅助函数：从数组中随机选取
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// 辅助函数：从数组中随机选取 n 个不重复元素
function pickN(arr, n) {
  let shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// 辅助函数：生成随机人名（复用 steps-1to4.js 中的名字库）
function generateRandomPersonName() {
  const surnames = [
    '陈', '林', '张', '王', '李', '赵', '黄', '周', '吴', '徐',
    '孙', '胡', '朱', '高', '何', '郭', '马', '罗', '梁', '宋',
    '郑', '谢', '韩', '唐', '冯', '于', '董', '萧', '程', '曹',
    '袁', '邓', '许', '傅', '沈', '曾', '彭', '吕', '苏', '卢'
  ];
  const givenNames = [
    '怀安', '志远', '明德', '书恒', '承志', '天佑', '文彬', '景行',
    '逸尘', '子轩', '浩然', '思源', '一鸣', '鹏飞', '国栋', '家骏',
    '雅琴', '淑芬', '慧兰', '婉清', '静怡', '雪梅', '玉珍', '秀英',
    '若兰', '梦瑶', '心怡', '紫萱', '语嫣', '诗涵', '晓彤', '佳慧'
  ];
  return pick(surnames) + pick(givenNames);
}

// Wiki 随机灵感表数据
const BG_RANDOM_TABLES = {
  // ===== 形象描述：关键词矩阵（选择而非掷骰）=====
  appearance: {
    keywords: [
      '坚毅', '英俊', '笨拙', '漂亮', '迷人', '娃娃脸', '聪明', '邋遢', '迟钝',
      '肮脏', '引人瞩目', '书卷气', '年轻', '疲倦', '胖乎乎', '结实', '毛发旺盛',
      '苗条', '优雅', '衣着破旧', '矮壮', '脸色苍白', '阴沉', '平凡', '乐观',
      '晒黑', '皱纹', '古板', '羞怯', '机智', '强壮', '娇美', '肌肉发达', '魁梧', '虚弱'
    ],
    // 写作模板：明确、感性、着重
    templates: [
      (kws, gender) => `${gender}给人的第一印象是${kws.join('而')}。`,
      (kws, gender) => `一个${kws.join('、')}的${gender === '女' ? '女人' : gender === '男' ? '男人' : '人'}，走在人群中${kws.includes('引人瞩目') ? '格外显眼' : '并不起眼'}。`,
      (kws, gender) => `${gender}的外表可以用两个词概括：${kws[0]}和${kws[1]}。这种气质深入骨髓，无法伪装。`,
      (kws, gender) => `${kws[0]}——这是人们对${gender}最直观的评价。${kws.length > 1 ? `而那${kws[1]}的特质，只有在深入接触后才会被发现。` : ''}`,
    ],
  },

  // ===== 思想与信念：1D10 表 =====
  ideology: [
    { main: '崇拜一位大能', examples: ['毗湿奴', '耶稣', '海尔·塞拉西一世', '佛陀', '真主安拉'] },
    { main: '没有宗教', examples: ['坚定的无神论者', '人文主义者', '世俗论者', '不可知论者'] },
    { main: '科学终将解释一切', examples: ['进化论', '低温学', '空间探索', '量子力学'] },
    { main: '相信命运', examples: ['因果报应', '社会阶级', '迷信', '天命'] },
    { main: '协会或秘密结社的一员', examples: ['共济会', '妇女协会', '匿名者', '玫瑰十字会'] },
    { main: '社会上的罪恶应该被根除', examples: ['毒品', '暴力', '种族偏见', '腐败'] },
    { main: '神秘学', examples: ['占星术', '唯心论', '塔罗牌', '炼金术'] },
    { main: '政治', examples: ['保守派', '社会主义者', '自由主义者', '无政府主义者'] },
    { main: '"金钱就是力量"', examples: ['贪婪', '进取', '无情', '精明'] },
    { main: '活动家/积极分子', examples: ['女权主义', '权利平等', '工会权力', '环保运动'] },
  ],
  ideologyTemplates: [
    (main, example, gender) => `${gender}坚信${main}——${gender === '女' ? '她' : '他'}是一名${example}，并以此为人生信条。`,
    (main, example, gender) => `"${main}"——这是${gender}最常挂在嘴边的话。作为一名${example}，${gender === '女' ? '她' : '他'}愿意为此付出一切。`,
    (main, example, gender) => `尽管经历过许多动摇信念的事，${gender}依然是一名忠实的${example}。${gender === '女' ? '她' : '他'}深信${main}。`,
    (main, example, gender) => `${gender}的人生哲学可以用一句话概括：${main}。${gender === '女' ? '她' : '他'}以${example}的身份，在旁人眼中显得有些格格不入。`,
    (main, example, gender) => `在内心深处，${gender}是一名${example}。${main}——这种信念支撑着${gender === '女' ? '她' : '他'}度过了最黑暗的时光。`,
    (main, example, gender) => `${gender}并不经常谈论自己的信仰，但了解${gender === '女' ? '她' : '他'}的人都知道，${gender === '女' ? '她' : '他'}是一名${example}，坚信${main}。`,
  ],

  // ===== 重要之人：两步随机（是谁 + 为什么重要）=====
  significantPerson: {
    who: [
      { main: '父母', examples: ['母亲', '父亲', '继母', '继父'] },
      { main: '祖父母', examples: ['外祖母', '祖父', '外祖父', '祖母'] },
      { main: '兄弟姐妹', examples: ['兄弟', '异母或异父兄弟', '继姐妹', '姐姐'] },
      { main: '子女', examples: ['儿子', '女儿'] },
      { main: '伴侣', examples: ['配偶', '未婚夫', '恋人'] },
      { main: '教授你最高本职技能的人', examples: ['一位严厉的导师', '一位慈祥的老教授', '一位退伍军人', '一位手艺精湛的匠人'] },
      { main: '儿时的朋友', examples: ['同学', '邻居', '一起长大的发小'] },
      { main: '一位名人', examples: ['影星', '政客', '音乐家', '作家'] },
      { main: '游戏中的调查员同伴', examples: ['并肩作战的搭档', '值得信赖的战友', '亦师亦友的同行者'] },
      { main: '游戏中的NPC', examples: ['一位神秘的线人', '一位古怪的店主', '一位退休的侦探'] },
    ],
    why: [
      { main: '你感激他们', examples: ['在最困难的时候伸出援手', '无私地给予了帮助', '改变了你的人生轨迹'] },
      { main: '他们教会了你一些东西', examples: ['一项重要的技能', '为人处世的道理', '面对恐惧的勇气'] },
      { main: '他们赋予你生命的意义', examples: ['让你找到了活下去的理由', '给了你奋斗的目标', '让你明白了什么是真正重要的'] },
      { main: '你亏欠他们，想要寻求谅解', examples: ['曾经辜负了他们的信任', '在关键时刻选择了逃避', '说了无法收回的话'] },
      { main: '你们有着共同的经历', examples: ['一起经历过生死考验', '共同保守着一个秘密', '在同一场灾难中幸存'] },
      { main: '你希望向他们证明自己', examples: ['渴望得到认可', '想要证明自己配得上他们的期望', '不甘心被看低'] },
      { main: '你崇拜他们', examples: ['他们是你的精神支柱', '你以他们为榜样', '你渴望成为像他们一样的人'] },
      { main: '你感到后悔', examples: ['没有在最后时刻陪伴在侧', '没能说出口的话', '错失了和解的机会'] },
      { main: '你想证明自己比他们更好', examples: ['不甘心永远活在他们的阴影下', '想要超越他们的成就', '要让他们刮目相看'] },
      { main: '他们曾迫害过你，你想要报复', examples: ['毁掉了你的家庭', '夺走了你最珍贵的东西', '让你蒙受了不白之冤'] },
    ],
    templates: [
      (who, why, name, gender) => `${name}——${gender === '女' ? '她' : '他'}的${who}。${gender === '女' ? '她' : '他'}${why}。${name}在${gender === '女' ? '她' : '他'}心中占据着不可替代的位置。`,
      (who, why, name, gender) => `在${gender}的生命中，${name}是最重要的人。作为${gender === '女' ? '她' : '他'}的${who}，${name}${why}。${gender === '女' ? '她' : '他'}至今仍时常想起${name}。`,
      (who, why, name, gender) => `${gender}永远不会忘记${name}——${gender === '女' ? '她' : '他'}的${who}。${name}${why}。这段关系塑造了${gender}成为今天的自己。`,
      (who, why, name, gender) => `${name}是${gender === '女' ? '她' : '他'}的${who}。${gender === '女' ? '她' : '他'}${why}。每当夜深人静，${gender}总会想起${name}。`,
      (who, why, name, gender) => `${name}，${gender === '女' ? '她' : '他'}的${who}。${name}${why}。如果没有${name}，${gender}的人生可能会走向完全不同的方向。`,
    ],
  },

  // ===== 意义非凡之地：1D10 表 =====
  meaningfulPlace: [
    { main: '你学习的地方', examples: ['一所古老的大学', '一间乡村小学', '一所军事学院', '一所音乐学院'] },
    { main: '你的故乡', examples: ['一个偏远的小村庄', '一座繁华的大城市', '一个宁静的海滨小镇', '一个山间集镇'] },
    { main: '你邂逅初恋的地方', examples: ['一场露天音乐会', '一个度假胜地', '一个昏暗的防空洞', '一间咖啡馆'] },
    { main: '供你静思的地方', examples: ['一间堆满古籍的图书馆', '一条属于你的乡间步道', '一个安静的钓场', '一座教堂的钟楼'] },
    { main: '社交场所', examples: ['一家上流俱乐部', '一间当地酒吧', '叔叔家的宅子', '一间棋社'] },
    { main: '和你的思想与信念有关的地方', examples: ['城区教堂', '一座古老的寺庙', '一片神秘的巨石阵', '一间冥想室'] },
    { main: '重要之人的坟墓', examples: ['父母的合葬墓', '子女的墓碑', '恋人的安息之地', '导师的墓地'] },
    { main: '你的家', examples: ['一座乡间庄园', '一间狭小的出租公寓', '收养你长大的孤儿院', '一栋老旧的联排别墅'] },
    { main: '你一生中最幸福的时候所在的地方', examples: ['初吻时的公园长椅', '你的大学校园', '一个夏日的湖边', '一间充满笑声的厨房'] },
    { main: '你的工作场所', examples: ['一间繁忙的办公室', '一间古老的图书馆', '一家银行', '一间实验室'] },
  ],
  placeTemplates: [
    (main, example, gender) => `${example}——${main}。${gender === '女' ? '她' : '他'}在那里度过了最难忘的时光，那里的一切都历历在目。`,
    (main, example, gender) => `对${gender}来说，${example}不仅仅是一个地点。作为${main}，那里承载着${gender === '女' ? '她' : '他'}最深沉的记忆。`,
    (main, example, gender) => `${gender}经常梦到${example}。那是${main}，${gender === '女' ? '她' : '他'}知道总有一天必须回去。`,
    (main, example, gender) => `${example}，${main}。在${gender === '女' ? '她' : '他'}的心中，那里占据着无可替代的位置。`,
    (main, example, gender) => `${gender}曾发誓再也不回到${example}，但作为${main}，那里有着${gender === '女' ? '她' : '他'}无法割舍的回忆。`,
  ],

  // ===== 宝贵之物：1D10 表 =====
  treasuredPossession: [
    { main: '与你最高的技能有关的物品', examples: ['一把精密的手术刀', '一本写满公式的笔记本', '一台老旧的相机', '一套精致的绘图工具'] },
    { main: '职业的必备物品', examples: ['一个磨损的公文包', '一把万能钥匙', '一台便携式打字机', '一套听诊器'] },
    { main: '儿时的纪念品', examples: ['一只褪色的泰迪熊', '一枚弹珠', '一本童话书', '一只手工木雕'] },
    { main: '逝者的遗物', examples: ['父亲的怀表', '母亲的项链', '导师的钢笔', '战友的军牌'] },
    { main: '重要之人送你的东西', examples: ['一枚手工戒指', '一条围巾', '一本书', '一把钥匙'] },
    { main: '你的收藏品', examples: ['一套古币', '一组蝴蝶标本', '一排旧唱片', '一盒火柴盒'] },
    { main: '你找到的一些东西，但你并不知道它是什么', examples: ['一块刻有符文的黑色石头', '一枚来历不明的古老徽章', '一张写满未知文字的羊皮纸', '一个形状奇特的金属球'] },
    { main: '一件体育用品', examples: ['一只磨损的棒球手套', '一副拳击手套', '一根台球杆', '一只足球'] },
    { main: '一件武器', examples: ['一把老式左轮手枪', '一把猎刀', '一根手杖剑', '一把猎枪'] },
    { main: '一只宠物', examples: ['一只名叫"影子"的黑猫', '一只忠诚的老猎犬', '一只聪明的鹦鹉', '一只温顺的灰兔子'] },
  ],
  treasureTemplates: [
    (main, example, gender) => `${example}——${main}。${gender === '女' ? '她' : '他'}把它视为护身符，无论走到哪里都不会将它离身。`,
    (main, example, gender) => `${gender}随身携带着${example}。作为${main}，它是${gender === '女' ? '她' : '他'}最珍贵的财产。`,
    (main, example, gender) => `${example}。${main}——别人或许觉得它毫无价值，但对${gender}来说，它是无价之宝。`,
    (main, example, gender) => `${example}——${main}。${gender === '女' ? '她' : '他'}有时会在深夜拿出来端详，试图从中找到更多的意义。`,
    (main, example, gender) => `${example}。作为${main}，它承载着${gender === '女' ? '她' : '他'}无法割舍的情感。失去它，就等于失去了一部分自己。`,
  ],

  // ===== 特质：1D10 表 =====
  trait: [
    { main: '慷慨大方', examples: ['总是愿意为他人付出', '从不计较个人得失', '乐于分享自己拥有的一切'] },
    { main: '动物之友', examples: ['对任何动物都有着天然的亲和力', '总能赢得动物的信任', '家里收养了无数流浪动物'] },
    { main: '梦想家', examples: ['总是沉浸在自己的幻想世界中', '对未来有着美好的憧憬', '常常提出别人觉得不切实际的想法'] },
    { main: '享乐主义', examples: ['追求生活中的一切美好事物', '坚信人生苦短、及时行乐', '对美食、美酒和艺术有着无法抗拒的热爱'] },
    { main: '赌徒、敢于冒险', examples: ['在赌桌上和人生中都敢于押上一切', '越是危险的局面越能激发斗志', '相信运气总站在自己这边'] },
    { main: '料理能手', examples: ['能用最简单的食材做出令人惊叹的美食', '厨房是绝对的主场', '烹饪是缓解压力的最佳方式'] },
    { main: '万人迷', examples: ['无论走到哪里都是众人瞩目的焦点', '天生具有吸引他人的魅力', '只需一个微笑就能让人如沐春风'] },
    { main: '义薄云天', examples: ['为了朋友可以两肋插刀', '信守承诺胜过一切', '正义感是行动的唯一准则'] },
    { main: '名声在外', examples: ['在某个圈子里无人不知', '名字本身就是一张通行证', '声名远播，但并非总是好的名声'] },
    { main: '野心勃勃', examples: ['有着远超常人的抱负和决心', '不满足于现状，永远在追求更高', '愿意为了目标付出任何代价'] },
  ],
  traitTemplates: [
    (main, example, gender) => `${gender}最大的特质是${main}——${example}。这种特质让${gender === '女' ? '她' : '他'}在人群中脱颖而出。`,
    (main, example, gender) => `最了解${gender}的人都会提到${gender === '女' ? '她' : '他'}的${main}。${example}。这既是${gender === '女' ? '她' : '他'}最大的优点，也是最显著的特征。`,
    (main, example, gender) => `${main}——这是${gender}最显著的特征。${example}。从很小的时候起，这种特质就伴随着${gender === '女' ? '她' : '他'}。`,
    (main, example, gender) => `${gender}并不认为${main}有什么特别，但身边的人都能感受到。${example}。在旁人看来，这或许微不足道，但对${gender === '女' ? '她' : '他'}来说，这是定义自己的东西。`,
    (main, example, gender) => `如果有人问起${gender}最大的特点，答案一定是${main}。${example}。${gender === '女' ? '她' : '他'}有时分不清这究竟是天赋还是诅咒。`,
  ],
};

// ===== 基于随机灵感表的背景生成函数 =====
function generateBackground(category) {
  const gender = state.gender || '男';
  const genderTitle = gender === '女' ? '她' : '他';

  switch (category) {
    case '形象描述': {
      const table = BG_RANDOM_TABLES.appearance;
      // 从关键词矩阵中随机选 1-2 个关键词
      const count = Math.random() < 0.5 ? 1 : 2;
      const keywords = pickN(table.keywords, count);
      const template = pick(table.templates);
      return template(keywords, genderTitle);
    }

    case '思想与信念': {
      const table = BG_RANDOM_TABLES.ideology;
      const entry = pick(table);
      const example = pick(entry.examples);
      const template = pick(BG_RANDOM_TABLES.ideologyTemplates);
      return template(entry.main, example, genderTitle);
    }

    case '重要之人': {
      const table = BG_RANDOM_TABLES.significantPerson;
      const whoEntry = pick(table.who);
      const whyEntry = pick(table.why);
      const whoExample = pick(whoEntry.examples);
      const whyExample = pick(whyEntry.examples);
      const name = generateRandomPersonName();
      const who = whoEntry.main === '教授你最高本职技能的人' ? whoExample : `${whoExample}（${whoEntry.main}）`;
      const why = `${whyEntry.main}——${whyExample}`;
      const template = pick(table.templates);
      return template(who, why, name, genderTitle);
    }

    case '意义非凡之地': {
      const table = BG_RANDOM_TABLES.meaningfulPlace;
      const entry = pick(table);
      const example = pick(entry.examples);
      const template = pick(BG_RANDOM_TABLES.placeTemplates);
      return template(entry.main, example, genderTitle);
    }

    case '宝贵之物': {
      const table = BG_RANDOM_TABLES.treasuredPossession;
      const entry = pick(table);
      const example = pick(entry.examples);
      const template = pick(BG_RANDOM_TABLES.treasureTemplates);
      return template(entry.main, example, genderTitle);
    }

    case '特质': {
      const table = BG_RANDOM_TABLES.trait;
      const entry = pick(table);
      const example = pick(entry.examples);
      const template = pick(BG_RANDOM_TABLES.traitTemplates);
      return template(entry.main, example, genderTitle);
    }

    default:
      return '';
  }
}

function addBackgroundItem(category) {
  // 检查是否已有同类别条目
  let exists = state.background.some(item => item.category === category);
  if (exists) {
    notify('该类别已存在，请先移除后再添加', 'error');
    return;
  }
  let content = generateBackground(category);
  state.background.push({ category, content, isKey: false });
  saveState();
  renderStep();
}

function removeBackgroundItem(idx) {
  if (idx < 0 || idx >= state.background.length) return;
  let removed = state.background.splice(idx, 1)[0];
  // 如果移除的是关键连接，重置索引
  if (state.keyConnection === idx) {
    state.keyConnection = -1;
  } else if (state.keyConnection > idx) {
    state.keyConnection--;
  }
  saveState();
  renderStep();
}

function randomizeBackgroundItem(idx) {
  if (idx < 0 || idx >= state.background.length) return;
  let item = state.background[idx];
  item.content = generateBackground(item.category);
  saveState();
  renderStep();
}

function setKeyConnection(idx) {
  if (idx < 0 || idx >= state.background.length) return;
  // 切换：如果已经是关键连接，则取消
  if (state.keyConnection === idx) {
    state.background[idx].isKey = false;
    state.keyConnection = -1;
  } else {
    // 取消之前的关键连接
    if (state.keyConnection >= 0 && state.keyConnection < state.background.length) {
      state.background[state.keyConnection].isKey = false;
    }
    state.background[idx].isKey = true;
    state.keyConnection = idx;
  }
  saveState();
  renderStep();
}

function updateBackgroundContent(idx, content) {
  if (idx < 0 || idx >= state.background.length) return;
  state.background[idx].content = content;
  saveState();
}

function updateIngameBackground(category, value) {
  let idx = state.background.findIndex(item => item.category === category);
  if (idx >= 0) {
    state.background[idx].content = value;
  } else if (value.trim()) {
    state.background.push({ category, content: value, isKey: false });
  }
  saveState();
}

function renderStep7(container) {
  // 首次进入时自动为前6项生成随机背景（玩家可移除不想要的）
  if (state.background.length === 0) {
    BG_CATEGORIES_CREATABLE.forEach(cat => {
      state.background.push({
        category: cat,
        content: generateBackground(cat),
        isKey: false
      });
    });
    saveState();
  }

  let html = `
    <div class="card">
      <div class="card-title"><span class="icon">&#9997;</span> 创造背景</div>
      <p class="section-desc">
        考虑调查员的背景，写下简练的背景条目。没有必要为每个类别都填写，但设定的越多，调查员就越生动。
        试着在前六项中填写至少一个条目。在游戏期间，你可能将获取新的条目，现有的条目也可能发生改变。
      </p>

      <div class="bg-roles">
        <div class="bg-role">
          <div class="bg-role-title">&#127917; 引导角色扮演</div>
          <div class="bg-role-desc">这些简练的描述可以引导你进行角色扮演，有助于定义你的调查员，并提示角色与世界的联系。考虑角色的过去、朋友、敌人和成就。</div>
        </div>
        <div class="bg-role">
          <div class="bg-role-title">&#128151; 恢复理智值</div>
          <div class="bg-role-desc">在调查员幕间成长时，背景条目可以用来恢复理智值。</div>
        </div>
        <div class="bg-role">
          <div class="bg-role-title">&#128128; 腐化映射</div>
          <div class="bg-role-desc">调查员背景的腐化映射出理智的日益损耗与神话知识的不断增长。当调查员陷入疯狂或受到重伤，守秘人将可以添加或修改背景条目。</div>
        </div>
      </div>

      <div class="bg-section-title">创建时填写</div>
      <div class="bg-category-grid">
  `;

  // 渲染前6个可创建的类别
  BG_CATEGORIES_CREATABLE.forEach(cat => {
    let existingIdx = state.background.findIndex(item => item.category === cat);
    let isAdded = existingIdx >= 0;
    let isKey = isAdded && state.background[existingIdx].isKey;

    html += `<div class="bg-category-card ${isAdded ? 'bg-card-added' : ''} ${isKey ? 'bg-card-key' : ''}">`;
    html += `<div class="bg-card-header">
      <span class="bg-cat-name">${cat}</span>`;
    if (isKey) {
      html += `<span class="bg-key-badge">&#11088; 关键连接</span>`;
    }
    html += `</div>`;

    if (isAdded) {
      let item = state.background[existingIdx];
      html += `<div class="bg-card-content">
        <textarea class="bg-textarea" rows="3"
          oninput="updateBackgroundContent(${existingIdx}, this.value)">${item.content}</textarea>
        <div class="bg-card-actions">
          <button class="btn btn-sm btn-secondary" onclick="randomizeBackgroundItem(${existingIdx})">&#127922; 重新随机</button>
          <button class="btn btn-sm ${isKey ? 'btn-warning' : 'btn-outline'}" onclick="setKeyConnection(${existingIdx})">${isKey ? '&#11088; 取消关键连接' : '&#11088; 设为关键连接'}</button>
          <button class="btn btn-sm btn-danger-outline" onclick="removeBackgroundItem(${existingIdx})">&#10005; 移除</button>
        </div>
      </div>`;
    } else {
      html += `<div class="bg-card-placeholder">
        <p>尚未添加</p>
        <button class="btn btn-sm btn-accent" onclick="addBackgroundItem('${cat}')">&#10010; 添加此项</button>
      </div>`;
    }
    html += `</div>`;
  });

  html += `</div>`;

  // 渲染后4个游戏过程中添加的类别
  html += `
      <div class="bg-section-title" style="margin-top:20px;">
        游戏过程中添加
        <span class="bg-section-hint">（由守秘人在游戏中引导添加）</span>
      </div>
      <div class="bg-ingame-list">
  `;

  BG_CATEGORIES_INGAME.forEach(cat => {
    let existingIdx = state.background.findIndex(item => item.category === cat);
    let isAdded = existingIdx >= 0;
    let isKey = isAdded && state.background[existingIdx].isKey;

    html += `<div class="bg-ingame-item ${isAdded ? 'bg-card-added' : ''} ${isKey ? 'bg-card-key' : ''}">
      <div class="bg-ingame-header" onclick="this.parentElement.classList.toggle('bg-ingame-expanded')">
        <span class="bg-cat-name">${cat}</span>
        <span class="bg-toggle-icon">&#9654;</span>
      </div>
      <div class="bg-ingame-content">
        <textarea class="bg-textarea" rows="2" placeholder="游戏过程中填写…"
          oninput="updateIngameBackground('${cat}', this.value)">${isAdded ? state.background[existingIdx].content : ''}</textarea>
      </div>
    </div>`;
  });

  html += `</div>`;

  // 关键连接提示
  let keyItem = state.keyConnection >= 0 ? state.background[state.keyConnection] : null;
  html += `
      <div class="bg-key-connection-info">
        <div class="bg-key-title">&#11088; 关键背景连接</div>
        ${keyItem
          ? `<p>当前关键连接：<strong>[${keyItem.category}] ${keyItem.content}</strong></p>
             <p class="bg-key-hint">关键连接是高于一切、为调查员的人生赋予意义的重要事物。它可以帮助调查员恢复理智值。守秘人在玩家有机会以某种方式为保护其调查员的关键连接进行掷骰之前，不能摧毁、杀死或移除调查员的关键连接。</p>`
          : `<p class="bg-key-hint">请从已添加的背景条目中选出一条最重要的作为关键连接——高于一切，为调查员的人生赋予意义的重要事物。在角色卡上用星号标注出来。</p>`
        }
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// ----- Step 8: Final Character Sheet -----
function renderStep8(container) {
  calcDerived();
  let attrs = getEffectiveAttrs();
  let d = state.derived;

  let html = `
    <div class="char-sheet">
      <div class="char-sheet-header">
        <div>
          <div class="char-name editable" contenteditable="true"
            oninput="state.name=this.textContent;saveState()">${state.name || '未命名调查员'}</div>
          <div class="char-meta">
            年龄: <span class="editable" contenteditable="true"
              oninput="state.age=parseInt(this.textContent)||25;saveState();recalcAndRender()">${state.age}</span> |
            性别: <span class="editable" contenteditable="true"
              oninput="state.gender=this.textContent;saveState()">${state.gender}</span> |
            时代: <span class="editable" contenteditable="true"
              oninput="state.era=this.textContent;saveState()">${state.era}</span>
          </div>
          <div class="char-meta">
            职业: <span style="color:var(--gold);">${state.occupation ? state.occupation.name : '未选择'}</span> |
            信用评级: <span class="editable" contenteditable="true"
              oninput="state.creditRating=parseInt(this.textContent)||0;saveState()">${state.creditRating}</span>
          </div>
        </div>
      </div>

      <div class="char-sheet-section">
        <h3>&#9874; 属性</h3>
        <div class="attr-grid">
  `;
  ['STR','CON','SIZ','DEX','APP','INT','POW','EDU'].forEach(k => {
    html += `
      <div class="attr-item">
        <div class="attr-name">${k}</div>
        <div class="attr-value editable" contenteditable="true"
          oninput="state.rawAttrs['${k}']=clamp(parseInt(this.textContent)||0,0,99);saveState();recalcAndRender()">${attrs[k]}</div>
        <div class="attr-half">半值:${Math.floor(attrs[k]/2)} 五分之一:${Math.floor(attrs[k]/5)}</div>
      </div>
    `;
  });
  html += `
        </div>
        <div style="text-align:center;margin-top:12px;">
          <div class="attr-item" style="display:inline-block;">
            <div class="attr-name">幸运值</div>
            <div class="attr-value editable" contenteditable="true"
              oninput="state.luck=clamp(parseInt(this.textContent)||0,0,99);saveState()">${state.luck}</div>
          </div>
        </div>
      </div>

      <div class="char-sheet-section">
        <h3>&#9829; 衍生属性</h3>
        <div class="derived-grid">
          <div class="derived-item"><div class="d-name">HP</div><div class="d-value">${d.HP}</div></div>
          <div class="derived-item"><div class="d-name">MP</div><div class="d-value">${d.MP}</div></div>
          <div class="derived-item"><div class="d-name">SAN</div><div class="d-value">${d.SAN}</div></div>
          <div class="derived-item"><div class="d-name">DB</div><div class="d-value">${d.DB}</div></div>
          <div class="derived-item"><div class="d-name">体格</div><div class="d-value">${d.build}</div></div>
          <div class="derived-item"><div class="d-name">MOV</div><div class="d-value">${d.MOV}</div></div>
          <div class="derived-item"><div class="d-name">闪避</div><div class="d-value">${d.dodge}</div></div>
          <div class="derived-item"><div class="d-name">母语</div><div class="d-value">${d.language}</div></div>
        </div>
      </div>

      <div class="char-sheet-section">
        <h3>&#9998; 技能</h3>
  `;

  const categories = getDisplaySkillCategories();

  // 收集自由输入型专精技能
  let freeFormSkills = [];
  for (let sk in state.skillPoints) {
    let pts = state.skillPoints[sk];
    if ((pts.occ > 0 || pts.int > 0) && isSpecialtySkill(sk)) {
      let parent = getParentFromSpecialty(sk);
      if (parent && SPECIALTY_MAP[parent] && SPECIALTY_MAP[parent].freeForm) {
        freeFormSkills.push(sk);
      }
    }
  }

  categories.forEach(cat => {
    let hasPoints = cat.skills.some(name => {
      let pts = state.skillPoints[name] || { occ: 0, int: 0 };
      return pts.occ > 0 || pts.int > 0 || isOccupationalSkill(name);
    });
    if (!hasPoints) return;
    html += `<div class="skill-category">
      <div class="skill-category-title">${cat.title}</div>
      <table class="skill-table">
        <tr><th>技能</th><th>基础</th><th>职业</th><th>兴趣</th><th>总计</th></tr>
    `;
    cat.skills.forEach(name => {
      let base = getSkillBase(name, attrs);
      let isOcc = isOccupationalSkill(name);
      let pts = state.skillPoints[name] || { occ: 0, int: 0 };
      let total = base + pts.occ + pts.int;
      if (total === base && !isOcc && pts.occ === 0 && pts.int === 0) return;
      html += `<tr>
        <td class="skill-name">${name} ${isOcc ? '<span class="tag-occ">职</span>' : ''}</td>
        <td class="skill-base">${base}</td>
        <td class="skill-occ">${pts.occ > 0 ? '+' + pts.occ : ''}</td>
        <td class="skill-pts">${pts.int > 0 ? '+' + pts.int : ''}</td>
        <td class="skill-total editable" contenteditable="true"
          oninput="updateFinalSkill('${name}',this.textContent)">${total}</td>
      </tr>`;
    });
    html += `</table></div>`;
  });

  // 渲染自由输入型专精技能
  if (freeFormSkills.length > 0) {
    html += `<div class="skill-category">
      <div class="skill-category-title">自定义专精技能</div>
      <table class="skill-table">
        <tr><th>技能</th><th>基础</th><th>职业</th><th>兴趣</th><th>总计</th></tr>
    `;
    freeFormSkills.forEach(name => {
      let base = getSkillBase(name, attrs);
      let isOcc = isOccupationalSkill(name);
      let pts = state.skillPoints[name] || { occ: 0, int: 0 };
      let total = base + pts.occ + pts.int;
      html += `<tr>
        <td class="skill-name">${name} ${isOcc ? '<span class="tag-occ">职</span>' : ''}</td>
        <td class="skill-base">${base}</td>
        <td class="skill-occ">${pts.occ > 0 ? '+' + pts.occ : ''}</td>
        <td class="skill-pts">${pts.int > 0 ? '+' + pts.int : ''}</td>
        <td class="skill-total editable" contenteditable="true"
          oninput="updateFinalSkill('${name}',this.textContent)">${total}</td>
      </tr>`;
    });
    html += `</table></div>`;
  }

  html += `</div>`;

  // Background
  let bgEntries = state.background.filter(b => b.content && b.content.trim());
  if (bgEntries.length > 0) {
    html += `
      <div class="char-sheet-section">
        <h3>&#9997; 背景故事</h3>
    `;
    state.background.forEach((item, idx) => {
      if (item.content && item.content.trim()) {
        let prefix = idx === state.keyConnection ? '&#11088; ' : '';
        let keyClass = idx === state.keyConnection ? 'bg-final-key' : '';
        html += `<div class="${keyClass}" style="margin-bottom:8px;padding:6px 10px;background:var(--input-bg);border-radius:4px;">
          <span class="editable" contenteditable="true"
            oninput="updateBackgroundContent(${idx}, this.textContent)">${prefix}[${item.category}] ${item.content}</span>
        </div>`;
      }
    });
    html += `</div>`;
  }

  html += `</div>`;
  container.innerHTML = html;
  state.completed = true;
  saveState();
}

function updateFinalSkill(name, val) {
  let newTotal = parseInt(val) || 0;
  let attrs = getEffectiveAttrs();
  let base = getSkillBase(name, attrs);
  let pts = state.skillPoints[name] || { occ: 0, int: 0 };
  let currentTotal = base + pts.occ + pts.int;
  let diff = newTotal - currentTotal;
  // Apply diff to interest points
  if (!state.skillPoints[name]) state.skillPoints[name] = { occ: 0, int: 0 };
  state.skillPoints[name].int = Math.max(0, pts.int + diff);
  saveState();
}

function recalcAndRender() {
  calcDerived();
  renderStep();
}
