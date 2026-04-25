import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ActivitiesComponent } from './components/activities/activities.component';
import { ActivityDetailComponent } from './components/activity-detail/activity-detail.component';
import { ActivityFormComponent } from './components/activity-form/activity-form.component';
import { MyRegistrationsComponent } from './components/my-registrations/my-registrations.component';
import { RegistrationListComponent } from './components/registration-list/registration-list.component';
import { UsersComponent } from './components/users/users.component';

import { AuthInterceptor } from './services/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ActivitiesComponent,
    ActivityDetailComponent,
    ActivityFormComponent,
    MyRegistrationsComponent,
    RegistrationListComponent,
    UsersComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }