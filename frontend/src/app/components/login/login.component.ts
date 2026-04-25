import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-container">
      <div class="auth-card card">
        <div class="auth-header">
          <div class="logo-icon">🎯</div>
          <h1>社团活动管理系统</h1>
          <p>欢迎回来，请登录您的账户</p>
        </div>
        
        <div *ngIf="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input 
              type="text" 
              formControlName="username" 
              class="form-control"
              placeholder="请输入用户名"
              [ngClass]="{'is-invalid': submitted && f['username'].errors}"
            />
            <div *ngIf="submitted && f['username'].errors" class="text-danger">
              <div *ngIf="f['username'].errors['required']">用户名不能为空</div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">密码</label>
            <input 
              type="password" 
              formControlName="password" 
              class="form-control"
              placeholder="请输入密码"
              [ngClass]="{'is-invalid': submitted && f['password'].errors}"
            />
            <div *ngIf="submitted && f['password'].errors" class="text-danger">
              <div *ngIf="f['password'].errors['required']">密码不能为空</div>
            </div>
          </div>
          
          <button type="submit" class="btn btn-primary w-full" [disabled]="loading">
            <span *ngIf="loading">登录中...</span>
            <span *ngIf="!loading">登 录</span>
          </button>
        </form>
        
        <div class="auth-footer">
          <p>还没有账户？ <a routerLink="/register">立即注册</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-gradient);
      padding: 20px;
    }
    
    .auth-card {
      width: 100%;
      max-width: 420px;
      padding: 40px;
    }
    
    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }
    
    .logo-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    .auth-header h1 {
      font-size: 24px;
      color: var(--text-primary);
      margin-bottom: 8px;
    }
    
    .auth-header p {
      color: var(--text-secondary);
    }
    
    .auth-footer {
      text-align: center;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e1e5ea;
    }
    
    .auth-footer a {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 500;
    }
    
    .text-danger {
      color: var(--danger-color);
      font-size: 12px;
      margin-top: 4px;
    }
    
    .w-full {
      width: 100%;
    }
    
    .is-invalid {
      border-color: var(--danger-color) !important;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }

    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.login({
      username: this.f['username'].value,
      password: this.f['password'].value
    }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigate([returnUrl]);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.error || '登录失败，请检查用户名和密码';
        this.loading = false;
      }
    });
  }
}