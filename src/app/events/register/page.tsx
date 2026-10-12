"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const fields = [
  ["fullName", "Full name", "text"],
  ["email", "Email address", "email"],
  ["phone", "Phone number", "tel"],
  ["company", "Company / Organization", "text"],
];

export default function RegisterPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const guests = form.get("guests");
    const consent = form.get("consent") === "on";

    try {
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.get("fullName"),
          email: form.get("email"),
          phone: form.get("phone"),
          company: form.get("company"),
          guests,
          consent,
          companyWebsite: form.get("companyWebsite"),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "We couldn't complete your registration.");
      }

      setStatus("success");
      setMessage(data.message);
      event.currentTarget.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "We couldn't complete your registration.");
    }
  }

  return (
    <>
      <header className="site-header"><div className="container header-inner"><Link className="brand" href="/"><img className="brand-logo" src="/images/diamond-black-horizontal.jpg" alt="Diamond Black Corporation"/></Link><nav className="nav"><Link href="/about">About</Link><Link href="/services">Services</Link><Link href="/events">Events</Link><Link href="/news">News</Link><Link href="/newsletter">Newsletter</Link><Link href="/contact">Contact</Link></nav></div></header>
      <main>
        <section className="page-hero"><div className="container"><span className="eyebrow">100 People · One Night</span><h1>Register</h1></div></section>
        <section className="section"><div className="container registration-layout">
          <div><span className="eyebrow">Saturday · 14 November 2026</span><h2>Reserve your place.</h2><p className="lead">19H – 03H · Manila, Philippines</p><p>Complete the registration form to express your interest in attending. We will send a confirmation email after your registration is received.</p></div>
          <form className="registration-form" onSubmit={handleSubmit}>
            {fields.map(([id,label,type]) => <label key={id} htmlFor={id}>{label}<input id={id} name={id} type={type} required={id !== "company"} /></label>)}
            <label htmlFor="guests">Number of attendees<select id="guests" name="guests" defaultValue="1"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></label>
            <label className="checkbox-label"><input id="consent" name="consent" type="checkbox" required /> I agree to be contacted about this event.</label>
            <label aria-hidden="true" style={{position:"absolute",left:"-9999px"}}>Website<input name="companyWebsite" tabIndex={-1} autoComplete="off" /></label>
            <button className="button" type="submit" disabled={status === "sending"}>{status === "sending" ? "Submitting..." : "Register for the Event"}</button>
            {message && <p role="status" aria-live="polite">{message}</p>}
          </form>
        </div></section>
      </main>
      <footer className="site-footer"><div className="container footer-inner"><div className="footer-brand"><img src="/images/diamond-black-horizontal.jpg" alt="Diamond Black Corporation"/></div><div className="footer-tagline">BUILD • INNOVATE • EXPAND</div><div>© {new Date().getFullYear()} Diamond Black Corporation</div></div></footer>
    </>
  );
}
