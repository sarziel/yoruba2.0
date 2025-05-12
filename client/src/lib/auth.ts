import { apiRequest } from './queryClient';

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
}

export async function login(credentials: LoginCredentials) {
  const response = await apiRequest('POST', '/api/auth/login', credentials);
  return response.json();
}

export async function register(data: RegisterData) {
  const response = await apiRequest('POST', '/api/auth/register', data);
  return response.json();
}

export async function logout() {
  const response = await apiRequest('POST', '/api/auth/logout', {});
  return response.json();
}

export async function getCurrentUser() {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
    });
    
    if (response.status === 401) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error('Erro ao obter usuário atual');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return null;
  }
}
