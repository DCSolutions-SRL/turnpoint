import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CajasService } from '../../../services/cajas.service';
import { CommonModule } from '@angular/common';
import { Subscription, timeout } from 'rxjs';
import Swal from 'sweetalert2';
import { WebsocketService } from '../../../services/websocket.service';
import { SystemConfig, QueueManager, QueueStatus } from '../../../config/system.config';

@Component({
  selector: 'app-seccion-4',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seccion-4.component.html',
  styleUrl: './seccion-4.component.css'
})
export class Seccion4Component implements OnInit, OnDestroy {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  seccionLocal = 'nucleo-3';
  seccionNumero = 5; // Corregido: Nucleo 3 está en idSeccion = 5 según la BD
  
  // NUEVO: Lista de cajas disponibles
  cajasDisponibles: any[] = [];
  
  // MANTENER PARA COMPATIBILIDAD
  mensajeCaja: string | null = null;
  messageTimeout: any;
  
  // Cola de asignaciones
  assignmentQueue: number[] = [];
  isProcessingQueue: boolean = false;
  maxQueueSize: number = SystemConfig.MAX_DISPLAY_QUEUE_SIZE;

  constructor(private cajasSv: CajasService, private ws: WebsocketService) {}

  ngOnInit(): void {
    // Iniciar video inmediatamente
    setTimeout(() => {
      this.initializeVideo();
    }, 500);

    // Cargar cajas disponibles inicialmente
    this.cargarCajasDisponibles();

    this.ws.startConnection().then(() => {
      this.ws.unirseASeccion(this.seccionLocal);
  
      // NUEVO: Escuchar cambios de estado de cajas
      this.ws.onCambioEstadoCaja((data) => {
        if (data.seccion === this.seccionNumero) {
          console.log(`🔄 Cambio de estado recibido para sección ${data.seccion}: Caja ${data.nCaja} - Disponible: ${data.disponible}`);
          this.actualizarCajaEnLista(data);
        }
      });

      // NUEVO: Escuchar estado inicial (opcional)
      this.ws.onEstadoInicialCajas((cajas) => {
        const cajasDeEstaSeccion = cajas.filter(c => c.seccion === this.seccionNumero);
        console.log(`📋 Estado inicial recibido para sección ${this.seccionNumero}:`, cajasDeEstaSeccion);
        this.cajasDisponibles = cajasDeEstaSeccion.filter(c => c.disponible);
      });

      // MANTENER FUNCIONALIDAD ANTERIOR (para compatibilidad)
      this.ws.onAsignacion(({ nCaja, seccion }) => {
        if (seccion === this.seccionLocal) {
          console.log(`🟢 Asignación recibida para ${seccion}: Caja ${nCaja}`);
          
          if (QueueManager.canAddToQueue(this.assignmentQueue.length, this.maxQueueSize)) {
            this.assignmentQueue.push(nCaja);
            console.log(`✅ Asignación agregada a la cola. Cola actual: ${this.assignmentQueue.length}/${this.maxQueueSize}`);
            
            // Procesar cola si no se está procesando actualmente
            if (!this.isProcessingQueue) {
              this.processNextAssignment();
            }
          } else {
            console.warn(`⚠️ Cola de visualización llena (${this.assignmentQueue.length}/${this.maxQueueSize}). Asignación rechazada para caja ${nCaja}`);
            this.showQueueFullWarning(nCaja);
          }
        }
      });
    });
  }

  // Inicializar y configurar el video para reproducción continua
  initializeVideo(): void {
    if (this.videoPlayer && this.videoPlayer.nativeElement) {
      const video = this.videoPlayer.nativeElement;
      
      // Configurar para reproducción continua
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      
      // Eventos para asegurar reproducción continua
      video.addEventListener('loadeddata', () => {
        this.playVideo();
      });
      
      video.addEventListener('ended', () => {
        this.playVideo();
      });
      
      video.addEventListener('pause', () => {
        // Evitar pausas no deseadas
        if (!video.ended) {
          this.playVideo();
        }
      });
      
      video.addEventListener('error', (e) => {
        console.error('Error en el video:', e);
        // Intentar recargar el video después de un error
        setTimeout(() => {
          video.load();
          this.playVideo();
        }, 1000);
      });
      
      // Intentar reproducir inmediatamente si ya está cargado
      if (video.readyState >= 2) {
        this.playVideo();
      }
    }
  }

