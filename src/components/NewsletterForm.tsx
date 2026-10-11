"use client";

import { useState, type FormEvent } from "react";

type ApiResponse = { message?: string };

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setHasError(false);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          consent,
          companyWebsite: (event.currentTarget.elements.namedItem("companyWebsite") as HTMLInputElement)?.value ?? "",
        }),
      });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok) {
        setHasError(true);
        setMessage(result.message ?? "We couldn’t process your request. Please try again.");
        return;
      }

      setMessage(result.message ?? "Please check your inbox for the next step.");
      setEmail("");
      setConsent(false);
    } catch {
      setHasError(true);
      setMessage("We couldn’t connect just now. Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <label htmlFor="newsletter-email" className="sr-only">Email address</label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        placeholder="Your email address"
        autoComplete="email"
        maxLength={254}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        aria-describedby="newsletter-consent newsletter-feedback"
      />
      <label className="newsletter-consent" id="newsletter-consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          required
        />
        <span>I agree to receive email updates from Diamond Black Corporation. I can unsubscribe at any time.</span>
      </label>
      <div className="newsletter-honeypot" aria-hidden="true">
        <label htmlFor="newsletter-company-website">Leave this field empty</label>
        <input id="newsletter-company-website" name="companyWebsite" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <button className="button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Subscribe"}
      </button>
      <p
        className={`newsletter-feedback${hasError ? " newsletter-feedback-error" : ""}`}
        id="newsletter-feedback"
        role="status"
        aria-live="polite"
      >
        {message}
      </p>
    </form>
  );
}
