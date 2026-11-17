import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
export const runtime="nodejs";
function cell(value:unknown){const text=Array.isArray(value)?value.join("; "):String(value??"");return '"'+text.replace(/"/g,'""')+'"';}
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const admin=await getCurrentAdmin();if(!admin)return NextResponse.json({message:"Unauthorized"},{status:401});
 const {id}=await params;const survey=await getPrismaClient().survey.findUnique({where:{id},include:{responses:{orderBy:{createdAt:"desc"},include:{answers:true,marketing:true,version:true}}}});
 if(!survey)return NextResponse.json({message:"Survey not found."},{status:404});
 const headers=["Response ID","Submitted at","Survey version","Newsletter opt-in","Newsletter email",...Array.from(new Set(survey.responses.flatMap(r=>r.answers.map(a=>a.questionText))))];
 const rows=survey.responses.map(r=>{const answerMap=new Map(r.answers.map(a=>[a.questionText,a.answer]));return [r.id,r.createdAt.toISOString(),r.version.version,r.marketingOptIn?"Yes":"No",r.marketing?.email??"",...headers.slice(5).map(h=>answerMap.get(h)??"")];});
 const csv="\uFEFF"+[headers,...rows].map(row=>row.map(cell).join(",")).join("\r\n");
 return new NextResponse(csv,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":`attachment; filename="${survey.slug}-responses.csv"`,"Cache-Control":"no-store"}});
}
