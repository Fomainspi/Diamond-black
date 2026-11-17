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

export async function createInitialEventSurvey() {
 const admin=await getCurrentAdmin();if(!admin)redirect("/admin/login");
 const db=getPrismaClient();const existing=await db.survey.findUnique({where:{slug:"100-people-one-night"}});
 if(existing)redirect(`/admin/surveys/${existing.id}`);
 const groups=[
  {title:"SECTION 1 – YOUR EXPERIENCE",items:[
   ["Overall, how would you rate your experience at 100 People One Night?","RATING",true,["1","2","3","4","5"]],
   ["How would you rate the venue and environment?","RATING",true,["1","2","3","4","5"]],
   ["How would you rate the event organization?","RATING",true,["1","2","3","4","5"]],
   ["How would you rate the entertainment and program?","RATING",true,["1","2","3","4","5"]],
   ["How would you rate the networking opportunities?","RATING",true,["1","2","3","4","5"]],
   ["How would you rate hospitality and guest experience?","RATING",true,["1","2","3","4","5"]],
   ["How would you rate the overall atmosphere?","RATING",true,["1","2","3","4","5"]],
   ["What did you enjoy most about the event?","MULTIPLE_CHOICE",false,["Meeting new people","Networking and making connections","Entertainment and music","The atmosphere and environment","Cultural diversity","Overall organization","Other"]],
   ["Did the event meet your expectations?","SINGLE_CHOICE",true,["Exceeded my expectations","Met my expectations","Partially met my expectations","Did not meet my expectations"]]
  ]},
  {title:"SECTION 2 – YOUR FEEDBACK",items:[
   ["What was your most memorable moment or experience during the event?","LONG_TEXT",false,[]],
   ["What do you think we could improve for our next event?","LONG_TEXT",false,[]],
   ["Would you recommend a Diamond Black event to your friends, colleagues, or business partners?","SINGLE_CHOICE",true,["Definitely","Probably","Not sure","Probably not","Definitely not"]]
  ]},
  {title:"SECTION 3 – FUTURE OPPORTUNITIES",items:[
   ["What types of events or activities would you like Diamond Black to organize in the future?","MULTIPLE_CHOICE",false,["Business networking events","Entrepreneurship and investment forums","Cultural events and celebrations","Music and entertainment events","Professional development and training","Business conferences and exhibitions","Social and community gatherings","Africa–Philippines international business networking","Other"]],
   ["Would you be interested in participating in future Diamond Black initiatives?","SINGLE_CHOICE",true,["Yes, definitely","Yes, depending on the initiative","Maybe","Not at the moment"]],
   ["In what capacity would you be interested in connecting with Diamond Black?","MULTIPLE_CHOICE",false,["Guest or community member","Entrepreneur or business owner","Potential business partner","Sponsor or investor","Professional or service provider","Volunteer or collaborator","Other"]]
  ]},
  {title:"SECTION 4 – YOUR MESSAGE",items:[
   ["Do you have any additional comments, suggestions, or messages for the Diamond Black team?","LONG_TEXT",false,[]],
   ["Would you like to receive updates about upcoming events, opportunities, and initiatives from Diamond Black Corporation?","YES_NO",false,[]]
  ]}
 ] as const;
 const survey=await db.survey.create({data:{
  title:"100 PEOPLE ONE NIGHT – GUEST EXPERIENCE & FEEDBACK SURVEY",slug:"100-people-one-night",eventName:"100 People One Night",
  subtitle:"Your experience matters. Help us make the next event even better.",
  description:"Thank you for being part of 100 People One Night! We are grateful that you joined us and contributed to making this event memorable. At Diamond Black Corporation, we believe that meaningful connections, shared experiences, and community engagement are essential to building something great. Your feedback matters. Please take a few minutes to share your experience and help us improve future events.",
  thankYou:"Thank you for taking the time to share your experience. Your feedback will help Diamond Black Corporation create even more meaningful events and opportunities.",
  privacyNotice:"Your responses are used by Diamond Black Corporation to evaluate and improve our events. Newsletter subscription is optional and requires your separate consent.",
  sections: {
    create: groups.map((group, sectionIndex) => ({
      title: group.title,
      sortOrder: sectionIndex,
      questions: {
        create: group.items.map((item, questionIndex) => ({
          title: item[0],
          type: item[1] as never,
          required: item[2],
          sortOrder: questionIndex,
          options: {
            create: item[3].map((label, optionIndex) => ({
              label,
              value: label,
              sortOrder: optionIndex,
            })),
          },
        })),
      },
    })),
  },
 }});
 await writeAudit(admin.id,"survey.create.initial","Survey",survey.id);revalidatePath("/admin/surveys");redirect(`/admin/surveys/${survey.id}`);
}
export async function archiveSurvey(formData:FormData){
 const admin=await getCurrentAdmin();if(!admin)redirect("/admin/login");
 const id=String(formData.get("surveyId")??"");const survey=await getPrismaClient().survey.update({where:{id},data:{status:"ARCHIVED"}});
 await writeAudit(admin.id,"survey.archive","Survey",id);revalidatePath("/admin/surveys");revalidatePath(`/survey/${survey.slug}`);redirect("/admin/surveys");
}
export async function duplicateSurvey(formData:FormData){
 const admin=await getCurrentAdmin();if(!admin)redirect("/admin/login");
 const id=String(formData.get("surveyId")??"");const db=getPrismaClient();
 const source=await db.survey.findUnique({where:{id},include:{sections:{orderBy:{sortOrder:"asc"},include:{questions:{orderBy:{sortOrder:"asc"},include:{options:{orderBy:{sortOrder:"asc"}}}}}}}});
 if(!source)redirect("/admin/surveys");
 const slug=`${source.slug}-copy-${Date.now().toString().slice(-6)}`;
 const copy = await db.survey.create({
  data: {
    title: `${source.title} (Copy)`,
    slug,
    eventName: source.eventName,
    subtitle: source.subtitle,
    description: source.description,
    thankYou: source.thankYou,
    privacyNotice: source.privacyNotice,
    status: "DRAFT",
    sections: {
      create: source.sections.map((section) => ({
        title: section.title,
        description: section.description,
        sortOrder: section.sortOrder,
        questions: {
          create: section.questions.map((question) => ({
            title: question.title,
            description: question.description,
            type: question.type,
            required: question.required,
            enabled: question.enabled,
            sortOrder: question.sortOrder,
            minValue: question.minValue,
            maxValue: question.maxValue,
            options: {
              create: question.options.map((option) => ({
                label: option.label,
                value: option.value,
                sortOrder: option.sortOrder,
              })),
            },
          })),
        },
      })),
    },
  },
 });
 await writeAudit(admin.id,"survey.duplicate","Survey",copy.id,{sourceId:id});revalidatePath("/admin/surveys");redirect(`/admin/surveys/${copy.id}`);
}
