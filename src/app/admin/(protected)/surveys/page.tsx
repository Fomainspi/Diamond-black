import Link from "next/link";
import { getPrismaClient } from "@/lib/prisma";
import { createSurvey } from "./actions";

export default async function SurveysPage(){
 const db=getPrismaClient();
 const [total,active,drafts,responses,recent,surveys]=await Promise.all([
  db.survey.count(),db.survey.count({where:{status:"PUBLISHED"}}),db.survey.count({where:{status:"DRAFT"}}),
  db.surveyResponse.count(),db.surveyResponse.count({where:{createdAt:{gte:new Date(Date.now()-7*86400000)}}}),
  db.survey.findMany({orderBy:{updatedAt:"desc"},take:20,include:{_count:{select:{responses:true}}}})
 ]);
 return <><div className="admin-toolbar"><div><span className="eyebrow">Feedback intelligence</span><h1>Surveys &amp; Feedback</h1><p className="admin-muted">Create event surveys and understand guest experiences.</p></div></div>
 <div className="admin-grid">{[["Total surveys",total],["Published",active],["Drafts",drafts],["Responses",responses],["Last 7 days",recent]].map(([label,value])=><section className="admin-stat" key={label}><span className="admin-muted">{label}</span><strong>{value}</strong></section>)}</div>
 <section className="admin-panel"><h2>Create a survey</h2><form action={createSurvey} className="admin-form-grid">
 <label>Survey title<input name="title" required maxLength={160} placeholder="100 People One Night – Guest Experience & Feedback Survey"/></label>
 <label>Public URL slug<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="100-people-one-night"/></label>
 <label>Event name<input name="eventName" required placeholder="100 People One Night"/></label>
 <label>Subtitle<input name="subtitle" placeholder="Tell us about your experience"/></label>
 <label className="admin-wide">Introduction<textarea name="description" rows={4} required defaultValue="Thank you for being part of 100 People One Night! Your feedback matters. Please take a few minutes to share your experience and help us improve future events."/></label>
 <div><button className="admin-button" type="submit">Create survey draft</button></div></form></section>
 <section className="admin-panel"><h2>Manage surveys</h2>{surveys.length===0?<p className="admin-muted">No surveys yet. Create your first survey above.</p>:<table className="admin-table"><thead><tr><th>Survey</th><th>Event</th><th>Status</th><th>Responses</th><th></th></tr></thead><tbody>{surveys.map(s=><tr key={s.id}><td>{s.title}<small className="admin-muted">/survey/{s.slug}</small></td><td>{s.eventName}</td><td>{s.status}</td><td>{s._count.responses}</td><td><Link className="admin-link" href={`/admin/surveys/${s.id}`}>Manage →</Link></td></tr>)}</tbody></table>}</section></>;
}
