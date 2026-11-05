import Link from "next/link";
import {requireAdmin} from "@/lib/auth";
import {logoutAdmin} from "@/app/admin/actions";
import "../../globals.css";
import "../admin.css";
export const metadata={title:"Administration | Diamond Black Corporation"};
export default async function ProtectedLayout({children}:{children:React.ReactNode}){
 const admin=await requireAdmin();
 return <div className="admin-shell"><aside className="admin-sidebar">
 <Link href="/admin" className="admin-brand">DIAMOND <span>BLACK</span><small>CONTROL ROOM</small></Link>
 <nav><Link href="/admin">Overview</Link><Link href="/admin/content">Content</Link><Link href="/admin/events">Events</Link><Link href="/admin/registrations">Registrations</Link><Link href="/admin/contacts">Contact inbox</Link><Link href="/admin/media">Media library</Link><Link href="/admin/settings">Site settings</Link><Link href="/admin/audit">Audit log</Link></nav>
 <div className="admin-profile"><strong>{admin.name}</strong><span>{admin.email}</span><form action={logoutAdmin}><button>Sign out</button></form></div>
 </aside><main className="admin-main">{children}</main></div>;
}