import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrismaClient } from "@/lib/prisma";
export default async function SurveyResponses({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const db=getPrismaClient();
 const survey=await db.survey.findUnique({where:{id},include:{responses:{orderBy:{createdAt:"desc"},take:250,include:{answers:true,marketing:true,version:true}}}});
 if(!survey)notFound();
 const ratings=survey.responses.flatMap(r=>r.answers.filter(a=>typeof a.answer==="number"||(/^\d+(\.\d+)?$/.test(String(a.answer))&&/rate|rating/i.test(a.questionText))).map(a=>Number(a.answer))).filter(n=>Number.isFinite(n)&&n>=1&&n<=10);
 const average=ratings.length?ratings.reduce((a,b)=>a+b,0)/ratings.length:null;
 return <><div className="admin-toolbar"><div><span className="eyebrow">Survey responses</span><h1>{survey.title}</h1><p className="admin-muted">{survey.responses.length} most recent submissions</p></div><div><Link className="admin-link" href={`/api/admin/surveys/${id}/export`}>Export CSV ↓</Link>　<Link className="admin-link" href={`/admin/surveys/${id}`}>Back to builder</Link></div></div>
 <div className="admin-grid"><section className="admin-stat"><span className="admin-muted">Submissions loaded</span><strong>{survey.responses.length}</strong></section><section className="admin-stat"><span className="admin-muted">Average rating</span><strong>{average===null?"—":average.toFixed(2)}</strong></section><section className="admin-stat"><span className="admin-muted">Newsletter opt-ins</span><strong>{survey.responses.filter(r=>r.marketingOptIn).length}</strong></section></div>
 {survey.responses.length===0?<section className="admin-panel"><p className="admin-muted">No responses received yet.</p></section>:survey.responses.map((r,i)=><section className="admin-panel admin-response" key={r.id}><h2>Response {survey.responses.length-i}</h2><p className="admin-muted">{r.createdAt.toLocaleString()} · Survey version {r.version.version} · Newsletter opt-in: {r.marketingOptIn?"Yes":"No"}</p>{r.marketing&&<p className="admin-muted">Consent email: {r.marketing.email}</p>}<dl>{r.answers.map(a=><div key={a.id}><dt>{a.questionText}</dt><dd>{Array.isArray(a.answer)?a.answer.join(", "):String(a.answer)}</dd></div>)}</dl></section>)}
 </>;
}
