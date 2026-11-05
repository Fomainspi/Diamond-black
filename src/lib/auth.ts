import "server-only";
import {createHash,randomBytes} from "node:crypto";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {getPrismaClient} from "@/lib/prisma";
const cookieName="diamond_black_admin";
const digest=(s:string)=>createHash("sha256").update(s).digest("hex");
export async function createAdminSession(adminId:string){
 const token=randomBytes(32).toString("base64url"),expiresAt=new Date(Date.now()+7*86400000);
 await getPrismaClient().adminSession.create({data:{adminId,tokenHash:digest(token),expiresAt}});
 (await cookies()).set(cookieName,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",expires:expiresAt});
}
export async function getCurrentAdmin(){
 const token=(await cookies()).get(cookieName)?.value;if(!token)return null;
 const session=await getPrismaClient().adminSession.findUnique({where:{tokenHash:digest(token)},include:{admin:true}});
 if(!session||session.expiresAt<=new Date()||!session.admin.active){if(session)await getPrismaClient().adminSession.delete({where:{id:session.id}});return null;}
 return session.admin;
}
export async function requireAdmin(){const admin=await getCurrentAdmin();if(!admin)redirect("/admin/login");return admin;}
export async function destroyAdminSession(){const token=(await cookies()).get(cookieName)?.value;if(token)await getPrismaClient().adminSession.deleteMany({where:{tokenHash:digest(token)}});(await cookies()).delete(cookieName);}
export async function writeAudit(adminId:string,action:string,entityType:string,entityId?:string,details?:Record<string,unknown>){
 await getPrismaClient().auditLog.create({data:{adminId,action,entityType,entityId,details:details as object|undefined}});
}