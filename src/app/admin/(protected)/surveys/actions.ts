"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPrismaClient } from "@/lib/prisma";
import { getCurrentAdmin, writeAudit } from "@/lib/auth";

export async function createSurvey(formData: FormData) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const eventName = String(formData.get("eventName") ?? "").trim();
  if (title.length < 4 || title.length > 160 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || eventName.length < 2) {
    redirect("/admin/surveys?error=invalid");
  }
  const survey = await getPrismaClient().survey.create({data:{
    title, slug, eventName,
    subtitle: String(formData.get("subtitle") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || "Thank you for sharing your feedback.",
    thankYou: "Thank you for sharing your feedback with Diamond Black Corporation.",
    sections: {create:{title:"Your feedback",sortOrder:0}},
  }});
  await writeAudit(admin.id,"survey.create","Survey",survey.id);
  revalidatePath("/admin/surveys");
  redirect(`/admin/surveys/${survey.id}`);
}

export async function addQuestion(formData: FormData) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  const surveyId=String(formData.get("surveyId")??"");
  const title=String(formData.get("title")??"").trim();
  const type=String(formData.get("type")??"SHORT_TEXT");
  const sectionId=String(formData.get("sectionId")??"");
  const allowed=["SHORT_TEXT","LONG_TEXT","SINGLE_CHOICE","MULTIPLE_CHOICE","DROPDOWN","RATING","STAR_RATING","LINEAR_SCALE","YES_NO","EMAIL","NUMBER","DATE"];
  if (!title || title.length>500 || !allowed.includes(type)) redirect(`/admin/surveys/${surveyId}?error=invalid`);
  const db=getPrismaClient();
  const section=await db.surveySection.findFirst({where:{id:sectionId,surveyId}});
  if(!section) redirect("/admin/surveys");
  const count=await db.surveyQuestion.count({where:{sectionId}});
  const rawOptions=String(formData.get("options")??"");
  const options=rawOptions.split("\n").map(x=>x.trim()).filter(Boolean).slice(0,30);
  await db.surveyQuestion.create({data:{
    sectionId,title,type:type as never,required:formData.get("required")==="on",sortOrder:count,
    ...(options.length?{options:{create:options.map((label,i)=>({label,value:label,sortOrder:i}))}}:{})
  }});
  await writeAudit(admin.id,"survey.question.create","Survey",surveyId);
  revalidatePath(`/admin/surveys/${surveyId}`);
  redirect(`/admin/surveys/${surveyId}`);
}

export async function updateQuestion(formData: FormData) {
  const admin=await getCurrentAdmin();if(!admin) redirect("/admin/login");
  const surveyId=String(formData.get("surveyId")??"");
  const questionId=String(formData.get("questionId")??"");
  const title=String(formData.get("title")??"").trim();
  const required=formData.get("required")==="on";
  const rawOptions=String(formData.get("options")??"");
  if(!title||title.length>500) redirect(`/admin/surveys/${surveyId}?error=invalid`);
  const db=getPrismaClient();
  const question=await db.surveyQuestion.findFirst({where:{id:questionId,section:{surveyId}},include:{options:true}});
  if(!question) redirect("/admin/surveys");
  const labels=rawOptions.split("\n").map(x=>x.trim()).filter(Boolean).slice(0,30);
  await db.$transaction([
    db.surveyQuestion.update({where:{id:questionId},data:{title,required}}),
    db.surveyQuestionOption.deleteMany({where:{questionId}}),
    ...(labels.length?[db.surveyQuestionOption.createMany({data:labels.map((label,i)=>({questionId,label,value:label,sortOrder:i}))})]:[])
  ]);
  await writeAudit(admin.id,"survey.question.update","Survey",surveyId);
  revalidatePath(`/admin/surveys/${surveyId}`);
  redirect(`/admin/surveys/${surveyId}`);
}

export async function deleteQuestion(formData: FormData) {
  const admin=await getCurrentAdmin();if(!admin) redirect("/admin/login");
  const surveyId=String(formData.get("surveyId")??"");
  const questionId=String(formData.get("questionId")??"");
  const db=getPrismaClient();
  const q=await db.surveyQuestion.findFirst({where:{id:questionId,section:{surveyId}}});
  if(q) await db.surveyQuestion.delete({where:{id:questionId}});
  await writeAudit(admin.id,"survey.question.delete","Survey",surveyId);
  revalidatePath(`/admin/surveys/${surveyId}`);
  redirect(`/admin/surveys/${surveyId}`);
}

export async function publishSurvey(formData: FormData) {
  const admin=await getCurrentAdmin();if(!admin) redirect("/admin/login");
  const surveyId=String(formData.get("surveyId")??"");
  const db=getPrismaClient();
  const survey=await db.survey.findUnique({where:{id:surveyId},include:{sections:{where:{enabled:true},orderBy:{sortOrder:"asc"},include:{questions:{where:{enabled:true},orderBy:{sortOrder:"asc"},include:{options:{orderBy:{sortOrder:"asc"}}}}}}}});
  if(!survey||!survey.sections.some(s=>s.questions.length>0)) redirect(`/admin/surveys/${surveyId}?error=empty`);
  const version=survey.currentVersion+1;
  const snapshot={title:survey.title,subtitle:survey.subtitle,description:survey.description,eventName:survey.eventName,thankYou:survey.thankYou,privacyNotice:survey.privacyNotice,sections:survey.sections};
  await db.$transaction([
    db.surveyVersion.create({data:{surveyId,version,snapshot}}),
    db.survey.update({where:{id:surveyId},data:{status:"PUBLISHED",currentVersion:version}})
  ]);
  await writeAudit(admin.id,"survey.publish","Survey",surveyId,{version});
  revalidatePath("/admin/surveys");revalidatePath(`/survey/${survey.slug}`);
  redirect(`/admin/surveys/${surveyId}?published=1`);
}

export async function closeSurvey(formData: FormData) {
  const admin=await getCurrentAdmin();if(!admin) redirect("/admin/login");
  const id=String(formData.get("surveyId")??"");
  const survey=await getPrismaClient().survey.update({where:{id},data:{status:"CLOSED"}});
  await writeAudit(admin.id,"survey.close","Survey",id);
  revalidatePath("/admin/surveys");revalidatePath(`/survey/${survey.slug}`);
  redirect(`/admin/surveys/${id}`);
}
