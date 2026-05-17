import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CloudFolder } from '../../models/cloud-file.model';

@Injectable({ providedIn: 'root' })
export class FoldersService {
  private base = '/api/folders';

  constructor(private http: HttpClient) {}

  listFolders(): Observable<CloudFolder[]> {
    return this.http.get<any[]>(this.base).pipe(
      map(items => items.map(i => this.mapToCloudFolder(i)))
    );
  }

  createFolder(name: string): Observable<any> {
    return this.http.post<any>(this.base, { Name: name });
  }

  private mapToCloudFolder(i: any): CloudFolder {
    return {
      name: i.name || 'Carpeta',
      fileCount: i.fileCount ?? 0,
      totalSize: i.totalSize || '-',
      icon: 'folder',
      iconBgClass: 'bg-slate-50',
      iconTextClass: 'text-slate-600',
      avatars: []
    };
  }
}
