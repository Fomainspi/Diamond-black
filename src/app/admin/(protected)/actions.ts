"use server";
import {redirect} from "next/navigation";
import {z} from "zod";
import {createAdminSession,destroyAdminSession,getCurrentAdmin,verifyAdminPassword,writeAudit} from "@/lib/auth";
import {getPrismaClient} from "@/lib/prisma";
const loginSchema=z.object({email:z.string().email().max(254),password:z.string().min(1).max(200)});
export async function loginAdmin(fd:FormData){
 const parsed=loginSchema.safeParse(Object.fromEntries(fd));if(!parsed.success)redirect("/admin/login?error=invalid");
 const email=parsed.data.email.trim().toLowerCase(),db=getPrismaClient(),admin=await db.adminUser.findUnique({where:{email}});
 const valid=admin?.active?await verifyAdminPassword(parsed.data.password,admin.passwordHash):false;
 if(!admin||!valid)redirect("/admin/login?error=invalid");
 await createAdminSession(admin.id);await db.adminUser.update({where:{id:admin.id},data:{lastLoginAt:new Date()}});
 await writeAudit(admin.id,"auth.login","AdminUser",admin.id);redirect("/admin");
}
export async function logoutAdmin(){const admin=await getCurrentAdmin();await destroyAdminSession();if(admin)await writeAudit(admin.id,"auth.logout","AdminUser",admin.id);redirect("/admin/login");}
