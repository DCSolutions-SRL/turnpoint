import { Routes } from '@angular/router';
import { MainmenuComponent } from './pages/mainmenu/mainmenu.component';
import { LoginComponent } from './login/login.component';
import { AltaUsuariosComponent } from './pages/alta-usuarios/alta-usuarios.component';
import { Seccion2Component } from './pages/clients-side/seccion-2/seccion-2.component';
import { Seccion3Component } from './pages/clients-side/seccion-3/seccion-3.component';
import { Seccion4Component } from './pages/clients-side/seccion-4/seccion-4.component';
import { Seccion1Component } from './pages/clients-side/seccion-1/seccion-1.component';
import { RegistroLogsComponent } from './pages/registro-logs/registro-logs.component';
import { AtencionClienteComponent } from './pages/atencion-cliente/atencion-cliente.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'mainmenu', component: MainmenuComponent },
    { path: 'alta-usuarios', component: AltaUsuariosComponent },
    { path: 'logs', component: RegistroLogsComponent },
    { path: 'atencion-cliente', component: AtencionClienteComponent },
    { path: 'seccion-1', component: Seccion1Component },
    { path: 'seccion-2', component: Seccion2Component },
    { path: 'seccion-3', component: Seccion3Component },
    { path: 'seccion-4', component: Seccion4Component }
];