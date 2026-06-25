"use client";
import { useState, useMemo } from "react";
import { useRentalStore } from "@/lib/store";
import { CATEGORIES, Tool, ToolCategory } from "@/lib/data";
import RentModal from "./RentModal";

const STATUS_CLASS: Record<string, string> = {
  available: "status-available",
  rented: "status-rented",
  reserved: "status-reserved",
  maintenance: "status-maintenance",
};
const STATUS_LABEL: Record<string, string> = {
  available: "Available",
  rented: "Rented Out",
  reserved: "Reserved",
  maintenance: "Maintenance",
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className="star" style={{ opacity: s <= Math.round(rating) ? 1 : 0.25 }}>★</span>
      ))}
    </span>
  );
}

function ToolCard({ tool, onRent }: { tool: Tool; onRent: (t: Tool) => void }) {
  const canRent = tool.status === "available";
  return (
    <div id={`tool-card-${tool.id}`} className="tool-card">
      {/* Icon Banner */}
      <div className="h-32 flex items-center justify-center relative"
        style={{ background: "linear-gradient(135deg,rgba(249,115,22,0.08),rgba(14,165,233,0.06))" }}>
        <span className="text-6xl">{tool.icon}</span>
        <div className="absolute top-3 right-3">
          <span className={STATUS_CLASS[tool.status]}>{STATUS_LABEL[tool.status]}</span>
        </div>
        <div className="absolute top-3 left-3 pill" style={{ fontSize: "10px", padding: "2px 10px" }}>
          {tool.category}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-white text-base mb-1 leading-tight">{tool.name}</h3>
        <p className="text-slate-400 text-xs leading-relaxed mb-3 line-clamp-2">{tool.description}</p>

        <div className="flex items-center gap-2 mb-4">
          <Stars rating={tool.rating} />
          <span className="text-xs text-slate-400">{tool.rating} ({tool.reviews})</span>
        </div>

        {/* Specs preview */}
        <div className="grid grid-cols-2 gap-1.5 mb-4">
          {Object.entries(tool.specs).slice(0, 4).map(([k, v]) => (
            <div key={k} className="rounded-lg px-2 py-1.5" style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.1)" }}>
              <div className="text-slate-500" style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{k}</div>
              <div className="text-slate-200 text-xs font-semibold">{v}</div>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="flex items-end gap-3 mb-4">
          <div>
            <span className="text-orange-400 text-xl font-black">${tool.dailyRate}</span>
            <span className="text-slate-500 text-xs">/day</span>
          </div>
          <div className="text-slate-500 text-xs">or ${tool.weeklyRate}/week</div>
        </div>

        {tool.status === "rented" && tool.available_from && (
          <p className="text-xs text-yellow-400/80 mb-3">📅 Available from {tool.available_from}</p>
        )}

        <button
          id={`rent-btn-${tool.id}`}
          onClick={() => canRent && onRent(tool)}
          disabled={!canRent}
          className={canRent ? "btn-primary w-full" : "btn-ghost w-full"}
          style={{ fontSize: "13px", padding: "10px" }}
        >
          {canRent ? "Rent Now →" : tool.status === "rented" ? "Currently Rented" : tool.status === "reserved" ? "Reserved" : "Unavailable"}
        </button>
      </div>
    </div>
  );
}

export default function ToolCatalog() {
  const { tools } = useRentalStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ToolCategory | "All">("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "available">("all");
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const filtered = useMemo(() => {
    return tools.filter((t) => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" || t.category === category;
      const matchStatus = statusFilter === "all" || t.status === "available";
      return matchSearch && matchCat && matchStatus;
    });
  }, [tools, search, category, statusFilter]);

  return (
    <section id="catalog" className="py-20 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="pill inline-flex mb-4">🔍 Equipment Catalog</div>
        <h2 className="text-4xl font-black text-white mb-3">Browse <span className="glow-text">Available Tools</span></h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          {tools.filter((t) => t.status === "available").length} tools ready to rent today.
          Filter by category or search by name.
        </p>
      </div>

      {/* Filters */}
      <div className="glass-card-flat p-4 mb-8 flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          <input
            id="catalog-search"
            type="text"
            className="input-field"
            style={{ paddingLeft: "36px" }}
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Category */}
        <select
          id="catalog-category"
          className="input-field"
          style={{ maxWidth: 180 }}
          value={category}
          onChange={(e) => setCategory(e.target.value as ToolCategory | "All")}
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {/* Status */}
        <div className="flex gap-2">
          {["all", "available"].map((s) => (
            <button
              key={s}
              id={`filter-${s}`}
              onClick={() => setStatusFilter(s as "all" | "available")}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: statusFilter === s ? "linear-gradient(135deg,#f97316,#c2410c)" : "rgba(249,115,22,0.06)",
                color: statusFilter === s ? "white" : "#94a3b8",
                border: `1px solid ${statusFilter === s ? "transparent" : "rgba(249,115,22,0.15)"}`,
              }}
            >
              {s === "all" ? "All" : "✅ Available Only"}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-400 mb-5">
        Showing <span className="text-orange-400 font-bold">{filtered.length}</span> tool{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-semibold">No tools match your search.</p>
          <button onClick={() => { setSearch(""); setCategory("All"); setStatusFilter("all"); }} className="btn-ghost mt-4 text-sm">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((t) => (
            <ToolCard key={t.id} tool={t} onRent={setSelectedTool} />
          ))}
        </div>
      )}

      {selectedTool && (
        <RentModal tool={selectedTool} onClose={() => setSelectedTool(null)} />
      )}
    </section>
  );
}
