type User = {
  id: string;
  email: string;
  name?: string;
  userID: string;
  role: String;
  profileImage?: string;
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
  urgency?: 'low' | 'medium' | 'high' | 'emergency' | string;
  warningMessage?: string;
  matchedSymptoms?: string[];
  canShowDoctors?: boolean;
  retrievalQuery?: string;
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

export type Doctor = {
  _id: string;
  fullName: string;
  specialization:
    | string
    | {
        _id: string;
        name?: string;
        slug?: string;
      };
  specializationName: string;
  qualifications: string;
  experienceYears: number;
  gender: 'male' | 'female' | 'other' | '';
  hospitalOrClinic: string;
  chamberAddress: string;
  area: string;
  city: string;
  district: string;
  country: string;
  latitude: number;
  longitude: number;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  consultation: string;
  appointmentPhone: string[];
  appointmentWebsite: string;
  bio: string;
  profileImage: string;
  fees: number;
  offday: string;
  isActive: boolean;
  isApproved: boolean;
  addedByAdmin?: {
    _id: string;
    name?: string;
    email?: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type DoctorListResponse = {
  success: boolean;
  count: number;
  data: Doctor[];
  message?: string;
};

export type SpecializationOption = {
  _id: string;
  name: string;
  slug?: string;
};

export type SpecializationResponse = {
  success: boolean;
  data: SpecializationOption[];
};

export type DoctorFormState = {
  fullName: string;
  specialization: string;
  specializationName: string;
  qualifications: string;
  experienceYears: string;
  gender: '' | 'male' | 'female' | 'other';
  hospitalOrClinic: string;
  chamberAddress: string;
  area: string;
  city: string;
  district: string;
  country: string;
  latitude: string;
  longitude: string;
  consultation: string;
  appointmentPhone: string;
  appointmentWebsite: string;
  bio: string;
  profileImage: string;
  fees: string;
  offday: string;
  isActive: boolean;
  isApproved: boolean;
};

export const initialDoctorForm: DoctorFormState = {
  fullName: '',
  specialization: '',
  specializationName: '',
  qualifications: '',
  experienceYears: '0',
  gender: '',
  hospitalOrClinic: '',
  chamberAddress: '',
  area: '',
  city: '',
  district: '',
  country: 'Bangladesh',
  latitude: '',
  longitude: '',
  consultation: '',
  appointmentPhone: '',
  appointmentWebsite: '',
  bio: '',
  profileImage: '',
  fees: '0',
  offday: '',
  isActive: true,
  isApproved: true,
};

export function buildDoctorPayload(form: DoctorFormState) {
  const latitude = Number(form.latitude);
  const longitude = Number(form.longitude);

  return {
    fullName: form.fullName.trim(),
    specialization: form.specialization,
    specializationName: form.specializationName.trim(),
    qualifications: form.qualifications.trim(),
    experienceYears: Number(form.experienceYears || 0),
    gender: form.gender,
    hospitalOrClinic: form.hospitalOrClinic.trim(),
    chamberAddress: form.chamberAddress.trim(),
    area: form.area.trim(),
    city: form.city.trim(),
    district: form.district.trim(),
    country: form.country.trim() || 'Bangladesh',
    latitude,
    longitude,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
    consultation: form.consultation.trim(),
    appointmentPhone: form.appointmentPhone
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    appointmentWebsite: form.appointmentWebsite.trim(),
    bio: form.bio.trim(),
    profileImage: form.profileImage.trim(),
    fees: Number(form.fees || 0),
    offday: form.offday.trim(),
    isActive: Boolean(form.isActive),
    isApproved: Boolean(form.isApproved),
  };
}

export function mapDoctorToForm(doctor: Doctor): DoctorFormState {
  const specializationId =
    typeof doctor.specialization === 'string'
      ? doctor.specialization
      : doctor.specialization?._id || '';

  return {
    fullName: doctor.fullName || '',
    specialization: specializationId,
    specializationName: doctor.specializationName || '',
    qualifications: doctor.qualifications || '',
    experienceYears: String(doctor.experienceYears ?? 0),
    gender: doctor.gender || '',
    hospitalOrClinic: doctor.hospitalOrClinic || '',
    chamberAddress: doctor.chamberAddress || '',
    area: doctor.area || '',
    city: doctor.city || '',
    district: doctor.district || '',
    country: doctor.country || 'Bangladesh',
    latitude: doctor.latitude != null ? String(doctor.latitude) : '',
    longitude: doctor.longitude != null ? String(doctor.longitude) : '',
    consultation: doctor.consultation || '',
    appointmentPhone: Array.isArray(doctor.appointmentPhone)
      ? doctor.appointmentPhone.join(', ')
      : '',
    appointmentWebsite: doctor.appointmentWebsite || '',
    bio: doctor.bio || '',
    profileImage: doctor.profileImage || '',
    fees: doctor.fees != null ? String(doctor.fees) : '0',
    offday: doctor.offday || '',
    isActive: Boolean(doctor.isActive),
    isApproved: Boolean(doctor.isApproved),
  };
}


type NearbyDoctorParams = {
  latitude: number;
  longitude: number;
  specialization: string;
  radius?: number;
};


export type { User, AuthContextType, Section, SavedDoctor, SavedLocation, AnalysisResponse, NearbyDoctorsResponse, NearbyDoctorParams };