export interface logs {
    idLog: number;
    idUsuario: number;
    seccion: string;
    caja: string;
    nombre: string;
    apellido: string;
    fechaLog: string;
}

export interface responseLogs {
    code: string;
    message: string;
    paginaActual: number;
    totalPaginas: number;
    registros: number;
    data: logs[];
}