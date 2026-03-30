"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Trophy, Wifi, Lock, LogOut, Plus, Save, X, Trash2, Edit3 
} from "lucide-react";

// --- CONFIGURAÇÃO SUPABASE ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const STATE_ROW_ID = "gata-na-praia-2026-official";

// --- COMPONENTES VISUAIS ESTILIZADOS ---
const Card = ({ children, className = "" }) => <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>{children}</div>;
const CardHeader = ({ children, className = "" }) => <div className={`p-4 border-b border-slate-50 flex justify-between items-center ${className}`}>{children}</div>;
const CardTitle = ({ children, className = "" }) => <h3 className={`font-bold text-slate-800 text-sm uppercase tracking-widest ${className}`}>{children}</h3>;
const CardContent = ({ children, className = "" }) => <div className={`p-4 ${className}`}>{children}</div>;
const Badge = ({ children, className = "" }) => <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 ${className}`}>{children}</span>;

export default function Page() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("public");
  const [modality, setModality] = useState("Voleibol");
  const [group, setGroup] = useState("A");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newMatch, setNewMatch] = useState({ home: "", away: "", stage: "Final" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  useEffect(() => {
    fetchData();
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => authListener.subscription.unsubscribe();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: res } = await supabase.from("app_state").select("payload").eq("id", STATE_ROW_ID).single();
    if (res) setData(res.payload);
    setLoading(false);
  }

  const saveAll = async (updatedData) => {
    setLoading(true);
    const { error } = await supabase.from("app_state").update({ payload: updatedData }).eq("id", STATE_ROW_ID);
    if (error) alert("Erro ao guardar: " + error.message);
    else {
        alert("Alterações publicadas com sucesso!");
        fetchData();
    }
  };

  const updateMatch = (matchId, field, value) => {
    const newData = JSON.parse(JSON.stringify(data));
    let match;
    if (group === "Finais") {
      match = newData.finals[modality].find(m => m.id === matchId);
    } else {
      match = newData.groups[modality][group].matches.find(m => m.id === matchId);
    }
    if (match) match[field] = value;
    setData(newData);
  };

  const addMatch = () => {
    const newData = JSON.parse(JSON.stringify(data));
    const id = `${modality[0]}-${group[0]}-${Date.now()}`;
    const matchToAdd = { ...newMatch, id, homeScore: "", awayScore: "" };
    
    if (group === "Finais") {
      newData.finals[modality].push(matchToAdd);
    } else {
      newData.groups[modality][group].matches.push(matchToAdd);
    }
    
    setData(newData);
    setShowAddModal(false);
    setNewMatch({ home: "", away: "", stage: group === "Finais" ? "Final" : "Ronda 1" });
  };

  const deleteMatch = (matchId) => {
    if (!confirm("Apagar este jogo?")) return;
    const newData = JSON.parse(JSON.stringify(data));
    if (group === "Finais") {
      newData.finals[modality] = newData.finals[modality].filter(m => m.id !== matchId);
    } else {
      newData.groups[modality][group].matches = newData.groups[modality][group].matches.filter(m => m.id !== matchId);
    }
    setData(newData);
  };

  if (!data) return <div className="p-10 text-center font-bold font-sans">A carregar torneio...</div>;

  const activeMatches = group === "Finais" 
    ? data.finals[modality] 
    : data.groups[modality]?.[group]?.matches || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      {/* HEADER DINÂMICO */}
      <div className="bg-indigo-700 p-8 pt-12 pb-10 text-white rounded-b-[40px] shadow-2xl mb-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 opacity-10 rotate-12"><Trophy size={180} /></div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <Badge className="bg-indigo-500/40 text-white border-none mb-2 tracking-widest">GATA NA PRAIA '26</Badge>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Resultados</h1>
          </div>
          {user && (
            <button onClick={() => supabase.auth.signOut()} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 space-y-6 max-w-md mx-auto">
        {/* TAB SWITCHER */}
        <div className="flex bg-slate-200/50 p-1.5 rounded-2xl">
          <button onClick={() => setTab("public")} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${tab === "public" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`}>PÚBLICO</button>
          <button onClick={() => setTab("admin")} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${tab === "admin" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`}>ADMIN</button>
        </div>

        {/* SELETORES DE FILTRO */}
        <div className="grid grid-cols-2 gap-3">
          <select value={modality} onChange={(e) => setModality(e.target.value)} className="bg-white p-4 rounded-2xl shadow-sm font-bold text-sm outline-none border-none ring-2 ring-transparent focus:ring-indigo-500 transition-all">
            {data.modalities.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={group} onChange={(e) => setGroup(e.target.value)} className="bg-white p-4 rounded-2xl shadow-sm font-bold text-sm outline-none border-none ring-2 ring-transparent focus:ring-indigo-500 transition-all">
            {["A", "B", "C", "D"].map(g => <option key={g} value={g}>Grupo {g}</option>)}
            <option value="Finais" className="text-indigo-600 font-bold">🏆 FINAIS</option>
          </select>
        </div>

        {tab === "public" ? (
          <Card>
            <CardHeader>
                <CardTitle>{modality} — {group === "Finais" ? "Fase Final" : `Grupo ${group}`}</CardTitle>
                <Wifi size={14} className="text-emerald-400 animate-pulse" />
            </CardHeader>
            <CardContent className="divide-y divide-slate-50">
              {activeMatches.length > 0 ? activeMatches.map(m => (
                <div key={m.id} className="py-5 first:pt-0 last:pb-0">
                  <div className="text-[10px] font-black text-indigo-400 uppercase mb-2 tracking-widest">{m.stage}</div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">{m.home}</span>
                    <span className="text-2xl font-black text-indigo-900">{m.homeScore || "0"}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-bold text-slate-700">{m.away}</span>
                    <span className="text-2xl font-black text-indigo-900">{m.awayScore || "0"}</span>
                  </div>
                </div>
              )) : <div className="text-center py-10 text-slate-400 text-sm italic font-medium">Nenhum jogo registado aqui.</div>}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {!user ? (
              <Card className="p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800"><Lock size={18} className="text-indigo-600"/> Acesso Reservado</h3>
                <input type="email" placeholder="Email" className="w-full p-4 rounded-xl bg-slate-50 border-none ring-2 ring-slate-100 focus:ring-indigo-500 outline-none mb-3 text-sm" onChange={e => setLoginForm({...loginForm, email: e.target.value})} />
                <input type="password" placeholder="Password" className="w-full p-4 rounded-xl bg-slate-50 border-none ring-2 ring-slate-100 focus:ring-indigo-500 outline-none mb-4 text-sm" onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
                <button onClick={() => supabase.auth.signInWithPassword(loginForm)} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-black shadow-lg shadow-indigo-100 active:scale-95 transition-all">ENTRAR</button>
              </Card>
            ) : (
              <>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddModal(true)} className="flex-[2] bg-white border-2 border-dashed border-slate-200 p-4 rounded-2xl flex items-center justify-center gap-2 text-slate-500 font-bold text-sm hover:border-indigo-300 hover:text-indigo-500 transition-all">
                    <Plus size={18} /> Novo Jogo ({group})
                  </button>
                  <button onClick={() => saveAll(data)} className="flex-1 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 active:scale-95 transition-all">
                    <Save size={18} /> PUBLICAR
                  </button>
                </div>

                <div className="space-y-3">
                  {activeMatches.map(m => (
                    <Card key={m.id} className="p-4 bg-white relative border-l-4 border-l-indigo-500">
                      <button onClick={() => deleteMatch(m.id)} className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Edit3 size={12} className="text-slate-400" />
                        <input value={m.stage} onChange={e => updateMatch(m.id, 'stage', e.target.value)} className="text-[10px] font-black text-indigo-500 uppercase bg-transparent w-full outline-none" placeholder="EX: FINAL" />
                      </div>

                      <div className="flex items-center gap-4 mb-3">
                        <input value={m.homeScore} onChange={e => updateMatch(m.id, 'homeScore', e.target.value)} className="w-12 h-12 text-center font-black bg-slate-50 rounded-xl ring-2 ring-slate-100 focus:ring-indigo-500 outline-none text-lg" placeholder="0" />
                        <input value={m.home} onChange={e => updateMatch(m.id, 'home', e.target.value)} className="text-sm font-bold text-slate-700 flex-1 bg-transparent border-b border-transparent focus:border-slate-100 outline-none" />
                      </div>
                      <div className="flex items-center gap-4">
                        <input value={m.awayScore} onChange={e => updateMatch(m.id, 'awayScore', e.target.value)} className="w-12 h-12 text-center font-black bg-slate-50 rounded-xl ring-2 ring-slate-100 focus:ring-indigo-500 outline-none text-lg" placeholder="0" />
                        <input value={m.away} onChange={e => updateMatch(m.id, 'away', e.target.value)} className="text-sm font-bold text-slate-700 flex-1 bg-transparent border-b border-transparent focus:border-slate-100 outline-none" />
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* MODAL PARA ADICIONAR JOGOS */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <h2 className="font-black text-2xl mb-6 tracking-tighter">Novo Jogo em {group}</h2>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">Fase / Ronda</label>
                <input value={newMatch.stage} onChange={e => setNewMatch({...newMatch, stage: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-2 ring-slate-100 focus:ring-indigo-500 outline-none mt-1 font-bold" placeholder="Ex: Meia-Final" />
              </div>
              <input value={newMatch.home} onChange={e => setNewMatch({...newMatch, home: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-2 ring-slate-100 focus:ring-indigo-500 outline-none font-bold" placeholder="Equipa Casa" />
              <input value={newMatch.away} onChange={e => setNewMatch({...newMatch, away: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-2 ring-slate-100 focus:ring-indigo-500 outline-none font-bold" placeholder="Equipa Visitante" />
              <button onClick={addMatch} className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black mt-2 shadow-xl shadow-indigo-100 active:scale-95 transition-all uppercase tracking-widest text-xs">Confirmar Jogo</button>
              <button onClick={() => setShowAddModal(false)} className="w-full text-slate-400 font-bold p-2 text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}