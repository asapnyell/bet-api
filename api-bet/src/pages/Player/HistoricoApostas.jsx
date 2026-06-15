import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

export default function HistoricoApostas() {
  const { user, sincronizarPerfil } = useAuth();
  const [apostas, setApostas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarApostas() {
      await sincronizarPerfil(); // Sincroniza o perfil antes de carregar as apostas
      try {
        // O '_expand=evento' faz o JSON Server juntar os dados do evento na resposta
        const response = await api.get(`/apostas?usuarioId=${String(user.id)}&_expand=evento&_sort=dataAposta&_order=desc`);
        setApostas(response.data);
      } catch (error) {
        console.error("Erro ao buscar histórico de apostas:", error);
      } finally {
        setCarregando(false);
      }
    }

    if (user?.id) {
      carregarApostas();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-800">📋 Meus Palpites</h1>
          <p className="text-sm text-slate-500">Acompanhe o andamento e os resultados dos seus bilhetes esportivos simulados.</p>
        </div>

        {carregando ? (
          <div className="text-center p-12 text-slate-500">Carregando seus bilhetes...</div>
        ) : apostas.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
            Você ainda não realizou nenhuma aposta fictícia.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apostas.map((aposta) => {
              // Garante que o evento expandido existe antes de ler as propriedades
              const evento = aposta.evento || {};
              
              return (
                <div key={aposta.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  {/* Cabeçalho do Bilhete */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-3">
                    <div>
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                        {evento.esporte || 'Esporte'}
                      </span>
                      <h3 className="text-sm font-bold text-slate-800 mt-1">
                        {evento.timeCasa} × {evento.timeVisitante}
                      </h3>
                    </div>
                    
                    {/* Status Badge */}
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${
                      aposta.status === 'ganha' && 'bg-emerald-100 text-emerald-800'
                    } ${
                      aposta.status === 'perdida' && 'bg-rose-100 text-rose-800'
                    } ${
                      aposta.status === 'pendente' && 'bg-amber-100 text-amber-800'
                    }`}>
                      {aposta.status}
                    </span>
                  </div>

                  {/* Detalhes Financeiros Simulados */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-center text-xs border border-slate-100">
                    <div>
                      <span className="block text-[10px] text-slate-400">Palpite</span>
                      <span className="font-bold text-slate-700 capitalize">{aposta.palpite}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">Investido</span>
                      <span className="font-mono font-bold text-slate-700">R$ {aposta.valorApostado.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">Retorno Potencial</span>
                      <span className={`font-mono font-bold ${aposta.status === 'ganha' ? 'text-emerald-600' : 'text-slate-500'}`}>
                        R$ {aposta.retornoPossivel.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Rodapé do Bilhete */}
                  {aposta.status !== 'pendente' && (
                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs flex justify-between items-center text-slate-500">
                      <span>Resultado Real:</span>
                      <span className="font-bold uppercase text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-mono">
                        {evento.resultado}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}