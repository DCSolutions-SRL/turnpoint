import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Environment } from '../../env/environment';

@Injectable({
    providedIn: 'root'
})
export class CajasService {
    
    API_URL = Environment.apiUrl + 'Cajas/';

    private cajaDisponibleSubject = new Subject<number>();
    cajaDisponible$ = this.cajaDisponibleSubject.asObservable();
    
    constructor(private http: HttpClient) { }

    // Obtener cajas
    getCajas(): Observable<any> {
        return this.http.get(this.API_URL + 'GetCajas');
    }

    getCajasInactivas(): Observable<any> {
        return this.http.get(this.API_URL + 'GetCajasNoLogeadas');
    }

    GetCajasXSeccion(idSeccion: number): Observable<any> {
        return this.http.get(this.API_URL + 'GetCajasXSeccion/' + idSeccion);
    }

    getDisponiblesXSeccion(idSeccion: number): Observable<any> {
        return this.http.get(this.API_URL + 'GetDisponiblesXSeccion/' + idSeccion);
    }

    GetInfoCaja(idCaja: number): Observable<any> {
        return this.http.get(this.API_URL + 'GetInfoCaja/' + idCaja);
    }

    switchDisponibilidad(idCaja: number): Observable<any> {
        return this.http.put(this.API_URL + 'SwitchDisponibilidad/' + idCaja, {});
    }



    ///////////////////////

    notifyCajaDisponible(idCaja: number) {
        this.cajaDisponibleSubject.next(idCaja);
    }

    
}