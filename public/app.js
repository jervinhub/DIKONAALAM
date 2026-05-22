/* ================================================
   ROBLOX UI CLONE — app.js
   ================================================ */

// ── State ──────────────────────────────────────
let state = {
  username: 'Eisso',
  displayName: 'Eisso',
  robux: 195201263,
  avatarUrl: '',
  bannerUrl: '',
};

let sendState = {
  recipientId: null,
  recipientUsername: '',
  recipientDisplayName: '',
  recipientAvatarUrl: '',
  amount: 200,
};

let searchDebounce = null;
let notifTimeout = null;

// ── Helpers ────────────────────────────────────
function fmt(n) {
  return Number(n).toLocaleString('en-US');
}

function updateAllBalances() {
  document.getElementById('navRobuxBalance').textContent = fmt(state.robux);
  document.getElementById('sendModalBalance').textContent = fmt(state.robux);
}

function updateProfile() {
  document.getElementById('topNavUsername').textContent = state.username;
  document.getElementById('sidebarUsername').textContent = state.username;

  const topAvatar = document.getElementById('topNavAvatar');
  const sideAvatar = document.getElementById('sidebarAvatar');

  if (state.avatarUrl) {
    topAvatar.src = state.avatarUrl;
    topAvatar.style.display = '';
    sideAvatar.src = state.avatarUrl;
    sideAvatar.style.display = '';
  } else {
    topAvatar.src = '';
    topAvatar.style.display = 'none';
    sideAvatar.src = '';
    sideAvatar.style.display = 'none';
  }

  const bannerImg = document.getElementById('bannerImage');
  const bannerDefault = document.getElementById('bannerDefault');
  if (state.bannerUrl) {
    bannerImg.src = state.bannerUrl;
    bannerImg.classList.remove('hidden');
    bannerDefault.classList.add('hidden');
  } else {
    bannerImg.classList.add('hidden');
    bannerDefault.classList.remove('hidden');
  }

  // Update bonus card background image
  const bonusBannerImg = document.getElementById('bonusBannerImg');
  if (bonusBannerImg && state.bannerUrl) {
    bonusBannerImg.src = state.bannerUrl;
  }

  updateAllBalances();
}

// ── Notification ───────────────────────────────
function showNotification(text) {
  const el = document.getElementById('topNotification');
  document.getElementById('notifText').textContent = text;
  el.classList.remove('hidden');
  if (notifTimeout) clearTimeout(notifTimeout);
  notifTimeout = setTimeout(() => closeNotification(), 6000);
}

function closeNotification() {
  document.getElementById('topNotification').classList.add('hidden');
}

// ── Settings Modal ─────────────────────────────
function openSettings() {
  const m = document.getElementById('settingsModal');
  document.getElementById('settingsUsername').value = state.username;
  document.getElementById('settingsDisplayName').value = state.displayName;
  document.getElementById('settingsRobux').value = state.robux;
  document.getElementById('settingsAvatarUrl').value = state.avatarUrl;
  document.getElementById('settingsBannerUrl').value = state.bannerUrl;
  m.classList.remove('hidden');
}

function closeSettings() {
  document.getElementById('settingsModal').classList.add('hidden');
}

function saveSettings() {
  const uname = document.getElementById('settingsUsername').value.trim() || 'Eisso';
  const dname = document.getElementById('settingsDisplayName').value.trim() || uname;
  const robux = Math.max(0, parseInt(document.getElementById('settingsRobux').value) || 0);
  const avatarUrl = document.getElementById('settingsAvatarUrl').value.trim();
  const bannerUrl = document.getElementById('settingsBannerUrl').value.trim();
  state.username = uname;
  state.displayName = dname;
  state.robux = robux;
  state.avatarUrl = avatarUrl;
  state.bannerUrl = bannerUrl;

  updateProfile();
  closeSettings();
}

// ── FAQ ────────────────────────────────────────
function toggleFaq(el) {
  el.classList.toggle('open');
}

// ── Send Robux Modal ───────────────────────────
function openSendModal() {
  const m = document.getElementById('sendModal');
  updateAllBalances();
  goToStep1();
  m.classList.remove('hidden');
  setTimeout(() => document.getElementById('searchInput').focus(), 100);
}

function closeSendModal() {
  document.getElementById('sendModal').classList.add('hidden');
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResults').classList.add('hidden');
  document.getElementById('searchHint').classList.remove('hidden');
  sendState.amount = 200;
}

function goToStep1() {
  showStep('sendStep1');
}

function goToStep2() {
  showStep('sendStep2');
  renderStep2();
}

function goToStep3() {
  if (!sendState.amount || sendState.amount < 1) {
    alert('Please enter a valid amount.');
    return;
  }
  if (sendState.amount > state.robux) {
    alert('You don\'t have enough Robux!');
    return;
  }
  showStep('sendStep3');
  startSending();
}

