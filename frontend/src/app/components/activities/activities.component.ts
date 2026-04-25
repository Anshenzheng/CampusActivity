import { Component, OnInit } from '@angular/core';
import { ActivityService } from '../../services/activity.service';
import { Activity, PageResponse } from '../../models/models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-activities',
  template: `
    <div class="container">
      <div class="page-header d-flex justify-between align-center mb-4">
        <div>
          <h1 class="page-title">🎪 活动列表</h1>
          <p class="page-subtitle">发现精彩的校园社团活动</p>
        </div>
        <button 
          *ngIf="authService.isAdmin()" 
          routerLink="/create-activity" 
          class="btn btn-primary"
        >
          + 发布活动
        </button>
      </div>
      
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
      </div>
      
      <div *ngIf="!loading && activities.length === 0" class="empty-state card">
        <h3>暂无活动</h3>
        <p>目前还没有任何活动发布</p>
      </div>
      
      <div class="activity-grid" *ngIf="!loading && activities.length > 0">
        <div *ngFor="let activity of activities" class="activity-card card" routerLink="/activities/{{ activity.id }}">
          <div class="activity-header">
            <h3 class="activity-title">{{ activity.title }}</h3>
            <span class="badge badge-admin">{{ activity.organizerName }}</span>
          </div>
          
          <div class="activity-meta">
            <div class="meta-item">
              <span class="meta-icon">📅</span>
              <span>{{ activity.startDate }} 至 {{ activity.endDate }}</span>
            </div>
            <div class="meta-item" *ngIf="activity.location">
              <span class="meta-icon">📍</span>
              <span>{{ activity.location }}</span>
            </div>
            <div class="meta-item" *ngIf="activity.maxParticipants">
              <span class="meta-icon">👥</span>
              <span>限 {{ activity.maxParticipants }} 人</span>
            </div>
          </div>
          
          <p class="activity-desc" *ngIf="activity.description">
            {{ activity.description | slice:0:100 }}{{ activity.description?.length > 100 ? '...' : '' }}
          </p>
          
          <div class="activity-footer">
            <span class="view-detail">查看详情 →</span>
          </div>
        </div>
      </div>
      
      <div class="pagination-section" *ngIf="totalPages > 1">
        <p class="page-info">共 {{ totalElements }} 条记录，第 {{ currentPage + 1 }} / {{ totalPages }} 页</p>
        <div class="pagination">
          <button (click)="loadPage(currentPage - 1)" [disabled]="currentPage === 0">
            上一页
          </button>
          <ng-container *ngFor="let page of pages">
            <button 
              (click)="loadPage(page)" 
              [class.active]="page === currentPage"
            >
              {{ page + 1 }}
            </button>
          </ng-container>
          <button (click)="loadPage(currentPage + 1)" [disabled]="currentPage === totalPages - 1">
            下一页
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 32px;
    }
    
    .page-title {
      font-size: 28px;
      color: var(--text-primary);
      margin-bottom: 8px;
    }
    
    .page-subtitle {
      color: var(--text-secondary);
      font-size: 16px;
    }
    
    .activity-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }
    
    .activity-card {
      cursor: pointer;
      display: flex;
      flex-direction: column;
    }
    
    .activity-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }
    
    .activity-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      gap: 12px;
    }
    
    .activity-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.4;
    }
    
    .activity-meta {
      margin-bottom: 16px;
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      color: var(--text-secondary);
      font-size: 14px;
    }
    
    .meta-icon {
      font-size: 16px;
    }
    
    .activity-desc {
      color: var(--text-secondary);
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 16px;
      flex: 1;
    }
    
    .activity-footer {
      padding-top: 16px;
      border-top: 1px solid #e1e5ea;
    }
    
    .view-detail {
      color: var(--primary-color);
      font-weight: 500;
      font-size: 14px;
    }
    
    .pagination-section {
      margin-top: 32px;
    }
  `]
})
export class ActivitiesComponent implements OnInit {
  activities: Activity[] = [];
  loading = true;
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  pages: number[] = [];

  constructor(
    private activityService: ActivityService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(page: number): void {
    if (page < 0 || (this.totalPages > 0 && page >= this.totalPages)) {
      return;
    }
    
    this.loading = true;
    this.activityService.getActivities(page, this.pageSize).subscribe({
      next: (response: PageResponse<Activity>) => {
        this.activities = response.content;
        this.currentPage = response.pageNumber;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.pages = this.getVisiblePages();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages - 1, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}