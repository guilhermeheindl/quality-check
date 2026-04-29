'use client';
import type { FlagColor } from '@/lib/types';

const MAP: Record<FlagColor, { emoji: string; bg: string; text: string }> = {
  green:  { emoji: '🟢', bg: 'bg-emerald-900/40', text: 'text-emerald-400' },
  yellow: { emoji: '🟡', bg: 'bg-yellow-900/40',  text: 'text-yellow-400' },
  red:    { emoji: '🔴', bg: 'bg-red-900/40',      text: 'text-red-400'   },
  black:  { emoji: '⚫', bg: 'bg-slate-700/60',    text: 'text-slate-300' },
  none:   { emoji: '⚪', bg: 'bg-slate-800',        text: 'text-slate-400' },
};

export function FlagBadge({ flag, size = 'md' }: { flag: FlagColor; size?: 'sm' | 'md' }) {
  const { emoji } = MAP[flag];
  const sz = size === 'sm' ? 'text-sm' : 'text-base';
  return <span className={sz}>{emoji}</span>;
}

export function flagColor(flag: FlagColor) {
  return MAP[flag];
}
