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


export type { User, AuthContextType };