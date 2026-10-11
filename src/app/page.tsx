import Link from "next/link";
import NewsletterForm from "../components/NewsletterForm";
const services = [
  { number: "01", title: "Strategic Networking", text: "Create meaningful connections that open doors to collaboration and business growth." },
  { number: "02", title: "Digital Marketing", text: "Build a stronger brand presence through focused digital communication and campaigns." },
  { number: "03", title: "Audiovisual Production", text: "Tell your story through thoughtful visual content and professional production." },
  { number: "04", title: "Corporate Events", text: "Bring people together through experiences designed for connection and opportunity." },
  { number: "05", title: "Business Development", text: "Support ideas and partnerships that help businesses innovate and expand." },
  { number: "06", title: "Entrepreneurship", text: "Encourage entrepreneurial thinking, talent, and practical business collaboration." }
];

const newsPreview = [
  { label: "COMPANY", title: "Ideas, people, and opportunities", text: "Updates from the Diamond Black community will appear here." },
  { label: "INSIGHTS", title: "Building for what comes next", text: "Perspectives on business, innovation, and meaningful connections." },
  { label: "COMMUNITY", title: "Stay connected", text: "Discover upcoming activities and stories as they are published." }
];

export default function HomePage() {
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link className="brand" href="/" aria-label="Diamond Black Corporation home">
            <img className="brand-logo" src="/images/diamond-black-horizontal.jpg" alt="Diamond Black Corporation" />
          </Link>
          <nav className="nav" aria-label="Main navigation">
            <Link href="/about">About</Link><Link href="/services">Services</Link><Link href="/events">Events</Link><Link href="/news">News</Link><Link href="/newsletter">Newsletter</Link><Link href="/contact">Contact</Link>
          <a className="social-link header-social" href="https://www.facebook.com/profile.php?id=61594570287188" target="_blank" rel="noreferrer" aria-label="Diamond Black Corporation on Facebook"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14 8h3V4h-3c-3.3 0-5 1.8-5 5v3H6v4h3v4h4v-4h3.2l.8-4H13V9c0-.7.3-1 1-1Z"/></svg></a>
            <a className="social-link header-social" href="https://www.youtube.com/" target="_blank" rel="noreferrer" aria-label="Diamond Black Corporation on YouTube"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2C2 9 2 12 2 12s0 3 .4 4.8a2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2C22 15 22 12 22 12s0-3-.4-4.8ZM10 15.3V8.7l6 3.3-6 3.3Z"/></svg></a>
          </nav>
        </div>
      </header>

      <main id="home">
        <section className="hero">
          <div className="hero-media" aria-hidden="true">
            <img src="/images/diamond-black-primary.jpg" alt="" />
          </div>
          <div className="hero-overlay" />
          <div className="container hero-content">
            <span className="eyebrow">People • Ideas • Opportunities</span>
            <h1>BUILD.<br /><span>INNOVATE.</span><br />EXPAND.</h1>
            <p>We bring people, ideas, and opportunities together to support entrepreneurship, business development, and lasting connections.</p>
            <div className="actions">
              <Link className="button" href="/events">Discover Diamond Black</Link>
              <Link className="button button-secondary" href="/contact">Connect With Us</Link>
            </div>
          </div>
        </section>

        <section className="section brand-intro" id="about">
          <div className="container brand-intro-grid">
            <div>
              <span className="eyebrow">Who We Are</span>
              <h2>Ambition deserves a place to connect.</h2>
              <p className="lead">Diamond Black Corporation promotes entrepreneurship, innovation, talent, and business development through strategic networking, digital marketing, audiovisual production, and corporate events.</p>
            </div>
            <div className="seal-wrap">
              <img src="/images/diamond-black-seal.jpg" alt="Diamond Black emblem" />
            </div>
          </div>
        </section>

        <section className="section" id="services">
          <div className="container">
            <div className="section-heading"><span className="eyebrow">What We Do</span><h2>Built around opportunity.</h2><p className="lead">Services designed to help people and businesses make stronger connections and move ideas forward.</p></div>
            <div className="grid">
              {services.map((service) => <article className="card" key={service.number}><span className="card-number">{service.number}</span><h3>{service.title}</h3><p>{service.text}</p></article>)}
            </div>
          </div>
        </section>

        <section className="section event-showcase" id="events">
          <div className="container">
            <div className="section-heading"><span className="eyebrow">Featured Event</span><h2>100 People. One Night.</h2><p className="lead">New connections. New business.</p></div>
            <div className="event-art">
              <img src="/images/100-people-one-night.jpg" alt="100 People One Night — Diamond Black event artwork" />
            </div>
            <div className="event-details">
              <div><span className="eyebrow">Saturday · 14 November 2026</span><h3>19H – 03H · Manila, Philippines</h3></div>
              <p>Event details and registration information will be published here when the official registration destination is confirmed.</p>
            </div>
          </div>
        </section>

        <section className="section venue-section">
          <div className="container venue-grid">
            <div className="venue-image"><img src="/images/diamond-black-venue.jpg" alt="Diamond Black corporate networking event venue" /></div>
            <div><span className="eyebrow">The Diamond Black Experience</span><h2>People. Partnerships. Possibilities.</h2><p className="lead">A premium environment designed for meaningful conversations, business connections, collaboration, and celebration.</p><img className="secondary-logo" src="/images/diamond-black-primary.jpg" alt="Diamond Black" /></div>
          </div>
        </section>

        <section className="section" id="news">
          <div className="container">
            <div className="section-heading"><span className="eyebrow">Latest News</span><h2>News, stories, and perspectives.</h2><p className="lead">The latest updates from Diamond Black Corporation.</p></div>
            <div className="grid">
              {newsPreview.map((item) => <article className="card" key={item.title}><span className="card-number">{item.label}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}
            </div>
          </div>
        </section>

        <section className="section newsletter" id="newsletter">
          <div className="container newsletter-inner">
            <div><span className="eyebrow">Stay Informed</span><h2>Make room for new opportunities.</h2><p className="lead" id="newsletter-note">Get company news, insights, and upcoming opportunities delivered to your inbox.</p></div>
            <NewsletterForm />
          </div>
        </section>

        <section className="section" id="contact">
          <div className="container">
            <div className="section-heading"><span className="eyebrow">Contact</span><h2>Let’s build something meaningful.</h2><p className="lead">Have a business idea, partnership opportunity, or event in mind? Contact details and a secure message form will be added after the contact service is implemented.</p></div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand"><img src="/images/diamond-black-horizontal.jpg" alt="Diamond Black Corporation" /></div>
          <div className="footer-contact">
            <p><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 22s7-6.1 7-13a7 7 0 1 0-14 0c0 6.9 7 13 7 13Z"/><circle cx="12" cy="9" r="2.3"/></svg><span>29F High Street South Corporate Plaza Tower 2, Taguig City, Philippines, 1700</span></p>
            <p><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6.6 3.5 9.4 7l-1.8 2.1a15 15 0 0 0 7.3 7.3L17 14.6l3.5 2.8-.6 3.1c-.2.8-1 1.3-1.8 1.2C9.7 20.3 3.7 14.3 2.3 5.9c-.1-.8.4-1.6 1.2-1.8l3.1-.6Z"/></svg><a href="tel:+6369692116424">+63 6969 211 6424</a></p>
            <p><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg><a href="mailto:sales.diamondblack2026@gmail.com">sales.diamondblack2026@gmail.com</a></p>
          </div>
          <div className="footer-socials"><a className="social-link" href="https://www.facebook.com/profile.php?id=61594570287188" target="_blank" rel="noreferrer" aria-label="Diamond Black Corporation on Facebook"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14 8h3V4h-3c-3.3 0-5 1.8-5 5v3H6v4h3v4h4v-4h3.2l.8-4H13V9c0-.7.3-1 1-1Z"/></svg><span>Facebook</span></a><a className="social-link" href="https://www.youtube.com/" target="_blank" rel="noreferrer" aria-label="Diamond Black Corporation on YouTube"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2C2 9 2 12 2 12s0 3 .4 4.8a2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2C22 15 22 12 22 12s0-3-.4-4.8ZM10 15.3V8.7l6 3.3-6 3.3Z"/></svg><span>YouTube</span></a></div>
          <div className="footer-tagline">BUILD • INNOVATE • EXPAND</div>
          <div>© {new Date().getFullYear()} Diamond Black Corporation</div>
        </div>
      </footer>
    </>
  );
}
