import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, X } from 'lucide-react';

interface NewRegistro {
  DNI_Asociado: string;
  Nombres_Padre: string;
  Telefono: string;
  DNI_Estudiante: string;
  Nombres_Alumno: string;
  Nivel: string;
  Grado: string;
  Seccion: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const GRADOS_POR_NIVEL: Record<string, string[]> = {
  'INICIAL': ['3 AÑOS', '4 AÑOS', '5 AÑOS'],
  'PRIMARIA': ['PRIMERO', 'SEGUNDO', 'TERCERO', 'CUARTO', 'QUINTO', 'SEXTO'],
  'SECUNDARIA': ['PRIMERO', 'SEGUNDO', 'TERCERO', 'CUARTO', 'QUINTO']
};

const SECCIONES_POR_NIVEL: Record<string, string[]> = {
  'INICIAL': ['A', 'B', 'C', 'D'],
  'PRIMARIA': ['A', 'B', 'C', 'D', 'E', 'F'],
  'SECUNDARIA': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
};

export default function AddPadreModal({ isOpen, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<NewRegistro>({
    DNI_Asociado: '', 
    Nombres_Padre: '', 
    Telefono: '',
    DNI_Estudiante: '', 
    Nombres_Alumno: '', 
    Nivel: 'PRIMARIA', 
    Grado: 'PRIMERO', 
    Seccion: 'A'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función actualizada para manejar el cambio de Nivel
  const handleNivelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoNivel = e.target.value;
    setFormData({
      ...formData,
      Nivel: nuevoNivel,
      Grado: GRADOS_POR_NIVEL[nuevoNivel][0],
      Seccion: nuevoNivel === 'INICIAL' ? '' : SECCIONES_POR_NIVEL[nuevoNivel][0]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: padreError } = await supabase
      .from('Padres')
      .upsert({ 
        DNI_Asociado: formData.DNI_Asociado, 
        Nombres: formData.Nombres_Padre, 
        Telefono: formData.Telefono || null,
      }, { onConflict: 'DNI_Asociado' });

    if (padreError) {
      setError(`Error guardando al padre: ${padreError.message}`);
      setLoading(false);
      return;
    }

    const { error: alumnoError } = await supabase
      .from('Alumnos')
      .insert([{
        DNI_Estudiante: formData.DNI_Estudiante || null,
        Nombres_Alumno: formData.Nombres_Alumno,
        Nivel: formData.Nivel,
        Grado: formData.Grado,
        Seccion: formData.Seccion,
        DNI_Asociado: formData.DNI_Asociado
      }]);

    if (alumnoError) {
      setError(`Error guardando al alumno: ${alumnoError.message}`);
    } else {
      // Resetear formulario
      setFormData({
        DNI_Asociado: '', 
        Nombres_Padre: '', 
        Telefono: '',
        DNI_Estudiante: '', 
        Nombres_Alumno: '', 
        Nivel: 'PRIMARIA', 
        Grado: 'PRIMERO', 
        Seccion: 'A'
      });
      onSave();
      onClose();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-8 relative shadow-2xl my-8">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <UserPlus className="text-blue-500" />
          Registrar Familia
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* COLUMNA PADRE */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-400 border-b border-slate-800 pb-2">
                1. Datos del Padre/Apoderado
              </h3>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">DNI del Apoderado</label>
                <input 
                  type="text" 
                  required 
                  maxLength={8} 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.DNI_Asociado} 
                  onChange={(e) => setFormData({...formData, DNI_Asociado: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nombres Completos</label>
                <input 
                  type="text" 
                  required 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.Nombres_Padre} 
                  onChange={(e) => setFormData({...formData, Nombres_Padre: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Teléfono</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.Telefono} 
                  onChange={(e) => setFormData({...formData, Telefono: e.target.value})} 
                />
              </div>
            </div>

            {/* COLUMNA ALUMNO */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-emerald-400 border-b border-slate-800 pb-2">
                2. Datos del Estudiante
              </h3>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nombres del Estudiante</label>
                <input 
                  type="text" 
                  required 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.Nombres_Alumno} 
                  onChange={(e) => setFormData({...formData, Nombres_Alumno: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">DNI Estudiante (Opcional)</label>
                <input 
                  type="text" 
                  maxLength={8} 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.DNI_Estudiante} 
                  onChange={(e) => setFormData({...formData, DNI_Estudiante: e.target.value})} 
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Nivel</label>
                  <select 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.Nivel} 
                    onChange={handleNivelChange}
                  >
                    <option value="INICIAL">Inicial</option>
                    <option value="PRIMARIA">Primaria</option>
                    <option value="SECUNDARIA">Secundaria</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {formData.Nivel === 'INICIAL' ? 'Año' : 'Grado'}
                  </label>
                  <select 
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.Grado} 
                    onChange={(e) => setFormData({...formData, Grado: e.target.value})}
                  >
                    {GRADOS_POR_NIVEL[formData.Nivel]?.map(grado => (
                      <option key={grado} value={grado}>{grado}</option>
                    ))}
                  </select>
                </div>

                {/* Campo de Sección / Nombre del Aula - MODIFICADO */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {formData.Nivel === 'INICIAL' ? 'Nombre del Aula' : 'Sección'}
                  </label>
                  {formData.Nivel === 'INICIAL' ? (
                    <input 
                      type="text" 
                      required 
                      placeholder="Ej: Ositos" 
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.Seccion} 
                      onChange={(e) => setFormData({...formData, Seccion: e.target.value.toUpperCase()})} 
                    />
                  ) : (
                    <select 
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.Seccion} 
                      onChange={(e) => setFormData({...formData, Seccion: e.target.value})}
                    >
                      {SECCIONES_POR_NIVEL[formData.Nivel]?.map(seccion => (
                        <option key={seccion} value={seccion}>{seccion}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-4 rounded-xl transition-all mt-6 text-lg"
          >
            {loading ? 'Guardando en BD...' : 'Guardar y Vincular Registros'}
          </button>
        </form>
      </div>
    </div>
  );
}