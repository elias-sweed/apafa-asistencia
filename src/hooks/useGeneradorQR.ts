import { useState } from 'react';
import { supabase } from '../lib/supabase';
// Corregido: Importación como tipo para cumplir con verbatimModuleSyntax
import type { Alumno as AlumnoBase } from '../types/database';

// Definimos una interfaz local que incluya la relación con Padres
// Definimos exactamente la estructura que devuelve la consulta de Supabase
interface AlumnoWithPadres extends AlumnoBase {
  DNI_Asociado: string;
  Padres: {
    DNI_Asociado: string;
    Nombres: string;
    UUID_QR: string;
  } | null; 
}

export const useGeneradorQR = () => {
  const [alumnos, setAlumnos] = useState<AlumnoWithPadres[]>([]);
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
    
    if (nivel !== 'INICIAL' && !seccion) {
      setErrorDb('Por favor selecciona la Sección.');
      return;
    }

    setLoading(true);
    setErrorDb(null);

    const { data, error } = await supabase
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
      .ilike('Grado', grado)
      .ilike('Seccion', seccion ? `%${seccion}%` : '%');

    if (error) {
      setErrorDb(error.message);
    } else if (data) {
      setAlumnos(data as unknown as AlumnoWithPadres[]);
      if (data.length === 0) {
        setErrorDb('No se encontraron alumnos. Verifica grado y sección.');
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

  const alumnosFiltrados = alumnos.filter(alumno => {
    const t = searchTerm.toLowerCase();
    return (
      alumno.Nombres_Alumno.toLowerCase().includes(t) || 
      (alumno.Padres?.Nombres || '').toLowerCase().includes(t) ||
      (alumno.DNI_Asociado || '').includes(t)
    );
  });

  return {
    alumnos, alumnosFiltrados, loading, errorDb, searchTerm, setSearchTerm,
    nivel, setNivel, grado, setGrado, seccion, setSeccion,
    buscarQRs, downloadQR
  };
};