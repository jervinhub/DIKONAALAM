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
    alert("You don't have enough Robux!");
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

function startSending() {
  const targetBalance = state.robux - sendState.amount;
  const duration = 2200;
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
      state.robux = targetBalance;
      updateAllBalances();
      showSuccess();
    }
  }, stepDuration);
}

function showSuccess() {
  showStep('sendStep4');

  const text = document.getElementById('successText');
  text.innerHTML = `You sent <strong>${fmt(sendState.amount)} Robux</strong> to @${sendState.recipientUsername}`;

  document.getElementById('notifAmount').textContent = fmt(sendState.amount);
  document.getElementById('notifRecipient').textContent = '@' + sendState.recipientUsername;

  setTimeout(() => {
    closeSendModal();
    const notif = document.getElementById('topNotification');
    notif.classList.remove('hidden');
    if (notifTimeout) clearTimeout(notifTimeout);
    notifTimeout = setTimeout(() => closeNotification(), 6000);
  }, 1500);
}

// ── Roblox API: Search ─────────────────────────
let currentSearchId = 0;

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

  searchDebounce = setTimeout(() => searchUsers(val), 300);
}

async function searchUsers(keyword) {
  const results = document.getElementById('searchResults');
  const searchId = ++currentSearchId;

  // ── 1. Search users ──
  let users = [];
  try {
    const res = await fetch('/api/users/search?username=' + encodeURIComponent(keyword));
    if (searchId !== currentSearchId) return;
    const data = await res.json();
    users = (data && data.data) ? data.data : [];
  } catch (err) {
    console.error('Search error:', err);
  }

  if (searchId !== currentSearchId) return;

  if (!users.length) {
    results.innerHTML = '<div class="search-loading">No users found.</div>';
    return;
  }

  // ── 2. Show top 1 user instantly with letter fallback ──
  const user = users[0];
  const displayName = user.displayName || user.name || keyword;
  const initial = (displayName[0] || '?').toUpperCase();
  const uid = user.id;

  const item = document.createElement('div');
  item.className = 'search-result-item';
  item.dataset.avatarUrl = '';
  item.style.cursor = 'pointer';

  const fb = document.createElement('div');
  fb.id = 'fallback-' + uid;
  fb.style.cssText = 'display:flex;width:42px;height:42px;border-radius:50%;background:#353535;align-items:center;justify-content:center;font-size:16px;font-weight:600;color:#ccc;flex-shrink:0;';
  fb.textContent = initial;

  const img = document.createElement('img');
  img.id = 'avatar-' + uid;
  img.style.cssText = 'display:none;width:42px;height:42px;border-radius:50%;object-fit:cover;flex-shrink:0;';
  img.alt = '';

  const info = document.createElement('div');
  info.className = 'result-info';
  info.innerHTML = '<div class="result-display-name">' + escHtml(displayName) + '</div><div class="result-username">@' + escHtml(user.name) + '</div>';

  item.appendChild(fb);
  item.appendChild(img);
  item.appendChild(info);
  item.onclick = function() {
    selectUser(uid, user.name, displayName, item.dataset.avatarUrl || '');
  };

  results.innerHTML = '';
  results.appendChild(item);

  // ── 3. Fetch avatar for this user only ──
  try {
    const avatarRes = await fetch('/api/avatar/' + uid);
    if (searchId !== currentSearchId) return;
    const avatarData = await avatarRes.json();
    const entries = avatarData && avatarData.data ? avatarData.data : [];
    const entry = entries[0];
    if (entry && entry.imageUrl) {
      img.onload = function() {
        img.style.display = 'block';
        fb.style.display = 'none';
        item.dataset.avatarUrl = entry.imageUrl;
      };
      img.onerror = function() {
        img.style.display = 'none';
        fb.style.display = 'flex';
      };
      img.src = entry.imageUrl;
    }
  } catch (err) {
    console.error('Avatar error:', err);
    // letter fallback stays — user can still click and send
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
