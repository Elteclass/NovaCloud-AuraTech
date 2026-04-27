import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../components/sidebar/sidebar';
import { Topbar } from '../components/topbar/topbar';
import { FilePreviewModalComponent } from '../../../shared/components/file-preview-modal/file-preview-modal.component';
import { FilePreviewService } from '../../../core/services/file-preview.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, Sidebar, Topbar, FilePreviewModalComponent],
  templateUrl: './main-layout.html'
})
export class MainLayout {
  constructor(public filePreviewService: FilePreviewService) {}
}