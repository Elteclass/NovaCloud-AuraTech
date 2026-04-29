import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface UploadTask {
  name: string;
  size: string;
  progress: number;
  timeRemaining: string;
  status: 'cargando' | 'completado' | 'error';
  icon: string;
  iconBgClass: string;
  iconTextClass: string;
  progressBarClass: string;
}

@Component({
  selector: 'app-upload-page',
  imports: [CommonModule], // ¡Esto soluciona el error de ngClass!
  templateUrl: './upload-page.html'
})
export class UploadPage {
  
  // ¡Esto soluciona el error de uploadTasks!
  uploadTasks: UploadTask[] = [
    {
      name: 'Marketing_Banner_Q4.png',
      size: '12.4 MB',
      progress: 65,
      timeRemaining: '2s restantes',
      status: 'cargando',
      icon: 'image',
      iconBgClass: 'bg-blue-50',
      iconTextClass: 'text-blue-600',
      progressBarClass: 'bg-indigo-800'
    },
    {
      name: 'Product_Demo_Final.mp4',
      size: '156.8 MB',
      progress: 35,
      timeRemaining: '15s restantes',
      status: 'cargando',
      icon: 'movie',
      iconBgClass: 'bg-purple-50',
      iconTextClass: 'text-purple-600',
      progressBarClass: 'bg-indigo-800'
    },
    {
      name: 'Annual_Report_2023.pdf',
      size: '4.2 MB',
      progress: 100,
      timeRemaining: 'Completado',
      status: 'completado',
      icon: 'description',
      iconBgClass: 'bg-emerald-50',
      iconTextClass: 'text-emerald-600',
      progressBarClass: 'bg-emerald-500'
    }
  ];
}