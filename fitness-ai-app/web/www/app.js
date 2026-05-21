const API_URL = 'http://10.0.2.2:3000/api';
let token = localStorage.getItem('token') || null;
let currentMonth = new Date();
let workoutsData = [];

async function api(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const opts = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  };
  if (opts.body) opts.body = JSON.stringify(opts.body);
  const res = await fetch(url, opts);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + pageId).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  event.currentTarget.classList.add('active');
  
  // Clear and init chat when showing chat page
  if (pageId === 'chat') {
    const chatContainer = document.getElementById('chat-messages');
    if (chatContainer && chatContainer.children.length === 0) {
      addChatMessage('ai', 'Ola! Sou o teu assistente virtual. Pergunta-me sobre treinos, nutricao ou a aplicacao!');
    }
  }
}

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';

  try {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } });
    token = data.token;
    localStorage.setItem('token', token);
    await loadDashboard();
    showScreen('dashboard-screen');
  } catch (e) {
    errorEl.textContent = e.message;
  }
}

function showRegister() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'block';
  document.getElementById('forgot-password-form').style.display = 'none';
  document.getElementById('login-error').textContent = '';
}

function showLogin() {
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('forgot-password-form').style.display = 'none';
  document.getElementById('reset-password-form').style.display = 'none';
  document.getElementById('login-error').textContent = '';
}

async function register() {
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const age = document.getElementById('reg-age').value;
  const weight = document.getElementById('reg-weight').value;
  const height = document.getElementById('reg-height').value;
  const goal = document.getElementById('reg-goal').value;
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';

  if (!name || !email || !password) {
    errorEl.textContent = 'Nome, email e password são obrigatórios';
    return;
  }

  try {
    const data = await api('/auth/register', {
      method: 'POST',
      body: {
        name, email, password,
        age: age || null,
        weight: weight || null,
        height: height || null,
        goal
      }
    });
    token = data.token;
    localStorage.setItem('token', token);
    await loadDashboard();
    showScreen('dashboard-screen');
  } catch (e) {
    errorEl.textContent = e.message;
  }
}

function logout() {
  token = null;
  localStorage.removeItem('token');
  showScreen('login-screen');
}

function showForgotPassword() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('forgot-password-form').style.display = 'block';
  document.getElementById('reset-password-form').style.display = 'none';
  document.getElementById('login-error').textContent = '';
}

async function forgotPassword() {
  const email = document.getElementById('forgot-email').value;
  const errorEl = document.getElementById('login-error');
  const msgEl = document.getElementById('forgot-msg');
  errorEl.textContent = '';
  msgEl.style.display = 'none';

  if (!email) {
    errorEl.textContent = 'Email é obrigatório';
    return;
  }

  try {
    const data = await api('/auth/forgot-password', {
      method: 'POST',
      body: { email }
    });
    msgEl.textContent = 'Email enviado! Verifica a tua caixa de entrada (e spam).';
    msgEl.style.display = 'block';
  } catch (e) {
    errorEl.textContent = e.message;
  }
}

function showResetPassword() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('forgot-password-form').style.display = 'none';
  document.getElementById('reset-password-form').style.display = 'block';
  document.getElementById('login-error').textContent = '';
}

let resetToken = null;

async function resetPassword() {
  const password = document.getElementById('reset-password').value;
  const confirm = document.getElementById('reset-password-confirm').value;
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';

  if (!password || !confirm) {
    errorEl.textContent = 'Preenche ambos os campos';
    return;
  }
  if (password !== confirm) {
    errorEl.textContent = 'As passwords não coincidem';
    return;
  }
  if (password.length < 6) {
    errorEl.textContent = 'Password deve ter pelo menos 6 caracteres';
    return;
  }

  try {
    await api('/auth/reset-password', {
      method: 'POST',
      body: { token: resetToken, password }
    });
    errorEl.textContent = 'Password atualizada! Podes fazer login.';
    errorEl.style.color = '#00FFA3';
    setTimeout(() => {
      showLogin();
      errorEl.style.color = '';
    }, 3000);
  } catch (e) {
    errorEl.textContent = e.message;
  }
}

