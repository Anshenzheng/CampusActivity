import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { ActivityService } from '../../services/activity.service';
import { Registration, PageResponse, Activity, RegistrationStatusUpdateRequest } from '../../models/models';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-registration-list',
  template: `
    <div class="container">
      <button [routerLink]="['/activities', activityId]" class="btn btn-outline btn-sm mb-4">
        ← 返回活动详情
      </button>
      
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
      </div>
      
      <ng-container *ngIf="!loading">
        <div class="page-header d-flex justify-between align-center mb-4">
          <div>
            <h1 class="page-title">📋 报名名单</h1>
            <p class="page-subtitle">{{ activity?.title }}</p>
          </div>
          <div class="action-buttons">
            <button (click)="exportData()" class="btn btn-secondary btn-sm" [disabled]="exporting">
              <span *ngIf="exporting">导出中...</span>
              <span *ngIf="!exporting">📥 导出名单</span>
            </button>
          </div>
        </div>
        
        <div *ngIf="stats" class="stats-card card mb-4">
          <h3 class="stats-title">📊 统计数据</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ stats.totalCount }}</span>
              <span class="stat-label">总报名</span>
            </div>
            <div class="stat-item pending">
              <span class="stat-value">{{ stats.pendingCount }}</span>
              <span class="stat-label">待审核</span>
            </div>
            <div class="stat-item approved">
              <span class="stat-value">{{ stats.approvedCount }}</span>
              <span class="stat-label">已通过</span>
            </div>
            <div class="stat-item rejected">
              <span class="stat-value">{{ stats.rejectedCount }}</span>
              <span class="stat-label">已拒绝</span>
            </div>
            <div class="stat-item" *ngIf="stats.maxParticipants">
              <span class="stat-value">{{ stats.approvedCount }}/{{ stats.maxParticipants }}</span>
              <span class="stat-label">名额使用</span>
            </div>
          </div>
        </div>
        
        <div *ngIf="errorMessage" class="alert alert-error mb-4">
          {{ errorMessage }}
        </div>
        
        <div *ngIf="successMessage" class="alert alert-success mb-4">
          {{ successMessage }}
        </div>
        
        <div *ngIf="registrations.length === 0" class="empty-state card">
          <h3>暂无报名</h3>
          <p>目前还没有人报名此活动</p>
        </div>
        
        <div *ngIf="registrations.length > 0" class="registrations-list card">
          <table class="table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>邮箱</th>
                <th>电话</th>
                <th>报名时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let registration of registrations">
                <td>
                  <strong>{{ registration.userRealName }}</strong>
                </td>
                <td>{{ registration.userEmail }}</td>
                <td>{{ registration.userPhone || '-' }}</td>
                <td>{{ registration.createdAt | date:'yyyy-MM-dd HH:mm' }}</td>
                <td>
                  <span class="badge" [ngClass]="getStatusBadgeClass(registration.status)">
                    {{ getStatusText(registration.status) }}
                  </span>
                </td>
                <td>
                  <ng-container *ngIf="registration.status === 'PENDING'">
                    <button 
                      (click)="updateStatus(registration.id, 'APPROVED')" 
                      class="btn btn-sm btn-secondary"
                      style="margin-right: 8px;"
                    >
                      通过
                    </button>
                    <button 
                      (click)="updateStatus(registration.id, 'REJECTED')" 
                      class="btn btn-sm btn-danger"
                    >
                      拒绝
                    </button>
                  </ng-container>
                  <span *ngIf="registration.status !== 'PENDING'" class="text-secondary">-</span>
                </td>
              </tr>
            </tbody>
          </table>
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
      </ng-container>
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
    
    .action-buttons {
      display: flex;
      gap: 12px;
    }
    
    .stats-card {
      padding: 24px;
    }
    
    .stats-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 20px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
    }
    
    .stat-item {
      text-align: center;
      padding: 16px;
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
    }
    
    .stat-value {
      display: block;
      font-size: 32px;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 4px;
    }
    
    .stat-label {
      font-size: 14px;
      color: var(--text-secondary);
    }
    
    .stat-item.pending .stat-value {
      color: #e67e22;
    }
    
    .stat-item.approved .stat-value {
      color: var(--success-color);
    }
    
    .stat-item.rejected .stat-value {
      color: var(--danger-color);
    }
    
    .text-secondary {
      color: var(--text-secondary);
    }
    
    .pagination-section {
      margin-top: 32px;
    }
  `]
})
export class RegistrationListComponent implements OnInit {
  activityId: number = 0;
  activity: Activity | null = null;
  registrations: Registration[] = [];
  stats: any = null;
  loading = true;
  exporting = false;
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  pages: number[] = [];
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private registrationService: RegistrationService,
    private activityService: ActivityService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.activityId = +id;
      this.loadData();
    }
  }

  loadData(): void {
    this.loading = true;
    
    this.activityService.getActivity(this.activityId).subscribe({
      next: (activity: Activity) => {
        this.activity = activity;
      },
      error: () => {
        this.router.navigate(['/activities']);
      }
    });
    
    this.registrationService.getActivityStatistics(this.activityId).subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: () => {}
    });
    
    this.loadPage(0);
  }

  loadPage(page: number): void {
    if (page < 0 || (this.totalPages > 0 && page >= this.totalPages)) {
      return;
    }
    
    this.registrationService.getRegistrationsByActivity(this.activityId, page, this.pageSize).subscribe({
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

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': '待审核',
      'APPROVED': '已通过',
      'REJECTED': '已拒绝'
    };
    return statusMap[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classMap: Record<string, string> = {
      'PENDING': 'badge-pending',
      'APPROVED': 'badge-approved',
      'REJECTED': 'badge-rejected'
    };
    return classMap[status] || '';
  }

  updateStatus(registrationId: number, status: 'APPROVED' | 'REJECTED'): void {
    const reason = status === 'REJECTED' ? '未通过审核' : '';
    const request: RegistrationStatusUpdateRequest = {
      status,
      reason
    };
    
    this.registrationService.updateRegistrationStatus(registrationId, request).subscribe({
      next: () => {
        this.successMessage = status === 'APPROVED' ? '已通过审核' : '已拒绝报名';
        this.errorMessage = '';
        this.loadPage(this.currentPage);
        this.loadStats();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.error || '操作失败，请稍后重试';
        this.successMessage = '';
      }
    });
  }

  loadStats(): void {
    this.registrationService.getActivityStatistics(this.activityId).subscribe({
      next: (stats) => {
        this.stats = stats;
      }
    });
  }

  exportData(): void {
    this.exporting = true;
    
    this.registrationService.exportRegistrations(this.activityId).subscribe({
      next: (response: HttpResponse<Blob>) => {
        const blob = response.body;
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const date = new Date().toISOString().slice(0, 10);
          a.download = `报名名单_${this.activity?.title || this.activityId}_${date}.xlsx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
        this.exporting = false;
      },
      error: () => {
        this.errorMessage = '导出失败，请稍后重试';
        this.exporting = false;
      }
    });
  }
}