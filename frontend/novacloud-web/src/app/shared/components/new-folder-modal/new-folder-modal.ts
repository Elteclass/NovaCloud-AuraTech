import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FolderModalService } from '../../../core/services/folder-modal';

@Component({
  selector: 'app-new-folder-modal',
  imports: [CommonModule],
  templateUrl: './new-folder-modal.html'
})
export class NewFolderModal {
  // Inyectamos el servicio
  modalService = inject(FolderModalService);

  close() {
    this.modalService.closeModal();
  }

  createFolder(folderName: string) {
    if (!folderName.trim()) return;
    
    // Aquí en el futuro se conectará con la API
    console.log('Carpeta creada:', folderName);
    this.close();
  }
}