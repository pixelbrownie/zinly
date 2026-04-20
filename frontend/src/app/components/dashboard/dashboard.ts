import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ZineService } from '../../services/zine';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  zines: any[] = [];
  loading = true;

  constructor(
    private zineService: ZineService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.fetchMyZines();
  }

  fetchMyZines() {
    this.loading = true;
    this.zineService.getUserZines().subscribe({
      next: (res) => {
        this.zines = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch zines', err);
        this.loading = false;
      }
    });
  }

  togglePrivacy(zine: any) {
    const newStatus = !zine.is_public;
    // Optimistic update
    zine.is_public = newStatus;
    
    this.zineService.updateZine(zine.slug, { is_public: newStatus }).subscribe({
      next: () => {
        const msg = newStatus ? 'Zine is now Public! ✨' : 'Zine is now Private! 🔒';
        this.toastService.show(msg, 'success');
      },
      error: (err) => {
        // Rollback on error
        zine.is_public = !newStatus;
        this.toastService.show('Failed to update privacy', 'error');
      }
    });
  }
}
