"use client";
import type { ReactNode } from "react";
export default function ConfirmDelete({ action, children, prompt="Permanently delete this item? This cannot be undone." }: { action:(formData:FormData)=>void|Promise<void>; children:ReactNode; prompt?:string }) {
  return <form action={action} onSubmit={event=>{if(!window.confirm(prompt))event.preventDefault();}}>
    {children}
  </form>;
}
