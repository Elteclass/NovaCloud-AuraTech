import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { CloudFile } from '../../../core/models/cloud-file.model'; 

@Component({
  selector: 'app-file-card',
  imports: [CommonModule], // Agregamos CommonModule aquí para usar las clases dinámicas y fechas
  templateUrl: './file-card.html',
  styleUrl: './file-card.scss',
})
export class FileCard {
  // Recibimos la información estrictamente por Input
  @Input({ required: true }) file!: CloudFile;
}