export interface CameraStream {
  id: string
  name: string
  location: string
  streamUrl: string
  status: "normal" | "alert" | "offline"
  lastUpdated: string
}

export interface Alert {
  id: string
  title: string
  description: string
  location: string
  timestamp: string
  status: "new" | "in-progress" | "resolved"
  priority: "low" | "medium" | "high"
  lawReference: string
  source: "Камера" | "Гражданин"
  imageUrl: string | null
}


export interface Person {
  fullName: string;
  address: string;
  documentType: 'passport' | 'driver_license' | 'other';
  documentNumber: string;
}

export interface Official {
  fullName: string;
  position: string;
  organization: string;
}

export interface LegalEntity {
  name: string;
  address: string;
  inn: string;
  director: string;
}

export interface Violation {
  date: string;
  time: string;
  location: string;
  article: string;
  description: string;
  circumstances: string;
  evidence: string[];
}

export interface Witness {
  fullName: string;
  address: string;
  testimony: string;
}

export interface Protocol {
  id: string;
  dateCreated: string;
  placeCreated: string;
  official: Official;
  offender: Person | LegalEntity;
  violation: Violation;
  witnesses?: Witness[];
  offenderExplanation?: string;
  signatures: {
    official: boolean;
    offender?: boolean;
    witnesses?: boolean[];
  };
  notes?: string;
}

import 'next-auth';

export type UserRole = 'admin' | 'moderator' | 'citizen';

// Extend the existing next-auth types
declare module "next-auth" {
  interface User {
    role?: string;
    position?: string;
    organization?: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      position?: string;
      organization?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}