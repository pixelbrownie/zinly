import {
  Component, OnInit, signal, computed, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  trigger, state, style, animate, transition, keyframes, query, stagger
} from '@angular/animations';
import { ZineService, Zine, ZineCell } from '../../core/services/zine.service';
import { ToastService } from '../../core/services/toast.service';

/** The 8 cells in grid order, left-to-right, top-row then bottom-row */
export const GRID_CELLS = [
  { key: 'page4', label: '4',     row: 'top',    rotated: true },
  { key: 'page3', label: '3',     row: 'top',    rotated: true },
  { key: 'page2', label: '2',     row: 'top',    rotated: true },
  { key: 'page1', label: '1',     row: 'top',    rotated: true },
  { key: 'page5', label: '5',     row: 'bottom', rotated: false },
  { key: 'page6', label: '6',     row: 'bottom', rotated: false },
  { key: 'back',  label: 'back',  row: 'bottom', rotated: false },
  { key: 'cover', label: 'cover', row: 'bottom', rotated: false },
];

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [
    // ── Fold animation for individual columns ──
    trigger('foldCol', [
      state('open', style({ transform: 'rotateY(0deg)', opacity: 1 })),
      state('folding', style({ transform: 'rotateY(90deg)', opacity: 0 })),
      transition('open => folding', animate('500ms {{ delay }}ms cubic-bezier(0.4,0,0.2,1)'),
        { params: { delay: 0 } }),
    ]),
    // ── Grid fade-out ──
    trigger('gridFade', [
      transition(':leave', animate('300ms ease', style({ opacity: 0, transform: 'scale(0.95)' }))),
    ]),
    // ── Book appear ──
    trigger('bookAppear', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.7) rotateY(-30deg)' }),
        animate('600ms 200ms cubic-bezier(0.34,1.56,0.64,1)',
          style({ opacity: 1, transform: 'scale(1) rotateY(0deg)' })),
      ]),
    ]),
  ],
  template: `
    <div class="editor-page stars-bg">

      <!-- Header -->
      <header class="editor-header">
        <div class="editor-header-inner">
          <div class="editor-title-area">
            <input
              class="title-input"
              [(ngModel)]="zineTitleModel"
              placeholder="my zine title..."
              (blur)="autoSave()"
            />
          </div>
          <div class="editor-actions">
            <button class="btn btn-ghost" (click)="goBack()">← Back</button>
            <button class="btn btn-secondary" (click)="saveZine()" [disabled]="saving()">
              {{ saving() ? 'Saving...' : '💾 Save' }}
            </button>
            <button class="btn btn-secondary" (click)="exportPdf()" *ngIf="zine()">
              📄 PDF
            </button>
            <button class="btn btn-primary" (click)="startFold()" *ngIf="zine() && !folding() && !showBook()">
              ✂️ Fold!
            </button>
            <button class="btn btn-secondary" (click)="resetView()" *ngIf="showBook()">
              ← Back to grid
            </button>
          </div>
        </div>
      </header>

      <!-- ── GRID VIEW ── -->
      <div class="editor-main" *ngIf="!showBook()" [@gridFade]>

        <p class="upload-hint" *ngIf="!folding()">click any cell to upload image</p>
        <p class="upload-hint folding-hint" *ngIf="folding()">folding your zine... ✦</p>

        <div class="grid-wrap" #gridRef id="zine-grid">
          <div class="zine-grid">

            <!-- TOP ROW: pages 4,3,2,1 — rotated 180° -->
            <ng-container *ngFor="let cell of topRow; let i = index">
              <div
                class="cell top-row"
                [class.uploading]="uploadingCell() === cell.key"
                [@foldCol]="foldState(i, 'top')"
                [style.background-color]="getCellData(cell.key)?.bg_color || '#fff'"
                (click)="!folding() && openCellEditor(cell.key)"
              >
                <!-- Cut line indicator between page2 and page1 -->
                <div class="cut-line" *ngIf="i === 2"></div>

                <div class="cell-inner" [style.transform]="'rotate(180deg)'">
                  <img
                    *ngIf="getCellData(cell.key)?.image_url"
                    [src]="getCellData(cell.key)!.image_url"
                    class="cell-image"
                    alt=""
                  />
                  <div
                    *ngIf="getCellData(cell.key)?.text_content"
                    class="cell-text"
                    [style.color]="getCellData(cell.key)?.text_color"
                    [style.font-size.px]="getCellData(cell.key)?.font_size"
                  >{{ getCellData(cell.key)?.text_content }}</div>
                  <div class="cell-label" *ngIf="!getCellData(cell.key)?.image_url && !getCellData(cell.key)?.text_content">
                    <span class="label-num">{{ cell.label }}</span>
                    <span class="label-hint" *ngIf="!folding()">+ upload</span>
                    <div class="upload-spinner" *ngIf="uploadingCell() === cell.key"></div>
                  </div>
                </div>
              </div>
            </ng-container>

            <!-- Dashed cut line row -->
            <div class="scissors-row">
              <div class="dashed-line"></div>
              <span class="scissors-icon">✂</span>
            </div>

            <!-- BOTTOM ROW: pages 5,6,back,cover — 0° rotation -->
            <ng-container *ngFor="let cell of bottomRow; let i = index">
              <div
                class="cell bottom-row"
                [class.is-cover]="cell.key === 'cover'"
                [class.uploading]="uploadingCell() === cell.key"
                [@foldCol]="foldState(i, 'bottom')"
                [style.background-color]="getCellData(cell.key)?.bg_color || '#fff'"
                (click)="!folding() && openCellEditor(cell.key)"
              >
                <img
                  *ngIf="getCellData(cell.key)?.image_url"
                  [src]="getCellData(cell.key)!.image_url"
                  class="cell-image"
                  alt=""
                />
                <div
                  *ngIf="getCellData(cell.key)?.text_content"
                  class="cell-text"
                  [style.color]="getCellData(cell.key)?.text_color"
                  [style.font-size.px]="getCellData(cell.key)?.font_size"
                >{{ getCellData(cell.key)?.text_content }}</div>
                <div class="cell-label" *ngIf="!getCellData(cell.key)?.image_url && !getCellData(cell.key)?.text_content">
                  <span class="label-num">{{ cell.label }}</span>
                  <span class="label-hint" *ngIf="!folding()">+ upload</span>
                  <div class="upload-spinner" *ngIf="uploadingCell() === cell.key"></div>
                </div>
              </div>
            </ng-container>

          </div><!-- /zine-grid -->
        </div><!-- /grid-wrap -->

        <!-- Hidden file input -->
        <input #fileInput type="file" accept="image/*" style="display:none" (change)="onFileSelected($event)" />
      </div>

      <!-- ── BOOK VIEW (post-fold) ── -->
      <div class="book-view" *ngIf="showBook()" [@bookAppear]>
        <h2 class="book-title">{{ zineTitleModel || 'My Zine' }}</h2>
        <p class="book-hint">Click the arrows to flip pages</p>

        <div class="book-scene" [style.perspective]="'1200px'">
          <div class="book-3d"
            [style.transform]="'rotateY(' + bookRotation() + 'deg)'"
            [style.transition]="'transform 0.6s cubic-bezier(0.4,0,0.2,1)'">
            <div class="book-cover"
              [style.background-color]="getCellData('cover')?.bg_color || '#F3B0C3'">
              <img *ngIf="getCellData('cover')?.image_url" [src]="getCellData('cover')!.image_url" class="book-cover-img" />
              <div class="book-cover-title">{{ zineTitleModel || 'my zine' }}</div>
            </div>
            <div class="book-spine"></div>
            <div class="book-back" [style.background-color]="getCellData('back')?.bg_color || '#fce4ec'">
              <img *ngIf="getCellData('back')?.image_url" [src]="getCellData('back')!.image_url" class="book-cover-img" />
            </div>
          </div>
        </div>

        <div class="book-controls">
          <button class="btn btn-secondary" (click)="flipBook(-1)">← Prev</button>
          <span class="page-indicator">Page {{ currentPage() + 1 }} / {{ pageOrder.length }}</span>
          <button class="btn btn-secondary" (click)="flipBook(1)">Next →</button>
        </div>

        <div class="book-page-preview card">
          <div class="bpp-inner"
            [style.background-color]="getCellData(pageOrder[currentPage()])?.bg_color || '#fff'">
            <img
              *ngIf="getCellData(pageOrder[currentPage()])?.image_url"
              [src]="getCellData(pageOrder[currentPage()])!.image_url"
              class="bpp-image"
            />
            <div
              *ngIf="getCellData(pageOrder[currentPage()])?.text_content"
              class="bpp-text"
              [style.color]="getCellData(pageOrder[currentPage()])?.text_color"
            >{{ getCellData(pageOrder[currentPage()])?.text_content }}</div>
            <div class="bpp-label" *ngIf="!getCellData(pageOrder[currentPage()])?.image_url">
              {{ pageOrder[currentPage()] === 'cover' ? '📖 Cover' : pageOrder[currentPage()] }}
            </div>
          </div>
        </div>
      </div>

      <!-- ── CELL EDITOR PANEL ── -->
      <div class="cell-panel" *ngIf="activeCellKey()" (click)="closeCellEditor()">
        <div class="cell-panel-inner card" (click)="$event.stopPropagation()">
          <div class="cp-header">
            <h3>Edit: <strong>{{ activeCellLabel() }}</strong></h3>
            <button class="btn btn-ghost" (click)="closeCellEditor()">✕</button>
          </div>

          <div class="cp-body">
            <!-- Image upload -->
            <div class="cp-section">
              <label class="cp-label">Image</label>
              <div class="image-dropzone"
                (click)="triggerUpload()"
                [class.has-image]="getCellData(activeCellKey()!)?.image_url">
                <img *ngIf="getCellData(activeCellKey()!)?.image_url"
                  [src]="getCellData(activeCellKey()!)!.image_url" class="dz-preview" />
                <div *ngIf="!getCellData(activeCellKey()!)?.image_url" class="dz-placeholder">
                  <span>📷</span>
                  <p>Click to upload image</p>
                  <small>Auto-cropped with AI SmartCrop</small>
                </div>
              </div>
            </div>

            <!-- Text -->
            <div class="cp-section">
              <label class="cp-label">Text</label>
              <textarea
                class="input"
                rows="3"
                placeholder="add some words..."
                [(ngModel)]="cellTextDraft"
                (input)="debounceSaveCellText()"
              ></textarea>
            </div>

            <!-- Colors -->
            <div class="cp-section cp-row">
              <div>
                <label class="cp-label">Background</label>
                <input type="color"
                  [value]="getCellData(activeCellKey()!)?.bg_color || '#ffffff'"
                  (change)="updateCellColor('bg_color', $event)" />
              </div>
              <div>
                <label class="cp-label">Text color</label>
                <input type="color"
                  [value]="getCellData(activeCellKey()!)?.text_color || '#1a1a2e'"
                  (change)="updateCellColor('text_color', $event)" />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    /* ── Layout ── */
    .editor-page {
      min-height: 100vh;
      padding-top: 68px;
      display: flex;
      flex-direction: column;
    }

    .editor-header {
      background: rgba(255,249,229,0.9);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid rgba(243,176,195,0.3);
      padding: 12px 24px;
      position: sticky;
      top: 68px;
      z-index: 100;
    }

    .editor-header-inner {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .title-input {
      font-family: var(--font-heading);
      font-size: 1.2rem;
      font-weight: 700;
      border: none;
      background: transparent;
      outline: none;
      color: var(--dark);
      min-width: 240px;
      border-bottom: 2px solid transparent;
      padding: 4px 0;
      transition: border-color var(--transition);
    }

    .title-input:focus {
      border-bottom-color: var(--pink);
    }

    .editor-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    /* ── Main ── */
    .editor-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 24px 48px;
      gap: 16px;
    }

    .upload-hint {
      font-family: var(--font-heading);
      font-size: 0.9rem;
      color: var(--gray);
      letter-spacing: 0.5px;
    }

    .folding-hint {
      color: var(--pink-dark);
      animation: pulse 1s ease-in-out infinite;
    }

    /* ── Zine Grid ── */
    .grid-wrap {
      width: 100%;
      max-width: 900px;
    }

    .zine-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: auto 28px auto;
      gap: 0;
      background: #fff;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: var(--shadow-lift);
      perspective: 1200px;
    }

    /* scissors row spans all 4 columns */
    .scissors-row {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      position: relative;
      background: #f9fafb;
      height: 28px;
    }

    .dashed-line {
      flex: 1;
      border-top: 2px dashed #cbd5e1;
      margin: 0 12px;
    }

    .scissors-icon {
      position: absolute;
      right: 25%;
      font-size: 1.1rem;
      color: #94a3b8;
      transform: translateY(-1px);
    }

    /* ── Cell ── */
    .cell {
      aspect-ratio: 3/4;
      border: 1px solid #e5e7eb;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: box-shadow var(--transition);
      transform-style: preserve-3d;
    }

    .cell:hover {
      box-shadow: inset 0 0 0 3px var(--pink);
      z-index: 2;
    }

    .cell.uploading {
      pointer-events: none;
    }

    .cell.is-cover {
      border: 2px solid var(--pink);
    }

    .cell-inner {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .cell-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: absolute;
      inset: 0;
    }

    .cell-text {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      text-align: center;
      font-family: var(--font-body);
      word-break: break-word;
    }

    .cell-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      pointer-events: none;
    }

    .label-num {
      font-family: var(--font-heading);
      font-size: 1.4rem;
      font-weight: 700;
      color: #94a3b8;
    }

    /* top-row labels appear upside-down (inside rotated container) */
    .top-row .label-num {
      writing-mode: horizontal-tb;
    }

    .label-hint {
      font-size: 0.7rem;
      color: #cbd5e1;
    }

    /* cut line inside top row at index 2 */
    .cut-line {
      position: absolute;
      right: 0; top: 0; bottom: 0;
      width: 2px;
      background: repeating-linear-gradient(
        to bottom,
        #cbd5e1 0px,
        #cbd5e1 6px,
        transparent 6px,
        transparent 12px
      );
    }

    /* ── Upload spinner ── */
    .upload-spinner {
      width: 24px;
      height: 24px;
      border: 3px solid var(--pink-light);
      border-top-color: var(--pink-dark);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ── Book View ── */
    .book-view {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 24px;
      gap: 24px;
    }

    .book-title {
      font-size: 2rem;
      font-family: var(--font-heading);
    }

    .book-hint {
      color: var(--gray);
      font-size: 0.9rem;
    }

    .book-scene {
      perspective: 1200px;
    }

    .book-3d {
      width: 200px;
      height: 280px;
      position: relative;
      transform-style: preserve-3d;
    }

    .book-cover, .book-back {
      position: absolute;
      width: 200px;
      height: 280px;
      border-radius: 4px 12px 12px 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      backface-visibility: hidden;
      overflow: hidden;
      box-shadow: var(--shadow-lift);
    }

    .book-cover {
      background: var(--pink);
    }

    .book-back {
      background: var(--pink-light);
      transform: rotateY(180deg);
    }

    .book-spine {
      position: absolute;
      left: -14px;
      width: 14px;
      height: 280px;
      background: var(--pink-dark);
      border-radius: 4px 0 0 4px;
      transform: rotateY(-90deg) translateZ(-7px);
    }

    .book-cover-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .book-cover-title {
      font-family: var(--font-heading);
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--dark);
      text-align: center;
      padding: 16px;
      position: absolute;
    }

    .book-controls {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .page-indicator {
      font-family: var(--font-heading);
      font-size: 0.9rem;
      color: var(--gray);
    }

    .book-page-preview {
      width: 100%;
      max-width: 360px;
      aspect-ratio: 3/4;
    }

    .bpp-inner {
      width: 100%;
      height: 100%;
      min-height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius);
      overflow: hidden;
      position: relative;
    }

    .bpp-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: absolute;
      inset: 0;
    }

    .bpp-text {
      font-size: 1.1rem;
      text-align: center;
      padding: 24px;
      z-index: 1;
    }

    .bpp-label {
      font-family: var(--font-heading);
      font-size: 1.4rem;
      color: #cbd5e1;
    }

    /* ── Cell Editor Panel ── */
    .cell-panel {
      position: fixed;
      inset: 0;
      background: rgba(26,26,46,0.3);
      backdrop-filter: blur(4px);
      z-index: 500;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }

    .cell-panel-inner {
      width: 340px;
      height: 100vh;
      border-radius: 0;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      animation: slideInRight 0.3s cubic-bezier(0.34,1.56,0.64,1);
    }

    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to   { transform: translateX(0); }
    }

    .cp-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px 16px;
      border-bottom: 1px solid #f3f4f6;
      background: var(--pink-light);
    }

    .cp-header h3 { font-size: 1rem; }

    .cp-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 20px; }

    .cp-section { display: flex; flex-direction: column; gap: 8px; }

    .cp-row { flex-direction: row; gap: 24px; align-items: flex-start; }

    .cp-label {
      font-family: var(--font-heading);
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--gray);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .image-dropzone {
      border: 2px dashed #e5e7eb;
      border-radius: var(--radius-sm);
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      overflow: hidden;
      position: relative;
      transition: border-color var(--transition);
    }

    .image-dropzone:hover { border-color: var(--pink); }
    .image-dropzone.has-image { border-style: solid; border-color: var(--pink); }

    .dz-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .dz-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      color: var(--gray);
    }

    .dz-placeholder span { font-size: 2rem; }
    .dz-placeholder p { font-size: 0.9rem; font-weight: 500; }
    .dz-placeholder small { font-size: 0.75rem; color: #9ca3af; }
  `]
})
export class EditorComponent implements OnInit {
  @ViewChild('gridRef') gridRef!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  zine = signal<Zine | null>(null);
  zineTitleModel = '';
  cells = signal<ZineCell[]>([]);
  saving = signal(false);
  uploadingCell = signal<string | null>(null);
  activeCellKey = signal<string | null>(null);
  cellTextDraft = '';
  folding = signal(false);
  showBook = signal(false);
  bookRotation = signal(0);
  currentPage = signal(0);
  foldStates = signal<Record<string, string>>({});

