import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePadres } from '../hooks/usePadres';
import type { Padre } from '../types/database';
import ConfirmModal from './ConfirmModal';
import EditPadreModal from './EditPadreModal';

export default function GestionPadres() {
  // Extraemos todo del hook que creaste
  const { 
    padres, 
    padresFiltrados, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    eliminarPadre, 
    refresh 
  } = usePadres();

  // Estados locales para UI (Paginación y Modales)
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPadre, setSelectedPadre] = useState<Padre | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const itemsPerPage = 50;

  // Resetear página al buscar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Lógica de paginación
  const totalPages = Math.ceil(padresFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const padresPaginados = padresFiltrados.slice(startIndex, startIndex + itemsPerPage);

  // Función auxiliar para colores de niveles
  const getNivelBadgeStyle = (nivel: string) => {
    const n = nivel.toLowerCase();
    if (n.includes('ini')) return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
    if (n.includes('pri')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (n.includes('sec')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const confirmarEliminar = async () => {
    if (!selectedPadre) return;
    try {
      await eliminarPadre(selectedPadre.DNI_Asociado);
      setIsDeleteOpen(false);
    } catch (error: any) {
      alert(error.message || "Error al eliminar");
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* ENCABEZADO Y BÚSQUEDA */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Directorio de Padres</h2>
            <p className="text-slate-400 mt-1">
              Total registrados: <span className="text-blue-400 font-bold">{padres.length}</span>
            </p>
          </div>
          
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar DNI, Padre o Estudiante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white transition-all"
            />
          </div>
        </div>

        {/* TABLA DE RESULTADOS */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">DNI</th>
                  <th className="px-6 py-4 font-semibold">Apoderado</th>
                  <th className="px-6 py-4 font-semibold">Teléfono</th>
                  <th className="px-6 py-4 font-semibold">Estudiantes Asociados</th>
                  <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-slate-500 font-medium">Sincronizando con Supabase...</span>
                      </div>
                    </td>
                  </tr>
                ) : padresPaginados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-slate-500 italic">
                      No se encontraron resultados para "{searchTerm}"
                    </td>
                  </tr>
                ) : (
                  padresPaginados.map((padre) => (
                    <tr key={padre.DNI_Asociado} className="hover:bg-blue-500/5 transition-colors group">
                      <td className="px-6 py-4 font-mono text-blue-400 font-semibold">{padre.DNI_Asociado}</td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{padre.Nombres}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{padre.Telefono || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {padre.Alumnos && padre.Alumnos.length > 0 ? (
                            padre.Alumnos.map(hijo => (
                              <span 
                                key={hijo.id} 
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-[11px] font-bold ${getNivelBadgeStyle(hijo.Nivel)}`}
                              >
                                <Users size={10} />
                                {hijo.Nombres_Alumno} ({hijo.Grado} {hijo.Seccion})
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 uppercase font-bold">Sin hijos</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setSelectedPadre(padre); setIsEditOpen(true); }}
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                            title="Editar Datos"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => { setSelectedPadre(padre); setIsDeleteOpen(true); }}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            title="Eliminar Padre"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* CONTROLES DE PAGINACIÓN */}
          {!loading && totalPages > 1 && (
            <div className="border-t border-slate-800 p-4 flex items-center justify-between bg-slate-900/30">
              <p className="text-sm text-slate-500">
                Mostrando <span className="text-white font-semibold">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, padresFiltrados.length)}</span> de {padresFiltrados.length}
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="bg-slate-800 px-4 py-2 rounded-lg text-sm font-bold text-blue-400">
                  {currentPage} / {totalPages}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALES */}
      {isEditOpen && (
        <EditPadreModal 
          isOpen={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
          padre={selectedPadre}
          onSave={refresh} 
        />
      )}

      {isDeleteOpen && (
        <ConfirmModal 
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={confirmarEliminar}
          title="¿Eliminar Apoderado?"
          message={`¿Estás seguro de que deseas eliminar a ${selectedPadre?.Nombres}? Esta acción es permanente.`}
        />
      )}
    </>
  );
}