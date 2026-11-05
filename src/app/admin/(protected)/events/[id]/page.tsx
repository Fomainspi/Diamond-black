import { notFound } from "next/navigation";
import { getPrismaClient } from "@/lib/prisma";
import { saveEvent } from "@/lib/admin-actions";

export default async function EditEvent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = id === "new" ? null : await getPrismaClient().managedEvent.findUnique({ where: { id } });
  if (id !== "new" && !item) notFound();
  const dateTime = (date: Date | null | undefined) =>
    date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";

  return (
    <>
      <span className="eyebrow">Events</span>
      <h1>{item ? "Edit event" : "Create event"}</h1>
      <form className="admin-form" action={saveEvent}>
        {item && <input type="hidden" name="id" value={item.id} />}
        <label>Title<input name="title" required maxLength={180} defaultValue={item?.title} /></label>
        <label>Slug<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={item?.slug} /></label>
        <label>Summary<input name="summary" maxLength={500} defaultValue={item?.summary ?? ""} /></label>
        <label>Description<textarea name="description" required maxLength={50000} defaultValue={item?.description ?? ""} /></label>
        <label>Venue<input name="venue" maxLength={200} defaultValue={item?.venue ?? ""} /></label>
        <label>Location<input name="location" maxLength={200} defaultValue={item?.location ?? ""} /></label>
        <label>Start date/time<input type="datetime-local" name="startsAt" required defaultValue={dateTime(item?.startsAt)} /></label>
        <label>End date/time<input type="datetime-local" name="endsAt" defaultValue={dateTime(item?.endsAt)} /></label>
        <label>Image URL<input name="imageUrl" maxLength={1000} defaultValue={item?.imageUrl ?? ""} /></label>
        <label>Registration URL<input name="registrationUrl" maxLength={1000} defaultValue={item?.registrationUrl ?? ""} /></label>
        <label className="admin-checkbox"><input name="registrationEnabled" type="checkbox" defaultChecked={item?.registrationEnabled ?? true} /> Allow registration</label>
        <label>Status<select name="status" defaultValue={item?.status ?? "DRAFT"}><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select></label>
        <button className="admin-button">Save event</button>
      </form>
    </>
  );
}
