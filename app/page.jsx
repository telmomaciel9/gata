"use client";
import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Trophy, Volleyball, Goal, Hand, Wifi, Lock, ChevronRight, RefreshCw } from "lucide-react";

// --- CONFIGURAÇÃO SUPABASE ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const STATE_ROW_ID = "gata-na-praia-2026-official";

// --- COMPONENTES SHADCN REPLICADOS (Para não dar erro de undefined) ---
const Card = ({ children, className = "" }) => <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>{children}</div>;
const CardHeader = ({ children, className = "" }) => <div className={`p-4 border-b border-slate-50 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = "" }) => <h3 className={`font-bold text-slate-800 ${className}`}>{children}</h3>;
const CardContent = ({ children, className = "" }) => <div className={`p-4 ${className}`}>{children}</div>;
const Badge = ({ children, className = "" }) => <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 ${className}`}>{children}</span>;

// --- COMPONENTE DE JOGO (O visual dos resultados) ---
const MatchCard = ({ match }) => (
  <div className="py-4 border-b border-slate-50 last:border-0">
    <div className="flex justify-between items-center mb-3">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{match.stage}</span>
    </div>
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-700">{match.home}</span>
        <span className="text-lg font-black text-indigo-900 bg-slate-50 w-8 h-8 flex items-center justify-center rounded-lg">{match.homeScore || "-"}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-700">{match.away}</span>
        <span className="text-lg font-black text-indigo-900 bg-slate-50 w-8 h-8 flex items-center justify-center rounded-lg">{match.awayScore || "-"}</span>
      </div>
    </div>
  </div>
);

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
    const channel = supabase.channel("live").on("postgres_changes", { event: "*", schema: "public", table: "app_state" }, fetchState).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const activeGroup = rawData.groups[modality]?.[group] || { teams: [], matches: [] };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="mx-auto max-w-md">
        {/* Banner Original */}
        <div className="bg-indigo-700 p-8 pt-12 pb-10 text-white rounded-b-[40px] shadow-2xl mb-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-10 rotate-12"><Trophy size={180} /></div>
          <Badge className="bg-indigo-500/40 text-indigo-50 border-none mb-2">Edição 2026</Badge>
          <h1 className="text-3xl font-black tracking-tight">Gata na Praia</h1>
          <div className="flex items-center gap-2 mt-4 text-indigo-100/80 text-xs font-bold uppercase tracking-widest">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Live Score
          </div>
        </div>

        <div className="px-4 space-y-6">
          {/* Navegação de Tabs */}
          <div className="flex bg-slate-200/50 p-1.5 rounded-2xl">
            <button onClick={() => setTab("public")} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${tab === "public" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`}>RESULTADOS</button>
            <button onClick={() => setTab("admin")} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${tab === "admin" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`}>ADMIN</button>
          </div>

          {tab === "public" ? (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="grid grid-cols-2 gap-3">
                <select value={modality} onChange={(e) => setModality(e.target.value)} className="bg-white p-4 rounded-2xl border-none shadow-sm text-sm font-bold outline-none ring-2 ring-transparent focus:ring-indigo-500 appearance-none">
                  {rawData.modalities.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={group} onChange={(e) => setGroup(e.target.value)} className="bg-white p-4 rounded-2xl border-none shadow-sm text-sm font-bold outline-none ring-2 ring-transparent focus:ring-indigo-500 appearance-none">
                  {["A", "B", "C", "D"].map(g => <option key={g} value={g}>Grupo {g}</option>)}
                </select>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xs uppercase tracking-widest text-slate-400">Jogos Recentes</CardTitle>
                  <RefreshCw size={14} className="text-indigo-400 animate-spin-slow" />
                </CardHeader>
                <CardContent>
                  {activeGroup.matches.length > 0 ? (
                    activeGroup.matches.map((m) => <MatchCard key={m.id} match={m} />)
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-sm italic">A aguardar sorteio...</div>
                  )}
                </CardContent>
              </Card>

              {/* Fase Final Simples */}
              <Card className="bg-indigo-900 border-none text-white shadow-indigo-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy className="text-amber-400" size={20} />
                    <span className="text-sm font-bold tracking-widest uppercase">Quadro de Honra</span>
                  </div>
                  <div className="space-y-3">
                    {["Meia-final", "Final"].map((s, i) => (
                      <div key={i} className="flex justify-between items-center text-xs border-b border-indigo-800/50 pb-2 last:border-0">
                        <span className="text-indigo-300">{s}</span>
                        <span className="font-bold">A definir</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="bg-white w-20 h-20 rounded-3xl shadow-sm flex items-center justify-center mx-auto ring-1 ring-slate-100">
                <Lock className="text-slate-300" size={32} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Área Reservada</h3>
                <p className="text-xs text-slate-500 mt-2 px-12 leading-relaxed">Utiliza o painel do Supabase para atualizar os scores. O site atualizará automaticamente para todos os utilizadores.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}