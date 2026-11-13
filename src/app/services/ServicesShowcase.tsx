"use client";

import Link from "next/link";
import { useRef } from "react";
import { services } from "./service-data";

export default function ServicesShowcase() {
  const track = useRef<HTMLDivElement>(null);
  function move(direction: -1 | 1) {
    if (!track.current) return;
    track.current.scrollBy({ left: direction * track.current.clientWidth * 0.82, behavior: "smooth" });
  }
  return (
    <div className="services-showcase">
      <div className="services-carousel-controls">
        <p className="lead">Explore the ways we help people and businesses move forward.</p>
        <div className="carousel-arrows">
          <button type="button" onClick={() => move(-1)} aria-label="Previous services">←</button>
          <button type="button" onClick={() => move(1)} aria-label="Next services">→</button>
        </div>
      </div>
      <div className="services-track" ref={track} aria-label="Diamond Black services">
        {services.map((service) => (
          <Link className="service-slide" href={`/services/${service.slug}`} key={service.slug}>
            <div className="service-slide-image" style={{ backgroundImage: `linear-gradient(180deg, rgba(8,8,8,.05), rgba(8,8,8,.92)), url("${service.image}")` }}>
              <span className="card-number">{service.number}</span>
              <span className="service-slide-copy"><strong>{service.title}</strong><span>{service.short}</span><em>Explore service ↗</em></span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
