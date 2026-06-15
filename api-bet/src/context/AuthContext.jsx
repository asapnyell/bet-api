import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('@BetAcademica:user');
    if (usuarioSalvo) {
      setUser(JSON.parse(usuarioSalvo));
    }
    setLoading(false);
  }, []);

  const login = async (email) => {
    try {
      const response = await api.get(`/usuarios?email=${email}`);
      if (response.data.length > 0) {
        const usuarioLogado = response.data[0];
        setUser(usuarioLogado);
        localStorage.setItem('@BetAcademica:user', JSON.stringify(usuarioLogado));
        return usuarioLogado.role;
      } else {
        throw new Error('Usuário não encontrado.');
      }
    } catch (error) {
      alert(error.message);
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('@BetAcademica:user');
  };

  const atualizarSaldo = (novoSaldo) => {
    setUser((prev) => {
      const usuarioAtualizado = { ...prev, saldo: novoSaldo };
      localStorage.setItem('@BetAcademica:user', JSON.stringify(usuarioAtualizado));
      return usuarioAtualizado;
    });
  };

  // 🔥 NOVA FUNÇÃO: Busca o saldo real e atualizado direto do JSON Server
  const sincronizarPerfil = async () => {
    const usuarioSalvo = localStorage.getItem('@BetAcademica:user');
    if (!usuarioSalvo) return;
    
    const parsedUser = JSON.parse(usuarioSalvo);
    try {
      const response = await api.get(`/usuarios/${parsedUser.id}`);
      setUser(response.data);
      localStorage.setItem('@BetAcademica:user', JSON.stringify(response.data));
    } catch (error) {
      console.error("Erro ao sincronizar dados do banco:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      atualizarSaldo, 
      sincronizarPerfil, // <-- Exportando a nova função
      authenticated: !!user, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}