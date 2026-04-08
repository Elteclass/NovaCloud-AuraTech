// src/app/core/models/cloud-file.model.ts

export interface CloudFile {
  name: string;
  size: string;
  type: 'pdf' | 'doc'; // Esto restringe el tipo a solo estas dos opciones
  uploadDate: Date;
}