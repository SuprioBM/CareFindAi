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



export type { User, AuthContextType, Section };