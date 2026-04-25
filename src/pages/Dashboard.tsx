import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
// Quitamos iconos que ya no usamos aquí y dejamos solo los necesarios
import { Users, QrCode, Search, UserPlus } from 'lucide-react';

import AddPadreModal from '../components/AddPadreModal';
import GeneradorQR from '../components/GeneradorQR';
import GestionPadres from '../components/GestionPadres';
import Sidebar from '../components/Sidebar'; // ← Importamos el Sidebar

export default function Dashboard() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vistaActiva, setVistaActiva] = useState<'RESUMEN' | 'PADRES' | 'QRS'>('RESUMEN');
  const [stats, setStats] = useState({ totalPadres: 0, totalAlumnos: 0 });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    };
    getUser();
    fetchStats(); 
  }, []);

  const fetchStats = async () => {
    const { count: countPadres } = await supabase.from('Padres').select('*', { count: 'exact', head: true });
    const { count: countAlumnos } = await supabase.from('Alumnos').select('*', { count: 'exact', head: true });
    
    setStats({ 
      totalPadres: countPadres || 0, 
      totalAlumnos: countAlumnos || 0 
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleSavePadre = () => {
    fetchStats();
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      
      {/* ¡Aquí inyectamos el Sidebar y le pasamos los datos que necesita! */}
      <Sidebar 
        vistaActiva={vistaActiva} 
        setVistaActiva={setVistaActiva} 
        onLogout={handleLogout} 
      />

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col">
        
        {/* Header Superior */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/30">
          <div className="relative w-96 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar rápido..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm"
            >
              <UserPlus size={18} />
              <span className="hidden sm:inline">Registrar Familia</span>
            </button>
            <div className="h-8 w-[1px] bg-slate-800 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-500">Administrador</p>
                <p className="text-sm font-medium text-white">{userEmail?.split('@')[0]}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center font-bold text-white uppercase">
                {userEmail?.[0] || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Navegación para Móviles */}
        <nav className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex gap-2 overflow-x-auto">
            <button onClick={() => setVistaActiva('RESUMEN')} className={`px-4 py-2 rounded-lg whitespace-nowrap ${vistaActiva === 'RESUMEN' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Inicio</button>
            <button onClick={() => setVistaActiva('PADRES')} className={`px-4 py-2 rounded-lg whitespace-nowrap ${vistaActiva === 'PADRES' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Padres</button>
            <button onClick={() => setVistaActiva('QRS')} className={`px-4 py-2 rounded-lg whitespace-nowrap ${vistaActiva === 'QRS' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>QRs</button>
        </nav>

        {/* Carga de Componentes Dinámicos */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {vistaActiva === 'RESUMEN' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-white">Panel de Control</h1>
                <p className="text-slate-400 mt-1">Resumen general de la base de datos</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="text-blue-500" size={24} />
                  </div>
                  <p className="text-4xl font-bold text-white">{stats.totalPadres}</p>
                  <p className="text-sm text-slate-400 mt-1">Apoderados Registrados</p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="text-emerald-500" size={24} />
                  </div>
                  <p className="text-4xl font-bold text-white">{stats.totalAlumnos}</p>
                  <p className="text-sm text-slate-400 mt-1">Estudiantes en el sistema</p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl opacity-60">
                  <div className="flex items-center justify-between mb-4">
                    <QrCode className="text-amber-500" size={24} />
                    <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded">Próximamente</span>
                  </div>
                  <p className="text-4xl font-bold text-white">0</p>
                  <p className="text-sm text-slate-400 mt-1">Asistencias Escaneadas</p>
                </div>
              </div>
            </div>
          )}

          {vistaActiva === 'PADRES' && <GestionPadres />}
          {vistaActiva === 'QRS' && <GeneradorQR />}

        </div>
      </main>

      <AddPadreModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSavePadre} 
      />
    </div>
  );
}