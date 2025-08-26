import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Environment } from '../../env/environment';
import { responseLogs } from '../models/logs.model';

@Injectable({
    providedIn: 'root'
})
export class LogsService {
        
    API_URL = Environment.apiUrl + 'Logs/';
        
    constructor(private http: HttpClient) { }
    
    getLogs(): Observable<any> {
        return this.http.get(this.API_URL + 'GetUltimos');
    }
    
    getLogsPorUsuario(idUsuario: number, top: number = 10, page: number = 1): Observable<responseLogs> {
        const url = `${this.API_URL}LogsPorUsuario?idUsuario=${idUsuario}&top=${top}&page=${page}`;
        return this.http.get<responseLogs>(url);
    }

    getLogsPorSeccion(idSeccion: number, top: number = 10, page: number = 1): Observable<responseLogs> {
        const url = `${this.API_URL}LogsPorSeccion?idSeccion=${idSeccion}&top=${top}&page=${page}`;
        return this.http.get<responseLogs>(url);
    }

    exportLogs(): Observable<Blob> {
        return this.http.get(this.API_URL + 'ExportLogs', { responseType: 'blob' });
    }

}