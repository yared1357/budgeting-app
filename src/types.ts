export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  type: TransactionType;
  currency: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export type Currency = {
  code: string;
  symbol: string;
  name: string;
  flag: string;
};

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface Budget {
  categoryId: string;
  amount: number;
}
