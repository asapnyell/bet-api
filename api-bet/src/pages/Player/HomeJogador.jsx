import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import CardEvento from '../../components/CardEvento';

export default function HomeJogador() {
  const [eventos, setEventos] = useState([]);
  const [esporteSelecionado, setEsporteSelecionado] = useState('Todos');
  
  // Estados para o controle do Modal de Aposta
  const { user, atualizarSaldo } = useAuth();
  const [modalAberto, setModalAberto] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [palpiteSelecionado, setPalpiteSelecionado] = useState('');
  const [oddSelecionada, setOddSelecionada] = useState(0);
  const [valorApostado, setValorApostado] = useState('');

  useEffect(() => {
    async function carregarEventos() {
      try {
        const response = await api.get('/eventos?status=aberto');
        setEventos(response.data);
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
      }
    }
    carregarEventos();
  }, []);

  const categoriasEsportivas = ['Todos', 'Futebol', 'Basquete'];

  const eventosFiltrados = esporteSelecionado === 'Todos'
    ? eventos
    : eventos.filter(evt => evt.esporte.toLowerCase() === esporteSelecionado.toLowerCase());

  // Gatilho disparado ao clicar em uma Odd no CardEvento
  const handleAbrirModalAposta = (evento, palpite, odd) => {
    setEventoSelecionado(evento);
    setPalpiteSelecionado(palpite);
    setOddSelecionada(odd);
    setValorApostado('');
    setModalAberto(true);
  };

  // Cálculo de retorno potencial em tempo real
  const retornoPossivel = valorApostado > 0 ? (Number(valorApostado) * oddSelecionada).toFixed(2) : '0.00';

  // Processamento da Aposta Fictícia (Regra de Negócio Central)
  const handleConfirmarAposta = async (e) => {
    e.preventDefault();
    const valor = Number(valorApostado);

    if (!valor || valor <= 0) {
      alert('Insira um valor válido para apostar.');
      return;
    }

    if (valor > user.saldo) {
      alert('Saldo insuficiente para realizar esta aposta fictícia.');
      return;
    }

    try {
      // 1. Registra a aposta na coleção /apostas
      await api.post('/apostas', {
        usuarioId: user.id,
        eventoId: eventoSelecionado.id,
        palpite: palpiteSelecionado,
        valorApostado: valor,
        retornoPossivel: Number(retornoPossivel),
        status: 'pendente',
        dataAposta: new Date().toISOString()
      });

      // 2. Deduz o saldo do usuário via PATCH
      const novoSaldo = user.saldo - valor;
      await api.patch(`/usuarios/${user.id}`, { saldo: novoSaldo });

      // 3. Registra a transação no Extrato (/movimentacoes) - Funcionalidade Extra
      await api.post('/movimentacoes', {
        usuarioId: user.id,
        tipo: 'saida',
        descricao: `Aposta Efetuada: ${eventoSelecionado.timeCasa} x ${eventoSelecionado.timeVisitante} (${palpiteSelecionado.toUpperCase()})`,
        valor: valor,
        data: new Date().toISOString()
      });

      // 4. Sincroniza o estado global da aplicação
      atualizarSaldo(novoSaldo);
      
      setModalAberto(false);
      alert('Aposta realizada com sucesso!');
    } catch (error) {
      console.error('Erro ao processar transações da aposta:', error);
      alert('Houve um erro técnico ao processar a operação.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800">⚽ Eventos em Destaque</h1>
            <p className="text-sm text-slate-500">Escolha um esporte e faça seu palpite simulado.</p>
          </div>

          <div className="flex items-center gap-2 bg-white p-1.5 border border-slate-200 rounded-xl self-start">
            {categoriasEsportivas.map(esporte => (
              <button
                key={esporte}
                onClick={() => setEsporteSelecionado(esporte)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  esporteSelecionado === esporte ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {esporte}
              </button>
            ))}
          </div>
        </div>

        {eventosFiltrados.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 font-medium">
            Nenhum evento de {esporteSelecionado} aberto para apostas no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosFiltrados.map(evento => (
              <CardEvento key={evento.id} evento={evento} onApostar={handleAbrirModalAposta} />
            ))}
          </div>
        )}
      </main>

      {/* MODAL DE CONFIRMAÇÃO DE APOSTA (Design Limpo com Tailwind v4) */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-black text-slate-900 mb-1">Confirmar Palpite Fictício</h2>
            <p className="text-xs text-slate-500 mb-4">
              {eventoSelecionado?.timeCasa} <span className="font-bold text-blue-600">x</span> {eventoSelecionado?.timeVisitante}
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 text-xs space-y-1.5">
              <p className="text-slate-600">Seu Palpite: <span className="font-bold text-slate-900 capitalize">{palpiteSelecionado}</span></p>
              <p className="text-slate-600">Odd do Evento: <span className="font-mono font-bold text-slate-900">{oddSelecionada.toFixed(2)}</span></p>
            </div>

            <form onSubmit={handleConfirmarAposta} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Valor do Palpite (R$)</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={valorApostado}
                  onChange={(e) => setValorApostado(e.target.value)}
                  placeholder="Ex: 50"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex justify-between items-center text-sm">
                <span className="text-emerald-800 font-medium">Retorno Possível:</span>
                <span className="text-emerald-700 font-mono font-bold">R$ {retornoPossivel}</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition shadow-xs"
                >
                  Confirmar Aposta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}