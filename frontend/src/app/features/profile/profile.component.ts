import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ZineService, Zine } from '../../core/services/zine.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="profile-page stars-bg">
      <div class="profile-inner">

        <!-- Profile card -->
        <div class="profile-card card fade-up">
          <div class="profile-avatar">
            <img *ngIf="auth.currentUser()?.avatar" [src]="auth.currentUser()!.avatar" alt="avatar" />
            <span *ngIf="!auth.currentUser()?.avatar" class="avatar-initial">
              {{ auth.currentUser()?.username?.[0]?.toUpperCase() }}
            </span>
          </div>
          <div class="profile-info">
            <h1>{{ auth.currentUser()?.username }}</h1>
            <p class="profile-email">{{ auth.currentUser()?.email }}</p>
            <p class="profile-bio" *ngIf="!editingBio()">
              {{ auth.currentUser()?.bio || 'No bio yet...' }}
              <button class="btn btn-ghost" style="font-size:0.8rem; padding:4px 8px;" (click)="startEditBio()">edit</button>
            </p>
            <div class="bio-edit" *ngIf="editingBio()">
              <textarea class="input" rows="2" [(ngModel)]="bioDraft" placeholder="Tell the world about yourself..."></textarea>
              <div style="display:flex; gap:8px; margin-top:8px;">
                <button class="btn btn-primary btn-sm" (click)="saveBio()">Save</button>
                <button class="btn btn-ghost btn-sm" (click)="editingBio.set(false)">Cancel</button>
              </div>
            </div>
          </div>
          <div class="profile-stats">
            <div class="stat">
              <span class="stat-num">{{ myZines().length }}</span>
              <span class="stat-label">zines</span>
            </div>
            <div class="stat">
              <span class="stat-num">{{ publicCount() }}</span>
              <span class="stat-label">public</span>
            </div>
          </div>
        </div>

        <!-- Zines grid -->
        <h2 class="section-title">All Zines</h2>

        <div class="zines-grid" *ngIf="myZines().length > 0">
          <div class="zine-card card" *ngFor="let zine of myZines()">
            <div class="zine-cover" [style.background-color]="zine.theme_color">
              <img *ngIf="zine.cover_image_url" [src]="zine.cover_image_url" class="zc-img" alt="" />
              <div class="zine-visibility">
                {{ zine.is_public ? '🌍' : '🔒' }}
              </div>
            </div>
            <div class="zine-card-body">
              <h3>{{ zine.title }}</h3>
              <p class="zine-date">{{ zine.created_at | date:'mediumDate' }}</p>
              <div class="zine-card-actions">
                <a [routerLink]="['/editor', zine.slug]" class="btn btn-secondary btn-xs">Edit</a>
                <a [routerLink]="['/zine', zine.slug]" class="btn btn-ghost btn-xs">View</a>
              </div>
            </div>
          </div>
        </div>

        <div class="empty-state card" *ngIf="myZines().length === 0 && !loading()">
          <div class="empty-icon">📖</div>
          <h3>No zines yet</h3>
          <a routerLink="/editor" class="btn btn-primary mt-16">Create your first zine</a>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      min-height: 100vh;
      padding: 100px 24px 60px;
    }

    .profile-inner {
      max-width: 900px;
      margin: 0 auto;
    }

    .profile-card {
      display: flex;
      align-items: flex-start;
      gap: 24px;
      padding: 32px;
      margin-bottom: 40px;
      flex-wrap: wrap;
    }

    .profile-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--pink);
      overflow: hidden;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid var(--pink-dark);
    }

    .profile-avatar img { width: 100%; height: 100%; object-fit: cover; }

    .avatar-initial {
      font-family: var(--font-heading);
      font-size: 2rem;
      font-weight: 700;
    }

    .profile-info { flex: 1; min-width: 200px; }
    .profile-info h1 { font-size: 1.5rem; margin-bottom: 4px; }
    .profile-email { color: var(--gray); font-size: 0.9rem; margin-bottom: 8px; }
    .profile-bio { font-size: 0.95rem; color: var(--dark); }

    .bio-edit { margin-top: 8px; }

    .profile-stats {
      display: flex;
      gap: 24px;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .stat-num {
      font-family: var(--font-heading);
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--pink-dark);
    }

    .stat-label {
      font-size: 0.8rem;
      color: var(--gray);
    }

    .section-title {
      font-size: 1.3rem;
      margin-bottom: 20px;
      font-family: var(--font-heading);
    }

    .zines-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }

    .zine-card { overflow: hidden; }

    .zine-cover {
      height: 140px;
      position: relative;
      overflow: hidden;
    }

    .zc-img {
      width: 100%; height: 100%;
      object-fit: cover;
    }

    .zine-visibility {
      position: absolute;
      top: 8px; right: 8px;
      font-size: 1.1rem;
    }

    .zine-card-body { padding: 14px 16px; }
    .zine-card-body h3 { font-size: 0.95rem; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .zine-date { font-size: 0.78rem; color: var(--gray); margin-bottom: 10px; }

    .zine-card-actions { display: flex; gap: 6px; }

    .btn-xs { padding: 5px 10px; font-size: 0.78rem; }
    .btn-sm { padding: 8px 16px; font-size: 0.85rem; }

    .empty-state {
      text-align: center;
      padding: 48px;
    }

    .empty-icon { font-size: 2.5rem; margin-bottom: 12px; }
  `]
})
export class ProfileComponent implements OnInit {
  myZines = signal<Zine[]>([]);
  loading = signal(true);
  editingBio = signal(false);
  bioDraft = '';

  publicCount = () => this.myZines().filter(z => z.is_public).length;

  constructor(
    public auth: AuthService,
    private zineService: ZineService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.zineService.getMyZines().subscribe({
      next: (z) => { this.myZines.set(z); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  startEditBio() {
    this.bioDraft = this.auth.currentUser()?.bio ?? '';
    this.editingBio.set(true);
  }

  saveBio() {
    this.auth.updateMe({ bio: this.bioDraft }).subscribe({
      next: () => {
        this.toast.show('Bio updated!', 'success');
        this.editingBio.set(false);
      },
      error: () => this.toast.show('Could not update bio.', 'error'),
    });
  }
}
