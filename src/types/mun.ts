export interface Project {
  id: string;
  name: string;
  committee: string;
  topic: string;
  chair_report: string;
  created_at: string;
  updated_at: string;
}

export interface CountryProfile {
  id: string;
  project_id: string;
  country: string;
  profile_json: {
    behavior_style: string;
    priorities: string[];
    red_lines: string[];
    allies: string;
    opponents: string;
    stance_summary: string;
    anchors: string[];
  };
  created_at: string;
}

export interface Source {
  id: string;
  project_id: string;
  type: 'main_resolution' | 'co_resolution';
  text: string;
  created_at: string;
  updated_at: string;
}

export interface Output {
  id: string;
  project_id: string;
  type: string;
  input_json: Record<string, unknown> | null;
  result_text: string;
  created_at: string;
}

export type GenerationMode = 
  | 'country_profile'
  | 'opening_speech'
  | 'yield_for'
  | 'yield_against'
  | 'pois'
  | 'explain_topic'
  | 'amend_recommend'
  | 'amend_for'
  | 'amend_against';

export interface GenerationRequest {
  project_id: string;
  mode: GenerationMode;
  tone?: 'legal' | 'aggressive' | 'calm' | 'cold';
  length?: 60 | 90 | 120;
  amendment_text?: string;
}
