export interface User {
  id: number;
  username: string;
}

export interface Roommate {
  id: number;
  name: string;
  totalOwed?: number;  // This might be calculated on the frontend or returned from the backend
}

// export interface Expense {
//   id?: string;  // Optional because it won't be present for new expenses
//   description: string;
//   amount: string;
//   paidBy: string[];
//   splitWith: string[];
//   splitType: 'equal' | 'custom';  // Changed to match backend enum
//   date: string;
//   splitDetails: { [key: string]: string };
// }

export interface AddRoommateDTO {
  name: string;
}

export interface ExpenseDTO {
  id?: number;
  description: string;
  amount: string;
  paidBy: number[];
  splitWith: number[];
  splitType: string;
  date: string;
  splitDetails: { [key: number]: string };
}

export interface SettlementDTO {
  payerId: number;
  receiverId: number;
  amount: number;
  date: string;
}

export interface ExpenseParticipantDTO {
  id: number;
  expenseId: number;
  participantId: number;
  shareAmount: number;
}