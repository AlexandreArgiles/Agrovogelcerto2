import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { Filter, MapPin, Search } from 'lucide-react';

import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const statusConfig = {
  pending: {
    label: 'Pendente',
    color: '#f59e0b',
    badge: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  approved: {
    label: 'Aprovada',
    color: '#16a34a',
    badge: 'bg-green-100 text-green-800 border-green-200'
  },
  refused: {
    label: 'Cancelada',
    color: '#ef4444',
    badge: 'bg-red-100 text-red-800 border-red-200'
  },
  completed: {
    label: 'Concluida',
    color: '#2563eb',
    badge: 'bg-blue-100 text-blue-800 border-blue-200'
  }
} as const;

const allStatuses = Object.keys(statusConfig) as Array<keyof typeof statusConfig>;

const clientIcon = L.divIcon({
  html: `<div style="width:18px;height:18px;border-radius:9999px;background:#0a5c36;border:3px solid #ffffff;box-shadow:0 8px 20px rgba(10,92,54,0.28);"></div>`,
  className: 'custom-map-pin',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

function createOrderIcon(status: keyof typeof statusConfig) {
  const config = statusConfig[status] || statusConfig.pending;
  return L.divIcon({
    html: `
      <div style="position:relative;width:22px;height:22px;">
        <div style="width:22px;height:22px;border-radius:9999px;background:${config.color};border:3px solid #ffffff;box-shadow:0 10px 24px rgba(15,23,42,0.22);"></div>
        <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:8px;height:8px;border-radius:9999px;background:#ffffff;"></div>
      </div>
    `,
    className: 'custom-map-pin',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    shadowUrl: iconShadow
  });
}

function normalizeText(value: string | null | undefined) {
  return (value || '').toLowerCase().trim();
}

function getOrderCoordinates(order: any): [number, number] | null {
  const latitude = order.latitude ?? order.client_latitude;
  const longitude = order.longitude ?? order.client_longitude;

  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return null;
  }

  return [Number(latitude), Number(longitude)];
}

function FitBounds({ points, enabled }: { points: Array<[number, number]>; enabled: boolean }) {
  const map = useMap();
  const hasAdjustedInitially = useRef(false);

  useEffect(() => {
    if (points.length === 0) return;
    if (!enabled && hasAdjustedInitially.current) return;

    hasAdjustedInitially.current = true;

    if (points.length === 1) {
      map.setView(points[0], 13, { animate: true });
      return;
    }

    map.fitBounds(points, {
      padding: [40, 40],
      animate: true
    });
  }, [enabled, map, points]);

  return null;
}

export const MapView = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['pending', 'approved', 'refused', 'completed']);
  const [showClients, setShowClients] = useState(true);
  const [showOrders, setShowOrders] = useState(true);
  const navigate = useNavigate();

  const normalizedSearchTerm = normalizeText(searchTerm);
  const numericSearchTerm = normalizedSearchTerm.replace(/\D/g, '');
  const shouldAutoFocus = numericSearchTerm.length >= 11 || /^#?\d+$/.test(normalizedSearchTerm) || normalizedSearchTerm.includes('@');

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

  const toggleStatus = (status: string) => {
    setSelectedStatuses((current) =>
      current.includes(status)
        ? current.filter((item) => item !== status)
        : [...current, status]
    );
  };

  const filteredOrders = orders.filter((os) => {
    const matchesStatus = selectedStatuses.includes(os.status);
    const matchesSearch =
      normalizeText(os.client_name).includes(normalizedSearchTerm) ||
      normalizeText(os.description).includes(normalizedSearchTerm) ||
      normalizeText(String(os.id)).includes(normalizedSearchTerm);
    const hasCoordinates = !!getOrderCoordinates(os);
    return matchesStatus && matchesSearch && hasCoordinates;
  });

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      normalizeText(client.name).includes(normalizedSearchTerm) ||
      normalizeText(client.email).includes(normalizedSearchTerm) ||
      normalizeText(client.cpf).includes(normalizedSearchTerm);
    const hasCoordinates = client.latitude !== null && client.latitude !== undefined && client.longitude !== null && client.longitude !== undefined;
    return matchesSearch && hasCoordinates;
  });

  const points: Array<[number, number]> = [
    ...(showOrders ? filteredOrders.map((os) => getOrderCoordinates(os)).filter(Boolean) as Array<[number, number]> : []),
    ...(showClients ? filteredClients.map((client) => [Number(client.latitude), Number(client.longitude)] as [number, number]) : [])
  ];

  const totalByStatus = {
    pending: orders.filter((os) => os.status === 'pending').length,
    approved: orders.filter((os) => os.status === 'approved').length,
    refused: orders.filter((os) => os.status === 'refused').length,
    completed: orders.filter((os) => os.status === 'completed').length
  };

  return (
    <div className="animate-in fade-in duration-500 h-full min-h-0 flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0a5c36]">Mapa Operacional</h1>
          <p className="text-gray-500 mt-1">Visualize clientes e ordens de servico com filtros rapidos por status.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full lg:w-auto">
          {allStatuses.map((status) => (
            <div key={status} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 min-w-[120px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: statusConfig[status].color }} />
                <span className="text-xs font-bold uppercase text-gray-500">{statusConfig[status].label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-2">{totalByStatus[status]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, descricao, CPF ou numero da OS"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-sm outline-none focus:border-[#8cc63f] focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
              <Filter size={16} />
              Filtros
            </span>
            <button
              onClick={() => setShowOrders((value) => !value)}
              className={`px-3 py-2 rounded-full text-sm font-bold border transition-colors ${showOrders ? 'bg-[#0a5c36] text-white border-[#0a5c36]' : 'bg-white text-gray-600 border-gray-200'}`}
            >
              OS
            </button>
            <button
              onClick={() => setShowClients((value) => !value)}
              className={`px-3 py-2 rounded-full text-sm font-bold border transition-colors ${showClients ? 'bg-[#8cc63f] text-[#0a5c36] border-[#8cc63f]' : 'bg-white text-gray-600 border-gray-200'}`}
            >
              Clientes
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {allStatuses.map((status) => {
            const active = selectedStatuses.includes(status);
            return (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className={`px-3 py-2 rounded-full border text-sm font-bold transition-all ${active ? statusConfig[status].badge : 'bg-white text-gray-500 border-gray-200'}`}
              >
                {statusConfig[status].label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#0a5c36]" />
            Clientes: {filteredClients.length}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-500" />
            Marcadores visiveis: {(showOrders ? filteredOrders.length : 0) + (showClients ? filteredClients.length : 0)}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 min-h-[560px] relative z-0">
        <MapContainer
          center={[-30.8833, -54.6667]}
          zoom={10}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds points={points.length > 0 ? points : [[-30.8833, -54.6667]]} enabled={shouldAutoFocus} />

          {showClients && filteredClients.map((client) => (
            <Marker
              key={`client-${client.id}`}
              position={[Number(client.latitude), Number(client.longitude)]}
              icon={clientIcon}
            >
              <Popup>
                <div className="p-1 min-w-[220px]">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={15} className="text-[#0a5c36]" />
                    <h3 className="font-bold text-[#0a5c36]">{client.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500">{client.email || 'Sem e-mail'}</p>
                  <p className="text-xs text-gray-500">{client.phone || 'Sem telefone'}</p>
                  {client.cpf && <p className="text-xs text-gray-500 mt-1">CPF: {client.cpf}</p>}
                </div>
              </Popup>
            </Marker>
          ))}

          {showOrders && filteredOrders.map((os) => {
            const status = (os.status in statusConfig ? os.status : 'pending') as keyof typeof statusConfig;
            const coordinates = getOrderCoordinates(os);
            if (!coordinates) return null;
            return (
              <Marker
                key={`os-${os.id}`}
                position={coordinates}
                icon={createOrderIcon(status)}
              >
                <Popup>
                  <div className="p-1 min-w-[240px]">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-bold text-[#0a5c36]">OS #{os.id}</h3>
                        <p className="text-sm font-medium">{os.client_name}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase border ${statusConfig[status].badge}`}>
                        {statusConfig[status].label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed">{os.description}</p>
                    <div className="space-y-1 text-xs text-gray-500">
                      {os.service_name && <p>Servico: {os.service_name}</p>}
                      {os.vehicle_name && <p>Veiculo: {os.vehicle_name}</p>}
                    </div>
                    <button
                      onClick={() => navigate(`/os/${os.id}`)}
                      className="mt-4 w-full bg-[#0a5c36] text-white text-xs font-bold py-2 rounded-lg hover:bg-[#0d7a48] transition-colors"
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
