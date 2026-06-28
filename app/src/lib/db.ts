import { get, set } from "idb-keyval";
import type { ApneaResult, DiaryEntry, FocusSession, Indices } from "../types";

const K = {
  diary: "orca:diary",
  apnea: "orca:apnea",
  focus: "orca:focus",
  indices: "orca:indices",
  uid: "orca:uid",
  settings: "orca:settings",
};

async function read<T>(k: string, fallback: T): Promise<T> {
  try { const v = await get(k); return (v as T) ?? fallback; } catch { return fallback; }
}
export const loadDiary = () => read<DiaryEntry[]>(K.diary, []);
export const saveDiary = (v: DiaryEntry[]) => set(K.diary, v);
export const loadApnea = () => read<ApneaResult[]>(K.apnea, []);
export const saveApnea = (v: ApneaResult[]) => set(K.apnea, v);
export const loadFocus = () => read<FocusSession[]>(K.focus, []);
export const saveFocus = (v: FocusSession[]) => set(K.focus, v);
export const loadIndices = () => read<Indices | null>(K.indices, null);
export const saveIndices = (v: Indices) => set(K.indices, v);
export const loadUid = () => read<number | null>(K.uid, null);
export const saveUid = (v: number) => set(K.uid, v);