function showStep(id) {
  ['sendStep1','sendStep2','sendStep3','sendStep4'].forEach(s => {
    document.getElementById(s).classList.add('hidden');
  });
  document.getElementById(id).classList.remove('hidden');
}

function renderStep2() {
  document.getElementById('recipientDisplayName').textContent = sendState.recipientDisplayName || sendState.recipientUsername;
  document.getElementById('recipientUsername').textContent = '@' + sendState.recipientUsername;

  const avatar = document.getElementById('recipientAvatar');
  const fallback = document.getElementById('recipientAvatarFallback');

  if (sendState.recipientAvatarUrl) {
    avatar.src = sendState.recipientAvatarUrl;
    avatar.style.display = '';
    fallback.classList.add('hidden');
    avatar.onerror = () => {
      avatar.style.display = 'none';
      fallback.classList.remove('hidden');
      fallback.textContent = (sendState.recipientDisplayName || sendState.recipientUsername || '?')[0].toUpperCase();
    };
  } else {
    avatar.style.display = 'none';
    fallback.classList.remove('hidden');
    fallback.textContent = (sendState.recipientDisplayName || sendState.recipientUsername || '?')[0].toUpperCase();
  }

  updateAmountDisplay();
  setQuickActive(sendState.amount);
}

function updateAmountDisplay() {
  document.getElementById('amountDisplay').textContent = fmt(sendState.amount);
  document.getElementById('sendModalBalance').textContent = fmt(state.robux);
}

function selectAmount(n) {
  sendState.amount = n;
  updateAmountDisplay();
  setQuickActive(n);

  // Hide custom input if visible
  document.getElementById('customAmountInput').classList.add('hidden');
  document.getElementById('amountDisplayRow').classList.remove('hidden');
}

function setQuickActive(n) {
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.amount) === n);
  });
}

function focusCustomAmount() {
  document.getElementById('amountDisplayRow').classList.add('hidden');
  const input = document.getElementById('customAmountInput');
  input.classList.remove('hidden');
  input.value = sendState.amount || '';
  input.focus();
  input.select();
}

function onCustomAmount(val) {
  const n = parseInt(val) || 0;
  sendState.amount = n;
  document.getElementById('amountDisplay').textContent = fmt(n);
  setQuickActive(n);
}

function blurCustomAmount() {
  const val = parseInt(document.getElementById('customAmountInput').value) || 200;
  sendState.amount = Math.max(1, val);
  document.getElementById('customAmountInput').classList.add('hidden');
  document.getElementById('amountDisplayRow').classList.remove('hidden');
  updateAmountDisplay();
  setQuickActive(sendState.amount);
}

// Animate balance going down while sending
function startSending() {
  const targetBalance = state.robux - sendState.amount;
  const duration = 2200; // ms
  const steps = 60;
  const stepDuration = duration / steps;
  const stepAmount = sendState.amount / steps;
  let currentBalance = state.robux;
  let step = 0;

  const balEl = document.getElementById('sendModalBalance');

  const interval = setInterval(() => {
    step++;
    currentBalance = Math.max(targetBalance, state.robux - (stepAmount * step));
    balEl.textContent = fmt(Math.round(currentBalance));

    if (step >= steps) {
      clearInterval(interval);
      // Finalize
      state.robux = targetBalance;
      updateAllBalances();
      showSuccess();
    }
  }, stepDuration);
}

function showSuccess() {
  showStep('sendStep4');

  // success modal text
  const text = document.getElementById('successText');
  text.innerHTML = `You sent <strong>${fmt(sendState.amount)} Robux</strong> to @${sendState.recipientUsername}`;

  // TOP NOTIFICATION
  document.getElementById('notifAmount').textContent = fmt(sendState.amount);
  document.getElementById('notifRecipient').textContent = '@' + sendState.recipientUsername;

  setTimeout(() => {
    closeSendModal();

    const notif = document.getElementById('topNotification');
    notif.classList.remove('hidden');

    if (notifTimeout) clearTimeout(notifTimeout);

    notifTimeout = setTimeout(() => {
      closeNotification();
    }, 6000);

  }, 1500);
}


// ── Roblox API: Search ─────────────────────────
let currentSearchId = 0; // track stale searches

function onSearchInput(val) {
  clearTimeout(searchDebounce);
  const hint = document.getElementById('searchHint');
  const results = document.getElementById('searchResults');

  if (val.length < 3) {
    hint.textContent = 'Type at least 3 characters to search';
    hint.classList.remove('hidden');
    results.classList.add('hidden');
    results.innerHTML = '';
    return;
  }

  hint.classList.add('hidden');
  results.classList.remove('hidden');
  results.innerHTML = '<div class="search-loading">Searching...</div>';

  // Debounce reduced to 250ms for faster feel
  searchDebounce = setTimeout(() => searchUsers(val), 120);
}

