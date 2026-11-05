import { getPrismaClient } from "@/lib/prisma";
import { setRegistrationStatus } from "@/lib/admin-actions";

export default async function Registrations({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const where = q ? {
    OR: [
      { fullName: { contains: q, mode: "insensitive" as const } },
      { email: { contains: q, mode: "insensitive" as const } },
      { company: { contains: q, mode: "insensitive" as const } },
    ],
  } : {};
  const rows = await getPrismaClient().eventRegistration.findMany({
    where, take: 250, orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div className="admin-toolbar">
        <div><span className="eyebrow">Attendee management</span><h1>Registrations</h1><p className="admin-muted">Latest 250 matching attendee records.</p></div>
        <a className="admin-button" href="/api/admin/registrations/export">Export CSV</a>
      </div>
      <form className="admin-actions" method="get"><input name="q" defaultValue={q} placeholder="Search name, email or company" /><button className="admin-button">Search</button></form>
      <table className="admin-table">
        <thead><tr><th>Attendee</th><th>Contact</th><th>Guests</th><th>Registered</th><th>Email delivery</th><th>Status</th></tr></thead>
        <tbody>{rows.map((row) => (
          <tr key={row.id}>
            <td>{row.fullName}<br /><small>{row.company ?? ""}</small></td>
            <td>{row.email}<br />{row.phone}</td><td>{row.guests}</td><td>{row.createdAt.toLocaleString()}</td>
            <td>Attendee: {row.confirmationEmail}<br />Admin: {row.notificationEmail}</td>
            <td><form action={setRegistrationStatus}><input type="hidden" name="id" value={row.id} /><select name="status" defaultValue={row.status}><option>CONFIRMED</option><option>CANCELLED</option></select><button className="admin-link">Update</button></form></td>
          </tr>
        ))}</tbody>
      </table>
      {!rows.length && <p className="admin-empty">No matching registrations.</p>}
    </>
  );
}
