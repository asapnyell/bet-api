import { Calendar, Trophy } from 'lucide-react'; // Opcional, ou use emojis se preferir

export default function CardEvento({ evento, onApostar }) {
  const formatarData = (isoString) => {
    return new Date(isoString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between">
      {/* Cabeçalho do Card */}
      <div className="flex justify-between items-center mb-4">
        <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md">
          {evento.esporte}
        </span>
        <span className={`text-xs font-bold font-mono uppercase px-2 py-0.5 rounded ${
          evento.status === 'aberto' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
        }`}>
          {evento.status}
        </span>
      </div>

      {/* Confronte / Times */}
      <div className="text-center my-2">
        <p className="text-md font-bold text-slate-800">{evento.timeCasa}</p>
        <span className="text-xs text-slate-400 font-semibold my-1 block">VS</span>
        <p className="text-md font-bold text-slate-800">{evento.timeVisitante}</p>
      </div>

      <hr className="my-4 border-slate-100" />

      {/* Data do Evento */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 justify-center">
        <span>📅 {formatarData(evento.data)}</span>
      </div>

      {/* Seção de Odds / Botão de Aposta */}
      {evento.status === 'aberto' && onApostar && (
        <div className="space-y-3">
          <p className="text-[11px] text-center font-bold text-slate-400 uppercase tracking-wider">Odds Disponíveis</p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <button 
              onClick={() => onApostar(evento, 'casa', evento.odds.casa)}
              className="bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 rounded-lg p-2 transition font-mono"
            >
              <span className="block text-[10px] text-slate-400 font-sans">Casa</span>
              <strong>{evento.odds.casa.toFixed(2)}</strong>
            </button>
            <button 
              onClick={() => onApostar(evento, 'empate', evento.odds.empate)}
              className="bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 rounded-lg p-2 transition font-mono"
            >
              <span className="block text-[10px] text-slate-400 font-sans">Empate</span>
              <strong>{evento.odds.empate.toFixed(2)}</strong>
            </button>
            <button 
              onClick={() => onApostar(evento, 'visitante', evento.odds.visitante)}
              className="bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 rounded-lg p-2 transition font-mono"
            >
              <span className="block text-[10px] text-slate-400 font-sans">Visitante</span>
              <strong>{evento.odds.visitante.toFixed(2)}</strong>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}