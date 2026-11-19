import { notFound } from "next/navigation";
import Link from "next/link";
import { getPrismaClient } from "@/lib/prisma";
import SurveyForm from "@/components/SurveyForm";

type Question={id:string;title:string;description?:string|null;type:string;required:boolean;minValue?:number|null;maxValue?:number|null;options?:Array<{id:string;label:string;value:string}>};
type Section={id:string;title:string;description?:string|null;questions:Question[]};
type Snapshot={title:string;subtitle?:string|null;description:string;eventName:string;thankYou:string;privacyNotice?:string|null;sections:Section[]};

export default async function PublicSurveyPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const survey=await getPrismaClient().survey.findFirst({where:{slug,status:"PUBLISHED"},include:{versions:{orderBy:{version:"desc"},take:1}}});
 const version=survey?.versions[0];if(!survey||!version)notFound();
 const snapshot=version.snapshot as unknown as Snapshot;
 return <main className="survey-page"><div className="survey-card">
  <header className="survey-header"><Link href="/" aria-label="Diamond Black Corporation home"><img src="/images/diamond-black-horizontal.jpg" alt="Diamond Black Corporation"/></Link>
   <span className="eyebrow">Diamond Black Corporation</span><h1>{snapshot.title}</h1>{snapshot.subtitle&&<p className="survey-subtitle">{snapshot.subtitle}</p>}
   <p className="survey-intro">{snapshot.description}</p><span className="survey-event">{snapshot.eventName}</span>
  </header>
  <SurveyForm slug={slug} sections={snapshot.sections} thankYou={snapshot.thankYou} privacyNotice={snapshot.privacyNotice}/>
 </div><footer className="survey-footer">© {new Date().getFullYear()} Diamond Black Corporation · <Link href="/">Visit our website</Link></footer></main>;
}
