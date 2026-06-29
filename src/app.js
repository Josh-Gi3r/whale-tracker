/**
 * Whale Tracker — application logic
 *
 * Reads from window.TRACKER_CONFIG and window.WHALE_DATA_SOURCE.
 * No brand values or data are hardcoded here.
 */

(function () {
  'use strict';

  const cfg = window.TRACKER_CONFIG;
  const ds  = window.WHALE_DATA_SOURCE;

  // ── Theme: inject CSS custom properties from config ───────────────────────

  function applyTheme() {
    const t = cfg.theme;
    const root = document.documentElement;
    root.style.setProperty('--color-primary',   t.colorPrimary);
    root.style.setProperty('--color-accent',    t.colorAccent);
    root.style.setProperty('--color-purple',    t.colorPurple);
    root.style.setProperty('--color-bg-base',   t.colorBgBase);
    root.style.setProperty('--color-bg-mid',    t.colorBgMid);
    root.style.setProperty('--color-bg-deep',   t.colorBgDeep);
    root.style.setProperty('--color-text',      t.colorText);
  }

  // ── Font: conditionally load from Google Fonts ────────────────────────────

  function loadFont() {
    if (!cfg.googleFont) return; // null = use system stack
    const family = encodeURIComponent(cfg.googleFont);
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${family}:wght@400;600;700&display=swap`;
    document.head.prepend(link);
    document.documentElement.style.setProperty('--font-mono', `'${cfg.googleFont}', monospace`);
  }

  // ── App identity ──────────────────────────────────────────────────────────

  function applyIdentity() {
    document.title = cfg.appName;
    const logoEl = document.getElementById('app-logo');
    if (logoEl) logoEl.textContent = cfg.appName;
    const taglineEl = document.getElementById('app-tagline');
    if (taglineEl) taglineEl.textContent = cfg.appTagline;
  }

  // ── Chain tabs ────────────────────────────────────────────────────────────

  let activeChain = 'ALL';

  function buildChainTabs() {
    const container = document.getElementById('chain-tabs');
    if (!container) return;
    container.innerHTML = '';

    cfg.chains.forEach(chain => {
      const tab = document.createElement('div');
      tab.className = 'chain-tab' + (chain.id === 'ALL' ? ' active' : '');
      tab.textContent = chain.label;
      tab.dataset.chainId = chain.id;
      tab.addEventListener('click', () => selectChain(chain.id));
      container.appendChild(tab);
    });
  }

  function selectChain(chainId) {
    activeChain = chainId;
    document.querySelectorAll('.chain-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.chainId === chainId);
    });
    refreshTransactions();
  }

  // ── Transaction list ──────────────────────────────────────────────────────

  function actionClass(action) {
    return {
      BUY:      'status-buy',
      SELL:     'status-sell',
      TRANSFER: 'status-transfer',
    }[action] || 'status-transfer';
  }

  function renderTransactions(txs) {
    const list = document.getElementById('whale-list');
    if (!list) return;

    // Fade out → update → fade in
    list.style.opacity = '0.4';
    list.style.transition = 'opacity 0.2s ease';

    setTimeout(() => {
      list.innerHTML = '';
      txs.forEach((tx, i) => {
        const item = document.createElement('div');
        item.className = 'whale-item' + (i % 2 === 0 ? ' flow-animation' : '');
        item.innerHTML = `
          <div class="whale-info">
            <div class="whale-amount">${tx.amount} ${tx.asset} ${tx.action.charAt(0) + tx.action.slice(1).toLowerCase()}</div>
            <div class="whale-address">${tx.from} &rarr; ${tx.to}</div>
          </div>
          <div class="whale-status ${actionClass(tx.action)}">${tx.action}</div>
        `;
        list.appendChild(item);
      });
      list.style.opacity = '1';
    }, 200);
  }

  async function refreshTransactions() {
    try {
      const txs = await ds.getTransactions(activeChain);
      renderTransactions(txs);
    } catch (err) {
      console.warn('[whale-tracker] getTransactions error:', err);
    }
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  function renderStats(stats) {
    const volEl    = document.getElementById('stat-volume');
    const whaleEl  = document.getElementById('stat-whales');
    const chainEl  = document.getElementById('stat-chains');
    if (volEl)   volEl.textContent   = stats.trackedVolume;
    if (whaleEl) whaleEl.textContent = stats.activeWhales;
    if (chainEl) chainEl.textContent = stats.supportedChains;
  }

  async function refreshStats() {
    try {
      const stats = await ds.getStats();
      renderStats(stats);
    } catch (err) {
      console.warn('[whale-tracker] getStats error:', err);
    }
  }

  // ── Insights ──────────────────────────────────────────────────────────────

  function renderInsights(insights) {
    const container = document.getElementById('ai-insights-list');
    if (!container) return;
    container.innerHTML = '';
    insights.forEach(ins => {
      const item = document.createElement('div');
      item.className = 'insight-item';
      item.innerHTML = `
        <div class="insight-score">${ins.label}</div>
        <div>${ins.body}</div>
      `;
      container.appendChild(item);
    });
  }

  async function refreshInsights() {
    try {
      const insights = await ds.getInsights();
      renderInsights(insights);
    } catch (err) {
      console.warn('[whale-tracker] getInsights error:', err);
    }
  }

  // ── Modal ─────────────────────────────────────────────────────────────────

  function showModal() {
    const el = document.getElementById('feature-modal');
    if (el) el.style.display = 'flex';
  }

  function hideModal() {
    const el = document.getElementById('feature-modal');
    if (el) el.style.display = 'none';
  }

  // Expose for inline onclick in HTML (kept for simplicity of static template)
  window.showFeatureModal = showModal;
  window.hideFeatureModal = hideModal;

  window.addEventListener('click', e => {
    const modal = document.getElementById('feature-modal');
    if (modal && e.target === modal) hideModal();
  });

  // ── Boot ──────────────────────────────────────────────────────────────────

  function init() {
    loadFont();
    applyTheme();
    applyIdentity();
    buildChainTabs();

    // Render placeholder stats immediately
    renderStats(cfg.placeholderStats);

    // First data load
    refreshTransactions();
    refreshStats();
    refreshInsights();

    // Polling loop
    setInterval(refreshTransactions, cfg.pollInterval);
    setInterval(refreshStats,        cfg.pollInterval);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
