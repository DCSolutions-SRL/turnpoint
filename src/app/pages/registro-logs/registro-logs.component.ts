import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { LogsService } from '../../services/logs.service';
import { UsuariosService } from '../../services/usuarios.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { responseLogs } from '../../models/logs.model';
import { FooterComponent } from '../../shared/footer/footer.component';
import { SeccionService } from '../../services/seccion.service';

@Component({
  selector: 'app-registro-logs',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule, FooterComponent],
  templateUrl: './registro-logs.component.html',
  styleUrl: './registro-logs.component.css'
})
export class RegistroLogsComponent implements OnInit {
  logs: any[] = [];
  username: string = '';
  isSearching: boolean = false;
  currentUserId: number | null = null;
  
  // Manejo de usuarios
  allUsers: any[] = [];
  filteredUsers: any[] = [];
  selectedUser: any = null;
  showUserDropdown: boolean = false;

  // Manejo de secciones
  allSecciones: any[] = [];
  selectedSeccionId: number | null = null;

  // Manejo de modo de búsqueda
  searchMode: 'none' | 'user' | 'section' = 'none';
  
  // Paginado
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 1;
  showPagination: boolean = false;
  
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private logsService: LogsService,
    private usuariosService: UsuariosService,
    private seccionService: SeccionService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadSecciones();
    this.loadInitialLogs();
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

  loadSecciones(): void {
    this.seccionService.getSecciones().subscribe({
      next: (response) => {
        this.allSecciones = response.data;
        console.log('Secciones cargadas:', this.allSecciones);
      },
      error: (err) => {
        console.error('Error al cargar secciones:', err);
      }
    });
  }

  loadInitialLogs(): void {
    this.loading = true;
    this.logsService.getLogs().subscribe({
      next: (data) => {
        console.log(data);
        // Chequear si la respuesta es un objeto con data y totalPaginas
        if (data.data && data.totalPaginas) {
          this.logs = data.data;
          this.totalPages = data.totalPaginas;
          this.totalItems = data.registros;
          this.currentPage = data.paginaActual;
          this.showPagination = data.totalPaginas > 1;
        } else {
          this.logs = data;
          this.showPagination = false;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar logs';
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
    this.logsService.getLogsPorUsuario(this.currentUserId, this.itemsPerPage, this.currentPage).subscribe({
      next: (response: responseLogs) => {
        console.log(response);
        this.logs = response.data;
        this.totalItems = response.registros;
        this.totalPages = response.totalPaginas;
        this.currentPage = response.paginaActual;
        this.showPagination = response.totalPaginas > 1;
        this.loading = false;
        this.isSearching = false;
      },
      error: (err) => {
        this.error = 'Error al cargar logs del usuario';
        this.loading = false;
        this.isSearching = false;
      }
    });
  }

  onSeccionChange(): void {
    if (!this.selectedSeccionId) {
      this.resetToDefault();
      return;
    }
    
    this.currentPage = 1;
    this.loadSeccionLogs();
  }

  loadSeccionLogs(): void {
    if (!this.selectedSeccionId) return;
    
    this.loading = true;
    this.logsService.getLogsPorSeccion(this.selectedSeccionId, this.itemsPerPage, this.currentPage).subscribe({
      next: (response: responseLogs) => {
        console.log(response);
        this.logs = response.data;
        this.totalItems = response.registros;
        this.totalPages = response.totalPaginas;
        this.currentPage = response.paginaActual;
        this.showPagination = response.totalPaginas > 1;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar logs de la sección';
        this.loading = false;
      }
    });
  }

  toggleSearchMode(mode: 'user' | 'section'): void {
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
    
    // Reset section search
    this.selectedSeccionId = null;
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
    } else if (this.searchMode === 'section' && this.selectedSeccionId) {
      this.loadSeccionLogs();
    }
  }

  clearSearch(): void {
    this.resetToDefault();
  }

  exportLogs(): void {
    this.loading = true;
    this.logsService.exportLogs().subscribe({
      next: (blob: Blob) => {
        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary anchor element to trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Inicios_de_sesion.csv';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al exportar logs:', err);
        this.error = 'Error al exportar los registros';
        this.loading = false;
      }
    });
  }
}
