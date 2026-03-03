import { Category, Currency } from './types';

export const CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: 'Utensils', color: '#ef4444' },
  { id: 'transport', name: 'Transport', icon: 'Car', color: '#3b82f6' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Film', color: '#8b5cf6' },
  { id: 'health', name: 'Health', icon: 'HeartPulse', color: '#10b981' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'ReceiptText', color: '#f59e0b' },
  { id: 'income', name: 'Income', icon: 'TrendingUp', color: '#22c55e' },
  { id: 'other', name: 'Other', icon: 'MoreHorizontal', color: '#64748b' },
];

export const CURRENCIES: Currency[] = [
  { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr', flag: '🇪🇹' },
];
