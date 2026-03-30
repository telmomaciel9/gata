"use client";
import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Trophy, Volleyball, Goal, Hand, Medal, Wifi, Lock, LogOut, RefreshCw, ChevronRight } from "lucide-react";

// --- COMPONENTES VISUAIS (Substitutos do Shadcn para não dar erro) ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>{children}</div>
);
const CardHeader = ({ children, className = "" }) => <div className={`p-4 border-b border-slate-50 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = "" }) => <h3 className={`font-bold text-slate-800 ${className}`}>{children}</h3>;
const CardContent = ({ children, className = "" }) => <div className={`p-4 ${className}`}>{children}</div>;

const Button = ({ children, onClick, variant = "primary", className = "", disabled }) => {
  const base = "px-4 py-2 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100";
  const styles = variant === "primary" ? "bg-indigo-600 text-white shadow-indigo-200 shadow-lg" : "bg-slate-100 text-slate-700";
  return <button onClick={onClick} disabled={disabled} className={`${base} ${styles} ${className}`}>{children}</button>;
};

const Badge = ({ children, className = "" }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 ${className}`}>{children}</span>
);

// --- CONFIGURAÇÃO SUPABASE ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const STATE_ROW_ID = "gata-na-praia-2026-official";

// --- DADOS DO TORNEIO (O teu código original daqui para baixo) ---
const initialTournament = {
  modalities: ["Voleibol", "Andebol", "Futebol"],
  groups: {
    Voleibol: {
      A: {
        teams: ["24 - all cool", "12 - Mamas Industriais", "5 - A Ganza está na Areia", "6 - Fistoum", "9 - Reabilitação cancelada", "19 - Sede Máxima"],
        matches: [
          { id: "VB-A-J1", stage: "Grupo A", home: "5 - A Ganza está na Areia", away: "6 - Fistoum", homeScore: "", awayScore: "" },
          { id: "VB-A-J2", stage: "Grupo A", home: "9 - Reabilitação cancelada", away: "19 - Sede Máxima", homeScore: "", awayScore: "" },
          { id: "VB-A-SF1", stage: "Grupo A", home: "24 - all cool", away: "WIN:VB-A-J1", homeScore: "", awayScore: "" },
          { id: "VB-A-SF2", stage: "Grupo A", home: "12 - Mamas Industriais", away: "WIN:VB-A-J2", homeScore: "", awayScore: "" },
          { id: "VB-A-F", stage: "Grupo A", home: "WIN:VB-A-SF1", away: "WIN:VB-A-SF2", homeScore: "", awayScore: "" },
        ],
      },
      B: { teams: ["1 - Atirei o pau à gata", "10 - O João é um fdp", "15 - Trupe dos Lambões", "16 - Boyca and company"], matches: [] },
      C: { teams: [], matches: [] },
      D: { teams: [], matches: [] }
    },
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

  const activeGroup = rawData.groups[modality]?.[group] || { teams: [], matches: [] };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <div className="mx-auto max-w-md">
        {/* Banner Superior igual ao original */}
        <div className="bg-indigo-700 p-8 pt-12 pb-10 text-white rounded-b-[40px] shadow-2xl mb-6 relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] opacity-10"><Trophy size={150} /></div>
          <Badge className="bg-indigo-500/30 text-indigo-100 mb-2 border-none">Gata na Praia '26</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">Resultados Online</h1>
          <div className="flex items-center gap-2 mt-4 text-indigo-100/80 text-xs">
            <Wifi size={14} className="text-emerald-400" /> Atualização em tempo real ativa
          </div>
        </div>

        <div className="px-4 space-y-6">
          {/* Tabs Simuladas */}
          <div className="flex bg-slate-200/50 p-1.5 rounded-2xl mb-6">
            <button onClick={() => setTab("public")} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "public" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`}>Resultados</button>
            <button onClick={() => setTab("admin")} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "admin" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`}>Administração</button>
          </div>

          {tab === "public" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <select value={modality} onChange={(e) => setModality(e.target.value)} className="bg-white p-4 rounded-2xl border-none shadow-sm text-sm font-bold outline-none ring-2 ring-transparent focus:ring-indigo-500 transition-all appearance-none">
                  {rawData.modalities.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={group} onChange={(e) => setGroup(e.target.value)} className="bg-white p-4 rounded-2xl border-none shadow-sm text-sm font-bold outline-none ring-2 ring-transparent focus:ring-indigo-500 transition-all appearance-none">
                  {["A", "B", "C", "D"].map(g => <option key={g} value={g}>Grupo {g}</option>)}
                </select>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm uppercase tracking-widest text-slate-400 font-black">Jogos do Grupo</CardTitle>
                  <Volleyball size={18} className="text-indigo-600" />
                </CardHeader>
                <CardContent className="divide-y divide-slate-50">
                  {activeGroup.matches.length > 0 ? activeGroup.matches.map((m) => (
                    <div key={m.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{m.stage}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-slate-700">{m.home}</span>
                            <span className="text-lg font-black text-indigo-900">{m.homeScore || "-"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-slate-700">{m.away}</span>
                            <span className="text-lg font-black text-indigo-900">{m.awayScore || "-"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="py-10 text-center text-slate-400 text-sm">Sem jogos para este grupo.</div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="py-10 text-center">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-800">Acesso Restrito</h3>
              <p className="text-sm text-slate-500 mt-2 px-10">A gestão de resultados é feita através do painel do Supabase ou login autorizado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}