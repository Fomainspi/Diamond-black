import "server-only";

function config() {
  const apiKey = process.env.NEWSLETTER_API_KEY;
  const dc = (process.env.NEWSLETTER_DATA_CENTER || apiKey?.match(/-([a-z]{2}\d+)$/i)?.[1] || "").toLowerCase();
  if (process.env.NEWSLETTER_PROVIDER?.toLowerCase() !== "mailchimp" || !apiKey || !process.env.NEWSLETTER_AUDIENCE_ID || !/^[a-z]{2}\d+$/.test(dc)) {
    throw new Error("Mailchimp campaign configuration is incomplete.");
  }
  return { apiKey, audienceId: process.env.NEWSLETTER_AUDIENCE_ID, base: `https://${dc}.api.mailchimp.com/3.0` };
}
async function api<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const c = config();
  const response = await fetch(c.base + path, {
    method, cache: "no-store", signal: AbortSignal.timeout(15000),
    headers: { Authorization: "Basic " + Buffer.from("diamond-black:" + c.apiKey).toString("base64"), "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({})) as { detail?: string };
    console.error("Mailchimp campaign API error", { status: response.status, detail: detail.detail?.slice(0, 250) });
    throw new Error("Mailchimp could not complete this campaign action. Check the campaign in Mailchimp before retrying.");
  }
  return response.status === 204 ? ({} as T) : response.json() as Promise<T>;
}
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]!));
export function newsletterHtml(title: string, body: string) {
  const paragraphs = body.split(/\r?\n\\s*\r?\n/).map(p => `<p style="font-size:16px;line-height:1.7;color:#292929;margin:0 0 18px">${esc(p).replace(/\r?\n/g,"<br>")}</p>`).join("");
  return `<!doctype html><html><body style="margin:0;background:#f5f3ef;font-family:Arial,sans-serif"><div style="max-width:640px;margin:30px auto;background:#fff;padding:36px"><p style="letter-spacing:3px;color:#9b7b35;font-weight:bold">DIAMOND BLACK CORPORATION</p><h1 style="color:#171717;font-size:30px">${esc(title)}</h1>${paragraphs}<hr style="border:0;border-top:1px solid #ddd;margin:30px 0"><p style="font-size:12px;color:#777">You are receiving this email because you subscribed to Diamond Black updates. *|UNSUB|*</p></div></body></html>`;
}
export async function createCampaign(input:{title:string;subject:string;preview:string;body:string;fromName:string;replyTo:string}) {
  const c=config();
  const campaign=await api<{id:string;status:string}>("/campaigns","POST",{
    type:"regular",recipients:{list_id:c.audienceId},
    settings:{subject_line:input.subject,preview_text:input.preview,title:input.title,from_name:input.fromName,reply_to:input.replyTo},
  });
  await api("/campaigns/"+encodeURIComponent(campaign.id)+"/content","PUT",{html:newsletterHtml(input.title,input.body)});
  return campaign;
}
export async function testCampaign(id:string,email:string) {
  await api("/campaigns/"+encodeURIComponent(id)+"/actions/test","POST",{test_emails:[email],send_type:"html"});
}
export async function sendCampaign(id:string) {
  await api("/campaigns/"+encodeURIComponent(id)+"/actions/send","POST");
}
export async function getCampaign(id:string) {
  return api<{id:string;status:string;settings?:{subject_line?:string;title?:string}}>("/campaigns/"+encodeURIComponent(id));
}
