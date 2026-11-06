import Link from "next/link";
import {getPrismaClient} from "@/lib/prisma";
import ConfirmDelete from "../confirm-delete";
import {archiveEvent,deleteEvent} from "../admin-delete-actions";
export default async function Events(){
 const [items,count]=await Promise.all([getPrismaClient().managedEvent.findMany({orderBy:{startsAt:"desc"}}),getPrismaClient().eventRegistration.count()]);
 return <><div className="admin-toolbar"><div><span className="eyebrow">Programming</span><h1>Events</h1><p className="admin-muted">{count} existing registrations remain preserved.</p></div><Link className="admin-button" href="/admin/events/new">Create event</Link></div>
 <table className="admin-table"><thead><tr><th>Event</th><th>Date</th><th>Status</th><th>Registration</th><th>Actions</th></tr></thead><tbody>{items.map(event=><tr key={event.id}><td><Link className="admin-link" href={"/admin/events/"+event.id}>{event.title}</Link></td><td>{event.startsAt.toLocaleString()}</td><td>{event.status}</td><td>{event.registrationEnabled?"Open":"Closed"}</td><td><div className="admin-actions"><form action={archiveEvent}><input type="hidden" name="id" value={event.id}/><button className="admin-link">Archive</button></form><ConfirmDelete action={deleteEvent} prompt="Permanently delete this event? This is blocked if registrations exist."><input type="hidden" name="id" value={event.id}/><button className="admin-link">Delete</button></ConfirmDelete></div></td></tr>)}</tbody></table>
 {!items.length&&<p className="admin-empty">No managed events yet.</p>}</>;
}