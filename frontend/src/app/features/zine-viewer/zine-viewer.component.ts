import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ZineService, Zine } from '../../core/services/zine.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

const PAGE_ORDER = ['cover', 'page1', 'page2', 'page3', 'page4', 'page5', 'page6', 'back'];

@Component({
  selector: 'app-zine-viewer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="viewer-page stars-bg" *ngIf="zine(); else loading">

      <!-- Header -->
      <div class="viewer-header">
        <a routerLink="/explore" class="btn btn-ghost">← Explore</a>
        <div class="viewer-title">
          <h1>{{ zine()!.title }}</h1>
          <span class="viewer-author">by {{ zine()!.owner.username }}</span>
        </div>
        <a *ngIf="isOwner()" [routerLink]="['/editor', zine()!.slug]" class="btn btn-secondary">Edit ✏️</a>
      </div>

      <!-- 3D Book Scene -->
      <div class="book-scene">
        <div class="scene-3d" [style.perspective]="'1400px'">
          <div class="book-wrapper"
            [style.transform]="bookTransform()"
            [style.transition]="'transform 0.7s cubic-bezier(0.4,0,0.2,1)'">

            <!-- Cover (front face) -->
            <div class="face face-front"
              [style.background-color]="cellBg('cover')"
              (click)="flipNext()">
              <img *ngIf="cellImg('cover')" [src]="cellImg('cover')" class="face-img" />
              <div class="face-title-overlay">
                <span>{{ zine()!.title }}</span>
              </div>
              <div class="flip-hint">Tap to flip →</div>
            </div>

            <!-- Spine -->
            <div class="face face-spine" [style.background-color]="zine()!.theme_color"></div>

            <!-- Back face -->
            <div class="face face-back" [style.background-color]="cellBg('back')">
              <img *ngIf="cellImg('back')" [src]="cellImg('back')" class="face-img" />
            </div>

            <!-- Top/Bottom edges -->
            <div class="face face-top"></div>
            <div class="face face-bottom"></div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="viewer-nav">
          <button class="nav-btn" (click)="flipPrev()" [disabled]="currentIdx() === 0">
            <span>←</span>
          </button>
          <div class="page-dots">
            <div *ngFor="let p of PAGE_ORDER; let i = index"
              class="dot"
              [class.active]="i === currentIdx()"
              (click)="goToPage(i)">
            </div>
          </div>
          <button class="nav-btn" (click)="flipNext()" [disabled]="currentIdx() === PAGE_ORDER.length - 1">
            <span>→</span>
          </button>
        </div>
      </div>

      <!-- Current page content preview -->
      <div class="page-preview">
        <div class="pp-card card"
          [style.background-color]="cellBg(PAGE_ORDER[currentIdx()])">
          <img *ngIf="cellImg(PAGE_ORDER[currentIdx()])"
            [src]="cellImg(PAGE_ORDER[currentIdx()])"
            class="pp-img" />
          <div *ngIf="cellText(PAGE_ORDER[currentIdx()])"
            class="pp-text"
            [style.color]="cellTextColor(PAGE_ORDER[currentIdx()])">
            {{ cellText(PAGE_ORDER[currentIdx()]) }}
          </div>
          <div *ngIf="!cellImg(PAGE_ORDER[currentIdx()]) && !cellText(PAGE_ORDER[currentIdx()])"
            class="pp-empty">
            {{ PAGE_ORDER[currentIdx()] === 'cover' ? '📖 Cover' :
               PAGE_ORDER[currentIdx()] === 'back' ? '🔙 Back' :
               '✦ Page ' + currentPageNum() }}
          </div>
        </div>
        <p class="page-label">
          {{ PAGE_ORDER[currentIdx()] === 'cover' ? 'Cover' :
             PAGE_ORDER[currentIdx()] === 'back' ? 'Back cover' :
             'Page ' + currentPageNum() }}
          <span class="page-counter">{{ currentIdx() + 1 }} / {{ PAGE_ORDER.length }}</span>
        </p>
      </div>

    </div>

    <!-- Loading state -->
    <ng-template #loading>
      <div class="viewer-loading stars-bg">
        <div class="loading-book">
          <div class="lb-cover"></div>
          <div class="lb-pages"></div>
        </div>
        <p>Loading your zine...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .viewer-page {
      min-height: 100vh;
      padding-top: 68px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* ── Header ── */
    .viewer-header {
      width: 100%;
      max-width: 900px;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .viewer-title {
      text-align: center;
      flex: 1;
    }

    .viewer-title h1 {
      font-size: 1.4rem;
      margin-bottom: 2px;
    }

    .viewer-author {
      font-size: 0.85rem;
      color: var(--gray);
    }

    /* ── Book Scene ── */
    .book-scene {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 32px;
      padding: 20px;
    }

    .scene-3d {
      perspective: 1400px;
    }

    .book-wrapper {
      width: 220px;
      height: 300px;
      position: relative;
      transform-style: preserve-3d;
      cursor: pointer;
    }

    .face {
      position: absolute;
      backface-visibility: hidden;
    }

    .face-front {
      width: 220px;
      height: 300px;
      border-radius: 4px 16px 16px 4px;
      overflow: hidden;
      box-shadow: 6px 6px 24px rgba(0,0,0,0.2), -2px 0 8px rgba(0,0,0,0.1);
      display: flex;
      align-items: flex-end;
      position: relative;
    }

    .face-back {
      width: 220px;
      height: 300px;
      border-radius: 4px 16px 16px 4px;
      overflow: hidden;
      box-shadow: 6px 6px 24px rgba(0,0,0,0.2);
      transform: rotateY(180deg);
    }

    .face-spine {
      width: 18px;
      height: 300px;
      left: -18px;
      top: 0;
      border-radius: 4px 0 0 4px;
      box-shadow: -3px 0 8px rgba(0,0,0,0.15);
    }

    .face-top {
      width: 220px;
      height: 18px;
      top: 0;
      left: 0;
      background: #f0ece0;
      transform: rotateX(90deg) translateZ(-9px);
    }

    .face-bottom {
      width: 220px;
      height: 18px;
      bottom: 0;
      left: 0;
      background: #f0ece0;
      transform: rotateX(-90deg) translateZ(-9px);
    }

    .face-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .face-title-overlay {
      position: relative;
      z-index: 1;
      width: 100%;
      padding: 12px 16px;
      background: linear-gradient(transparent, rgba(0,0,0,0.35));
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 1rem;
      color: white;
      text-shadow: 0 1px 4px rgba(0,0,0,0.4);
    }

    .flip-hint {
      position: absolute;
      top: 12px;
      right: 12px;
      font-size: 0.7rem;
      color: rgba(255,255,255,0.7);
      font-family: var(--font-heading);
      background: rgba(0,0,0,0.2);
      padding: 4px 8px;
      border-radius: 20px;
      backdrop-filter: blur(4px);
    }

    /* ── Navigation ── */
    .viewer-nav {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .nav-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 2px solid var(--pink);
      background: var(--white);
      color: var(--dark);
      font-size: 1.1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-bounce);
      box-shadow: var(--shadow-warm);
    }

    .nav-btn:hover:not(:disabled) {
      background: var(--pink);
      transform: scale(1.1);
    }

    .nav-btn:active:not(:disabled) {
      transform: scale(0.95);
    }

    .nav-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .page-dots {
      display: flex;
      gap: 6px;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #e5e7eb;
      cursor: pointer;
      transition: all var(--transition-bounce);
    }

    .dot.active {
      background: var(--pink-dark);
      transform: scale(1.4);
    }

    .dot:hover { background: var(--pink); }

    /* ── Page Preview ── */
    .page-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 0 24px 48px;
      width: 100%;
      max-width: 420px;
    }

    .pp-card {
      width: 100%;
      aspect-ratio: 3/4;
      position: relative;
      overflow: hidden;
      min-height: 280px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pp-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .pp-text {
      position: relative;
      z-index: 1;
      font-size: 1.1rem;
      text-align: center;
      padding: 24px;
    }

    .pp-empty {
      font-family: var(--font-heading);
      font-size: 1.4rem;
      color: #cbd5e1;
    }

    .page-label {
      font-family: var(--font-heading);
      font-size: 0.9rem;
      color: var(--gray);
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .page-counter {
      font-size: 0.78rem;
      background: var(--pink-light);
      padding: 3px 10px;
      border-radius: 20px;
    }

    /* ── Loading ── */
    .viewer-loading {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 24px;
      padding-top: 68px;
    }

    .loading-book {
      width: 120px;
      height: 160px;
      position: relative;
      animation: floatAnim 2s ease-in-out infinite;
    }

    .lb-cover {
      width: 100%;
      height: 100%;
      background: var(--pink);
      border-radius: 4px 12px 12px 4px;
      animation: pulse 1.5s ease-in-out infinite;
    }

    .lb-pages {
      position: absolute;
      right: -6px;
      top: 4px;
      bottom: 4px;
      width: 6px;
      background: repeating-linear-gradient(
        to bottom,
        #f0f0f0, #f0f0f0 2px,
        #ddd 2px, #ddd 4px
      );
    }

    .viewer-loading p {
      color: var(--gray);
      font-family: var(--font-heading);
    }
  `]
})
export class ZineViewerComponent implements OnInit {
  zine = signal<Zine | null>(null);
  currentIdx = signal(0);
  PAGE_ORDER = PAGE_ORDER;

  constructor(
    private route: ActivatedRoute,
    private zineService: ZineService,
    public auth: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.zineService.getZine(slug).subscribe({
      next: z => this.zine.set(z),
      error: () => this.toast.show('Could not load zine.', 'error'),
    });
  }

  cellImg(key: string): string {
    return this.zine()?.cells?.find(c => c.cell_key === key)?.image_url ?? '';
  }

  cellBg(key: string): string {
    return this.zine()?.cells?.find(c => c.cell_key === key)?.bg_color ?? (key === 'cover' ? (this.zine()?.theme_color ?? '#F3B0C3') : '#ffffff');
  }

  cellText(key: string): string {
    return this.zine()?.cells?.find(c => c.cell_key === key)?.text_content ?? '';
  }

  cellTextColor(key: string): string {
    return this.zine()?.cells?.find(c => c.cell_key === key)?.text_color ?? '#1a1a2e';
  }

  bookTransform(): string {
    const angle = this.currentIdx() * -22.5;
    return `rotateY(${angle}deg)`;
  }

  flipNext() {
    if (this.currentIdx() < PAGE_ORDER.length - 1) {
      this.currentIdx.update(i => i + 1);
    }
  }

  flipPrev() {
    if (this.currentIdx() > 0) {
      this.currentIdx.update(i => i - 1);
    }
  }

  goToPage(i: number) {
    this.currentIdx.set(i);
  }

  currentPageNum(): number {
    const key = PAGE_ORDER[this.currentIdx()];
    const match = key.match(/page(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  isOwner(): boolean {
    return this.auth.currentUser()?.username === this.zine()?.owner?.username;
  }
}
