import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  QrCode, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

interface SidebarProps {
  vistaActiva: 'RESUMEN' | 'PADRES' | 'QRS';
  setVistaActiva: (vista: 'RESUMEN' | 'PADRES' | 'QRS') => void;
  onLogout: () => void;
}

export default function Sidebar({ vistaActiva, setVistaActiva, onLogout }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <aside 
      // Aquí está el truco para que se quede fijo: sticky top-0 h-screen
      className={`relative top-0 h-screen border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl hidden md:flex flex-col transition-all duration-300 ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      {/* BOTÓN FLOTANTE AL MEDIO DEL BORDE */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white p-1 rounded-full border-4 border-slate-950 z-50 transition-colors shadow-lg"
      >
        {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* SECCIÓN SUPERIOR: Logo */}
      <div className="h-16 flex items-center justify-center border-b border-slate-800 px-4">
        <div className="flex items-center gap-2 overflow-hidden w-full">
          <div className="min-w-[32px] h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">A</div>
          {isExpanded && <span className="text-xl font-bold text-white tracking-wide">APAFA</span>}
        </div>
      </div>
      
      {/* NAVEGACIÓN */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
        <button 
          onClick={() => setVistaActiva('RESUMEN')}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
            vistaActiva === 'RESUMEN' ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
          } ${!isExpanded && 'justify-center'}`}
          title="Inicio"
        >
          <LayoutDashboard size={20} className="min-w-[20px]" />
          {isExpanded && <span className="font-medium">Inicio</span>}
        </button>
        
        <button 
          onClick={() => setVistaActiva('PADRES')}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
            vistaActiva === 'PADRES' ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
          } ${!isExpanded && 'justify-center'}`}
          title="Directorio Padres"
        >
          <Users size={20} className="min-w-[20px]" />
          {isExpanded && <span className="font-medium">Directorio</span>}
        </button>

        <button 
          onClick={() => setVistaActiva('QRS')}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
            vistaActiva === 'QRS' ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
          } ${!isExpanded && 'justify-center'}`}
          title="Asignar Aulas (QRs)"
        >
          <QrCode size={20} className="min-w-[20px]" />
          {isExpanded && <span className="font-medium whitespace-nowrap">Asignar Aulas</span>}
        </button>

        <button 
          className={`w-full flex items-center gap-3 p-3 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-all opacity-50 cursor-not-allowed ${
            !isExpanded && 'justify-center'
          }`}
          title="Configuración"
        >
          <Settings size={20} className="min-w-[20px]" />
          {isExpanded && <span className="font-medium">Configuración</span>}
        </button>
      </nav>

      {/* SECCIÓN INFERIOR: Cerrar Sesión (De vuelta al fondo) */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className={`w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all ${
            !isExpanded && 'justify-center'
          }`}
          title="Cerrar Sesión"
        >
          <LogOut size={20} className="min-w-[20px]" />
          {isExpanded && <span className="font-medium">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}