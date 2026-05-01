import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Padre } from '../types/database';

export const usePadres = () => {
  const [padres, setPadres] = useState<Padre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

    if (!error && data) setPadres(data as unknown as Padre[]);
    setLoading(false);
  };

  useEffect(() => { fetchPadres(); }, []);

  const eliminarPadre = async (dni: string) => {
    const { error } = await supabase.from('Padres').delete().eq('DNI_Asociado', dni);
    if (error) throw new Error("Tiene alumnos asociados");
    await fetchPadres();
  };

  const padresFiltrados = padres.filter(p => {
    const t = searchTerm.toLowerCase();
    return p.Nombres.toLowerCase().includes(t) || 
           p.DNI_Asociado.includes(t) || 
           p.Alumnos?.some(h => h.Nombres_Alumno.toLowerCase().includes(t));
  });

  return {
    padres,
    padresFiltrados,
    loading,
    searchTerm,
    setSearchTerm,
    eliminarPadre,
    refresh: fetchPadres
  };
};