import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ApiService } from './service/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'ims';
  sidebarActive = false; // Nueva propiedad para controlar el estado del sidebar

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // Método para alternar el sidebar
  toggleSidebar(): void {
    this.sidebarActive = !this.sidebarActive;
    this.cdr.detectChanges(); // Asegura que Angular detecte el cambio
  }

  // Cierra el sidebar al hacer clic en un enlace (solo en móviles)
  closeSidebarOnNavigation(): void {
    if (window.innerWidth < 768) {
      this.sidebarActive = false;
    }
  }

  isAuth(): boolean {
    return this.apiService.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.apiService.isAdmin();
  }

  logOut(): void {
    this.apiService.logout();
    this.router.navigate(['/login']);
    this.cdr.detectChanges();
    this.sidebarActive = false; // Cierra el sidebar al cerrar sesión
  }
}