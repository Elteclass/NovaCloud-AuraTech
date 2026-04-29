import { Injectable, signal } from '@angular/core';
import { CloudFile } from '../models/cloud-file.model';

@Injectable({
  providedIn: 'root'
})
export class ContextMenuService {
  isOpen = signal<boolean>(false);
  position = signal<{ x: number; y: number }>({ x: 0, y: 0 });
  selectedFile = signal<CloudFile | null>(null);

  openMenu(event: MouseEvent, file: CloudFile) {
    event.preventDefault(); // ¡Magia! Esto bloquea el menú normal del navegador
    this.position.set({ x: event.clientX, y: event.clientY });
    this.selectedFile.set(file);
    this.isOpen.set(true);
  }

  closeMenu() {
    this.isOpen.set(false);
  }
}