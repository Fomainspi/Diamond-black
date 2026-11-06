import Link from "next/link";
import { getMailchimpAudience, getMailchimpMembers } from "@/lib/mailchimp";

type Props = { searchParams: Promise<{ page?: string; status?: string; q?: string }> };
const date = (value?: string) => value ? new Date(value).toLocaleDateString() : "—";

export default async function NewsletterAdmin({ searchParams }: Props) {
  const params = await searchParams;
  let audience;
  let listing;
  let error = "";
  try {
    [audience, listing] = await Promise.all([
      getMailchimpAudience(),
      getMailchimpMembers({ page: Number(params.page) || 1, status: params.status, search: params.q }),
    ]);
  } catch (cause) {
    error = cause instanceof Error ? cause.message : "Unable to connect to Mailchimp.";
  }

  const status = params.status ?? "";
  const q = params.q ?? "";
  return <>
    <div className="admin-toolbar"><div><span className="eyebrow">Communications</span><h1>Newsletter</h1><p className="admin-muted">Manage the audience connected to your existing Mailchimp account.</p></div><Link className="admin-link" href="/admin">Back to overview</Link></div>
    {error ? <section className="admin-panel" style={{ marginTop: 20 }}><h2>Mailchimp connection unavailable</h2><p>{error}</p><p className="admin-muted">Configure the Mailchimp environment variables on the server. Credentials are never displayed here.</p></section> : <>
      <div className="admin-grid">
        <section className="admin-stat"><span className="admin-muted">Audience</span><strong style={{ fontSize: "1.3rem" }}>{audience?.name}</strong></section>
        <section className="admin-stat"><span className="admin-muted">Subscribed contacts</span><strong>{audience?.stats?.member_count ?? 0}</strong></section>
        <section className="admin-stat"><span className="admin-muted">Unsubscribed</span><strong>{audience?.stats?.unsubscribe_count ?? 0}</strong></section>
        <section className="admin-stat"><span className="admin-muted">Cleaned addresses</span><strong>{audience?.stats?.cleaned_count ?? 0}</strong></section>
      </div>
      <section className="admin-panel">
        <div className="admin-toolbar"><div><h2>Audience contacts</h2><p className="admin-muted">{listing?.total ?? 0} matching contacts · page {listing?.page ?? 1} of {listing?.pageCount ?? 1}</p></div><span className="admin-pill">Live Mailchimp data</span></div>
        <form method="get" className="admin-actions" style={{ margin: "18px 0" }}>
          <input name="q" defaultValue={q} placeholder="Search name or email" aria-label="Search name or email" />
          <select name="status" defaultValue={status} aria-label="Filter by status"><option value="">All statuses</option><option value="subscribed">Subscribed</option><option value="pending">Pending confirmation</option><option value="unsubscribed">Unsubscribed</option><option value="cleaned">Cleaned</option></select>
          <button className="admin-button">Apply filters</button>
          {(q || status) && <Link className="admin-link" href="/admin/newsletter">Clear</Link>}
        </form>
        <div style={{ overflowX: "auto" }}><table className="admin-table"><thead><tr><th>Name</th><th>Email address</th><th>Status</th><th>Last changed</th></tr></thead><tbody>
          {listing?.members.map((member) => <tr key={member.id}><td>{member.full_name || "—"}</td><td>{member.email_address}</td><td><span className="admin-pill">{member.status}</span></td><td>{date(member.last_changed)}</td></tr>)}
          {!listing?.members.length && <tr><td colSpan={4}>No contacts found for these filters.</td></tr>}
        </tbody></table></div>
        <div className="admin-actions" style={{ marginTop: 18 }}>
          {listing && listing.page > 1 ? <Link className="admin-link" href={`/admin/newsletter?page=${listing.page - 1}&status=${encodeURIComponent(status)}&q=${encodeURIComponent(q)}`}>← Previous</Link> : <span />}
          {listing && listing.page < listing.pageCount ? <Link className="admin-link" href={`/admin/newsletter?page=${listing.page + 1}&status=${encodeURIComponent(status)}&q=${encodeURIComponent(q)}`}>Next →</Link> : <span />}
        </div>
      </section>
    </>}
  </>;
}
