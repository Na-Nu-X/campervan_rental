import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  BookingRequestPayload,
  CamperDetail,
  CamperFilters,
  CamperSummary,
  ExtraAccessory,
  InquiryPayload,
  TravelRoute,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getCampers(filters: CamperFilters = {}): Observable<CamperSummary[]> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<CamperSummary[]>(`${this.baseUrl}/campers/`, { params });
  }

  getCamper(slug: string): Observable<CamperDetail> {
    return this.http.get<CamperDetail>(`${this.baseUrl}/campers/${encodeURIComponent(slug)}/`);
  }

  getAccessories(): Observable<ExtraAccessory[]> {
    return this.http.get<ExtraAccessory[]>(`${this.baseUrl}/accessories/`);
  }

  getRoutes(): Observable<TravelRoute[]> {
    return this.http.get<TravelRoute[]>(`${this.baseUrl}/routes/`);
  }

  createBooking(payload: BookingRequestPayload): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/bookings/`, payload);
  }

  createInquiry(payload: InquiryPayload): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/inquiries/`, payload);
  }
}
