import { 
  Utensils, 
  Home, 
  Car, 
  ShoppingBag, 
  Gamepad2, 
  BookOpen, 
  Coffee, 
  Music, 
  Smartphone,
  HeartPulse,
  Banknote,
  Briefcase,
  Gift,
  HelpCircle,
  Zap,
  TrendingUp
} from 'lucide-react';

export type CategoryType = 'income' | 'expense' | 'both';

export interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
  type: CategoryType;
}

export const CATEGORIES: Category[] = [
  // Expenses
  { id: '89139031-64d1-4475-87d3-6058e578a101', name: 'Food & Dining', icon: Utensils, color: '#A855F7', type: 'expense' },
  { id: '89139031-64d1-4475-87d3-6058e578a102', name: 'Rent & Housing', icon: Home, color: '#06B6D4', type: 'expense' },
  { id: '89139031-64d1-4475-87d3-6058e578a103', name: 'Transport', icon: Car, color: '#06B6D4', type: 'expense' },
  { id: '89139031-64d1-4475-87d3-6058e578a104', name: 'Entertainment', icon: Gamepad2, color: '#F43F5E', type: 'expense' },
  { id: '89139031-64d1-4475-87d3-6058e578a105', name: 'Shopping', icon: ShoppingBag, color: '#F43F5E', type: 'expense' },
  { id: '89139031-64d1-4475-87d3-6058e578a106', name: 'Education', icon: BookOpen, color: '#3B82F6', type: 'expense' },
  { id: '89139031-64d1-4475-87d3-6058e578a107', name: 'Coffee & Snacks', icon: Coffee, color: '#A855F7', type: 'expense' },
  { id: '89139031-64d1-4475-87d3-6058e578a108', name: 'Subscriptions', icon: Music, color: '#F43F5E', type: 'expense' },
  { id: '89139031-64d1-4475-87d3-6058e578a109', name: 'Utilities', icon: Smartphone, color: '#06B6D4', type: 'expense' },
  { id: '89139031-64d1-4475-87d3-6058e578a110', name: 'Health', icon: HeartPulse, color: '#10B981', type: 'expense' },
  { id: '89139031-64d1-4475-87d3-6058e578a111', name: 'Other', icon: HelpCircle, color: '#94A3B8', type: 'expense' },

  // Income
  { id: '89139031-64d1-4475-87d3-6058e578a201', name: 'Salary', icon: Briefcase, color: '#10B981', type: 'income' },
  { id: '89139031-64d1-4475-87d3-6058e578a202', name: 'Freelance', icon: TrendingUp, color: '#10B981', type: 'income' },
  { id: '89139031-64d1-4475-87d3-6058e578a203', name: 'Gift', icon: Gift, color: '#F43F5E', type: 'income' },
  { id: '89139031-64d1-4475-87d3-6058e578a204', name: 'Pocket Money', icon: Banknote, color: '#3B82F6', type: 'income' },
  { id: '89139031-64d1-4475-87d3-6058e578a205', name: 'Other Income', icon: Zap, color: '#94A3B8', type: 'income' },
];

export const getCategoryIcon = (name: string) => {
  const cat = CATEGORIES.find(c => c.name.toLowerCase() === name.toLowerCase()) || 
              CATEGORIES.find(c => c.id.toLowerCase() === name.toLowerCase());
  return cat ? cat.icon : HelpCircle;
};
