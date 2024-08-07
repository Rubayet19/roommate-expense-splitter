// services/expenseParticipantService.ts
import api from './api';
import { ExpenseParticipantDTO } from '../dashboard/types/shared';

export const getUserExpenseParticipants = async (): Promise<ExpenseParticipantDTO[]> => {
  const response = await api.get<ExpenseParticipantDTO[]>('/expense-participants');
  return response.data;
};