import api from './api';
import { Roommate, AddRoommateDTO } from '../dashboard/types/shared';

export const getRoommates = async (): Promise<Roommate[]> => {
  const response = await api.get<Roommate[]>('/roommates');
  return response.data;
};

export const addRoommate = async (name: string): Promise<Roommate> => {
  const response = await api.post<Roommate>('/roommates', { name });
  return response.data;
};
export const deleteRoommate = async (id: number): Promise<void> => {
  await api.delete(`/roommates/${id}`);
};