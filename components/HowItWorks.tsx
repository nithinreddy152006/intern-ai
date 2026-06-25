"use client";

const steps = [
  { icon: "🔍", title: "Browse Catalog", desc: "Search and filter tools by category, availability, or name." },
  { icon: "📋", title: "Select & Book", desc: "Choose your tool, pick rental dates, and fill your details." },
  { icon: "💳", title: "Confirm & Pay", desc: "Review the booking summary and confirm your reservation." },
  { icon: "🔑", title: "Pick Up Tool", desc: "Collect the tool from our depot — it's reserved for you." },
  { icon: "🏗️", title: "Use It On-Site", desc: "Get the job done with professional-grade equipment." },
  { icon: "↩️", title: "Return & Close", desc: "Drop the tool back and close the rental. No fuss." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4" style={{ background: "rgba(8,20,35,0.3)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="pill inline-flex mb-4">📖 Process</div>
          <h2 className="text-4xl font-black text-white mb-3">How It <span className="glow-text">Works</span></h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Our rental process follows a clear activity workflow — 6 simple steps from browsing to returning.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-14 left-[8.33%] right-[8.33%] h-px"
            style={{ background: "linear-gradient(90deg, rgba(249,115,22,0.6), rgba(14,165,233,0.4))" }} />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {steps.map((s, i) => (
              <div key={i} id={`step-${i}`} className="flex flex-col items-center text-center">
                <div
                  className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 z-10"
                  style={{
                    background: `linear-gradient(135deg, rgba(249,115,22,${0.15 + i * 0.04}), rgba(14,165,233,0.1))`,
                    border: "1px solid rgba(249,115,22,0.3)",
                    boxShadow: "0 4px 20px rgba(249,115,22,0.15)",
                  }}
                >
                  {s.icon}
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white"
                    style={{ background: "linear-gradient(135deg,#f97316,#c2410c)" }}>
                    {i + 1}
                  </div>
                </div>
                <h4 className="font-bold text-white text-sm mb-1.5">{s.title}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <button
            id="hiw-browse-btn"
            onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-primary"
            style={{ padding: "13px 36px", fontSize: "15px" }}
          >
            Start Browsing Tools 🔍
          </button>
        </div>
      </div>
    </section>
  );
}
