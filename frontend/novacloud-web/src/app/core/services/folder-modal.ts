import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FolderModalService {
  // Usamos Signals, igual que en el PR anterior, para manejar el estado de apertura
  isOpen = signal<boolean>(false);

  openModal() {
    this.isOpen.set(true);
  }

  closeModal() {
    this.isOpen.set(false);
  }
}