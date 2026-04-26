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
    if (data.avatar) {
      // 创建器头像路径相对于创建器目录，这里尝试直接显示
      let img = new Image();
      img.src = '../coc_character_sheet/assets/avatars/' + data.avatar;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:6px;';
      img.onerror = function() { img.style.display = 'none'; portraitIcon.style.display = 'flex'; };
      portraitIcon.style.display = 'none';
      portrait.insertBefore(img, portraitIcon);
    }
  }
