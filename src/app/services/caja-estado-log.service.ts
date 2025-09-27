import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Environment } from '../../env/environment';
import { ResponseCajaEstadoLogs, CajaEstadoLog } from '../models/caja-estado-log.model';

@Injectable({
    providedIn: 'root'
})
export class CajaEstadoLogService {
        
    API_URL = Environment.apiUrl + 'CajaEstadoLog/';
        
    constructor(private http: HttpClient) { }
    
    // GET /api/CajaEstadoLog/GetLogs - Muestra todos los logs de estado de cajas
    getLogs(): Observable<ResponseCajaEstadoLogs> {
        return this.http.get<ResponseCajaEstadoLogs>(this.API_URL + 'GetLogs')
            .pipe(map(response => this.processResponse(response)));
    }
    
    // GET /api/CajaEstadoLog/GetLogsByCaja/{idCaja} - Muestra logs de una caja específica
    getLogsByCaja(idCaja: number): Observable<ResponseCajaEstadoLogs> {
        const url = `${this.API_URL}GetLogsByCaja/${idCaja}`;
        return this.http.get<ResponseCajaEstadoLogs>(url)
            .pipe(map(response => this.processResponse(response)));
    }

    // GET /api/CajaEstadoLog/GetLogsByUsuario/{idUsuario} - Muestra logs de un usuario específico
    getLogsByUsuario(idUsuario: number): Observable<ResponseCajaEstadoLogs> {
        const url = `${this.API_URL}GetLogsByUsuario/${idUsuario}`;
        return this.http.get<ResponseCajaEstadoLogs>(url)
            .pipe(map(response => this.processResponse(response)));
    }

    // Procesar la respuesta del backend para formatear los datos para la vista
    private processResponse(response: ResponseCajaEstadoLogs): ResponseCajaEstadoLogs {
        if (response && response.response && Array.isArray(response.response)) {
            response.response = response.response.map(log => this.processLogItem(log));
        }
        return response;
    }

    // Procesar cada item de log para crear propiedades calculadas
    private processLogItem(log: CajaEstadoLog): CajaEstadoLog {
        let usuario = 'Sin usuario';
        
        if (log.nombreUsuario && log.apellidoUsuario) {
            // Si ambos campos están presentes
            usuario = `${log.apellidoUsuario}, ${log.nombreUsuario}`;
        } else if (log.nombreUsuario) {
            // Si solo hay nombreUsuario
            usuario = log.nombreUsuario;
        } else if (log.apellidoUsuario) {
            // Si solo hay apellidoUsuario
            usuario = log.apellidoUsuario;
        }
        
        return {
            ...log,
            // Crear propiedades calculadas para compatibilidad con la vista
            usuario: usuario,
            caja: `Caja ${log.nCaja}`,
            seccion: log.nombreSeccion,
            tiempo: log.fechaLog
        };
    }

    // Exportar logs de estado de cajas como CSV
    exportLogs(): Observable<Blob> {
        return this.http.get(this.API_URL + 'ExportLogs', { responseType: 'blob' });
    }

    // Exportar logs por caja específica como CSV
    exportLogsByCaja(idCaja: number): Observable<Blob> {
        const url = `${this.API_URL}ExportLogsByCaja/${idCaja}`;
        return this.http.get(url, { responseType: 'blob' });
    }

    // Exportar logs por usuario específico como CSV
    exportLogsByUsuario(idUsuario: number): Observable<Blob> {
        const url = `${this.API_URL}ExportLogsByUsuario/${idUsuario}`;
        return this.http.get(url, { responseType: 'blob' });
    }

    // Método de prueba para verificar conectividad
    testConnection(): Observable<any> {
        return this.http.get(this.API_URL.replace('CajaEstadoLog/', '') + 'health', { 
            observe: 'response',
            responseType: 'text'
        });
    }
}