import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FolderModalService {
  // Usamos Signals, igual que en el PR anterior, para manejar el estado de apertura
  isOpen = signal<boolean>(false);
  refreshTick = signal<number>(0);

  openModal() {
    this.isOpen.set(true);
  }

  closeModal() {
    this.isOpen.set(false);
  }

  notifyFolderCreated() {
    this.refreshTick.update(value => value + 1);
  }
}