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

  disponibilidad: boolean = false;
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
        })
      })

    }
  }


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
