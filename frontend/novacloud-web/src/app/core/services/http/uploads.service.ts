import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';

export interface PresignResponse {
  fileId: string;
  uploadUrl: string;
  s3Key: string;
}

export interface CompleteUploadRequest {
  fileId: string;
  fileName: string;
  s3Key: string;
  contentType: string;
  sizeBytes: number;
  tags?: string[];
}

export interface UploadedFileResponse {
  id: string;
  name: string;
  size: string;
  type: string;
  contentType: string;
  tags: string[];
  isStarred: boolean;
  status: string;
  uploadedAt: string;
  trashedAt?: string | null;
}

export interface UploadHandle {
  promise: Promise<UploadedFileResponse>;
  cancel: () => void;
}

@Injectable({ providedIn: 'root' })
export class UploadsService {
  private readonly base = '/api/uploads';

  constructor(private http: HttpClient) {}

  requestPresign(fileName: string, contentType: string, tags: string[] = []): Observable<PresignResponse> {
    return this.http.post<PresignResponse>(`${this.base}/presign`, {
      fileName,
      contentType,
      tags
    });
  }

  completeUpload(request: CompleteUploadRequest): Observable<UploadedFileResponse> {
    return this.http.post<UploadedFileResponse>(`${this.base}/complete`, {
      fileId: request.fileId,
      fileName: request.fileName,
      s3Key: request.s3Key,
      contentType: request.contentType,
      sizeBytes: request.sizeBytes,
      tags: request.tags ?? []
    });
  }

  uploadFile(
    file: File,
    tags: string[] = [],
    onProgress?: (progress: number) => void
  ): UploadHandle {
    let aborted = false;
    let xhr: XMLHttpRequest | null = null;

    const promise = (async () => {
      const contentType = file.type || '';
      const presign = await firstValueFrom(this.requestPresign(file.name, contentType, tags));

      if (aborted) {
        throw new Error('Upload cancelled');
      }

      await this.putFileToPresignedUrl(presign.uploadUrl, file, (progress) => {
        if (aborted) {
          return;
        }

        onProgress?.(progress);
      }, (request) => {
        xhr = request;
      });

      if (aborted) {
        throw new Error('Upload cancelled');
      }

      return firstValueFrom(this.completeUpload({
        fileId: presign.fileId,
        fileName: file.name,
        s3Key: presign.s3Key,
        contentType,
        sizeBytes: file.size,
        tags
      }));
    })().then(response => response);

    return {
      promise,
      cancel: () => {
        aborted = true;
        if (xhr) {
          xhr.abort();
        }
      }
    };
  }

  private putFileToPresignedUrl(
    uploadUrl: string,
    file: File,
    onProgress?: (progress: number) => void,
    onReady?: (xhr: XMLHttpRequest) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      onReady?.(request);
      request.open('PUT', uploadUrl, true);
      request.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress?.(Math.round((event.loaded / event.total) * 100));
        }
      };
      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          onProgress?.(100);
          resolve();
          return;
        }

        reject(new Error(`Upload failed with status ${request.status}`));
      };
      request.onerror = () => reject(new Error('Network error while uploading the file'));
      request.onabort = () => reject(new Error('Upload cancelled'));
      request.send(file.slice());
    });
  }
}