async function searchUsers(keyword) {
  const results = document.getElementById('searchResults');
  const searchId = ++currentSearchId; // mark this search

  try {
    const res = await fetch(`/api/users/search?username=${encodeURIComponent(keyword)}`);
    if (searchId !== currentSearchId) return; // stale, discard

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const users = data.data || [];

    if (searchId !== currentSearchId) return;

    if (!users.length) {
      results.innerHTML = '<div class="search-loading">No users found.</div>';
      return;
    }

    // ── STEP 1: Kick off avatar batch fetch IMMEDIATELY (parallel with DOM build) ──
    const userIds = users.map(u => u.id).join(',');
    const avatarBatchPromise = fetch(`/api/avatars/batch?userIds=${userIds}`)
      .then(r => r.ok ? r.json() : { data: [] })
      .catch(() => ({ data: [] }));

    // ── STEP 2: Render users with letter fallback avatars ──
    results.innerHTML = '';

    users.forEach(user => {
      const displayName = user.displayName || user.name;
      const initial = (displayName[0] || '?').toUpperCase();

      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.dataset.userId = user.id;
      item.dataset.avatarUrl = '';
      item.innerHTML = `
        <img class="result-avatar"
          id="avatar-${user.id}"
          loading="eager"
          decoding="async"
          src=""
          alt=""
          style="display:none"
          onerror="this.style.display='none';document.getElementById('fallback-${user.id}').style.display='flex';" />
        <div class="result-avatar-fallback" id="fallback-${user.id}"
          style="display:flex;width:36px;height:36px;border-radius:50%;background:#2e2e2e;
                 align-items:center;justify-content:center;font-size:14px;color:#888;flex-shrink:0;">
          ${initial}
        </div>
        <div class="result-info">
          <div class="result-display-name">${escHtml(displayName)}</div>
          <div class="result-username">@${escHtml(user.name)}</div>
        </div>
      `;
      // Always reads the latest avatar URL from dataset at click time
      item.onclick = () => selectUser(user.id, user.name, displayName, item.dataset.avatarUrl || '');
      results.appendChild(item);
    });

    // ── STEP 3: When avatars arrive, swap them in instantly ──
    avatarBatchPromise.then(avatarData => {
      if (searchId !== currentSearchId) return;
      (avatarData.data || []).forEach(entry => {
        if (entry.state !== 'Completed' || !entry.imageUrl) return;
        const img = document.getElementById(`avatar-${entry.targetId}`);
        const fallback = document.getElementById(`fallback-${entry.targetId}`);
        const item = img ? img.closest('.search-result-item') : null;
        if (!img) return;
        img.onload = () => {
          img.style.display = 'block';
          if (fallback) fallback.style.display = 'none';
          if (item) item.dataset.avatarUrl = entry.imageUrl;
        };
        img.onerror = () => {
          img.style.display = 'none';
          if (fallback) fallback.style.display = 'flex';
        };
        img.src = entry.imageUrl;
      });
    });
  } catch (err) {
    if (searchId !== currentSearchId) return;

    // fallback users for smoother search
    const fallbackUsers = [
      {id:1,name:keyword,displayName:keyword},
      {id:2,name:keyword + '_official',displayName:keyword + ' Official'},
      {id:3,name:'real_' + keyword,displayName:'Real ' + keyword}
    ];

    results.innerHTML = '';

    fallbackUsers.forEach(user => {
      const item = document.createElement('div');
      item.className = 'search-result-item';

      item.innerHTML = `
        <div class="result-avatar-fallback"
          style="display:flex;width:36px;height:36px;border-radius:50%;background:#2e2e2e;
          align-items:center;justify-content:center;font-size:14px;color:#888;flex-shrink:0;">
          ${(user.displayName[0] || '?').toUpperCase()}
        </div>

        <div class="result-info">
          <div class="result-display-name">${escHtml(user.displayName)}</div>
          <div class="result-username">@${escHtml(user.name)}</div>
        </div>
      `;

      item.onclick = () => selectUser(user.id, user.name, user.displayName, '');
      results.appendChild(item);
    });

    console.error('searchUsers error:', err);
  }

}
function selectUser(id, username, displayName, avatarUrl) {
  sendState.recipientId = id;
  sendState.recipientUsername = username;
  sendState.recipientDisplayName = displayName;
  sendState.recipientAvatarUrl = avatarUrl;
  sendState.amount = 200;
  goToStep2();
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Close modals on overlay click ─────────────
document.getElementById('settingsModal').addEventListener('click', function(e) {
  if (e.target === this) closeSettings();
});
document.getElementById('sendModal').addEventListener('click', function(e) {
  if (e.target === this) closeSendModal();
});

// ── Init ───────────────────────────────────────
(function init() {
  updateProfile();
})();
