import { useEffect, useRef, useState } from "react";
import {
  Shield, MapPin, Thermometer, Package, CheckCircle, AlertCircle, ArrowUpRight,
} from "lucide-react";
import site from "./data/site.json";
import manifest from "./data/manifest.json";
import rates from "./data/rates.json";
import notes from "./data/notes.json";
import { FORM_ENDPOINT, CONTACT_EMAIL } from "./config.js";

/* ---------- helpers ---------- */

function fmtDate(iso) {
  const monthOnly = iso.length === 7;
  return new Date(monthOnly ? `${iso}-01T00:00:00Z` : `${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    ...(monthOnly ? {} : { day: "numeric" }),
    year: "numeric",
    timeZone: "UTC",
  });
}

// Evaluated once at load. If nobody refreshes the data files, the page says so.
const DAYS_SINCE_REVIEW = Math.floor((Date.now() - Date.parse(`${site.updated}T00:00:00Z`)) / 86400000);
const STALE_AFTER_DAYS = 21;

const STATUS_STYLE = {
  LAUNCHED: { label: "Launched", dot: "bg-slate-400" },
  SLIPPED: { label: "Slipped", dot: "bg-amber-400" },
  UNCONFIRMED: { label: "Date unconfirmed", dot: "bg-sky-400" },
  SCHEDULED: { label: "Scheduled", dot: "bg-emerald-400" },
};

const labelCls = "block text-xs text-slate-300 uppercase tracking-widest mb-1.5";
const fieldCls =
  "w-full bg-slate-800/60 border border-slate-600 text-slate-100 text-sm px-3 py-2.5 min-h-11 focus:border-sky-400 placeholder-slate-400 font-mono";

function SourceLink({ source }) {
  if (!source || !source.name) return <span className="text-slate-400">—</span>;
  if (!source.url) return <span>{source.name}</span>;
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-slate-500 underline-offset-2 hover:text-white"
    >
      {source.name}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function SectionHeading({ id, children, meta }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3 border-b border-slate-700/60">
      <h2 id={id} className="text-slate-100 text-sm uppercase tracking-widest font-bold">
        {children}
      </h2>
      {meta && <span className="text-slate-400 text-xs font-mono">{meta}</span>}
    </div>
  );
}

/* ---------- sections ---------- */

function MarketNotes() {
  const sorted = [...notes].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <section aria-labelledby="notes-h" className="border border-slate-700/60 bg-slate-900/40">
      <SectionHeading id="notes-h" meta="Third-party reporting, linked to source">
        Market Notes
      </SectionHeading>
      <ul className="divide-y divide-slate-800/60">
        {sorted.map((n) => (
          <li key={n.title} className="px-5 py-4 grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
            <div className="text-xs font-mono text-slate-400">
              <time dateTime={n.date}>{fmtDate(n.date)}</time>
              <span className="block uppercase tracking-widest mt-0.5">{n.tag}</span>
            </div>
            <div>
              <p className="text-slate-100 text-sm font-sans leading-snug">{n.title}</p>
              {n.buyerNote && (
                <p className="text-slate-300 text-sm font-sans mt-1">
                  <span className="text-slate-400">For buyers: </span>
                  {n.buyerNote}
                </p>
              )}
              <p className="text-slate-400 text-xs mt-1">
                Source: <SourceLink source={n.source} />
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function LaunchWatch({ onAsk }) {
  return (
    <section aria-labelledby="watch-h" className="xl:col-span-3 border border-slate-700/60 bg-slate-900/40">
      <SectionHeading id="watch-h" meta={`Reviewed ${fmtDate(site.updated)}`}>
        Launch Watch
      </SectionHeading>
      <div className="overflow-x-auto" role="region" aria-labelledby="watch-h" tabIndex={0}>
        <table className="w-full text-left text-sm min-w-[44rem]">
          <caption className="sr-only">
            Launch and platform schedule items, with provider, orbit, window, status and source.
          </caption>
          <thead>
            <tr className="border-b border-slate-800 text-slate-300 text-xs uppercase tracking-widest">
              <th scope="col" className="px-5 py-2 font-normal">Mission</th>
              <th scope="col" className="px-3 py-2 font-normal">Orbit</th>
              <th scope="col" className="px-3 py-2 font-normal">Window</th>
              <th scope="col" className="px-3 py-2 font-normal">Status</th>
              <th scope="col" className="px-3 py-2 font-normal">Source</th>
              <th scope="col" className="px-5 py-2 font-normal"><span className="sr-only">Action</span></th>
            </tr>
          </thead>
          <tbody>
            {manifest.map((row) => {
              const st = STATUS_STYLE[row.status] ?? STATUS_STYLE.UNCONFIRMED;
              return (
                <tr key={row.mission} className="border-b border-slate-800/60 align-top">
                  <th scope="row" className="px-5 py-3.5 font-normal">
                    <span className="block text-slate-100 font-bold">{row.mission}</span>
                    <span className="block text-slate-400 text-xs">
                      {row.provider} · {row.type}
                    </span>
                    {row.note && <span className="block text-slate-400 text-xs">{row.note}</span>}
                  </th>
                  <td className="px-3 py-3.5 text-slate-300">{row.orbit}</td>
                  <td className="px-3 py-3.5 text-slate-300 font-mono">{row.window}</td>
                  <td className="px-3 py-3.5">
                    <span className="inline-flex items-center gap-2 text-slate-200">
                      <span aria-hidden="true" className={`w-2 h-2 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-slate-300 text-xs"><SourceLink source={row.source} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onAsk(row.mission)}
                      className="min-h-11 border border-slate-500 hover:border-slate-200 hover:text-white text-slate-200 text-xs px-3 uppercase tracking-widest whitespace-nowrap"
                    >
                      Ask<span className="sr-only"> about {row.mission}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="px-5 py-3 text-xs text-slate-400 font-sans leading-relaxed">
        Dates move often. Check with the provider before relying on any window. Final Freight does not hold
        capacity on these missions; they are listed so buyers can compare options.
      </p>
    </section>
  );
}

