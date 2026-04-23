import { useState, useEffect } from "react";
import {
  Rocket, Package, Globe, Clock, ChevronRight, TrendingUp,
  TrendingDown, AlertCircle, CheckCircle, Minus, ArrowUpRight,
  FileText, Shield, Thermometer, MapPin, Zap, BarChart2
} from "lucide-react";

const TICK_ITEMS = [
  { label: "LEO Spot Price", value: "$7,000/kg", delta: "+2.1%", up: true },
  { label: "GEO Spot Price", value: "$18,200/kg", delta: "+0.4%", up: true },
  { label: "Orbital Congestion (LEO)", value: "LOW", delta: null, status: "green" },
  { label: "Rideshare Queue (SpaceX)", value: "14 manifests", delta: null },
  { label: "ITAR Processing Time", value: "~62 days", delta: "-3d", up: true },
  { label: "Downmass Availability", value: "CONSTRAINED", delta: null, status: "amber" },
  { label: "RocketLab Backlog", value: "6 missions", delta: null },
  { label: "ISS Berthing Slots Q3", value: "2 OPEN", delta: null, status: "green" },
];

const MANIFEST = [
  { mission: "Transporter-17", carrier: "SpaceX", window: "2026-06 NET", orbit: "SSO 550km", utilization: 52, status: "OPEN" },
  { mission: "iQPS QPS-SAR-13", carrier: "Rocket Lab", window: "2026-05 NET", orbit: "LEO SAR", utilization: 71, status: "OPEN" },
  { mission: "LOXSAT (NASA)", carrier: "Rocket Lab", window: "2026-06-25 NET", orbit: "LEO Cryo", utilization: 100, status: "FULL" },
  { mission: "Synspective StriX", carrier: "Rocket Lab", window: "2026-10-12 NET", orbit: "LEO SAR", utilization: 40, status: "OPEN" },
  { mission: "Transporter-18", carrier: "SpaceX", window: "2026-09 NET", orbit: "SSO 525km", utilization: 28, status: "OPEN" },
  { mission: "Kakushin Rising", carrier: "Rocket Lab", window: "2026-04-23", orbit: "LEO 550km", utilization: 100, status: "LAUNCHED" },
];

const FFI_DATA = [
  { label: "LEO Upmass (Rideshare)", value: "$7,000", delta: "+$112", up: true },
  { label: "LEO Upmass (Dedicated)", value: "$12,800", delta: "+$340", up: true },
  { label: "GEO Upmass", value: "$18,200", delta: "+$75", up: true },
  { label: "Dragon Downmass", value: "$29,000", delta: "-$600", up: false },
  { label: "Crewed Return (Biomed)", value: "$48,000", delta: "+$2,100", up: true },
  { label: "Dream Chaser (proj.)", value: "TBD", delta: "NET 2027", up: null },
];

const statusDot = { OPEN: "bg-emerald-400", CLOSING: "bg-amber-400", FULL: "bg-red-400", LAUNCHED: "bg-slate-500" };

function UtilBar({ pct }) {
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 bg-slate-700 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-xs text-slate-400">{pct}%</span>
    </div>
  );
}

