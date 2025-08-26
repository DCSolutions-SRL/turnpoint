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

  public onAsignacion(callback: (data: { nCaja: number, seccion: string }) => void) {
    this.hubConnection.on('AsignacionRecibida', callback);
  }

  public enviarAsignacion(nCaja: number, seccion: string) {
    this.hubConnection.invoke('EnviarAsignacion', nCaja, seccion)
      .catch(err => console.error('❌ Error al enviar asignación:', err));
  }
}
