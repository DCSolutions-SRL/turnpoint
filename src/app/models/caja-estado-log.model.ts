export interface CajaEstadoLog {
    idLog: number;
    nCaja: number;
    nombreSeccion: string;
    nombreUsuario: string | null;
    apellidoUsuario: string | null;
    estadoAnterior: string;
    estadoNuevo: string;
    tipoEvento: string;
    fechaLog: string;
    observaciones: string | null;
    
    // Propiedades calculadas para la vista
    usuario?: string; // nombreUsuario + apellidoUsuario
    caja?: string; // "Caja " + nCaja
    seccion?: string; // nombreSeccion
    tiempo?: string; // fechaLog formateado
}

export interface ResponseCajaEstadoLogs {
    code: string;
    message?: string;
    paginaActual?: number;
    totalPaginas?: number;
    registros?: number;
    response: CajaEstadoLog[]; // El backend usa 'response' no 'data'
}