  topRow = GRID_CELLS.filter(c => c.row === 'top');
  bottomRow = GRID_CELLS.filter(c => c.row === 'bottom');
  pageOrder = ['cover', 'page1', 'page2', 'page3', 'page4', 'page5', 'page6', 'back'];

  private textSaveTimer: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private zineService: ZineService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.zineService.getZine(slug).subscribe({
        next: (z) => {
          this.zine.set(z);
          this.zineTitleModel = z.title;
          this.cells.set(z.cells);
        },
        error: () => this.toast.show('Could not load zine.', 'error'),
      });
    }
  }

  getCellData(key: string): ZineCell | undefined {
    return this.cells().find(c => c.cell_key === key);
  }

  activeCellLabel(): string {
    const def = GRID_CELLS.find(c => c.key === this.activeCellKey());
    return def?.label ?? this.activeCellKey() ?? '';
  }

  openCellEditor(key: string) {
    this.activeCellKey.set(key);
    this.cellTextDraft = this.getCellData(key)?.text_content ?? '';
  }

  closeCellEditor() {
    this.activeCellKey.set(null);
  }

  triggerUpload() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.activeCellKey() || !this.zine()) return;

    const cellKey = this.activeCellKey()!;
    this.uploadingCell.set(cellKey);

    this.zineService.uploadImage(file, this.zine()!.id, cellKey).subscribe({
      next: (res) => {
        this.cells.update(arr => {
          const idx = arr.findIndex(c => c.cell_key === cellKey);
          if (idx >= 0) {
            arr[idx] = { ...arr[idx], image_url: res.url };
          } else {
            arr.push({ cell_key: cellKey, image_url: res.url } as ZineCell);
          }
          return [...arr];
        });
        this.uploadingCell.set(null);
        this.toast.show('Image uploaded ✦', 'success');
        // Reset file input
        this.fileInput.nativeElement.value = '';
      },
      error: () => {
        this.uploadingCell.set(null);
        this.toast.show('Upload failed. Check Cloudinary config.', 'error');
      },
    });
  }

  debounceSaveCellText() {
    clearTimeout(this.textSaveTimer);
    this.textSaveTimer = setTimeout(() => this.saveCellText(), 800);
  }

  saveCellText() {
    const key = this.activeCellKey();
    if (!key || !this.zine()) return;
    this.zineService.updateCell(this.zine()!.id, key, { text_content: this.cellTextDraft }).subscribe({
      next: (cell) => {
        this.cells.update(arr => {
          const idx = arr.findIndex(c => c.cell_key === key);
          if (idx >= 0) arr[idx] = { ...arr[idx], ...cell };
          else arr.push(cell);
          return [...arr];
        });
      },
    });
  }

  updateCellColor(field: 'bg_color' | 'text_color', event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const key = this.activeCellKey();
    if (!key || !this.zine()) return;
    this.zineService.updateCell(this.zine()!.id, key, { [field]: value }).subscribe({
      next: (cell) => {
        this.cells.update(arr => {
          const idx = arr.findIndex(c => c.cell_key === key);
          if (idx >= 0) arr[idx] = { ...arr[idx], ...cell };
          return [...arr];
        });
      },
    });
  }

  saveZine() {
    if (!this.zineTitleModel.trim()) {
      this.toast.show('Please add a title first.', 'error');
      return;
    }
    this.saving.set(true);

    if (this.zine()) {
      this.zineService.updateZine(this.zine()!.slug, { title: this.zineTitleModel }).subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.show('Saved! ♡', 'success');
        },
        error: () => {
          this.saving.set(false);
          this.toast.show('Save failed.', 'error');
        },
      });
    } else {
      this.zineService.createZine({ title: this.zineTitleModel }).subscribe({
        next: (z) => {
          this.zine.set(z);
          this.cells.set(z.cells);
          this.saving.set(false);
          this.toast.show('Zine created! ✦', 'success');
          this.router.navigate(['/editor', z.slug], { replaceUrl: true });
        },
        error: () => {
          this.saving.set(false);
          this.toast.show('Could not create zine.', 'error');
        },
      });
    }
  }

  autoSave() {
    if (this.zine() && this.zineTitleModel !== this.zine()!.title) {
      this.saveZine();
    }
  }

  // ── Fold Animation Sequence ──
  startFold() {
    if (!this.zine()) {
      this.toast.show('Save your zine first!', 'info');
      return;
    }
    this.folding.set(true);
    this.toast.show('Folding your zine... ✂️', 'info');

    // Stagger fold columns inward (index 1 and 2 first, then 0 and 3)
    const delays = [300, 0, 0, 300];
    const states: Record<string, string> = {};
    GRID_CELLS.forEach((c, i) => {
      states[`${c.row}-${i % 4}`] = 'folding';
    });

    // Animate step by step
    setTimeout(() => {
      this.foldStates.set({ ...states });
    }, 200);

    setTimeout(() => {
      this.folding.set(false);
      this.showBook.set(true);
    }, 1200);
  }

  foldState(idx: number, row: 'top' | 'bottom'): string {
    if (!this.folding()) return 'open';
    const key = `${row}-${idx}`;
    return this.foldStates()[key] ?? 'open';
  }

  flipBook(dir: number) {
    const next = this.currentPage() + dir;
    if (next < 0 || next >= this.pageOrder.length) return;
    this.currentPage.set(next);
    this.bookRotation.update(r => r + dir * 25);
  }

  resetView() {
    this.showBook.set(false);
    this.folding.set(false);
    this.foldStates.set({});
    this.bookRotation.set(0);
    this.currentPage.set(0);
  }

  exportPdf() {
    this.toast.show('Preparing PDF export...', 'info');
    // Dynamically import jsPDF and html2canvas to avoid SSR issues
    Promise.all([
      import('jspdf').then(m => m.default),
      import('html2canvas').then(m => m.default),
    ]).then(([jsPDF, html2canvas]) => {
      const el = document.getElementById('zine-grid');
      if (!el) return;
      html2canvas(el, { scale: 3, useCORS: true }).then(canvas => {
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: 'a4' });
        const w = pdf.internal.pageSize.getWidth();
        const h = (canvas.height / canvas.width) * w;
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h);
        pdf.save(`${this.zineTitleModel || 'my-zine'}.pdf`);
        this.toast.show('PDF downloaded! ✦', 'success');
      });
    }).catch(() => {
      this.toast.show('PDF export failed. Install jspdf and html2canvas.', 'error');
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
