import type { AuthUser } from '../store/useAuthStore';

const API_BASE_URL = 'http://localhost:3001/api/auth';

interface AuthPayload {
  token: string;
  user: AuthUser;
}

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

const request = async <T>(path: string, body: unknown): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as { message?: string } & Partial<T>;

  if (!response.ok) {
    throw new Error(data.message ?? `Request failed with status ${response.status}`);
  }

  return data as T;
};

export const authService = {
  login: (input: LoginInput): Promise<AuthPayload> => {
    return request<AuthPayload>('/login', input);
  },
  register: (input: RegisterInput): Promise<AuthPayload> => {
    return request<AuthPayload>('/register', input);
  },
};
