import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { UsuariosService } from '../../services/usuarios.service';
import { Environment } from '../../../env/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  idUsuario: number = 0;
  rolUser: number = 0;
  userInfo: { nombre: string; apellido: string; rol: number} | null = null;
  showMenu: boolean = false;

  // Variables para el descanso
  descansoActivo: boolean = false;
  tiempoRestante: number = 15;// 1800; // 30 minutos en segundos
  tiempoRestanteFormateado: string = '00:15';
  intervaloDescanso: any;
  tiempoDescansoInicial: number = 15; // 1800; // Tiempo inicial de descanso (30 minutos)

  constructor(private router: Router, private loginSv: LoginService,
              private usuarioSv: UsuariosService) {}
  
  ngOnInit(): void {
    this.loginSv.checkLogin();

    const session = sessionStorage.getItem('session');
    if (session) {
      const sessionData = JSON.parse(session);
      this.rolUser = sessionData.rol;
      this.idUsuario = sessionData.idUsuario;

      this.usuarioSv.getUsuarioXid(sessionData.idUsuario).subscribe((searchRes: any) => {
        this.userInfo = {
          nombre: sessionData.nombre,
          apellido: sessionData.apellido,
          rol: sessionData.rol
        };
      }); 
    }

    // Cargar tiempo restante guardado si existe y es del mismo día/sesión
    const tiempoGuardado = localStorage.getItem('tiempoDescansoRestante');
    const fechaGuardada = localStorage.getItem('fechaDescanso');
    const tiempoInicialGuardado = localStorage.getItem('tiempoDescansoInicial');
    const fechaHoy = new Date().toDateString();
    
    // Verificar si cambió el tiempo inicial configurado (para desarrollo/pruebas)
    if (tiempoInicialGuardado && parseInt(tiempoInicialGuardado) !== this.tiempoDescansoInicial) {
      // Si cambió el tiempo inicial, reiniciar todo
      this.tiempoRestante = this.tiempoDescansoInicial;
      localStorage.setItem('tiempoDescansoInicial', this.tiempoDescansoInicial.toString());
      localStorage.setItem('fechaDescanso', fechaHoy);
      localStorage.setItem('tiempoDescansoRestante', this.tiempoRestante.toString());
    }
    // Reiniciar si es un nuevo día o nueva sesión
    else if (tiempoGuardado && fechaGuardada === fechaHoy) {
      this.tiempoRestante = parseInt(tiempoGuardado);
    } else {
      // Nuevo día o nueva sesión, reiniciar
      this.tiempoRestante = this.tiempoDescansoInicial;
      localStorage.setItem('tiempoDescansoInicial', this.tiempoDescansoInicial.toString());
      localStorage.setItem('fechaDescanso', fechaHoy);
      localStorage.setItem('tiempoDescansoRestante', this.tiempoRestante.toString());
    }
    this.formatearTiempo();

    // Añadir el evento beforeunload
    const idUsuario = this.idUsuario;
    window.addEventListener('beforeunload', () => {
      const url = Environment.apiUrl + '/Auth/LogOut';
      const data = new Blob(
        [JSON.stringify({ idUsuario })],
        { type: 'application/json' }
      );

      navigator.sendBeacon(url, data);
    });
  }

  ngOnDestroy(): void {
    // Limpiar el intervalo si el componente se destruye
    if (this.intervaloDescanso) {
      clearInterval(this.intervaloDescanso);
    }
  }

  // Escuchar eventos del teclado para cancelar el descanso
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.descansoActivo) {
      event.preventDefault();
      event.stopPropagation();
      this.cancelarDescanso();
    }
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.loginSv.logOut(this.idUsuario)
  }

  // Funciones para el descanso
  toggleDescanso() {
    if (this.descansoActivo) {
      this.cancelarDescanso();
    } else {
      this.iniciarDescanso();
    }
  }

  iniciarDescanso() {
    this.descansoActivo = true;
    
    // Iniciar el contador regresivo (continúa en negativo)
    this.intervaloDescanso = setInterval(() => {
      this.tiempoRestante--;
      this.formatearTiempo();
      // Guardar el tiempo restante y la fecha en localStorage
      const fechaHoy = new Date().toDateString();
      localStorage.setItem('tiempoDescansoRestante', this.tiempoRestante.toString());
      localStorage.setItem('fechaDescanso', fechaHoy);
    }, 1000);
  }

  cancelarDescanso() {
    this.descansoActivo = false;
    
    // Detener el intervalo
    if (this.intervaloDescanso) {
      clearInterval(this.intervaloDescanso);
      this.intervaloDescanso = null;
    }
    
    // Guardar el tiempo restante actual y la fecha
    const fechaHoy = new Date().toDateString();
    localStorage.setItem('tiempoDescansoRestante', this.tiempoRestante.toString());
    localStorage.setItem('fechaDescanso', fechaHoy);
  }

  formatearTiempo() {
    const esNegativo = this.tiempoRestante < 0;
    const tiempoAbs = Math.abs(this.tiempoRestante);
    const minutos = Math.floor(tiempoAbs / 60);
    const segundos = tiempoAbs % 60;
    const signo = esNegativo ? '-' : '';
    this.tiempoRestanteFormateado = `${signo}${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  }

  // Verificar si el tiempo es negativo para aplicar estilos
  esTiempoNegativo(): boolean {
    return this.tiempoRestante < 0;
  }
}