import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { services } from "../service-data";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  return { title: service ? service.title : "Service", description: service?.short };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();
  const next = services[(services.findIndex((item) => item.slug === slug) + 1) % services.length];
  return (
    <>
      <header className="site-header"><div className="container header-inner"><Link className="brand" href="/"><img className="brand-logo" src="/images/diamond-black-horizontal.jpg" alt="Diamond Black Corporation" /></Link><nav className="nav" aria-label="Main navigation"><Link href="/about">About</Link><Link href="/services">Services</Link><Link href="/events">Events</Link><Link href="/news">News</Link><Link href="/newsletter">Newsletter</Link><Link href="/contact">Contact</Link></nav></div></header>
      <main>
        <section className="service-detail-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(8,8,8,.96), rgba(8,8,8,.48)), url("${service.image}")` }}>
          <div className="container"><Link className="service-back" href="/services">← All services</Link><span className="eyebrow">Our Services · {service.number}</span><h1>{service.title}</h1><p>{service.short}</p></div>
        </section>
        <section className="section"><div className="container service-detail-grid"><div><span className="eyebrow">How We Help</span><h2>Turning connections and ideas into progress.</h2><p className="lead">{service.description}</p></div><div className="service-outcomes"><span className="eyebrow">What This Can Deliver</span><ul>{service.outcomes.map((item) => <li key={item}>{item}</li>)}</ul><Link className="button" href="/contact">Discuss an Opportunity</Link></div></div></section>
        <section className="section service-next"><div className="container"><span className="eyebrow">Explore More</span><h2>Continue discovering what we do.</h2><Link className="next-service" href={`/services/${next.slug}`}><span>{next.number}</span><strong>{next.title}</strong><em>Next service →</em></Link></div></section>
      </main>
      <footer className="site-footer"><div className="container footer-inner"><div className="footer-brand"><img src="/images/diamond-black-horizontal.jpg" alt="Diamond Black Corporation" /></div><div className="footer-tagline">BUILD • INNOVATE • EXPAND</div><div>© {new Date().getFullYear()} Diamond Black Corporation</div></div></footer>
    </>
  );
}
