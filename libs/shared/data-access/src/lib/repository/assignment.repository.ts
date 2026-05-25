import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '@trackora/core/api';

export interface CreateAssignmentDto {
  shipmentIds: string[];
  courierId: string;
  reason?: string;
}

export interface ReassignAssignmentDto {
  newCourierId: string;
  reason: string;
}

export interface CancelAssignmentDto {
  reason?: string;
}

@Injectable({ providedIn: 'root' })
export class AssignmentRepository {
  constructor(private readonly api: ApiClient) {}

  findAll(query: { limit?: number; page?: number; from?: string; to?: string; assignmentType?: string; status?: string; shipmentId?: string; courierId?: string }): Observable<any> {
    return this.api.get('/assignments', query);
  }

  findById(id: string): Observable<any> {
    return this.api.get(`/assignments/${id}`);
  }

  create(dto: CreateAssignmentDto): Observable<any> {
    return this.api.post('/assignments', dto);
  }

  reassign(id: string, dto: ReassignAssignmentDto): Observable<any> {
    return this.api.patch(`/assignments/${id}/reassign`, dto);
  }

  cancel(id: string, dto: CancelAssignmentDto): Observable<any> {
    return this.api.patch(`/assignments/${id}/cancel`, dto);
  }
}
