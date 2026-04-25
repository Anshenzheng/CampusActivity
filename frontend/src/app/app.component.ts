import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { JwtResponse } from './models/models';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <nav class="navbar" *ngIf="authService.isLoggedIn()">
        <div class="container d-flex justify-between align-center">
          <a routerLink="/" class="logo">🎯 社团活动管理系统</a>
          <div class="nav-links d-flex gap-3 align-center">
            <a routerLink="/activities" routerLinkActive="active" class="nav-link">活动列表</a>
            <a routerLink="/my-registrations" routerLinkActive="active" class="nav-link" *ngIf="authService.isLoggedIn()">我的报名</a>
            <a routerLink="/users" routerLinkActive="active" class="nav-link" *ngIf="authService.isAdmin()">用户管理</a>
            <a routerLink="/create-activity" routerLinkActive="active" class="nav-link btn btn-sm btn-primary" *ngIf="authService.isAdmin()">发布活动</a>
            <div class="user-info">
              <span class="badge" [ngClass]="authService.isAdmin() ? 'badge-admin' : 'badge-member'">
                {{ currentUser?.role === 'ADMIN' ? '管理员' : '成员' }}
              </span>
              <span class="username">{{ currentUser?.username }}</span>
            </div>
            <button (click)="logout()" class="btn btn-sm btn-outline">退出登录</button>
          </div>
        </div>
      </nav>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .navbar {
      background: var(--bg-gradient);
      padding: 16px 0;
      box-shadow: var(--shadow-md);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .logo {
      color: white;
      font-size: 20px;
      font-weight: 600;
      text-decoration: none;
    }
    
    .nav-links {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    
    .nav-link {
      color: rgba(255, 255, 255, 0.9);
      text-decoration: none;
      font-weight: 500;
      transition: var(--transition);
      padding: 8px 16px;
      border-radius: var(--radius-md);
    }
    
    .nav-link:hover,
    .nav-link.active {
      color: white;
      background: rgba(255, 255, 255, 0.2);
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: var(--radius-md);
    }
    
    .username {
      color: white;
      font-weight: 500;
    }
    
    .main-content {
      flex: 1;
      padding: 32px 0;
    }
  `]
})
export class AppComponent {
  currentUser: JwtResponse | null = null;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}