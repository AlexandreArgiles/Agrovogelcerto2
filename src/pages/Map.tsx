import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

// Correção para o ícone padrão do Leaflet no React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export const MapView = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [showCompleted, setShowCompleted] = useState(false); // ESTADO DO FILTRO
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [osRes, clientsRes] = await Promise.all([
        axios.get('/api/os'),
        axios.get('/api/clients')
      ]);
      setOrders(osRes.data);
      setClients(clientsRes.data);
    } catch (error) {
      console.error('Erro ao buscar dados do mapa', error);
    }
  };

  // Filtra as OS para esconder as concluídas, a menos que o toggle esteja ativo
  const filteredOrders = orders.filter(os => 
    showCompleted ? true : os.status !== 'completed'
  );

  return (
    <div className="animate-in fade-in duration-500 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0a5c36]">Mapa Operacional</h1>
          <p className="text-gray-500 mt-1">Visão geral de clientes e Ordens de Serviço</p>
        </div>
        
        {/* Toggle para mostrar/esconder OS concluídas */}
        <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Mostrar Concluídas</span>
          <button 
            onClick={() => setShowCompleted(!showCompleted)}
            className={`w-12 h-6 rounded-full transition-colors relative ${showCompleted ? 'bg-[#8cc63f]' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${showCompleted ? 'transform translate-x-6' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 relative z-0">
        <MapContainer 
          center={[-30.8833, -54.6667]} // Centro padrão (ajuste se necessário para a sua região principal)
          zoom={10} 
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Marcadores de Ordens de Serviço */}
          {filteredOrders.map(os => {
            if (!os.latitude || !os.longitude) return null;
            return (
              <Marker key={`os-${os.id}`} position={[os.latitude, os.longitude]}>
                <Popup>
                  <div className="p-1">
                    <h3 className="font-bold text-[#0a5c36] mb-1">OS #{os.id}</h3>
                    <p className="text-sm font-medium">{os.client_name}</p>
                    <p className="text-xs text-gray-500 mt-1 mb-2 line-clamp-2">{os.description}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      os.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {os.status === 'completed' ? 'Concluída' : 'Em Aberto'}
                    </span>
                    <button 
                      onClick={() => navigate(`/os/${os.id}`)}
                      className="mt-3 w-full bg-[#0a5c36] text-white text-xs font-bold py-1.5 rounded hover:bg-[#0d7a48] transition-colors"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        </MapContainer>
      </div>
    </div>
  );
};