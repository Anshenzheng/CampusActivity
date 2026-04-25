import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User, PageResponse } from '../../models/models';

@Component({
  selector: 'app-users',
  template: `
    <div class="container">
      <div class="page-header mb-4">
        <h1 class="page-title">👥 用户管理</h1>
        <p class="page-subtitle">查看社团成员信息</p>
      </div>
      
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
      </div>
      
      <div *ngIf="!loading && users.length === 0" class="empty-state card">
        <h3>暂无用户</h3>
        <p>目前还没有注册的用户</p>
      </div>
      
      <div *ngIf="!loading && users.length > 0" class="users-list card">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>真实姓名</th>
              <th>邮箱</th>
              <th>电话</th>
              <th>角色</th>
              <th>注册时间</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.id }}</td>
              <td>
                <strong>{{ user.username }}</strong>
              </td>
              <td>{{ user.realName }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.phone || '-' }}</td>
              <td>
                <span class="badge" [ngClass]="getRoleBadgeClass(user.role)">
                  {{ getRoleText(user.role) }}
                </span>
              </td>
              <td>{{ user.createdAt | date:'yyyy-MM-dd HH:mm' }}</td>
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
    
    .pagination-section {
      margin-top: 32px;
    }
  `]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = true;
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  pages: number[] = [];

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(page: number): void {
    if (page < 0 || (this.totalPages > 0 && page >= this.totalPages)) {
      return;
    }
    
    this.loading = true;
    this.userService.getUsers(page, this.pageSize).subscribe({
      next: (response: PageResponse<User>) => {
        this.users = response.content;
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

  getRoleText(role: string): string {
    return role === 'ADMIN' ? '管理员' : '普通成员';
  }

  getRoleBadgeClass(role: string): string {
    return role === 'ADMIN' ? 'badge-admin' : 'badge-member';
  }
}