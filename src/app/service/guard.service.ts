import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GuardService implements CanActivate {

  constructor(private apiService: ApiService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiresAdmin = route.data['requiresAdmin'] || false;

    console.log('[GUARD] Intentando acceder a:', state.url);
    console.log('[GUARD] Token válido:', this.apiService.isAuthenticated());
    console.log('[GUARD] Es Admin:', this.apiService.isAdmin());

    if (requiresAdmin) {
      if (this.apiService.isAdmin()) {
        return true;
      }
    } else {
      if (this.apiService.isAuthenticated()) {
        return true;
      }
    }

    console.warn('[GUARD] Acceso denegado. Redirigiendo al login.');
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}
