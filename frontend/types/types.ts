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


export type { User, AuthContextType, Section, SavedDoctor, SavedLocation };