  // Método optimizado para reproducir el video
  playVideo(): void {
    if (this.videoPlayer && this.videoPlayer.nativeElement) {
      const video = this.videoPlayer.nativeElement;
      
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Video reproduciéndose correctamente');
          })
          .catch(error => {
            console.error('Error al reproducir el video:', error);
            // Intentar nuevamente después de un breve delay
            setTimeout(() => {
              this.playVideo();
            }, 500);
          });
      }
    }
  }

  // Procesar la siguiente asignación en la cola
  processNextAssignment(): void {
    if (this.assignmentQueue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }

    this.isProcessingQueue = true;
    const nCaja = this.assignmentQueue.shift()!;

    // Limpiar timeout existente
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
    
    // Mostrar mensaje de caja
    this.mensajeCaja = `${nCaja}`;
    this.scheduleMessageDisappearance();
  }

  // Programar la desaparición del mensaje
  scheduleMessageDisappearance(): void {
    this.messageTimeout = setTimeout(() => {
      this.mensajeCaja = null;
      
      // Procesar siguiente asignación si hay más en cola
      if (this.assignmentQueue.length > 0) {
        setTimeout(() => {
          this.processNextAssignment();
        }, 1000); // Breve pausa entre mensajes
      } else {
        this.isProcessingQueue = false;
      }
    }, SystemConfig.MESSAGE_DISPLAY_DURATION);
  }

  // Show warning when queue is full
  showQueueFullWarning(nCaja: number): void {
    console.warn(`🚫 Cola de visualización completa. No se puede mostrar caja ${nCaja} en este momento.`);
  }

  // Get current queue status
  getQueueStatus(): QueueStatus {
    return QueueManager.getQueueStatus(this.assignmentQueue.length, this.maxQueueSize);
  }

  // Check if queue is at capacity
  isQueueFull(): boolean {
    return this.assignmentQueue.length >= this.maxQueueSize;
  }

  // Get queue utilization percentage
  getQueueUtilization(): number {
    return Math.round((this.assignmentQueue.length / this.maxQueueSize) * 100);
  }

  // NUEVOS MÉTODOS para manejo de cajas disponibles
  cargarCajasDisponibles(): void {
    this.cajasSv.getDisponiblesXSeccion(this.seccionNumero).subscribe({
      next: (cajas: any[]) => {
        // Agregar timestamp a cada caja para orden FIFO
        this.cajasDisponibles = cajas.map((caja, index) => ({
          ...caja,
          timestamp: Date.now() + index // Pequeño offset para mantener orden inicial
        }));
        console.log(`📋 Cajas disponibles cargadas para sección ${this.seccionNumero}:`, this.cajasDisponibles);
      },
      error: (error) => {
        console.error('❌ Error al cargar cajas disponibles:', error);
      }
    });
  }

  actualizarCajaEnLista(data: { nCaja: number, seccion: number, disponible: boolean }): void {
    const indiceExistente = this.cajasDisponibles.findIndex(c => c.nCaja === data.nCaja);
    
    if (data.disponible) {
      // Si la caja está disponible y no está en la lista, agregarla AL FINAL (FIFO)
      if (indiceExistente === -1) {
        this.cajasDisponibles.push({
          nCaja: data.nCaja,
          seccion: data.seccion,
          disponible: true,
          timestamp: Date.now() // Timestamp para mantener orden FIFO
        });
        console.log(`✅ Caja ${data.nCaja} agregada a disponibles (FIFO)`);
      }
    } else {
      // Si la caja no está disponible y está en la lista, quitarla
      if (indiceExistente !== -1) {
        this.cajasDisponibles.splice(indiceExistente, 1);
        console.log(`❌ Caja ${data.nCaja} removida de disponibles`);
      }
    }
    
    // NO ordenar - mantener orden FIFO (First In First Out)
    // La primera caja en la lista es la que lleva más tiempo disponible
  }

  ngOnDestroy(): void {
    // Limpiar timeout para evitar memory leaks
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
    
    // Limpiar cola de asignaciones
    this.assignmentQueue = [];
    this.isProcessingQueue = false;
    
    // Limpiar lista de cajas disponibles
    this.cajasDisponibles = [];
  }
}