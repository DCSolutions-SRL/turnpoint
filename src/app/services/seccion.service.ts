import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Environment } from '../../env/environment';

@Injectable({
    providedIn: 'root'
})
export class SeccionService {
        
        API_URL = Environment.apiUrl + 'Secciones/';
        
        constructor(private http: HttpClient) { }
    
        // Obtener secciones
        getSecciones(): Observable<any> {
            return this.http.get(this.API_URL + 'Listar');
        }


}