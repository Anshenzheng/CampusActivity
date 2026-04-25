import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService } from '../../services/activity.service';
import { RegistrationService } from '../../services/registration.service';
import { AuthService } from '../../services/auth.service';
import { Activity } from '../../models/models';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-activity-detail',
  template: `
    <div class="container">
      <button routerLink="/activities" class="btn btn-outline btn-sm mb-4">
        ← 返回活动列表
      </button>
      
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
      </div>
      
      <div *ngIf="!loading && activity" class="activity-detail card">
        <div class="activity-header">
          <div>
            <h1 class="activity-title">{{ activity.title }}</h1>
            <div class="activity-meta-top">
              <span class="organizer">发布者：{{ activity.organizerName }}</span>
              <span class="date">发布时间：{{ activity.createdAt | date:'yyyy-MM-dd HH:mm' }}</span>
            </div>
          </div>
          <div class="action-buttons" *ngIf="authService.isAdmin()">
            <button 
              [routerLink]="['/edit-activity', activity.id]" 
              class="btn btn-primary btn-sm"
            >
              编辑
            </button>
            <button 
              [routerLink]="['/activity-registrations', activity.id]" 
              class="btn btn-secondary btn-sm"
            >
              查看报名
            </button>
          </div>
        </div>
        
        <div class="activity-info">
          <div class="info-section">
            <h3 class="section-title">📋 活动信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">开始日期</span>
                <span class="info-value">{{ activity.startDate }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">结束日期</span>
                <span class="info-value">{{ activity.endDate }}</span>
              </div>
              <div class="info-item" *ngIf="activity.location">
                <span class="info-label">活动地点</span>
                <span class="info-value">{{ activity.location }}</span>
              </div>
              <div class="info-item" *ngIf="activity.maxParticipants">
                <span class="info-label">参与人数</span>
                <span class="info-value">限 {{ activity.maxParticipants }} 人</span>
              </div>
            </div>
          </div>
          
          <div class="info-section" *ngIf="activity.description">
            <h3 class="section-title">📝 活动描述</h3>
            <div class="description-content">
              {{ activity.description }}
            </div>
          </div>
        </div>
        
        <div class="activity-actions" *ngIf="authService.isLoggedIn() && !isOrganizer">
          <div *ngIf="errorMessage" class="alert alert-error">
            {{ errorMessage }}
          </div>
          <div *ngIf="successMessage" class="alert alert-success">
            {{ successMessage }}
          </div>
          
          <button 
            (click)="onRegister()" 
            class="btn btn-primary"
            [disabled]="registering"
          >
            <span *ngIf="registering">报名中...</span>
            <span *ngIf="!registering">🎯 立即报名</span>
          </button>
        </div>
        
        <div class="alert alert-warning" *ngIf="!authService.isLoggedIn()">
          请先 <a routerLink="/login">登录</a> 后再报名参加活动
        </div>
      </div>
    </div>
  `,
  styles: [`
    .activity-detail {
      padding: 32px;
    }
    
    .activity-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid #e1e5ea;
      gap: 24px;
    }
    
    .activity-title {
      font-size: 28px;
      color: var(--text-primary);
      margin-bottom: 12px;
    }
    
    .activity-meta-top {
      display: flex;
      gap: 24px;
      color: var(--text-secondary);
      font-size: 14px;
    }
    
    .action-buttons {
      display: flex;
      gap: 12px;
    }
    
    .info-section {
      margin-bottom: 32px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 16px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    
    .info-item {
      background: var(--bg-secondary);
      padding: 16px 20px;
      border-radius: var(--radius-md);
    }
    
    .info-label {
      display: block;
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }
    
    .info-value {
      font-size: 16px;
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .description-content {
      background: var(--bg-secondary);
      padding: 20px 24px;
      border-radius: var(--radius-md);
      line-height: 1.8;
      color: var(--text-primary);
      white-space: pre-wrap;
    }
    
    .activity-actions {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 2px solid #e1e5ea;
    }
    
    .activity-actions .btn {
      font-size: 16px;
      padding: 14px 32px;
    }
  `]
})
export class ActivityDetailComponent implements OnInit {
  activity: Activity | null = null;
  loading = true;
  registering = false;
  errorMessage = '';
  successMessage = '';
  isOrganizer = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private activityService: ActivityService,
    private registrationService: RegistrationService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadActivity(+id);
    }
  }

  loadActivity(id: number): void {
    this.loading = true;
    this.activityService.getActivity(id).subscribe({
      next: (activity: Activity) => {
        this.activity = activity;
        const currentUser = this.authService.currentUserValue;
        this.isOrganizer = currentUser?.id === activity.organizerId;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/activities']);
      }
    });
  }

  onRegister(): void {
    if (!this.activity) return;
    
    this.registering = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.registrationService.registerForActivity(this.activity.id).subscribe({
      next: () => {
        this.successMessage = '报名成功！请等待管理员审核。';
        this.registering = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.error || '报名失败，请稍后重试';
        this.registering = false;
      }
    });
  }
}