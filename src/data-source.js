/**
 * Whale Tracker — DataSource adapter
 *
 * HOW TO PLUG IN A REAL BACKEND
 * ──────────────────────────────
 * 1. Create a class that implements the three methods below.
 * 2. Before app.js initialises (i.e. in a <script> before app.js), set:
 *
 *      window.WHALE_DATA_SOURCE = new YourDataSource(window.TRACKER_CONFIG);
 *
 * 3. The app will call your adapter instead of MockDataSource.
 *
 * METHOD SIGNATURES (all must return Promises):
 *
 *   getTransactions(chainId: string): Promise<Transaction[]>
 *     chainId — 'ALL' | one of the ids in TRACKER_CONFIG.chains
 *     Returns an array of Transaction objects (see typedef below).
 *
 *   getStats(): Promise<Stats>
 *     Returns current summary stats for the hero counters.
 *
 *   getInsights(): Promise<Insight[]>
 *     Returns analysis/AI insight blurbs for the side panel.
 *
 * TRANSACTION typedef
 * ───────────────────
 * {
 *   id:          string,   // unique tx identifier
 *   chain:       string,   // 'ETH' | 'BTC' | 'SOL' | 'AVAX' | …
 *   asset:       string,   // 'ETH' | 'USDT' | 'BTC' | …
 *   amount:      string,   // human-readable, e.g. '$87.3M'
 *   action:      'BUY' | 'SELL' | 'TRANSFER',
 *   from:        string,   // shortened address or label
 *   to:          string,   // exchange name, 'Cold Storage', 'Unknown', …
 *   timestampMs: number,   // epoch ms
 * }
 *
 * STATS typedef
 * ─────────────
 * {
 *   trackedVolume:   string,  // e.g. '$2.4B'
 *   activeWhales:    string,  // e.g. '1,247'
 *   supportedChains: string,  // e.g. '15'
 * }
 *
 * INSIGHT typedef
 * ───────────────
 * {
 *   label: string,   // e.g. 'Bullish Signal: 92%'
 *   body:  string,   // explanation text
 * }
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAddress() {
  const hex = () => Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
  return `0x${hex()}${hex()}...${hex()}`;
}

function randomAmount() {
  const value = (Math.random() * 280 + 20).toFixed(1);
  return `$${value}M`;
}

// ── MockDataSource (default adapter) ─────────────────────────────────────────

class MockDataSource {
  constructor(config) {
    this._config = config;
    this._txCounter = 0;

    // Seed transactions — shown on first render
    this._seedTransactions = [
      {
        id: 'seed-1',
        chain: 'ETH',
        asset: 'USDT',
        amount: '$87.3M',
        action: 'TRANSFER',
        from: '0x742d...4f21',
        to: 'Binance',
        timestampMs: Date.now() - 60000,
      },
      {
        id: 'seed-2',
        chain: 'ETH',
        asset: 'ETH',
        amount: '$156.8M',
        action: 'BUY',
        from: '0x8b3a...9c45',
        to: 'Cold Storage',
        timestampMs: Date.now() - 120000,
      },
      {
        id: 'seed-3',
        chain: 'BTC',
        asset: 'BTC',
        amount: '$43.2M',
        action: 'SELL',
        from: '0xf7e2...1a83',
        to: 'Coinbase',
        timestampMs: Date.now() - 180000,
      },
      {
        id: 'seed-4',
        chain: 'ETH',
        asset: 'USDC',
        amount: '$298.4M',
        action: 'TRANSFER',
        from: '0x3c8d...7b91',
        to: 'Unknown',
        timestampMs: Date.now() - 240000,
      },
      {
        id: 'seed-5',
        chain: 'SOL',
        asset: 'SOL',
        amount: '$67.9M',
        action: 'BUY',
        from: '0x9f4a...2e76',
        to: 'DeFi Protocol',
        timestampMs: Date.now() - 300000,
      },
      {
        id: 'seed-6',
        chain: 'AVAX',
        asset: 'AVAX',
        amount: '$124.7M',
        action: 'TRANSFER',
        from: '0x6d5b...8c39',
        to: 'Multi-sig',
        timestampMs: Date.now() - 360000,
      },
    ];
  }

  /**
   * Returns mock transactions, optionally filtered by chain.
   * On subsequent calls generates fresh random rows to simulate live updates.
   */
  async getTransactions(chainId) {
    const assets = ['USDT', 'ETH', 'BTC', 'USDC', 'SOL', 'AVAX', 'WBTC', 'DAI'];
    const actions = ['BUY', 'SELL', 'TRANSFER'];
    const { chains, destinations } = this._config;
    const chainIds = chains.filter(c => c.id !== 'ALL').map(c => c.id);

    // After first call, generate new random rows
    if (this._txCounter > 0) {
      const rows = [];
      for (let i = 0; i < 6; i++) {
        const chain = randomItem(chainIds);
        const action = randomItem(actions);
        rows.push({
          id: `mock-${this._txCounter}-${i}`,
          chain,
          asset: randomItem(assets),
          amount: randomAmount(),
          action,
          from: randomAddress(),
          to: randomItem(destinations),
          timestampMs: Date.now() - i * 30000,
        });
      }
      this._txCounter++;
      return chainId === 'ALL' ? rows : rows.filter(r => r.chain === chainId);
    }

    this._txCounter++;
    const seed = this._seedTransactions;
    return chainId === 'ALL' ? seed : seed.filter(r => r.chain === chainId);
  }

  /** Returns demo summary stats. */
  async getStats() {
    const volume = (2.2 + Math.random() * 0.4).toFixed(1);
    return {
      trackedVolume:   `$${volume}B`,
      activeWhales:    String(Math.floor(1200 + Math.random() * 100)),
      supportedChains: String(this._config.chains.filter(c => c.id !== 'ALL').length),
    };
  }

  /** Returns demo AI-style insight blurbs. */
  async getInsights() {
    return [
      {
        label: 'Bullish Signal: 92%',
        body:  'Large accumulation detected. Multiple whales bought heavily in the last 2 hours.',
      },
      {
        label: 'Distribution Alert: 78%',
        body:  'Whale cluster showing pre-sell patterns based on historical transaction sequences.',
      },
      {
        label: 'Flow Analysis: Active',
        body:  'Cross-chain movement detected. Funds routing between ETH and SOL ecosystems.',
      },
    ];
  }
}

// ── Register default adapter ──────────────────────────────────────────────────
// A custom adapter set before this script loads takes precedence.
if (!window.WHALE_DATA_SOURCE) {
  window.WHALE_DATA_SOURCE = new MockDataSource(window.TRACKER_CONFIG);
}
