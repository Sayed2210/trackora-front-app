import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ShipmentRepository, BulkUploadResultDto } from '@trackora/shared/data-access';

interface UploadProgress {
  filename: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  message?: string;
  result?: BulkUploadResultDto;
}

@Component({
  selector: 'app-bulk-upload-page',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="bulk-upload">
      <h1>{{ 'shipments.bulkUpload' | translate }}</h1>
      <div
        class="drop-zone"
        [class.dragover]="isDragOver()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        <input
          #fileInput
          type="file"
          accept=".csv,.xlsx,.xls"
          multiple
          hidden
          (change)="onFileSelected($event)"
        />
        <div class="drop-zone-content">
          <span class="icon">📁</span>
          <p>Drag & drop CSV or Excel files here, or click to browse</p>
          <small>Supported formats: .csv, .xlsx, .xls (max 5MB, max 5,000 rows)</small>
        </div>
      </div>

      <div class="upload-list" *ngIf="uploads().length">
        <h3>Upload Progress</h3>
        <div class="upload-item" *ngFor="let upload of uploads()">
          <div class="upload-info">
            <span class="filename">{{ upload.filename }}</span>
            <span class="status" [class]="upload.status">{{ upload.status }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="upload.progress"></div>
          </div>
          <span class="message" *ngIf="upload.message">{{ upload.message }}</span>

          <!-- Results -->
          <div class="result" *ngIf="upload.result">
            <div class="result-summary">
              <span class="success">✅ {{ upload.result.successCount }} created</span>
              <span class="fail" *ngIf="upload.result.failedCount > 0">❌ {{ upload.result.failedCount }} failed</span>
            </div>
            <div class="errors" *ngIf="upload.result.errors.length">
              <details>
                <summary>View errors ({{ upload.result.errors.length }})</summary>
                <table class="error-table">
                  <tr *ngFor="let err of upload.result.errors">
                    <td>Row {{ err.rowIndex }}</td>
                    <td>{{ err.message }}</td>
                  </tr>
                </table>
              </details>
            </div>
          </div>
        </div>
      </div>

      <div class="template-section">
        <h3>Template</h3>
        <p>Download the template file to ensure correct formatting. Include a <code>zone</code> column with an existing zone code or Arabic name:</p>
        <button class="p-button p-button-secondary" (click)="downloadTemplate()">
          Download CSV Template
        </button>
      </div>
    </div>
  `,
  styles: [`
    .bulk-upload { padding: 1rem; max-width: 800px; }
    .drop-zone {
      border: 2px dashed var(--trackora-border);
      border-radius: 12px;
      padding: 3rem 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      background: var(--trackora-surface);
      margin: 1rem 0;
    }
    .drop-zone.dragover {
      border-color: var(--trackora-primary);
      background: rgba(0, 31, 63, 0.05);
    }
    .drop-zone-content .icon { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
    .drop-zone-content p { margin: 0; color: var(--trackora-text); font-weight: 500; }
    .drop-zone-content small { color: var(--trackora-text-secondary); }
    .upload-list { margin-top: 1.5rem; }
    .upload-item {
      background: white;
      border: 1px solid var(--trackora-border);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 0.75rem;
    }
    .upload-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .filename { font-weight: 500; }
    .status { font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 4px; text-transform: uppercase; font-weight: 600; }
    .status.pending { background: #F3F4F6; color: #4B5563; }
    .status.uploading { background: #DBEAFE; color: #1E40AF; }
    .status.processing { background: #FEF3C7; color: #92400E; }
    .status.completed { background: #D1FAE5; color: #065F46; }
    .status.error { background: #FEE2E2; color: #991B1B; }
    .progress-bar { height: 6px; background: var(--trackora-border); border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--trackora-primary); transition: width 0.3s; }
    .message { font-size: 0.875rem; color: var(--trackora-text-secondary); margin-top: 0.25rem; display: block; }
    .result { margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--trackora-border); }
    .result-summary { display: flex; gap: 1rem; margin-bottom: 0.5rem; }
    .result-summary .success { color: #065F46; font-weight: 500; }
    .result-summary .fail { color: #991B1B; font-weight: 500; }
    .errors details { font-size: 0.875rem; }
    .error-table { width: 100%; font-size: 0.75rem; margin-top: 0.5rem; }
    .error-table td { padding: 0.25rem; border-bottom: 1px solid var(--trackora-border); }
    .template-section { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--trackora-border); }
    .template-section h3 { margin-bottom: 0.5rem; }
    .p-button-secondary { background: var(--trackora-surface); color: var(--trackora-primary); border: 1px solid var(--trackora-primary); padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
  `],
})
export class BulkUploadPageComponent {
  private readonly repo = inject(ShipmentRepository);
  readonly isDragOver = signal(false);
  readonly uploads = signal<UploadProgress[]>([]);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const files = event.dataTransfer?.files;
    if (files) this.handleFiles(files);
  }

  onFileSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files) this.handleFiles(files);
  }

  private handleFiles(files: FileList): void {
    Array.from(files).forEach((file) => {
      const upload: UploadProgress = {
        filename: file.name,
        status: 'pending',
        progress: 0,
      };
      this.uploads.update((list) => [...list, upload]);
      this.doUpload(upload, file);
    });
  }

  private doUpload(upload: UploadProgress, file: File): void {
    upload.status = 'uploading';
    upload.progress = 30;
    this.uploads.update((list) => [...list]);

    this.repo.bulkUpload(file).subscribe({
      next: (result) => {
        upload.status = 'completed';
        upload.progress = 100;
        upload.result = result;
        upload.message = `${result.successCount} created, ${result.failedCount} failed`;
        this.uploads.update((list) => [...list]);
      },
      error: (err) => {
        upload.status = 'error';
        upload.progress = 100;
        upload.message = err?.message || 'Upload failed';
        this.uploads.update((list) => [...list]);
      },
    });
  }

  downloadTemplate(): void {
    const csv =
      'customerName,customerPhone,customerPhone2,addressText,address,type,codAmount,productDescription,productValue,weight,pieces,notes,zone,preferredDeliveryDate\n' +
      'Ahmed Mohamed,01001234567,,Nasr City near Carrefour,,COD,150,Shoes,120,1,1,Leave at reception,Maadi,2026-05-15\n' +
      'Sara Khaled,01009876543,,Maadi Street 9 behind metro,,COD,200,Bag,250,0.5,1,Call before delivery,Maadi,\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shipment_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
