import { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import CardEvento from '../../components/CardEvento';

export default function HomeJogador() {
  const [eventos, setEventos] = useState([]);
  const [esporteSelecionado, setEsporteSelecionado] = useState('Todos');

  useEffect(() => {
    async function carregarEventos() {
      try {
        // Traz apenas eventos abertos para apostar
        const response = await api.get('/eventos?status=aberto');
        setEventos(response.data);
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
      }
    }
    carregarEventos();
  }, []);

  // Opções do filtro por esporte
  const categoriasEsportivas = ['Todos', 'Futebol', 'Basquete'];

  // Aplicação do Filtro via código (Clean Code)
  const eventosFiltrados = esporteSelecionado === 'Todos'
    ? eventos
    : eventos.filter(evt => evt.esporte.toLowerCase() === esporteSelecionado.toLowerCase());

  // Função provisória para o clique de aposta (vamos detalhar o fluxo financeiro no próximo commit)
  const handleAbrirModalAposta = (evento, palpite, odd) => {
    alert(`Palpite selecionado: ${palpite} no evento ${evento.timeCasa} x ${evento.timeVisitante} (Odd: ${odd})`);
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

          {/* Filtro por Esporte - Funcionalidade Extra Obrigatoria */}
          <div className="flex items-center gap-2 bg-white p-1.5 border border-slate-200 rounded-xl self-start">
            {categoriasEsportivas.map(esporte => (
              <button
                key={esporte}
                onClick={() => setEsporteSelecionado(esporte)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  esporteSelecionado === esporte
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {esporte}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Renderização */}
        {eventosFiltrados.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 font-medium">
            Nenhum evento de {esporteSelecionado} aberto para apostas no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosFiltrados.map(evento => (
              <CardEvento 
                key={evento.id} 
                evento={evento} 
                onApostar={handleAbrirModalAposta} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}