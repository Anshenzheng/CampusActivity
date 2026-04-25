import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  template: `
    <div class="auth-container">
      <div class="auth-card card">
        <div class="auth-header">
          <div class="logo-icon">🎯</div>
          <h1>注册新账户</h1>
          <p>加入社团活动管理系统</p>
        </div>
        
        <div *ngIf="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input 
              type="text" 
              formControlName="username" 
              class="form-control"
              placeholder="请输入用户名（3-50个字符）"
              [ngClass]="{'is-invalid': submitted && f['username'].errors}"
            />
            <div *ngIf="submitted && f['username'].errors" class="text-danger">
              <div *ngIf="f['username'].errors['required']">用户名不能为空</div>
              <div *ngIf="f['username'].errors['minlength']">用户名至少3个字符</div>
              <div *ngIf="f['username'].errors['maxlength']">用户名不能超过50个字符</div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">真实姓名</label>
            <input 
              type="text" 
              formControlName="realName" 
              class="form-control"
              placeholder="请输入真实姓名"
              [ngClass]="{'is-invalid': submitted && f['realName'].errors}"
            />
            <div *ngIf="submitted && f['realName'].errors" class="text-danger">
              <div *ngIf="f['realName'].errors['required']">真实姓名不能为空</div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">邮箱</label>
            <input 
              type="email" 
              formControlName="email" 
              class="form-control"
              placeholder="请输入邮箱地址"
              [ngClass]="{'is-invalid': submitted && f['email'].errors}"
            />
            <div *ngIf="submitted && f['email'].errors" class="text-danger">
              <div *ngIf="f['email'].errors['required']">邮箱不能为空</div>
              <div *ngIf="f['email'].errors['email']">邮箱格式不正确</div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">手机号</label>
            <input 
              type="tel" 
              formControlName="phone" 
              class="form-control"
              placeholder="请输入手机号（选填）"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">密码</label>
            <input 
              type="password" 
              formControlName="password" 
              class="form-control"
              placeholder="请输入密码（至少6个字符）"
              [ngClass]="{'is-invalid': submitted && f['password'].errors}"
            />
            <div *ngIf="submitted && f['password'].errors" class="text-danger">
              <div *ngIf="f['password'].errors['required']">密码不能为空</div>
              <div *ngIf="f['password'].errors['minlength']">密码至少6个字符</div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">确认密码</label>
            <input 
              type="password" 
              formControlName="confirmPassword" 
              class="form-control"
              placeholder="请再次输入密码"
              [ngClass]="{'is-invalid': submitted && f['confirmPassword'].errors}"
            />
            <div *ngIf="submitted && f['confirmPassword'].errors" class="text-danger">
              <div *ngIf="f['confirmPassword'].errors['required']">请确认密码</div>
              <div *ngIf="f['confirmPassword'].errors['mismatch']">两次输入的密码不一致</div>
            </div>
          </div>
          
          <button type="submit" class="btn btn-primary w-full" [disabled]="loading">
            <span *ngIf="loading">注册中...</span>
            <span *ngIf="!loading">注 册</span>
          </button>
        </form>
        
        <div class="auth-footer">
          <p>已有账户？ <a routerLink="/login">立即登录</a></p>
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
      max-width: 500px;
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
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }

    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      realName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  get f() { return this.registerForm.controls; }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (confirmPassword?.errors && !confirmPassword.errors['mismatch']) {
      return null;
    }
    
    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      confirmPassword?.setErrors(null);
      return null;
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.register({
      username: this.f['username'].value,
      password: this.f['password'].value,
      realName: this.f['realName'].value,
      email: this.f['email'].value,
      phone: this.f['phone'].value
    }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.error || '注册失败，请稍后重试';
        this.loading = false;
      }
    });
  }
}