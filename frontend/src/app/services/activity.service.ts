import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Activity, ActivityRequest, PageResponse } from '../models/models';

const API_URL = 'http://localhost:8080/api/activities/';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  constructor(private http: HttpClient) { }

  getActivities(page: number = 0, size: number = 10): Observable<PageResponse<Activity>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Activity>>(API_URL, { params });
  }

  getActivity(id: number): Observable<Activity> {
    return this.http.get<Activity>(API_URL + id);
  }

  createActivity(activity: ActivityRequest): Observable<Activity> {
    return this.http.post<Activity>(API_URL, activity);
  }

  updateActivity(id: number, activity: ActivityRequest): Observable<Activity> {
    return this.http.put<Activity>(API_URL + id, activity);
  }

  deleteActivity(id: number): Observable<void> {
    return this.http.delete<void>(API_URL + id);
  }
}