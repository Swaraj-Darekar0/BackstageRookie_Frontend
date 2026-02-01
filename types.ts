
export type PlanType = 'basic' | 'full';

export interface User {
  email: string;
  name: string;
  avatar?: string;  // Data URL (e.g., "data:image/png;base64,...")
}

export interface AppState {
  githubUrl: string;
  sectorHint: string;
  plan: PlanType;
  scanId: string | null;
  isLoggedIn: boolean;
  user: User | null;
}

export interface AnalyzeResponse {
  status: string;
  scan_id: string;
  plan_used: string;
  total_findings: number;
  message: string;
}

export interface PlanResponse {
  status: string;
  plan: PlanType;
  message?: string;
}

export interface AuthResponse {
  access_token: string;
  expires_in: number;
}

export type ReportType = 'technical' | 'business' | 'regulatory';

export interface Model {
  name: string;
  display_name: string;
  description: string;
}
