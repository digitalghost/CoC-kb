// 进度条和导航渲染 - Progress Bar & Navigation Rendering
// 包含函数:
//   - renderProgressBar()  渲染顶部进度条（8个步骤点）
//   - renderNavButtons()   渲染底部导航按钮（上一步/下一步/导出/重置）

function renderProgressBar() {
  let html = '';
  for (let i = 0; i < 8; i++) {
    let cls = '';
    if (i === state.currentStep) cls = 'active';
    else if (i < state.currentStep || state.completed) cls = 'completed';
    html += `<div class="step-dot ${cls}" onclick="goToStep(${i})">${i + 1}</div>`;
    if (i < 7) {
      let lineCls = (i < state.currentStep || state.completed) ? 'completed' : '';
      html += `<div class="step-line ${lineCls}"></div>`;
    }
  }
  document.getElementById('progressBar').innerHTML = html;
}

function renderNavButtons() {
  let html = '';
  if (state.currentStep > 0) {
    html += `<button class="btn btn-secondary" onclick="prevStep()">&#9664; 上一步</button>`;
  } else {
    html += `<div></div>`;
  }
  if (state.currentStep < 7) {
    let disabled = (state.currentStep === 1 && !state.attrsGenerated) ? ' disabled' : '';
    html += `<button class="btn btn-primary" onclick="nextStep()"${disabled}>下一步 &#9654;</button>`;
  } else {
    html += `<button class="btn btn-gold" onclick="exportCharacter()">导出角色卡</button>`;
    html += `<button class="btn btn-danger btn-sm" onclick="resetAll()">重新创建</button>`;
  }
  document.getElementById('navButtons').innerHTML = html;
}
