import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Edit, Trash2, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import EditPadreModal from './EditPadreModal';

interface Alumno {
  id: number;
  Nombres_Alumno: string;
  Nivel: string;
  Grado: string;
  Seccion: string;
}

interface Padre {
  DNI_Asociado: string;
  Nombres: string;
  Telefono: string | null;
  Alumnos: Alumno[];
}

export default function GestionPadres() {
  const [padres, setPadres] = useState<Padre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; // Muestra 50 padres por página para que cargue ultra rápido

  // Nuevos estados para los modales
  const [selectedPadre, setSelectedPadre] = useState<Padre | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    fetchPadres();
  }, []);

  // Si el usuario escribe en el buscador, regresamos a la página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchPadres = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('Padres')
      .select(`
        DNI_Asociado,
        Nombres,
        Telefono,
        Alumnos ( id, Nombres_Alumno, Nivel, Grado, Seccion )
      `)
      .order('Nombres', { ascending: true });

    if (!error && data) {
      setPadres(data as unknown as Padre[]);
    }
    setLoading(false);
  };

  // 1. LÓGICA DE BÚSQUEDA PROFUNDA
  const padresFiltrados = padres.filter(padre => {
    const termino = searchTerm.toLowerCase();
    
    // Busca por DNI o Nombre del Padre
    const coincidePadre = 
      padre.Nombres.toLowerCase().includes(termino) || 
      padre.DNI_Asociado.includes(termino);
      
    // Busca si ALGÚN hijo coincide con el texto escrito
    const coincideHijo = padre.Alumnos?.some(hijo => 
      hijo.Nombres_Alumno.toLowerCase().includes(termino)
    );

    return coincidePadre || coincideHijo;
  });

  // 2. LÓGICA DE PAGINACIÓN
  const totalPages = Math.ceil(padresFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const padresPaginados = padresFiltrados.slice(startIndex, startIndex + itemsPerPage);

  // Función para eliminar definitivamente
  const handleDelete = async () => {
    if (!selectedPadre) return;
    
    const { error } = await supabase
      .from('Padres')
      .delete()
      .eq('DNI_Asociado', selectedPadre.DNI_Asociado);

    if (error) {
      alert("No se puede eliminar: Este padre tiene hijos asociados.");
    } else {
      fetchPadres(); // Recargamos la lista
    }
  };

  return (
    <>
      <div className="space-y-6">
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
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
            />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/50 text-slate-400 text-sm uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">DNI</th>
                  <th className="px-6 py-4 font-medium">Apoderado</th>
                  <th className="px-6 py-4 font-medium">Teléfono</th>
                  <th className="px-6 py-4 font-medium">Estudiantes Asociados</th>
                  <th className="px-6 py-4 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-slate-400">Cargando base de datos...</span>
                      </div>
                    </td>
                  </tr>
                ) : padresPaginados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-500">
                      No se encontraron resultados para "{searchTerm}"
                    </td>
                  </tr>
                ) : (
                  padresPaginados.map((padre) => (
                    <tr key={padre.DNI_Asociado} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-300">{padre.DNI_Asociado}</td>
                      <td className="px-6 py-4 text-white font-medium">{padre.Nombres}</td>
                      <td className="px-6 py-4 text-slate-400">{padre.Telefono || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {padre.Alumnos && padre.Alumnos.length > 0 ? (
                            padre.Alumnos.map(hijo => (
                              <span key={hijo.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-lg font-medium w-max">
                                <Users size={12} />
                                {hijo.Nombres_Alumno} ({hijo.Nivel.substring(0,3)} - {hijo.Grado} {hijo.Seccion || ''})
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg w-max">Sin hijos asignados</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => { 
                              setSelectedPadre(padre); 
                              setIsEditOpen(true); 
                            }}
                            className="text-slate-400 hover:text-blue-400 transition-colors p-1"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => { 
                              setSelectedPadre(padre); 
                              setIsDeleteOpen(true); 
                            }}
                            className="text-slate-400 hover:text-red-400 transition-colors p-1"
                            title="Eliminar"
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
              <p className="text-sm text-slate-400">
                Mostrando <span className="font-medium text-white">{startIndex + 1}</span> a <span className="font-medium text-white">{Math.min(startIndex + itemsPerPage, padresFiltrados.length)}</span> de <span className="font-medium text-white">{padresFiltrados.length}</span> resultados
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-medium text-slate-300 px-2">
                  Página {currentPage} de {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALES */}
      <EditPadreModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        padre={selectedPadre}
        onSave={fetchPadres} 
      />

      <ConfirmModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar Apoderado?"
        message={`¿Estás seguro de que deseas eliminar a ${selectedPadre?.Nombres}? Esta acción no se puede deshacer y fallará si tiene alumnos registrados.`}
      />
    </>
  );
}