// Browser-side client for the JKJ API. All calls go to same-origin `/api/v1/*`, which the
// Next.js route handler in app/api/[...path] proxies to the FastAPI backend.

export class ApiError extends Error {
  constructor(message: string, public status: number, public fields: Record<string, string> = {}) {
    super(message);
  }
}

const FALLBACK: Record<number, string> = {
  401: 'Please sign in again.',
  403: 'You do not have access to this action.',
  404: 'Not found.',
  429: 'Too many requests. Please wait a moment and try again.',
  502: 'Our servers are temporarily unreachable. Please try again shortly.',
  503: 'This service is temporarily unavailable. Please contact us directly on WhatsApp or by phone.',
};

export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, {
      ...init,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', 'X-JKJ-Request': '1', ...init.headers },
    });
  } catch {
    throw new ApiError('We could not reach our servers. Check your connection and try again.', 0);
  }
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof data?.detail === 'string' ? data.detail : FALLBACK[response.status] || 'Something went wrong. Please try again.';
    throw new ApiError(detail, response.status, data?.errors || {});
  }
  return data as T;
}

export type Inquiry = {
  id: string;
  reference: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  currency: string;
  amount: number | null;
  contact_method: string;
  message: string;
  status: string;
  admin_notes: string;
  email_status: string;
};

export type InquiryEvent = { id: string; created_at: string; actor: string; kind: string; detail: string };
export type InquiryDetail = Inquiry & { events: InquiryEvent[] };
export type InquiryPage = { items: Inquiry[]; total: number; limit: number; offset: number };
export type AdminUser = { id: string; email: string; last_login_at: string | null };
export type Stats = {
  total: number;
  by_status: Record<string, number>;
  by_service: Record<string, number>;
  last_7_days: number;
  last_30_days: number;
  daily: { date: string; count: number }[];
};
