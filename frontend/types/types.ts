type User = {
  id: string;
  email: string;
  name?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (user: User, accessToken: string) => void;
  logout: () => Promise<void>;
};

type Section =
  | 'dashboard'
  | 'doctors'
  | 'add-doctor'
  | 'specializations'
  | 'suggestions'
  | 'patients'
  | 'appointments'
  | 'chambers'
  | 'reports'
  | 'settings';


type SavedDoctor = {
  id: number;
  name: string;
  specialty: string;
  rating: string;
  reviews: number;
  image: string;
};

type SavedLocation = {
  id: number;
  tag: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  image: string;
  lat: number;
  lng: number;
};


type AnalysisResponse = {
  specialist?: string;
  explanation?: string;
  urgency?: 'low' | 'medium' | 'high' | string;
  warningMessage?: string;
  matchedSymptoms?: string[];
  canShowDoctors?: boolean;
};

type Doctor = {
  _id: string;
  fullName: string;
  specialization?: {
    _id: string;
    name: string;
  };
  specializationName?: string;
  qualifications?: string;
  hospitalOrClinic?: string;
  chamberAddress?: string;
  area?: string;
  city?: string;
  district?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  consultation?: string;
  appointmentPhone?: string[];
  appointmentWebsite?: string;
  bio?: string;
  profileImage?: string;
  fees?: number;
  offday?: string;
  distanceKm?: number;
};

type NearbyDoctorsResponse = {
  success: boolean;
  count: number;
  specialization?: {
    _id: string;
    name: string;
    resolvedFrom?: string;
  } | null;
  data: Doctor[];
  message?: string;
};

export type { User, AuthContextType, Section, SavedDoctor, SavedLocation, AnalysisResponse, Doctor, NearbyDoctorsResponse };