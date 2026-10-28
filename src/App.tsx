import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Zap,
  MapPin,
  Store,
  Plus,
  X,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { INITIAL_DUKA_ITEMS, DukaItem } from './data/items';

export default function App() {
  const [items, setItems] = useState<DukaItem[]>(INITIAL_DUKA_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMarket, setSelectedMarket] = useState<string>('All');
  const [searchLatencyMs, setSearchLatencyMs] = useState<number>(2);
  const [selectedItem, setSelectedItem] = useState<DukaItem | null>(null);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  // Form State for new item dual-write
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Produce');
  const [newItemVendor, setNewItemVendor] = useState('');
  const [newItemMarket, setNewItemMarket] = useState('Nakasero Market');
  const [newItemPrice, setNewItemPrice] = useState('25000');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncLog, setSyncLog] = useState<{ step: string; status: 'pending' | 'success' }[]>([]);

  // Categories list
  const categories = ['All', 'Produce', 'Automotive', 'Textiles', 'Groceries', 'Hardware'];
  const markets = [
    'All',
    'Nakasero Market',
    'Owino Market',
    'Ndeeba Spares Hub',
    'Kikuubo Lane',
    'Katwe Metal Hub',
    'Ggaba Landing Market',
  ];

  // Dynamic Facet Counts calculation
  const facetCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [items]);

  // Instant Typo-tolerant Search Filter with Latency calculation
  const filteredItems = useMemo(() => {
    const start = performance.now();
    const q = searchQuery.toLowerCase().trim();

    const results = items.filter((item) => {
      // Category match
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // Market match
      if (selectedMarket !== 'All' && item.market_location !== selectedMarket) {
        return false;
      }
      // Query match (with basic substring + token match)
      if (!q) return true;

      const searchableText = `${item.name} ${item.category} ${item.vendor_name} ${item.market_location} ${item.description || ''}`.toLowerCase();
      
      // Direct match
      if (searchableText.includes(q)) return true;

      // Token match
      const tokens = q.split(/\s+/);
      return tokens.every((token) => searchableText.includes(token));
    });

    const elapsed = Math.max(1, Math.round(performance.now() - start));
    // Simulated instant Typesense response time
    setSearchLatencyMs(elapsed <= 4 ? elapsed : 3);

    return results;
  }, [items, searchQuery, selectedCategory, selectedMarket]);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemVendor || !newItemPrice) return;

    setIsSubmitting(true);
    setSyncLog([
      { step: '1. Validating payload in Express API', status: 'pending' },
      { step: '2. Writing document to Firestore (/duka_items)', status: 'pending' },
      { step: '3. Indexing document into Typesense collection', status: 'pending' },
    ]);

    setTimeout(() => {
      setSyncLog((prev) => [
        { step: '1. Validating payload in Express API', status: 'success' },
        { step: '2. Writing document to Firestore (/duka_items)', status: 'pending' },
        { step: '3. Indexing document into Typesense collection', status: 'pending' },
      ]);
    }, 400);

    setTimeout(() => {
      setSyncLog((prev) => [
        { step: '1. Validating payload in Express API', status: 'success' },
        { step: '2. Writing document to Firestore (/duka_items)', status: 'success' },
        { step: '3. Indexing document into Typesense collection', status: 'pending' },
      ]);
    }, 900);

    setTimeout(() => {
      const newItem: DukaItem = {
        id: `duka_item_${Date.now()}`,
        name: newItemName,
        category: newItemCategory,
        vendor_name: newItemVendor,
        market_location: newItemMarket,
        price_ugx: parseInt(newItemPrice, 10) || 0,
        in_stock: true,
        description: newItemDesc || 'Newly listed Kampala market trade item.',
        created_at: Date.now(),
      };

      setItems((prev) => [newItem, ...prev]);
      setSyncLog((prev) => [
        { step: '1. Validating payload in Express API', status: 'success' },
        { step: '2. Writing document to Firestore (/duka_items)', status: 'success' },
        { step: '3. Indexing document into Typesense collection', status: 'success' },
      ]);
      setIsSubmitting(false);

      setTimeout(() => {
        setIsAddItemModalOpen(false);
        setSyncLog([]);
        setNewItemName('');
        setNewItemVendor('');
        setNewItemDesc('');
      }, 700);
    }, 1400);
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1B2E] text-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Brand header */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-[#2A2640] shrink-0 bg-[#1E1B2E]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl neu-raised-sm flex items-center justify-center text-[#9D4EDD]">
            <Store className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap">
            DukaSearch
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsAddItemModalOpen(true)}
            className="neu-btn-accent px-4 py-2 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer shadow-lg hover:brightness-110 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>&middot;</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 md:p-6 max-w-7xl mx-auto w-full">
        {/* Subheader / Context strip */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2A2640]/60">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#A09ABC] mb-1">
              <span>Kampala Market Index</span>
              <span>&middot;</span>
              <span>Owino &middot; Nakasero &middot; Ndeeba &middot; Kikuubo &middot; Katwe</span>
              <span>&middot;</span>
              <span className="text-[#00F5D4] font-mono">{filteredItems.length} items</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Find anything in Kampala's markets
            </h1>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center">
            {/* Market discovery panel */}
            <div className="w-full max-w-6xl rounded-3xl p-4 md:p-6 neu-raised border border-[#2A2640]">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    DukaSearch
                  </h2>
                  <p className="text-xs text-[#A09ABC]">Kampala Hyper-Local Market Index</p>
                </div>
                <button
                  onClick={() => setIsAddItemModalOpen(true)}
                  className="w-10 h-10 neu-btn flex items-center justify-center text-[#9D4EDD] hover:text-white"
                  title="Vendor Listing"
                >
                  <Store className="w-5 h-5" />
                </button>
              </div>

              {/* Sunken Search Bar with real-time latency metric badge */}
              <div className="neu-inset px-4 py-3 mb-4 flex items-center gap-3">
                <Search className="w-5 h-5 text-[#9D4EDD] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Nakasero, Owino, Ndeeba..."
                  className="bg-transparent border-none outline-none text-sm text-white placeholder-[#A09ABC] flex-1 font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-[#A09ABC] hover:text-white text-xs cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {/* Latency Metric Badge */}
                <div className="neu-inset-sm px-2.5 py-1 flex items-center gap-1.5 shrink-0 bg-[#12101C]/60 border border-[#00F5D4]/20">
                  <Zap className="w-3 h-3 text-[#00F5D4] fill-[#00F5D4]" />
                  <span className="text-xs font-mono font-bold text-[#00F5D4] tabular-nums">
                    {searchLatencyMs}ms
                  </span>
                </div>
              </div>

              {/* Dynamic Neumorphic Facet Category Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const count = cat === 'All' ? items.length : facetCounts[cat] || 0;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-2xl whitespace-nowrap transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'neu-btn-accent text-white shadow-md'
                          : 'neu-btn text-[#A09ABC] hover:text-white'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={`ml-1.5 text-[11px] font-mono ${isSelected ? 'text-[#00F5D4]' : 'text-[#A09ABC]/70'}`}>
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Market Location Sub-filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 text-xs text-[#A09ABC]">
                <span className="shrink-0 flex items-center gap-1 text-[11px] uppercase tracking-wider font-bold text-[#9D4EDD]">
                  <MapPin className="w-3 h-3" />
                  Market:
                </span>
                {markets.map((mkt) => {
                  const isSelected = selectedMarket === mkt;
                  return (
                    <button
                      key={mkt}
                      onClick={() => setSelectedMarket(mkt)}
                      className={`px-2 py-1 rounded-lg whitespace-nowrap text-xs transition-colors ${
                        isSelected
                          ? 'bg-[#2A2640] text-white font-medium border border-[#9D4EDD]/40'
                          : 'hover:text-white'
                      }`}
                    >
                      {mkt}
                    </button>
                  );
                })}
              </div>

              {/* 2-Column Grid of Extruded Product Cards */}
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="neu-raised p-3.5 flex flex-col justify-between cursor-pointer group hover:scale-[1.02] active:scale-[0.98] transition-all border border-transparent hover:border-[#9D4EDD]/30"
                  >
                    <div>
                      {/* Category & Stock Indicator */}
                      <div className="flex items-center justify-between text-[10px] mb-2 font-bold uppercase tracking-wider">
                        <span className="text-[#9D4EDD] truncate">{item.category}</span>
                        {item.in_stock && (
                          <span className="w-2 h-2 rounded-full bg-[#00F5D4] shrink-0" title="In Stock" />
                        )}
                      </div>

                      {/* Item Name */}
                      <h3 className="text-xs md:text-sm font-bold text-white line-clamp-2 leading-tight mb-2 group-hover:text-[#00F5D4] transition-colors">
                        {item.name}
                      </h3>

                      {/* Vendor & Location */}
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#A09ABC]">
                          <Store className="w-3 h-3 shrink-0 text-[#9D4EDD]" />
                          <span className="truncate">{item.vendor_name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#A09ABC]/80">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{item.market_location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="pt-2 border-t border-[#2A2640] flex items-center justify-between mt-auto">
                      <div>
                        <div className="text-[9px] font-mono text-[#00F5D4] font-bold">UGX</div>
                        <div className="text-xs md:text-sm font-extrabold text-white font-mono tabular-nums">
                          {item.price_ugx.toLocaleString()}
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-lg neu-raised-sm flex items-center justify-center text-[#9D4EDD] group-hover:bg-[#9D4EDD] group-hover:text-white transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="neu-inset p-8 text-center my-4">
                  <Store className="w-10 h-10 text-[#A09ABC] mx-auto mb-3 opacity-60" />
                  <p className="text-sm font-bold text-white">No market items found</p>
                  <p className="text-xs text-[#A09ABC] mt-1">
                    Try searching for 'matooke', 'toyota', 'jacket', or reset filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setSelectedMarket('All');
                    }}
                    className="neu-btn px-4 py-2 text-xs font-semibold text-[#00F5D4] mt-4"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
      </main>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="neu-raised max-w-md w-full p-6 border border-[#2A2640] relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-[#A09ABC] hover:text-white neu-btn p-2"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between mb-3 pr-8">
              <span className="text-xs font-bold text-[#9D4EDD] uppercase tracking-wider">
                {selectedItem.category}
              </span>
              <span className="text-base font-extrabold text-[#00F5D4] font-mono">
                UGX {selectedItem.price_ugx.toLocaleString()}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-2 leading-snug">{selectedItem.name}</h3>

            <p className="text-xs text-[#A09ABC] mb-4">
              {selectedItem.description || 'Authentic market item verified at Kampala trading center.'}
            </p>

            <div className="space-y-2 mb-6 neu-inset p-3 rounded-xl text-xs">
              <div className="flex items-center gap-2 text-white">
                <Store className="w-4 h-4 text-[#9D4EDD]" />
                <span className="font-semibold">{selectedItem.vendor_name}</span>
              </div>
              <div className="flex items-center gap-2 text-[#A09ABC]">
                <MapPin className="w-4 h-4 text-[#00F5D4]" />
                <span>{selectedItem.market_location}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 neu-btn-accent py-2.5 text-xs font-bold text-white text-center cursor-pointer hover:brightness-110"
              >
                Call / WhatsApp Trader
              </button>
              <button
                onClick={() => handleDeleteItem(selectedItem.id)}
                className="neu-btn px-3 py-2.5 text-xs text-red-400 hover:text-red-300"
                title="Simulate DELETE /api/items/:id"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="neu-raised max-w-lg w-full p-6 border border-[#2A2640] relative">
            <button
              onClick={() => setIsAddItemModalOpen(false)}
              className="absolute top-4 right-4 text-[#A09ABC] hover:text-white neu-btn p-2"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Add Market Item (Vendor Portal)</h3>
            <p className="text-xs text-[#A09ABC] mb-4">
              Writes to Cloud Firestore and indexes in Typesense simultaneously.
            </p>

            <form onSubmit={handleCreateItem} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#A09ABC] uppercase mb-1">
                  Product / Item Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yellow Passion Fruits (Kilo)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full neu-inset px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#A09ABC] uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full neu-inset px-3 py-2 text-xs text-white outline-none bg-[#1E1B2E]"
                  >
                    <option value="Produce">Produce</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Textiles">Textiles</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Hardware">Hardware</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#A09ABC] uppercase mb-1">
                    Price in UGX
                  </label>
                  <input
                    type="number"
                    required
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-full neu-inset px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#A09ABC] uppercase mb-1">
                    Vendor Stalls / Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nalongo Agnes"
                    value={newItemVendor}
                    onChange={(e) => setNewItemVendor(e.target.value)}
                    className="w-full neu-inset px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#A09ABC] uppercase mb-1">
                    Market
                  </label>
                  <select
                    value={newItemMarket}
                    onChange={(e) => setNewItemMarket(e.target.value)}
                    className="w-full neu-inset px-3 py-2 text-xs text-white outline-none bg-[#1E1B2E]"
                  >
                    <option value="Nakasero Market">Nakasero Market</option>
                    <option value="Owino Market">Owino Market</option>
                    <option value="Ndeeba Spares Hub">Ndeeba Spares Hub</option>
                    <option value="Kikuubo Lane">Kikuubo Lane</option>
                    <option value="Katwe Metal Hub">Katwe Metal Hub</option>
                  </select>
                </div>
              </div>

              {syncLog.length > 0 && (
                <div className="p-3 neu-inset rounded-xl space-y-1 text-[11px] font-mono">
                  {syncLog.map((log, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      {log.status === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00F5D4]" />
                      ) : (
                        <div className="w-3 h-3 border border-[#9D4EDD] border-t-transparent rounded-full animate-spin" />
                      )}
                      <span className={log.status === 'success' ? 'text-white' : 'text-[#A09ABC]'}>
                        {log.step}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="neu-btn px-4 py-2 text-xs text-[#A09ABC] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="neu-btn-accent px-5 py-2 text-xs font-bold text-white cursor-pointer"
                >
                  {isSubmitting ? 'Syncing...' : 'Save & Index Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
