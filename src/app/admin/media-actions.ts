"use server";
import {mkdir,writeFile} from "node:fs/promises";import path from "node:path";import {randomUUID} from "node:crypto";import {revalidatePath} from "next/cache";import {redirect} from "next/navigation";import {requireAdmin,writeAudit} from "@/lib/auth";import {getPrismaClient} from "@/lib/prisma";
const extensions:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif"};
export async function uploadMedia(fd:FormData){
 const admin=await requireAdmin(),file=fd.get("file");if(!(file instanceof File)||file.size<1||file.size>5*1024*1024)throw new Error("Choose an image no larger than 5 MB.");
 const ext=extensions[file.type];if(!ext)throw new Error("Unsupported image type.");
 const bytes=Buffer.from(await file.arrayBuffer());
 const valid=file.type==="image/jpeg"?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:file.type==="image/png"?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):file.type==="image/webp"?bytes.toString("ascii",0,4)==="RIFF"&&bytes.toString("ascii",8,12)==="WEBP":bytes.toString("ascii",0,3)==="GIF";
 if(!valid)throw new Error("File signature does not match the declared image type.");
 const filename=randomUUID()+"."+ext,dir=path.join(process.cwd(),"public","uploads");await mkdir(dir,{recursive:true});await writeFile(path.join(dir,filename),bytes,{flag:"wx"});
 const url="/uploads/"+filename,asset=await getPrismaClient().mediaAsset.create({data:{filename,originalName:file.name.slice(0,255),mimeType:file.type,size:file.size,url,altText:String(fd.get("altText")||"").slice(0,300)||null}});
 await writeAudit(admin.id,"media.upload","MediaAsset",asset.id);revalidatePath("/admin/media");redirect("/admin/media");
}