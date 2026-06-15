import { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';

export default function DashboardAdmin() {
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Estados para gerenciar a conclusão do evento
  const [eventoParaEncerrar, setEventoParaEncerrar] = useState(null);
  const [resultadoEscolhido, setResultadoEscolhido] = useState('');

  const carregarTodosEventos = async () => {
    try {
      const response = await api.get('/eventos');
      setEventos(response.data);
    } catch (error) {
      console.error('Erro ao ler painel de eventos:', error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarTodosEventos();
  }, []);

  // LÓGICA COMPLEXA: Liquidação de Apostas em Cascata no Frontend
  const handleLiquidarEvento = async (e) => {
    e.preventDefault();
    if (!resultadoEscolhido) return alert('Escolha o resultado real do confronto.');

    const evtId = eventoParaEncerrar.id;

    try {
      // 1. Atualiza o status do evento para encerrado e grava o resultado
      await api.patch(`/eventos/${evtId}`, {
        status: 'encerrado',
        resultado: resultadoEscolhido
      });

      // 2. Coleta todas as apostas feitas especificamente para este evento
      const responseApostas = await api.get(`/apostas?eventoId=${evtId}`);
      const apostasViculadas = responseApostas.data;

      // 3. Processa cada aposta de forma sequencial controlada
      for (const aposta of apostasViculadas) {
        const venceu = aposta.palpite === resultadoEscolhido;
        const novoStatus = venceu ? 'ganha' : 'perdida';

        // Atualiza o bilhete do usuário
        await api.patch(`/apostas/${aposta.id}`, { status: novoStatus });

        // Se o usuário venceu o palpite fictício, paga o prêmio
        if (venceu) {
          // Busca os dados atualizados do usuário para não sobrescrever saldo desatualizado
          const responseUser = await api.get(`/usuarios/${aposta.usuarioId}`);
          const jogador = responseUser.data;

          const saldoComPremio = jogador.saldo + aposta.retornoPossivel;

          // Atualiza saldo do jogador
          await api.patch(`/usuarios/${jogador.id}`, { saldo: saldoComPremio });

          // Cria a movimentação de entrada no Extrato dele (Funcionalidade Extra)
          await api.post('/movimentacoes', {
            usuarioId: jogador.id,
            tipo: 'entrada',
            descricao: `Prêmio Recebido! Vitória no evento: ${eventoParaEncerrar.timeCasa} x ${eventoParaEncerrar.timeVisitante}`,
            valor: aposta.retornoPossivel,
            data: new Date().toISOString()
          });
        }
      }

      alert('Evento liquidado e saldos atualizados com sucesso!');
      setEventoParaEncerrar(null);
      setResultadoEscolhido('');
      carregarTodosEventos(); // Atualiza a tela do admin
    } catch (error) {
      console.error('Erro ao processar o encerramento em cascata:', error);
      alert('Falha na sincronização dos dados ao encerrar partida.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-800">⚙️ Painel do Administrador</h1>
            <p className="text-sm text-slate-500">Controle total sobre abertura, fechamento e auditoria dos jogos.</p>
          </div>
        </div>

        {carregando ? (
          <div className="text-center p-12 text-slate-500">Carregando gerência...</div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider font-mono">
                  <th className="p-4">Esporte</th>
                  <th className="p-4">Confronto</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Resultado Real</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {eventos.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 font-semibold text-xs text-blue-600">{evt.esporte}</td>
                    <td className="p-4 font-bold">{evt.timeCasa} × {evt.timeVisitante}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        evt.status === 'aberto' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {evt.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold uppercase text-slate-500">
                      {evt.resultado || '—'}
                    </td>
                    <td className="p-4 text-center">
                      {evt.status === 'aberto' ? (
                        <button
                          onClick={() => setEventoParaEncerrar(evt)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-xs"
                        >
                          Encerrar & Informar Resultado
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Concluído</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* MODAL DE DEFINIÇÃO DE RESULTADO */}
      {eventoParaEncerrar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h2 className="text-lg font-black text-slate-900 mb-1">Encerrar Confronto</h2>
            <p className="text-xs text-slate-500 mb-4">
              Defina quem foi o vencedor real de <span className="font-bold text-slate-800">{eventoParaEncerrar.timeCasa} x {eventoParaEncerrar.timeVisitante}</span>.
            </p>

            <form onSubmit={handleLiquidarEvento} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Resultado Final do Jogo</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setResultadoEscolhido('casa')}
                    className={`p-3 border rounded-xl text-xs font-bold transition flex flex-col items-center ${
                      resultadoEscolhido === 'casa' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>Vitória</span>
                    <span className="text-[10px] font-normal text-slate-400 truncate">{eventoParaEncerrar.timeCasa}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultadoEscolhido('empate')}
                    className={`p-3 border rounded-xl text-xs font-bold transition flex flex-col items-center ${
                      resultadoEscolhido === 'empate' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>Empate</span>
                    <span className="text-[10px] font-normal text-slate-400">—</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultadoEscolhido('visitante')}
                    className={`p-3 border rounded-xl text-xs font-bold transition flex flex-col items-center ${
                      resultadoEscolhido === 'visitante' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>Vitória</span>
                    <span className="text-[10px] font-normal text-slate-400 truncate">{eventoParaEncerrar.timeVisitante}</span>
                  </button>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-800 leading-relaxed">
                ⚠️ <strong>Atenção:</strong> Esta ação atualizará imediatamente o status de todos os bilhetes associados a este jogo e transferirá os prêmios simulados para os vencedores.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setEventoParaEncerrar(null); setResultadoEscolhido(''); }}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium py-2 rounded-lg transition shadow-xs"
                >
                  Confirmar e Pagar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}