import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { Environment } from '../../env/environment';
import { userLogin, userRegister, assignCaja } from '../models/login.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  API_URL = Environment.apiUrl + 'Auth/';
  APIUSER_URL = Environment.apiUrl + 'Usuario/';


  constructor(private http: HttpClient, private router: Router) { }

  checkUser(userLogin: userLogin): Observable<any> {
    return this.http.post(this.API_URL + 'Check-User', { usuario: userLogin.usuario });
  }

  assignCaja(assignCaja: assignCaja): Observable<any> {
    return this.http.post(this.API_URL + 'Assign-Caja', assignCaja);
  }

  login(userLogin: userLogin): Observable<any> {
    return this.http.post(this.API_URL + 'Login', userLogin);
  }

  logOut(idUsuario: number): void {
    const session = JSON.parse(sessionStorage.getItem('session') || '{}');
    if (!session) {
      console.error('No hay sesión activa para cerrar sesión.');
      return;
    } 
    const rol = session.rol;
    if (rol === '2') {
      this.http.post(this.API_URL + 'LogOut', { idUsuario }).subscribe({
        next: (response: any) => {
          if (response.code === "200") {
            sessionStorage.removeItem('session');
            this.router.navigate(['/login']);
          } else {
            console.error('Error en logout:', response.mensaje);
          }
        },
        error: (err) => {
          console.error('Error en logout:', err);
        }
      });
    } else {
      sessionStorage.removeItem('session');
      this.router.navigate(['/login']);
    }

    
  }

  register(userRegister: userRegister): Observable<any> {
    return this.http.post(this.API_URL + 'Register', userRegister);
  }

  registerUser(userRegister: userRegister): Observable<any> {
    return this.http.post(this.APIUSER_URL + 'Register', userRegister);
  }

  checkLogin(): Observable<any> {
    if (!sessionStorage.getItem('session')) {
      this.router.navigate(['/login']);
      return new Observable(observer => {
        observer.next(false);
        observer.complete();
      });
    } else {
      const session = JSON.parse(sessionStorage.getItem('session') || '{}');
      return of(session);
    }
  }
}
