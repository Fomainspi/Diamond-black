"use server";
import {mkdir,writeFile,unlink} from "node:fs/promises";
import path from "node:path";
import {randomUUID} from "node:crypto";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {requireAdmin,writeAudit} from "@/lib/auth";
import {getPrismaClient} from "@/lib/prisma";
const allowed:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif"};
export async function uploadMedia(fd:FormData){
 const admin=await requireAdmin(),file=fd.get("file");if(!(file instanceof File)||file.size<1||file.size>5*1024*1024)throw new Error("Choose an image no larger than 5 MB.");
 const ext=allowed[file.type];if(!ext)throw new Error("Unsupported image format.");
 const data=Buffer.from(await file.arrayBuffer());
 const valid=file.type==="image/jpeg"?data[0]===255&&data[1]===216&&data[2]===255:file.type==="image/png"?data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):file.type==="image/webp"?data.toString("ascii",0,4)==="RIFF"&&data.toString("ascii",8,12)==="WEBP":data.toString("ascii",0,3)==="GIF";
 if(!valid)throw new Error("Uploaded data does not match an allowed image signature.");
 const filename=randomUUID()+"."+ext,folder=path.join(process.cwd(),"public","uploads");await mkdir(folder,{recursive:true});await writeFile(path.join(folder,filename),data,{flag:"wx"});
 const url="/uploads/"+filename,asset=await getPrismaClient().mediaAsset.create({data:{filename,originalName:file.name.slice(0,255),mimeType:file.type,size:file.size,url,altText:String(fd.get("altText")||"").slice(0,300)||null}});
 await writeAudit(admin.id,"media.upload","MediaAsset",asset.id);revalidatePath("/admin/media");redirect("/admin/media");
}
export async function deleteMedia(fd:FormData) {
 const admin=await requireAdmin(),id=String(fd.get("id")||""),db=getPrismaClient();
 const asset=await db.mediaAsset.findUnique({where:{id}});if(!asset)throw new Error("Media asset not found.");
 const [contentRefs,eventRefs]=await Promise.all([db.contentEntry.count({where:{coverImage:asset.url}}),db.managedEvent.count({where:{imageUrl:asset.url}})]);
 if(contentRefs+eventRefs>0)throw new Error("This image is still referenced by content or an event. Replace those references before deleting it.");
 const folder=path.resolve(process.cwd(),"public","uploads"),target=path.resolve(folder,asset.filename);
 if(path.dirname(target)!==folder)throw new Error("Invalid media path.");
 await db.mediaAsset.delete({where:{id}});
 try{await unlink(target);}catch(error){console.error("Media file cleanup failed after database removal",error);}
 await writeAudit(admin.id,"media.delete","MediaAsset",id,{filename:asset.filename});
 revalidatePath("/admin/media");redirect("/admin/media");
}