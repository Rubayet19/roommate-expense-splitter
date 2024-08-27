
import axios from 'axios';

const API_URL = '${process.env.NEXT_PUBLIC_API_URL}/auth/';

export const login = async (username: string, password: string) => {
  try {
    const response = await axios.post(API_URL + 'login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      return { success: true };
    }
    return { success: false, message: 'Invalid response from server' };
  } catch (error) {
    console.error("Login failed:", error);
    if (axios.isAxiosError(error) && error.response) {
      return { success: false, message: error.response.data };
    }
    return { success: false, message: 'An unexpected error occurred' };
  }
};

export const logout = () => {
  console.log("Logging out, removing user data and token");
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

export const register = async (username: string, password: string) => {
  try {
    const response = await axios.post(API_URL + 'signup', { username, password });
    return response.data;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
};

export async function getCurrentUser(): Promise<any> {
  console.log("Getting current user...");
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      console.log("User data found in localStorage");
      return JSON.parse(userStr);
    }
  }

  console.log("No user data found");
  return null;
}
