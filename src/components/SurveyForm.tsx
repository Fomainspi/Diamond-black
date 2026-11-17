"use client";
import { useMemo,useState,type FormEvent } from "react";
type Q={id:string;title:string;description?:string|null;type:string;required:boolean;minValue?:number|null;maxValue?:number|null;options?:Array<{id:string;label:string;value:string}>};
type S={id:string;title:string;description?:string|null;questions:Q[]};
export default function SurveyForm({slug,sections,thankYou,privacyNotice}:{slug:string;sections:S[];thankYou:string;privacyNotice?:string|null}){
 const questions=useMemo(()=>sections.flatMap(s=>s.questions),[sections]);
 const [answers,setAnswers]=useState<Record<string,string|string[]>>({});
 const [newsletterEmail,setNewsletterEmail]=useState("");const [newsletterConsent,setNewsletterConsent]=useState(false);
 const [website,setWebsite]=useState("");const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [done,setDone]=useState(false);
 const [step,setStep]=useState(0);const current=sections[step];const progress=Math.round(((step+1)/sections.length)*100);
 function set(id:string,value:string|string[]){setAnswers(old=>({...old,[id]:value}));}
 function validSection(){return (current?.questions??[]).every(q=>!q.required||(Array.isArray(answers[q.id])?((answers[q.id] as string[]).length>0):Boolean(answers[q.id])));}
 async function submit(event:FormEvent){event.preventDefault();setBusy(true);setError("");try{
  const response=await fetch("/api/survey/submit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({slug,answers,website,newsletterEmail,newsletterConsent})});
  const result=await response.json();if(!response.ok)throw new Error(result.message??"Submission failed.");
  if(result.newsletterRequested){try{await fetch("/api/newsletter",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:newsletterEmail,consent:true,companyWebsite:""})});}catch{/* Survey response remains saved if newsletter is unavailable. */}}
  setDone(true);
 }catch(e){setError(e instanceof Error?e.message:"We could not submit your response.");}finally{setBusy(false);}}
 if(done)return <section className="survey-thanks"><span className="eyebrow">Response received</span><h2>Thank you.</h2><p>{thankYou}</p><a className="survey-submit" href="/">Return to Diamond Black</a></section>;
 const newsletterQuestion=questions.find(q=>/receive updates|newsletter/i.test(q.title));
 return <form className="survey-form" onSubmit={submit}>
  <div className="survey-progress"><div><span>Section {step+1} of {sections.length}</span><span>{progress}%</span></div><span className="survey-progress-track"><span style={{width:progress+"%"}}/></span></div>
  <section className="survey-section"><h2>{current?.title}</h2>{current?.description&&<p>{current.description}</p>}
  {current?.questions.map(q=><fieldset className="survey-question" key={q.id}><legend>{q.title}{q.required&&<span aria-label="required"> *</span>}</legend>{q.description&&<p>{q.description}</p>}
   {["SHORT_TEXT","EMAIL","NUMBER","DATE"].includes(q.type)&&<input type={q.type==="SHORT_TEXT"?"text":q.type.toLowerCase()} required={q.required} maxLength={4000} value={String(answers[q.id]??"")} onChange={e=>set(q.id,e.target.value)}/>}
   {q.type==="LONG_TEXT"&&<textarea rows={4} required={q.required} maxLength={4000} value={String(answers[q.id]??"")} onChange={e=>set(q.id,e.target.value)}/>}
   {["SINGLE_CHOICE","DROPDOWN","YES_NO"].includes(q.type)&&(q.type==="DROPDOWN"?<select required={q.required} value={String(answers[q.id]??"")} onChange={e=>set(q.id,e.target.value)}><option value="">Choose an answer</option>{q.options?.map(o=><option key={o.id} value={o.value}>{o.label}</option>)}</select>:<div className="survey-options">{(q.type==="YES_NO"?["Yes","No"].map(v=>({id:v,label:v,value:v})):q.options??[]).map(o=><label key={o.id}><input type="radio" name={q.id} value={o.value} checked={answers[q.id]===o.value} onChange={()=>set(q.id,o.value)}/><span>{o.label}</span></label>)}</div>)}
   {q.type==="MULTIPLE_CHOICE"&&<div className="survey-options">{q.options?.map(o=>{const selected=Array.isArray(answers[q.id])?answers[q.id] as string[]:[];return <label key={o.id}><input type="checkbox" checked={selected.includes(o.value)} onChange={e=>set(q.id,e.target.checked?[...selected,o.value]:selected.filter(v=>v!==o.value))}/><span>{o.label}</span></label>})}</div>}
   {["RATING","STAR_RATING","LINEAR_SCALE"].includes(q.type)&&<div className="survey-rating">{Array.from({length:Math.max(2,Math.min(10,(q.maxValue??5)-(q.minValue??1)+1))},(_,i)=>(q.minValue??1)+i).map(n=><label key={n}><input type="radio" name={q.id} checked={answers[q.id]===String(n)} onChange={()=>set(q.id,String(n))}/><span>{q.type==="STAR_RATING"?"★".repeat(n):n}</span></label>)}</div>}
  </fieldset>)}
  </section>
  {newsletterQuestion&&String(answers[newsletterQuestion.id]??"")==="Yes"&&<section className="survey-newsletter"><h3>Stay connected with Diamond Black</h3><p>If you haven’t subscribed yet, would you like to receive event news, opportunities, and updates?</p><label>Email address<input type="email" autoComplete="email" value={newsletterEmail} onChange={e=>setNewsletterEmail(e.target.value)} placeholder="you@example.com"/></label><label className="survey-consent"><input type="checkbox" checked={newsletterConsent} onChange={e=>setNewsletterConsent(e.target.checked)}/><span>I agree to receive email updates from Diamond Black Corporation. I can unsubscribe at any time.</span></label><small>Your survey can be submitted without subscribing.</small></section>}
  {privacyNotice&&<p className="survey-privacy">{privacyNotice}</p>}
  <div className="survey-honeypot" aria-hidden="true"><label>Website<input value={website} onChange={e=>setWebsite(e.target.value)} tabIndex={-1} autoComplete="off"/></label></div>
  {error&&<p className="survey-error" role="alert">{error}</p>}
  <div className="survey-actions">{step>0&&<button type="button" className="survey-back" onClick={()=>setStep(step-1)}>Back</button>}{step<sections.length-1?<button type="button" className="survey-submit" disabled={!validSection()} onClick={()=>setStep(step+1)}>Continue</button>:<button className="survey-submit" type="submit" disabled={busy||!validSection()}>{busy?"Submitting…":"Submit feedback"}</button>}</div>
 </form>;
}
