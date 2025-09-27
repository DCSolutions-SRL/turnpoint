import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { CajaEstadoLogService } from '../../services/caja-estado-log.service';
import { UsuariosService } from '../../services/usuarios.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResponseCajaEstadoLogs } from '../../models/caja-estado-log.model';
import { FooterComponent } from '../../shared/footer/footer.component';
import { CajasService } from '../../services/cajas.service';
import { WebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-atencion-cliente',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule, FooterComponent],
  templateUrl: './atencion-cliente.component.html',
  styleUrl: './atencion-cliente.component.css'
})
export class AtencionClienteComponent implements OnInit {
  logs: any[] = [];
  username: string = '';
  isSearching: boolean = false;
  currentUserId: number | null = null;
  
  // Manejo de usuarios
  allUsers: any[] = [];
  filteredUsers: any[] = [];
  selectedUser: any = null;
  showUserDropdown: boolean = false;

  // Manejo de cajas
  allCajas: any[] = [];
  selectedCajaId: number | null = null;

  // Manejo de modo de búsqueda
  searchMode: 'none' | 'user' | 'caja' = 'none';
  
  // Paginado
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 1;
  showPagination: boolean = false;
  
  loading: boolean = false;
  error: string | null = null;
  
  // WebSocket status
  websocketConnected: boolean = false;
  lastUpdate: Date | null = null;
  
  // Export status
  isExporting: boolean = false;

  constructor(
    private cajaEstadoLogService: CajaEstadoLogService,
    private usuariosService: UsuariosService,
    private cajasService: CajasService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadCajas();
    this.loadInitialLogs();
    this.initializeWebSocket();
  }

  loadUsers(): void {
    this.usuariosService.getUsuarios(undefined, false).subscribe({
      next: (users) => {
        this.allUsers = users;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
      }
    });
  }

  loadCajas(): void {
    this.cajasService.getCajas().subscribe({
      next: (response) => {
        // Manejar diferentes estructuras de respuesta del backend
        this.allCajas = response.response || response.data || response;
        console.log('Cajas cargadas:', this.allCajas);
      },
      error: (err) => {
        console.error('Error al cargar cajas:', err);
      }
    });
  }