function RateReference() {
  return (
    <section aria-labelledby="rates-h" className="xl:col-span-1 border border-slate-700/60 bg-slate-900/40">
      <div className="px-4 py-3 border-b border-slate-700/60">
        <h2 id="rates-h" className="text-slate-100 text-sm uppercase tracking-widest font-bold">
          Reference Rates
        </h2>
      </div>
      <dl className="divide-y divide-slate-800/60">
        {rates.map((r) => (
          <div key={r.label} className="px-4 py-3">
            <dt className="text-slate-300 text-xs">{r.label}</dt>
            <dd className="font-mono text-lg font-bold text-slate-100 mt-0.5">{r.value}</dd>
            <dd className="text-slate-400 text-xs font-sans mt-1">{r.detail}</dd>
            {r.source?.name && (
              <dd className="text-slate-400 text-xs mt-1">
                <SourceLink source={r.source} />
              </dd>
            )}
          </div>
        ))}
      </dl>
      <p className="px-4 py-3 border-t border-slate-800 text-xs text-slate-400 font-sans">
        Published or reported list prices, for reference. Contract pricing differs.
      </p>
    </section>
  );
}

function Services() {
  const items = [
    {
      icon: <Package size={16} aria-hidden="true" />,
      label: "Launch option comparison",
      desc: "Side-by-side comparison of published rates, schedules, orbits and integration requirements across rideshare and dedicated options.",
    },
    {
      icon: <Shield size={16} aria-hidden="true" />,
      label: "Export-control awareness",
      desc: "We flag ITAR and EAR questions early so they are settled before a contract is signed. We are not a law firm; classification and licensing go to qualified export counsel.",
    },
    {
      icon: <Thermometer size={16} aria-hidden="true" />,
      label: "Handling requirements",
      desc: "Requirements scoping for sensitive payloads, including temperature-controlled biological and pharmaceutical samples.",
    },
    {
      icon: <MapPin size={16} aria-hidden="true" />,
      label: "Return and downmass options",
      desc: "Where a payload has to come back, a review of the available return pathways, custody handoffs and customs steps.",
    },
  ];
  return (
    <section aria-labelledby="help-h" className="border border-slate-700/60 bg-slate-900/40 p-6">
      <h2 id="help-h" className="text-slate-100 text-sm uppercase tracking-widest font-bold mb-3">
        What we help with
      </h2>
      <p className="text-slate-300 text-sm font-sans leading-relaxed mb-5">
        Commercial orbital infrastructure is growing: stations, research platforms, manufacturing modules.
        Industrial companies with a specific orbital question often have no procurement process for it. That
        gap is what Final Freight works on.
      </p>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.label} className="flex gap-3">
            <span className="flex-shrink-0 text-slate-300 mt-0.5">{item.icon}</span>
            <div>
              <h3 className="text-slate-100 text-xs font-bold uppercase tracking-widest mb-0.5">{item.label}</h3>
              <p className="text-slate-300 text-sm font-sans leading-relaxed">{item.desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function QuoteForm({ topic }) {
  const [form, setForm] = useState({
    name: "", email: "", company: "", mass: "",
    contents: "Biological", orbit: "LEO (400–600km)",
    notes: topic ? `Re: ${topic}. ` : "", website: "",
  });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error | mailto
  const notesRef = useRef(null);
  const doneRef = useRef(null);

  useEffect(() => {
    if (topic && notesRef.current) {
      notesRef.current.focus();
      const len = notesRef.current.value.length;
      notesRef.current.setSelectionRange(len, len);
    }
  }, [topic]);

  useEffect(() => {
    if ((status === "sent" || status === "mailto") && doneRef.current) doneRef.current.focus();
  }, [status]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    if (form.website) return; // honeypot: real visitors never see this field
    const { website, ...fields } = form; // eslint-disable-line no-unused-vars

    if (!FORM_ENDPOINT) {
      const body = [
        `Name: ${fields.name}`, `Email: ${fields.email}`, `Company: ${fields.company || "-"}`,
        `Payload mass (kg): ${fields.mass}`, `Contents: ${fields.contents}`, `Destination: ${fields.orbit}`,
        "", fields.notes,
      ].join("\n");
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Payload inquiry")}&body=${encodeURIComponent(body)}`;
      setStatus("mailto");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ _subject: "Final Freight payload inquiry", ...fields }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent" || status === "mailto") {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
        <CheckCircle size={28} className="text-emerald-400" aria-hidden="true" />
        <h3 ref={doneRef} tabIndex={-1} className="text-slate-100 text-base font-bold">
          {status === "sent" ? "Request received" : "Check your email app"}
        </h3>
        <p className="text-slate-300 text-sm font-sans max-w-sm leading-relaxed" role="status">
          {status === "sent"
            ? "Thanks. You will hear back within two business days."
            : <>Your email app should have opened with the request filled in. Press send there to complete it. If nothing opened, write to <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</>}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="q-name" className={labelCls}>Name <span aria-hidden="true">*</span></label>
          <input id="q-name" required autoComplete="name" value={form.name} onChange={set("name")} className={fieldCls} />
        </div>
        <div>
          <label htmlFor="q-email" className={labelCls}>Email <span aria-hidden="true">*</span></label>
          <input id="q-email" type="email" required autoComplete="email" value={form.email} onChange={set("email")} className={fieldCls} />
        </div>
      </div>
      <div>
        <label htmlFor="q-company" className={labelCls}>Company</label>
        <input id="q-company" autoComplete="organization" value={form.company} onChange={set("company")} className={fieldCls} />
      </div>
      <div>
        <label htmlFor="q-mass" className={labelCls}>Payload mass, kg <span aria-hidden="true">*</span></label>
        <input id="q-mass" type="number" inputMode="decimal" min="0" step="any" required value={form.mass} onChange={set("mass")} placeholder="e.g. 25" className={fieldCls} />
      </div>
      <fieldset>
        <legend className={labelCls}>Contents</legend>
        <div className="flex flex-wrap gap-2">
          {["Biological", "Technology", "Materials", "Other"].map((opt) => (
            <div key={opt} className="relative flex-1 min-w-24">
              <input
                type="radio" name="contents" id={`q-c-${opt}`} value={opt}
                checked={form.contents === opt}
                onChange={set("contents")}
                className="peer sr-only"
              />
              <label
                htmlFor={`q-c-${opt}`}
                className="block text-center text-xs py-3 min-h-11 border border-slate-600 text-slate-300 uppercase tracking-widest cursor-pointer peer-checked:border-slate-200 peer-checked:text-white peer-checked:bg-slate-800 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sky-400"
              >
                {opt}
              </label>
            </div>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="q-orbit" className={labelCls}>Target orbit or destination</label>
        <select id="q-orbit" value={form.orbit} onChange={set("orbit")} className={fieldCls}>
          {["LEO (400–600km)", "SSO (Sun-synchronous)", "ISS", "MEO", "GEO", "Lunar transit", "Not sure yet"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="q-notes" className={labelCls}>Handling needs and timeline</label>
        <textarea
          id="q-notes" ref={notesRef} rows={4} value={form.notes} onChange={set("notes")}
          placeholder="Temperature control, export-control questions, return needed, target dates…"
          className={`${fieldCls} font-sans`}
        />
      </div>
      <div className="hidden" aria-hidden="true">
        <label>Leave this empty<input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} /></label>
      </div>

      {status === "error" && (
        <p role="alert" className="flex items-start gap-2 text-sm font-sans text-amber-300 border border-amber-400/40 px-3 py-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>
            That did not go through. Please try again, or email{" "}
            <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> directly.
          </span>
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full min-h-12 bg-slate-100 hover:bg-white text-slate-900 text-xs uppercase tracking-widest py-3 font-bold disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {status === "sending" ? "Sending…" : "Send request"}
        <ArrowUpRight size={14} aria-hidden="true" />
      </button>
      <p className="text-slate-400 text-xs text-center font-sans leading-relaxed">
        No commitment. We reply within two business days.
      </p>
    </form>
  );
}

/* ---------- page ---------- */

export default function FinalFreight() {
  const [topic, setTopic] = useState("");

  function ask(mission) {
    setTopic(mission);
    document.getElementById("request")?.scrollIntoView({ block: "start" });
  }

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-300 font-mono"
      style={{
        backgroundImage:
          "linear-gradient(rgba(148,163,184,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-slate-100 focus:text-slate-900 focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      <header className="border-b border-slate-700/80 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="w-5 h-5 border border-slate-300 rotate-45 flex items-center justify-center">
              <span className="w-2 h-2 bg-slate-200 block" />
            </span>
            <span className="text-slate-100 font-bold tracking-[0.2em] text-sm uppercase ml-1">Final Freight</span>
          </div>
          <span className="text-slate-400 text-xs">Data reviewed {fmtDate(site.updated)}</span>
        </div>
      </header>

      <main id="main" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {DAYS_SINCE_REVIEW > STALE_AFTER_DAYS && (
          <p role="status" className="border border-amber-400/40 text-amber-300 text-sm font-sans px-4 py-3">
            The schedule, rates and notes below were last reviewed on {fmtDate(site.updated)} and may be out of date.
          </p>
        )}

        <section aria-labelledby="hero-h" className="pt-2 max-w-3xl">
          <p className="text-xs text-slate-300 uppercase tracking-widest mb-3">
            Procurement advisory · Commercial space logistics
          </p>
          <h1 id="hero-h" className="text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight leading-tight">
            Launch and orbital logistics, from the buyer&rsquo;s side of the table.
          </h1>
          <p className="text-slate-300 text-base font-sans max-w-2xl mt-4 leading-relaxed">
            Final Freight helps industrial companies with a specific orbital question, and no procurement
            process for it, compare launch and platform options and understand what a purchase involves.
          </p>
          <p className="mt-5">
            <a
              href="#request"
              className="inline-flex items-center gap-2 min-h-11 border border-slate-400 hover:border-white hover:text-white text-slate-100 text-xs uppercase tracking-widest px-4"
            >
              Describe your payload <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </p>
        </section>

        <MarketNotes />

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <LaunchWatch onAsk={ask} />
          <RateReference />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Services />
          <section id="request" aria-labelledby="request-h" className="border border-slate-700/60 bg-slate-900/40 p-6 scroll-mt-4">
            <h2 id="request-h" className="text-slate-100 text-sm uppercase tracking-widest font-bold mb-1">
              Describe your payload
            </h2>
            <p className="text-slate-300 text-sm font-sans mb-5">
              A few details are enough to start. Fields marked * are required.
            </p>
            <QuoteForm key={topic} topic={topic} />
          </section>
        </div>

        <footer className="border-t border-slate-800 pt-6 pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs text-slate-400">
          <p>Final Freight LLC · Memphis, TN · <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
          <p className="font-sans lg:text-right max-w-xl">
            Rates and schedules are published or reported figures and change often. Verify with the provider.
            Transactions are subject to applicable export-control law.
          </p>
        </footer>
      </main>
    </div>
  );
}
