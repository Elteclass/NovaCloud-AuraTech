import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloudFile, CloudFolder } from '../../../core/models/cloud-file.model';
import { FileCard } from '../../../shared/components/file-card/file-card';

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, FileCard],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss'
})
export class DashboardPage {
  viewMode: 'grid' | 'list' = 'grid';

  availableTags: string[] = ['#Estrategia', '#Confidencial', '#Borrador', '#Finanzas', '#Aprobado', '#Urgente'];
  selectedTag: string | null = null;

  toggleViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  toggleTag(tag: string) {
    if (this.selectedTag === tag) {
      this.selectedTag = null;
    } else {
      this.selectedTag = tag;
    }
  }

  get filteredFiles(): CloudFile[] {
    if (!this.selectedTag) {
      return this.files;
    }
    return this.files.filter(f => f.tags && f.tags.includes(this.selectedTag!));
  }

  // ── Mock: Carpetas Generales ──
  folders: CloudFolder[] = [
    {
      name: 'Documentos Personales',
      fileCount: 45,
      totalSize: '850 MB',
      icon: 'folder_shared',
      iconBgClass: 'bg-blue-50',
      iconTextClass: 'text-blue-600',
      avatars: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAadm_JsHxvP9_xsQXFiiaNF0Hv5gnhU-WPM-atnfOCa8x7C_Y9usJRJWqr8dekBkDPpZ01B3zbbuIW5IYBwqs7t4KcNZr3HKtEqWIu85vVtWykehMO8glqAy8g5vu5WvNxSHuoXBAqZZGuKCzzV6sMM6cn1qyocsDL_vQOIwhcJH1v5xXxCcP6XktfV49AxU2kGIRyXDef7iYMRs95FeC9QgqTuZQuqg0nFBzv-C0tqAmxLkAmjvwX-T9iXxxiD-2owx6mFg9FwcqD',
      ],
    },
    {
      name: 'Respaldos del Sistema',
      fileCount: 12,
      totalSize: '4.5 GB',
      icon: 'cloud_sync',
      iconBgClass: 'bg-purple-50',
      iconTextClass: 'text-purple-600',
      avatars: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD5OCwzHUKWjO0s9yQMbBg3GbJjOdUIV7op6xp4W8EWsahhyNtgJ63mANzfQ9RwLUwjBbr2zgdz9B2jwGUNJ70ts0m7qcbx-9tjAqQjDuZ0VJfTZ7tzfcbAp1yMZ5mgu9ssiXXRFtkIt2ZuJb8DkjVIXsyH04aJWXfNwwhlL7YO60zJJBYrJP45H-ihP6bca8uPC__rdtd2pz9WN_GIBGNuO7QRqtDmrg-M5i28vDpW_2nRNAadnQ1Qv0mha637BQo09KyWUAQ1KKig',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCWUmBNxM0P8c48yu81qmo8yTSkG6j20ckw4qSfKyFlH4mPjC0JknyBGMNSz9sI3RnhbPv8SRNnHHZo2Jgre4jRXafBPBB_pAm8wBP81L9R3ORwZPw4m3rOX-vJKvwfTjdMjlh2JHAV-47oNg83Zs7pXxfKGUIRn-FBGcS2POzTff9KCqcZl_bfR5RZY0oQQ1hadez2CDA7NtWLK9d6fENFBhpdEd5zd3iV4lMyLJynXRTUmVlUuc-JGsxgZL8mBRFd0avwmzmfNG0z',
      ],
      extraAvatars: 1,
    },
    {
      name: 'Proyectos Activos',
      fileCount: 89,
      totalSize: '2.1 GB',
      icon: 'work',
      iconBgClass: 'bg-emerald-50',
      iconTextClass: 'text-emerald-600',
      avatars: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAdKIfDEkf-oWxjP8QH-BCbEfkS4QmeXK6pANagstFU9obv0IKbSnu8JZ05WrGEynOQLMeRKcEEeflQ5-6qBFdl4PAeZg8QPtSQtRhbszVvuxWw_iMH6SLfwwbeTvZyhe3QO4_kTrSxrEpxNdNCV9qoZ85ievH0iU1fYFsp56pCmx42_mceYcVr3K_92HyO12ic3AP8qrjt2PxQ4VofbVCWrsdNXeS_F9q-bwI_f0rt5nUxSYKl-yT9KaDH9yVZwhSHiDKZkYlZVpzp',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDzcvUXPeuk26id3GdChncVaUp_ggAsnyNmPeURj2nC0GySws7xMWMnETPu6HpH_RdqRfqz2nUANCzhM8qG174hWYiHr2d0KyGKAV_mX6pcvQ6CkkE4brtpJSy5av21rZl-Nfbnbz_u_N6MazUSvdTPTGWD-AW5lcD6hNQsyFrMqpX92Vk_SjUeMVPuuS77Ha3y1veCysg7seRqM305dEQ8OdJm5LAE_siwgot6kKE1EQmmI7ydg6uo-GrG_nUSglqEWppgjeWAvao2',
      ],
      extraAvatars: 5,
    },
  ];

  // ── Mock: Archivos Generales ──
  files: CloudFile[] = [
    { name: 'Manual_Usuario_v2.pdf',    size: '2.5 MB', type: 'pdf',  uploadDate: new Date('2026-01-15'), timeAgo: 'Hace 3 meses', owner: 'Ana Torres', tags: ['#Confidencial', '#Borrador'] },
    { name: 'Especificaciones_UI.docx', size: '1.2 MB', type: 'doc',  uploadDate: new Date('2026-02-10'), timeAgo: 'Hace 2 meses', owner: 'Luis Mendoza', tags: ['#Estrategia'] },
    { name: 'Reporte_Anual_2025.pdf',   size: '4.8 MB', type: 'pdf',  uploadDate: new Date('2026-03-01'), timeAgo: 'Hace 1 mes', owner: 'Carlos Ruiz', tags: ['#Finanzas', '#Aprobado'] },
    { name: 'Presupuesto_Nova.xlsx',    size: '3.1 MB', type: 'xlsx', uploadDate: new Date('2026-03-20'), timeAgo: 'Hace 3 semanas', owner: 'Ana Torres', tags: ['#Finanzas', '#Confidencial'] },
    { name: 'Logo_AuraTech.jpg',        size: '8.2 MB', type: 'jpg',  uploadDate: new Date('2026-04-05'), timeAgo: 'Hace 2 semanas', owner: 'Marketing Team', tags: ['#Aprobado'] },
    { name: 'Minuta_Reunion.pdf',       size: '1.5 MB', type: 'pdf',  uploadDate: new Date('2026-04-15'), timeAgo: 'Hace 6 días', owner: 'Luis Mendoza', tags: ['#Urgente'] },
  ];
}