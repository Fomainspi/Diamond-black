import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrismaClient } from "@/lib/prisma";
import { addQuestion, closeSurvey, publishSurvey, updateQuestion, duplicateSurvey, archiveSurvey, deleteQuestion } from "../actions";

export default async function SurveyEditor({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const survey=await getPrismaClient().survey.findUnique({where:{id},include:{sections:{orderBy:{sortOrder:"asc"},include:{questions:{orderBy:{sortOrder:"asc"},include:{options:{orderBy:{sortOrder:"asc"}}}}}},_count:{select:{responses:true}}}});
 if(!survey) notFound();const section=survey.sections[0];
 return <><div className="admin-toolbar"><div><span className="eyebrow">Survey builder</span><h1>{survey.title}</h1><p className="admin-muted">/{survey.slug} · {survey.status} · {survey._count.responses} responses</p></div><Link href="/admin/surveys" className="admin-link">← All surveys</Link></div>
 <section className="admin-panel"><h2>Questions</h2><p className="admin-muted">Questions and answer choices are stored in the database. Publishing creates an immutable version snapshot, preserving the meaning of existing responses.</p>
 {survey.sections.map(sec=><div key={sec.id}><h3>{sec.title}</h3>{sec.questions.map(q=><div className="admin-question-wrap" key={q.id}><form action={updateQuestion} className="admin-question">
 <input type="hidden" name="surveyId" value={survey.id}/><input type="hidden" name="questionId" value={q.id}/>
 <label>Question<input name="title" defaultValue={q.title} required maxLength={500}/></label>
 <label className="admin-check"><input type="checkbox" name="required" defaultChecked={q.required}/> Required</label>
 <label>Answer options (one per line)<textarea name="options" rows={3} defaultValue={q.options.map(o=>o.label).join("\n")}/></label>
 <p className="admin-muted">Type: {q.type}</p><button className="admin-button" type="submit">Save question</button></form><form action={deleteQuestion}><input type="hidden" name="surveyId" value={survey.id}/><input type="hidden" name="questionId" value={q.id}/><button className="admin-danger" type="submit">Delete question</button>
 </form></div>)}</div>)}
 {section&&<form action={addQuestion} className="admin-form-grid"><input type="hidden" name="surveyId" value={survey.id}/><input type="hidden" name="sectionId" value={section.id}/><h3 className="admin-wide">Add a question</h3>
 <label className="admin-wide">Question text<input name="title" required maxLength={500}/></label>
 <label>Question type<select name="type" defaultValue="SHORT_TEXT">{["SHORT_TEXT","LONG_TEXT","SINGLE_CHOICE","MULTIPLE_CHOICE","DROPDOWN","RATING","STAR_RATING","LINEAR_SCALE","YES_NO","EMAIL","NUMBER","DATE"].map(t=><option key={t}>{t}</option>)}</select></label>
 <label>Answer options (one per line)<textarea name="options" rows={3} placeholder={"Option one\nOption two"}/></label>
 <label className="admin-check"><input type="checkbox" name="required"/> Required</label><div><button className="admin-button" type="submit">Add question</button></div></form>}
 </section>
 <section className="admin-panel"><h2>Survey actions</h2><form action={duplicateSurvey} className="admin-inline-form"><input type="hidden" name="surveyId" value={survey.id}/><button className="admin-button admin-button-secondary" type="submit">Duplicate survey</button></form><form action={archiveSurvey} className="admin-inline-form"><input type="hidden" name="surveyId" value={survey.id}/><button className="admin-danger" type="submit">Archive survey</button></form></section><section className="admin-panel"><h2>Publication</h2><p className="admin-muted">Every publication captures the current question set as a version. Previously submitted responses remain attached to their original version.</p><p><Link className="admin-link" href={`/survey/${survey.slug}`} target="_blank">Open public survey ↗</Link></p>
 <form action={publishSurvey}><input type="hidden" name="surveyId" value={survey.id}/><button className="admin-button" type="submit">Publish new version</button></form>
 {survey.status==="PUBLISHED"&&<form action={closeSurvey} className="admin-inline-form"><input type="hidden" name="surveyId" value={survey.id}/><button className="admin-button admin-button-secondary" type="submit">Close survey</button></form>}
 </section>
 <section className="admin-panel"><h2>Responses</h2><p>{survey._count.responses} submissions recorded.</p><Link className="admin-link" href={`/admin/surveys/${survey.id}/responses`}>View responses →</Link></section></>;
}
