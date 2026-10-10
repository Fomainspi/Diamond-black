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
          <a className="brand" href="#home" aria-label="Diamond Black Corporation home">
            <span className="brand-mark"><span>◆</span></span>
            <span><span className="brand-name">DIAMOND BLACK</span><span className="brand-subtitle">CORPORATION</span></span>
          </a>
          <nav className="nav" aria-label="Main navigation">
            <a href="#about">About</a><a href="#services">Services</a><a href="#events">Events</a><a href="#news">News</a><a href="#newsletter">Newsletter</a><a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      <main id="home">
        <section className="hero">
          <div className="container hero-content">
            <span className="eyebrow">Connections • Innovation • Growth</span>
            <h1>BUILD.<br /><span>INNOVATE.</span><br />EXPAND.</h1>
            <p>We bring people, ideas, and opportunities together to support entrepreneurship, business development, and lasting connections.</p>
            <div className="actions">
              <a className="button" href="#services">Explore Our Services</a>
              <a className="button button-secondary" href="#contact">Connect With Us</a>
            </div>
          </div>
        </section>

        <section className="section" id="about">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">Who We Are</span>
              <h2>Ambition deserves a place to connect.</h2>
              <p className="lead">Diamond Black Corporation promotes entrepreneurship, innovation, talent, and business development through strategic networking, digital marketing, audiovisual production, and corporate events.</p>
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

        <section className="section" id="events">
          <div className="container featured-event">
            <div>
              <span className="eyebrow">Featured Event</span>
              <h2>Where new connections begin.</h2>
              <p className="lead">A gathering built around people, ideas, and new business opportunities.</p>
            </div>
            <article className="event-panel">
              <span className="eyebrow">Diamond Black Presents</span>
              <h3>100 People<br />One Night</h3>
              <p className="lead">New Connections. New Business.</p>
              <p className="event-meta">Saturday, 14 November 2026 · Manila, Philippines</p>
              <p>Event details and registration information will be published here when confirmed.</p>
            </article>
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
            <div><span className="eyebrow">Stay Informed</span><h2>Make room for new opportunities.</h2><p className="lead">Newsletter subscriptions will be enabled when the secure subscription service is implemented.</p></div>
            <form className="newsletter-form" action="#newsletter">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input id="newsletter-email" type="email" placeholder="Your email address" disabled aria-describedby="newsletter-note" />
              <button className="button" type="button" disabled>Coming Soon</button>
            </form>
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
          <div><strong>DIAMOND BLACK CORPORATION</strong><div>Building connections. Creating opportunities.</div></div>
          <div className="footer-tagline">BUILD • INNOVATE • EXPAND</div>
          <div>© {new Date().getFullYear()} Diamond Black Corporation</div>
        </div>
      </footer>
    </>
  );
}