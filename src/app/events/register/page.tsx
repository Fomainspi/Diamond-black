import Link from "next/link";
const fields = [
  ["fullName","Full name","text"],
  ["email","Email address","email"],
  ["phone","Phone number","tel"],
  ["company","Company / Organization","text"]
];

export default function RegisterPage() {
  return (
    <>
      <header className="site-header"><div className="container header-inner"><Link className="brand" href="/"><img className="brand-logo" src="/images/diamond-black-horizontal.jpg" alt="Diamond Black Corporation"/></Link><nav className="nav"><Link href="/about">About</Link><Link href="/services">Services</Link><Link href="/events">Events</Link><Link href="/news">News</Link><Link href="/newsletter">Newsletter</Link><Link href="/contact">Contact</Link></nav></div></header>
      <main>
        <section className="page-hero"><div className="container"><span className="eyebrow">100 People · One Night</span><h1>Register</h1></div></section>
        <section className="section"><div className="container registration-layout">
          <div><span className="eyebrow">Saturday · 14 November 2026</span><h2>Reserve your place.</h2><p className="lead">19H – 03H · Manila, Philippines</p><p>Complete the registration form to express your interest in attending. Registration submission will be connected to the secure event registration service in the next backend implementation stage.</p></div>
          <form className="registration-form">
            {fields.map(([id,label,type]) => <label key={id} htmlFor={id}>{label}<input id={id} name={id} type={type} required={id !== "company"} /></label>)}
            <label htmlFor="guests">Number of attendees<select id="guests" name="guests" defaultValue="1"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></label>
            <label className="checkbox-label"><input type="checkbox" required /> I agree to be contacted about this event.</label>
            <button className="button" type="submit" disabled>Registration Coming Soon</button>
          </form>
        </div></section>
      </main>
      <footer className="site-footer"><div className="container footer-inner"><div className="footer-brand"><img src="/images/diamond-black-horizontal.jpg" alt="Diamond Black Corporation"/></div><div className="footer-tagline">BUILD • INNOVATE • EXPAND</div><div>© {new Date().getFullYear()} Diamond Black Corporation</div></div></footer>
    </>
  );
}