  loadInitialLogs(): void {
    this.loading = true;
    this.error = null;
    this.cajaEstadoLogService.getLogs().subscribe({
      next: (response: ResponseCajaEstadoLogs) => {
        console.log('Respuesta de getLogs:', response);
        if (response && response.response) {
          this.logs = response.response || [];
          // El backend no devuelve información de paginación, así que manejamos todo en una página
          this.totalPages = 1;
          this.totalItems = this.logs.length;
          this.currentPage = 1;
          this.showPagination = false; // Deshabilitamos paginación por ahora
          
          console.log(`✅ Logs cargados exitosamente: ${this.logs.length} registros`);
          console.log('Primeros 3 logs:', this.logs.slice(0, 3));
        } else {
          // Si no hay estructura esperada, intentar usar la respuesta directamente
          this.logs = Array.isArray(response) ? response : [];
          this.showPagination = false;
          this.totalItems = this.logs.length;
          
          console.log('⚠️ Estructura de respuesta inesperada:', response);
        }
        
        if (this.logs.length === 0) {
          console.warn('No se encontraron logs');
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar logs:', err);
        this.error = 'Error al cargar logs de estado de cajas. ' + (err.error?.message || 'Verifique la conexión con el servidor.');
        this.logs = [];
        this.loading = false;
      }
    });
  }

  onUsernameInput(): void {
    if (!this.username.trim()) {
      this.filteredUsers = [];
      this.showUserDropdown = false;
      this.selectedUser = null;
      this.currentUserId = null;
      if (this.searchMode === 'user') {
        this.resetToDefault();
      }
      return;
    }

    const searchTerm = this.username.toLowerCase();
    const allFilteredUsers = this.allUsers.filter(user => 
      `${user.apellido} ${user.nombre}`.toLowerCase().includes(searchTerm) ||
      user.usuario.toLowerCase().includes(searchTerm)
    );
    
    this.filteredUsers = allFilteredUsers.slice(0, 5);
    this.showUserDropdown = true; 
    console.log('Filtered users:', this.filteredUsers);
    console.log('Show dropdown:', this.showUserDropdown);
  }

  selectUser(user: any): void {
    this.selectedUser = user;
    this.username = `${user.apellido} ${user.nombre}`;
    this.currentUserId = user.idUsuario;
    this.showUserDropdown = false;
    this.currentPage = 1;
    this.loadUserLogs();
  }

  searchUser(): void {
    if (this.selectedUser) {
      this.loadUserLogs();
    } else {
      this.onUsernameInput();
    }
  }

  loadUserLogs(): void {
    if (!this.currentUserId) return;
    
    this.loading = true;
    this.error = null;
    this.cajaEstadoLogService.getLogsByUsuario(this.currentUserId).subscribe({
      next: (response: ResponseCajaEstadoLogs) => {
        console.log('Respuesta de getLogsByUsuario:', response);
        this.logs = response.response || [];
        this.totalItems = this.logs.length;
        this.totalPages = 1;
        this.currentPage = 1;
        this.showPagination = false;
        
        if (this.logs.length === 0) {
          this.error = `No se encontraron logs para el usuario ${this.selectedUser?.apellido} ${this.selectedUser?.nombre}`;
        }
        
        this.loading = false;
        this.isSearching = false;
      },
      error: (err) => {
        console.error('Error al cargar logs del usuario:', err);
        this.error = 'Error al cargar logs del usuario: ' + (err.error?.message || 'Usuario no encontrado o sin actividad registrada');
        this.logs = [];
        this.loading = false;
        this.isSearching = false;
      }
    });
  }

  onCajaChange(): void {
    if (!this.selectedCajaId) {
      this.resetToDefault();
      return;
    }
    
    this.currentPage = 1;
    this.loadCajaLogs();
  }

  loadCajaLogs(): void {
    if (!this.selectedCajaId) return;
    
    this.loading = true;
    this.error = null;
    const selectedCaja = this.allCajas.find(c => c.idCaja === this.selectedCajaId);
    
    this.cajaEstadoLogService.getLogsByCaja(this.selectedCajaId).subscribe({
      next: (response: ResponseCajaEstadoLogs) => {
        console.log('Respuesta de getLogsByCaja:', response);
        this.logs = response.response || [];
        this.totalItems = this.logs.length;
        this.totalPages = 1;
        this.currentPage = 1;
        this.showPagination = false;
        
        if (this.logs.length === 0) {
          const cajaNombre = selectedCaja?.nCaja || selectedCaja?.numeroCaja || this.selectedCajaId;
          this.error = `No se encontraron logs para la caja ${cajaNombre}`;
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar logs de la caja:', err);
        this.error = 'Error al cargar logs de la caja: ' + (err.error?.message || 'Caja no encontrada o sin actividad registrada');
        this.logs = [];
        this.loading = false;
      }
    });
  }

  toggleSearchMode(mode: 'user' | 'caja'): void {
    if (this.searchMode === mode) {
      // If clicking the same mode, reset to default
      this.resetToDefault();
    } else {
      // Switch to the new mode and reset the other
      this.resetSearchData();
      this.searchMode = mode;
    }
  }

  resetSearchData(): void {
    // Reset user search
    this.username = '';
    this.currentUserId = null;
    this.selectedUser = null;
    this.filteredUsers = [];
    this.showUserDropdown = false;
    
    // Reset caja search
    this.selectedCajaId = null;
  }

  resetToDefault(): void {
    this.resetSearchData();
    this.searchMode = 'none';
    this.currentPage = 1;
    this.loadInitialLogs();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    
    this.currentPage = page;
    if (this.searchMode === 'user' && this.currentUserId) {
      this.loadUserLogs();
    } else if (this.searchMode === 'caja' && this.selectedCajaId) {
      this.loadCajaLogs();
    }
  }

  clearSearch(): void {
    this.resetToDefault();
  }

  getEstadoClass(estado: string): string {
    return estado === 'Ocupado' ? 'badge bg-warning text-dark' : 'badge bg-success';
  }

  getTipoEventoClass(tipoEvento: string): string {
    switch(tipoEvento) {
      case 'MANUAL':
        return 'badge bg-primary';
      case 'LOGIN':
        return 'badge bg-info';
      case 'LOGOUT':
        return 'badge bg-secondary';
      case 'AUTOMATICO':
        return 'badge bg-dark';
      default:
        return 'badge bg-light text-dark';
    }
  }

  // Inicializar WebSocket para recibir actualizaciones en tiempo real
  initializeWebSocket(): void {
    this.websocketService.startConnection().then(() => {
      console.log('✅ WebSocket conectado en atención al cliente');
      this.websocketConnected = true;
      
      // Escuchar cambios de estado de cajas para actualizar la vista en tiempo real
      this.websocketService.onCambioEstadoCaja((data) => {
        console.log('🔄 Cambio de estado recibido en atención al cliente:', data);
        this.lastUpdate = new Date();
        
        // Si estamos mostrando logs y hay un cambio, recargar para mostrar el nuevo registro
        this.refreshLogsAfterStateChange();
      });
    }).catch(err => {
      console.error('❌ Error al conectar WebSocket en atención al cliente:', err);
      this.websocketConnected = false;
    });
  }

  // Refrescar logs después de un cambio de estado para mostrar los nuevos registros
  refreshLogsAfterStateChange(): void {
    // Esperar un momento para que el backend procese el cambio y lo registre
    setTimeout(() => {
      if (this.searchMode === 'user' && this.currentUserId) {
        this.loadUserLogs();
      } else if (this.searchMode === 'caja' && this.selectedCajaId) {
        this.loadCajaLogs();
      } else {
        this.loadInitialLogs();
      }
    }, 1000); // Esperar 1 segundo para que el backend registre el cambio
  }

  exportLogs(): void {
    this.isExporting = true;
    this.cajaEstadoLogService.exportLogs().subscribe({
      next: (blob: Blob) => {
        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary anchor element to trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Estados_de_cajas.csv';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.isExporting = false;
      },
      error: (err) => {
        console.error('Error al exportar logs:', err);
        this.error = 'Error al exportar los registros';
        this.isExporting = false;
      }
    });
  }

  // Método de diagnóstico para verificar la conexión con la API
  testApiConnection(): void {
    this.loading = true;
    this.error = null;
    
    console.log('Probando conexión con la API...');
    this.cajaEstadoLogService.testConnection().subscribe({
      next: (response) => {
        console.log('Conexión exitosa:', response);
        this.error = 'Conexión con la API establecida correctamente. Reintentando cargar logs...';
        // Reintentar cargar los logs
        setTimeout(() => {
          this.loadInitialLogs();
        }, 1000);
      },
      error: (err) => {
        console.error('Error de conexión:', err);
        this.error = `Error de conectividad: ${err.status} - ${err.statusText || 'No se puede conectar con el servidor'}`;
        this.loading = false;
      }
    });
  }
}