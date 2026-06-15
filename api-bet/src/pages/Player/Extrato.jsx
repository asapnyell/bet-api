import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

export default function Extrato() {
  const { user } = useAuth();
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarExtrato() {
      try {
        // Busca as movimentações ordenando por data decrescente (funcionalidade nativa json-server)
        const response = await api.get(`/movimentacoes?usuarioId=${user.id}&_sort=data&_order=desc`);
        setMovimentacoes(response.data);
      } catch (error) {
        console.error("Erro ao carregar extrato financeiro:", error);
      } finally {
        setCarregando(false);
      }
    }

    if (user?.id) {
      carregarExtrato();
    }
  }, [user]);

  const formatarData = (isoString) => {
    return new Date(isoString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-800">📊 Extrato de Movimentações</h1>
          <p className="text-sm text-slate-500">Auditoria completa do seu fluxo de caixa simulado dentro da plataforma.</p>
        </div>

        {carregando ? (
          <div className="text-center p-12 text-slate-500">Carregando dados financeiros...</div>
        ) : movimentacoes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
            Nenhuma movimentação financeira registrada até o momento.
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider font-mono">
                    <th className="p-4">Data/Hora</th>
                    <th className="p-4">Descrição do Evento</th>
                    <th className="p-4 text-right">Valor Simulado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {movimentacoes.map((mov) => {
                    const isEntrada = mov.tipo === 'entrada';
                    return (
                      <tr key={mov.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 text-xs font-mono text-slate-400">
                          {formatarData(mov.data)}
                        </td>
                        <td className="p-4 font-medium text-slate-700">
                          {mov.descricao}
                        </td>
                        <td className={`p-4 text-right font-mono font-bold ${
                          isEntrada ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isEntrada ? '+ ' : '- '}R$ {mov.valor.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}