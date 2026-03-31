import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { OSList } from './pages/OSList';
import { OSDetails } from './pages/OSDetails';
import { ClientList } from './pages/ClientList';
import { ServiceList } from './pages/ServiceList';
import { Finance } from './pages/Finance';
import { TechnicianList } from './pages/TechnicianList';
import { VehicleList } from './pages/VehicleList'; // <-- Importação dos Técnicos
import { MapView } from './pages/Map';
import { ChangePassword } from './pages/ChangePassword';
import { UserList } from './pages/UserList';
import { Stock } from './pages/Stock';



const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.force_password_change) return <Navigate to="/change-password" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/os" element={<OSList />} />
        <Route path="/os/:id" element={<OSDetails />} />
        <Route path="/clients" element={<ClientList />} />
        <Route path="/services" element={<ServiceList />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/technicians" element={<TechnicianList />} /> {/* <-- Rota dos Técnicos */}
        <Route path="/vehicles" element={<VehicleList />} /> {/* <-- Rota dos Veículos */}
        <Route path="/map" element={<MapView />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/users" element={<UserList />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
