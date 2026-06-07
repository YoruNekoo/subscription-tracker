/* ==========================================
   APPLICATION CORE LOGIC
   SubTracker Pro - Premium PWA Javascript
   ========================================== */

// 1. Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('[Service Worker] Registered successfully', reg.scope))
      .catch(err => console.error('[Service Worker] Registration failed', err));
  });
}

// 2. Default Currency Mock Conversion Rates (Base USD)
const CONVERSION_RATES = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  IDR: 16300,
  JPY: 156,
  CAD: 1.37,
  AUD: 1.51
};

// Mock Subscriptions for first-time visual setup
const MOCK_SUBSCRIPTIONS = [
  {
    id: 'mock-1',
    name: 'Netflix Premium',
    price: 15.49,
    currency: 'USD',
    cycle: 'monthly',
    category: 'Entertainment',
    date: '', // Will be calculated relative to today
    method: 'Credit Card',
    color: '#ef4444',
    notes: 'Premium 4K streaming shared with family.',
    active: true
  },
  {
    id: 'mock-2',
    name: 'Spotify Premium',
    price: 10.99,
    currency: 'USD',
    cycle: 'monthly',
    category: 'Entertainment',
    date: '', 
    method: 'PayPal',
    color: '#22c55e',
    notes: 'Duo plan. Autopay enabled.',
    active: true
  },
  {
    id: 'mock-3',
    name: 'AWS Cloud Services',
    price: 45.00,
    currency: 'USD',
    cycle: 'monthly',
    category: 'Software',
    date: '', 
    method: 'Credit Card',
    color: '#f97316',
    notes: 'Dev databases and testing instances.',
    active: true
  },
  {
    id: 'mock-4',
    name: 'Gym Membership',
    price: 360.00,
    currency: 'USD',
    cycle: 'yearly',
    category: 'Health',
    date: '', 
    method: 'Debit Card',
    color: '#06b6d4',
    notes: 'Annual fitness club package.',
    active: true
  },
  {
    id: 'mock-5',
    name: 'GitHub Copilot',
    price: 10.00,
    currency: 'USD',
    cycle: 'monthly',
    category: 'Software',
    date: '', 
    method: 'Google Pay',
    color: '#a855f7',
    notes: 'AI coding assistance companion.',
    active: true
  },
  {
    id: 'mock-6',
    name: 'iCloud Storage 2TB',
    price: 9.99,
    currency: 'USD',
    cycle: 'monthly',
    category: 'Utilities',
    date: '', 
    method: 'Apple Pay',
    color: '#3b82f6',
    notes: 'Family cloud backup storage.',
    active: false
  }
];

// App State
let state = {
  subscriptions: [],
  settings: {
    currency: 'USD',
    notifications: false
  }
};

// DOM Elements
const sections = document.querySelectorAll('.content-section');
const navItems = document.querySelectorAll('.nav-item, .mobile-nav-item');
const headerTitle = document.getElementById('header-title');
const liveDateEl = document.getElementById('live-date');
const dashboardDateEl = document.getElementById('dashboard-date-display');
const networkStatusEl = document.getElementById('network-status');
const globalAlertsEl = document.getElementById('global-alerts');

// Form elements
const subscriptionForm = document.getElementById('subscription-form');
const formSectionTitle = document.getElementById('form-section-title');
const subIdInput = document.getElementById('sub-id');
const subNameInput = document.getElementById('sub-name');
const subPriceInput = document.getElementById('sub-price');
const subCurrencySelect = document.getElementById('sub-currency');
const subCycleSelect = document.getElementById('sub-cycle');
const subCategorySelect = document.getElementById('sub-category');
const subDateInput = document.getElementById('sub-date');
const subMethodSelect = document.getElementById('sub-method');
const subNotesTextarea = document.getElementById('sub-notes');
const subCustomColorInput = document.getElementById('sub-custom-color');
const customColorRadio = document.getElementById('color-radio-custom');
const customColorDot = document.querySelector('.custom-picker-btn');

// Metrics elements
const valMonthlySpend = document.getElementById('val-monthly-spend');
const valYearlySpend = document.getElementById('val-yearly-spend');
const valActiveCount = document.getElementById('val-active-count');
const valPausedCount = document.getElementById('val-paused-count');
const valNextRenewal = document.getElementById('val-next-renewal');
const valNextRenewalDays = document.getElementById('val-next-renewal-days');

