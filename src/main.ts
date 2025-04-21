import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Añade esto para detectar el viewport
const setViewportHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// Inicializa y añade listener para cambios de tamaño
setViewportHeight();
window.addEventListener('resize', setViewportHeight);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));