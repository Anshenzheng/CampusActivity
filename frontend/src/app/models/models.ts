export interface User {
  id: number;
  username: string;
  realName: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
}

export interface Activity {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  maxParticipants?: number;
  organizerId: number;
  organizerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: number;
  activityId: number;
  activityTitle: string;
  userId: number;
  userRealName: string;
  userEmail: string;
  userPhone?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason?: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  realName: string;
  email: string;
  phone?: string;
  role?: 'ADMIN' | 'MEMBER';
}

export interface JwtResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface ActivityRequest {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  maxParticipants?: number;
}

export interface RegistrationStatusUpdateRequest {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason?: string;
}