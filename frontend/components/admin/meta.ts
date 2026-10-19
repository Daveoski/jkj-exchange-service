export const STATUSES = ['new', 'contacted', 'in_progress', 'completed', 'closed'] as const;

export const STATUS_META: Record<string, { label: string; badge: string; dot: string }> = {
  new: { label: 'New', badge: 'bg-accent-soft text-accent ring-accent-line', dot: 'bg-amber-500' },
  contacted: { label: 'Contacted', badge: 'bg-sky-100 dark:bg-sky-500/15 text-sky-800 dark:text-sky-300 ring-sky-200 dark:ring-sky-500/30', dot: 'bg-sky-500' },
  in_progress: { label: 'In progress', badge: 'bg-violet-100 dark:bg-violet-500/15 text-violet-800 dark:text-violet-300 ring-violet-200 dark:ring-violet-500/30', dot: 'bg-violet-500' },
  completed: { label: 'Completed', badge: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-500/30', dot: 'bg-emerald-500' },
  closed: { label: 'Closed', badge: 'bg-surface-2 text-muted ring-line', dot: 'bg-slate-400' },
};

export const EMAIL_META: Record<string, { label: string; cls: string }> = {
  sent: { label: 'Emails sent', cls: 'text-emerald-700 dark:text-emerald-300' },
  partial: { label: 'Some emails failed', cls: 'text-accent' },
  failed: { label: 'Email failed', cls: 'text-red-700 dark:text-red-300' },
  disabled: { label: 'Email not configured', cls: 'text-muted' },
  pending: { label: 'Email pending', cls: 'text-muted' },
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
