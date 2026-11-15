// DRAFT, not imported anywhere. Enable only after article one is published.
// The placeholder titles below were never written; replace them with real,
// published pieces (real titles, real dates, real links) before use.
import { ArrowUpRight } from "lucide-react";

export const INTELLIGENCE = [
  // { date: "YYYY-MM-DD", tag: "PROCUREMENT", title: "…", summary: "…", href: "https://…" },
];

export default function IntelligenceSection() {
  if (INTELLIGENCE.length === 0) return null;
  return (
    <section aria-labelledby="intel-h" className="border border-slate-700/60 bg-slate-900/40">
      <div className="px-5 py-3 border-b border-slate-700/60">
        <h2 id="intel-h" className="text-slate-100 text-sm uppercase tracking-widest font-bold">Writing</h2>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800/60">
        {INTELLIGENCE.map((item) => (
          <li key={item.href} className="p-5">
            <p className="text-xs text-slate-400 uppercase tracking-widest">{item.tag} · {item.date}</p>
            <h3 className="text-slate-100 text-sm font-bold leading-snug mt-2">
              <a href={item.href} className="hover:underline">
                {item.title} <ArrowUpRight size={12} className="inline" aria-hidden="true" />
              </a>
            </h3>
            <p className="text-slate-300 text-sm font-sans mt-2">{item.summary}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
