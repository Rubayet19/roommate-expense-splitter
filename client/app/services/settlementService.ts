// settlementService.ts

import api from './api';
import { SettlementDTO } from '../dashboard/types/shared';

export const createSettlement = async (settlement: SettlementDTO): Promise<SettlementDTO> => {
  const response = await api.post<SettlementDTO>('/settlements', settlement);
  return response.data;
};