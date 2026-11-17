import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const attempts=new Map<string,{count:number;resetAt:number}>();
function limited(key:string){const now=Date.now();for(const [k,v] of attempts)if(v.resetAt<=now)attempts.delete(k);const entry=attempts.get(key);if(!entry||entry.resetAt<=now){attempts.set(key,{count:1,resetAt:now+15*60_000});return false;}entry.count++;return entry.count>4;}
function fail(message:string,status:number){return NextResponse.json({message},{status});}
export async function POST(request:Request){
 const origin=request.headers.get("origin"),host=request.headers.get("x-forwarded-host")?.split(",")[0].trim()||request.headers.get("host");
 if(!origin||!host){return fail("Request could not be verified.",403);}
 try{if(new URL(origin).host!==host)return fail("Request could not be verified.",403);}catch{return fail("Request could not be verified.",403);}
 const ip=request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim()||"unknown";
 if(limited(ip))return fail("Too many submissions. Please wait before trying again.",429);
 const length=Number(request.headers.get("content-length")??"0");if(length>24_000)return fail("Submission is too large.",413);
 let body:unknown;try{body=await request.json();}catch{return fail("Invalid submission.",400);}
 if(!body||typeof body!=="object")return fail("Invalid submission.",400);
 const data=body as {slug?:unknown;answers?:unknown;website?:unknown};
 if(typeof data.website==="string"&&data.website.trim())return NextResponse.json({message:"Thank you for your feedback."});
 if(typeof data.slug!=="string"||!data.answers||typeof data.answers!=="object"||Array.isArray(data.answers))return fail("Please complete the survey form.",400);
 const db=getPrismaClient();
 const survey=await db.survey.findFirst({where:{slug:data.slug,status:"PUBLISHED"},include:{versions:{orderBy:{version:"desc"},take:1}}});
 const version=survey?.versions[0];if(!survey||!version)return fail("This survey is not currently available.",404);
 const snapshot=version.snapshot as {sections?:Array<{questions?:Array<{id:string;title:string;type:string;required:boolean;options?:Array<{value:string}>;minValue?:number;maxValue?:number}>}>};
 const questions=(snapshot.sections??[]).flatMap(s=>s.questions??[]);
 const submitted=data.answers as Record<string,unknown>;
 const records=[];
 for(const q of questions){
  const value=submitted[q.id];
  const empty=value===undefined||value===null||value===""||(Array.isArray(value)&&value.length===0);
  if(q.required&&empty)return fail("Please answer all required questions.",400);
  if(empty)continue;
  if(q.type==="MULTIPLE_CHOICE"){
   if(!Array.isArray(value)||value.length>30||value.some(v=>typeof v!=="string"||!q.options?.some(o=>o.value===v)))return fail("One or more answers are invalid.",400);
  }else if(["SINGLE_CHOICE","DROPDOWN"].includes(q.type)){
   if(typeof value!=="string"||!q.options?.some(o=>o.value===value))return fail("One or more answers are invalid.",400);
  }else if(q.type==="YES_NO"){
   if(value!=="Yes"&&value!=="No")return fail("One or more answers are invalid.",400);
  }else if(["RATING","STAR_RATING","LINEAR_SCALE","NUMBER"].includes(q.type)){
   const n=Number(value);if(!Number.isFinite(n)||String(value).trim()===""||(q.minValue!==undefined&&q.minValue!==null&&n<q.minValue)||(q.maxValue!==undefined&&q.maxValue!==null&&n>q.maxValue))return fail("One or more numeric answers are invalid.",400);
  }else if(typeof value!=="string"||value.length>4000)return fail("One or more answers are invalid.",400);
  records.push({questionId:q.id,questionText:q.title,answer:value as never});
 }
 const newsletterQuestion=questions.find(q=>/receive updates|newsletter/i.test(q.title));
 const newsletterAnswer=newsletterQuestion?submitted[newsletterQuestion.id]:undefined;
 const wantsUpdates=newsletterAnswer==="Yes";
 const consent=data as typeof data & {newsletterEmail?:unknown;newsletterConsent?:unknown};
 if(wantsUpdates&&consent.newsletterConsent===true){
  if(typeof consent.newsletterEmail!=="string"||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(consent.newsletterEmail.trim())||consent.newsletterEmail.length>254)return fail("Please enter a valid email for newsletter updates.",400);
 }
 try{
  await db.surveyResponse.create({data:{surveyId:survey.id,versionId:version.id,marketingOptIn:wantsUpdates&&consent.newsletterConsent===true,answers:{create:records},...(wantsUpdates&&consent.newsletterConsent===true?{marketing:{create:{email:(consent.newsletterEmail as string).trim().toLowerCase()}}}:{})}});
  return NextResponse.json({message:survey.thankYou,newsletterRequested:wantsUpdates&&consent.newsletterConsent===true});
 }catch{return fail("We could not save your response. Please try again.",500);}
}
