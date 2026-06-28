import { Capacitor } from "@capacitor/core";

export const isNative = () => {
  try { return Capacitor.isNativePlatform(); } catch { return false; }
};
export const isTelegram = () =>
  typeof window !== "undefined" && Boolean((window as any).Telegram?.WebApp);
