import { Component } from '@angular/core';
import { CloudFile } from '../../../core/models/cloud-file.model';
import { FileCard } from '../../../shared/components/file-card/file-card';
// Importamos los componentes del layout (asegúrate de que las rutas sean correctas)
import { Sidebar } from '../components/sidebar/sidebar';
import { Topbar } from '../components/topbar/topbar';

@Component({
  selector: 'app-dashboard-page',
  // Importante: Aquí declaramos que este componente usará a sus "hijos"
  imports: [FileCard, Sidebar, Topbar], 
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss'
})
export class DashboardPage {
  
  // Aquí declaramos el arreglo de Mocks (datos falsos)
  mockFiles: CloudFile[] = [
    { name: 'Plan_Estrategico_2026.pdf', size: '2.5 MB', type: 'pdf', uploadDate: new Date('2026-04-01') },
    { name: 'Contrato_SaaS_B2B.doc', size: '1.2 MB', type: 'doc', uploadDate: new Date('2026-04-03') },
    { name: 'Analisis_Costos.pdf', size: '4.8 MB', type: 'pdf', uploadDate: new Date('2026-04-05') },
    { name: 'Minuta_Reunion.doc', size: '850 KB', type: 'doc', uploadDate: new Date('2026-04-06') }
  ];

}
