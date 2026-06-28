export interface Onboarding {
  sleep_hours: number; sleep_latency_min: number; wake_feeling: number; bedtime_regularity: number;
  stress_freq: number; thoughts_racing: number; overload: number; focus_difficulty: number; distraction: number;
}
export interface DiaryEntry { id: string; mood: number; energy: number; stress: number; sleep_quality: number; note?: string; created_at: number; }
export interface ApneaResult { id: string; has_apnea: boolean; confidence: number; mode: string; created_at: number; }
export interface FocusSession { id: string; duration_min: number; completed: boolean; created_at: number; }
export interface Article { id: string; title: string; summary: string; body: string; sources: string[]; }
export interface SoundDef { id: string; title: string; type: string; params: Record<string, number | string>; }
export interface Indices { sleep_index: number; stress_index: number; focus_index: number; }
