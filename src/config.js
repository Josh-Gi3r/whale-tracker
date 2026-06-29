/**
 * Whale Tracker — central configuration
 *
 * Edit this file to rebrand, add chains, change destinations,
 * adjust polling frequency, or swap the font.
 * Nothing in index.html or app.js needs to change for these edits.
 */

const TRACKER_CONFIG = {

  // ── App identity ─────────────────────────────────────────────────────────
  appName:    'Whale Tracker',
  appTagline: 'Monitor large on-chain transactions across multiple blockchains',

  // ── Theme tokens ──────────────────────────────────────────────────────────
  // All brand colors live here. Change once → whole UI updates.
  theme: {
    colorPrimary:  '#00f5ff',   // primary accent (cyan)
    colorAccent:   '#ff006e',   // secondary accent (magenta)
    colorPurple:   '#8338ec',   // tertiary accent
    colorBgBase:   '#0a0a0a',
    colorBgMid:    '#1a1a2e',
    colorBgDeep:   '#16213e',
    colorText:     '#e0e6ed',
  },

  // ── Font ──────────────────────────────────────────────────────────────────
  // Set to null to fall back to the system monospace stack (no Google request).
  // Set to a Google Fonts family name to load it from fonts.googleapis.com.
  // To self-host: set null here and add @font-face in index.html manually.
  googleFont: 'JetBrains Mono',

  // ── Chains ────────────────────────────────────────────────────────────────
  // Drives the filter tabs.  First entry always rendered as the "show all" tab.
  // id  — passed to DataSource.getTransactions(chainId)
  // label — shown in the UI
  chains: [
    { id: 'ALL',  label: 'ALL'  },
    { id: 'ETH',  label: 'ETH'  },
    { id: 'BTC',  label: 'BTC'  },
    { id: 'SOL',  label: 'SOL'  },
    { id: 'AVAX', label: 'AVAX' },
  ],

  // ── Destination labels ────────────────────────────────────────────────────
  // Used by MockDataSource to annotate transfer destinations.
  // Replace or extend when wiring a real labelling service.
  destinations: [
    'Binance',
    'Coinbase',
    'Cold Storage',
    'Unknown',
    'DeFi Protocol',
    'Multi-sig',
    'Kraken',
    'OKX',
  ],

  // ── Demo / placeholder stats ──────────────────────────────────────────────
  // Shown while the data source has not yet returned real figures.
  // A real DataSource.getStats() return value overrides these.
  placeholderStats: {
    trackedVolume: '--',
    activeWhales:  '--',
    supportedChains: String(5), // update to match your chains array length
  },

  // ── Polling ───────────────────────────────────────────────────────────────
  // Interval (ms) at which app.js calls the data source for fresh transactions.
  pollInterval: 10000,
};

// Expose globally so data-source.js and app.js can share it.
window.TRACKER_CONFIG = TRACKER_CONFIG;
