import { QRCodeCanvas } from 'qrcode.react';
import { Download, Search, Filter, AlertCircle } from 'lucide-react';
import { useGeneradorQR } from '../hooks/useGeneradorQR';

const NIVELES = ['INICIAL', 'PRIMARIA', 'SECUNDARIA'];

const GRADOS_POR_NIVEL: Record<string, string[]> = {
  'INICIAL': ['3 años', '4 años', '5 años'], 
  'PRIMARIA': ['PRIMERO', 'SEGUNDO', 'TERCERO', 'CUARTO', 'QUINTO', 'SEXTO'],
  'SECUNDARIA': ['PRIMERO', 'SEGUNDO', 'TERCERO', 'CUARTO', 'QUINTO']
};

const SECCIONES_POR_NIVEL: Record<string, string[]> = {
  'PRIMARIA': ['A', 'B', 'C', 'D', 'E', 'F'],
  'SECUNDARIA': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
};

export default function PadresQR() {
  const {
    alumnos, alumnosFiltrados, loading, errorDb, searchTerm, setSearchTerm,
    nivel, setNivel, grado, setGrado, seccion, setSeccion,
    buscarQRs, downloadQR
  } = useGeneradorQR();

  return (
    <div className="space-y-8 w-full">
      <div>
        <h1 className="text-3xl font-bold text-white">Generador de QRs</h1>
        <p className="text-slate-400">Emite los carnets digitales por grado y sección</p>
      </div>

      {/* PANEL DE FILTROS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-end shadow-lg">
        <div className="w-full md:w-1/4">
          <label className="block text-sm font-medium text-slate-400 mb-1">Nivel</label>
          <select 
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
            value={nivel}
            onChange={(e) => { setNivel(e.target.value); setGrado(''); setSeccion(''); }}
          >
            <option value="">Seleccione...</option>
            {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div className="w-full md:w-1/4">
          <label className="block text-sm font-medium text-slate-400 mb-1">{nivel === 'INICIAL' ? 'Año' : 'Grado'}</label>
          <select 
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white disabled:opacity-30"
            value={grado}
            disabled={!nivel}
            onChange={(e) => setGrado(e.target.value)}
          >
            <option value="">Seleccione...</option>
            {nivel && GRADOS_POR_NIVEL[nivel]?.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="w-full md:w-1/4">
          <label className="block text-sm font-medium text-slate-400 mb-1">Sección</label>
          {nivel === 'INICIAL' ? (
            <input 
              type="text" 
              placeholder="Ej: Solidarios..." 
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
              value={seccion}
              onChange={(e) => setSeccion(e.target.value)}
            />
          ) : (
            <select 
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white disabled:opacity-30"
              value={seccion}
              disabled={!nivel}
              onChange={(e) => setSeccion(e.target.value)}
            >
              <option value="">Seleccione...</option>
              {nivel && SECCIONES_POR_NIVEL[nivel]?.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>

        <button 
          onClick={buscarQRs}
          disabled={loading}
          className="w-full md:w-1/4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 h-[46px]"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Filter size={18} />}
          {loading ? 'Buscando...' : 'Obtener QRs'}
        </button>
      </div>

      {errorDb && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
          {errorDb}
        </div>
      )}

      {alumnos.length > 0 && (
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Filtrar resultados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alumnosFiltrados.map((alumno) => {
          // Corrección: Verificación estricta para evitar errores de tipo
          const tienePadre = alumno.Padres !== null && alumno.Padres !== undefined && !!alumno.Padres.UUID_QR;
          const dniPadre = alumno.DNI_Asociado || '';

          return (
            <div key={alumno.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center">
              
              <div className="bg-white p-4 rounded-2xl mb-4 h-[190px] w-[190px] flex items-center justify-center shadow-lg">
                {tienePadre && alumno.Padres ? (
                  <QRCodeCanvas 
                    id={`qr-${dniPadre}`}
                    value={alumno.Padres.UUID_QR} 
                    size={160}
                    level={"H"}
                  />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center">
                    <AlertCircle size={40} className="text-amber-500 mb-2 opacity-50" />
                    <span className="text-[10px] font-black uppercase text-amber-600">Padre no vinculado</span>
                  </div>
                )}
              </div>

              <div className="w-full bg-slate-800/40 rounded-xl p-3 mb-4 border border-slate-700/50">
                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">Estudiante</p>
                <p className="font-bold text-white text-sm line-clamp-1">{alumno.Nombres_Alumno}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {alumno.Nivel} • {alumno.Grado} "{alumno.Seccion || '-'}"
                </p>
              </div>

              <h3 className={`font-bold text-lg mb-0.5 ${tienePadre ? 'text-white' : 'text-amber-500/70'}`}>
                {tienePadre && alumno.Padres ? alumno.Padres.Nombres : "Pendiente"}
              </h3>
              <p className="text-slate-500 mb-6 text-xs">DNI: {dniPadre || '---'}</p>

              <button 
                onClick={() => tienePadre && alumno.Padres && downloadQR(dniPadre, alumno.Padres.Nombres, alumno.Nombres_Alumno)}
                disabled={!tienePadre}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
                  tienePadre 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20' 
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Download size={18} />
                {tienePadre ? 'Descargar QR' : 'Bloqueado'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}