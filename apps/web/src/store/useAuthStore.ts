import { create } from 'zustand';

export interface AuthUser {
  id: number;
  email: string | null;
  name: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'my-turbo-auth';

const readPersistedState = (): Pick<AuthState, 'token' | 'user'> => {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }

  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) {
      return { token: null, user: null };
    }

    const parsed = JSON.parse(stored) as { token?: string; user?: AuthUser };
    return {
      token: parsed.token ?? null,
      user: parsed.user ?? null,
    };
  } catch {
    return { token: null, user: null };
  }
};

const persistState = (state: Pick<AuthState, 'token' | 'user'>): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
};

const initial = readPersistedState();

export const useAuthStore = create<AuthState>((set) => ({
  user: initial.user,
  token: initial.token,
  isAuthenticated: Boolean(initial.token && initial.user),
  login: (token, user) => {
    persistState({ token, user });
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    set({ token: null, user: null, isAuthenticated: false });
  },
}));
