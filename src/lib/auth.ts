import "server-only";
import {createHash,randomBytes,scrypt as scryptCallback,timingSafeEqual} from "node:crypto";
import {promisify} from "node:util";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {getPrismaClient} from "@/lib/prisma";
const scrypt=promisify(scryptCallback);
const COOKIE_NAME="diamond_black_admin";
const hash=(value:string)=>createHash("sha256").update(value).digest("hex");
export async function verifyAdminPassword(password:string,stored:string){
 const [scheme,salt,expected]=stored.split("$");
 if(scheme!=="scrypt"||!salt||!expected)return false;
 const actual=await scrypt(password,salt,64) as Buffer;
 const target=Buffer.from(expected,"hex");
 return actual.length===target.length&&timingSafeEqual(actual,target);
}
export async function createAdminSession(adminId:string){
 const token=randomBytes(32).toString("base64url"),expiresAt=new Date(Date.now()+7*86400000);
 await getPrismaClient().adminSession.create({data:{adminId,tokenHash:hash(token),expiresAt}});
 (await cookies()).set(COOKIE_NAME,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",expires:expiresAt});
}
export async function getCurrentAdmin(){
 const token=(await cookies()).get(COOKIE_NAME)?.value;if(!token)return null;
 const db=getPrismaClient(),session=await db.adminSession.findUnique({where:{tokenHash:hash(token)},include:{admin:true}});
 if(!session)return null;
 if(session.expiresAt<=new Date()||!session.admin.active){await db.adminSession.delete({where:{id:session.id}});return null;}
 return session.admin;
}
export async function requireAdmin(){const admin=await getCurrentAdmin();if(!admin)redirect("/admin/login");return admin;}
export async function destroyAdminSession(){const token=(await cookies()).get(COOKIE_NAME)?.value;if(token)await getPrismaClient().adminSession.deleteMany({where:{tokenHash:hash(token)}});(await cookies()).delete(COOKIE_NAME);}
export async function writeAudit(adminId:string,action:string,entityType:string,entityId?:string,details?:Record<string,unknown>){
 await getPrismaClient().auditLog.create({data:{adminId,action,entityType,entityId,details:details as object|undefined}});
}
