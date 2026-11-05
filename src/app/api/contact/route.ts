import {NextResponse} from "next/server";import {z} from "zod";import {getPrismaClient} from "@/lib/prisma";export const runtime="nodejs";
const formSchema=z.object({name:z.string().trim().min(2).max(120),email:z.string().email().max(254),phone:z.string().max(40).optional(),subject:z.string().max(160).optional(),message:z.string().trim().min(10).max(10000),companyWebsite:z.string().max(200).optional()});
const attempts=new Map<string,{count:number;until:number}>();
export async function POST(req:Request){
 const origin=req.headers.get("origin"),host=req.headers.get("x-forwarded-host")?.split(",")[0].trim()||req.headers.get("host");
 try{if(!origin||!host||new URL(origin).host!==host)return NextResponse.json({message:"Request could not be verified."},{status:403});}catch{return NextResponse.json({message:"Request could not be verified."},{status:403});}
 if(Number(req.headers.get("content-length")??0)>15000)return NextResponse.json({message:"Request too large."},{status:413});
 const ip=req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim()||"unknown";const now=Date.now(),entry=attempts.get(ip);if(entry&&entry.until>now&&entry.count>=5)return NextResponse.json({message:"Too many messages. Try again later."},{status:429});if(!entry||entry.until<=now)attempts.set(ip,{count:1,until:now+900000});else entry.count++;
 const parsed=formSchema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({message:"Please check the fields and try again."},{status:400});
 if(parsed.data.companyWebsite)return NextResponse.json({message:"Thank you. Your message has been received."});
 const {companyWebsite,...data}=parsed.data;void companyWebsite;await getPrismaClient().contactMessage.create({data});return NextResponse.json({message:"Thank you. Your message has been received."});
}