import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatVND(amount) {
  const num = Number(amount || 0);
  return `${num.toLocaleString('vi-VN')} đ`;
}

export function formatDateVN(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('vi-VN');
}