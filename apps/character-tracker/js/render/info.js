/**
 * render/info.js - BasicInfo 渲染
 */

function renderBasicInfo(data) {
    document.getElementById('f-name').textContent = data.name || '—';
    document.getElementById('f-playerName').textContent = data.playerName || '—';
    document.getElementById('f-occupation').textContent = data.occupation || '—';
    document.getElementById('f-age').textContent = data.age || '—';
    document.getElementById('f-gender').textContent = data.gender || '—';
    document.getElementById('f-residence').textContent = data.residence || '—';
    document.getElementById('f-hometown').textContent = data.hometown || '—';
    document.getElementById('f-era').textContent = data.era || '—';
    // 头像
    let portrait = document.getElementById('portrait');
    let portraitIcon = document.getElementById('portraitIcon');
    // 清理旧的头像图片（防止重复导入时堆叠）
    portrait.querySelectorAll('img.portrait-img').forEach(el => el.remove());
    if (data.avatar) {
      let img = new Image();
      img.className = 'portrait-img';
      img.src = '../coc_character_sheet/assets/avatars/' + data.avatar;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:6px;';
      img.onerror = function() { img.style.display = 'none'; portraitIcon.style.display = 'flex'; };
      portraitIcon.style.display = 'none';
      portrait.insertBefore(img, portraitIcon);
    } else {
      // 无头像时确保图标可见
      portraitIcon.style.display = 'flex';
    }
  }