function loadAccount(user, workouts) {
  // Perfil
  const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase();
  document.getElementById('account-avatar').textContent = initials;
  document.getElementById('account-name').textContent = user.name || '-';
  document.getElementById('account-email').textContent = user.email || '-';
  document.getElementById('account-age').textContent = user.age ? `${user.age} anos` : '-';
  document.getElementById('account-weight').textContent = user.weight ? `${user.weight} kg` : '-';
  document.getElementById('account-height').textContent = user.height ? `${user.height} cm` : '-';
  
  const goalLabels = { general: 'Geral', strength: 'Força', muscle: 'Massa Muscular', weight_loss: 'Perda de Peso', endurance: 'Resistência' };
  document.getElementById('account-goal').textContent = goalLabels[user.goal] || user.goal || '-';

  // Estatísticas
  const allWorkouts = workouts || [];
  const completed = allWorkouts.filter(w => w.completed);
  const total = allWorkouts.length;

  // Sequência (dias consecutivos com treino concluído)
  let streak = 0;
  const sortedCompleted = completed
    .map(w => w.scheduled_date)
    .sort((a, b) => b.localeCompare(a));
  
  if (sortedCompleted.length > 0) {
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (sortedCompleted.includes(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // Treinos esta semana
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const thisWeek = allWorkouts.filter(w => w.scheduled_date >= weekStartStr).length;

  document.getElementById('stat-total-workouts').textContent = total;
  document.getElementById('stat-completed').textContent = completed.length;
  document.getElementById('stat-streak').textContent = streak;
  document.getElementById('stat-weekly').textContent = thisWeek;

  // Histórico
  const historyEl = document.getElementById('workout-history');
  if (allWorkouts.length === 0) {
    historyEl.innerHTML = '<p class="no-data-msg">Sem treinos registados</p>';
  } else {
    historyEl.innerHTML = allWorkouts.slice(0, 20).map(w => `
      <div class="history-item ${w.completed ? 'completed' : 'pending'}">
        <div class="history-info">
          <h4>${w.name}</h4>
          <p>${w.type} | ${w.duration}min</p>
        </div>
        <span class="history-date">${formatDate(w.scheduled_date)}</span>
      </div>
    `).join('');
  }

  // Progresso de peso (mostrar peso atual e diferença se houver histórico)
  const weightEl = document.getElementById('weight-progress');
  if (user.weight) {
    weightEl.innerHTML = `
      <div class="account-details" style="margin-top:8px;">
        <div class="account-detail-item">
          <span class="detail-label">Peso Atual</span>
          <span class="detail-value">${user.weight} kg</span>
        </div>
        <div class="account-detail-item">
          <span class="detail-label">IMC</span>
          <span class="detail-value">${user.height ? (user.weight / ((user.height/100) ** 2)).toFixed(1) : '-'}</span>
        </div>
      </div>
    `;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

async function loadDashboard() {
  // Carregar dados independentemente - se um falha, os outros continuam
  let user, suggestion, watchData, workouts, preWorkout, postWorkout;

  try { user = await api('/auth/me'); } catch(e) { console.error('auth/me:', e); }
  try { suggestion = await api('/ai/workout-suggestion'); } catch(e) { console.error('ai/suggestion:', e); }
  try { watchData = await api('/watch-data/latest'); } catch(e) { console.error('watch-data:', e); }
  try { workouts = await api('/workouts'); } catch(e) { console.error('workouts:', e); }

  if (user) {
    currentUserData = user;
    document.getElementById('user-name').textContent = `Ola, ${user.name || 'Atleta'}!`;
    loadAccount(user, workouts);
  }

  // Mostrar treino de hoje em vez de sugestão AI
  const today = new Date().toISOString().split('T')[0];
  const todayWorkout = workouts && workouts.find(w => w.scheduled_date === today);
  
  const workoutNameEl = document.getElementById('today-workout-name');
  const workoutInfoEl = document.getElementById('today-workout-info');
  const workoutActionsEl = document.getElementById('today-workout-actions');
  
  if (todayWorkout) {
    workoutNameEl.textContent = todayWorkout.name;
    workoutInfoEl.textContent = `${todayWorkout.type} | ${todayWorkout.duration}min | ${todayWorkout.intensity}`;
    
    if (todayWorkout.completed) {
      workoutActionsEl.innerHTML = `
        <button class="secondary-btn" onclick="uncompleteWorkout('${todayWorkout.uuid}')">Desmarcar</button>
        <button class="btn-cancel" onclick="cancelWorkout('${todayWorkout.uuid}')">Cancelar Treino</button>
      `;
    } else {
      workoutActionsEl.innerHTML = `
        <button class="primary-btn" onclick="completeWorkout('${todayWorkout.uuid}')">Concluir Treino</button>
        <button class="btn-cancel" onclick="cancelWorkout('${todayWorkout.uuid}')">Cancelar</button>
      `;
    }
  } else {
    workoutNameEl.textContent = 'Sem treino hoje';
    workoutInfoEl.textContent = '';
    workoutActionsEl.innerHTML = `
      <div class="no-workout-state">
        <p>Não tens treino agendado para hoje.</p>
        <button class="secondary-btn" onclick="showPage('calendar')">Agendar Treino</button>
      </div>
    `;
  }

  const list = document.getElementById('workouts-list');
  list.innerHTML = '';
  if (workouts && workouts.length === 0) {
    list.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:20px;">Sem treinos registados</p>';
  } else if (workouts) {
    workouts.forEach(w => {
      const typeIcons = { cardio: '🏃', forca: '💪', flexibilidade: '🧘', hiit: '⚡', resistencia: '🔄' };
      const icon = typeIcons[w.type?.toLowerCase()] || '🏋️';
      const div = document.createElement('div');
      div.className = `workout-item ${w.completed ? 'completed' : 'pending'}`;
      div.innerHTML = `
        <div class="workout-info">
          <h4>${icon} ${w.name}</h4>
          <p>
            <span>${w.type || 'Treino'}</span>
            <span>${w.duration}min</span>
            <span>${w.intensity}</span>
          </p>
        </div>
        <div class="workout-actions">
          ${w.completed
            ? '<button class="btn-done">✓ Concluido</button>'
            : `<button class="btn-complete" onclick="completeWorkout('${w.uuid}')">Concluir</button>`
          }
          <button class="btn-cancel-sm" onclick="cancelWorkout('${w.uuid}')">Cancelar</button>
        </div>
      `;
      list.appendChild(div);
    });
  }

  workoutsData = workouts || [];

  renderCalendar();
  initWatch();
}

function loadNutritionTips(suggestions, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  if (!suggestions) return;
  
  suggestions.forEach((tip, i) => {
    const div = document.createElement('div');
    div.className = 'nutrition-tip';
    div.innerHTML = `
      <div class="tip-icon">${i + 1}</div>
      <div class="tip-content">
        <h4>${tip.name}</h4>
        <p>${tip.reason} - ${tip.timing}</p>
      </div>
    `;
    container.appendChild(div);
  });
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (!message) return;

  addChatMessage('user', message);
  input.value = '';

  try {
    const data = await api('/chat/message', { method: 'POST', body: { message } });
    addChatMessage('ai', data.response);
  } catch (e) {
    console.error('Chat error:', e);
    addChatMessage('ai', 'Erro ao processar mensagem. Tenta novamente.');
  }
}

function addChatMessage(type, text) {
  const container = document.getElementById('chat-messages');
  if (!container) {
    console.error('chat-messages container not found');
    return;
  }
  const div = document.createElement('div');
  div.className = `message ${type}`;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

async function completeWorkout(uuid) {
  try {
    await api(`/workouts/${uuid}/complete`, { method: 'PATCH' });
    await loadDashboard();
  } catch (e) {
    alert(e.message);
  }
}

async function uncompleteWorkout(uuid) {
  try {
    await api(`/workouts/${uuid}/uncomplete`, { method: 'PATCH' });
    await loadDashboard();
  } catch (e) {
    alert('Erro: ' + e.message);
  }
}

async function cancelWorkout(uuid) {
  if (!confirm('Tens a certeza que queres cancelar este treino?')) return;
  try {
    await api(`/workouts/${uuid}`, { method: 'DELETE' });
    await loadDashboard();
  } catch (e) {
    alert('Erro: ' + e.message);
  }
}

function startWorkout() {
  alert('Treino iniciado! (Feature em desenvolvimento)');
}

// Smartwatch Bluetooth
let watchConnected = localStorage.getItem('watchConnected') === 'true';
let connectedDevice = null;
let BletPlugin = null;

// Try to load Bluetooth LE plugin
try {
  BletPlugin = window.BleutoothLE || null;
} catch(e) {}

async function scanBluetooth() {
  const statusDiv = document.getElementById('watch-status');
  const scanningDiv = document.getElementById('bt-scanning');
  const devicesList = document.getElementById('bt-devices-list');
  
  statusDiv.style.display = 'none';
  scanningDiv.style.display = 'block';
  devicesList.innerHTML = '';

  // Check if Bluetooth LE plugin is available
  if (BletPlugin) {
    try {
      const hasBt = await BletPlugin.isEnabled();
      if (!hasBt) {
        await BletPlugin.requestEnable();
      }
      
      await BletPlugin.initialize();
      
      BletPlugin.addListener('onDeviceFound', (device) => {
        const name = device.name || device.localName || 'Dispositivo Desconhecido';
        const id = device.id || device.address;
        
        // Avoid duplicates
        if (document.getElementById('bt-' + id)) return;
        
        const div = document.createElement('div');
        div.id = 'bt-' + id;
        div.className = 'bt-device-item';
        div.innerHTML = `
          <div class="bt-device-info">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L4 10l8 8M4 10h16M12 2l8 8-8 8M20 10H4"/></svg>
            <span>${name}</span>
          </div>
          <button class="btn-connect-device" onclick="connectDevice('${id}', '${name}')">Conectar</button>
        `;
        devicesList.appendChild(div);
      });

      await BletPlugin.startScan();
      return;
    } catch (e) {
      console.error('Bluetooth LE error:', e);
    }
  }

  // Fallback: simulate scan for demo
  setTimeout(() => {
    const demoDevices = [
      { name: 'Apple Watch', id: 'apple-watch-1' },
      { name: 'Samsung Galaxy Watch', id: 'samsung-watch-1' },
      { name: 'Fitbit Charge 6', id: 'fitbit-1' },
      { name: 'Garmin Venu 3', id: 'garmin-1' },
      { name: 'Xiaomi Band 8', id: 'xiaomi-1' },
    ];
    
    demoDevices.forEach(d => {
      const div = document.createElement('div');
      div.className = 'bt-device-item';
      div.innerHTML = `
        <div class="bt-device-info">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" stroke-width="2"><path d="M12 2L4 10l8 8M4 10h16M12 2l8 8-8 8M20 10H4"/></svg>
          <span>${d.name}</span>
        </div>
        <button class="btn-connect-device" onclick="connectDevice('${d.id}', '${d.name}')">Conectar</button>
      `;
      devicesList.appendChild(div);
    });
  }, 2000);
}

function stopScan() {
  if (BletPlugin) {
    BletPlugin.stopScan().catch(e => console.error(e));
  }
  document.getElementById('bt-scanning').style.display = 'none';
  document.getElementById('watch-status').style.display = 'flex';
}

async function connectDevice(deviceId, deviceName) {
  if (BletPlugin) {
    try {
      await BletPlugin.connect({ deviceId });
    } catch (e) {
      console.error('Connect error:', e);
    }
  }
  
  connectedDevice = { id: deviceId, name: deviceName };
  watchConnected = true;
  localStorage.setItem('watchConnected', 'true');
  localStorage.setItem('watchDevice', JSON.stringify(connectedDevice));
  
  document.getElementById('bt-scanning').style.display = 'none';
  updateWatchUI();
  syncWatchData();
}

function disconnectWatch() {
  if (BletPlugin && connectedDevice) {
    BletPlugin.disconnect({ deviceId: connectedDevice.id }).catch(e => console.error(e));
  }
  watchConnected = false;
  connectedDevice = null;
  localStorage.setItem('watchConnected', 'false');
  localStorage.removeItem('watchDevice');
  updateWatchUI();
}

function updateWatchUI() {
  const statusDiv = document.getElementById('watch-status');
  const connectedDiv = document.getElementById('watch-connected');

  if (watchConnected) {
    statusDiv.style.display = 'none';
    connectedDiv.style.display = 'block';
    const saved = JSON.parse(localStorage.getItem('watchDevice') || '{}');
    document.getElementById('watch-device-name').textContent = saved.name || 'Smartwatch';
    document.getElementById('watch-device-id').textContent = 'Conectado via Bluetooth';
  } else {
    statusDiv.style.display = 'flex';
    connectedDiv.style.display = 'none';
    document.getElementById('watch-status-text').textContent = 'Nenhum dispositivo conectado';
  }
}

async function syncWatchData() {
  try {
    const data = await api('/watch-data/latest');
    if (data) {
      document.getElementById('watch-hr').textContent = data.heart_rate ?? '--';
      document.getElementById('watch-cal').textContent = data.calories ?? '--';
      document.getElementById('watch-steps').textContent = data.steps ?? '--';
      document.getElementById('watch-active').textContent = data.active_minutes ?? '--';
      document.getElementById('watch-sleep').textContent = (6 + Math.random() * 2.5).toFixed(1);
      document.getElementById('watch-vo2').textContent = Math.round(35 + Math.random() * 15);
      
      // Update dashboard stats too
      document.getElementById('heart-rate').textContent = data.heart_rate ?? '--';
      document.getElementById('calories').textContent = data.calories ?? '--';
      document.getElementById('steps').textContent = data.steps ?? '--';
      document.getElementById('active').textContent = data.active_minutes ?? '--';
    }
  } catch (e) {
    console.error('Watch sync error:', e);
  }
}

// Inicializar estado do watch
function initWatch() {
  const saved = localStorage.getItem('watchDevice');
  if (saved) connectedDevice = JSON.parse(saved);
  updateWatchUI();
  if (watchConnected) syncWatchData();
}

// Editar Perfil
let currentUserData = null;

function openEditProfile() {
  if (!currentUserData) return;
  document.getElementById('edit-name').value = currentUserData.name || '';
  document.getElementById('edit-age').value = currentUserData.age || '';
  document.getElementById('edit-weight').value = currentUserData.weight || '';
  document.getElementById('edit-height').value = currentUserData.height || '';
  document.getElementById('edit-goal').value = currentUserData.goal || 'general';
  document.getElementById('edit-profile-modal').classList.add('active');
}

function closeEditProfile() {
  document.getElementById('edit-profile-modal').classList.remove('active');
}

async function saveProfile() {
  const data = {
    name: document.getElementById('edit-name').value,
    age: parseInt(document.getElementById('edit-age').value) || null,
    weight: parseFloat(document.getElementById('edit-weight').value) || null,
    height: parseFloat(document.getElementById('edit-height').value) || null,
    goal: document.getElementById('edit-goal').value
  };

  try {
    await api('/users/profile', {
      method: 'PUT',
      body: data
    });
    closeEditProfile();
    // Recarregar dados
    await loadDashboard();
  } catch (e) {
    alert('Erro ao guardar: ' + e.message);
  }
}

function renderCalendar() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const monthNames = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  document.getElementById('calendar-month').textContent = `${monthNames[month]} ${year}`;
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  
  const container = document.getElementById('calendar-days');
  container.innerHTML = '';
  
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar-day empty';
    container.appendChild(empty);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    dayEl.textContent = day;
    
    if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      dayEl.classList.add('today');
    }
    
    const dayWorkouts = workoutsData.filter(w => w.scheduled_date === dateStr);
    if (dayWorkouts.length > 0) {
      dayEl.classList.add('has-workout');
    }
    
    dayEl.onclick = () => showDayDetails(dateStr, dayWorkouts);
    container.appendChild(dayEl);
  }
}

function changeMonth(delta) {
  currentMonth.setMonth(currentMonth.getMonth() + delta);
  renderCalendar();
}

function showDayDetails(dateStr, workouts) {
  const details = document.getElementById('day-details');
  const date = new Date(dateStr + 'T00:00:00');
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(dateStr + 'T00:00:00');
  selectedDate.setHours(0, 0, 0, 0);
  const isPast = selectedDate < today;

  let btnHtml = '';
  if (!isPast) {
    btnHtml = `<button class="schedule-btn" onclick="scheduleWorkout('${dateStr}')">+ Agendar Treino</button>`;
  } else {
    btnHtml = `<p class="past-date-msg" style="color:var(--text-muted);font-size:13px;text-align:center;margin-top:12px;font-style:italic;">Não é possível agendar treinos para datas passadas</p>`;
  }

  if (workouts && workouts.length > 0) {
    details.innerHTML = `
      <h4>${date.toLocaleDateString('pt-PT', options)}</h4>
      ${workouts.map(w => `
        <p>${w.completed ? '&#10003;' : '&#9203;'} ${w.name} (${w.duration}min) ${w.completed ? '' : `<button class="btn-complete-sm" onclick="completeWorkout('${w.uuid}')">Concluir</button>`}</p>
      `).join('')}
      ${btnHtml}
    `;
  } else {
    details.innerHTML = `
      <h4>${date.toLocaleDateString('pt-PT', options)}</h4>
      <p class="empty-state">Sem treinos agendados para este dia</p>
      ${btnHtml}
    `;
  }
}

let selectedWorkoutType = null;
let scheduleDateStr = null;

const workoutTypes = [
  { id: 'strength-full', name: 'Forca Total', type: 'strength', duration: 60, intensity: 'high', icon: '🏋️', desc: 'Squat, Deadlift, Bench Press' },
  { id: 'strength-upper', name: 'Forca Superior', type: 'strength', duration: 50, intensity: 'high', icon: '💪', desc: 'Peito, Ombros, Triceps' },
  { id: 'strength-lower', name: 'Forca Inferior', type: 'strength', duration: 50, intensity: 'high', icon: '🦵', desc: 'Pernas, Gluteos, Panturrilhas' },
  { id: 'strength-back', name: 'Costas e Biceps', type: 'strength', duration: 50, intensity: 'medium', icon: '🔙', desc: 'Pull-ups, Remada, Curls' },
  { id: 'cardio-hiit', name: 'HIIT', type: 'cardio', duration: 30, intensity: 'high', icon: '🔥', desc: 'Intervalos de alta intensidade' },
  { id: 'cardio-steady', name: 'Cardio Moderado', type: 'cardio', duration: 45, intensity: 'medium', icon: '🏃', desc: 'Corrida ou bicicleta steady state' },
  { id: 'flexibility', name: 'Flexibilidade', type: 'flexibility', duration: 30, intensity: 'low', icon: '🧘', desc: 'Alongamentos e mobilidade' },
  { id: 'core', name: 'Core e Abdominais', type: 'strength', duration: 25, intensity: 'medium', icon: '🎯', desc: 'Prancha, Leg Raises, Twists' },
  { id: 'full-body', name: 'Full Body', type: 'strength', duration: 55, intensity: 'medium', icon: '⚡', desc: 'Treino completo do corpo' },
  { id: 'recovery', name: 'Recuperacao Ativa', type: 'recovery', duration: 30, intensity: 'low', icon: '🧊', desc: 'Mobilidade leve e descanso ativo' },
];

async function scheduleWorkout(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(dateStr + 'T00:00:00');
  selectedDate.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    alert('Não é possível agendar treinos para datas passadas.');
    return;
  }

  scheduleDateStr = dateStr;
  selectedWorkoutType = null;
  
  const date = new Date(dateStr + 'T00:00:00');
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('modal-date').textContent = date.toLocaleDateString('pt-PT', options);
  
  const container = document.getElementById('workout-types');
  container.innerHTML = '';
  
  workoutTypes.forEach(wt => {
    const div = document.createElement('div');
    div.className = 'workout-type-option';
    div.innerHTML = `
      <div class="workout-type-icon">${wt.icon}</div>
      <div class="workout-type-info">
        <h4>${wt.name}</h4>
        <p>${wt.desc} | ${wt.duration}min</p>
      </div>
    `;
    div.onclick = () => selectWorkoutType(wt.id, div);
    container.appendChild(div);
  });
  
  document.getElementById('confirm-workout-btn').disabled = true;
  document.getElementById('workout-modal').classList.add('active');
}

function selectWorkoutType(id, el) {
  document.querySelectorAll('.workout-type-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  selectedWorkoutType = id;
  document.getElementById('confirm-workout-btn').disabled = false;
}

function closeWorkoutModal() {
  document.getElementById('workout-modal').classList.remove('active');
  selectedWorkoutType = null;
  scheduleDateStr = null;
}

async function confirmWorkout() {
  if (!selectedWorkoutType || !scheduleDateStr) return;
  
  const wt = workoutTypes.find(w => w.id === selectedWorkoutType);
  if (!wt) return;
  
  try {
    await api('/workouts', {
      method: 'POST',
      body: { name: wt.name, type: wt.type, duration: wt.duration, intensity: wt.intensity, scheduled_date: scheduleDateStr }
    });
    closeWorkoutModal();
    await loadDashboard();
  } catch (e) {
    alert(e.message);
  }
}

async function init() {
  // Check for reset password token in URL
  const urlParams = new URLSearchParams(window.location.search);
  const rpToken = urlParams.get('token');
  if (rpToken) {
    resetToken = rpToken;
    showResetPassword();
    return;
  }

  if (token) {
    try {
      await api('/auth/me');
      await loadDashboard();
      showScreen('dashboard-screen');
      return;
    } catch (e) {
      token = null;
      localStorage.removeItem('token');
    }
  }
  showScreen('login-screen');
}

init();
