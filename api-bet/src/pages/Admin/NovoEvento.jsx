import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';

export default function NovoEvento() {
  const navigate = useNavigate();
  const [esporte, setEsporte] = useState('Futebol');
  const [timeCasa, setTimeCasa] = useState('');
  const [timeVisitante, setTimeVisitante] = useState('');
  const [data, setData] = useState('');
  const [oddCasa, setOddCasa] = useState('');
  const [oddEmpate, setOddEmpate] = useState('');
  const [oddVisitante, setOddVisitante] = useState('');

  const handleSalvarEvento = async (e) => {
    e.preventDefault();

    if (!timeCasa || !timeVisitante || !data || !oddCasa || !oddEmpate || !oddVisitante) {
      alert('Por favor, preencha todos os campos do evento fictício.');
      return;
    }

    try {
      await api.post('/eventos', {
        esporte,
        timeCasa,
        timeVisitante,
        data: new Date(data).toISOString(),
        status: 'aberto',
        resultado: null,
        odds: {
          casa: Number(oddCasa),
          empate: Number(oddEmpate),
          visitante: Number(oddVisitante)
        }
      });

      alert('Evento esportivo cadastrado com sucesso!');
      navigate('/admin');
    } catch (error) {
      console.error('Erro ao cadastrar evento:', error);
      alert('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-800">➕ Cadastrar Evento Esportivo</h1>
          <p className="text-sm text-slate-500">Adicione novos confrontos e configure as cotações (odds) iniciais.</p>
        </div>

        <form onSubmit={handleSalvarEvento} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Modalidade</label>
              <select
                value={esporte}
                onChange={(e) => setEsporte(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="Futebol">Futebol</option>
                <option value="Basquete">Basquete</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Data e Hora</label>
              <input
                type="datetime-local"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Time da Casa</label>
              <input
                type="text"
                placeholder="Ex: Real Madrid"
                value={timeCasa}
                onChange={(e) => setTimeCasa(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Time Visitante</label>
              <input
                type="text"
                placeholder="Ex: Barcelona"
                value={timeVisitante}
                onChange={(e) => setTimeVisitante(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                required
              />
            </div>
          </div>

          <hr className="border-slate-100 my-2" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Definição das Odds Simuladas</p>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Vitória Casa</label>
              <input
                type="number"
                step="0.01"
                placeholder="1.85"
                value={oddCasa}
                onChange={(e) => setOddCasa(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Empate</label>
              <input
                type="number"
                step="0.01"
                placeholder="3.40"
                value={oddEmpate}
                onChange={(e) => setOddEmpate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Vitória Visitante</label>
              <input
                type="number"
                step="0.01"
                placeholder="4.20"
                value={oddVisitante}
                onChange={(e) => setOddVisitante(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium py-2 rounded-lg transition"
            >
              Voltar ao Painel
            </button>
            <button
              type="submit"
              className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition shadow-xs"
            >
              Salvar Evento
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}