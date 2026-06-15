import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaura o usuário logado ao recarregar a página
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('@BetAcademica:user');
    if (usuarioSalvo) {
      setUser(JSON.parse(usuarioSalvo));
    }
    setLoading(false);
  }, []);

  // Função de Login Simulada
  const login = async (email) => {
    try {
      const response = await api.get(`/usuarios?email=${email}`);
      if (response.data.length > 0) {
        const usuarioLogado = response.data[0];
        setUser(usuarioLogado);
        localStorage.setItem('@BetAcademica:user', JSON.stringify(usuarioLogado));
        return usuarioLogado.role; // Retorna o perfil para redirecionamento
      } else {
        throw new Error('Usuário não encontrado.');
      }
    } catch (error) {
      alert(error.message);
      return null;
    }
  };

  // Função de Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('@BetAcademica:user');
  };

  // Função para atualizar o saldo globalmente na aplicação
  const atualizarSaldo = (novoSaldo) => {
    setUser((prev) => {
      const usuarioAtualizado = { ...prev, saldo: novoSaldo };
      localStorage.setItem('@BetAcademica:user', JSON.stringify(usuarioAtualizado));
      return usuarioAtualizado;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, atualizarSaldo, authenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado para facilitar o uso do contexto nos componentes
export function useAuth() {
  return useContext(AuthContext);
}