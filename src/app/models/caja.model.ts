export interface Caja {
  idCaja: number;
  nCaja: number;
  numeroCaja?: number; // Alias para nCaja por compatibilidad
  seccion: number;
  isLogged: boolean;
  disponible: boolean;
  seccionNombre?: string; // Para mostrar nombre de la sección
}

export interface ResponseCajas {
  code: string;
  message: string;
  data: Caja[];
}

export interface CajaEstadoChange {
  idCaja: number;
  nCaja: number;
  seccion: number;
  disponible: boolean;
  timestamp: string;
}