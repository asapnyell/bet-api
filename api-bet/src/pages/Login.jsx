import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmeter = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      alert('Por favor, insira um e-mail.');
      return;
    }

    const role = await login(email);

    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'player') {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-blue-600 mb-2">Bet Acadêmica</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Plataforma Simulada de Apostas Esportivas</p>

        <form onSubmit={handleSubmeter} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail de Acesso</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: jogador@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
          >
            Entrar no Sistema
          </button>
        </form>

        {/* Dica para o avaliador/professor */}
        <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-800 space-y-1">
          <p className="font-semibold mb-1">💡 Credenciais para Testes Fictícios:</p>
          <p>• <span className="font-mono bg-blue-100 px-1 rounded">admin@email.com</span> (Acesso Administrador)</p>
          <p>• <span className="font-mono bg-blue-100 px-1 rounded">jogador@email.com</span> (Acesso Jogador)</p>
        </div>
      </div>
    </div>
  );
}