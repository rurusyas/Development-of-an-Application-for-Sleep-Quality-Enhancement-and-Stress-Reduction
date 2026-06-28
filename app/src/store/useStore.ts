import { create } from "zustand";
import { computeIndices } from "../lib/indices";
import * as db from "../lib/db";
import { api } from "../services/api";
import { tg } from "../lib/telegram";
import type { ApneaResult, DiaryEntry, FocusSession, Indices, Onboarding } from "../types";

export type ChatMsg = { role: "user" | "assistant"; content: string };

const rnd = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function resolveTgId(): string {
  const fromTg = tg.getUserId();
  if (fromTg) return "tg_" + fromTg;
  try {
    const k = "orca:device_id";
    const cached = localStorage.getItem(k);
    if (cached) return cached;
    const fresh = "web_" + rnd();
    localStorage.setItem(k, fresh);
    return fresh;
  } catch {
    return "web_" + rnd();
  }
}

interface State {
  ready: boolean;
  tgId: string;
  backendUid: number | null;
  name: string;
  indices: Indices | null;
  diary: DiaryEntry[];
  apnea: ApneaResult[];
  focus: FocusSession[];
  chat: ChatMsg[];
  settings: { dnd: boolean; nightshift: boolean; haptics: boolean };
  init: () => Promise<void>;
  setOnboarding: (name: string, o: Onboarding) => Promise<void>;
  addDiary: (e: Omit<DiaryEntry, "id" | "created_at">) => Promise<void>;
  addApnea: (r: Omit<ApneaResult, "id" | "created_at">) => Promise<void>;
  addFocus: (durationMin: number, completed: boolean) => Promise<void>;
  pushChat: (m: ChatMsg) => void;
  setLastAssistant: (text: string) => void;
  toggleSetting: (k: "dnd" | "nightshift" | "haptics") => void;
}

export const useStore = create<State>((set, get) => ({
  ready: false,
  tgId: "",
  backendUid: null,
  name: "",
  indices: null,
  diary: [],
  apnea: [],
  focus: [],
  chat: [],
  settings: { dnd: false, nightshift: true, haptics: true },

  async init() {
    const tgId = resolveTgId();
    const [diary, apnea, focus, indices, backendUid] = await Promise.all([
      db.loadDiary(), db.loadApnea(), db.loadFocus(), db.loadIndices(), db.loadUid(),
    ]);
    set({ tgId, diary, apnea, focus, indices, backendUid, ready: true });

    api.getUser(tgId).then((u: any) => {
      if (u?.id) {
        set({ backendUid: u.id });
        db.saveUid(u.id);
        if (u.name && !get().name) set({ name: u.name });
      }
    });
  },

  async setOnboarding(name, o) {
    const indices = computeIndices(o);
    set({ name, indices });
    db.saveIndices(indices);
    const tgId = get().tgId || resolveTgId();
    const res = await api.upsertUser(tgId, { name, onboarding: o });
    if (res?.id) { set({ backendUid: res.id }); db.saveUid(res.id); }
  },

  async addDiary(e) {
    const entry: DiaryEntry = { ...e, id: rnd(), created_at: Date.now() };
    const diary = [entry, ...get().diary];
    set({ diary }); db.saveDiary(diary);
    const bu = get().backendUid;
    if (bu) api.postDiary({ user_id: bu, ...e });
  },

  async addApnea(r) {
    const item: ApneaResult = { ...r, id: rnd(), created_at: Date.now() };
    const apnea = [item, ...get().apnea];
    set({ apnea }); db.saveApnea(apnea);
  },

  async addFocus(durationMin, completed) {
    const item: FocusSession = { id: rnd(), duration_min: durationMin, completed, created_at: Date.now() };
    const focus = [item, ...get().focus];
    set({ focus }); db.saveFocus(focus);
    const bu = get().backendUid;
    if (bu) api.postFocus({ user_id: bu, duration_min: durationMin, completed });
  },

  pushChat(m) { set({ chat: [...get().chat, m] }); },
  setLastAssistant(text) {
    const chat = get().chat.slice();
    for (let i = chat.length - 1; i >= 0; i--) {
      if (chat[i].role === "assistant") { chat[i] = { role: "assistant", content: text }; break; }
    }
    set({ chat });
  },
  toggleSetting(k) { set({ settings: { ...get().settings, [k]: !get().settings[k] } }); },
}));
