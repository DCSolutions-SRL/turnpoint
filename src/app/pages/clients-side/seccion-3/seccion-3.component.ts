import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CajasService } from '../../../services/cajas.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { WebsocketService } from '../../../services/websocket.service';
import { SystemConfig, QueueManager, QueueStatus } from '../../../config/system.config';

@Component({
  selector: 'app-seccion-3',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seccion-3.component.html',
  styleUrl: './seccion-3.component.css'
})
export class Seccion3Component implements OnInit, OnDestroy {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  seccionLocal = 'nucleo-2';
  mensajeCaja: string | null = null;
  showVideo: boolean = false;
  videoFadingOut: boolean = false;
  videoTimeout: any;
  messageTimeout: any;
  
  // Cola de asignaciones y control de animaciones
  assignmentQueue: number[] = [];
  isAnimationRunning: boolean = false;
  maxQueueSize: number = SystemConfig.MAX_DISPLAY_QUEUE_SIZE; // Maximum 10 assignments in queue
  
  constructor(private cajasSv: CajasService, private ws: WebsocketService) {}
  
  ngOnInit(): void {
    // Mostrar video inicialmente después de 3 segundos
    this.videoTimeout = setTimeout(() => {
      this.showVideo = true;
      // Esperamos a que el DOM se actualice para acceder al elemento de video
      setTimeout(() => {
        this.playVideo();
      }, 100);
    }, 3000);

    this.ws.startConnection().then(() => {
      this.ws.unirseASeccion(this.seccionLocal);
  
      this.ws.onAsignacion(({ nCaja, seccion }) => {
        if (seccion === this.seccionLocal) {
          console.log(`🟢 Asignación recibida para ${seccion}: Caja ${nCaja}`);
          
          // Check if queue has capacity before adding
          if (QueueManager.canAddToQueue(this.assignmentQueue.length, this.maxQueueSize)) {
            // Agregar asignación a la cola
            this.assignmentQueue.push(nCaja);
            console.log(`✅ Asignación agregada a la cola. Cola actual: ${this.assignmentQueue.length}/${this.maxQueueSize}`);
            
            // Procesar cola si no hay animación corriendo
            if (!this.isAnimationRunning) {
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

  // Nuevo método para procesar la siguiente asignación en la cola
  processNextAssignment(): void {
    if (this.assignmentQueue.length === 0) {
      this.isAnimationRunning = false;
      return;
    }

    this.isAnimationRunning = true;
    const nCaja = this.assignmentQueue.shift()!;

    // Limpiar timeouts existentes
    if (this.videoTimeout) clearTimeout(this.videoTimeout);
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
    
    // Si el video está mostrándose, activar animación de salida
    if (this.showVideo) {
      this.videoFadingOut = true;
      setTimeout(() => {
        this.showVideo = false;
        this.videoFadingOut = false;
        this.mensajeCaja = `${nCaja}`;
        this.scheduleMessageDisappearance();
      }, SystemConfig.FADE_OUT_DURATION); // Tiempo de la animación de fade-out
    } else {
      this.mensajeCaja = `${nCaja}`;
      this.scheduleMessageDisappearance();
    }
  }

  // Nuevo método para programar la desaparición del mensaje
  scheduleMessageDisappearance(): void {
    this.messageTimeout = setTimeout(() => {
      this.mensajeCaja = null;
      
      // Solo mostrar video si no hay más asignaciones en cola
      if (this.assignmentQueue.length > 0) {
        // Procesar inmediatamente la siguiente asignación
        setTimeout(() => {
          this.processNextAssignment();
        }, 100);
      } else {
        // Mostrar video 3 segundos después de que desaparezca el mensaje
        this.showVideoAfterMessage();
      }
    }, SystemConfig.MESSAGE_DISPLAY_DURATION);
  }

  // Método para reproducir el video manualmente
  playVideo(): void {
    if (this.videoPlayer && this.videoPlayer.nativeElement) {
      const video = this.videoPlayer.nativeElement;
      
      // Verificar si el video está cargado
      if (video.readyState >= 2) {
        const playPromise = video.play();
        
        // Manejar el error si el navegador bloquea la reproducción automática
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Error al reproducir el video:', error);
          });
        }
      } else {
        console.log("El video aún no está cargado");
        // Intentar reproducir cuando esté cargado
        video.addEventListener('loadeddata', () => {
          video.play().catch(error => {
            console.error('Error al reproducir el video después de cargar:', error);
          });
        });
      }
    }
  }

  // Actualizar el método que muestra el video después del mensaje
  showVideoAfterMessage(): void {
    this.videoTimeout = setTimeout(() => {
      // Verificar nuevamente si hay asignaciones en cola antes de mostrar video
      if (this.assignmentQueue.length > 0) {
        this.isAnimationRunning = false;
        this.processNextAssignment();
        return;
      }
      
      this.showVideo = true;
      // Esperamos a que el DOM se actualice
      setTimeout(() => {
        this.playVideo();
        // Marcar animación como completada y procesar siguiente
        this.isAnimationRunning = false;
        this.processNextAssignment();
      }, 100);
    }, SystemConfig.VIDEO_TRANSITION_DELAY);
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

  ngOnDestroy(): void {
    // Limpiar timeouts para evitar memory leaks
    if (this.videoTimeout) clearTimeout(this.videoTimeout);
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
    
    // Limpiar cola de asignaciones
    this.assignmentQueue = [];
    this.isAnimationRunning = false;
  }
}
