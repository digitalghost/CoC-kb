// 步骤路由 - Step Router
// 包含函数:
//   - renderStep()  核心路由函数，根据 state.currentStep 调用对应步骤渲染函数

function renderStep() {
  renderProgressBar();
  renderNavButtons();
  let container = document.getElementById('stepContainer');
  switch (state.currentStep) {
    case 0: renderStep1(container); break;
    case 1: renderStep2(container); break;
    case 2: renderStep3(container); break;
    case 3: renderStep4(container); break;
    case 4: renderStep5(container); break;
    case 5: renderStep6(container); break;
    case 6: renderStep7(container); break;
    case 7: renderStep8(container); break;
    case 8: renderStep9(container); break;
  }
}
