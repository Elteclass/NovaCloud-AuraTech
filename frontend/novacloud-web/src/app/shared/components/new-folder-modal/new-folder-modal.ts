import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FolderModalService } from '../../../core/services/folder-modal';
import { FoldersService } from '../../../core/services/http/folders.service';

@Component({
  selector: 'app-new-folder-modal',
  imports: [CommonModule],
  templateUrl: './new-folder-modal.html'
})
export class NewFolderModal {
  // Inyectamos el servicio
  modalService = inject(FolderModalService);
  private readonly foldersService = inject(FoldersService);

  close() {
    this.modalService.closeModal();
  }

  createFolder(folderName: string) {
    if (!folderName.trim()) return;

    this.foldersService.createFolder(folderName.trim()).subscribe({
      next: () => {
        this.close();
        this.modalService.notifyFolderCreated();
      },
      error: () => alert('No se pudo crear la carpeta')
    });
  }
}