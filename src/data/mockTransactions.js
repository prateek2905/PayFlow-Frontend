const TAG_ICONS = {
  food: '🍕', rent: '🏠', transport: '🚇', health: '💊',
  entertainment: '🎬', shopping: '🛍️', utilities: '⚡', income: '💰',
};

export function mapApiTransaction(tx) {
    const tagName = tx.tag?.name?.toLowerCase() || 'other';
    return {
        id: tx._id,
        name: tx.name,
        tag: tx.tag?.name || 'other',
        icon: TAG_ICONS[tagName] || '💳',
        amount: tx.type === 'debit' ? -tx.value : tx.value,
        dateLabel: new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        isoDate: tx.date,
    };
}

export const TAG_STYLES = {
  food:      { text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', bar: 'bg-emerald-500' },
  rent:      { text: 'text-stone-600 dark:text-slate-300',    bg: 'bg-stone-100 dark:bg-slate-700/50',    bar: 'bg-stone-600' },
  transport: { text: 'text-amber-700 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/30',     bar: 'bg-amber-500' },
  health:    { text: 'text-rose-700 dark:text-rose-400',     bg: 'bg-rose-50 dark:bg-rose-900/30',       bar: 'bg-rose-500' },
  income:    { text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', bar: 'bg-emerald-500' },
  other:     { text: 'text-stone-500 dark:text-slate-400',   bg: 'bg-stone-100 dark:bg-slate-700/50',    bar: 'bg-stone-400' },
};

export const mockTransactions = [
  { id: 1,  name: 'Zomato order',         tag: 'food',      icon: '🍕', amount: -480,   dateLabel: 'May 12', isoDate: '2025-05-12' },
  { id: 2,  name: 'Metro card recharge',  tag: 'transport', icon: '🚇', amount: -500,   dateLabel: 'May 12', isoDate: '2025-05-12' },
  { id: 3,  name: 'Apollo pharmacy',      tag: 'health',    icon: '💊', amount: -850,   dateLabel: 'May 11', isoDate: '2025-05-11' },
  { id: 4,  name: 'Swiggy Instamart',     tag: 'food',      icon: '🛒', amount: -320,   dateLabel: 'May 10', isoDate: '2025-05-10' },
  { id: 5,  name: 'Ola cab',              tag: 'transport', icon: '🚖', amount: -220,   dateLabel: 'May 10', isoDate: '2025-05-10' },
  { id: 6,  name: 'Salary credit',        tag: 'income',    icon: '💰', amount: 85000,  dateLabel: 'May 1',  isoDate: '2025-05-01' },
  { id: 7,  name: 'Monthly rent',         tag: 'rent',      icon: '🏠', amount: -12000, dateLabel: 'May 1',  isoDate: '2025-05-01' },
  { id: 8,  name: 'Dominos pizza',        tag: 'food',      icon: '🍕', amount: -680,   dateLabel: 'Apr 30', isoDate: '2025-04-30' },
  { id: 9,  name: 'Rapido bike',          tag: 'transport', icon: '🏍️', amount: -60,    dateLabel: 'Apr 29', isoDate: '2025-04-29' },
  { id: 10, name: 'Gym membership',       tag: 'health',    icon: '🏋️', amount: -2000,  dateLabel: 'Apr 28', isoDate: '2025-04-28' },
];

export const BUDGETS = [
  { tag: 'Rent',      spent: 12000, total: 12000, pct: 100, bar: 'bg-stone-600',  text: 'text-stone-600 dark:text-slate-300',   dot: 'bg-stone-600' },
  { tag: 'Food',      spent: 6540,  total: 10000, pct: 65,  bar: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  { tag: 'Transport', spent: 4910,  total: 5000,  pct: 98,  bar: 'bg-amber-500',  text: 'text-amber-700 dark:text-amber-400',   dot: 'bg-amber-500' },
  { tag: 'Health',    spent: 3200,  total: 8000,  pct: 40,  bar: 'bg-rose-500',   text: 'text-rose-700 dark:text-rose-400',     dot: 'bg-rose-500' },
];

export const BAR_DATA = [18, 5, 32, 8, 15, 24, 11, 7, 28, 14, 9, 22, 6, 19];
