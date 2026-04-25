import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EditPadreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  padre: { DNI_Asociado: string; Nombres: string; Telefono: string | null } | null;
}

export default function EditPadreModal({ isOpen, onClose, onSave, padre }: EditPadreModalProps) {
  const [nombres, setNombres] = useState('');
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (padre) {
      setNombres(padre.Nombres);
      setTelefono(padre.Telefono || '');
    }
  }, [padre]);

  if (!isOpen || !padre) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase
      .from('Padres')
      .update({ Nombres: nombres, Telefono: telefono })
      .eq('DNI_Asociado', padre.DNI_Asociado);

    if (error) {
      alert("Error al actualizar: " + error.message);
    } else {
      onSave();
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-xl font-bold text-white">Editar Apoderado</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">DNI (No editable)</label>
            <input 
              type="text" 
              disabled
              value={padre.DNI_Asociado}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-slate-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Nombres Completos</label>
            <input 
              type="text" 
              required
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Teléfono / WhatsApp</label>
            <input 
              type="text" 
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}