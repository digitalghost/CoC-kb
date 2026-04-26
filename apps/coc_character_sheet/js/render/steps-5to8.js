// 步骤5-9渲染 - Steps 5-9 Rendering
// 包含函数:
//   - renderStep5(container)        步骤5：技能点分配（职业/兴趣技能点）
//   - updateSkillPoint(name, type, val)  更新技能点分配
//   - renderStep7(container)        步骤6：背景故事（十大类别背景条目 + 关键连接）
//   - generateBackground(category)  为指定类别生成随机背景内容
//   - addBackgroundItem(category)   添加一个背景条目
//   - removeBackgroundItem(idx)     移除一个背景条目
//   - randomizeBackgroundItem(idx)  重新随机生成某个条目
//   - setKeyConnection(idx)         设置/取消关键连接
//   - updateBackgroundContent(idx, content) 更新背景条目内容
//   - renderStep8(container)        步骤8：决定装备（信用评级现金、物品搜索、花费追踪）
//   - addEquipment(name, price, type)  添加物品
//   - removeEquipment(idx)          移除物品
//   - renderEquipmentSuggestions(query) 渲染搜索建议
//   - getCreditRatingInfo()         根据信用评级获取现金和资产信息
//   - renderStep9(container)        步骤9：最终角色卡（可编辑的综合视图）
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

  // Render skill categories - 使用专精展开格式（已包含自由输入型专精）
  const categories = getDisplaySkillCategories();

  categories.forEach(cat => {
    // 空的专攻分类（如"学识"未被选择任何子技能）不显示
    if (cat.skills.length === 0) return;
    // 专攻分类标题：强调父技能名，弱化"专攻"二字
    let titleHtml;
    if (cat.parentName) {
      titleHtml = `<span class="cat-parent-name">${cat.parentName}</span><span class="cat-suffix">专攻</span>`;
    } else {
      titleHtml = cat.title;
    }
    html += `<div class="skill-category">
      <div class="skill-category-title" onclick="this.nextElementSibling.classList.toggle('hidden')">
        ${titleHtml} <span class="toggle">&#9660;</span>
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
      // 专攻分类中技能名只显示子名（去掉父技能前缀）
      let displayName = name;
      if (cat.parentName && name.startsWith(cat.parentName + '(') && name.endsWith(')')) {
        displayName = name.slice(cat.parentName.length + 1, -1);
      }
      // 非职业技能的职业点滑块禁用（wiki 规则：本职技能点只能投入职业技能）
      let occSlider = isOcc
        ? makeSkillSlider(name, 'occ', pts.occ, base)
        : `<span class="slider-disabled">—</span>`;
      html += `<tr data-skill="${name}">
        <td class="skill-name">${displayName} ${occTag}</td>
        <td class="skill-base">${base}</td>
        <td>${occSlider}</td>
        <td>${makeSkillSlider(name,'int',pts.int,base)}</td>
        <td><div class="check-cell-inline">
          <div class="ck-main">${total}</div>
          <div class="ck-half">${Math.floor(total/2)}</div>
          <div class="ck-fifth">${Math.floor(total/5)}</div>
        </div></td>
      </tr>`;
    });
    html += `</table></div>`;
  });

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
    <input class="slider-val" type="text" inputmode="numeric" value="${value}"
      onfocus="this.select()"
      onblur="sliderInputCommit(this)"
      onkeydown="if(event.key==='Enter'){this.blur();event.preventDefault();}">
    <span class="slider-btn slider-inc"
      onmousedown="sliderHoldStart(event,1)"
      ontouchstart="sliderHoldStart(event,1)">+</span>
  </div>`;
}

// 用户直接输入数字后提交
function sliderInputCommit(inputEl) {
  let sliderEl = inputEl.closest('.skill-slider');
  if (!sliderEl) return;
  let skillName = sliderEl.dataset.skill;
  let type = sliderEl.dataset.type;
  let raw = inputEl.value.replace(/[^0-9]/g, '');
  let val = parseInt(raw) || 0;
  // 还原为合法值后更新
  updateSkillPoint(skillName, type, val);
  // 同步显示
  inputEl.value = state.skillPoints[skillName][type];
  // 更新该行总计（check-cell 组件）
  let row = sliderEl.closest('tr');
  if (row) {
    let base = parseInt(sliderEl.dataset.base) || 0;
    let total = base + state.skillPoints[skillName].occ + state.skillPoints[skillName].int;
    let ckMain = row.querySelector('.ck-main');
    let ckHalf = row.querySelector('.ck-half');
    let ckFifth = row.querySelector('.ck-fifth');
    if (ckMain) ckMain.textContent = total;
    if (ckHalf) ckHalf.textContent = Math.floor(total / 2);
    if (ckFifth) ckFifth.textContent = Math.floor(total / 5);
  }
  updatePointsDisplay();
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
  // 本职技能点只能投入到职业技能（wiki 规则）
  if (type === 'occ' && !isOccupationalSkill(skillName)) return;
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
  if (valEl) valEl.value = newVal;
  // 更新该行的总计（check-cell 组件）
  let row = el.closest('tr');
  if (row) {
    let total = base + state.skillPoints[skillName].occ + state.skillPoints[skillName].int;
    let ckMain = row.querySelector('.ck-main');
    let ckHalf = row.querySelector('.ck-half');
    let ckFifth = row.querySelector('.ck-fifth');
    if (ckMain) ckMain.textContent = total;
    if (ckHalf) ckHalf.textContent = Math.floor(total / 2);
    if (ckFifth) ckFifth.textContent = Math.floor(total / 5);
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
  // 本职技能点只能投入到职业技能（wiki 规则）
  if (type === 'occ' && !isOccupationalSkill(name)) return;
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

// 辅助函数：生成随机人名（1920年代新英格兰风格，中文音译）
function generateRandomPersonName() {
  const firstNames = [
    '亨利', '查尔斯', '爱德华', '乔治', '詹姆斯', '威廉', '罗伯特', '托马斯',
    '亚瑟', '弗朗西斯', '阿尔伯特', '弗雷德里克', '赫伯特', '沃尔特', '哈罗德', '塞缪尔',
    '霍华德', '理查德', '欧内斯特', '雷蒙德', '拉尔夫', '埃德温', '克拉伦斯', '珀西',
    '阿格尼丝', '爱丽丝', '克拉拉', '多萝西', '埃莉诺', '伊丽莎白', '弗洛伦丝', '格蕾丝',
    '海伦', '艾琳', '玛格丽特', '玛莎', '米尔德丽德', '罗丝', '露丝', '维奥莱特',
    '凯瑟琳', '莉莲', '伊迪丝', '碧翠丝', '康斯坦丝', '哈丽雅特', '约瑟芬'
  ];
  const lastNames = [
    '哈特韦尔', '布莱克伍德', '马洛', '惠特莫尔', '卡特', '辛克莱', '阿什沃思',
    '温斯洛', '哈格罗夫', '斯特林', '彭伯顿', '桑顿', '克劳福德', '莫里森',
    '黑斯廷斯', '普雷斯科特', '兰福德', '奥尔德里奇', '蒙塔古', '惠特菲尔德', '万斯',
    '布拉德利', '霍洛韦', '克雷文', '马什', '吉尔曼', '德比', '皮克曼',
    '阿米蒂奇', '赖斯', '摩根', '沃伦', '道格拉斯', '格雷', '查普曼', '弗莱彻',
    '赖特', '亨特', '考特', '弗林德斯', '霍布豪斯', '怀亚特', '斯通'
  ];
  return pick(firstNames) + ' ' + pick(lastNames);
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
    templates: [
      (kws, gt) => `${gt}给人的第一印象是${kws.join('而')}。`,
      (kws, gt) => `一个${kws.join('、')}的${gt}，走在人群中${kws.includes('引人瞩目') ? '格外显眼' : '并不起眼'}。`,
      (kws, gt) => `${gt}的外表可以用两个词概括：${kws[0]}和${kws[1]}。这种气质深入骨髓，无法伪装。`,
      (kws, gt) => `${kws[0]}——这是人们对${gt}最直观的评价。${kws.length > 1 ? `而那${kws[1]}的特质，只有在深入接触后才会被发现。` : ''}`,
    ],
  },

  // ===== 思想与信念：1D10 表 =====
  ideology: [
    { main: '崇拜一位大能', examples: ['毗湿奴', '耶稣', '海尔·塞拉西一世', '佛陀', '真主安拉'] },
    { main: '没有宗教信仰', examples: ['坚定的无神论者', '人文主义者', '世俗论者', '不可知论者'] },
    { main: '科学终将解释一切', examples: ['进化论', '低温学', '空间探索', '量子力学'] },
    { main: '相信命运', examples: ['因果报应', '社会阶级', '迷信', '天命'] },
    { main: '协会或秘密结社的一员', examples: ['共济会', '妇女协会', '匿名者', '玫瑰十字会'] },
    { main: '社会上的罪恶应该被根除', examples: ['毒品', '暴力', '种族偏见', '腐败'] },
    { main: '神秘学', examples: ['占星术', '唯心论', '塔罗牌', '炼金术'] },
    { main: '政治', examples: ['保守派', '社会主义者', '自由主义者', '无政府主义者'] },
    { main: '金钱就是力量', examples: ['贪婪', '进取', '无情', '精明'] },
    { main: '活动家', examples: ['女权主义', '权利平等', '工会权力', '环保运动'] },
  ],
  ideologyTemplates: [
    (main, example, gt) => `${gt}坚信${main}——作为一名${example}，这构成了${gt}最核心的人生信条。`,
    (main, example, gt) => `"${main}"——这是${gt}最常挂在嘴边的话。作为一名${example}，${gt}愿意为此付出一切。`,
    (main, example, gt) => `尽管经历过许多动摇信念的事，${gt}依然是一名忠实的${example}，深信${main}。`,
    (main, example, gt) => `${gt}的人生哲学可以用一句话概括：${main}。作为一名${example}，${gt}在旁人眼中显得有些格格不入。`,
    (main, example, gt) => `在内心深处，${gt}是一名${example}。${main}——这种信念支撑着${gt}度过了最黑暗的时光。`,
    (main, example, gt) => `${gt}并不经常谈论自己的信仰，但了解${gt}的人都知道，${gt}坚信${main}，是一名虔诚的${example}。`,
  ],

  // ===== 重要之人：两步随机（是谁 + 为什么重要）=====
  significantPerson: {
    who: [
      { main: '父母', examples: ['母亲', '父亲', '继母', '继父'] },
      { main: '祖父母', examples: ['外祖母', '祖父', '外祖父', '祖母'] },
      { main: '兄弟姐妹', examples: ['兄弟', '异母兄弟', '继姐妹', '姐姐'] },
      { main: '子女', examples: ['儿子', '女儿'] },
      { main: '伴侣', examples: ['配偶', '未婚夫', '恋人'] },
      { main: '教授自己最高本职技能的导师', examples: ['一位严厉的导师', '一位慈祥的老教授', '一位退伍军人', '一位手艺精湛的匠人'] },
      { main: '儿时的朋友', examples: ['同学', '邻居', '一起长大的发小'] },
      { main: '一位名人', examples: ['影星', '政客', '音乐家', '作家'] },
      { main: '调查员同伴', examples: ['并肩作战的搭档', '值得信赖的战友', '亦师亦友的同行者'] },
      { main: '一位NPC', examples: ['一位神秘的线人', '一位古怪的店主', '一位退休的侦探'] },
    ],
    why: [
      { main: '感激', examples: ['在最困难的时候伸出援手', '无私地给予了帮助', '改变了自己的人生轨迹'] },
      { main: '教会了自己一些东西', examples: ['一项重要的技能', '为人处世的道理', '面对恐惧的勇气'] },
      { main: '赋予了自己生命的意义', examples: ['让自己找到了活下去的理由', '给了自己奋斗的目标', '让自己明白了什么是真正重要的'] },
      { main: '亏欠，想要寻求谅解', examples: ['曾经辜负了信任', '在关键时刻选择了逃避', '说了无法收回的话'] },
      { main: '有着共同的经历', examples: ['一起经历过生死考验', '共同保守着一个秘密', '在同一场灾难中幸存'] },
      { main: '希望向对方证明自己', examples: ['渴望得到认可', '想要证明自己配得上期望', '不甘心被看低'] },
      { main: '崇拜', examples: ['是自己的精神支柱', '以对方为榜样', '渴望成为像对方一样的人'] },
      { main: '感到后悔', examples: ['没有在最后时刻陪伴在侧', '没能说出口的话', '错失了和解的机会'] },
      { main: '想证明自己比对方更好', examples: ['不甘心永远活在对方的阴影下', '想要超越对方的成就', '要让对方刮目相看'] },
      { main: '曾迫害过自己，想要报复', examples: ['毁掉了自己的家庭', '夺走了自己最珍贵的东西', '让自己蒙受了不白之冤'] },
    ],
    templates: [
      (who, why, name, gt) => `${name}是${gt}的${who}。${gt}对${name}充满${why}。${name}在${gt}心中占据着不可替代的位置。`,
      (who, why, name, gt) => `在${gt}的生命中，${name}是最重要的人。作为${gt}的${who}，${name}让${gt}${why}。${gt}至今仍时常想起${name}。`,
      (who, why, name, gt) => `${gt}永远不会忘记${name}——${gt}的${who}。${name}让${gt}${why}。这段关系塑造了${gt}成为今天的自己。`,
      (who, why, name, gt) => `${name}，${gt}的${who}。${gt}对${name}${why}。每当夜深人静，${gt}总会想起${name}。`,
      (who, why, name, gt) => `${name}是${gt}的${who}。${gt}对${name}${why}。如果没有${name}，${gt}的人生可能会走向完全不同的方向。`,
    ],
  },

  // ===== 意义非凡之地：1D10 表 =====
  meaningfulPlace: [
    { main: '学习的地方', examples: ['一所古老的大学', '一间乡村小学', '一所军事学院', '一所音乐学院'] },
    { main: '故乡', examples: ['一个偏远的小村庄', '一座繁华的大城市', '一个宁静的海滨小镇', '一个山间集镇'] },
    { main: '邂逅初恋的地方', examples: ['一场露天音乐会', '一个度假胜地', '一个昏暗的防空洞', '一间咖啡馆'] },
    { main: '供自己静思的地方', examples: ['一间堆满古籍的图书馆', '一条属于你的乡间步道', '一个安静的钓场', '一座教堂的钟楼'] },
    { main: '常去的社交场所', examples: ['一家上流俱乐部', '一间当地酒吧', '叔叔家的宅子', '一间棋社'] },
    { main: '和思想与信念有关的地方', examples: ['城区教堂', '一座古老的寺庙', '一片神秘的巨石阵', '一间冥想室'] },
    { main: '重要之人的安息之地', examples: ['父母的合葬墓', '子女的墓碑', '恋人的安息之地', '导师的墓地'] },
    { main: '家', examples: ['一座乡间庄园', '一间狭小的出租公寓', '收养自己长大的孤儿院', '一栋老旧的联排别墅'] },
    { main: '一生中最幸福时刻所在的地方', examples: ['初吻时的公园长椅', '大学校园', '一个夏日的湖边', '一间充满笑声的厨房'] },
    { main: '工作场所', examples: ['一间繁忙的办公室', '一间古老的图书馆', '一家银行', '一间实验室'] },
  ],
  placeTemplates: [
    (main, example, gt) => `${example}——${gt}的${main}。${gt}在那里度过了最难忘的时光，那里的一切都历历在目。`,
    (main, example, gt) => `对${gt}来说，${example}不仅仅是一个地点。作为${gt}的${main}，那里承载着${gt}最深沉的记忆。`,
    (main, example, gt) => `${gt}经常梦到${example}。那是${gt}的${main}，${gt}知道总有一天必须回去。`,
    (main, example, gt) => `${example}，${gt}的${main}。在${gt}的心中，那里占据着无可替代的位置。`,
    (main, example, gt) => `${gt}曾发誓再也不回到${example}，但作为${gt}的${main}，那里有着${gt}无法割舍的回忆。`,
  ],

  // ===== 宝贵之物：1D10 表 =====
  treasuredPossession: [
    { main: '与最高技能有关的物品', examples: ['一把精密的手术刀', '一本写满公式的笔记本', '一台老旧的相机', '一套精致的绘图工具'] },
    { main: '职业必备物品', examples: ['一个磨损的公文包', '一把万能钥匙', '一台便携式打字机', '一套听诊器'] },
    { main: '儿时的纪念品', examples: ['一只褪色的泰迪熊', '一枚弹珠', '一本童话书', '一只手工木雕'] },
    { main: '逝者的遗物', examples: ['父亲的怀表', '母亲的项链', '导师的钢笔', '战友的军牌'] },
    { main: '重要之人赠送的礼物', examples: ['一枚手工戒指', '一条围巾', '一本书', '一把钥匙'] },
    { main: '自己的收藏品', examples: ['一套古币', '一组蝴蝶标本', '一排旧唱片', '一盒火柴盒'] },
    { main: '找到的神秘物品', examples: ['一块刻有符文的黑色石头', '一枚来历不明的古老徽章', '一张写满未知文字的羊皮纸', '一个形状奇特的金属球'] },
    { main: '一件体育用品', examples: ['一只磨损的棒球手套', '一副拳击手套', '一根台球杆', '一只足球'] },
    { main: '一件武器', examples: ['一把老式左轮手枪', '一把猎刀', '一根手杖剑', '一把猎枪'] },
    { main: '一只宠物', examples: ['一只名叫"影子"的黑猫', '一只忠诚的老猎犬', '一只聪明的鹦鹉', '一只温顺的灰兔子'] },
  ],
  treasureTemplates: [
    (main, example, gt) => `${example}——${gt}的${main}。${gt}把它视为护身符，无论走到哪里都不会离身。`,
    (main, example, gt) => `${gt}随身携带着${example}。作为${gt}的${main}，它是${gt}最珍贵的财产。`,
    (main, example, gt) => `${example}。作为${gt}的${main}，别人或许觉得它毫无价值，但对${gt}来说，它是无价之宝。`,
    (main, example, gt) => `${example}——${gt}的${main}。${gt}有时会在深夜拿出来端详，试图从中找到更多的意义。`,
    (main, example, gt) => `${example}。作为${gt}的${main}，它承载着${gt}无法割舍的情感。失去它，就等于失去了一部分自己。`,
  ],

  // ===== 特质：1D10 表 =====
  trait: [
    { main: '慷慨大方', examples: ['总是愿意为他人付出', '从不计较个人得失', '乐于分享自己拥有的一切'] },
    { main: '动物之友', examples: ['对任何动物都有着天然的亲和力', '总能赢得动物的信任', '家里收养了无数流浪动物'] },
    { main: '梦想家', examples: ['总是沉浸在自己的幻想世界中', '对未来有着美好的憧憬', '常常提出别人觉得不切实际的想法'] },
    { main: '享乐主义', examples: ['追求生活中的一切美好事物', '坚信人生苦短、及时行乐', '对美食、美酒和艺术有着无法抗拒的热爱'] },
    { main: '赌徒', examples: ['在赌桌上和人生中都敢于押上一切', '越是危险的局面越能激发斗志', '相信运气总站在自己这边'] },
    { main: '料理能手', examples: ['能用最简单的食材做出令人惊叹的美食', '厨房是绝对的主场', '烹饪是缓解压力的最佳方式'] },
    { main: '万人迷', examples: ['无论走到哪里都是众人瞩目的焦点', '天生具有吸引他人的魅力', '只需一个微笑就能让人如沐春风'] },
    { main: '义薄云天', examples: ['为了朋友可以两肋插刀', '信守承诺胜过一切', '正义感是行动的唯一准则'] },
    { main: '名声在外', examples: ['在某个圈子里无人不知', '名字本身就是一张通行证', '声名远播，但并非总是好的名声'] },
    { main: '野心勃勃', examples: ['有着远超常人的抱负和决心', '不满足于现状，永远在追求更高', '愿意为了目标付出任何代价'] },
  ],
  traitTemplates: [
    (main, example, gt) => `${gt}最大的特质是${main}——${example}。这种特质让${gt}在人群中脱颖而出。`,
    (main, example, gt) => `最了解${gt}的人都会提到${gt}的${main}。${example}。这既是${gt}最大的优点，也是最显著的特征。`,
    (main, example, gt) => `${main}——这是${gt}最显著的特征。${example}。从很小的时候起，这种特质就伴随着${gt}。`,
    (main, example, gt) => `${gt}并不认为${main}有什么特别，但身边的人都能感受到。${example}。在旁人看来，这或许微不足道，但对${gt}来说，这是定义自己的东西。`,
    (main, example, gt) => `如果有人问起${gt}最大的特点，答案一定是${main}。${example}。${gt}有时分不清这究竟是天赋还是诅咒。`,
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
      const whyExample = pick(whyEntry.examples);
      const name = generateRandomPersonName();
      const who = whoEntry.main; // 直接使用类别名作为关系描述
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

// ----- Companions CRUD -----
const MAX_COMPANIONS = 7;

function addCompanion() {
  if (state.companions.length >= MAX_COMPANIONS) {
    notify(`最多添加 ${MAX_COMPANIONS} 个同伴`, 'error');
    return;
  }
  state.companions.push({ charName: '', playerName: '' });
  saveState();
  renderStep();
}

function removeCompanion(idx) {
  if (idx < 0 || idx >= state.companions.length) return;
  state.companions.splice(idx, 1);
  saveState();
  renderStep();
}

function updateCompanionField(idx, field, value) {
  if (idx < 0 || idx >= state.companions.length) return;
  state.companions[idx][field] = value;
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

    <!-- 同伴信息 -->
    <div class="card" style="margin-top:16px;">
      <div class="card-title"><span class="icon">&#128101;</span> 同伴信息</div>
      <p class="section-desc">记录与你一同调查的同伴。最多可添加 ${MAX_COMPANIONS} 位同伴。</p>
      <div class="companions-grid">
  `;

  state.companions.forEach((comp, idx) => {
    html += `
        <div class="companion-card">
          <div class="companion-card-header">
            <span class="companion-number">${idx + 1}</span>
            <button class="btn btn-sm btn-danger-outline companion-remove" onclick="removeCompanion(${idx})" title="移除此同伴">&#10005;</button>
          </div>
          <div class="companion-fields">
            <div class="companion-field">
              <label>调查员名称</label>
              <input type="text" class="companion-input" value="${comp.charName}" placeholder="角色名…"
                oninput="updateCompanionField(${idx}, 'charName', this.value)">
            </div>
            <div class="companion-field">
              <label>玩家名称</label>
              <input type="text" class="companion-input" value="${comp.playerName}" placeholder="玩家名…"
                oninput="updateCompanionField(${idx}, 'playerName', this.value)">
            </div>
          </div>
        </div>
    `;
  });

  // 空位占位
  let emptySlots = MAX_COMPANIONS - state.companions.length;
  if (emptySlots > 0) {
    for (let i = 0; i < emptySlots; i++) {
      html += `
        <div class="companion-card companion-empty" onclick="addCompanion()">
          <div class="companion-add-icon">&#10010;</div>
          <div class="companion-add-text">添加同伴</div>
        </div>
      `;
    }
  }

  html += `
      </div>
      <div class="companions-count">${state.companions.length} / ${MAX_COMPANIONS}</div>
    </div>
  `;

  container.innerHTML = html;
}

// ----- Step 8: Equipment & Weapons -----
// 装备步骤相关状态
let _equipActiveCategory = null; // 当前展开的分类标签
let _equipSearchTimeout = null;
let _weaponActiveCategory = null; // 当前展开的武器分类标签
let _weaponSearchTimeout = null;

function addEquipment(name, price, type, priceDisplay) {
  if (!name || !name.trim()) {
    notify('请输入物品名称', 'error');
    return;
  }
  price = parseFloat(price) || 0;
  if (price < 0) price = 0;
  type = type || '日常用品';

  let item = { name: name.trim(), type, price, detail: '' };
  if (priceDisplay) item.priceDisplay = priceDisplay;
  state.equipment.push(item);
  saveState();
  renderStep();
  notify('已添加: ' + name.trim(), 'success');
}

function removeEquipment(idx) {
  if (idx < 0 || idx >= state.equipment.length) return;
  let removed = state.equipment.splice(idx, 1)[0];
  saveState();
  renderStep();
  notify('已移除: ' + removed.name, 'info');
}

function addWeapon(weaponData) {
  // 检查是否已添加同名武器
  let exists = state.weapons.some(w => w.name === weaponData.name);
  if (exists) {
    notify('该武器已添加', 'error');
    return;
  }
  state.weapons.push({ ...weaponData });
  saveState();
  renderStep();
  notify('已添加武器: ' + weaponData.name, 'success');
}

function removeWeapon(idx) {
  if (idx < 0 || idx >= state.weapons.length) return;
  let removed = state.weapons.splice(idx, 1)[0];
  saveState();
  renderStep();
  notify('已移除武器: ' + removed.name, 'info');
}

/**
 * 获取武器的技能检定值（常规/困难/极难）
 * 处理武器 skill 名称与 skillPoints key 之间的映射差异
 * 例如：wiki 中霰弹枪用"射击(霰弹枪)"，但技能系统中专精名是"步枪/霰弹枪"
 * @returns {{ regular: number, hard: number, extreme: number } | null}
 */
function getWeaponSkillCheck(weaponSkill) {
  if (!weaponSkill) return null;
  let sk = weaponSkill;

  // 映射表：武器skill → 技能系统skill
  let SKILL_ALIASES = {
    '射击(霰弹枪)': '射击(步枪/霰弹枪)',
    '射击(步枪)': '射击(步枪/霰弹枪)',
  };
  let resolved = SKILL_ALIASES[sk] || sk;

  let pts = state.skillPoints[resolved] || { occ: 0, int: 0 };
  let base = getSkillBase(resolved, state.rawAttrs);
  if (base === undefined) base = 0;

  let total = base + pts.occ + pts.int;
  return {
    regular: total,
    hard: Math.floor(total / 2),
    extreme: Math.floor(total / 5),
  };
}

function renderEquipmentSuggestions(query) {
  let container = document.getElementById('equipSuggestions');
  if (!container) return;

  if (!query || !query.trim()) {
    // 无搜索词时显示所有分类
    renderEquipmentCategoryBrowse(container);
    return;
  }

  let results = searchEquipment(query);
  if (results.length === 0) {
    container.innerHTML = `<div class="equip-suggestion-empty">未找到匹配物品，可手动输入名称和价格后添加</div>`;
    container.classList.remove('hidden');
    return;
  }

  // 按分类分组
  let grouped = {};
  results.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  let html = '';
  for (let cat in grouped) {
    let icon = EQUIPMENT_CATEGORY_ICONS[cat] || '&#128230;';
    html += `<div class="equip-suggestion-group">
      <div class="equip-suggestion-cat">${icon} ${cat}</div>
      <div class="equip-suggestion-items">`;
    grouped[cat].forEach(item => {
      let alreadyAdded = state.equipment.some(e => e.name === item.name);
      let pd = item.priceDisplay ? `'${item.priceDisplay.replace(/'/g, "\\'")}'` : '';
      html += `<div class="equip-suggestion-item ${alreadyAdded ? 'already-added' : ''}"
        onclick="${alreadyAdded ? '' : `addEquipment('${item.name.replace(/'/g, "\\'")}', ${item.price}, '${item.category}', ${pd}); document.getElementById('equipSearchInput').value='';`}">
        <span class="esi-name">${item.name}</span>
        <span class="esi-price">${item.priceDisplay || '$' + item.price.toFixed(2)}</span>
        ${alreadyAdded ? '<span class="esi-added-tag">已添加</span>' : ''}
      </div>`;
    });
    html += `</div></div>`;
  }
  container.innerHTML = html;
  container.classList.remove('hidden');
}

function renderEquipmentCategoryBrowse(container) {
  let categories = getEquipmentCategories();
  let html = '<div class="equip-category-tabs">';
  categories.forEach(cat => {
    let icon = EQUIPMENT_CATEGORY_ICONS[cat] || '&#128230;';
    let isActive = _equipActiveCategory === cat;
    html += `<button class="equip-cat-tab ${isActive ? 'active' : ''}"
      onclick="toggleEquipCategory('${cat}')">${icon} ${cat}</button>`;
  });
  html += '</div>';
  container.innerHTML = html;
  container.classList.remove('hidden');

  // 如果有展开的分类，渲染该分类下的物品
  let itemsContainer = document.getElementById('equipCategoryItems');
  if (itemsContainer && _equipActiveCategory) {
    let items = getCurrentEquipmentDB()[_equipActiveCategory] || [];
    let icon = EQUIPMENT_CATEGORY_ICONS[_equipActiveCategory] || '&#128230;';
    let itemsHtml = `<div class="equip-category-header">${icon} ${_equipActiveCategory}</div>`;
    itemsHtml += `<div class="equip-category-grid">`;
    items.forEach(item => {
      let alreadyAdded = state.equipment.some(e => e.name === item.name);
      let pd = item.priceDisplay ? `'${item.priceDisplay.replace(/'/g, "\\'")}'` : '';
      itemsHtml += `<div class="equip-cat-item ${alreadyAdded ? 'already-added' : ''}"
        onclick="${alreadyAdded ? '' : `addEquipment('${item.name.replace(/'/g, "\\'")}', ${item.price}, '${item.category}', ${pd});`}">
        <span class="eci-name">${item.name}</span>
        <span class="eci-price">${item.priceDisplay || '$' + item.price.toFixed(2)}</span>
        ${alreadyAdded ? '<span class="eci-added-tag">已添加</span>' : ''}
      </div>`;
    });
    itemsHtml += `</div>`;
    itemsContainer.innerHTML = itemsHtml;
    itemsContainer.classList.remove('hidden');
  } else if (itemsContainer) {
    itemsContainer.innerHTML = '';
    itemsContainer.classList.add('hidden');
  }
}

function toggleEquipCategory(cat) {
  _equipActiveCategory = (_equipActiveCategory === cat) ? null : cat;
  let container = document.getElementById('equipSuggestions');
  if (container) renderEquipmentCategoryBrowse(container);
}

function getEquipmentTotalSpent() {
  return state.equipment.reduce((sum, item) => sum + (item.price || 0), 0);
}

function autoImportTreasuredPossessions() {
  // 从背景故事中的"宝贵之物"自动带入
  let treasure = state.background.find(b => b.category === '宝贵之物' && b.content && b.content.trim());
  if (treasure && !state.equipment.some(e => e.type === '特殊物品' && e.name === treasure.content)) {
    state.equipment.push({
      name: treasure.content,
      type: '特殊物品',
      price: 0,
      detail: '来自背景故事中的宝贵之物'
    });
  }
}

function renderStep8(container) {
  // 首次进入时，根据信用评级设置可支配现金，并自动导入宝贵之物
  let crInfo = getCreditRatingInfo(state.creditRating);
  if (state.spendingCash === 0 && state.equipment.length === 0) {
    state.spendingCash = crInfo.cash;
    autoImportTreasuredPossessions();
    saveState();
  }

  let html = `
    <div class="card">
      <div class="card-title"><span class="icon">&#128230;</span> 决定装备</div>
      <p class="section-desc">
        为调查员选择随身携带的物品和武器。道具和武器不与可支配现金关联。
      </p>

      <!-- 信用评级信息（仅展示） -->
      <div class="equip-credit-info">
        <div class="eci-row">
          <div class="eci-label">信用评级</div>
          <div class="eci-value">${state.creditRating} <span class="eci-level">(${crInfo.level})</span></div>
        </div>
        <div class="eci-row">
          <div class="eci-label">可支配现金</div>
          <div class="eci-value eci-cash">$${state.spendingCash.toFixed(2)}</div>
        </div>
        <div class="eci-row">
          <div class="eci-label">资产</div>
          <div class="eci-value">${crInfo.assets}</div>
        </div>
      </div>

      <!-- ===== 道具管理 ===== -->
      <div class="equip-section-title">&#128230; 管理道具</div>

      <!-- 添加物品 -->
      <div class="equip-search-box">
        <div class="equip-search-header">
          <div class="equip-search-input-wrap">
            <span class="equip-search-icon">&#128269;</span>
            <input type="text" id="equipSearchInput" class="equip-search-input"
              placeholder="搜索物品名称..."
              oninput="onEquipSearchInput(this.value)"
              onfocus="onEquipSearchInput(this.value)">
          </div>
          <div class="equip-custom-add">
            <input type="text" id="equipCustomName" placeholder="自定义物品名称"
              class="equip-custom-input">
            <input type="number" id="equipCustomPrice" placeholder="价格" min="0" step="0.01"
              class="equip-custom-input equip-custom-price">
            <button class="btn btn-accent btn-sm" onclick="addCustomEquipment()">添加</button>
          </div>
        </div>
        <div id="equipSuggestions" class="equip-suggestions hidden"></div>
        <div id="equipCategoryItems" class="equip-category-items hidden"></div>
      </div>

      <!-- 我的随身物品 -->
      <div class="equip-my-items">
        <div class="equip-my-items-title">&#127890; 我的随身物品</div>
  `;

  if (state.equipment.length === 0) {
    html += `<div class="equip-empty">尚未添加任何物品。请搜索或自定义添加。</div>`;
  } else {
    state.equipment.forEach((item, idx) => {
      let icon = EQUIPMENT_CATEGORY_ICONS[item.type] || '&#128230;';
      html += `<div class="equip-item">
        <span class="ei-icon">${icon}</span>
        <span class="ei-name">${item.name}</span>
        <span class="ei-type">${item.type}</span>
        <span class="ei-price">${item.priceDisplay || '$' + item.price.toFixed(2)}</span>
        <button class="ei-remove" onclick="removeEquipment(${idx})">&#10005;</button>
      </div>`;
    });
  }

  html += `</div>`;

  // ===== 武器管理 =====
  html += `
      <div class="equip-section-title" style="margin-top:24px;">&#9876; 管理武器</div>
      <p class="section-desc" style="margin-bottom:12px;">
        武器拥有额外的战斗属性（技能、伤害、射程等）。点击武器可查看详情并添加。
      </p>

      <!-- 武器搜索和浏览 -->
      <div class="equip-search-box">
        <div class="equip-search-header">
          <div class="equip-search-input-wrap">
            <span class="equip-search-icon">&#128269;</span>
            <input type="text" id="weaponSearchInput" class="equip-search-input"
              placeholder="搜索武器名称..."
              oninput="onWeaponSearchInput(this.value)"
              onfocus="onWeaponSearchInput(this.value)">
          </div>
        </div>
        <div id="weaponSuggestions" class="equip-suggestions hidden"></div>
        <div id="weaponCategoryItems" class="equip-category-items hidden"></div>
      </div>

      <!-- 自定义武器添加 -->
      <div class="weapon-custom-add">
        <div class="weapon-custom-add-title">&#10010; 添加自定义武器</div>
        <div class="weapon-custom-row">
          <input type="text" id="wcName" placeholder="武器名称" class="wc-input wc-name">
          <select id="wcSkill" class="wc-input wc-skill">
            <optgroup label="格斗专精">
              <option value="格斗(斗殴)">格斗(斗殴)</option>
              <option value="格斗(斧)">格斗(斧)</option>
              <option value="格斗(链锯)">格斗(链锯)</option>
              <option value="格斗(连枷)">格斗(连枷)</option>
              <option value="格斗(绞索)">格斗(绞索)</option>
              <option value="格斗(矛)">格斗(矛)</option>
              <option value="格斗(刀剑)">格斗(刀剑)</option>
              <option value="格斗(鞭)">格斗(鞭)</option>
            </optgroup>
            <optgroup label="射击专精">
              <option value="射击(弓)">射击(弓)</option>
              <option value="射击(手枪)">射击(手枪)</option>
              <option value="射击(步枪/霰弹枪)">射击(步枪/霰弹枪)</option>
              <option value="射击(冲锋枪)">射击(冲锋枪)</option>
              <option value="射击(机枪)">射击(机枪)</option>
              <option value="射击(重武器)">射击(重武器)</option>
              <option value="射击(火焰喷射器)">射击(火焰喷射器)</option>
            </optgroup>
            <optgroup label="其他技能">
              <option value="投掷">投掷</option>
              <option value="炮术">炮术</option>
              <option value="爆破">爆破</option>
              <option value="电气维修">电气维修</option>
            </optgroup>
          </select>
          <input type="text" id="wcDamage" placeholder="伤害" class="wc-input wc-damage">
        </div>
        <div class="weapon-custom-row">
          <input type="text" id="wcRange" placeholder="基础射程" class="wc-input wc-range">
          <input type="text" id="wcAPR" placeholder="每轮" class="wc-input wc-apr">
          <input type="text" id="wcCapacity" placeholder="弹容量" class="wc-input wc-cap">
          <input type="text" id="wcMalfunction" placeholder="故障值" class="wc-input wc-mal">
          <label class="wc-ap-check"><input type="checkbox" id="wcAP"> 贯穿</label>
        </div>
        <div class="weapon-custom-row">
          <button class="btn btn-accent btn-sm" onclick="addCustomWeapon()">添加武器</button>
        </div>
      </div>

      <!-- 我的武器 -->
      <div class="equip-my-items">
        <div class="equip-my-items-title">&#9876; 我的武器</div>
  `;

  if (state.weapons.length === 0) {
    html += `<div class="equip-empty">尚未添加任何武器。请搜索、浏览武器库或自定义添加。</div>`;
  } else {
    let era = state.era || '1920s';
    html += `<div class="weapon-table-wrap"><table class="weapon-table">
      <thead><tr>
        <th>名称</th><th>常规</th><th>困难</th><th>极难</th><th>伤害</th><th>射程</th><th>每轮</th><th>弹容量</th><th>故障</th><th></th>
      </tr></thead><tbody>`;
    state.weapons.forEach((weapon, idx) => {
      let isDetailed = weapon.skill !== undefined;
      let sc = isDetailed && weapon.skill ? getWeaponSkillCheck(weapon.skill) : null;
      let malDisplay = isDetailed && weapon.malfunction ? weapon.malfunction : '-';
      html += `<tr>
        <td class="wt-name">${weapon.name}</td>
        <td class="wt-skill-check">${sc ? sc.regular : '-'}</td>
        <td class="wt-skill-check">${sc ? sc.hard : '-'}</td>
        <td class="wt-skill-check">${sc ? sc.extreme : '-'}</td>
        <td class="wt-damage">${isDetailed ? weapon.damage : '-'}</td>
        <td>${isDetailed ? (weapon.baseRange || '-') : '-'}</td>
        <td>${isDetailed ? (weapon.attacksPerRound || '-') : '-'}</td>
        <td>${isDetailed ? (weapon.capacity || '-') : '-'}</td>
        <td>${malDisplay}</td>
        <td><button class="ei-remove" onclick="removeWeapon(${idx})">&#10005;</button></td>
      </tr>`;
    });
    html += `</tbody></table></div>`;
  }

  html += `</div></div>`;

  container.innerHTML = html;
}

function onEquipSearchInput(value) {
  clearTimeout(_equipSearchTimeout);
  _equipActiveCategory = null; // 搜索时关闭分类浏览
  _equipSearchTimeout = setTimeout(() => {
    renderEquipmentSuggestions(value);
  }, 150);
}

function addCustomEquipment() {
  let nameEl = document.getElementById('equipCustomName');
  let priceEl = document.getElementById('equipCustomPrice');
  if (!nameEl) return;
  let name = nameEl.value.trim();
  let price = parseFloat(priceEl ? priceEl.value : 0) || 0;
  if (!name) {
    notify('请输入物品名称', 'error');
    return;
  }
  addEquipment(name, price, '自定义');
  nameEl.value = '';
  if (priceEl) priceEl.value = '';
}

// ----- Weapon Search & Browse -----
function onWeaponSearchInput(value) {
  clearTimeout(_weaponSearchTimeout);
  _weaponActiveCategory = null;
  _weaponSearchTimeout = setTimeout(() => {
    renderWeaponSuggestions(value);
  }, 150);
}

function renderWeaponSuggestions(query) {
  let container = document.getElementById('weaponSuggestions');
  if (!container) return;

  if (!query || !query.trim()) {
    renderWeaponCategoryBrowse(container);
    return;
  }

  let results = searchWeapons(query);
  if (results.length === 0) {
    container.innerHTML = `<div class="equip-suggestion-empty">未找到匹配武器</div>`;
    container.classList.remove('hidden');
    return;
  }

  // 按分类分组
  let grouped = {};
  results.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  let html = '';
  for (let cat in grouped) {
    let icon = WEAPON_CATEGORY_ICONS[cat] || '&#9876;';
    html += `<div class="equip-suggestion-group">
      <div class="equip-suggestion-cat">${icon} ${cat}</div>
      <div class="equip-suggestion-items">`;
    grouped[cat].forEach(item => {
      let alreadyAdded = state.weapons.some(w => w.name === item.name);
      let isDetailed = item.skill !== undefined;
      let detailHtml = isDetailed
        ? `<span class="ws-detail">${item.damage}${item.armorPiercing ? ' &#10003;' : ''}</span>`
        : '';
      html += `<div class="equip-suggestion-item weapon-suggestion-item ${alreadyAdded ? 'already-added' : ''}"
        onclick="${alreadyAdded ? '' : `addWeapon(${JSON.stringify(item).replace(/"/g, '&quot;')})`}">
        <span class="esi-name">${item.name}</span>
        ${detailHtml}
        ${alreadyAdded ? '<span class="esi-added-tag">已添加</span>' : ''}
      </div>`;
    });
    html += `</div></div>`;
  }
  container.innerHTML = html;
  container.classList.remove('hidden');
}

