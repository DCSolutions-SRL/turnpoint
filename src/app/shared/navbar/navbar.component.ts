import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.loginSv.logOut(this.idUsuario)
  }
}