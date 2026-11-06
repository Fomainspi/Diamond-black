"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {requireAdmin,writeAudit} from "@/lib/auth";
import {getPrismaClient} from "@/lib/prisma";
export async function deleteContent(fd:FormData){
 const admin=await requireAdmin(),id=String(fd.get("id")||""),db=getPrismaClient(),item=await db.contentEntry.findUnique({where:{id}});
 if(!item)throw new Error("Content not found.");
 await db.contentEntry.delete({where:{id}});
 await writeAudit(admin.id,"content.delete","ContentEntry",id,{title:item.title,slug:item.slug});
 revalidatePath("/admin/content");revalidatePath("/news");revalidatePath("/news/"+item.slug);redirect("/admin/content");
}
export async function deleteEvent(fd:FormData){
 const admin=await requireAdmin(),id=String(fd.get("id")||""),db=getPrismaClient(),item=await db.managedEvent.findUnique({where:{id}});
 if(!item)throw new Error("Event not found.");
 const registrations=await db.eventRegistration.count({where:{eventName:item.title}});
 if(registrations>0)throw new Error("This event has attendee records. Archive it instead; registration history must be preserved.");
 await db.managedEvent.delete({where:{id}});
 await writeAudit(admin.id,"event.delete","ManagedEvent",id,{title:item.title});
 revalidatePath("/admin/events");revalidatePath("/events");redirect("/admin/events");
}
export async function archiveEvent(fd:FormData){
 const admin=await requireAdmin(),id=String(fd.get("id")||""),db=getPrismaClient(),item=await db.managedEvent.findUnique({where:{id}});
 if(!item)throw new Error("Event not found.");
 await db.managedEvent.update({where:{id},data:{status:"ARCHIVED",registrationEnabled:false}});
 await writeAudit(admin.id,"event.archive","ManagedEvent",id,{title:item.title});
 revalidatePath("/admin/events");revalidatePath("/events");redirect("/admin/events");
}
export async function deleteContact(fd:FormData){
 const admin=await requireAdmin(),id=String(fd.get("id")||""),db=getPrismaClient(),item=await db.contactMessage.findUnique({where:{id}});
 if(!item)throw new Error("Contact message not found.");
 await db.contactMessage.delete({where:{id}});
 await writeAudit(admin.id,"contact.delete","ContactMessage",id,{email:item.email});
 revalidatePath("/admin/contacts");redirect("/admin/contacts");
}
