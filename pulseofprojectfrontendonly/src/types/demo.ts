export type DemoRequestStatus = 'pending' | 'contacted' | 'completed';

export interface DemoRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  message?: string;
  created_at: string;
  status: DemoRequestStatus;
}

export interface CreateDemoRequest {
  name: string;
  email: string;
  phone: string;
  message?: string;
}

export interface UpdateDemoRequest {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  status?: DemoRequestStatus;
}