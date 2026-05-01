export interface Alumno {
  id: number;
  Nombres_Alumno: string;
  Nivel: 'Inicial' | 'Primaria' | 'Secundaria';
  Grado: string;
  Seccion: string;
}

export interface Padre {
  UUID_QR: Padre | null;
  DNI_Asociado: string;
  Nombres: string;
  Telefono: string | null;
  Alumnos: Alumno[];
}