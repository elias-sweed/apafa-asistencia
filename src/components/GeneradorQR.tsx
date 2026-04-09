import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { supabase } from '../lib/supabase';
import { Download, Search, Filter, AlertCircle } from 'lucide-react';

interface Padre {
  DNI_Asociado: string;
  Nombres: string;
  Telefono: string | null;
  UUID_QR: string;
}

interface Alumno {
  id: number;
  DNI_Estudiante: string | null;
  Nombres_Alumno: string;
  Nivel: string;
  Grado: string;
  Seccion: string;
  DNI_Asociado: string | null;
  Padres: Padre | null;
}

const NIVELES = ['INICIAL', 'PRIMARIA', 'SECUNDARIA'];

// Ajustado para que coincida mejor con tu CSV, aunque ahora la búsqueda es inmune a mayúsculas/minúsculas
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
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorDb, setErrorDb] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [nivel, setNivel] = useState('');
  const [grado, setGrado] = useState('');
  const [seccion, setSeccion] = useState('');

  const buscarQRs = async () => {
    if (!nivel || !grado) {
      setErrorDb('Por favor selecciona al menos el Nivel y el Grado/Año.');
      return;
    }
    
    // Si no es inicial, la sección es obligatoria.
    if (nivel !== 'INICIAL' && !seccion) {
      setErrorDb('Por favor selecciona la Sección.');
      return;
    }

    setLoading(true);
    setErrorDb(null);

    // USAMOS .ilike() PARA QUE NO IMPORTE SI HAY MAYÚSCULAS O MINÚSCULAS
    let query = supabase
      .from('Alumnos')
      .select(`
        *,
        Padres (
          DNI_Asociado,
          Nombres,
          UUID_QR
        )
      `)
      .ilike('Nivel', nivel)
      .ilike('Grado', grado);

    // Si escribieron o seleccionaron una sección, la buscamos de forma flexible
    if (seccion) {
      query = query.ilike('Seccion', `%${seccion}%`); 
    }

    const { data, error } = await query;

    if (error) {
      setErrorDb(error.message);
    } else if (data) {
      setAlumnos(data as unknown as Alumno[]);
      if (data.length === 0) {
        setErrorDb('No se encontraron alumnos con esos datos. Verifica que el grado y sección existan.');
      }
    }
    
    setLoading(false);
  };

  const downloadQR = (dni: string, nombrePadre: string, nombreHijo: string) => {
    const canvas = document.getElementById(`qr-${dni}`) as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `QR_${nombrePadre.replace(/\s+/g, '_')}_Hijo_${nombreHijo.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const alumnosFiltrados = alumnos.filter(alumno => 
    alumno.Nombres_Alumno.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (alumno.Padres?.Nombres || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (alumno.DNI_Asociado || '').includes(searchTerm)
  );

  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Generador de QRs</h1>
          <p className="text-slate-400">Filtra por salón o año para no sobrecargar el sistema</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/4">
          <label className="block text-sm font-medium text-slate-400 mb-1">Nivel</label>
          <select 
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={nivel}
            onChange={(e) => {
              setNivel(e.target.value);
              setGrado('');
              setSeccion('');
            }}
          >
            <option value="">Seleccione...</option>
            {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div className="w-full md:w-1/4">
          <label className="block text-sm font-medium text-slate-400 mb-1">
            {nivel === 'INICIAL' ? 'Año' : 'Grado'}
          </label>
          <select 
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={grado}
            disabled={!nivel}
            onChange={(e) => setGrado(e.target.value)}
          >
            <option value="">Seleccione...</option>
            {nivel && GRADOS_POR_NIVEL[nivel]?.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* LÓGICA DINÁMICA DE SECCIÓN */}
        {nivel === 'INICIAL' ? (
          <div className="w-full md:w-1/4">
            <label className="block text-sm font-medium text-slate-400 mb-1">Nombre del Aula (Opcional)</label>
            <input 
              type="text" 
              placeholder="Ej: Solidarios..." 
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={seccion}
              onChange={(e) => setSeccion(e.target.value)}
            />
          </div>
        ) : (
          <div className="w-full md:w-1/4">
            <label className="block text-sm font-medium text-slate-400 mb-1">Sección</label>
            <select 
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={seccion}
              disabled={!nivel}
              onChange={(e) => setSeccion(e.target.value)}
            >
              <option value="">Seleccione...</option>
              {nivel && SECCIONES_POR_NIVEL[nivel]?.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        <button 
          onClick={buscarQRs}
          disabled={loading}
          className="w-full md:w-1/4 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 h-[42px]"
        >
          <Filter size={18} />
          {loading ? 'Buscando...' : 'Buscar QRs'}
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
            placeholder="Buscar por nombre o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alumnosFiltrados.map((alumno) => {
          // Evaluamos si el alumno tiene un padre vinculado
          const tienePadre = alumno.Padres && alumno.Padres.UUID_QR;

          return (
            <div key={alumno.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center">
              
              {/* ZONA DEL QR */}
              <div className="bg-white p-4 rounded-xl mb-4 h-[182px] w-[182px] flex items-center justify-center">
                {tienePadre ? (
                  <QRCodeCanvas 
                    id={`qr-${alumno.DNI_Asociado}`}
                    value={alumno.Padres!.UUID_QR} 
                    size={150}
                    level={"H"}
                    includeMargin={false}
                  />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center">
                    <AlertCircle size={32} className="text-amber-500 mb-2" />
                    <span className="text-xs font-bold">Sin QR</span>
                    <span className="text-[10px] text-slate-500 mt-1">Falta registrar Padre</span>
                  </div>
                )}
              </div>

              {/* DATOS DEL ESTUDIANTE */}
              <div className="w-full bg-slate-800/50 rounded-lg p-3 mb-4">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Estudiante</p>
                <p className="font-medium text-white text-sm">{alumno.Nombres_Alumno}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {alumno.Nivel} - {alumno.Grado} {alumno.Seccion ? `"${alumno.Seccion}"` : ''}
                </p>
              </div>

              {/* DATOS DEL PADRE */}
              <h3 className={`font-bold text-lg mb-1 ${tienePadre ? 'text-blue-400' : 'text-amber-500'}`}>
                {tienePadre ? alumno.Padres!.Nombres : "Padre No Registrado"}
              </h3>
              <p className="text-slate-400 mb-6 text-sm">DNI Apoderado: {alumno.DNI_Asociado || 'No asignado'}</p>

              <button 
                onClick={() => tienePadre && downloadQR(alumno.DNI_Asociado as string, alumno.Padres!.Nombres, alumno.Nombres_Alumno)}
                disabled={!tienePadre}
                className={`w-full flex items-center justify-center gap-2 text-white py-2 px-4 rounded-xl font-medium transition-all ${
                  tienePadre 
                    ? 'bg-blue-600 hover:bg-blue-500 cursor-pointer' 
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Download size={18} />
                {tienePadre ? 'Descargar QR' : 'No disponible'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}