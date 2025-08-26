export interface userLogin {
    usuario: string;
    password?: string;
    idCaja?: number;
  }

  export interface assignCaja {
    idUsuario: number;
    idCaja: number;
  }
  
  export interface userRegister {
    nombre: string;
    apellido: string;
    usuario: string;
    rol: number;
    caja: number;
    password?: string;
  }
  