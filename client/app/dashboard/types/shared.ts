export type Roommate={
    id: string;
    name: string;
    email: string;
  };
  

export interface Expense {
  description: string;
  amount: string;
  paidBy: string[];  // Changed to array to allow multiple payers
  splitWith: string[];
  splitType: 'equal' | 'amounts';  // Removed 'percentages'
  date: string;
  splitDetails: { [key: string]: string };
}