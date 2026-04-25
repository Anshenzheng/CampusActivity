import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Registration, RegistrationStatusUpdateRequest, PageResponse } from '../models/models';

const API_URL = 'http://localhost:8080/api/registrations/';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  constructor(private http: HttpClient) { }

  getMyRegistrations(page: number = 0, size: number = 10): Observable<PageResponse<Registration>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Registration>>(API_URL + 'my', { params });
  }

  getRegistrationsByActivity(activityId: number, page: number = 0, size: number = 10): Observable<PageResponse<Registration>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Registration>>(API_URL + 'activity/' + activityId, { params });
  }

  registerForActivity(activityId: number): Observable<Registration> {
    return this.http.post<Registration>(API_URL + 'activity/' + activityId, {});
  }

  updateRegistrationStatus(registrationId: number, request: RegistrationStatusUpdateRequest): Observable<Registration> {
    return this.http.put<Registration>(API_URL + registrationId + '/status', request);
  }

  getActivityStatistics(activityId: number): Observable<any> {
    return this.http.get<any>(API_URL + 'stats/activity/' + activityId);
  }

  exportRegistrations(activityId: number): Observable<HttpResponse<Blob>> {
    return this.http.get(API_URL + 'export/activity/' + activityId, {
      responseType: 'blob',
      observe: 'response'
    });
  }
}