import "server-only";

export type MailchimpStatus = "subscribed" | "pending" | "unsubscribed" | "cleaned";
export type MailchimpMember = {
  id: string;
  email_address: string;
  full_name?: string;
  status: MailchimpStatus;
  last_changed?: string;
  tags?: { id: number; name: string }[];
};
type Audience = {
  id: string;
  name: string;
  stats?: { member_count?: number; unsubscribe_count?: number; cleaned_count?: number; campaign_count?: number };
};
type MembersResponse = { members: MailchimpMember[]; total_items: number };
type SearchResponse = { exact_matches?: { members?: MailchimpMember[] }; full_search?: { members?: MailchimpMember[] } };

function configuration() {
  const apiKey = process.env.NEWSLETTER_API_KEY;
  const audienceId = process.env.NEWSLETTER_AUDIENCE_ID;
  const dataCenter = apiKey?.match(/-([a-z]\d+)$/i)?.[1]?.toLowerCase();
  if (process.env.NEWSLETTER_PROVIDER?.toLowerCase() !== "mailchimp" || !apiKey || !audienceId || !dataCenter) {
    throw new Error("Mailchimp is not configured. Set NEWSLETTER_PROVIDER=mailchimp, NEWSLETTER_API_KEY and NEWSLETTER_AUDIENCE_ID on the server.");
  }
  return { apiKey, audienceId, baseUrl: `https://${dataCenter}.api.mailchimp.com/3.0` };
}

async function request<T>(path: string): Promise<T> {
  const config = configuration();
  const response = await fetch(`${config.baseUrl}${path}`, {
    headers: { Authorization: `Basic ${Buffer.from(`diamond-black:${config.apiKey}`).toString("base64")}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    const providerMessage = await response.json().catch(() => ({})) as { detail?: string };
    console.error("Mailchimp API request failed", { status: response.status, detail: providerMessage.detail?.slice(0, 300) });
    throw new Error(response.status === 401 || response.status === 403
      ? "Mailchimp rejected the API credentials or permissions."
      : "Mailchimp could not complete the request. Please try again.");
  }
  return response.json() as Promise<T>;
}

export async function getMailchimpAudience() {
  const { audienceId } = configuration();
  return request<Audience>(`/lists/${encodeURIComponent(audienceId)}?fields=id,name,stats.member_count,stats.unsubscribe_count,stats.cleaned_count,stats.campaign_count`);
}

export async function getMailchimpMembers(options: { page: number; status?: string; search?: string }) {
  const { audienceId } = configuration();
  const page = Math.max(1, Math.min(options.page, 10000));
  const count = 50;
  const status = options.status && ["subscribed", "pending", "unsubscribed", "cleaned"].includes(options.status)
    ? options.status : undefined;
  if (options.search?.trim()) {
    const query = encodeURIComponent(options.search.trim().slice(0, 100));
    const result = await request<SearchResponse>(`/search?query=${query}`);
    const matches = [...(result.exact_matches?.members ?? []), ...(result.full_search?.members ?? [])]
      .filter((member) => (member as MailchimpMember & { list_id?: string }).list_id === audienceId)
      .filter((member) => !status || member.status === status);
    const start = (page - 1) * count;
    return { members: matches.slice(start, start + count), total: matches.length, page, pageCount: Math.max(1, Math.ceil(matches.length / count)) };
  }
  const query = new URLSearchParams({ count: String(count), offset: String((page - 1) * count), sort_field: "last_changed", sort_dir: "DESC" });
  if (status) query.set("status", status);
  const result = await request<MembersResponse>(`/lists/${encodeURIComponent(audienceId)}/members?${query.toString()}`);
  return { members: result.members, total: result.total_items, page, pageCount: Math.max(1, Math.ceil(result.total_items / count)) };
}
