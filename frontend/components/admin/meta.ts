export const STATUSES = ['new', 'contacted', 'in_progress', 'completed', 'closed'] as const;

export const STATUS_META: Record<string, { label: string; badge: string; dot: string }> = {
  new: { label: 'New', badge: 'bg-amber-100 text-amber-800 ring-amber-200', dot: 'bg-amber-500' },
  contacted: { label: 'Contacted', badge: 'bg-sky-100 text-sky-800 ring-sky-200', dot: 'bg-sky-500' },
  in_progress: { label: 'In progress', badge: 'bg-violet-100 text-violet-800 ring-violet-200', dot: 'bg-violet-500' },
  completed: { label: 'Completed', badge: 'bg-emerald-100 text-emerald-800 ring-emerald-200', dot: 'bg-emerald-500' },
  closed: { label: 'Closed', badge: 'bg-slate-100 text-slate-600 ring-slate-200', dot: 'bg-slate-400' },
};

export const EMAIL_META: Record<string, { label: string; cls: string }> = {
  sent: { label: 'Emails sent', cls: 'text-emerald-700' },
  partial: { label: 'Some emails failed', cls: 'text-amber-700' },
  failed: { label: 'Email failed', cls: 'text-red-700' },
  disabled: { label: 'Email not configured', cls: 'text-slate-500' },
  pending: { label: 'Email pending', cls: 'text-slate-500' },
};

export function whatsappFor(phone: string, name: string) {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = '234' + digits.slice(1);
  if (!digits) return '#';
  return `https://wa.me/${digits}?text=${encodeURIComponent(`Hello ${name}, this is JKJ Exchange Services following up on your website enquiry.`)}`;
}

export function formatAmount(amount: number | null, currency: string) {
  if (amount == null) return 'Not specified';
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(amount)} ${currency}`;
}

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
export function timeAgo(iso: string) {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [unit, size] of units) if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  return 'just now';
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
