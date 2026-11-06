import Link from "next/link";
import {getPrismaClient} from "@/lib/prisma";
import ConfirmDelete from "../confirm-delete";
import {deleteContent} from "../admin-delete-actions";
export default async function Content(){
 const rows=await getPrismaClient().contentEntry.findMany({orderBy:{updatedAt:"desc"}});
 return <><div className="admin-toolbar"><div><span className="eyebrow">Publishing</span><h1>Content</h1><p className="admin-muted">Manage articles, news and reusable page content.</p></div><Link className="admin-button" href="/admin/content/new">Create content</Link></div>
 <table className="admin-table"><thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><Link className="admin-link" href={"/admin/content/"+r.id}>{r.title}</Link><br/><small>{r.slug}</small></td><td>{r.type}</td><td>{r.status}</td><td>{r.updatedAt.toLocaleDateString()}</td><td><ConfirmDelete action={deleteContent}><input type="hidden" name="id" value={r.id}/><button className="admin-link" type="submit">Delete</button></ConfirmDelete></td></tr>)}</tbody></table>
 {!rows.length&&<p className="admin-empty">No content yet. Create your first article or page.</p>}</>;
}