// Settings elements
const settingsCurrencySelect = document.getElementById('settings-currency');
const settingsNotificationsCheck = document.getElementById('settings-notifications');
const btnExport = document.getElementById('btn-export');
const btnImportTrigger = document.getElementById('btn-import-trigger');
const importFileInput = document.getElementById('import-file-input');
const btnResetDb = document.getElementById('btn-reset-db');

// List & Dashboard items elements
const subscriptionsGrid = document.getElementById('subscriptions-grid');
const upcomingRenewalsTbody = document.getElementById('upcoming-renewals-tbody');
const timelineBarsList = document.getElementById('timeline-bars-list');
const searchInput = document.getElementById('search-input');
const filterCategorySelect = document.getElementById('filter-category');
const sortBySelect = document.getElementById('sort-by');

// Quick navigations
const btnQuickAdd = document.getElementById('btn-quick-add');
const btnCancelForm = document.getElementById('btn-cancel-form');
const btnViewAllSubs = document.getElementById('btn-view-all-subs');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initDate();
  initNetworkStatus();
  loadData();
  setupNavigation();
  setupFormHandlers();
  setupListFilters();
  setupSettingsHandlers();
  checkDueSubscriptions();
});

// Update live date display
function initDate() {
  // Date display removed from UI
}

// Track offline/online network status
function initNetworkStatus() {
  function updateStatus() {
    if (navigator.onLine) {
      networkStatusEl.className = 'offline-badge';
      networkStatusEl.innerHTML = '<span class="dot"></span> Online';
    } else {
      networkStatusEl.className = 'offline-badge offline';
      networkStatusEl.innerHTML = '<span class="dot"></span> Offline Mode';
      showToast('You are offline. Data is saved locally.', 'warning');
    }
  }
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  updateStatus();
}

// Navigation Routing
function setupNavigation() {
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetSection = item.getAttribute('data-section');
      switchSection(targetSection);
    });
  });

  // Mobile header settings button
  const mobHeaderSettings = document.getElementById('mob-header-settings');
  if (mobHeaderSettings) {
    mobHeaderSettings.addEventListener('click', () => {
      switchSection('settings');
    });
  }

  btnQuickAdd.addEventListener('click', () => {
    prepareForm();
    switchSection('add-new');
  });

  btnCancelForm.addEventListener('click', () => {
    switchSection('dashboard');
  });

  btnViewAllSubs.addEventListener('click', () => {
    switchSection('subscriptions');
  });
}

