"use server";
import {revalidatePath} from "next/cache";import {redirect} from "next/navigation";import {z} from "zod";import {getPrismaClient} from "@/lib/prisma";import {requireAdmin,writeAudit} from "@/lib/auth";
const slug=z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export async function saveContent(fd:FormData){
 const admin=await requireAdmin();const p=z.object({id:z.string().optional(),type:z.enum(["ARTICLE","PAGE"]),title:z.string().trim().min(3).max(180),slug,excerpt:z.string().max(500).optional(),body:z.string().min(1).max(50000),coverImage:z.string().max(1000).optional(),status:z.enum(["DRAFT","PUBLISHED","ARCHIVED"])}).safeParse(Object.fromEntries(fd));
 if(!p.success)throw new Error("Please check the content fields.");const {id,...data}=p.data,publishedAt=data.status==="PUBLISHED"?new Date():null,db=getPrismaClient();
 const item=id?await db.contentEntry.update({where:{id},data:{...data,publishedAt}}):await db.contentEntry.create({data:{...data,publishedAt}});
 await writeAudit(admin.id,id?"content.update":"content.create","ContentEntry",item.id);revalidatePath("/admin/content");revalidatePath("/news");redirect("/admin/content");
}
const eventSchema=z.object({id:z.string().optional(),title:z.string().trim().min(3).max(180),slug,summary:z.string().max(500).optional(),description:z.string().min(1).max(50000),venue:z.string().max(200).optional(),location:z.string().max(200).optional(),startsAt:z.string().min(1),endsAt:z.string().optional(),imageUrl:z.string().max(1000).optional(),registrationEnabled:z.string().optional(),registrationUrl:z.string().max(1000).optional(),status:z.enum(["DRAFT","PUBLISHED","ARCHIVED"])});
export async function saveEvent(fd:FormData){
 const admin=await requireAdmin(),p=eventSchema.safeParse(Object.fromEntries(fd));if(!p.success)throw new Error("Please check the event details.");
 const {id,startsAt,endsAt,registrationEnabled,...data}=p.data;if(Number.isNaN(Date.parse(startsAt))||(endsAt&&Number.isNaN(Date.parse(endsAt))))throw new Error("Invalid event date.");
 const values={...data,startsAt:new Date(startsAt),endsAt:endsAt?new Date(endsAt):null,registrationEnabled:registrationEnabled==="on"},db=getPrismaClient();
 const item=id?await db.managedEvent.update({where:{id},data:values}):await db.managedEvent.create({data:values});
 await writeAudit(admin.id,id?"event.update":"event.create","ManagedEvent",item.id);revalidatePath("/admin/events");revalidatePath("/events");redirect("/admin/events");
}
export async function setRegistrationStatus(fd:FormData){const a=await requireAdmin(),id=String(fd.get("id")||""),status=String(fd.get("status")||"");if(!id||!["CONFIRMED","CANCELLED"].includes(status))throw new Error("Invalid status.");await getPrismaClient().eventRegistration.update({where:{id},data:{status:status as "CONFIRMED"|"CANCELLED"}});await writeAudit(a.id,"registration.status","EventRegistration",id,{status});revalidatePath("/admin/registrations");}
export async function setContactStatus(fd:FormData){const a=await requireAdmin(),id=String(fd.get("id")||""),status=String(fd.get("status")||"");if(!id||!["NEW","READ","REPLIED","ARCHIVED"].includes(status))throw new Error("Invalid status.");await getPrismaClient().contactMessage.update({where:{id},data:{status:status as "NEW"|"READ"|"REPLIED"|"ARCHIVED"}});await writeAudit(a.id,"contact.status","ContactMessage",id,{status});revalidatePath("/admin/contacts");}
export async function saveSettings(fd:FormData){
 const a=await requireAdmin();let raw:unknown;try{raw=JSON.parse(String(fd.get("settings")||"[]"));}catch{throw new Error("Settings must be valid JSON.");}
 const p=z.array(z.object({key:z.string().min(1).max(80),value:z.string().max(4000)})).safeParse(raw);if(!p.success)throw new Error("Invalid settings.");const db=getPrismaClient();
 for(const x of p.data)await db.siteSetting.upsert({where:{key:x.key},create:x,update:{value:x.value}});
 await writeAudit(a.id,"settings.update","SiteSetting");revalidatePath("/admin/settings");
}