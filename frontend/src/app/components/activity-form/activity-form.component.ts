import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivityService } from '../../services/activity.service';
import { Activity, ActivityRequest } from '../../models/models';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-activity-form',
  template: `
    <div class="container">
      <button routerLink="/activities" class="btn btn-outline btn-sm mb-4">
        ← 返回活动列表
      </button>
      
      <div class="form-card card">
        <div class="form-header">
          <h1 class="form-title">{{ isEdit ? '✏️ 编辑活动' : '🎉 发布新活动' }}</h1>
          <p class="form-subtitle">请填写以下信息</p>
        </div>
        
        <div *ngIf="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>
        
        <form [formGroup]="activityForm" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group full-width">
              <label class="form-label">活动标题 *</label>
              <input 
                type="text" 
                formControlName="title" 
                class="form-control"
                placeholder="请输入活动标题"
                [ngClass]="{'is-invalid': submitted && f['title'].errors}"
              />
              <div *ngIf="submitted && f['title'].errors" class="text-danger">
                <div *ngIf="f['title'].errors['required']">活动标题不能为空</div>
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">开始日期 *</label>
              <input 
                type="date" 
                formControlName="startDate" 
                class="form-control"
                [ngClass]="{'is-invalid': submitted && f['startDate'].errors}"
              />
              <div *ngIf="submitted && f['startDate'].errors" class="text-danger">
                <div *ngIf="f['startDate'].errors['required']">开始日期不能为空</div>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">结束日期 *</label>
              <input 
                type="date" 
                formControlName="endDate" 
                class="form-control"
                [ngClass]="{'is-invalid': submitted && f['endDate'].errors}"
              />
              <div *ngIf="submitted && f['endDate'].errors" class="text-danger">
                <div *ngIf="f['endDate'].errors['required']">结束日期不能为空</div>
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">活动地点</label>
              <input 
                type="text" 
                formControlName="location" 
                class="form-control"
                placeholder="请输入活动地点"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">参与人数上限</label>
              <input 
                type="number" 
                formControlName="maxParticipants" 
                class="form-control"
                placeholder="不填则不限制"
                min="1"
              />
            </div>
          </div>
          
          <div class="form-group full-width">
            <label class="form-label">活动描述</label>
            <textarea 
              formControlName="description" 
              class="form-control"
              placeholder="请输入活动描述"
              rows="6"
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-outline" routerLink="/activities">
              取消
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="submitting">
              <span *ngIf="submitting">提交中...</span>
              <span *ngIf="!submitting">{{ isEdit ? '保存修改' : '发布活动' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-card {
      max-width: 800px;
      margin: 0 auto;
      padding: 32px;
    }
    
    .form-header {
      text-align: center;
      margin-bottom: 32px;
    }
    
    .form-title {
      font-size: 24px;
      color: var(--text-primary);
      margin-bottom: 8px;
    }
    
    .form-subtitle {
      color: var(--text-secondary);
    }
    
    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
    }
    
    .full-width {
      grid-column: 1 / -1;
    }
    
    textarea.form-control {
      resize: vertical;
      min-height: 150px;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e1e5ea;
    }
    
    .text-danger {
      color: var(--danger-color);
      font-size: 12px;
      margin-top: 4px;
    }
    
    .is-invalid {
      border-color: var(--danger-color) !important;
    }
  `]
})
export class ActivityFormComponent implements OnInit {
  activityForm: FormGroup;
  isEdit = false;
  activityId: number | null = null;
  submitting = false;
  submitted = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private activityService: ActivityService
  ) {
    this.activityForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      location: [''],
      maxParticipants: ['']
    }, {
      validators: this.dateRangeValidator
    });
  }

  get f() { return this.activityForm.controls; }

  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;
    
    if (!startDate || !endDate) {
      return null;
    }
    
    if (new Date(endDate) < new Date(startDate)) {
      control.get('endDate')?.setErrors({ invalidRange: true });
      return { invalidRange: true };
    }
    
    return null;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.activityId = +id;
      this.loadActivity(+id);
    }
  }

  loadActivity(id: number): void {
    this.activityService.getActivity(id).subscribe({
      next: (activity: Activity) => {
        this.activityForm.patchValue({
          title: activity.title,
          description: activity.description,
          startDate: activity.startDate,
          endDate: activity.endDate,
          location: activity.location,
          maxParticipants: activity.maxParticipants
        });
      },
      error: () => {
        this.router.navigate(['/activities']);
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.activityForm.invalid) {
      return;
    }

    const formValue = this.activityForm.value;
    const request: ActivityRequest = {
      title: formValue.title,
      description: formValue.description || undefined,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      location: formValue.location || undefined,
      maxParticipants: formValue.maxParticipants ? +formValue.maxParticipants : undefined
    };

    this.submitting = true;

    if (this.isEdit && this.activityId) {
      this.activityService.updateActivity(this.activityId, request).subscribe({
        next: () => {
          this.router.navigate(['/activities', this.activityId]);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.error || '更新失败，请稍后重试';
          this.submitting = false;
        }
      });
    } else {
      this.activityService.createActivity(request).subscribe({
        next: (activity) => {
          this.router.navigate(['/activities', activity.id]);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.error || '发布失败，请稍后重试';
          this.submitting = false;
        }
      });
    }
  }
}