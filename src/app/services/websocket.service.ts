import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Environment } from '../../env/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private hubConnection!: signalR.HubConnection;
  API_URL = Environment.apiUrl.replace('/api/', '/') + 'globalHub';

  public startConnection(): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.API_URL)
      .build();

    return this.hubConnection
      .start()
      .then(() => {
        console.log('✅ Conectado a SignalR');
      })
      .catch(err => {
        console.log('❌ Error al conectar: ', err);
        throw err;
      });
  }
  public unirseASeccion(seccion: string) {
    this.hubConnection.invoke('JoinSection', seccion)
      .catch(err => console.error('❌ Error al unirse a la sección:', err));
  }

  // NUEVO: Escuchar cambios de estado de cajas
  public onCambioEstadoCaja(callback: (data: { nCaja: number, seccion: number, disponible: boolean, timestamp: string }) => void) {
    this.hubConnection.on('EstadoCajaChanged', callback);
  }

  // NUEVO: Escuchar estado inicial de cajas al conectarse
  public onEstadoInicialCajas(callback: (cajas: any[]) => void) {
    this.hubConnection.on('EstadoInicialCajas', callback);
  }

  // NUEVO: Notificar cambio de estado de caja
  public notificarCambioEstado(nCaja: number, seccion: number, disponible: boolean) {
    this.hubConnection.invoke('NotificarCambioEstado', nCaja, seccion, disponible)
      .catch(err => console.error('❌ Error al notificar cambio de estado:', err));
  }

  // MANTENER POR COMPATIBILIDAD (por si se necesita después)
  public onAsignacion(callback: (data: { nCaja: number, seccion: string }) => void) {
    this.hubConnection.on('AsignacionRecibida', callback);
  }

  public enviarAsignacion(nCaja: number, seccion: string) {
    this.hubConnection.invoke('EnviarAsignacion', nCaja, seccion)
      .catch(err => console.error('❌ Error al enviar asignación:', err));
  }
}
