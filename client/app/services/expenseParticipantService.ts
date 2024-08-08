import api from './api';
import { ExpenseParticipantDTO } from '../dashboard/types/shared';
import { AxiosError } from 'axios';

export const getUserExpenseParticipants = async (): Promise<ExpenseParticipantDTO[]> => {
  try {
    console.log('Fetching expense participants...');
    const response = await api.get<ExpenseParticipantDTO[]>('/expenses/participants');
    console.log('Expense participants response:', response);
    
    if (response.data && Array.isArray(response.data)) {
      console.log('Expense participants fetched successfully:', response.data);
      return response.data;
    } else {
      console.error('Unexpected response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching expense participants:', error);
    if ((error as AxiosError).response) {
      console.error('Response data:', (error as AxiosError).response?.data);
      console.error('Response status:', (error as AxiosError).response?.status);
      console.error('Response headers:', (error as AxiosError).response?.headers);
    } else if ((error as AxiosError).request) {
      console.error('No response received:', (error as AxiosError).request);
    } else {
      console.error('Error message:', (error as AxiosError).message);
    }
    throw error;
  }
};