import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSair = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-slate-900 text-white shadow-md px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
      {/* Logo / Título */}
      <div className="flex items-center gap-2">
        <span className="text-xl font-black tracking-wider text-blue-400">BET</span>
        <span className="text-xl font-bold text-slate-100">ACADÊMICA</span>
        <span className="bg-slate-800 text-xs px-2 py-0.5 rounded-full text-slate-400 font-mono">v4</span>
      </div>

      {/* Links de Navegação Dinâmicos */}
      <div className="flex items-center gap-6 text-sm font-medium">
        {user?.role === 'player' && (
          <>
            <Link to="/home" className="hover:text-blue-400 transition">Eventos</Link>
            <Link to="/historico" className="hover:text-blue-400 transition">Minhas Apostas</Link>
            <Link to="/extrato" className="hover:text-blue-400 transition text-emerald-400">📊 Extrato</Link>
          </>
        )}
        {user?.role === 'admin' && (
          <>
            <Link to="/admin" className="hover:text-blue-400 transition">Painel Admin</Link>
            <Link to="/admin/novo" className="hover:text-blue-400 transition text-blue-400">+ Novo Evento</Link>
          </>
        )}
      </div>

      {/* Informações do Usuário e Logout */}
      <div className="flex items-center gap-4">
        {user?.role === 'player' && (
          <div className="bg-slate-800 px-4 py-1.5 rounded-xl border border-slate-700 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Saldo Disponível</p>
            <p className="text-emerald-400 font-bold font-mono">
              R$ {user.saldo?.toFixed(2)}
            </p>
          </div>
        )}

        <div className="text-right hidden md:block">
          <p className="text-xs text-slate-400">Olá, <span className="font-semibold text-white">{user?.nome}</span></p>
          <p className="text-[10px] text-slate-500 capitalize font-mono">{user?.role}</p>
        </div>

        <button
          onClick={handleSair}
          className="bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-rose-500/30 transition-all duration-200"
        >
          Sair
        </button>
      </div>
    </nav>
  );
}