function switchSection(sectionId) {
  // Hide all sections
  sections.forEach(sec => sec.classList.remove('active'));
  
  // Show target section
  const activeSection = document.getElementById(`section-${sectionId}`);
  if (activeSection) {
    activeSection.classList.add('active');
  }

  // Update active state in nav elements (both sidebar & mobile)
  navItems.forEach(item => {
    if (item.getAttribute('data-section') === sectionId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update Header Title
  switch (sectionId) {
    case 'dashboard':
      headerTitle.textContent = 'Overview';
      break;
    case 'subscriptions':
      headerTitle.textContent = 'My Subscriptions';
      renderSubscriptionsList();
      break;
    case 'add-new':
      headerTitle.textContent = subIdInput.value ? 'Edit Subscription' : 'New Subscription';
      break;
    case 'settings':
      headerTitle.textContent = 'Backup & Settings';
      break;
  }

  // Always refresh dashboard metrics when showing dashboard
  if (sectionId === 'dashboard') {
    refreshDashboard();
  }
}

// Load database from LocalStorage
function loadData() {
  // Load settings
  const localSettings = localStorage.getItem('subtracker_settings');
  if (localSettings) {
    state.settings = JSON.parse(localSettings);
  }
  settingsCurrencySelect.value = state.settings.currency;
  settingsNotificationsCheck.checked = state.settings.notifications;

  // Load subscriptions
  const localSubs = localStorage.getItem('subtracker_subscriptions');
  if (localSubs) {
    state.subscriptions = JSON.parse(localSubs);
  } else {
    // Fill with mock values on first launch
    const today = new Date();
    state.subscriptions = MOCK_SUBSCRIPTIONS.map((sub, idx) => {
      // Stagger renewal dates relative to today
      const offsetDays = [5, 12, 2, 20, 18, 25][idx];
      const renewalDate = new Date();
      renewalDate.setDate(today.getDate() + offsetDays);
      return {
        ...sub,
        date: renewalDate.toISOString().split('T')[0]
      };
    });
    saveSubscriptions();
  }

  // Auto-rollover expired subscription dates
  checkAndRolloverExpired();
  
  refreshDashboard();
}

// Auto-advance expired next renewal dates
function checkAndRolloverExpired() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let updated = false;

  state.subscriptions = state.subscriptions.map(sub => {
    if (!sub.active) return sub;

    let renewalDate = new Date(sub.date);
    renewalDate.setHours(0, 0, 0, 0);

    // If renewal date is in the past, advance it
    while (renewalDate < today) {
      updated = true;
      const originalDate = new Date(renewalDate);
      if (sub.cycle === 'weekly') {
        renewalDate.setDate(renewalDate.getDate() + 7);
      } else if (sub.cycle === 'monthly') {
        renewalDate.setMonth(renewalDate.getMonth() + 1);
      } else if (sub.cycle === 'quarterly') {
        renewalDate.setMonth(renewalDate.getMonth() + 3);
      } else if (sub.cycle === 'yearly') {
        renewalDate.setFullYear(renewalDate.getFullYear() + 1);
      }
      
      // Prevent infinite loop if cycle is corrupt
      if (renewalDate.getTime() === originalDate.getTime()) {
        renewalDate.setMonth(renewalDate.getMonth() + 1);
      }
    }

    return {
      ...sub,
      date: renewalDate.toISOString().split('T')[0]
    };
  });

  if (updated) {
    saveSubscriptions();
  }
}

// Save to localStorage
function saveSubscriptions() {
  localStorage.setItem('subtracker_subscriptions', JSON.stringify(state.subscriptions));
}

function saveSettings() {
  localStorage.setItem('subtracker_settings', JSON.stringify(state.settings));
}

// Convert Cost to base currency
function convertPrice(price, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return price;
  
  // Convert fromCurrency to base USD first, then to target currency
  const priceInUSD = price / (CONVERSION_RATES[fromCurrency] || 1.0);
  return priceInUSD * (CONVERSION_RATES[toCurrency] || 1.0);
}

// Get currency symbol
function getCurrencySymbol(code) {
  const symbols = {
    USD: '$', EUR: '€', GBP: '£', IDR: 'Rp', JPY: '¥', CAD: 'CA$', AUD: 'A$'
  };
  return symbols[code] || code;
}

// Calculate remaining days
function getDaysRemaining(dateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const renewalDate = new Date(dateString);
  renewalDate.setHours(0, 0, 0, 0);
  
  const diffTime = renewalDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Format days left descriptive string
function getDaysRemainingText(days) {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 0) return 'Overdue';
  return `In ${days} days`;
}

// Compute cost normalized monthly
function getMonthlyEquivalent(price, cycle) {
  switch (cycle) {
    case 'weekly': return price * (52 / 12);
    case 'monthly': return price;
    case 'quarterly': return price / 3;
    case 'yearly': return price / 12;
    default: return price;
  }
}

// Compute cost normalized yearly
function getYearlyEquivalent(price, cycle) {
  switch (cycle) {
    case 'weekly': return price * 52;
    case 'monthly': return price * 12;
    case 'quarterly': return price * 4;
    case 'yearly': return price;
    default: return price * 12;
  }
}

// ==========================================
// DASHBOARD VIEW LOGIC
// ==========================================

function refreshDashboard() {
  const baseCurrency = state.settings.currency;
  const symbol = getCurrencySymbol(baseCurrency);
  
  let totalMonthly = 0;
  let totalYearly = 0;
  let activeCount = 0;
  let pausedCount = 0;
  
  let nextSub = null;
  let minDaysLeft = Infinity;

  state.subscriptions.forEach(sub => {
    if (sub.active) {
      activeCount++;
      // Convert to base currency
      const priceInBase = convertPrice(sub.price, sub.currency, baseCurrency);
      totalMonthly += getMonthlyEquivalent(priceInBase, sub.cycle);
      totalYearly += getYearlyEquivalent(priceInBase, sub.cycle);
      
      const daysLeft = getDaysRemaining(sub.date);
      if (daysLeft >= 0 && daysLeft < minDaysLeft) {
        minDaysLeft = daysLeft;
        nextSub = sub;
      }
    } else {
      pausedCount++;
    }
  });

  // Render metrics
  valMonthlySpend.textContent = `${symbol}${totalMonthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  valYearlySpend.textContent = `${symbol}${totalYearly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  valActiveCount.textContent = activeCount;
  valPausedCount.textContent = `${pausedCount} paused/inactive`;

  // Render next renewal
  if (nextSub) {
    const textSymbol = getCurrencySymbol(nextSub.currency);
    valNextRenewal.textContent = `${nextSub.name} (${textSymbol}${nextSub.price})`;
    valNextRenewalDays.textContent = getDaysRemainingText(minDaysLeft);
    
    // Highlight if urgent (<= 3 days)
    const metricCard = document.getElementById('metric-upcoming');
    if (minDaysLeft <= 3) {
      metricCard.classList.add('alert-highlight');
    } else {
      metricCard.classList.remove('alert-highlight');
    }
  } else {
    valNextRenewal.textContent = 'None';
    valNextRenewalDays.textContent = 'No active subscriptions';
    document.getElementById('metric-upcoming').classList.remove('alert-highlight');
  }

  // Draw Charts
  renderCategoryDoughnut();
  renderTimelineTimeline();
  renderUpcomingTable();
}

// Draw Native SVG Doughnut Chart
function renderCategoryDoughnut() {
  const container = document.getElementById('doughnut-chart-svg');
  const legend = document.getElementById('doughnut-legend');
  const baseCurrency = state.settings.currency;
  
  // Aggregate cost by category
  const categories = {};
  let totalSpend = 0;

  state.subscriptions.forEach(sub => {
    if (!sub.active) return;
    const priceInBase = convertPrice(sub.price, sub.currency, baseCurrency);
    const monthlyEquivalent = getMonthlyEquivalent(priceInBase, sub.cycle);
    
    categories[sub.category] = (categories[sub.category] || 0) + monthlyEquivalent;
    totalSpend += monthlyEquivalent;
  });

  // Check if empty
  if (totalSpend === 0) {
    container.innerHTML = `
      <svg viewBox="0 0 200 200" class="doughnut-svg" id="native-doughnut">
        <circle cx="100" cy="100" r="70" fill="transparent" stroke="rgba(255,255,255,0.05)" stroke-width="20" />
        <text x="100" y="105" text-anchor="middle" fill="#52525b" font-family="var(--font-primary)" font-size="12" font-weight="700">No Expenses</text>
      </svg>
    `;
    legend.innerHTML = '<div class="empty-state">Add active subscriptions to view metrics</div>';
    return;
  }

  // Category Color Scheme Map
  const categoryColors = {
    Entertainment: '#ef4444', // red
    Software: '#a855f7',      // purple
    Utilities: '#3b82f6',     // blue
    Health: '#10b981',        // green
    Finance: '#eab308',       // yellow
    Education: '#06b6d4',     // cyan
    Other: '#64748b'          // slate
  };

  // Convert categories to array and sort by spend descending
  const catArray = Object.keys(categories).map(cat => ({
    name: cat,
    value: categories[cat],
    color: categoryColors[cat] || '#64748b',
    percent: (categories[cat] / totalSpend) * 100
  })).sort((a, b) => b.value - a.value);

  // SVG parameters
  const radius = 70;
  const circumference = 2 * Math.PI * radius; // 439.82
  let accumulatedPercent = 0;
  let svgContent = '';

  catArray.forEach(cat => {
    const arcLength = (cat.percent / 100) * circumference;
    const strokeDashOffset = - (accumulatedPercent / 100) * circumference;
    
    svgContent += `
      <circle class="chart-slice" cx="100" cy="100" r="${radius}"
              fill="transparent"
              stroke="${cat.color}"
              stroke-width="18"
              stroke-dasharray="${arcLength} ${circumference - arcLength}"
              stroke-dashoffset="${strokeDashOffset}"
              style="transition: stroke-dashoffset 0.8s ease;"
              data-category="${cat.name}">
        <title>${cat.name}: ${getCurrencySymbol(baseCurrency)}${cat.value.toFixed(2)} (${cat.percent.toFixed(1)}%)</title>
      </circle>
    `;
    accumulatedPercent += cat.percent;
  });

  // Append center text showing total spend
  const centerTextSymbol = getCurrencySymbol(baseCurrency);
  svgContent += `
    <g transform="rotate(90 100 100)">
      <text x="100" y="96" text-anchor="middle" fill="#a1a1aa" font-family="var(--font-primary)" font-size="10" font-weight="700" letter-spacing="0.5">MONTHLY</text>
      <text x="100" y="116" text-anchor="middle" fill="#fafafa" font-family="var(--font-primary)" font-size="16" font-weight="800">${centerTextSymbol}${totalSpend.toFixed(0)}</text>
    </g>
  `;

  container.innerHTML = `
    <svg viewBox="0 0 200 200" class="doughnut-svg" id="native-doughnut">
      <circle cx="100" cy="100" r="${radius}" fill="transparent" stroke="rgba(255,255,255,0.02)" stroke-width="18" />
      ${svgContent}
    </svg>
  `;

  // Render Legend
  legend.innerHTML = catArray.map(cat => `
    <div class="legend-item">
      <div class="legend-color-label">
        <span class="legend-color-dot" style="background-color: ${cat.color};"></span>
        <span>${cat.name}</span>
      </div>
      <div class="legend-val">
        <span>${centerTextSymbol}${cat.value.toFixed(2)}</span>
        <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 500; margin-left: 4px;">(${cat.percent.toFixed(0)}%)</span>
      </div>
    </div>
  `).join('');
}

// Draw Next 30 Days timeline progress lists
function renderTimelineTimeline() {
  const baseCurrency = state.settings.currency;
  const symbol = getCurrencySymbol(baseCurrency);
  
  // Fetch active subscriptions renewing in the next 30 days
  const upcoming = state.subscriptions
    .filter(sub => sub.active)
    .map(sub => {
      const days = getDaysRemaining(sub.date);
      return {
        ...sub,
        daysLeft: days,
        priceInBase: convertPrice(sub.price, sub.currency, baseCurrency)
      };
    })
    .filter(sub => sub.daysLeft >= 0 && sub.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  if (upcoming.length === 0) {
    timelineBarsList.innerHTML = `
      <div class="empty-state">
        <p>No payments scheduled in the next 30 days.</p>
      </div>
    `;
    return;
  }

  // Find max cost to calculate bar ratios
  const maxCost = Math.max(...upcoming.map(s => s.priceInBase), 1.0);

  timelineBarsList.innerHTML = upcoming.slice(0, 5).map(sub => {
    // Days remaining progress calculation (100% full if due today, down to 10% if due in 30 days)
    const remainingPercent = Math.max(15, ((30 - sub.daysLeft) / 30) * 100);
    const subSymbol = getCurrencySymbol(sub.currency);
    
    // Dynamic message for days left
    let dueString = '';
    if (sub.daysLeft === 0) dueString = 'Due Today';
    else if (sub.daysLeft === 1) dueString = 'Due Tomorrow';
    else dueString = `Due in ${sub.daysLeft}d`;

    return `
      <div class="timeline-row">
        <div class="timeline-date-label">${dueString}</div>
        <div class="timeline-progress-track" onclick="editSub('${sub.id}')">
          <div class="timeline-progress-fill" style="width: ${remainingPercent}%; background: linear-gradient(90deg, ${sub.color || '#7c3aed'} 0%, rgba(255,255,255,0.1) 100%);">
            <span class="timeline-label-inside">${sub.name}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Render Dashboard Upcoming Table
function renderUpcomingTable() {
  const upcoming = state.subscriptions
    .filter(sub => sub.active)
    .map(sub => ({
      ...sub,
      daysLeft: getDaysRemaining(sub.date)
    }))
    .filter(sub => sub.daysLeft >= 0 && sub.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  if (upcoming.length === 0) {
    upcomingRenewalsTbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-table-cell">No renewals scheduled for the next 30 days.</td>
      </tr>
    `;
    return;
  }

  upcomingRenewalsTbody.innerHTML = upcoming.map(sub => {
    const symbol = getCurrencySymbol(sub.currency);
    const dateFormatted = new Date(sub.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    // Determine days left urgency color
    let urgencyClass = 'success';
    if (sub.daysLeft <= 3) urgencyClass = 'danger';
    else if (sub.daysLeft <= 7) urgencyClass = 'warning';

    // Get Category Avatar Initial letter
    const initial = sub.name.charAt(0).toUpperCase();

    return `
      <tr style="cursor: pointer;" onclick="editSub('${sub.id}')">
        <td>
          <div class="cell-sub-name-wrapper">
            <div class="sub-avatar" style="background-color: ${sub.color || '#7c3aed'}">${initial}</div>
            <span>${sub.name}</span>
          </div>
        </td>
        <td><span class="category-badge">${sub.category}</span></td>
        <td class="cell-price">${symbol}${sub.price.toFixed(2)}</td>
        <td>${dateFormatted}</td>
        <td>
          <span class="days-left-badge ${urgencyClass}">
            ${getDaysRemainingText(sub.daysLeft)}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================
// SUBSCRIPTIONS LIST LOGIC
// ==========================================

function renderSubscriptionsList() {
  const query = searchInput.value.toLowerCase().trim();
  const categoryFilter = filterCategorySelect.value;
  const sortBy = sortBySelect.value;

  // Filter list
  let list = state.subscriptions.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(query) || (sub.notes && sub.notes.toLowerCase().includes(query));
    const matchesCategory = categoryFilter === 'all' || sub.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Sort list
  list.sort((a, b) => {
    if (sortBy === 'renewal-asc') {
      return getDaysRemaining(a.date) - getDaysRemaining(b.date);
    }
    if (sortBy === 'renewal-desc') {
      return getDaysRemaining(b.date) - getDaysRemaining(a.date);
    }
    if (sortBy === 'price-desc') {
      // Normalize to USD to compare accurately
      return convertPrice(b.price, b.currency, 'USD') - convertPrice(a.price, a.currency, 'USD');
    }
    if (sortBy === 'price-asc') {
      return convertPrice(a.price, a.currency, 'USD') - convertPrice(b.price, b.currency, 'USD');
    }
    if (sortBy === 'name-asc') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  if (list.length === 0) {
    subscriptionsGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; padding: 60px 20px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48" style="color: var(--text-muted); margin-bottom: 16px;"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        <p>No subscriptions found matching filters.</p>
      </div>
    `;
    return;
  }

  subscriptionsGrid.innerHTML = list.map(sub => {
    const symbol = getCurrencySymbol(sub.currency);
    const dateFormatted = new Date(sub.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const daysLeft = getDaysRemaining(sub.date);
    
    // Status text
    const statusText = sub.active ? 'Active' : 'Paused';
    const activeChecked = sub.active ? 'checked' : '';

    return `
      <div class="sub-card glass-panel ${sub.active ? '' : 'paused'}" style="border-top: 4px solid ${sub.color || '#7c3aed'}">
        <div class="sub-card-header">
          <div class="sub-card-title-block">
            <div class="sub-avatar" style="background-color: ${sub.color || '#7c3aed'}">${sub.name.charAt(0).toUpperCase()}</div>
            <div>
              <h4 class="sub-name">${sub.name}</h4>
              <p class="sub-cycle-badge">${sub.category} &bull; ${sub.cycle.charAt(0).toUpperCase() + sub.cycle.slice(1)}</p>
            </div>
          </div>
          <span class="category-badge" style="background-color: rgba(255,255,255,0.02);">${statusText}</span>
        </div>
        
        <div class="sub-card-body">
          <h3 class="sub-card-price">${symbol}${sub.price.toFixed(2)}</h3>
          <div class="sub-card-meta">
            <div class="sub-meta-row">
              <svg class="sub-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>Renew Date: ${dateFormatted}</span>
            </div>
            <div class="sub-meta-row">
              <svg class="sub-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>${sub.active ? getDaysRemainingText(daysLeft) : 'Subscription is paused'}</span>
            </div>
            ${sub.method ? `
            <div class="sub-meta-row">
              <svg class="sub-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              <span>Paid via: ${sub.method}</span>
            </div>
            ` : ''}
          </div>
        </div>
        
        <div class="sub-card-actions">
          <label class="toggle-switch" title="Toggle Active/Paused">
            <input type="checkbox" ${activeChecked} onchange="toggleSubStatus('${sub.id}')">
            <span class="toggle-slider"></span>
          </label>
          
          <div class="action-buttons-group">
            <button class="icon-btn" onclick="editSub('${sub.id}')" title="Edit details">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
            <button class="icon-btn delete-btn" onclick="deleteSub('${sub.id}')" title="Delete subscription">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function setupListFilters() {
  searchInput.addEventListener('input', renderSubscriptionsList);
  filterCategorySelect.addEventListener('change', renderSubscriptionsList);
  sortBySelect.addEventListener('change', renderSubscriptionsList);
}

// Toggle Subscription Active/Paused state
window.toggleSubStatus = function(id) {
  const index = state.subscriptions.findIndex(sub => sub.id === id);
  if (index !== -1) {
    state.subscriptions[index].active = !state.subscriptions[index].active;
    saveSubscriptions();
    checkAndRolloverExpired();
    
    const pageName = headerTitle.textContent;
    if (pageName === 'Overview') refreshDashboard();
    else renderSubscriptionsList();
    
    const status = state.subscriptions[index].active ? 'activated' : 'paused';
    showToast(`"${state.subscriptions[index].name}" has been ${status}.`, 'success');
  }
};

// ==========================================
// FORM EDIT/CREATE LOGIC
// ==========================================

function setupFormHandlers() {
  // Handle custom color radio clicks
  const colorRadios = document.querySelectorAll('input[name="sub-color"]');
  
  colorRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.id !== 'color-radio-custom') {
        customColorDot.style.backgroundColor = subCustomColorInput.value;
      }
    });
  });

  subCustomColorInput.addEventListener('input', (e) => {
    customColorRadio.checked = true;
    customColorRadio.value = e.target.value;
    customColorDot.style.backgroundColor = e.target.value;
  });

  // Handle Form Submit
  subscriptionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = subIdInput.value;
    const selectedColorRadio = document.querySelector('input[name="sub-color"]:checked');
    const color = selectedColorRadio ? selectedColorRadio.value : '#7c3aed';

    const subData = {
      id: id || 'sub-' + Date.now(),
      name: subNameInput.value.trim(),
      price: parseFloat(subPriceInput.value),
      currency: subCurrencySelect.value,
      cycle: subCycleSelect.value,
      category: subCategorySelect.value,
      date: subDateInput.value,
      method: subMethodSelect.value,
      color: color,
      notes: subNotesTextarea.value.trim(),
      active: id ? state.subscriptions.find(s => s.id === id).active : true
    };

    if (id) {
      // Edit existing
      const index = state.subscriptions.findIndex(s => s.id === id);
      if (index !== -1) {
        state.subscriptions[index] = subData;
        showToast(`"${subData.name}" updated successfully!`, 'success');
      }
    } else {
      // Create new
      state.subscriptions.push(subData);
      showToast(`"${subData.name}" added successfully!`, 'success');
    }

    saveSubscriptions();
    checkAndRolloverExpired();
    subscriptionForm.reset();
    
    // Switch to dashboard
    switchSection('dashboard');
  });
}

function prepareForm() {
  formSectionTitle.textContent = 'Add New Subscription';
  subIdInput.value = '';
  subscriptionForm.reset();
  
  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  subDateInput.value = today;

  // Reset custom color picker
  customColorDot.style.backgroundColor = '#64748b';
  subCustomColorInput.value = '#64748b';
  document.querySelector('input[name="sub-color"][value="#ef4444"]').checked = true;
}

window.editSub = function(id) {
  const sub = state.subscriptions.find(s => s.id === id);
  if (!sub) return;

  // Prepare form fields
  subIdInput.value = sub.id;
  subNameInput.value = sub.name;
  subPriceInput.value = sub.price;
  subCurrencySelect.value = sub.currency;
  subCycleSelect.value = sub.cycle;
  subCategorySelect.value = sub.category;
  subDateInput.value = sub.date;
  subMethodSelect.value = sub.method;
  subNotesTextarea.value = sub.notes || '';

  // Select accent color radio
  const colorRadios = document.querySelectorAll('input[name="sub-color"]');
  let colorMatched = false;
  colorRadios.forEach(radio => {
    if (radio.id !== 'color-radio-custom' && radio.value === sub.color) {
      radio.checked = true;
      colorMatched = true;
    }
  });

  if (!colorMatched) {
    customColorRadio.checked = true;
    customColorRadio.value = sub.color;
    subCustomColorInput.value = sub.color;
    customColorDot.style.backgroundColor = sub.color;
  }

  formSectionTitle.textContent = 'Edit Subscription';
  switchSection('add-new');
}

window.deleteSub = function(id) {
  const sub = state.subscriptions.find(s => s.id === id);
  if (!sub) return;

  if (confirm(`Are you sure you want to delete "${sub.name}"?`)) {
    state.subscriptions = state.subscriptions.filter(s => s.id !== id);
    saveSubscriptions();
    
    const pageName = headerTitle.textContent;
    if (pageName === 'Overview') refreshDashboard();
    else renderSubscriptionsList();

    showToast(`"${sub.name}" deleted.`, 'danger');
  }
}

// ==========================================
// SETTINGS & BACKUPS LOGIC
// ==========================================

function setupSettingsHandlers() {
  // Base currency change
  settingsCurrencySelect.addEventListener('change', (e) => {
    state.settings.currency = e.target.value;
    saveSettings();
    showToast(`Baseline currency changed to ${e.target.value}`, 'success');
  });

  // Notification toggle
  settingsNotificationsCheck.addEventListener('change', (e) => {
    state.settings.notifications = e.target.checked;
    saveSettings();
    
    if (e.target.checked) {
      // Request permission
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            showToast('Desktop alerts enabled!', 'success');
          } else {
            showToast('Notifications blocked by browser.', 'warning');
            settingsNotificationsCheck.checked = false;
            state.settings.notifications = false;
            saveSettings();
          }
        });
      } else {
        showToast('Browser does not support notifications.', 'warning');
        settingsNotificationsCheck.checked = false;
        state.settings.notifications = false;
        saveSettings();
      }
    } else {
      showToast('Desktop alerts disabled.', 'success');
    }
  });

  // DB Reset
  btnResetDb.addEventListener('click', () => {
    if (confirm('CAUTION: This will delete ALL subscriptions permanently. Do you wish to proceed?')) {
      localStorage.removeItem('subtracker_subscriptions');
      state.subscriptions = [];
      refreshDashboard();
      showToast('Database has been fully reset.', 'danger');
      switchSection('dashboard');
    }
  });

  // JSON Export
  btnExport.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.subscriptions, null, 2));
    const downloadAnchor = document.createElement('a');
    
    const dateStr = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `subtracker_backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    
    showToast('Database exported successfully!', 'success');
  });

  // JSON Import
  btnImportTrigger.addEventListener('click', () => {
    importFileInput.click();
  });

  importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const parsed = JSON.parse(evt.target.result);
        
        // Basic format check
        if (Array.isArray(parsed) && (parsed.length === 0 || (parsed[0].name && parsed[0].price))) {
          state.subscriptions = parsed;
          saveSubscriptions();
          checkAndRolloverExpired();
          refreshDashboard();
          showToast('Subscriptions imported successfully!', 'success');
          switchSection('dashboard');
        } else {
          showToast('Invalid backup file structure.', 'danger');
        }
      } catch (err) {
        showToast('Failed to parse backup JSON file.', 'danger');
      }
    };
    reader.readAsText(file);
    importFileInput.value = ''; // clear input
  });
}

// ==========================================
// TOAST NOTIFICATIONS & ALERTS
// ==========================================

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `alert-toast ${type}`;
  
  let icon = '';
  if (type === 'success') {
    icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg>';
  } else if (type === 'warning') {
    icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  } else if (type === 'danger') {
    icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
  }

  toast.innerHTML = `${icon} <span>${message}</span>`;
  globalAlertsEl.appendChild(toast);
  
  // Auto remove after 4.5 seconds
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease-out reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4200);
}

// Check for subscriptions due today or tomorrow
function checkDueSubscriptions() {
  const baseCurrency = state.settings.currency;
  const todayAlerts = [];
  const upcomingAlerts = [];

  state.subscriptions.forEach(sub => {
    if (!sub.active) return;
    const days = getDaysRemaining(sub.date);
    
    if (days === 0) {
      todayAlerts.push(sub.name);
    } else if (days > 0 && days <= 2) {
      upcomingAlerts.push(`${sub.name} (in ${days}d)`);
    }
  });

  // Trigger browser desktop notification if permitted and setting enabled
  if (state.settings.notifications && 'Notification' in window && Notification.permission === 'granted') {
    if (todayAlerts.length > 0) {
      new Notification('Subscriptions Renewing Today!', {
        body: `${todayAlerts.join(', ')} billing renewing today.`,
        icon: './icon.svg'
      });
    }
  }

  // Display top toasts inside app for immediate awareness
  if (todayAlerts.length > 0) {
    showToast(`Renewing Today: ${todayAlerts.join(', ')}`, 'danger');
  }
  if (upcomingAlerts.length > 0) {
    showToast(`Upcoming payments: ${upcomingAlerts.join(', ')}`, 'warning');
  }
}
