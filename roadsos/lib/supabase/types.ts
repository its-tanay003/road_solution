// Auto-generated types from supabase/schema.sql
// Keep in sync with schema changes

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-' | 'Unknown';
export type IncidentStatus = 'active' | 'acknowledged' | 'resolved' | 'false_alarm';
export type IncidentType =
  | 'road_crash'
  | 'medical'
  | 'fire'
  | 'flood'
  | 'assault'
  | 'other';
export type ResponderType = 'ambulance' | 'police' | 'fire' | 'ngo' | 'volunteer';
export type ChatRole = 'user' | 'assistant' | 'system';
export type AiModel = 'claude' | 'gemini' | 'gpt';

export interface DBUser {
  id: string;
  full_name: string;
  phone: string | null;
  blood_group: BloodGroup | null;
  medical_conditions: string[];
  allergies: string[];
  home_address: string | null;
  home_lat: number | null;
  home_lng: number | null;
  profile_photo_url: string | null;
  language_preference: string;
  theme_preference: string;
  sos_shake_threshold: number;
  sos_hold_duration: number;
  share_location_in_sos: boolean;
  share_medical_in_sos: boolean;
  share_camera_in_sos: boolean;
  is_guest: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBEmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  relationship: string | null;
  notify_via_sms: boolean;
  notify_via_whatsapp: boolean;
  notify_via_call: boolean;
  priority: number;
  created_at: string;
}

export interface DBIncident {
  id: string;
  user_id: string | null;
  incident_type: IncidentType;
  status: IncidentStatus;
  lat: number | null;
  lng: number | null;
  address: string | null;
  geog: unknown | null; // PostGIS geography
  description: string | null;
  battery_level: number | null;
  network_type: string | null;
  device_info: Record<string, unknown> | null;
  media_urls: string[];
  broadcast_status: Record<string, string> | null;
  trigger_type: string | null;
  responder_id: string | null;
  responder_eta_minutes: number | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBResponder {
  id: string;
  name: string;
  type: ResponderType;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  is_available: boolean;
  current_incident_id: string | null;
  created_at: string;
}

export interface DBChatLog {
  id: string;
  user_id: string | null;
  incident_id: string | null;
  role: ChatRole;
  content: string;
  ai_model: AiModel | null;
  tokens_used: number | null;
  created_at: string;
}

// Supabase Database definition for typed client (optional advanced usage)
export type Database = {
  public: {
    Tables: {
      users: { Row: DBUser; Insert: Partial<DBUser>; Update: Partial<DBUser> };
      emergency_contacts: { Row: DBEmergencyContact; Insert: Partial<DBEmergencyContact>; Update: Partial<DBEmergencyContact> };
      incidents: { Row: DBIncident; Insert: Partial<DBIncident>; Update: Partial<DBIncident> };
      responders: { Row: DBResponder; Insert: Partial<DBResponder>; Update: Partial<DBResponder> };
      chat_logs: { Row: DBChatLog; Insert: Partial<DBChatLog>; Update: Partial<DBChatLog> };
    };
  };
};
