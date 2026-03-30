"use client";
import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Trophy, Volleyball, Goal, Hand, Wifi, Lock, LogOut, RefreshCw, Save } from "lucide-react";

// --- CONFIGURAÇÃO SUPABASE ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const STATE_ROW_ID = "gata-na-praia-2026-official";

// --- COMPONENTES VISUAIS ---
const Card = ({ children, className = "" }) => <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>{children}</div>;
const Badge = ({ children, className = "" }) => <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 ${className}`}>{children}</span>;

export default function Page() {
  const [rawData, setRawData] = useState(null);
  const [user, setUser] = useState(null);
  const [modality, setModality] = useState("Voleibol");
  const [group, setGroup] = useState("A");
  const [tab, setTab] = useState("public");
  const [loading, setLoading] = useState(true);
  
  // Estados para Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Carregar dados e verificar sessão
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      const { data } = await supabase.from("app_state").select("payload").eq("id", STATE_ROW_ID).single();
      if (data) setRawData(data.payload);
      setLoading(false);
    };
    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // Função para salvar alterações
  const updateScore = async (matchId, field, value) => {
    const newData = { ...rawData };
    // Procura o jogo nos grupos
    Object.keys(newData.groups).forEach(m => {
      Object.keys(newData.groups[m]).forEach(g => {
        newData.groups[m][g].matches = newData.groups[m][g].matches.map(match => 
          match.id === matchId ? { ...match, [field]: value } : match
        );
      });
    });
    setRawData(newData);
  };

  const saveToSupabase = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("app_state")
      .update({ payload: rawData })
      .eq("id", STATE_ROW_ID);
    
    if (error) alert("Erro ao salvar: " + error.message);
    else alert("Resultados publicados com sucesso!");
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Erro: " + error.message);
  };

  if (!rawData) return <div className="p-10 text-center">A carregar torneio...</div>;

  const activeMatches = rawData.groups[modality]?.[group]?.matches || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <div className="mx-auto max-w-md">
        {/* Banner */}
        <div className="bg-indigo-700 p-8 pt-12 pb-10 text-white rounded-b-[40px] shadow-2xl mb-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-10"><Trophy size={180} /></div>
          <div className="flex justify-between items-start">
            <div>
              <Badge className="bg-indigo-500/40 text-white border-none mb-2">Gata na Praia '26</Badge>
              <h1 className="text-3xl font-black">Live Scores</h1>
            </div>
            {user && (
              <button onClick={() => supabase.auth.signOut()} className="p-2 bg-white/10 rounded-full">
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="px-4 space-y-6">
          {/* Navegação */}
          <div className="flex bg-slate-200/50 p-1.5 rounded-2xl">
            <button onClick={() => setTab("public")} className={`flex-1 py-3 rounded-xl text-xs font-bold ${tab === "public" ? "bg-white shadow-sm text-indigo-700" : "text-slate-500"}`}>PUBLICO</button>
            <button onClick={() => setTab("admin")} className={`flex-1 py-3 rounded-xl text-xs font-bold ${tab === "admin" ? "bg-white shadow-sm text-indigo-700" : "text-slate-500"}`}>ADMIN</button>
          </div>

          {tab === "public" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <select value={modality} onChange={(e) => setModality(e.target.value)} className="bg-white p-4 rounded-2xl shadow-sm font-bold text-sm outline-none appearance-none">
                  {rawData.modalities.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={group} onChange={(e) => setGroup(e.target.value)} className="bg-white p-4 rounded-2xl shadow-sm font-bold text-sm outline-none appearance-none">
                  {["A", "B", "C", "D"].map(g => <option key={g} value={g}>Grupo {g}</option>)}
                </select>
              </div>

              <Card className="p-4">
                <div className="flex justify-between mb-4 border-b pb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{modality} - {group}</span>
                  <Wifi size={14} className="text-emerald-500" />
                </div>
                {activeMatches.map((m) => (
                  <div key={m.id} className="py-4 border-b last:border-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-slate-700">{m.home}</span>
                      <span className="text-xl font-black text-indigo-900">{m.homeScore || "0"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-700">{m.away}</span>
                      <span className="text-xl font-black text-indigo-900">{m.awayScore || "0"}</span>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              {!user ? (
                <Card className="p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><Lock size={18}/> Login Admin</h3>
                  <form onSubmit={handleLogin} className="space-y-3">
                    <input type="email" placeholder="Email" className="w-full p-3 rounded-xl bg-slate-50 border text-sm" onChange={e => setEmail(e.target.value)} />
                    <input type="password" placeholder="Password" className="w-full p-3 rounded-xl bg-slate-50 border text-sm" onChange={e => setPassword(e.target.value)} />
                    <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold">Entrar</button>
                  </form>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex justify-between items-center">
                    <span className="text-emerald-800 text-xs font-bold italic">Modo Edição Ativo</span>
                    <button onClick={saveToSupabase} disabled={loading} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                      <Save size={14} /> {loading ? "A guardar..." : "PUBLICAR"}
                    </button>
                  </div>
                  
                  <Card className="p-4 space-y-6">
                    {activeMatches.map((m) => (
                      <div key={m.id} className="space-y-3 p-3 bg-slate-50 rounded-xl">
                        <div className="text-[10px] font-bold text-slate-400">{m.stage}</div>
                        <div className="flex items-center gap-3">
                          <input 
                            value={m.homeScore} 
                            onChange={(e) => updateScore(m.id, 'homeScore', e.target.value)}
                            className="w-12 p-2 text-center font-black rounded-lg border-2 border-indigo-100"
                            placeholder="0"
                          />
                          <span className="text-sm font-bold text-slate-600 flex-1">{m.home}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input 
                            value={m.awayScore} 
                            onChange={(e) => updateScore(m.id, 'awayScore', e.target.value)}
                            className="w-12 p-2 text-center font-black rounded-lg border-2 border-indigo-100"
                            placeholder="0"
                          />
                          <span className="text-sm font-bold text-slate-600 flex-1">{m.away}</span>
                        </div>
                      </div>
                    ))}
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}