function renderWeaponCategoryBrowse(container) {
  let categories = getWeaponCategories();
  let html = '<div class="equip-category-tabs">';
  categories.forEach(cat => {
    let icon = WEAPON_CATEGORY_ICONS[cat] || '&#9876;';
    let isActive = _weaponActiveCategory === cat;
    html += `<button class="equip-cat-tab ${isActive ? 'active' : ''}"
      onclick="toggleWeaponCategory('${cat}')">${icon} ${cat}</button>`;
  });
  html += '</div>';
  container.innerHTML = html;
  container.classList.remove('hidden');

  let itemsContainer = document.getElementById('weaponCategoryItems');
  if (itemsContainer && _weaponActiveCategory) {
    let items = getCurrentWeaponsDB()[_weaponActiveCategory] || [];
    let icon = WEAPON_CATEGORY_ICONS[_weaponActiveCategory] || '&#9876;';
    let itemsHtml = `<div class="equip-category-header">${icon} ${_weaponActiveCategory}</div>`;
    itemsHtml += `<div class="equip-category-grid">`;
    items.forEach(item => {
      let alreadyAdded = state.weapons.some(w => w.name === item.name);
      let isDetailed = item.skill !== undefined;
      let detailHtml = isDetailed
        ? `<span class="eci-detail">${item.damage}${item.armorPiercing ? ' &#10003;' : ''}</span>`
        : '';
      itemsHtml += `<div class="equip-cat-item weapon-cat-item ${alreadyAdded ? 'already-added' : ''}"
        onclick="${alreadyAdded ? '' : `addWeapon(${JSON.stringify(item).replace(/"/g, '&quot;')})`}">
        <span class="eci-name">${item.name}</span>
        ${detailHtml}
        ${alreadyAdded ? '<span class="eci-added-tag">已添加</span>' : ''}
      </div>`;
    });
    itemsHtml += `</div>`;
    itemsContainer.innerHTML = itemsHtml;
    itemsContainer.classList.remove('hidden');
  } else if (itemsContainer) {
    itemsContainer.innerHTML = '';
    itemsContainer.classList.add('hidden');
  }
}

function toggleWeaponCategory(cat) {
  _weaponActiveCategory = (_weaponActiveCategory === cat) ? null : cat;
  let container = document.getElementById('weaponSuggestions');
  if (container) renderWeaponCategoryBrowse(container);
}

function addCustomWeapon() {
  let nameEl = document.getElementById('wcName');
  if (!nameEl) return;
  let name = nameEl.value.trim();
  if (!name) {
    notify('请输入武器名称', 'error');
    return;
  }
  let skill = (document.getElementById('wcSkill').value || '格斗(斗殴)');
  let damage = (document.getElementById('wcDamage').value || '').trim() || '1D6+DB';
  let baseRange = (document.getElementById('wcRange').value || '').trim() || '接触';
  let attacksPerRound = (document.getElementById('wcAPR').value || '').trim() || '1';
  let capacity = (document.getElementById('wcCapacity').value || '').trim() || '-';
  let malfunctionVal = (document.getElementById('wcMalfunction').value || '').trim();
  let malfunction = malfunctionVal ? parseInt(malfunctionVal) : null;
  let armorPiercing = document.getElementById('wcAP').checked;

  let weapon = {
    name,
    skill,
    damage,
    armorPiercing,
    baseRange,
    attacksPerRound,
    capacity,
    malfunction,
    price20s: null,
    priceModern: null,
    era: '自定义',
    category: '自定义',
  };

  addWeapon(weapon);

  // 清空输入
  ['wcName','wcDamage','wcRange','wcAPR','wcCapacity','wcMalfunction'].forEach(id => {
    let el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('wcSkill').value = '格斗(斗殴)';
  document.getElementById('wcAP').checked = false;
}

// ----- Step 9: Final Character Sheet -----
function renderStep9(container) {
  calcDerived();
  let attrs = getEffectiveAttrs();
  let d = state.derived;

  let html = `
    <div class="char-sheet">
      <div class="char-sheet-header">
        ${state.avatar ? `<div class="char-avatar"><img src="assets/avatars/${state.avatar}" alt="头像" onerror="this.parentElement.style.display='none'"></div>` : ''}
        <div>
          <div class="char-name editable" contenteditable="true"
            onblur="state.name=this.textContent.trim();saveState()">${state.name || '未命名调查员'}</div>
          <div class="char-meta">
            年龄: <span class="editable" contenteditable="true"
              onblur="state.age=parseInt(this.textContent)||25;saveState();recalcAndRender()">${state.age}</span> |
            性别: <span class="editable" contenteditable="true"
              onblur="state.gender=this.textContent.trim();saveState()">${state.gender}</span> |
            时代: <span class="editable" contenteditable="true"
              onblur="state.era=this.textContent.trim();saveState()">${state.era}</span>
          </div>
          <div class="char-meta">
            玩家: <span class="editable" contenteditable="true"
              onblur="state.playerName=this.textContent.trim();saveState()">${state.playerName || 'COC-PL'}</span> |
            居所: <span class="editable" contenteditable="true"
              onblur="state.residence=this.textContent.trim();saveState()">${state.residence || '未知'}</span> |
            故乡: <span class="editable" contenteditable="true"
              onblur="state.hometown=this.textContent.trim();saveState()">${state.hometown || '未知'}</span>
          </div>
          <div class="char-meta">
            职业: <span style="color:var(--gold);">${state.occupation ? state.occupation.name : '未选择'}</span> |
            信用评级: <span class="editable" contenteditable="true"
              onblur="state.creditRating=parseInt(this.textContent)||0;saveState()">${state.creditRating}</span>
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
        <div class="check-cell">
          <div class="ck-main editable" contenteditable="true"
            onblur="state.rawAttrs['${k}']=clamp(parseInt(this.textContent)||0,0,99);saveState();recalcAndRender()">${attrs[k]}</div>
          <div class="ck-half">${Math.floor(attrs[k]/2)}</div>
          <div class="ck-fifth">${Math.floor(attrs[k]/5)}</div>
        </div>
      </div>
    `;
  });
  html += `
        </div>
        <div style="text-align:center;margin-top:12px;">
          <div class="attr-item" style="display:inline-block;">
            <div class="attr-name">幸运值</div>
            <div class="check-cell">
              <div class="ck-main editable" contenteditable="true"
                onblur="state.luck=clamp(parseInt(this.textContent)||0,0,99);saveState()">${state.luck}</div>
              <div class="ck-half">${Math.floor(state.luck/2)}</div>
              <div class="ck-fifth">${Math.floor(state.luck/5)}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="char-sheet-section">
        <h3>&#9829; 衍生属性</h3>
        <div class="derived-grid">
          <div class="derived-item"><div class="d-name">HP</div><div class="d-value">${d.HP}</div></div>
          <div class="derived-item"><div class="d-name">MP</div><div class="d-value">${d.MP}</div></div>
          <div class="derived-item">
            <div class="d-name">SAN</div>
            <div class="check-cell-inline">
              <div class="ck-main editable" contenteditable="true"
                onblur="state.derived.SAN=clamp(parseInt(this.textContent)||0,0,99);saveState()">${d.SAN}</div>
              <div class="ck-half">${Math.floor(d.SAN/2)}</div>
              <div class="ck-fifth">${Math.floor(d.SAN/5)}</div>
            </div>
          </div>
          <div class="derived-item"><div class="d-name">DB</div><div class="d-value">${d.DB}</div></div>
          <div class="derived-item"><div class="d-name">体格</div><div class="d-value">${d.build}</div></div>
          <div class="derived-item"><div class="d-name">MOV</div><div class="d-value">${d.MOV}</div></div>
          <div class="derived-item">
            <div class="d-name">闪避</div>
            <div class="check-cell-inline">
              <div class="ck-main editable" contenteditable="true"
                onblur="state.derived.dodge=clamp(parseInt(this.textContent)||0,0,99);saveState()">${d.dodge}</div>
              <div class="ck-half">${Math.floor(d.dodge/2)}</div>
              <div class="ck-fifth">${Math.floor(d.dodge/5)}</div>
            </div>
          </div>
          <div class="derived-item">
            <div class="d-name">母语</div>
            <div class="check-cell-inline">
              <div class="ck-main editable" contenteditable="true"
                onblur="state.derived.language=clamp(parseInt(this.textContent)||0,0,99);saveState()">${d.language}</div>
              <div class="ck-half">${Math.floor(d.language/2)}</div>
              <div class="ck-fifth">${Math.floor(d.language/5)}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="char-sheet-section">
        <h3>&#9998; 技能</h3>
  `;

  const categories = getDisplaySkillCategories();

  categories.forEach(cat => {
    // 过滤出总值 > 1 的技能
    let visibleSkills = cat.skills.filter(name => {
      let base = getSkillBase(name, attrs);
      let pts = state.skillPoints[name] || { occ: 0, int: 0 };
      let total = base + pts.occ + pts.int;
      return total > 1;
    });
    if (visibleSkills.length === 0) return;

    // 专攻分类标题
    let titleHtml;
    if (cat.parentName) {
      titleHtml = `<span class="cat-parent-name">${cat.parentName}</span><span class="cat-suffix">专攻</span>`;
    } else {
      titleHtml = cat.title;
    }
    html += `<div class="skill-category">
      <div class="skill-category-title" onclick="this.nextElementSibling.classList.toggle('hidden')">
        ${titleHtml} <span class="toggle">&#9660;</span>
      </div>
      <table class="skill-table">
        <tr><th>技能</th><th>基础</th><th>职业</th><th>兴趣</th><th>总计</th></tr>
    `;
    visibleSkills.forEach(name => {
      let base = getSkillBase(name, attrs);
      let isOcc = isOccupationalSkill(name);
      let pts = state.skillPoints[name] || { occ: 0, int: 0 };
      let total = base + pts.occ + pts.int;
      // 专攻分类中技能名只显示子名
      let displayName = name;
      if (cat.parentName && name.startsWith(cat.parentName + '(') && name.endsWith(')')) {
        displayName = name.slice(cat.parentName.length + 1, -1);
      }
      html += `<tr>
        <td class="skill-name">${displayName} ${isOcc ? '<span class="tag-occ">职</span>' : ''}</td>
        <td class="skill-base">${base}</td>
        <td class="skill-occ">${pts.occ > 0 ? '+' + pts.occ : ''}</td>
        <td class="skill-pts">${pts.int > 0 ? '+' + pts.int : ''}</td>
        <td><div class="check-cell-inline">
          <div class="ck-main editable" contenteditable="true"
            onblur="updateFinalSkill('${name}',this.textContent)">${total}</div>
          <div class="ck-half">${Math.floor(total/2)}</div>
          <div class="ck-fifth">${Math.floor(total/5)}</div>
        </div></td>
      </tr>`;
    });
    html += `</table></div>`;
  });

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
            onblur="updateBackgroundContent(${idx}, this.textContent)">${prefix}[${item.category}] ${item.content}</span>
        </div>`;
      }
    });
    html += `</div>`;
  }

  // Companions
  let validCompanions = state.companions.filter(c => c.charName && c.charName.trim());
  if (validCompanions.length > 0) {
    html += `
      <div class="char-sheet-section">
        <h3>&#128101; 同伴</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">
    `;
    validCompanions.forEach(comp => {
      html += `<div style="padding:6px 10px;background:var(--input-bg);border-radius:4px;font-size:0.85rem;">
        <strong style="color:var(--gold);">${comp.charName}</strong>
        ${comp.playerName ? `<span style="color:var(--text-muted);margin-left:6px;">(${comp.playerName})</span>` : ''}
      </div>`;
    });
    html += `</div></div>`;
  }

  // Equipment
  if (state.equipment.length > 0) {
    let crInfo = getCreditRatingInfo(state.creditRating);
    html += `
      <div class="char-sheet-section">
        <h3>&#128230; 随身物品</h3>
        <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:8px;">
          信用评级: ${state.creditRating} (${crInfo.level}) | 资产: ${crInfo.assets}
        </div>
    `;
    state.equipment.forEach(item => {
      let icon = EQUIPMENT_CATEGORY_ICONS[item.type] || '&#128230;';
      html += `<div style="margin-bottom:4px;padding:4px 10px;background:var(--input-bg);border-radius:4px;font-size:0.85rem;">
        ${icon} ${item.name} <span style="color:var(--text-muted);">(${item.type})</span>
        ${item.price > 0 ? `<span style="color:var(--gold);float:right;">${item.priceDisplay || '$' + item.price.toFixed(2)}</span>` : ''}
      </div>`;
    });
    html += `</div>`;
  }

  // Weapons
  if (state.weapons.length > 0) {
    html += `
      <div class="char-sheet-section">
        <h3>&#9876; 武器</h3>
    `;
    state.weapons.forEach(weapon => {
      let isDetailed = weapon.skill !== undefined;
      html += `<div style="margin-bottom:6px;padding:6px 10px;background:var(--input-bg);border-radius:4px;font-size:0.85rem;">
        &#9876; <strong>${weapon.name}</strong>`;
      if (isDetailed) {
        // 计算技能检定值
        let sc = getWeaponSkillCheck(weapon.skill);
        html += `<div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:4px 12px;font-size:0.8rem;">`;
        html += `<span style="font-weight:bold;">${sc ? sc.regular + '/' + sc.hard + '/' + sc.extreme : '-'}</span>`;
        html += `<span>伤害: ${weapon.damage}</span>`;
        if (weapon.armorPiercing) html += `<span style="color:var(--red);">贯穿</span>`;
        if (weapon.baseRange && weapon.baseRange !== '接触') html += `<span>射程: ${weapon.baseRange}</span>`;
        if (weapon.attacksPerRound) html += `<span>每轮: ${weapon.attacksPerRound}</span>`;
        if (weapon.capacity && weapon.capacity !== '-') html += `<span>弹容量: ${weapon.capacity}</span>`;
        if (weapon.malfunction) html += `<span>故障: ${weapon.malfunction}</span>`;
        html += `</div>`;
      }
      html += `</div>`;
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
