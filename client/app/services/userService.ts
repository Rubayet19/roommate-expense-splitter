import api from './api';
import { User } from '../dashboard/types/shared';

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/users/current');
  return response.data;
};