"use client";
import {useState} from "react";
import {saveSettings} from "@/lib/admin-actions";
export default function SettingsEditor({initial}:{initial:{key:string,value:string}[]}){
 const [values,setValues]=useState(initial);
 async function submit(fd:FormData){fd.set("settings",JSON.stringify(values));await saveSettings(fd);}
 return <form className="admin-form" action={submit}>{values.map((item,index)=><label key={item.key}>{item.key}<input value={item.value} onChange={e=>setValues(current=>current.map((v,i)=>i===index?{...v,value:e.target.value}:v))}/></label>)}<button className="admin-button">Save settings</button></form>;
}