import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, 
  Users, 
  QrCode, 
  Settings, 
  LogOut, 
  Search,
  Bell,
  UserPlus
} from 'lucide-react';

import AddPadreModal from '../components/AddPadreModal';
import GeneradorQR from '../components/GeneradorQR';   // ← Importante

export default function Dashboard() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vistaActiva, setVistaActiva] = useState<'RESUMEN' | 'QRS'>('RESUMEN');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleSavePadre = () => {
    console.log('Familia registrada correctamente');
    // Aquí podrás recargar listas en el futuro
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">A</div>
            APAFA Panel
          </h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-xl">
            <LayoutDashboard size={20} />
            <span className="font-medium">Inicio</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-all">
            <Users size={20} />
            <span className="font-medium">Padres</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-all">
            <QrCode size={20} />
            <span className="font-medium">Asistencia QR</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-all">
            <Settings size={20} />
            <span className="font-medium">Configuración</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col">
        
        {/* Header con búsqueda y usuario */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/30">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar padre o estudiante..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-800 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-500">Administrador</p>
                <p className="text-sm font-medium text-white">{userEmail?.split('@')[0]}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center font-bold text-white uppercase">
                {userEmail?.[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Navegación de Pestañas */}
        <nav className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center">
          <div className="flex gap-4">
            <button 
              onClick={() => setVistaActiva('RESUMEN')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium ${
                vistaActiva === 'RESUMEN' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Users size={20} />
              Resumen General
            </button>
            
            <button 
              onClick={() => setVistaActiva('QRS')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium ${
                vistaActiva === 'QRS' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <QrCode size={20} />
              Gestión de QRs
            </button>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all"
          >
            <UserPlus size={18} />
            Registrar Familia
          </button>
        </nav>

        {/* Contenido según la pestaña activa */}
        <div className="flex-1 overflow-y-auto p-8">
          {vistaActiva === 'RESUMEN' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-white">Panel de Control</h1>
                <p className="text-slate-400 mt-1">Resumen general de la asamblea actual</p>
              </div>

              {/* Tarjetas de estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Total Padres', value: '450', icon: Users, color: 'text-blue-500' },
                  { label: 'Presentes hoy', value: '124', icon: QrCode, color: 'text-emerald-500' },
                  { label: 'Pendientes', value: '326', icon: Bell, color: 'text-amber-500' },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <stat.icon className={stat.color} size={24} />
                      <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded">Hoy</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Tabla de últimos registros */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-white">Últimos Registros</h3>
                  <button className="text-sm text-blue-400 hover:underline">Ver todos</button>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-800/30 text-slate-400 text-sm uppercase">
                    <tr>
                      <th className="px-6 py-4 font-medium">Nombre del Padre</th>
                      <th className="px-6 py-4 font-medium">DNI</th>
                      <th className="px-6 py-4 font-medium">Estado</th>
                      <th className="px-6 py-4 font-medium text-right">Hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {[1, 2, 3].map((_, i) => (
                      <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">Padre de Familia {i+1}</td>
                        <td className="px-6 py-4 text-slate-400">7065432{i}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-xs rounded-full font-medium">Presente</span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-right">08:45 AM</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {vistaActiva === 'QRS' && (
            <div>
              <GeneradorQR />
            </div>
          )}
        </div>
      </main>

      {/* Modal de Registrar Familia */}
      <AddPadreModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSavePadre} 
      />
    </div>
  );
}