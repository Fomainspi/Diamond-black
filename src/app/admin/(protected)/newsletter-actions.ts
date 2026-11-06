"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin, writeAudit } from "@/lib/auth";
import { createCampaign, getCampaign, sendCampaign, testCampaign } from "@/lib/mailchimp-campaigns";

const campaignInput = z.object({
  title:z.string().trim().min(3).max(180),
  subject:z.string().trim().min(3).max(150),
  preview:z.string().trim().max(150).optional(),
  body:z.string().trim().min(30).max(20000),
  fromName:z.string().trim().min(2).max(100),
  replyTo:z.string().trim().email().max(254),
});
export async function createNewsletterDraft(fd:FormData) {
  const admin=await requireAdmin();
  const parsed=campaignInput.safeParse(Object.fromEntries(fd));
  if(!parsed.success) throw new Error("Please check the newsletter fields and try again.");
  const campaign=await createCampaign({...parsed.data,preview:parsed.data.preview??""});
  await writeAudit(admin.id,"newsletter.draft.create","MailchimpCampaign",campaign.id,{subject:parsed.data.subject});
  revalidatePath("/admin/newsletter");
  redirect("/admin/newsletter?campaign="+encodeURIComponent(campaign.id));
}
export async function sendNewsletterTest(fd:FormData) {
  const admin=await requireAdmin(),id=String(fd.get("campaignId")||""),email=String(fd.get("testEmail")||"");
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||id.length<3) throw new Error("Enter a valid test email address.");
  const campaign=await getCampaign(id);
  if(campaign.status==="sent") throw new Error("This campaign has already been sent.");
  await testCampaign(id,email);
  await writeAudit(admin.id,"newsletter.test.send","MailchimpCampaign",id,{testEmail:email});
  revalidatePath("/admin/newsletter");
  redirect("/admin/newsletter?campaign="+encodeURIComponent(id)+"&tested=1");
}
export async function publishNewsletter(fd:FormData) {
  const admin=await requireAdmin(),id=String(fd.get("campaignId")||""),confirmation=String(fd.get("confirmation")||"");
  if(id.length<3||confirmation!=="SEND TO ALL SUBSCRIBERS") throw new Error("Final confirmation did not match. No email was sent.");
  const campaign=await getCampaign(id);
  if(campaign.status==="sent") throw new Error("This campaign has already been sent.");
  await sendCampaign(id);
  await writeAudit(admin.id,"newsletter.campaign.send","MailchimpCampaign",id,{subject:campaign.settings?.subject_line});
  revalidatePath("/admin/newsletter");
  redirect("/admin/newsletter?sent=1");
}
