import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { UsuariosService } from '../../services/usuarios.service';
import { CajasService } from '../../services/cajas.service';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../services/login.service';
import { WebsocketService } from '../../services/websocket.service';
import { timeout } from 'rxjs';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-mainmenu',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FooterComponent],
  templateUrl: './mainmenu.component.html',
  styleUrl: './mainmenu.component.css'
})
export class MainmenuComponent {

  idUsuario: number = 0;
  idCaja: number = 0;
  nCaja: number = 0;
  nSeccion: number = 0;
  nombreUsuario: string = '';

  disponibilidad: boolean = true; // Inicialmente disponible
  ocupado: boolean = false; // Nueva propiedad para el estado ocupado
  timerNoDisponible: string = '00:00';
  totalNoDisponible: string = '00:00';

  constructor(private usuarioSv: UsuariosService, private cajasSv: CajasService,
              private loginSv: LoginService, private ws: WebsocketService){}

  ngOnInit() {
    this.ws.startConnection();
    this.loginSv.checkLogin()
    
    const session = sessionStorage.getItem('session')
    if (session) {
      const lol= JSON.parse(session);
      console.log(lol);
      this.idUsuario = lol.idUsuario;
      this.usuarioSv.getUsuarioXid(this.idUsuario).subscribe((res:any) => {
        console.log(res);
        this.cajasSv.GetInfoCaja(res.idCaja).subscribe((res2:any) => {
          console.log(res2.response);
          this.idCaja = res2.response[0].idCaja;
          this.nCaja = res2.response[0].nCaja;
          this.nSeccion = res2.response[0].seccion;
          
          // Inicializar estado de ocupado basado en disponibilidad actual
          // Si disponible es true, significa que está disponible (no ocupado)
          // Si disponible es false, significa que está ocupado
          const disponible = res2.response[0].disponible !== undefined ? res2.response[0].disponible : true;
          this.disponibilidad = disponible;
          this.ocupado = !disponible;
          
          console.log('Estado inicial - Disponible:', this.disponibilidad, 'Ocupado:', this.ocupado);
        })
      })

    }
  }


  // NUEVO: Cambiar estado de ocupado/disponible
  toggleEstadoOcupado() {
    console.log('Cambiando estado de caja:', this.nCaja, 'Sección:', this.nSeccion);
    
    // Guardar estado anterior para rollback si es necesario
    const estadoAnterior = this.ocupado;
    
  // Llamar al backend para cambiar el estado, enviando idUsuario
  this.cajasSv.switchDisponibilidad(this.idCaja, this.idUsuario).subscribe({
      next: (response: any) => {
        console.log('Respuesta del backend:', response);
        
        // Manejar diferentes estructuras de respuesta del backend
        let nuevoEstadoDisponible: boolean;
        
        if (response && typeof response.disponible !== 'undefined') {
          // Si el backend devuelve la estructura esperada con disponible
          nuevoEstadoDisponible = response.disponible;
        } else if (response && typeof response.success !== 'undefined' && response.success) {
          // Si solo devuelve success, invertir el estado actual
          nuevoEstadoDisponible = !this.disponibilidad;
        } else {
          // Fallback: invertir el estado actual
          nuevoEstadoDisponible = !this.disponibilidad;
        }
        
        // Actualizar estado local
        this.disponibilidad = nuevoEstadoDisponible;
        this.ocupado = !nuevoEstadoDisponible;
        
        console.log('Estado actualizado - Ocupado:', this.ocupado, 'Disponible:', this.disponibilidad);
        
        // Notificar cambio via WebSocket
        this.ws.notificarCambioEstado(this.nCaja, this.nSeccion, this.disponibilidad);
      },
      error: (error) => {
        console.error('Error al cambiar estado de caja:', error);
        
        // Rollback al estado anterior
        this.ocupado = estadoAnterior;
        this.disponibilidad = !estadoAnterior;
        
        // Opcional: Mostrar mensaje de error al usuario
        alert('Error al cambiar el estado de la caja. Intente nuevamente.');
      }
    });
  }

  // MANTENER MÉTODO ANTERIOR POR COMPATIBILIDAD (por si se necesita después)
  switchDisponibilidad() {
    console.log('N° de caja: ', this.nCaja);
    console.log('N° de seccion: ', this.nSeccion);
    this.disponibilidad = true;

    if (this.nSeccion === 1) {
        this.ws.enviarAsignacion(this.nCaja, 'poker-room');
        setTimeout(() => {
            this.disponibilidad = false;
            console.log('Disponibilidad actualizada a:', this.disponibilidad);
        }, 5000); 
    } else if (this.nSeccion === 2) {
        this.ws.enviarAsignacion(this.nCaja, 'nucleo-1');
        setTimeout(() => {
          this.disponibilidad = false;
          console.log('Disponibilidad actualizada a:', this.disponibilidad);
      }, 5000); 
    } else if (this.nSeccion === 3) {
        this.ws.enviarAsignacion(this.nCaja, 'nucleo-2');
        setTimeout(() => {
          this.disponibilidad = false;
          console.log('Disponibilidad actualizada a:', this.disponibilidad);
      }, 5000); 
    } else if (this.nSeccion === 4) {
        this.ws.enviarAsignacion(this.nCaja, 'nucleo-3');
        setTimeout(() => {
          this.disponibilidad = false;
          console.log('Disponibilidad actualizada a:', this.disponibilidad);
      }, 5000); 
    }
}
  
}
