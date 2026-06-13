import { Link } from 'react-router-dom';
import { HiLink, HiChartBar, HiQrCode, HiShieldCheck, HiArrowRight, HiBolt } from 'react-icons/hi2';

const features = [
  { icon: HiLink, title: 'Instant shortening', desc: 'Turn any URL into a clean, shareable link in seconds.' },
  { icon: HiChartBar, title: 'Deep analytics', desc: 'Track clicks, browsers, devices, and daily trends.' },
  { icon: HiQrCode, title: 'QR codes', desc: 'Auto-generate QR codes for every link you create.' },
  { icon: HiBolt, title: 'Custom aliases', desc: 'Brand your links with memorable custom slugs.' },
  { icon: HiShieldCheck, title: 'Link expiry', desc: 'Set expiry dates so links deactivate automatically.' },
  { icon: HiChartBar, title: 'Bulk import', desc: 'Upload a CSV to shorten hundreds of URLs at once.' },
];

const Landing = () => (
  <div className="min-h-screen bg-surface-950 text-zinc-100">
    {/* Nav */}
    <nav className="border-b border-surface-800 bg-surface-950/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
            <HiLink className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-zinc-100">SmartLink</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
            Log in
          </Link>
          <Link to="/register" className="btn-primary text-sm py-2 px-3.5">
            Get started
          </Link>
        </div>
      </div>
    </nav>

    {/* Hero */}
    <section className="mx-auto max-w-5xl px-6 py-24 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-brand-800/50 bg-brand-950/50 px-3 py-1 text-xs font-medium text-brand-400 mb-8">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse-soft" />
        URL Shortener with Analytics
      </div>
      <h1 className="text-5xl font-bold tracking-tight text-zinc-100 mb-6 leading-tight">
        Short links that tell<br />
        <span className="text-brand-400">the whole story</span>
      </h1>
      <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-10">
        Create clean short links, track every click with detailed analytics, generate QR codes,
        and manage everything from one dashboard.
      </p>
      <div className="flex items-center justify-center gap-4">
        <Link to="/register" className="btn-primary gap-2 px-6 py-3 text-base">
          Start for free <HiArrowRight className="h-4 w-4" />
        </Link>
        <Link to="/login" className="btn-secondary px-6 py-3 text-base">
          Log in
        </Link>
      </div>
    </section>

    {/* Features */}
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className="text-center text-sm font-medium text-zinc-500 uppercase tracking-widest mb-12">
        Everything you need
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="card hover:border-surface-700 transition-all">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600/15 mb-3">
              <f.icon className="h-4.5 w-4.5 text-brand-400" />
            </div>
            <h3 className="font-semibold text-zinc-200 mb-1">{f.title}</h3>
            <p className="text-sm text-zinc-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t border-surface-800 py-8 text-center text-xs text-zinc-600">
      <p>SmartLink</p>
    </footer>
  </div>
);

export default Landing;
