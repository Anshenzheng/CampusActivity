import { Component, OnInit } from '@angular/core';
import { RegistrationService } from '../../services/registration.service';
import { Registration, PageResponse, RegistrationStatus } from '../../models/models';

@Component({
  selector: 'app-my-registrations',
  template: `
    <div class="container">
      <div class="page-header mb-4">
        <h1 class="page-title">📋 我的报名</h1>
        <p class="page-subtitle">查看我报名的活动及审核状态</p>
      </div>
      
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
      </div>
      
      <div *ngIf="!loading && registrations.length === 0" class="empty-state card">
        <h3>暂无报名记录</h3>
        <p>您还没有报名任何活动</p>
        <button routerLink="/activities" class="btn btn-primary mt-4">
          浏览活动
        </button>
      </div>
      
      <div *ngIf="!loading && registrations.length > 0" class="registrations-list card">
        <table class="table">
          <thead>
            <tr>
              <th>活动名称</th>
              <th>报名时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let registration of registrations">
              <td>
                <a [routerLink]="['/activities', registration.activityId]" class="activity-link">
                  {{ registration.activityTitle }}
                </a>
              </td>
              <td>{{ registration.createdAt | date:'yyyy-MM-dd HH:mm' }}</td>
              <td>
                <span class="badge" [ngClass]="getStatusBadgeClass(registration.status)">
                  {{ getStatusText(registration.status) }}
                </span>
              </td>
              <td>
                <button 
                  [routerLink]="['/activities', registration.activityId]" 
                  class="btn btn-sm btn-outline"
                >
                  查看活动
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div *ngIf="registration.reason" class="reason-box" *ngFor="let registration of registrations">
          <span class="reason-label">审核意见：</span>
          <span class="reason-text">{{ registration.reason }}</span>
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
    
    .activity-link {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 500;
    }
    
    .activity-link:hover {
      text-decoration: underline;
    }
    
    .reason-box {
      margin-top: 8px;
      padding: 8px 12px;
      background: var(--bg-secondary);
      border-radius: var(--radius-sm);
      font-size: 14px;
    }
    
    .reason-label {
      color: var(--text-secondary);
      font-weight: 500;
    }
    
    .reason-text {
      color: var(--text-primary);
    }
    
    .pagination-section {
      margin-top: 32px;
    }
  `]
})
export class MyRegistrationsComponent implements OnInit {
  registrations: Registration[] = [];
  loading = true;
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  pages: number[] = [];

  constructor(private registrationService: RegistrationService) { }

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(page: number): void {
    if (page < 0 || (this.totalPages > 0 && page >= this.totalPages)) {
      return;
    }
    
    this.loading = true;
    this.registrationService.getMyRegistrations(page, this.pageSize).subscribe({
      next: (response: PageResponse<Registration>) => {
        this.registrations = response.content;
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

  getStatusText(status: RegistrationStatus): string {
    const statusMap: Record<RegistrationStatus, string> = {
      'PENDING': '待审核',
      'APPROVED': '已通过',
      'REJECTED': '已拒绝'
    };
    return statusMap[status] || status;
  }

  getStatusBadgeClass(status: RegistrationStatus): string {
    const classMap: Record<RegistrationStatus, string> = {
      'PENDING': 'badge-pending',
      'APPROVED': 'badge-approved',
      'REJECTED': 'badge-rejected'
    };
    return classMap[status] || '';
  }
}