function Ticker() {
  const [pos, setPos] = useState(0);
  const itemW = 320;
  const totalW = TICK_ITEMS.length * itemW;

  useEffect(() => {
    const id = setInterval(() => setPos((p) => (p + 1) % totalW), 30);
    return () => clearInterval(id);
  }, [totalW]);

  const repeated = [...TICK_ITEMS, ...TICK_ITEMS, ...TICK_ITEMS];

  return (
    <div className="overflow-hidden border-b border-slate-700/60 bg-slate-950/80">
      <div
        className="flex items-center whitespace-nowrap"
        style={{ transform: `translateX(-${pos}px)`, willChange: "transform" }}
      >
        {repeated.map((item, i) => (
          <div key={i} className="inline-flex items-center gap-2 px-6 py-2 border-r border-slate-800" style={{ minWidth: itemW }}>
            <span className="text-slate-500 text-xs uppercase tracking-widest font-mono">{item.label}</span>
            <span className="font-mono text-xs font-bold text-slate-200">{item.value}</span>
            {item.delta && (
              <span className={`font-mono text-xs ${item.up ? "text-emerald-400" : "text-red-400"}`}>
                {item.up ? "▲" : "▼"} {item.delta}
              </span>
            )}
            {item.status === "green" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
            {item.status === "amber" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function SparkLine({ up }) {
  const points = up
    ? "0,18 8,14 16,16 24,10 32,12 40,6 48,8 56,4 64,2"
    : "0,2 8,6 16,4 24,10 32,8 40,14 48,12 56,16 64,18";
  return (
    <svg width="64" height="20" className="opacity-60">
      <polyline points={points} fill="none" stroke={up ? "#34d399" : "#f87171"} strokeWidth="1.5" />
    </svg>
  );
}

export default function FinalFreight() {
  const [form, setForm] = useState({ mass: "", contents: "Biological", orbit: "LEO (400–600km)", notes: "" });
  const [submitted, setSubmitted] = useState(false);
  const [inquire, setInquire] = useState(null);

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-300 font-mono"
      style={{
        backgroundImage: `linear-gradient(rgba(148,163,184,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.03) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }}
    >
      {/* HEADER */}
      <form name="freight-quote" netlify data-netlify="true" hidden>
  <input name="mass" />
  <input name="contents" />
  <input name="orbit" />
  <input name="notes" />
</form>
      <header className="sticky top-0 z-50 border-b border-slate-700/80 bg-slate-950/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 border border-slate-400 rotate-45 flex items-center justify-center">
                <div className="w-2 h-2 bg-slate-200" />
              </div>
              <span className="text-slate-100 font-bold tracking-[0.2em] text-sm uppercase">Final Freight</span>
            </div>
            <span className="text-slate-600 text-xs hidden sm:inline">|</span>
            <span className="text-slate-500 text-xs hidden sm:inline tracking-widest uppercase">Commercial Space Logistics</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-500 font-mono hidden md:inline">{new Date().toISOString().slice(0, 16).replace("T", " ")} UTC</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 uppercase tracking-widest text-xs">LIVE</span>
            </div>
          </div>
        </div>
        <Ticker />
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* HERO */}
        <section className="pt-4 pb-2">
          <div className="flex flex-col gap-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-widest mb-1">
              <Rocket size={12} />
              <span>Freight Intelligence Platform</span>
              <span className="text-slate-700">—</span>
              <span>Est. 2026</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight leading-none">
              THE TERMINAL<br />
              <span className="text-slate-500">OF THE STARS.</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-xl mt-2 leading-relaxed">
              Procurement infrastructure for commercial orbital logistics. We move the boring stuff that makes the glamorous stuff possible.
            </p>
          </div>
        </section>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

          {/* FREIGHT BOARD */}
          <section className="xl:col-span-3 border border-slate-700/60 bg-slate-900/40">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <BarChart2 size={14} className="text-slate-400" />
                <span className="text-slate-200 text-xs uppercase tracking-widest font-bold">Live Launch Manifest</span>
              </div>
              <span className="text-slate-600 text-xs font-mono">Updated Apr 23, 2026</span>
            </div>
            <div className="grid grid-cols-12 gap-2 px-5 py-2 border-b border-slate-800 text-slate-500 text-xs uppercase tracking-widest">
              <div className="col-span-3">Mission</div>
              <div className="col-span-2">Carrier</div>
              <div className="col-span-2 hidden sm:block">Window</div>
              <div className="col-span-2 hidden sm:block">Orbit</div>
              <div className="col-span-2">Utilization</div>
              <div className="col-span-1"></div>
            </div>
            {MANIFEST.map((row, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 px-5 py-3.5 border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors group">
                <div className="col-span-3 flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot[row.status]}`} />
                  <span className={`text-xs font-bold tracking-wide truncate ${row.status === "LAUNCHED" ? "text-slate-500 line-through" : "text-slate-200"}`}>{row.mission}</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-slate-400 text-xs">{row.carrier}</span>
                </div>
                <div className="col-span-2 hidden sm:flex items-center">
                  <span className="font-mono text-xs text-slate-400">{row.window.slice(0, 10)}</span>
                </div>
                <div className="col-span-2 hidden sm:flex items-center">
                  <span className="text-xs text-slate-500">{row.orbit}</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <UtilBar pct={row.utilization} />
                </div>
                <div className="col-span-1 flex items-center justify-end">
                  <button
                    onClick={() => setInquire(row.mission)}
                    className="text-xs border border-slate-600 hover:border-slate-400 hover:text-slate-200 text-slate-500 px-2 py-1 transition-colors uppercase tracking-widest opacity-0 group-hover:opacity-100 whitespace-nowrap"
                  >
                    Inquire
                  </button>
                </div>
              </div>
            ))}
            <div className="px-5 py-3 flex items-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Open</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Closing</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Full</span>
<span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Launched</span>
              <span className="ml-auto">Contact for current availability.</span>
            </div>
          </section>

          {/* FFI INDEX */}
          <section className="xl:col-span-1 border border-slate-700/60 bg-slate-900/40">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/60">
              <TrendingUp size={14} className="text-slate-400" />
              <span className="text-slate-200 text-xs uppercase tracking-widest font-bold">FFI</span>
              <span className="text-slate-600 text-xs">Final Freight Index</span>
            </div>
            <div className="divide-y divide-slate-800/60">
              {FFI_DATA.map((item, i) => (
                <div key={i} className="px-4 py-3 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-xs leading-tight">{item.label}</span>
                    <SparkLine up={item.up} />
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="font-mono text-base font-bold text-slate-200">{item.value}</span>
                    {item.up !== null ? (
                      <span className={`font-mono text-xs ${item.up ? "text-emerald-400" : "text-red-400"}`}>
                        {item.up ? "▲" : "▼"} {item.delta}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-xs font-mono">{item.delta}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-600">
              Price per kg. Editorial estimates. Not a guarantee of availability.
            </div>
          </section>
        </div>

        {/* THESIS + QUOTE FORM */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* SUPPLY CHAIN THESIS */}
          <section className="border border-slate-700/60 bg-slate-900/40 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Globe size={14} className="text-slate-400" />
              <span className="text-slate-200 text-xs uppercase tracking-widest font-bold">Procurement Thesis</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mb-1 leading-tight">The Terminal of the Stars</h2>
            <p className="text-slate-500 text-xs mb-5 leading-relaxed">
              Commercial orbital infrastructure is accelerating. Stations, data centers, research platforms, manufacturing modules.
              Someone has to move the boring stuff that makes the glamorous stuff possible.
            </p>
            <div className="space-y-4">
              {[
                { icon: <Shield size={13} />, label: "ITAR Compliance", desc: "We structure every engagement around export control from day one. Commodity classifications, license determinations, and audit-ready documentation built into every freight transaction." },
                { icon: <MapPin size={13} />, label: "Last-Mile Transport", desc: "Launch integration is a procurement problem most space customers don't yet have the supplier relationships to solve. We do. From payload integration facility to launch pad, fully brokered." },
                { icon: <Thermometer size={13} />, label: "Cold-Chain Orbital", desc: "Biological samples, pharmaceutical R&D, live cell cultures. Temperature-controlled manifest management and chain-of-custody documentation for microgravity research payloads." },
                { icon: <Package size={13} />, label: "Downmass Recovery", desc: "Return logistics for high-value orbital assets. Custody transfer from splashdown through to your dock — including regulatory clearances, cold-chain continuity, and customs." },
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex-shrink-0 text-slate-500 mt-0.5">{item.icon}</div>
                  <div>
                    <div className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-0.5">{item.label}</div>
                    <div className="text-slate-500 text-xs leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* REQUEST A QUOTE */}
          <section className="border border-slate-700/60 bg-slate-900/40 p-6">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={14} className="text-slate-400" />
              <span className="text-slate-200 text-xs uppercase tracking-widest font-bold">Request a Quote</span>
            </div>
            <p className="text-slate-600 text-xs mb-5 uppercase tracking-widest">Freight Bill of Lading — Orbital Manifest</p>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                
                <CheckCircle size={28} className="text-emerald-400" />
                <p className="text-slate-200 text-sm text-center">Lading received.</p>
                <p className="text-slate-500 text-xs text-center max-w-xs leading-relaxed">
                  A Final Freight procurement specialist will contact you within 2 business days with manifest options and a preliminary cost structure.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ mass: "", contents: "Biological", orbit: "LEO (400–600km)", notes: "" }); }}
                  className="mt-4 border border-slate-700 text-slate-500 text-xs px-4 py-2 uppercase tracking-widest hover:text-slate-300 hover:border-slate-500 transition-colors"
                >
                  Submit Another
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs text-slate-500 uppercase tracking-widest mb-1.5">Payload Mass (kg) <span className="text-red-500">*</span></label>
                  <div className="flex">
                    <input
                      type="number"
                      value={form.mass}
                      onChange={e => setForm(f => ({ ...f, mass: e.target.value }))}
                      placeholder="0.000"
                      className="flex-1 bg-slate-800/60 border border-slate-700 text-slate-200 font-mono text-sm px-3 py-2.5 focus:outline-none focus:border-slate-500 placeholder-slate-700"
                    />
                    <span className="border border-l-0 border-slate-700 bg-slate-800/40 text-slate-600 text-xs px-3 flex items-center font-mono">KG</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 uppercase tracking-widest mb-1.5">Contents Classification</label>
                  <div className="flex gap-2">
                    {["Biological", "Technology", "Materials", "Other"].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setForm(f => ({ ...f, contents: opt }))}
                        className={`flex-1 text-xs py-2 border transition-colors uppercase tracking-widest ${form.contents === opt ? "border-slate-400 text-slate-200 bg-slate-800/60" : "border-slate-700 text-slate-600 hover:border-slate-600"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 uppercase tracking-widest mb-1.5">Target Orbit / Destination</label>
                  <select
                    value={form.orbit}
                    onChange={e => setForm(f => ({ ...f, orbit: e.target.value }))}
                    className="w-full bg-slate-800/60 border border-slate-700 text-slate-200 text-xs px-3 py-2.5 focus:outline-none focus:border-slate-500 font-mono uppercase appearance-none"
                  >
                    {["LEO (400–600km)", "SSO (Sun-Synchronous)", "ISS Berthing", "MEO (2,000–35,000km)", "GEO (35,786km)", "Lunar Transit", "Custom / TBD"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 uppercase tracking-widest mb-1.5">Special Handling / Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Cryogenic requirements, ITAR flags, downmass needed, timeline constraints..."
                    rows={3}
                    className="w-full bg-slate-800/60 border border-slate-700 text-slate-200 text-xs px-3 py-2.5 focus:outline-none focus:border-slate-500 placeholder-slate-700 resize-none font-mono"
                  />
                </div>
                <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-700 font-mono">
                  <span>BOL-FF-{Math.floor(Math.random() * 90000 + 10000)}</span>
                  <span>v1.0 / {new Date().toISOString().slice(0, 10)}</span>
                </div>
                <button
                  onClick={async () => {
  if (!form.mass) return;
  await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      "form-name": "freight-quote",
      ...form
    }).toString()
  });
  setSubmitted(true);
}}
                  disabled={!form.mass}
                  className="w-full bg-slate-200 hover:bg-white text-slate-900 text-xs uppercase tracking-widest py-3 font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Zap size={12} />
                  Submit Freight Request
                  <ArrowUpRight size={12} />
                </button>
                <p className="text-slate-700 text-xs text-center leading-relaxed">
                  No commitment. Preliminary scope returned within 48 hours. ITAR-aware handling from first contact.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* FOOTER */}
        <footer className="border-t border-slate-800 pt-6 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-700 font-mono">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border border-slate-700 rotate-45 flex items-center justify-center">
              <div className="w-1 h-1 bg-slate-600" />
            </div>
            <span className="uppercase tracking-widest">Final Freight LLC</span>
            <span>·</span>
            <span>Est. 2026</span>
            <span>·</span>
            <span>Nashville, TN</span>
          </div>
          <div className="flex gap-4">
            <span>Prices are indicative, not guaranteed.</span>
            <span>·</span>
            <span>All transactions subject to applicable export control law.</span>
          </div>
        </footer>
      </main>

      {/* INQUIRE MODAL */}
      {inquire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="border border-slate-600 bg-slate-900 max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-200 text-xs uppercase tracking-widest font-bold">Inquire: {inquire}</span>
              <button onClick={() => setInquire(null)} className="text-slate-600 hover:text-slate-400 text-xs uppercase tracking-widest">✕ Close</button>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed mb-4">
              To discuss space allocation on {inquire}, contact our manifest desk directly. Reference this mission by name in your inquiry.
            </p>
            <div className="border border-slate-700 bg-slate-800/40 px-4 py-3 font-mono text-xs text-slate-300 mb-4">
              jaredhh@gmail.com
            </div>
            <button onClick={() => setInquire(null)} className="w-full border border-slate-700 text-slate-500 text-xs py-2 uppercase tracking-widest hover:text-slate-300 hover:border-slate-500 transition-colors">
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}