import {getPrismaClient} from "@/lib/prisma";
import {setContactStatus} from "@/lib/admin-actions";
import ConfirmDelete from "../confirm-delete";
import {deleteContact} from "../admin-delete-actions";
export default async function Contacts(){
 const rows=await getPrismaClient().contactMessage.findMany({orderBy:{createdAt:"desc"},take:300});
 return <><span className="eyebrow">Communications</span><h1>Contact inbox</h1><p className="admin-muted">Website enquiries awaiting administrator follow-up.</p>
 {rows.map(row=><section className="admin-panel" key={row.id} style={{marginTop:16}}><div className="admin-toolbar"><strong>{row.subject||"Website enquiry"}</strong><span className="admin-pill">{row.status}</span></div><p>{row.name} · {row.email} {row.phone?"· "+row.phone:""}</p><p style={{whiteSpace:"pre-wrap"}}>{row.message}</p><small>{row.createdAt.toLocaleString()}</small>
 <div className="admin-actions"><form action={setContactStatus} className="admin-actions"><input type="hidden" name="id" value={row.id}/><select name="status" defaultValue={row.status}><option>NEW</option><option>READ</option><option>REPLIED</option><option>ARCHIVED</option></select><button className="admin-button">Update status</button></form><ConfirmDelete action={deleteContact} prompt="Permanently delete this contact message?"><input type="hidden" name="id" value={row.id}/><button className="admin-link">Delete</button></ConfirmDelete></div></section>)}
 {!rows.length&&<p className="admin-empty">No contact messages received yet.</p>}</>;
}