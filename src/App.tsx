import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  History, 
  PieChart as PieChartIcon, 
  Settings, 
  ChevronRight,
  X,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Calendar,
  Tag,
  Globe,
  User as UserIcon,
  Mail,
  Phone,
  Camera,
  Edit2,
  Trash2,
  Target
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { format, subDays, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO, isSameDay, isSameWeek, isSameMonth, isSameYear, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { cn, formatCurrency } from './utils/cn';
import { Transaction, TransactionType, Category, Currency, UserProfile, Budget } from './types';
import { CATEGORIES, CURRENCIES } from './constants';
import { motion, AnimatePresence } from 'motion/react';

// --- Components ---

const Card = ({ children, className }: { children: React.ReactNode; className?: string; key?: string | number }) => (
  <div className={cn("bg-white rounded-3xl p-6 shadow-sm border border-sky-500/10", className)}>
    {children}
  </div>
);

const IconButton = ({ icon: Icon, onClick, active }: { icon: any, onClick: () => void, active?: boolean }) => (
  <button 
    onClick={onClick}
    className={cn(
      "p-2.5 rounded-xl transition-all duration-200",
      active ? "bg-sky-500 text-white shadow-lg shadow-sky-200 scale-110" : "text-zinc-400 hover:bg-sky-100/50"
    )}
  >
    <Icon size={20} />
  </button>
);

const TransactionItem = ({ 
  transaction, 
  onEdit, 
  onDelete 
}: { 
  transaction: Transaction; 
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  key?: string 
}) => {
  const category = CATEGORIES.find(c => c.id === transaction.category) || CATEGORIES[CATEGORIES.length - 1];
  const isExpense = transaction.type === 'expense';

  return (
    <div className="flex items-center justify-between p-4 hover:bg-sky-50 rounded-2xl transition-colors cursor-pointer group relative overflow-hidden">
      <div className="flex items-center gap-4">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
          style={{ backgroundColor: category.color }}
        >
          <History size={20} />
        </div>
        <div>
          <h4 className="font-semibold text-zinc-900 group-hover:text-sky-600 transition-colors capitalize">{category.name}</h4>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{format(parseISO(transaction.date), 'MMM d, yyyy')}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right group-hover:opacity-0 transition-opacity">
          <p className={cn(
            "font-bold text-lg",
            isExpense ? "text-zinc-900" : "text-emerald-600"
          )}>
            {isExpense ? '-' : '+'}{formatCurrency(transaction.amount, transaction.currency)}
          </p>
        </div>
        
        {/* Action Buttons - Visible on Hover */}
        <div className="absolute right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-sky-50 pl-4">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(transaction);
            }}
            className="p-2 bg-white text-sky-600 rounded-xl shadow-sm hover:bg-sky-100 transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(transaction.id);
            }}
            className="p-2 bg-white text-rose-600 rounded-xl shadow-sm hover:bg-rose-50 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'budget' | 'expenses' | 'history' | 'settings'>('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [baseCurrency, setBaseCurrency] = useState<Currency>(CURRENCIES[0]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('monthly');
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Yared Alebachewu',
    email: 'yareda2001@gmail.com',
    phone: '+1 234 567 890',
    avatar: 'https://picsum.photos/seed/user/200/200'
  });

  // Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [type, setType] = useState<TransactionType>('expense');

  // Profile Form State
  const [tempProfile, setTempProfile] = useState<UserProfile>(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('wealthflow_transactions');
    if (saved) {
      setTransactions(JSON.parse(saved));
    } else {
      // Mock initial data
      const mockData: Transaction[] = [
        { id: '1', amount: 45.50, category: 'food', date: subDays(new Date(), 1).toISOString(), type: 'expense', currency: 'ETB' },
        { id: '2', amount: 1200, category: 'income', date: subDays(new Date(), 5).toISOString(), type: 'income', currency: 'ETB' },
        { id: '3', amount: 15.99, category: 'entertainment', date: subDays(new Date(), 2).toISOString(), type: 'expense', currency: 'ETB' },
        { id: '4', amount: 60, category: 'transport', date: subDays(new Date(), 0).toISOString(), type: 'expense', currency: 'ETB' },
      ];
      setTransactions(mockData);
      localStorage.setItem('wealthflow_transactions', JSON.stringify(mockData));
    }

    const savedCurrency = localStorage.getItem('wealthflow_currency');
    if (savedCurrency) {
      setBaseCurrency(JSON.parse(savedCurrency));
    }

    const savedProfile = localStorage.getItem('wealthflow_profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(parsed);
      setTempProfile(parsed);
    }

    const savedBudgets = localStorage.getItem('wealthflow_budgets');
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    } else {
      // Default budgets
      const defaultBudgets: Budget[] = CATEGORIES.map(cat => ({
        categoryId: cat.id,
        amount: cat.id === 'food' ? 500 : cat.id === 'transport' ? 200 : 0
      }));
      setBudgets(defaultBudgets);
      localStorage.setItem('wealthflow_budgets', JSON.stringify(defaultBudgets));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wealthflow_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('wealthflow_budgets', JSON.stringify(budgets));
  }, [budgets]);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    if (editingTransaction) {
      const updatedTransactions = transactions.map(t => 
        t.id === editingTransaction.id 
          ? { ...t, amount: parseFloat(amount), category, type } 
          : t
      );
      setTransactions(updatedTransactions);
    } else {
      const newTransaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        amount: parseFloat(amount),
        category,
        type,
        date: new Date().toISOString(),
        currency: baseCurrency.code
      };
      setTransactions([newTransaction, ...transactions]);
    }

    setIsModalOpen(false);
    setEditingTransaction(null);
    setAmount('');
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setAmount(transaction.amount.toString());
    setCategory(transaction.category);
    setType(transaction.type);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const handleUpdateBudget = (categoryId: string, amount: number) => {
    const updatedBudgets = budgets.map(b => 
      b.categoryId === categoryId ? { ...b, amount } : b
    );
    // If category budget doesn't exist, add it
    if (!updatedBudgets.some(b => b.categoryId === categoryId)) {
      updatedBudgets.push({ categoryId, amount });
    }
    setBudgets(updatedBudgets);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(tempProfile);
    localStorage.setItem('wealthflow_profile', JSON.stringify(tempProfile));
    setIsProfileModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 2) { // 2MB limit
        alert('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfile({ ...tempProfile, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data?')) {
      setTransactions([]);
      localStorage.removeItem('wealthflow_transactions');
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const date = parseISO(t.date);
    const now = new Date();
    
    switch (timeRange) {
      case 'daily':
        return isSameDay(date, now);
      case 'weekly':
        return isSameWeek(date, now);
      case 'monthly':
        return isSameMonth(date, now);
      case 'yearly':
        return isSameYear(date, now);
      case 'custom':
        return isWithinInterval(date, { 
          start: startOfDay(parseISO(customRange.start)), 
          end: endOfDay(parseISO(customRange.end)) 
        });
      default:
        return true;
    }
  });

  const totalBalance = transactions.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  const rangeIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const rangeExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Chart Data
  const getChartData = () => {
    let days = 7;
    if (timeRange === 'daily') days = 1;
    if (timeRange === 'weekly') days = 7;
    if (timeRange === 'monthly') days = 30;
    if (timeRange === 'yearly') days = 365;
    if (timeRange === 'custom') {
      const diff = Math.ceil((parseISO(customRange.end).getTime() - parseISO(customRange.start).getTime()) / (1000 * 60 * 60 * 24));
      days = Math.max(1, diff);
    }

    // For performance and readability, we'll limit the chart to max 12 points if it's a long range
    const points = days > 31 ? 12 : days;
    
    return Array.from({ length: points }).map((_, i) => {
      const baseDate = timeRange === 'custom' ? parseISO(customRange.end) : new Date();
      const date = days > 31 
        ? subMonths(baseDate, (points - 1) - i)
        : subDays(baseDate, (points - 1) - i);
        
      const label = days <= 7 ? format(date, 'EEE') : days <= 31 ? format(date, 'MMM d') : format(date, 'MMM');
      
      const dayTransactions = transactions.filter(t => {
        const tDate = parseISO(t.date);
        if (days > 31) return isSameMonth(tDate, date);
        return isSameDay(tDate, date);
      });

      const expense = dayTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
      return { name: label, expense };
    });
  };

  const chartData = getChartData();

  const categoryData = CATEGORIES.map(cat => {
    const value = filteredTransactions
      .filter(t => t.category === cat.id && t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { name: cat.name, value, color: cat.color };
  }).filter(c => c.value > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F9FB] to-sky-50/30 text-zinc-900 font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-sky-500/5 z-30 px-6 py-4">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-sky-600">WealthFlow</h1>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Welcome, {profile.name.split(' ')[0]}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setTempProfile(profile);
                setIsProfileModalOpen(true);
              }}
              className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-lg shadow-sky-100 overflow-hidden"
            >
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-xs font-bold">{profile.name.split(' ').map(n => n[0]).join('')}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 space-y-6 mt-6">
        {/* Time Range Selector */}
        <div className="space-y-4">
          <div className="flex w-[99%] mx-auto gap-1.5">
            {['daily', 'weekly', 'monthly', 'yearly', 'custom'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap text-center",
                  timeRange === range 
                    ? "bg-sky-500 text-white shadow-md shadow-sky-100" 
                    : "bg-white text-zinc-400 border border-sky-500/5 hover:bg-sky-100/50"
                )}
              >
                {range}
              </button>
            ))}
          </div>

          {timeRange === 'custom' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-sky-500/10 shadow-sm"
            >
              <input 
                type="date" 
                value={customRange.start}
                onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                className="flex-1 bg-zinc-50 border-none rounded-xl p-2 text-xs font-bold focus:ring-1 focus:ring-sky-500"
              />
              <span className="text-zinc-400 text-xs font-bold">TO</span>
              <input 
                type="date" 
                value={customRange.end}
                onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                className="flex-1 bg-zinc-50 border-none rounded-xl p-2 text-xs font-bold focus:ring-1 focus:ring-sky-500"
              />
            </motion.div>
          )}
        </div>

        {/* Balance Card */}
        <Card className="bg-sky-600 text-white border-none relative overflow-hidden shadow-xl shadow-sky-200">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-zinc-400 text-sm font-medium mb-1">Total Balance</p>
            <h2 className="text-4xl font-bold mb-6">{formatCurrency(totalBalance, baseCurrency.code)}</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-md">
                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                  <ArrowUpRight size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Income</span>
                </div>
                <p className="text-lg font-bold">{formatCurrency(rangeIncome, baseCurrency.code)}</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-md">
                <div className="flex items-center gap-2 text-rose-400 mb-1">
                  <ArrowDownRight size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Expenses</span>
                </div>
                <p className="text-lg font-bold">{formatCurrency(rangeExpense, baseCurrency.code)}</p>
              </div>
            </div>
          </div>
        </Card>

        {activeTab === 'home' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Quick Stats Chart */}
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Spending Activity</h3>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  {timeRange === 'custom' ? 'Custom Range' : `Last ${chartData.length} ${timeRange === 'yearly' ? 'Months' : 'Days'}`}
                </span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
                      dy={10}
                    />
                    <Tooltip 
                      cursor={{ fill: '#F8FAFC' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="expense" radius={[6, 6, 6, 6]} barSize={24}>
                      {chartData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#0EA5E9' : '#E0F2FE'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Recent Transactions */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Recent Transactions</h3>
                <button 
                  onClick={() => setActiveTab('history')}
                  className="text-sm font-bold text-zinc-400 hover:text-sky-600 transition-colors"
                >
                  See All
                </button>
              </div>
              <div className="space-y-2">
                {filteredTransactions.slice(0, 5).map(t => (
                  <TransactionItem 
                    key={t.id} 
                    transaction={t} 
                    onEdit={handleEditClick}
                    onDelete={handleDeleteTransaction}
                  />
                ))}
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-8 text-zinc-400 text-sm font-medium">
                    No transactions in this period
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <h3 className="font-bold text-lg mb-6">Spending by Category</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {categoryData.map(cat => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs font-medium text-zinc-600">{cat.name}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Monthly Budgets */}
            <Card className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Monthly Budgets</h3>
                <button 
                  onClick={() => setIsBudgetModalOpen(true)}
                  className="text-xs font-bold text-sky-500 uppercase tracking-widest hover:text-sky-600"
                >
                  Edit Budgets
                </button>
              </div>
              
              <div className="space-y-6">
                {CATEGORIES.map(cat => {
                  const budget = budgets.find(b => b.categoryId === cat.id)?.amount || 0;
                  const spent = transactions
                    .filter(t => t.category === cat.id && t.type === 'expense' && isSameMonth(parseISO(t.date), new Date()))
                    .reduce((acc, curr) => acc + curr.amount, 0);
                  
                  if (budget === 0 && spent === 0) return null;

                  const percent = budget > 0 ? Math.min(100, (spent / budget) * 100) : spent > 0 ? 100 : 0;
                  const isOver = budget > 0 && spent > budget;

                  return (
                    <div key={cat.id} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}>
                            <Target size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{cat.name}</p>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                              {formatCurrency(spent)} of {formatCurrency(budget)}
                            </p>
                          </div>
                        </div>
                        <p className={cn(
                          "text-xs font-bold",
                          isOver ? "text-rose-500" : "text-zinc-400"
                        )}>
                          {Math.round(percent)}%
                        </p>
                      </div>
                      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          className={cn(
                            "h-full rounded-full",
                            isOver ? "bg-rose-500" : "bg-sky-500"
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
                {budgets.every(b => b.amount === 0) && (
                  <div className="text-center py-4">
                    <p className="text-sm text-zinc-400 font-medium mb-4">No budgets set yet</p>
                    <button 
                      onClick={() => setIsBudgetModalOpen(true)}
                      className="px-6 py-2 bg-sky-50 text-sky-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-sky-100 transition-colors"
                    >
                      Set Budgets
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'budget' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Monthly Budgets</h3>
              <button 
                onClick={() => setIsBudgetModalOpen(true)}
                className="px-4 py-2 bg-sky-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-sky-100"
              >
                Adjust
              </button>
            </div>
            
            <div className="space-y-4">
              {CATEGORIES.map(cat => {
                const budget = budgets.find(b => b.categoryId === cat.id)?.amount || 0;
                const spent = transactions
                  .filter(t => t.category === cat.id && t.type === 'expense' && isSameMonth(parseISO(t.date), new Date()))
                  .reduce((acc, curr) => acc + curr.amount, 0);
                
                const percent = budget > 0 ? Math.min(100, (spent / budget) * 100) : spent > 0 ? 100 : 0;
                const isOver = budget > 0 && spent > budget;

                return (
                  <Card key={cat.id} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: cat.color }}>
                          <Target size={20} />
                        </div>
                        <div>
                          <p className="font-bold">{cat.name}</p>
                          <p className="text-xs text-zinc-400 font-medium">Monthly Limit</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(budget)}</p>
                        <p className={cn("text-xs font-bold", isOver ? "text-rose-500" : "text-emerald-500")}>
                          {isOver ? 'Over Budget' : `${Math.round(100 - percent)}% Left`}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        <span>Spent: {formatCurrency(spent)}</span>
                        <span>{Math.round(percent)}%</span>
                      </div>
                      <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            isOver ? "bg-rose-500" : "bg-sky-500"
                          )}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'expenses' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Expense Analysis</h3>
              <div className="bg-rose-50 text-rose-600 px-3 py-1 rounded-lg text-xs font-bold">
                Total: {formatCurrency(rangeExpense)}
              </div>
            </div>

            <div className="space-y-2">
              {filteredTransactions.filter(t => t.type === 'expense').map(t => (
                <TransactionItem 
                  key={t.id} 
                  transaction={t} 
                  onEdit={handleEditClick}
                  onDelete={handleDeleteTransaction}
                />
              ))}
              {filteredTransactions.filter(t => t.type === 'expense').length === 0 && (
                <div className="text-center py-12 text-zinc-400 text-sm font-medium">
                  No expenses found for this period
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="font-bold text-lg">Transaction History</h3>
            <div className="space-y-2">
              {filteredTransactions.map(t => (
                <TransactionItem 
                  key={t.id} 
                  transaction={t} 
                  onEdit={handleEditClick}
                  onDelete={handleDeleteTransaction}
                />
              ))}
              {filteredTransactions.length === 0 && (
                <div className="text-center py-12 text-zinc-400 text-sm font-medium">
                  No transactions found for this period
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Profile Section */}
            <Card className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 overflow-hidden border border-sky-500/10">
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{profile.name}</h3>
                  <p className="text-sm text-zinc-500">{profile.email}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setTempProfile(profile);
                  setIsProfileModalOpen(true);
                }}
                className="p-3 bg-sky-600 text-white rounded-2xl shadow-md hover:bg-sky-700 transition-colors"
              >
                <Settings size={20} />
              </button>
            </Card>

            <div className="text-center text-zinc-400 text-xs font-medium">
              WealthFlow v1.0.0
            </div>
          </motion.div>
        )}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-sky-50/90 backdrop-blur-xl border-t border-sky-500/10 px-2 pt-4 pb-8 z-40">
        <div className="max-w-lg mx-auto flex justify-around items-center relative">
          <IconButton icon={Wallet} onClick={() => setActiveTab('home')} active={activeTab === 'home'} />
          <IconButton icon={PieChartIcon} onClick={() => setActiveTab('stats')} active={activeTab === 'stats'} />
          <IconButton icon={Target} onClick={() => setActiveTab('budget')} active={activeTab === 'budget'} />
          
          {/* Add Button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-14 h-14 bg-sky-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-sky-200 -mt-10 border-4 border-sky-50 hover:scale-110 transition-transform active:scale-95 shrink-0"
          >
            <Plus size={28} />
          </button>

          <IconButton icon={ArrowDownRight} onClick={() => setActiveTab('expenses')} active={activeTab === 'expenses'} />
          <IconButton icon={History} onClick={() => setActiveTab('history')} active={activeTab === 'history'} />
          <IconButton icon={Settings} onClick={() => setActiveTab('settings')} active={activeTab === 'settings'} />
        </div>
      </nav>

      {/* Budget Modal */}
      <AnimatePresence>
        {isBudgetModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBudgetModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 z-50 max-w-lg mx-auto shadow-2xl overflow-y-auto max-h-[85vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Set Monthly Budgets</h2>
                <button 
                  onClick={() => setIsBudgetModalOpen(false)} 
                  className="p-2 bg-zinc-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 pb-6">
                {CATEGORIES.map(cat => {
                  const budget = budgets.find(b => b.categoryId === cat.id)?.amount || 0;
                  return (
                    <div key={cat.id} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}>
                          <Target size={16} />
                        </div>
                        <p className="font-bold text-sm">{cat.name}</p>
                      </div>
                      <div className="relative w-28">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-[10px]">Br</div>
                        <input 
                          type="number"
                          value={budget || ''}
                          onChange={(e) => handleUpdateBudget(cat.id, parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full bg-zinc-50 border-none rounded-xl py-2 pl-8 pr-3 text-right font-bold text-sm focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => setIsBudgetModalOpen(false)}
                className="w-full bg-sky-500 text-white py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-sky-100 hover:bg-sky-600 transition-all active:scale-95"
              >
                Done
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] p-8 z-50 max-w-lg mx-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{editingTransaction ? 'Edit' : 'Add'} Transaction</h2>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTransaction(null);
                    setAmount('');
                  }} 
                  className="p-2 bg-zinc-100 rounded-full text-zinc-400 hover:bg-zinc-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-6">
                <div className="flex gap-2 p-1 bg-zinc-100 rounded-2xl">
                  <button 
                    type="button"
                    onClick={() => setType('expense')}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
                      type === 'expense' ? "bg-white text-sky-600 shadow-sm" : "text-zinc-500"
                    )}
                  >
                    Expense
                  </button>
                  <button 
                    type="button"
                    onClick={() => setType('income')}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
                      type === 'income' ? "bg-white text-sky-600 shadow-sm" : "text-zinc-500"
                    )}
                  >
                    Income
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">
                      Br
                    </div>
                    <input 
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-zinc-50 border-none rounded-2xl py-4 pl-12 pr-4 text-2xl font-bold focus:ring-2 focus:ring-sky-500 transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                        <Tag size={20} />
                      </div>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-zinc-50 border-none rounded-2xl py-4 pl-12 pr-4 font-medium focus:ring-2 focus:ring-sky-500 appearance-none"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                        <Calendar size={20} />
                      </div>
                      <input 
                        type="text"
                        value={format(new Date(), 'MMM d, yyyy')}
                        disabled
                        className="w-full bg-zinc-50 border-none rounded-2xl py-4 pl-12 pr-4 font-medium text-zinc-400"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-sky-500 text-white py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-sky-100 hover:bg-sky-600 transition-all active:scale-95"
                >
                  {editingTransaction ? 'Update Transaction' : 'Save Transaction'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 z-50 max-w-lg mx-auto shadow-2xl overflow-y-auto max-h-[85vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Edit Profile</h2>
                <button onClick={() => setIsProfileModalOpen(false)} className="p-2 bg-zinc-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="flex flex-col items-center gap-3 mb-2">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-2xl bg-zinc-100 overflow-hidden border-2 border-zinc-200">
                      <img src={tempProfile.avatar} alt="Avatar Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 p-2 bg-sky-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                    >
                      <Camera size={16} />
                    </button>
                  </div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Profile Picture</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                      <UserIcon size={20} />
                    </div>
                    <input 
                      type="text"
                      placeholder="Full Name"
                      value={tempProfile.name}
                      onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                      className="w-full bg-zinc-50 border-none rounded-2xl py-4 pl-12 pr-4 font-medium focus:ring-2 focus:ring-sky-500 transition-all"
                      required
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                      <Mail size={20} />
                    </div>
                    <input 
                      type="email"
                      placeholder="Email Address"
                      value={tempProfile.email}
                      onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                      className="w-full bg-zinc-50 border-none rounded-2xl py-4 pl-12 pr-4 font-medium focus:ring-2 focus:ring-sky-500 transition-all"
                      required
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                      <Phone size={20} />
                    </div>
                    <input 
                      type="tel"
                      placeholder="Phone Number"
                      value={tempProfile.phone}
                      onChange={(e) => setTempProfile({ ...tempProfile, phone: e.target.value })}
                      className="w-full bg-zinc-50 border-none rounded-2xl py-4 pl-12 pr-4 font-medium focus:ring-2 focus:ring-sky-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-sky-500 text-white py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-sky-100 hover:bg-sky-600 transition-all active:scale-95"
                >
                  Save Profile
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
