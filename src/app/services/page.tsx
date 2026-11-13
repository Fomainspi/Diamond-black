import Link from "next/link";
import ServicesShowcase from "./ServicesShowcase";

export default function ServicesPage() {
  return (
    <>
      <header className="site-header"><div className="container header-inner"><Link className="brand" href="/"><img className="brand-logo" src="/images/diamond-black-horizontal.jpg" alt="Diamond Black Corporation" /></Link><nav className="nav" aria-label="Main navigation"><Link href="/about">About</Link><Link href="/services">Services</Link><Link href="/events">Events</Link><Link href="/news">News</Link><Link href="/newsletter">Newsletter</Link><Link href="/contact">Contact</Link></nav></div></header>
      <main>
        <section className="page-hero"><div className="container"><span className="eyebrow">What We Do</span><h1>Services</h1><p className="lead">Connecting people, strengthening brands, and creating opportunities for growth.</p></div></section>
        <section className="section"><div className="container"><ServicesShowcase /></div></section>
        <section className="section service-cta"><div className="container"><span className="eyebrow">Have an Opportunity in Mind?</span><h2>Let’s create something meaningful together.</h2><Link className="button" href="/contact">Talk to Diamond Black</Link></div></section>
      </main>
      <footer className="site-footer"><div className="container footer-inner"><div className="footer-brand"><img src="/images/diamond-black-horizontal.jpg" alt="Diamond Black Corporation" /></div><div className="footer-tagline">BUILD • INNOVATE • EXPAND</div><div>© {new Date().getFullYear()} Diamond Black Corporation</div></div></footer>
    </>
  );
}
