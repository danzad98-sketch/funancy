'use client';

import { create } from 'zustand';

export type ToastVariant = 'success' | 'primary' | 'danger' | 'purple';

export interface Toast {
  id: number;
  text: string;
  emoji?: string;
  /** Optional class name for a painted-PNG icon (e.g. "mk-icon mk-icon-coin
   *  mk-icon--sm"). When set, ToastHost renders an empty <span> with this
   *  class instead of the emoji glyph. */
  iconClass?: string;
  variant: ToastVariant;
  ttl: number; // ms
}

interface ToastStore {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

/**
 * Tiny, headless toast store. UI is rendered by <ToastHost/>.
 * Call from anywhere (even non-React code) via `toast(...)` below.
 */
export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = nextId++;
    set({ toasts: [...get().toasts, { ...t, id }] });
    setTimeout(() => get().dismiss(id), t.ttl);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

/**
 * Imperative helper. Example:
 *   toast.primary('+150', { iconClass: 'mk-icon mk-icon-coin mk-icon--sm' });
 *   toast.purple('הפתעה!', { emoji: '🎁' });
 */
type ToastOpts = { emoji?: string; iconClass?: string; ttl?: number };

export const toast = {
  success: (text: string, opts: ToastOpts = {}) =>
    useToastStore.getState().push({ text, emoji: opts.emoji, iconClass: opts.iconClass, variant: 'success', ttl: opts.ttl ?? 1400 }),
  primary: (text: string, opts: ToastOpts = {}) =>
    useToastStore.getState().push({ text, emoji: opts.emoji, iconClass: opts.iconClass, variant: 'primary', ttl: opts.ttl ?? 1400 }),
  danger: (text: string, opts: ToastOpts = {}) =>
    useToastStore.getState().push({ text, emoji: opts.emoji, iconClass: opts.iconClass, variant: 'danger', ttl: opts.ttl ?? 1800 }),
  purple: (text: string, opts: ToastOpts = {}) =>
    useToastStore.getState().push({ text, emoji: opts.emoji, iconClass: opts.iconClass, variant: 'purple', ttl: opts.ttl ?? 1400 }),
};
