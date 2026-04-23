import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing stars-bg">

      <!-- Hero -->
      <section class="hero">
        <div class="star-border left">
          <div *ngFor="let s of stars" class="star">✦</div>
        </div>

        <div class="hero-content">
          <h1 class="hero-title fade-up">make your zine!</h1>

          <div class="zine-illustration float" style="animation-delay:0s">
            <img src="assets/heart-zine.png" alt="Zine illustration" class="zine-img" />
          </div>

          <div class="hero-actions fade-up" style="animation-delay:0.2s">
            <a routerLink="/signup" class="start-btn">
              <img src="assets/start-btn.png" alt="Start" class="start-img" />
            </a>
          </div>

          <p class="hero-sub fade-up" style="animation-delay:0.35s">
            fold a sheet of paper into your own 8-page mini magazine ✨
          </p>
        </div>

        <div class="star-border right">
          <div *ngFor="let s of stars" class="star">✦</div>
        </div>
      </section>

      <!-- Features -->
      <section class="features">
        <div class="features-grid">
          <div class="feature-card card">
            <div class="feature-icon">🎨</div>
            <h3>Design your pages</h3>
            <p>Upload images, add text, and customize each of your 8 zine pages with our smart editor.</p>
          </div>
          <div class="feature-card card">
            <div class="feature-icon">✂️</div>
            <h3>Watch it fold</h3>
            <p>See your flat sheet animate into a real zine — just like folding paper, but digital!</p>
          </div>
          <div class="feature-card card">
            <div class="feature-icon">📖</div>
            <h3>Flip through it</h3>
            <p>Browse your finished zine in a beautiful 3D book view, then share or print it.</p>
          </div>
          <div class="feature-card card">
            <div class="feature-icon">🌸</div>
            <h3>Share your work</h3>
            <p>Post to the community feed and discover zines from other creators around the world.</p>
          </div>
        </div>
      </section>

      <!-- CTA Banner -->
      <section class="cta-banner">
        <h2>Ready to make something cute?</h2>
        <p>Join thousands of zine-makers and start folding today.</p>
        <a routerLink="/signup" class="btn btn-primary">Start for free ♡</a>
      </section>

    </div>
  `,
  styles: [`
    .landing {
      padding-top: 68px;
      overflow: hidden;
    }

    /* ── Hero ── */
    .hero {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 68px);
      position: relative;
      padding: 40px 0;
    }

    .star-border {
      position: absolute;
      top: 0; bottom: 0;
      width: 80px;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
      padding: 40px 0;
    }

    .star-border.left { left: 0; }
    .star-border.right { right: 0; }

    .star {
      color: var(--pink);
      font-size: 1.1rem;
      opacity: 0.6;
      animation: floatAnim 3s ease-in-out infinite;
    }

    .star:nth-child(even) { animation-delay: 0.5s; opacity: 0.4; }
    .star:nth-child(3n) { animation-delay: 1s; }

    .hero-content {
      text-align: center;
      max-width: 640px;
      padding: 0 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 28px;
    }

    .hero-title {
      font-family: var(--font-heading);
      font-size: clamp(2.2rem, 5vw, 3.5rem);
      font-weight: 900;
      color: var(--dark);
      letter-spacing: -1px;
      animation: fadeUp 0.6s ease forwards;
    }

    .zine-illustration {
      width: 280px;
      max-width: 80vw;
    }

    .zine-img {
      width: 100%;
      height: auto;
      filter: drop-shadow(0 12px 32px rgba(243,176,195,0.4));
    }

    .start-btn {
      display: inline-block;
      transition: transform var(--transition-bounce);
    }

    .start-btn:hover {
      transform: scale(1.06) translateY(-3px);
    }

    .start-btn:active {
      transform: scale(0.95);
    }

    .start-img {
      height: 64px;
      width: auto;
      filter: drop-shadow(0 4px 12px rgba(243,176,195,0.5));
    }

    .hero-sub {
      font-size: 1.05rem;
      color: var(--gray);
      max-width: 380px;
    }

    /* ── Features ── */
    .features {
      padding: 80px 24px;
      max-width: 1100px;
      margin: 0 auto;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 24px;
    }

    .feature-card {
      padding: 32px 24px;
      text-align: center;
    }

    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 16px;
    }

    .feature-card h3 {
      font-size: 1.1rem;
      margin-bottom: 10px;
      font-family: var(--font-heading);
    }

    .feature-card p {
      font-size: 0.9rem;
      color: var(--gray);
      line-height: 1.6;
    }

    /* ── CTA ── */
    .cta-banner {
      background: var(--pink-light);
      border-top: 2px dashed var(--pink);
      border-bottom: 2px dashed var(--pink);
      padding: 72px 24px;
      text-align: center;
      margin-bottom: 0;
    }

    .cta-banner h2 {
      font-size: 2rem;
      margin-bottom: 12px;
    }

    .cta-banner p {
      color: var(--gray);
      margin-bottom: 28px;
      font-size: 1.05rem;
    }
  `]
})
export class LandingComponent {
  stars = Array(12).fill(0);
}
