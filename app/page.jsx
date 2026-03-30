"use client";
import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Trophy, Volleyball, Goal, Hand, Wifi, Lock } from "lucide-react";

// Configuração do Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const STATE_ROW_ID = "gata-na-praia-2026-official";

const initialTournament = {
  modalities: ["Voleibol", "Andebol", "Futebol"],
  groups: {
    Voleibol: { A: { teams: [], matches: [] }, B: { teams: [], matches: [] }, C: { teams: [], matches: [] }, D: { teams: [], matches: [] } },
    Andebol: { A: { teams: [], matches: [] }, B: { teams: [], matches: [] }, C: { teams: [], matches: [] }, D: { teams: [], matches: [] } },
    Futebol: { A: { teams: [], matches: [] }, B: { teams: [], matches: [] }, C: { teams: [], matches: [] }, D: { teams: [], matches: [] } }
  },
  finals: { Voleibol: [], Andebol: [], Futebol: [] }
};

export default function Page() {
  const [rawData, setRawData] = useState(initialTournament);
  const [modality, setModality] = useState("Voleibol");
  const [group, setGroup] = useState("A");
  const [tab, setTab] = useState("public");

  useEffect(() => {
    if (!supabase) return;
    const fetchState = async () => {
      const { data } = await supabase.from("app_state").select("payload").eq("id", STATE_ROW_ID).single();
      if (data?.payload) setRawData(data.payload);
    };
    fetchState();
  }, []);

  const activeMatches = rawData.groups[modality]?.[group]?.matches || [];

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-900">
      <div className="mx-auto max-w-md space-y-4">
        {/* Header */}
        <div className="bg-indigo-700 rounded-3xl p-6 text-white shadow-xl">
          <h1 className="text-2xl font-bold">Gata na Praia '26</h1>
          <p className="text-indigo-100 text-sm opacity-80">Resultados em tempo real</p>
        </div>

        {/* Tabs Simples */}
        <div className="flex bg-slate-200 p-1 rounded-2xl">
          <button onClick={() => setTab("public")} className={`flex-1 py-2 rounded-xl text-sm font-medium ${tab === "public" ? "bg-white shadow" : ""}`}>Público</button>
          <button onClick={() => setTab("admin")} className={`flex-1 py-2 rounded-xl text-sm font-medium ${tab === "admin" ? "bg-white shadow" : ""}`}>Admin</button>
        </div>

        {tab === "public" ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <select value={modality} onChange={(e) => setModality(e.target.value)} className="flex-1 p-3 rounded-xl border-slate-200 text-sm bg-white border outline-none shadow-sm">
                {rawData.modalities.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={group} onChange={(e) => setGroup(e.target.value)} className="w-24 p-3 rounded-xl border-slate-200 text-sm bg-white border outline-none shadow-sm">
                {["A", "B", "C", "D"].map(g => <option key={g} value={g}>Gr. {g}</option>)}
              </select>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
              <h2 className="font-bold flex items-center gap-2 text-indigo-700 uppercase text-xs tracking-wider">
                {modality} — Grupo {group}
              </h2>
              <div className="space-y-3">
                {activeMatches.length > 0 ? activeMatches.map((m, i) => (
                  <div key={i} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 truncate mr-2">{m.home || "TBD"}</span>
                      <span className="font-bold bg-slate-100 px-2 py-1 rounded-md min-w-[24px] text-center">{m.homeScore ?? "-"}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-slate-600 truncate mr-2">{m.away || "TBD"}</span>
                      <span className="font-bold bg-slate-100 px-2 py-1 rounded-md min-w-[24px] text-center">{m.awayScore ?? "-"}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-slate-400 text-sm py-4">Sem jogos agendados</p>
                )}
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 shadow-sm">
              <h2 className="font-bold flex items-center gap-2 text-amber-900 text-sm mb-3">
                <Trophy className="h-4 w-4" /> Fase Final
              </h2>
              <div className="space-y-2">
                {(rawData.finals[modality] || []).map((m, i) => (
                  <div key={i} className="flex justify-between text-xs border-b border-amber-100/50 pb-2 last:border-0">
                    <span className="text-amber-800/70">{m.stage}:</span>
                    <span className="font-semibold text-amber-900">{m.homeScore ? (Number(m.homeScore) > Number(m.awayScore) ? m.home : m.away) : "A definir"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
            <Lock className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <p className="text-slate-600 text-sm leading-relaxed">Área restrita à organização para atualização de resultados via Supabase.</p>
          </div>
        )}
      </div>
    </div>
  );
}