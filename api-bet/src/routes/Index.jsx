import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import HomeJogador from '../pages/Player/HomeJogador';
import Extrato from '../pages/Player/Extrato';
import HistoricoApostas from '../pages/Player/HistoricoApostas';
import DashboardAdmin from '../pages/Admin/DashboardAdmin';
import NovoEvento from '../pages/Admin/NovoEvento';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rota Pública */}
      <Route path="/" element={<Login />} />

      {/* Rotas Privadas do Jogador (Player) */}
      <Route path="/home" element={
        <ProtectedRoute allowedRole="player">
          <HomeJogador />
        </ProtectedRoute>
      } />
      <Route path="/extrato" element={
        <ProtectedRoute allowedRole="player">
          <Extrato />
        </ProtectedRoute>
      } />
      <Route path="/historico" element={
        <ProtectedRoute allowedRole="player">
          <HistoricoApostas />
        </ProtectedRoute>
      } />

      {/* Rotas Privadas do Administrador (Admin) */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRole="admin">
          <DashboardAdmin />
        </ProtectedRoute>
      } />
      <Route path="/admin/novo" element={
        <ProtectedRoute allowedRole="admin">
          <NovoEvento />
        </ProtectedRoute>
      } />

      {/* Rota de Fallback para caminhos inexistentes */}
      <Route path="*" element={<div className="p-8 text-center font-bold">Página não encontrada (404).</div>} />
    </Routes>
  );
}