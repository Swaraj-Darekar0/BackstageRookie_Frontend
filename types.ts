
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

export interface SecurityRisk {
  id: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface ComplianceResult {
  applicable: boolean;
  risk_level: 'low' | 'medium' | 'high';
  reason: string;
}

export interface EndpointRequest {
  content_type: string;
  fields: any[];
}

export interface EndpointResponse {
  content_type: string;
  status_codes: number[];
  contains_sensitive_data: boolean;
}

export interface LlmEnrichedEndpoint {
  path: string;
  methods: string[];
  auth: {
    required: boolean;
    type: string;
  };
  request: EndpointRequest;
  response: EndpointResponse;
  security_risks: SecurityRisk[];
  compliance_analysis: Record<string, ComplianceResult>;
}
// ########################################################

export interface AnalyzeResponse {
  status: string;
  scan_id: string;
  plan_used: string;
  total_findings: number;
  message: string;
  // ### NEW: Add the optional framework_analysis property ###
  framework_analysis?: {
      llm_enriched?: {
        endpoints: LlmEnrichedEndpoint[];
      };
    
  };
  // ########################################################
}


export interface PlanResponse {
  status: string;
  plan: PlanType;
}