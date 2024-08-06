import api from './api';
import { ExpenseDTO } from '../dashboard/types/shared';

export const addExpense = async (expense: ExpenseDTO): Promise<ExpenseDTO> => {
  const response = await api.post<ExpenseDTO>('/expenses', expense);
  return response.data;
};

export const getUserExpenses = async (): Promise<ExpenseDTO[]> => {
  const response = await api.get<ExpenseDTO[]>('/expenses');
  return response.data;
};