import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CloudFile, StorageInfo } from '../../models/cloud-file.model';

@Injectable({ providedIn: 'root' })
export class FilesService {
  private base = '/api/files';

  constructor(private http: HttpClient) {}

  listFiles(filter?: string, tag?: string): Observable<CloudFile[]> {
    let params = new HttpParams();
    if (filter) params = params.set('filter', filter);
    if (tag) params = params.set('tag', tag);

    return this.http.get<any[]>(this.base, { params }).pipe(
      map(items => items.map(i => this.mapToCloudFile(i)))
    );
  }

  getFileById(id: string): Observable<CloudFile> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(map(i => this.mapToCloudFile(i)));
  }

  getDownloadUrl(id: string): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.base}/${id}/download`);
  }

  starFile(id: string): Observable<any> {
    return this.http.post<any>(`${this.base}/${id}/star`, {});
  }

  trashFile(id: string): Observable<any> {
    return this.http.post<any>(`${this.base}/${id}/trash`, {});
  }

  restoreFile(id: string): Observable<any> {
    return this.http.post<any>(`${this.base}/${id}/restore`, {});
  }

  deleteFile(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  renameFile(id: string, newName: string): Observable<any> {
    return this.http.patch<any>(`${this.base}/${id}/rename`, { newName });
  }

  getStorageUsage(): Observable<StorageInfo> {
    return this.http.get<any>('/api/storage/usage').pipe(
      map(info => ({
        usedGB: this.bytesToGB(info.usedBytes),
        totalGB: this.bytesToGB(info.totalBytes),
        percentage: info.percentage ?? 0,
      }))
    );
  }

  private mapToCloudFile(i: any): CloudFile {
    return {
      name: i.name || i.fileName || 'unknown',
      size: i.size || i.humanSize || (i.sizeBytes ? `${i.sizeBytes} B` : '0 B'),
      type: (i.type || i.contentType || '').split('/').pop() as any || 'pdf',
      uploadDate: i.uploadedAt ? new Date(i.uploadedAt) : new Date(),
      timeAgo: undefined,
      owner: i.ownerName || i.owner || undefined,
      tags: i.tags || [] ,
      aiSummary: i.aiSummary || undefined,
      aiTags: i.aiTags || undefined
    } as CloudFile;
  }

  private bytesToGB(bytes: number | undefined): number {
    if (!bytes || bytes <= 0) {
      return 0;
    }

    return Number((bytes / 1_073_741_824).toFixed(1));
  }
}
