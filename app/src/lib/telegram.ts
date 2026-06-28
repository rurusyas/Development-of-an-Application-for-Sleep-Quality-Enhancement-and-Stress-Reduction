function wa(): any {
  return (typeof window !== "undefined" && (window as any).Telegram?.WebApp) || null;
}

export const tg = {
  available() { return !!wa(); },
  init() {
    const w = wa();
    if (!w) return;
    try {
      w.ready();
      w.expand();
      w.setHeaderColor?.("#0A0E27");
      w.setBackgroundColor?.("#0A0E27");
    } catch { /* noop */ }
  },
  user(): any { return wa()?.initDataUnsafe?.user || null; },
  name(): string { return this.user()?.first_name || "Гость"; },
  getUserId(): string | null {
    const id = this.user()?.id;
    return id != null ? String(id) : null;
  },
  initData(): string { return wa()?.initData || ""; },
  haptic(style: "light" | "medium" | "heavy" = "light") {
    try { wa()?.HapticFeedback?.impactOccurred(style); } catch { /* noop */ }
  },
  backButton(show: boolean, onClick?: () => void) {
    const b = wa()?.BackButton;
    if (!b) return;
    try {
      if (show) { b.show(); if (onClick) b.onClick(onClick); }
      else b.hide();
    } catch { /* noop */ }
  },
};
