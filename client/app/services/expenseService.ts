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

export const getUserBalances = async (): Promise<{ [key: number]: number }> => {
  const response = await api.get<{ [key: number]: number }>('/expenses/balances');
  return response.data;
};

export const updateExpense = async (id: number, expense: ExpenseDTO): Promise<ExpenseDTO> => {
  const response = await api.put<ExpenseDTO>(`/expenses/${id}`, expense);
  return response.data;
};

export const deleteExpense = async (id: number): Promise<void> => {
  await api.delete(`/expenses/${id}`);
};