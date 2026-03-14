import { StrictMode, startTransition, useDeferredValue, useEffect, useId, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'

type ThemeMode = 'obsidian' | 'linen'
type TabId = 'overview' | 'accounts' | 'payments' | 'cards' | 'vault' | 'insights' | 'support'
type AccountKind = 'checking' | 'savings' | 'travel' | 'business'
type TransactionStatus = 'booked' | 'pending' | 'scheduled'
type TransactionDirection = 'credit' | 'debit'
type NoticeTone = 'info' | 'success' | 'warning' | 'critical'

type Account = {
  id: string
  name: string
  kind: AccountKind
  balance: number
  available: number
  currency: string
  iban: string
  rate: number
  color: string
  accent: string
  analytics: number[]
}

type Transaction = {
  id: string
  accountId: string
  title: string
  merchant: string
  amount: number
  direction: TransactionDirection
  category: string
  status: TransactionStatus
  date: string
  note: string
  tag: string
}

type Card = {
  id: string
  accountId: string
  holder: string
  label: string
  network: string
  last4: string
  limit: number
  spent: number
  frozen: boolean
  color: string
  metal: string
}

type Bill = {
  id: string
  name: string
  amount: number
  due: string
  accountId: string
  autopay: boolean
  status: 'due' | 'paid' | 'snoozed'
}

type Goal = {
  id: string
  name: string
  target: number
  current: number
  pace: number
  paused: boolean
  tint: string
}

type Notice = {
  id: string
  title: string
  detail: string
  tone: NoticeTone
  createdAt: string
  resolved: boolean
}

type Message = {
  id: string
  from: 'bank' | 'user'
  text: string
  createdAt: string
}

type BranchSlot = {
  id: string
  branch: string
  time: string
  booked: boolean
}

type MarketPulse = {
  id: string
  label: string
  value: string
  delta: number
}

const storageKey = 'northstar-reserve-state-v1'

const payees = [
  'North Grid Energy',
  'City Transit Card',
  'Luna Wireless',
  'Harbor Rent',
  'Orbital Insurance',
  'Cloud Office',
]

const tabs: { id: TabId; label: string; eyebrow: string }[] = [
  { id: 'overview', label: 'Command', eyebrow: 'Daily banking' },
  { id: 'accounts', label: 'Accounts', eyebrow: 'Balances' },
  { id: 'payments', label: 'Payments', eyebrow: 'Money movement' },
  { id: 'cards', label: 'Cards', eyebrow: 'Controls' },
  { id: 'vault', label: 'Vault', eyebrow: 'Goals' },
  { id: 'insights', label: 'Insights', eyebrow: 'Analysis' },
  { id: 'support', label: 'Support', eyebrow: 'Service desk' },
]

const accountSeed: Account[] = [
  {
    id: 'acc-main',
    name: 'Reserve Checking',
    kind: 'checking',
    balance: 12840.55,
    available: 12320.12,
    currency: 'USD',
    iban: 'US40 NSTR 0001 7788 2200 10',
    rate: 0.4,
    color: '#0f2a24',
    accent: '#9fd7b5',
    analytics: [42, 55, 48, 64, 70, 58, 76, 62, 71, 69, 81, 88],
  },
  {
    id: 'acc-save',
    name: 'Summit Savings',
    kind: 'savings',
    balance: 38120.88,
    available: 38120.88,
    currency: 'USD',
    iban: 'US40 NSTR 0001 7788 2200 11',
    rate: 4.1,
    color: '#2d1b22',
    accent: '#f2c6c2',
    analytics: [18, 20, 24, 28, 30, 36, 40, 44, 47, 52, 58, 63],
  },
  {
    id: 'acc-travel',
    name: 'Atlas Travel Wallet',
    kind: 'travel',
    balance: 5620.42,
    available: 5499.32,
    currency: 'EUR',
    iban: 'DE10 NSTR 8890 3300 7821 44',
    rate: 1.9,
    color: '#1a2238',
    accent: '#b5d2ff',
    analytics: [30, 34, 41, 39, 46, 48, 43, 50, 55, 61, 59, 64],
  },
  {
    id: 'acc-business',
    name: 'Beacon Business',
    kind: 'business',
    balance: 92410.77,
    available: 90110.22,
    currency: 'USD',
    iban: 'US40 NSTR 0001 7788 2200 12',
    rate: 2.3,
    color: '#332114',
    accent: '#f3d4a3',
    analytics: [66, 68, 72, 74, 79, 81, 85, 88, 86, 91, 95, 98],
  },
]

const cardSeed: Card[] = [
  { id: 'card-1', accountId: 'acc-main', holder: 'Niki Reserve', label: 'Carbon Debit', network: 'Visa Infinite', last4: '1048', limit: 12000, spent: 2840, frozen: false, color: '#0d1318', metal: '#9fd7b5' },
  { id: 'card-2', accountId: 'acc-save', holder: 'Niki Reserve', label: 'Platinum Flex', network: 'Mastercard World', last4: '5521', limit: 18000, spent: 6730, frozen: false, color: '#24161a', metal: '#f2c6c2' },
  { id: 'card-3', accountId: 'acc-business', holder: 'Northstar Studio', label: 'Business Charge', network: 'Visa Business', last4: '8820', limit: 42000, spent: 19110, frozen: true, color: '#1c1910', metal: '#f3d4a3' },
]

const billSeed: Bill[] = [
  { id: 'bill-1', name: 'Harbor Rent', amount: 1800, due: '2026-03-18', accountId: 'acc-main', autopay: false, status: 'due' },
  { id: 'bill-2', name: 'North Grid Energy', amount: 164.18, due: '2026-03-17', accountId: 'acc-main', autopay: true, status: 'due' },
  { id: 'bill-3', name: 'Luna Wireless', amount: 91.74, due: '2026-03-21', accountId: 'acc-main', autopay: false, status: 'due' },
  { id: 'bill-4', name: 'Orbital Insurance', amount: 242.5, due: '2026-03-29', accountId: 'acc-save', autopay: true, status: 'due' },
]

const goalSeed: Goal[] = [
  { id: 'goal-1', name: 'Kyoto Autumn Trip', target: 7200, current: 3140, pace: 220, paused: false, tint: '#9fd7b5' },
  { id: 'goal-2', name: 'Emergency Cushion', target: 15000, current: 9460, pace: 400, paused: false, tint: '#f2c6c2' },
  { id: 'goal-3', name: 'Studio Upgrade Fund', target: 24000, current: 12120, pace: 750, paused: true, tint: '#f3d4a3' },
]

const noticeSeed: Notice[] = [
  { id: 'note-1', title: 'Travel wallet used in Lisbon', detail: 'A new device approved a EUR charge 12 minutes ago.', tone: 'info', createdAt: '09:14', resolved: false },
  { id: 'note-2', title: 'Business card remains frozen', detail: 'Card ending 8820 is frozen until you unlock it.', tone: 'warning', createdAt: '08:02', resolved: false },
  { id: 'note-3', title: 'Savings interest posted', detail: 'A new interest accrual of $126.44 has been added.', tone: 'success', createdAt: '07:45', resolved: false },
  { id: 'note-4', title: 'Large debit needs review', detail: 'One scheduled vendor payment exceeds your normal range.', tone: 'critical', createdAt: '06:21', resolved: false },
]

const branchSeed: BranchSlot[] = [
  { id: 'slot-1', branch: 'North Pier Lounge', time: '2026-03-15 10:00', booked: false },
  { id: 'slot-2', branch: 'North Pier Lounge', time: '2026-03-15 13:30', booked: false },
  { id: 'slot-3', branch: 'Central Atrium Desk', time: '2026-03-16 11:15', booked: false },
  { id: 'slot-4', branch: 'Central Atrium Desk', time: '2026-03-16 16:45', booked: false },
]

const supportSeed: Message[] = [
  { id: 'msg-1', from: 'bank', text: 'Northstar concierge here. I can help with transfers, cards, and branch appointments.', createdAt: '09:00' },
  { id: 'msg-2', from: 'bank', text: 'Use the quick replies below or write your own message.', createdAt: '09:01' },
]

const cannedSupportReplies = [
  'Review my latest international card activity.',
  'I need a signed balance confirmation.',
  'Please prepare a branch meeting for loan discussion.',
  'Explain the difference between frozen and replaced cards.',
]

const quickTransferPresets = [
  { label: 'Move to savings', from: 'acc-main', to: 'acc-save', amount: 250, memo: 'Weekly reserve top-up' },
  { label: 'Travel wallet reload', from: 'acc-main', to: 'acc-travel', amount: 180, memo: 'Trip buffer' },
  { label: 'Business sweep', from: 'acc-business', to: 'acc-save', amount: 1200, memo: 'Quarterly cash parking' },
]

const marketSeed: MarketPulse[] = [
  { id: 'pulse-1', label: 'USD / EUR', value: '0.92', delta: 0.3 },
  { id: 'pulse-2', label: 'Prime rate', value: '6.75%', delta: -0.1 },
  { id: 'pulse-3', label: 'Treasury 10Y', value: '4.08%', delta: 0.08 },
  { id: 'pulse-4', label: 'Reward multiplier', value: '2.0x', delta: 0.0 },
]

const faqItems = [
  { q: 'How do I freeze a card?', a: 'Open the Cards tab and use Freeze card. You can unlock it later without replacing the plastic.' },
  { q: 'Can I move money between currencies?', a: 'Yes. The FX panel converts the amount and posts a simulated transfer into your selected destination account.' },
  { q: 'What happens when I snooze a bill?', a: 'The due date shifts by three days and the bill gets a snoozed status until you pay it.' },
  { q: 'How is loan estimate calculated?', a: 'This demo uses a simple amortization formula with the rate and term you pick.' },
]

const transactionSeed: Transaction[] = [
  {
    id: 'txn-1',
    accountId: 'acc-save',
    title: 'Atlas Energy 1',
    merchant: 'Cafe 2',
    amount: 31.35,
    direction: 'debit',
    category: 'Food',
    status: 'pending',
    date: '2026-03-01',
    note: 'Client settlement 2',
    tag: 'food-2',
  },
  {
    id: 'txn-2',
    accountId: 'acc-travel',
    title: 'Beacon Pharmacy 2',
    merchant: 'Atelier 3',
    amount: 44.7,
    direction: 'credit',
    category: 'Salary',
    status: 'scheduled',
    date: '2026-03-02',
    note: 'Daily spend 3',
    tag: 'salary-3',
  },
  {
    id: 'txn-3',
    accountId: 'acc-business',
    title: 'Summit Terminal 3',
    merchant: 'Energy 4',
    amount: 57,
    direction: 'debit',
    category: 'Bills',
    status: 'booked',
    date: '2026-03-03',
    note: 'Automated debit 4',
    tag: 'bills-4',
  },
  {
    id: 'txn-4',
    accountId: 'acc-main',
    title: 'Reserve Market 4',
    merchant: 'Grocer 5',
    amount: 70.35,
    direction: 'credit',
    category: 'Investing',
    status: 'pending',
    date: '2026-03-04',
    note: 'Foreign exchange hold 5',
    tag: 'investing-5',
  },
  {
    id: 'txn-5',
    accountId: 'acc-save',
    title: 'Signal Energy 5',
    merchant: 'Studio 6',
    amount: 83.7,
    direction: 'debit',
    category: 'Shopping',
    status: 'scheduled',
    date: '2026-03-05',
    note: 'Reserve transfer 1',
    tag: 'shopping-6',
  },
  {
    id: 'txn-6',
    accountId: 'acc-travel',
    title: 'Vault Pharmacy 6',
    merchant: 'Pharmacy 7',
    amount: 96,
    direction: 'credit',
    category: 'Health',
    status: 'booked',
    date: '2026-03-06',
    note: 'Cashback settlement 2',
    tag: 'health-1',
  },
  {
    id: 'txn-7',
    accountId: 'acc-business',
    title: 'Ledger Terminal 7',
    merchant: 'Harbor 8',
    amount: 111.35,
    direction: 'debit',
    category: 'Entertainment',
    status: 'pending',
    date: '2026-03-07',
    note: 'Subscription renewal 3',
    tag: 'entertainment-2',
  },
  {
    id: 'txn-8',
    accountId: 'acc-main',
    title: 'Delta Market 8',
    merchant: 'Cloud 9',
    amount: 124.7,
    direction: 'credit',
    category: 'Travel',
    status: 'scheduled',
    date: '2026-03-08',
    note: 'Priority route 4',
    tag: 'travel-3',
  },
  {
    id: 'txn-9',
    accountId: 'acc-save',
    title: 'Horizon Energy 9',
    merchant: 'Terminal 1',
    amount: 137,
    direction: 'debit',
    category: 'Food',
    status: 'booked',
    date: '2026-03-09',
    note: 'Client settlement 5',
    tag: 'food-4',
  },
  {
    id: 'txn-10',
    accountId: 'acc-travel',
    title: 'Aurora Pharmacy 10',
    merchant: 'Transit 2',
    amount: 150.35,
    direction: 'credit',
    category: 'Salary',
    status: 'pending',
    date: '2026-03-10',
    note: 'Daily spend 1',
    tag: 'salary-5',
  },
  {
    id: 'txn-11',
    accountId: 'acc-business',
    title: 'Atlas Terminal 11',
    merchant: 'Cinema 3',
    amount: 163.7,
    direction: 'debit',
    category: 'Bills',
    status: 'scheduled',
    date: '2026-03-11',
    note: 'Automated debit 2',
    tag: 'bills-6',
  },
  {
    id: 'txn-12',
    accountId: 'acc-main',
    title: 'Beacon Market 12',
    merchant: 'Market 4',
    amount: 176,
    direction: 'credit',
    category: 'Investing',
    status: 'booked',
    date: '2026-03-12',
    note: 'Foreign exchange hold 3',
    tag: 'investing-1',
  },
  {
    id: 'txn-13',
    accountId: 'acc-save',
    title: 'Summit Energy 13',
    merchant: 'Cafe 5',
    amount: 189.35,
    direction: 'debit',
    category: 'Shopping',
    status: 'pending',
    date: '2026-03-13',
    note: 'Reserve transfer 4',
    tag: 'shopping-2',
  },
  {
    id: 'txn-14',
    accountId: 'acc-travel',
    title: 'Reserve Pharmacy 14',
    merchant: 'Atelier 6',
    amount: 204.7,
    direction: 'credit',
    category: 'Health',
    status: 'scheduled',
    date: '2026-03-14',
    note: 'Cashback settlement 5',
    tag: 'health-3',
  },
  {
    id: 'txn-15',
    accountId: 'acc-business',
    title: 'Signal Terminal 15',
    merchant: 'Energy 7',
    amount: 217,
    direction: 'debit',
    category: 'Entertainment',
    status: 'booked',
    date: '2026-03-15',
    note: 'Subscription renewal 1',
    tag: 'entertainment-4',
  },
  {
    id: 'txn-16',
    accountId: 'acc-main',
    title: 'Vault Market 16',
    merchant: 'Grocer 8',
    amount: 230.35,
    direction: 'credit',
    category: 'Travel',
    status: 'pending',
    date: '2026-03-16',
    note: 'Priority route 2',
    tag: 'travel-5',
  },
  {
    id: 'txn-17',
    accountId: 'acc-save',
    title: 'Ledger Energy 17',
    merchant: 'Studio 9',
    amount: 22.7,
    direction: 'debit',
    category: 'Food',
    status: 'scheduled',
    date: '2026-03-17',
    note: 'Client settlement 3',
    tag: 'food-6',
  },
  {
    id: 'txn-18',
    accountId: 'acc-travel',
    title: 'Delta Pharmacy 18',
    merchant: 'Pharmacy 1',
    amount: 35,
    direction: 'credit',
    category: 'Salary',
    status: 'booked',
    date: '2026-03-18',
    note: 'Daily spend 4',
    tag: 'salary-1',
  },
  {
    id: 'txn-19',
    accountId: 'acc-business',
    title: 'Horizon Terminal 19',
    merchant: 'Harbor 2',
    amount: 48.35,
    direction: 'debit',
    category: 'Bills',
    status: 'pending',
    date: '2026-03-19',
    note: 'Automated debit 5',
    tag: 'bills-2',
  },
  {
    id: 'txn-20',
    accountId: 'acc-main',
    title: 'Aurora Market 20',
    merchant: 'Cloud 3',
    amount: 61.7,
    direction: 'credit',
    category: 'Investing',
    status: 'scheduled',
    date: '2026-03-20',
    note: 'Foreign exchange hold 1',
    tag: 'investing-3',
  },
  {
    id: 'txn-21',
    accountId: 'acc-save',
    title: 'Atlas Energy 21',
    merchant: 'Terminal 4',
    amount: 76,
    direction: 'debit',
    category: 'Shopping',
    status: 'booked',
    date: '2026-03-21',
    note: 'Reserve transfer 2',
    tag: 'shopping-4',
  },
  {
    id: 'txn-22',
    accountId: 'acc-travel',
    title: 'Beacon Pharmacy 22',
    merchant: 'Transit 5',
    amount: 89.35,
    direction: 'credit',
    category: 'Health',
    status: 'pending',
    date: '2026-03-22',
    note: 'Cashback settlement 3',
    tag: 'health-5',
  },
  {
    id: 'txn-23',
    accountId: 'acc-business',
    title: 'Summit Terminal 23',
    merchant: 'Cinema 6',
    amount: 102.7,
    direction: 'debit',
    category: 'Entertainment',
    status: 'scheduled',
    date: '2026-03-23',
    note: 'Subscription renewal 4',
    tag: 'entertainment-6',
  },
  {
    id: 'txn-24',
    accountId: 'acc-main',
    title: 'Reserve Market 24',
    merchant: 'Market 7',
    amount: 115,
    direction: 'credit',
    category: 'Travel',
    status: 'booked',
    date: '2026-03-24',
    note: 'Priority route 5',
    tag: 'travel-1',
  },
  {
    id: 'txn-25',
    accountId: 'acc-save',
    title: 'Signal Energy 25',
    merchant: 'Cafe 8',
    amount: 128.35,
    direction: 'debit',
    category: 'Food',
    status: 'pending',
    date: '2026-03-25',
    note: 'Client settlement 1',
    tag: 'food-2',
  },
  {
    id: 'txn-26',
    accountId: 'acc-travel',
    title: 'Vault Pharmacy 26',
    merchant: 'Atelier 9',
    amount: 141.7,
    direction: 'credit',
    category: 'Salary',
    status: 'scheduled',
    date: '2026-03-26',
    note: 'Daily spend 2',
    tag: 'salary-3',
  },
  {
    id: 'txn-27',
    accountId: 'acc-business',
    title: 'Ledger Terminal 27',
    merchant: 'Energy 1',
    amount: 154,
    direction: 'debit',
    category: 'Bills',
    status: 'booked',
    date: '2026-03-27',
    note: 'Automated debit 3',
    tag: 'bills-4',
  },
  {
    id: 'txn-28',
    accountId: 'acc-main',
    title: 'Delta Market 28',
    merchant: 'Grocer 2',
    amount: 169.35,
    direction: 'credit',
    category: 'Investing',
    status: 'pending',
    date: '2026-03-28',
    note: 'Foreign exchange hold 4',
    tag: 'investing-5',
  },
  {
    id: 'txn-29',
    accountId: 'acc-save',
    title: 'Horizon Energy 29',
    merchant: 'Studio 3',
    amount: 182.7,
    direction: 'debit',
    category: 'Shopping',
    status: 'scheduled',
    date: '2026-03-01',
    note: 'Reserve transfer 5',
    tag: 'shopping-6',
  },
  {
    id: 'txn-30',
    accountId: 'acc-travel',
    title: 'Aurora Pharmacy 30',
    merchant: 'Pharmacy 4',
    amount: 195,
    direction: 'credit',
    category: 'Health',
    status: 'booked',
    date: '2026-03-02',
    note: 'Cashback settlement 1',
    tag: 'health-1',
  },
  {
    id: 'txn-31',
    accountId: 'acc-business',
    title: 'Atlas Terminal 31',
    merchant: 'Harbor 5',
    amount: 208.35,
    direction: 'debit',
    category: 'Entertainment',
    status: 'pending',
    date: '2026-03-03',
    note: 'Subscription renewal 2',
    tag: 'entertainment-2',
  },
  {
    id: 'txn-32',
    accountId: 'acc-main',
    title: 'Beacon Market 32',
    merchant: 'Cloud 6',
    amount: 221.7,
    direction: 'credit',
    category: 'Travel',
    status: 'scheduled',
    date: '2026-03-04',
    note: 'Priority route 3',
    tag: 'travel-3',
  },
  {
    id: 'txn-33',
    accountId: 'acc-save',
    title: 'Summit Energy 33',
    merchant: 'Terminal 7',
    amount: 234,
    direction: 'debit',
    category: 'Food',
    status: 'booked',
    date: '2026-03-05',
    note: 'Client settlement 4',
    tag: 'food-4',
  },
  {
    id: 'txn-34',
    accountId: 'acc-travel',
    title: 'Reserve Pharmacy 34',
    merchant: 'Transit 8',
    amount: 26.35,
    direction: 'credit',
    category: 'Salary',
    status: 'pending',
    date: '2026-03-06',
    note: 'Daily spend 5',
    tag: 'salary-5',
  },
  {
    id: 'txn-35',
    accountId: 'acc-business',
    title: 'Signal Terminal 35',
    merchant: 'Cinema 9',
    amount: 41.7,
    direction: 'debit',
    category: 'Bills',
    status: 'scheduled',
    date: '2026-03-07',
    note: 'Automated debit 1',
    tag: 'bills-6',
  },
  {
    id: 'txn-36',
    accountId: 'acc-main',
    title: 'Vault Market 36',
    merchant: 'Market 1',
    amount: 54,
    direction: 'credit',
    category: 'Investing',
    status: 'booked',
    date: '2026-03-08',
    note: 'Foreign exchange hold 2',
    tag: 'investing-1',
  },
  {
    id: 'txn-37',
    accountId: 'acc-save',
    title: 'Ledger Energy 37',
    merchant: 'Cafe 2',
    amount: 67.35,
    direction: 'debit',
    category: 'Shopping',
    status: 'pending',
    date: '2026-03-09',
    note: 'Reserve transfer 3',
    tag: 'shopping-2',
  },
  {
    id: 'txn-38',
    accountId: 'acc-travel',
    title: 'Delta Pharmacy 38',
    merchant: 'Atelier 3',
    amount: 80.7,
    direction: 'credit',
    category: 'Health',
    status: 'scheduled',
    date: '2026-03-10',
    note: 'Cashback settlement 4',
    tag: 'health-3',
  },
  {
    id: 'txn-39',
    accountId: 'acc-business',
    title: 'Horizon Terminal 39',
    merchant: 'Energy 4',
    amount: 93,
    direction: 'debit',
    category: 'Entertainment',
    status: 'booked',
    date: '2026-03-11',
    note: 'Subscription renewal 5',
    tag: 'entertainment-4',
  },
  {
    id: 'txn-40',
    accountId: 'acc-main',
    title: 'Aurora Market 40',
    merchant: 'Grocer 5',
    amount: 106.35,
    direction: 'credit',
    category: 'Travel',
    status: 'pending',
    date: '2026-03-12',
    note: 'Priority route 1',
    tag: 'travel-5',
  },
  {
    id: 'txn-41',
    accountId: 'acc-save',
    title: 'Atlas Energy 41',
    merchant: 'Studio 6',
    amount: 119.7,
    direction: 'debit',
    category: 'Food',
    status: 'scheduled',
    date: '2026-03-13',
    note: 'Client settlement 2',
    tag: 'food-6',
  },
  {
    id: 'txn-42',
    accountId: 'acc-travel',
    title: 'Beacon Pharmacy 42',
    merchant: 'Pharmacy 7',
    amount: 134,
    direction: 'credit',
    category: 'Salary',
    status: 'booked',
    date: '2026-03-14',
    note: 'Daily spend 3',
    tag: 'salary-1',
  },
  {
    id: 'txn-43',
    accountId: 'acc-business',
    title: 'Summit Terminal 43',
    merchant: 'Harbor 8',
    amount: 147.35,
    direction: 'debit',
    category: 'Bills',
    status: 'pending',
    date: '2026-03-15',
    note: 'Automated debit 4',
    tag: 'bills-2',
  },
  {
    id: 'txn-44',
    accountId: 'acc-main',
    title: 'Reserve Market 44',
    merchant: 'Cloud 9',
    amount: 160.7,
    direction: 'credit',
    category: 'Investing',
    status: 'scheduled',
    date: '2026-03-16',
    note: 'Foreign exchange hold 5',
    tag: 'investing-3',
  },
  {
    id: 'txn-45',
    accountId: 'acc-save',
    title: 'Signal Energy 45',
    merchant: 'Terminal 1',
    amount: 173,
    direction: 'debit',
    category: 'Shopping',
    status: 'booked',
    date: '2026-03-17',
    note: 'Reserve transfer 1',
    tag: 'shopping-4',
  },
  {
    id: 'txn-46',
    accountId: 'acc-travel',
    title: 'Vault Pharmacy 46',
    merchant: 'Transit 2',
    amount: 186.35,
    direction: 'credit',
    category: 'Health',
    status: 'pending',
    date: '2026-03-18',
    note: 'Cashback settlement 2',
    tag: 'health-5',
  },
  {
    id: 'txn-47',
    accountId: 'acc-business',
    title: 'Ledger Terminal 47',
    merchant: 'Cinema 3',
    amount: 199.7,
    direction: 'debit',
    category: 'Entertainment',
    status: 'scheduled',
    date: '2026-03-19',
    note: 'Subscription renewal 3',
    tag: 'entertainment-6',
  },
  {
    id: 'txn-48',
    accountId: 'acc-main',
    title: 'Delta Market 48',
    merchant: 'Market 4',
    amount: 212,
    direction: 'credit',
    category: 'Travel',
    status: 'booked',
    date: '2026-03-20',
    note: 'Priority route 4',
    tag: 'travel-1',
  },
  {
    id: 'txn-49',
    accountId: 'acc-save',
    title: 'Horizon Energy 49',
    merchant: 'Cafe 5',
    amount: 227.35,
    direction: 'debit',
    category: 'Food',
    status: 'pending',
    date: '2026-03-21',
    note: 'Client settlement 5',
    tag: 'food-2',
  },
  {
    id: 'txn-50',
    accountId: 'acc-travel',
    title: 'Aurora Pharmacy 50',
    merchant: 'Atelier 6',
    amount: 240.7,
    direction: 'credit',
    category: 'Salary',
    status: 'scheduled',
    date: '2026-03-22',
    note: 'Daily spend 1',
    tag: 'salary-3',
  },
  {
    id: 'txn-51',
    accountId: 'acc-business',
    title: 'Atlas Terminal 51',
    merchant: 'Energy 7',
    amount: 32,
    direction: 'debit',
    category: 'Bills',
    status: 'booked',
    date: '2026-03-23',
    note: 'Automated debit 2',
    tag: 'bills-4',
  },
  {
    id: 'txn-52',
    accountId: 'acc-main',
    title: 'Beacon Market 52',
    merchant: 'Grocer 8',
    amount: 45.35,
    direction: 'credit',
    category: 'Investing',
    status: 'pending',
    date: '2026-03-24',
    note: 'Foreign exchange hold 3',
    tag: 'investing-5',
  },
  {
    id: 'txn-53',
    accountId: 'acc-save',
    title: 'Summit Energy 53',
    merchant: 'Studio 9',
    amount: 58.7,
    direction: 'debit',
    category: 'Shopping',
    status: 'scheduled',
    date: '2026-03-25',
    note: 'Reserve transfer 4',
    tag: 'shopping-6',
  },
  {
    id: 'txn-54',
    accountId: 'acc-travel',
    title: 'Reserve Pharmacy 54',
    merchant: 'Pharmacy 1',
    amount: 71,
    direction: 'credit',
    category: 'Health',
    status: 'booked',
    date: '2026-03-26',
    note: 'Cashback settlement 5',
    tag: 'health-1',
  },
  {
    id: 'txn-55',
    accountId: 'acc-business',
    title: 'Signal Terminal 55',
    merchant: 'Harbor 2',
    amount: 84.35,
    direction: 'debit',
    category: 'Entertainment',
    status: 'pending',
    date: '2026-03-27',
    note: 'Subscription renewal 1',
    tag: 'entertainment-2',
  },
  {
    id: 'txn-56',
    accountId: 'acc-main',
    title: 'Vault Market 56',
    merchant: 'Cloud 3',
    amount: 99.7,
    direction: 'credit',
    category: 'Travel',
    status: 'scheduled',
    date: '2026-03-28',
    note: 'Priority route 2',
    tag: 'travel-3',
  },
  {
    id: 'txn-57',
    accountId: 'acc-save',
    title: 'Ledger Energy 57',
    merchant: 'Terminal 4',
    amount: 112,
    direction: 'debit',
    category: 'Food',
    status: 'booked',
    date: '2026-03-01',
    note: 'Client settlement 3',
    tag: 'food-4',
  },
  {
    id: 'txn-58',
    accountId: 'acc-travel',
    title: 'Delta Pharmacy 58',
    merchant: 'Transit 5',
    amount: 125.35,
    direction: 'credit',
    category: 'Salary',
    status: 'pending',
    date: '2026-03-02',
    note: 'Daily spend 4',
    tag: 'salary-5',
  },
  {
    id: 'txn-59',
    accountId: 'acc-business',
    title: 'Horizon Terminal 59',
    merchant: 'Cinema 6',
    amount: 138.7,
    direction: 'debit',
    category: 'Bills',
    status: 'scheduled',
    date: '2026-03-03',
    note: 'Automated debit 5',
    tag: 'bills-6',
  },
  {
    id: 'txn-60',
    accountId: 'acc-main',
    title: 'Aurora Market 60',
    merchant: 'Market 7',
    amount: 151,
    direction: 'credit',
    category: 'Investing',
    status: 'booked',
    date: '2026-03-04',
    note: 'Foreign exchange hold 1',
    tag: 'investing-1',
  },
  {
    id: 'txn-61',
    accountId: 'acc-save',
    title: 'Atlas Energy 61',
    merchant: 'Cafe 8',
    amount: 164.35,
    direction: 'debit',
    category: 'Shopping',
    status: 'pending',
    date: '2026-03-05',
    note: 'Reserve transfer 2',
    tag: 'shopping-2',
  },
  {
    id: 'txn-62',
    accountId: 'acc-travel',
    title: 'Beacon Pharmacy 62',
    merchant: 'Atelier 9',
    amount: 177.7,
    direction: 'credit',
    category: 'Health',
    status: 'scheduled',
    date: '2026-03-06',
    note: 'Cashback settlement 3',
    tag: 'health-3',
  },
  {
    id: 'txn-63',
    accountId: 'acc-business',
    title: 'Summit Terminal 63',
    merchant: 'Energy 1',
    amount: 192,
    direction: 'debit',
    category: 'Entertainment',
    status: 'booked',
    date: '2026-03-07',
    note: 'Subscription renewal 4',
    tag: 'entertainment-4',
  },
  {
    id: 'txn-64',
    accountId: 'acc-main',
    title: 'Reserve Market 64',
    merchant: 'Grocer 2',
    amount: 205.35,
    direction: 'credit',
    category: 'Travel',
    status: 'pending',
    date: '2026-03-08',
    note: 'Priority route 5',
    tag: 'travel-5',
  },
  {
    id: 'txn-65',
    accountId: 'acc-save',
    title: 'Signal Energy 65',
    merchant: 'Studio 3',
    amount: 218.7,
    direction: 'debit',
    category: 'Food',
    status: 'scheduled',
    date: '2026-03-09',
    note: 'Client settlement 1',
    tag: 'food-6',
  },
  {
    id: 'txn-66',
    accountId: 'acc-travel',
    title: 'Vault Pharmacy 66',
    merchant: 'Pharmacy 4',
    amount: 231,
    direction: 'credit',
    category: 'Salary',
    status: 'booked',
    date: '2026-03-10',
    note: 'Daily spend 2',
    tag: 'salary-1',
  },
  {
    id: 'txn-67',
    accountId: 'acc-business',
    title: 'Ledger Terminal 67',
    merchant: 'Harbor 5',
    amount: 244.35,
    direction: 'debit',
    category: 'Bills',
    status: 'pending',
    date: '2026-03-11',
    note: 'Automated debit 3',
    tag: 'bills-2',
  },
  {
    id: 'txn-68',
    accountId: 'acc-main',
    title: 'Delta Market 68',
    merchant: 'Cloud 6',
    amount: 36.7,
    direction: 'credit',
    category: 'Investing',
    status: 'scheduled',
    date: '2026-03-12',
    note: 'Foreign exchange hold 4',
    tag: 'investing-3',
  },
  {
    id: 'txn-69',
    accountId: 'acc-save',
    title: 'Horizon Energy 69',
    merchant: 'Terminal 7',
    amount: 49,
    direction: 'debit',
    category: 'Shopping',
    status: 'booked',
    date: '2026-03-13',
    note: 'Reserve transfer 5',
    tag: 'shopping-4',
  },
  {
    id: 'txn-70',
    accountId: 'acc-travel',
    title: 'Aurora Pharmacy 70',
    merchant: 'Transit 8',
    amount: 64.35,
    direction: 'credit',
    category: 'Health',
    status: 'pending',
    date: '2026-03-14',
    note: 'Cashback settlement 1',
    tag: 'health-5',
  },
  {
    id: 'txn-71',
    accountId: 'acc-business',
    title: 'Atlas Terminal 71',
    merchant: 'Cinema 9',
    amount: 77.7,
    direction: 'debit',
    category: 'Entertainment',
    status: 'scheduled',
    date: '2026-03-15',
    note: 'Subscription renewal 2',
    tag: 'entertainment-6',
  },
  {
    id: 'txn-72',
    accountId: 'acc-main',
    title: 'Beacon Market 72',
    merchant: 'Market 1',
    amount: 90,
    direction: 'credit',
    category: 'Travel',
    status: 'booked',
    date: '2026-03-16',
    note: 'Priority route 3',
    tag: 'travel-1',
  },
  {
    id: 'txn-73',
    accountId: 'acc-save',
    title: 'Summit Energy 73',
    merchant: 'Cafe 2',
    amount: 103.35,
    direction: 'debit',
    category: 'Food',
    status: 'pending',
    date: '2026-03-17',
    note: 'Client settlement 4',
    tag: 'food-2',
  },
  {
    id: 'txn-74',
    accountId: 'acc-travel',
    title: 'Reserve Pharmacy 74',
    merchant: 'Atelier 3',
    amount: 116.7,
    direction: 'credit',
    category: 'Salary',
    status: 'scheduled',
    date: '2026-03-18',
    note: 'Daily spend 5',
    tag: 'salary-3',
  },
  {
    id: 'txn-75',
    accountId: 'acc-business',
    title: 'Signal Terminal 75',
    merchant: 'Energy 4',
    amount: 129,
    direction: 'debit',
    category: 'Bills',
    status: 'booked',
    date: '2026-03-19',
    note: 'Automated debit 1',
    tag: 'bills-4',
  },
  {
    id: 'txn-76',
    accountId: 'acc-main',
    title: 'Vault Market 76',
    merchant: 'Grocer 5',
    amount: 142.35,
    direction: 'credit',
    category: 'Investing',
    status: 'pending',
    date: '2026-03-20',
    note: 'Foreign exchange hold 2',
    tag: 'investing-5',
  },
  {
    id: 'txn-77',
    accountId: 'acc-save',
    title: 'Ledger Energy 77',
    merchant: 'Studio 6',
    amount: 157.7,
    direction: 'debit',
    category: 'Shopping',
    status: 'scheduled',
    date: '2026-03-21',
    note: 'Reserve transfer 3',
    tag: 'shopping-6',
  },
  {
    id: 'txn-78',
    accountId: 'acc-travel',
    title: 'Delta Pharmacy 78',
    merchant: 'Pharmacy 7',
    amount: 170,
    direction: 'credit',
    category: 'Health',
    status: 'booked',
    date: '2026-03-22',
    note: 'Cashback settlement 4',
    tag: 'health-1',
  },
  {
    id: 'txn-79',
    accountId: 'acc-business',
    title: 'Horizon Terminal 79',
    merchant: 'Harbor 8',
    amount: 183.35,
    direction: 'debit',
    category: 'Entertainment',
    status: 'pending',
    date: '2026-03-23',
    note: 'Subscription renewal 5',
    tag: 'entertainment-2',
  },
  {
    id: 'txn-80',
    accountId: 'acc-main',
    title: 'Aurora Market 80',
    merchant: 'Cloud 9',
    amount: 196.7,
    direction: 'credit',
    category: 'Travel',
    status: 'scheduled',
    date: '2026-03-24',
    note: 'Priority route 1',
    tag: 'travel-3',
  },
  {
    id: 'txn-81',
    accountId: 'acc-save',
    title: 'Atlas Energy 81',
    merchant: 'Terminal 1',
    amount: 209,
    direction: 'debit',
    category: 'Food',
    status: 'booked',
    date: '2026-03-25',
    note: 'Client settlement 2',
    tag: 'food-4',
  },
  {
    id: 'txn-82',
    accountId: 'acc-travel',
    title: 'Beacon Pharmacy 82',
    merchant: 'Transit 2',
    amount: 222.35,
    direction: 'credit',
    category: 'Salary',
    status: 'pending',
    date: '2026-03-26',
    note: 'Daily spend 3',
    tag: 'salary-5',
  },
  {
    id: 'txn-83',
    accountId: 'acc-business',
    title: 'Summit Terminal 83',
    merchant: 'Cinema 3',
    amount: 235.7,
    direction: 'debit',
    category: 'Bills',
    status: 'scheduled',
    date: '2026-03-27',
    note: 'Automated debit 4',
    tag: 'bills-6',
  },
  {
    id: 'txn-84',
    accountId: 'acc-main',
    title: 'Reserve Market 84',
    merchant: 'Market 4',
    amount: 250,
    direction: 'credit',
    category: 'Investing',
    status: 'booked',
    date: '2026-03-28',
    note: 'Foreign exchange hold 5',
    tag: 'investing-1',
  },
  {
    id: 'txn-85',
    accountId: 'acc-save',
    title: 'Signal Energy 85',
    merchant: 'Cafe 5',
    amount: 42.35,
    direction: 'debit',
    category: 'Shopping',
    status: 'pending',
    date: '2026-03-01',
    note: 'Reserve transfer 1',
    tag: 'shopping-2',
  },
  {
    id: 'txn-86',
    accountId: 'acc-travel',
    title: 'Vault Pharmacy 86',
    merchant: 'Atelier 6',
    amount: 55.7,
    direction: 'credit',
    category: 'Health',
    status: 'scheduled',
    date: '2026-03-02',
    note: 'Cashback settlement 2',
    tag: 'health-3',
  },
  {
    id: 'txn-87',
    accountId: 'acc-business',
    title: 'Ledger Terminal 87',
    merchant: 'Energy 7',
    amount: 68,
    direction: 'debit',
    category: 'Entertainment',
    status: 'booked',
    date: '2026-03-03',
    note: 'Subscription renewal 3',
    tag: 'entertainment-4',
  },
  {
    id: 'txn-88',
    accountId: 'acc-main',
    title: 'Delta Market 88',
    merchant: 'Grocer 8',
    amount: 81.35,
    direction: 'credit',
    category: 'Travel',
    status: 'pending',
    date: '2026-03-04',
    note: 'Priority route 4',
    tag: 'travel-5',
  },
  {
    id: 'txn-89',
    accountId: 'acc-save',
    title: 'Horizon Energy 89',
    merchant: 'Studio 9',
    amount: 94.7,
    direction: 'debit',
    category: 'Food',
    status: 'scheduled',
    date: '2026-03-05',
    note: 'Client settlement 5',
    tag: 'food-6',
  },
  {
    id: 'txn-90',
    accountId: 'acc-travel',
    title: 'Aurora Pharmacy 90',
    merchant: 'Pharmacy 1',
    amount: 107,
    direction: 'credit',
    category: 'Salary',
    status: 'booked',
    date: '2026-03-06',
    note: 'Daily spend 1',
    tag: 'salary-1',
  },
  {
    id: 'txn-91',
    accountId: 'acc-business',
    title: 'Atlas Terminal 91',
    merchant: 'Harbor 2',
    amount: 122.35,
    direction: 'debit',
    category: 'Bills',
    status: 'pending',
    date: '2026-03-07',
    note: 'Automated debit 2',
    tag: 'bills-2',
  },
  {
    id: 'txn-92',
    accountId: 'acc-main',
    title: 'Beacon Market 92',
    merchant: 'Cloud 3',
    amount: 135.7,
    direction: 'credit',
    category: 'Investing',
    status: 'scheduled',
    date: '2026-03-08',
    note: 'Foreign exchange hold 3',
    tag: 'investing-3',
  },
  {
    id: 'txn-93',
    accountId: 'acc-save',
    title: 'Summit Energy 93',
    merchant: 'Terminal 4',
    amount: 148,
    direction: 'debit',
    category: 'Shopping',
    status: 'booked',
    date: '2026-03-09',
    note: 'Reserve transfer 4',
    tag: 'shopping-4',
  },
  {
    id: 'txn-94',
    accountId: 'acc-travel',
    title: 'Reserve Pharmacy 94',
    merchant: 'Transit 5',
    amount: 161.35,
    direction: 'credit',
    category: 'Health',
    status: 'pending',
    date: '2026-03-10',
    note: 'Cashback settlement 5',
    tag: 'health-5',
  },
  {
    id: 'txn-95',
    accountId: 'acc-business',
    title: 'Signal Terminal 95',
    merchant: 'Cinema 6',
    amount: 174.7,
    direction: 'debit',
    category: 'Entertainment',
    status: 'scheduled',
    date: '2026-03-11',
    note: 'Subscription renewal 1',
    tag: 'entertainment-6',
  },
  {
    id: 'txn-96',
    accountId: 'acc-main',
    title: 'Vault Market 96',
    merchant: 'Market 7',
    amount: 187,
    direction: 'credit',
    category: 'Travel',
    status: 'booked',
    date: '2026-03-12',
    note: 'Priority route 2',
    tag: 'travel-1',
  },
  {
    id: 'txn-97',
    accountId: 'acc-save',
    title: 'Ledger Energy 97',
    merchant: 'Cafe 8',
    amount: 200.35,
    direction: 'debit',
    category: 'Food',
    status: 'pending',
    date: '2026-03-13',
    note: 'Client settlement 3',
    tag: 'food-2',
  },
  {
    id: 'txn-98',
    accountId: 'acc-travel',
    title: 'Delta Pharmacy 98',
    merchant: 'Atelier 9',
    amount: 215.7,
    direction: 'credit',
    category: 'Salary',
    status: 'scheduled',
    date: '2026-03-14',
    note: 'Daily spend 4',
    tag: 'salary-3',
  },
  {
    id: 'txn-99',
    accountId: 'acc-business',
    title: 'Horizon Terminal 99',
    merchant: 'Energy 1',
    amount: 228,
    direction: 'debit',
    category: 'Bills',
    status: 'booked',
    date: '2026-03-15',
    note: 'Automated debit 5',
    tag: 'bills-4',
  },
  {
    id: 'txn-100',
    accountId: 'acc-main',
    title: 'Aurora Market 100',
    merchant: 'Grocer 2',
    amount: 241.35,
    direction: 'credit',
    category: 'Investing',
    status: 'pending',
    date: '2026-03-16',
    note: 'Foreign exchange hold 1',
    tag: 'investing-5',
  },
  {
    id: 'txn-101',
    accountId: 'acc-save',
    title: 'Atlas Energy 101',
    merchant: 'Studio 3',
    amount: 254.7,
    direction: 'debit',
    category: 'Shopping',
    status: 'scheduled',
    date: '2026-03-17',
    note: 'Reserve transfer 2',
    tag: 'shopping-6',
  },
  {
    id: 'txn-102',
    accountId: 'acc-travel',
    title: 'Beacon Pharmacy 102',
    merchant: 'Pharmacy 4',
    amount: 46,
    direction: 'credit',
    category: 'Health',
    status: 'booked',
    date: '2026-03-18',
    note: 'Cashback settlement 3',
    tag: 'health-1',
  },
  {
    id: 'txn-103',
    accountId: 'acc-business',
    title: 'Summit Terminal 103',
    merchant: 'Harbor 5',
    amount: 59.35,
    direction: 'debit',
    category: 'Entertainment',
    status: 'pending',
    date: '2026-03-19',
    note: 'Subscription renewal 4',
    tag: 'entertainment-2',
  },
  {
    id: 'txn-104',
    accountId: 'acc-main',
    title: 'Reserve Market 104',
    merchant: 'Cloud 6',
    amount: 72.7,
    direction: 'credit',
    category: 'Travel',
    status: 'scheduled',
    date: '2026-03-20',
    note: 'Priority route 5',
    tag: 'travel-3',
  },
  {
    id: 'txn-105',
    accountId: 'acc-save',
    title: 'Signal Energy 105',
    merchant: 'Terminal 7',
    amount: 87,
    direction: 'debit',
    category: 'Food',
    status: 'booked',
    date: '2026-03-21',
    note: 'Client settlement 1',
    tag: 'food-4',
  },
  {
    id: 'txn-106',
    accountId: 'acc-travel',
    title: 'Vault Pharmacy 106',
    merchant: 'Transit 8',
    amount: 100.35,
    direction: 'credit',
    category: 'Salary',
    status: 'pending',
    date: '2026-03-22',
    note: 'Daily spend 2',
    tag: 'salary-5',
  },
  {
    id: 'txn-107',
    accountId: 'acc-business',
    title: 'Ledger Terminal 107',
    merchant: 'Cinema 9',
    amount: 113.7,
    direction: 'debit',
    category: 'Bills',
    status: 'scheduled',
    date: '2026-03-23',
    note: 'Automated debit 3',
    tag: 'bills-6',
  },
  {
    id: 'txn-108',
    accountId: 'acc-main',
    title: 'Delta Market 108',
    merchant: 'Market 1',
    amount: 126,
    direction: 'credit',
    category: 'Investing',
    status: 'booked',
    date: '2026-03-24',
    note: 'Foreign exchange hold 4',
    tag: 'investing-1',
  },
  {
    id: 'txn-109',
    accountId: 'acc-save',
    title: 'Horizon Energy 109',
    merchant: 'Cafe 2',
    amount: 139.35,
    direction: 'debit',
    category: 'Shopping',
    status: 'pending',
    date: '2026-03-25',
    note: 'Reserve transfer 5',
    tag: 'shopping-2',
  },
  {
    id: 'txn-110',
    accountId: 'acc-travel',
    title: 'Aurora Pharmacy 110',
    merchant: 'Atelier 3',
    amount: 152.7,
    direction: 'credit',
    category: 'Health',
    status: 'scheduled',
    date: '2026-03-26',
    note: 'Cashback settlement 1',
    tag: 'health-3',
  },
  {
    id: 'txn-111',
    accountId: 'acc-business',
    title: 'Atlas Terminal 111',
    merchant: 'Energy 4',
    amount: 165,
    direction: 'debit',
    category: 'Entertainment',
    status: 'booked',
    date: '2026-03-27',
    note: 'Subscription renewal 2',
    tag: 'entertainment-4',
  },
  {
    id: 'txn-112',
    accountId: 'acc-main',
    title: 'Beacon Market 112',
    merchant: 'Grocer 5',
    amount: 180.35,
    direction: 'credit',
    category: 'Travel',
    status: 'pending',
    date: '2026-03-28',
    note: 'Priority route 3',
    tag: 'travel-5',
  },
  {
    id: 'txn-113',
    accountId: 'acc-save',
    title: 'Summit Energy 113',
    merchant: 'Studio 6',
    amount: 193.7,
    direction: 'debit',
    category: 'Food',
    status: 'scheduled',
    date: '2026-03-01',
    note: 'Client settlement 4',
    tag: 'food-6',
  },
  {
    id: 'txn-114',
    accountId: 'acc-travel',
    title: 'Reserve Pharmacy 114',
    merchant: 'Pharmacy 7',
    amount: 206,
    direction: 'credit',
    category: 'Salary',
    status: 'booked',
    date: '2026-03-02',
    note: 'Daily spend 5',
    tag: 'salary-1',
  },
  {
    id: 'txn-115',
    accountId: 'acc-business',
    title: 'Signal Terminal 115',
    merchant: 'Harbor 8',
    amount: 219.35,
    direction: 'debit',
    category: 'Bills',
    status: 'pending',
    date: '2026-03-03',
    note: 'Automated debit 1',
    tag: 'bills-2',
  },
  {
    id: 'txn-116',
    accountId: 'acc-main',
    title: 'Vault Market 116',
    merchant: 'Cloud 9',
    amount: 232.7,
    direction: 'credit',
    category: 'Investing',
    status: 'scheduled',
    date: '2026-03-04',
    note: 'Foreign exchange hold 2',
    tag: 'investing-3',
  },
  {
    id: 'txn-117',
    accountId: 'acc-save',
    title: 'Ledger Energy 117',
    merchant: 'Terminal 1',
    amount: 245,
    direction: 'debit',
    category: 'Shopping',
    status: 'booked',
    date: '2026-03-05',
    note: 'Reserve transfer 3',
    tag: 'shopping-4',
  },
  {
    id: 'txn-118',
    accountId: 'acc-travel',
    title: 'Delta Pharmacy 118',
    merchant: 'Transit 2',
    amount: 258.35,
    direction: 'credit',
    category: 'Health',
    status: 'pending',
    date: '2026-03-06',
    note: 'Cashback settlement 4',
    tag: 'health-5',
  },
  {
    id: 'txn-119',
    accountId: 'acc-business',
    title: 'Horizon Terminal 119',
    merchant: 'Cinema 3',
    amount: 52.7,
    direction: 'debit',
    category: 'Entertainment',
    status: 'scheduled',
    date: '2026-03-07',
    note: 'Subscription renewal 5',
    tag: 'entertainment-6',
  },
  {
    id: 'txn-120',
    accountId: 'acc-main',
    title: 'Aurora Market 120',
    merchant: 'Market 4',
    amount: 65,
    direction: 'credit',
    category: 'Travel',
    status: 'booked',
    date: '2026-03-08',
    note: 'Priority route 1',
    tag: 'travel-1',
  },
  {
    id: 'txn-121',
    accountId: 'acc-save',
    title: 'Atlas Energy 121',
    merchant: 'Cafe 5',
    amount: 78.35,
    direction: 'debit',
    category: 'Food',
    status: 'pending',
    date: '2026-03-09',
    note: 'Client settlement 2',
    tag: 'food-2',
  },
  {
    id: 'txn-122',
    accountId: 'acc-travel',
    title: 'Beacon Pharmacy 122',
    merchant: 'Atelier 6',
    amount: 91.7,
    direction: 'credit',
    category: 'Salary',
    status: 'scheduled',
    date: '2026-03-10',
    note: 'Daily spend 3',
    tag: 'salary-3',
  },
  {
    id: 'txn-123',
    accountId: 'acc-business',
    title: 'Summit Terminal 123',
    merchant: 'Energy 7',
    amount: 104,
    direction: 'debit',
    category: 'Bills',
    status: 'booked',
    date: '2026-03-11',
    note: 'Automated debit 4',
    tag: 'bills-4',
  },
  {
    id: 'txn-124',
    accountId: 'acc-main',
    title: 'Reserve Market 124',
    merchant: 'Grocer 8',
    amount: 117.35,
    direction: 'credit',
    category: 'Investing',
    status: 'pending',
    date: '2026-03-12',
    note: 'Foreign exchange hold 5',
    tag: 'investing-5',
  },
  {
    id: 'txn-125',
    accountId: 'acc-save',
    title: 'Signal Energy 125',
    merchant: 'Studio 9',
    amount: 130.7,
    direction: 'debit',
    category: 'Shopping',
    status: 'scheduled',
    date: '2026-03-13',
    note: 'Reserve transfer 1',
    tag: 'shopping-6',
  },
  {
    id: 'txn-126',
    accountId: 'acc-travel',
    title: 'Vault Pharmacy 126',
    merchant: 'Pharmacy 1',
    amount: 145,
    direction: 'credit',
    category: 'Health',
    status: 'booked',
    date: '2026-03-14',
    note: 'Cashback settlement 2',
    tag: 'health-1',
  },
  {
    id: 'txn-127',
    accountId: 'acc-business',
    title: 'Ledger Terminal 127',
    merchant: 'Harbor 2',
    amount: 158.35,
    direction: 'debit',
    category: 'Entertainment',
    status: 'pending',
    date: '2026-03-15',
    note: 'Subscription renewal 3',
    tag: 'entertainment-2',
  },
  {
    id: 'txn-128',
    accountId: 'acc-main',
    title: 'Delta Market 128',
    merchant: 'Cloud 3',
    amount: 171.7,
    direction: 'credit',
    category: 'Travel',
    status: 'scheduled',
    date: '2026-03-16',
    note: 'Priority route 4',
    tag: 'travel-3',
  },
  {
    id: 'txn-129',
    accountId: 'acc-save',
    title: 'Horizon Energy 129',
    merchant: 'Terminal 4',
    amount: 184,
    direction: 'debit',
    category: 'Food',
    status: 'booked',
    date: '2026-03-17',
    note: 'Client settlement 5',
    tag: 'food-4',
  },
  {
    id: 'txn-130',
    accountId: 'acc-travel',
    title: 'Aurora Pharmacy 130',
    merchant: 'Transit 5',
    amount: 197.35,
    direction: 'credit',
    category: 'Salary',
    status: 'pending',
    date: '2026-03-18',
    note: 'Daily spend 1',
    tag: 'salary-5',
  },
  {
    id: 'txn-131',
    accountId: 'acc-business',
    title: 'Atlas Terminal 131',
    merchant: 'Cinema 6',
    amount: 210.7,
    direction: 'debit',
    category: 'Bills',
    status: 'scheduled',
    date: '2026-03-19',
    note: 'Automated debit 2',
    tag: 'bills-6',
  },
  {
    id: 'txn-132',
    accountId: 'acc-main',
    title: 'Beacon Market 132',
    merchant: 'Market 7',
    amount: 223,
    direction: 'credit',
    category: 'Investing',
    status: 'booked',
    date: '2026-03-20',
    note: 'Foreign exchange hold 3',
    tag: 'investing-1',
  },
  {
    id: 'txn-133',
    accountId: 'acc-save',
    title: 'Summit Energy 133',
    merchant: 'Cafe 8',
    amount: 238.35,
    direction: 'debit',
    category: 'Shopping',
    status: 'pending',
    date: '2026-03-21',
    note: 'Reserve transfer 4',
    tag: 'shopping-2',
  },
  {
    id: 'txn-134',
    accountId: 'acc-travel',
    title: 'Reserve Pharmacy 134',
    merchant: 'Atelier 9',
    amount: 251.7,
    direction: 'credit',
    category: 'Health',
    status: 'scheduled',
    date: '2026-03-22',
    note: 'Cashback settlement 5',
    tag: 'health-3',
  },
  {
    id: 'txn-135',
    accountId: 'acc-business',
    title: 'Signal Terminal 135',
    merchant: 'Energy 1',
    amount: 264,
    direction: 'debit',
    category: 'Entertainment',
    status: 'booked',
    date: '2026-03-23',
    note: 'Subscription renewal 1',
    tag: 'entertainment-4',
  },
  {
    id: 'txn-136',
    accountId: 'acc-main',
    title: 'Vault Market 136',
    merchant: 'Grocer 2',
    amount: 56.35,
    direction: 'credit',
    category: 'Travel',
    status: 'pending',
    date: '2026-03-24',
    note: 'Priority route 2',
    tag: 'travel-5',
  },
  {
    id: 'txn-137',
    accountId: 'acc-save',
    title: 'Ledger Energy 137',
    merchant: 'Studio 3',
    amount: 69.7,
    direction: 'debit',
    category: 'Food',
    status: 'scheduled',
    date: '2026-03-25',
    note: 'Client settlement 3',
    tag: 'food-6',
  },
  {
    id: 'txn-138',
    accountId: 'acc-travel',
    title: 'Delta Pharmacy 138',
    merchant: 'Pharmacy 4',
    amount: 82,
    direction: 'credit',
    category: 'Salary',
    status: 'booked',
    date: '2026-03-26',
    note: 'Daily spend 4',
    tag: 'salary-1',
  },
  {
    id: 'txn-139',
    accountId: 'acc-business',
    title: 'Horizon Terminal 139',
    merchant: 'Harbor 5',
    amount: 95.35,
    direction: 'debit',
    category: 'Bills',
    status: 'pending',
    date: '2026-03-27',
    note: 'Automated debit 5',
    tag: 'bills-2',
  },
  {
    id: 'txn-140',
    accountId: 'acc-main',
    title: 'Aurora Market 140',
    merchant: 'Cloud 6',
    amount: 110.7,
    direction: 'credit',
    category: 'Investing',
    status: 'scheduled',
    date: '2026-03-28',
    note: 'Foreign exchange hold 1',
    tag: 'investing-3',
  },
  {
    id: 'txn-141',
    accountId: 'acc-save',
    title: 'Atlas Energy 141',
    merchant: 'Terminal 7',
    amount: 123,
    direction: 'debit',
    category: 'Shopping',
    status: 'booked',
    date: '2026-03-01',
    note: 'Reserve transfer 2',
    tag: 'shopping-4',
  },
  {
    id: 'txn-142',
    accountId: 'acc-travel',
    title: 'Beacon Pharmacy 142',
    merchant: 'Transit 8',
    amount: 136.35,
    direction: 'credit',
    category: 'Health',
    status: 'pending',
    date: '2026-03-02',
    note: 'Cashback settlement 3',
    tag: 'health-5',
  },
  {
    id: 'txn-143',
    accountId: 'acc-business',
    title: 'Summit Terminal 143',
    merchant: 'Cinema 9',
    amount: 149.7,
    direction: 'debit',
    category: 'Entertainment',
    status: 'scheduled',
    date: '2026-03-03',
    note: 'Subscription renewal 4',
    tag: 'entertainment-6',
  },
  {
    id: 'txn-144',
    accountId: 'acc-main',
    title: 'Reserve Market 144',
    merchant: 'Market 1',
    amount: 162,
    direction: 'credit',
    category: 'Travel',
    status: 'booked',
    date: '2026-03-04',
    note: 'Priority route 5',
    tag: 'travel-1',
  },
  {
    id: 'txn-145',
    accountId: 'acc-save',
    title: 'Signal Energy 145',
    merchant: 'Cafe 2',
    amount: 175.35,
    direction: 'debit',
    category: 'Food',
    status: 'pending',
    date: '2026-03-05',
    note: 'Client settlement 1',
    tag: 'food-2',
  },
  {
    id: 'txn-146',
    accountId: 'acc-travel',
    title: 'Vault Pharmacy 146',
    merchant: 'Atelier 3',
    amount: 188.7,
    direction: 'credit',
    category: 'Salary',
    status: 'scheduled',
    date: '2026-03-06',
    note: 'Daily spend 2',
    tag: 'salary-3',
  },
  {
    id: 'txn-147',
    accountId: 'acc-business',
    title: 'Ledger Terminal 147',
    merchant: 'Energy 4',
    amount: 203,
    direction: 'debit',
    category: 'Bills',
    status: 'booked',
    date: '2026-03-07',
    note: 'Automated debit 3',
    tag: 'bills-4',
  },
  {
    id: 'txn-148',
    accountId: 'acc-main',
    title: 'Delta Market 148',
    merchant: 'Grocer 5',
    amount: 216.35,
    direction: 'credit',
    category: 'Investing',
    status: 'pending',
    date: '2026-03-08',
    note: 'Foreign exchange hold 4',
    tag: 'investing-5',
  },
  {
    id: 'txn-149',
    accountId: 'acc-save',
    title: 'Horizon Energy 149',
    merchant: 'Studio 6',
    amount: 229.7,
    direction: 'debit',
    category: 'Shopping',
    status: 'scheduled',
    date: '2026-03-09',
    note: 'Reserve transfer 5',
    tag: 'shopping-6',
  },
  {
    id: 'txn-150',
    accountId: 'acc-travel',
    title: 'Aurora Pharmacy 150',
    merchant: 'Pharmacy 7',
    amount: 242,
    direction: 'credit',
    category: 'Health',
    status: 'booked',
    date: '2026-03-10',
    note: 'Cashback settlement 1',
    tag: 'health-1',
  },
  {
    id: 'txn-151',
    accountId: 'acc-business',
    title: 'Atlas Terminal 151',
    merchant: 'Harbor 8',
    amount: 255.35,
    direction: 'debit',
    category: 'Entertainment',
    status: 'pending',
    date: '2026-03-11',
    note: 'Subscription renewal 2',
    tag: 'entertainment-2',
  },
  {
    id: 'txn-152',
    accountId: 'acc-main',
    title: 'Beacon Market 152',
    merchant: 'Cloud 9',
    amount: 268.7,
    direction: 'credit',
    category: 'Travel',
    status: 'scheduled',
    date: '2026-03-12',
    note: 'Priority route 3',
    tag: 'travel-3',
  },
  {
    id: 'txn-153',
    accountId: 'acc-save',
    title: 'Summit Energy 153',
    merchant: 'Terminal 1',
    amount: 60,
    direction: 'debit',
    category: 'Food',
    status: 'booked',
    date: '2026-03-13',
    note: 'Client settlement 4',
    tag: 'food-4',
  },
  {
    id: 'txn-154',
    accountId: 'acc-travel',
    title: 'Reserve Pharmacy 154',
    merchant: 'Transit 2',
    amount: 75.35,
    direction: 'credit',
    category: 'Salary',
    status: 'pending',
    date: '2026-03-14',
    note: 'Daily spend 5',
    tag: 'salary-5',
  },
  {
    id: 'txn-155',
    accountId: 'acc-business',
    title: 'Signal Terminal 155',
    merchant: 'Cinema 3',
    amount: 88.7,
    direction: 'debit',
    category: 'Bills',
    status: 'scheduled',
    date: '2026-03-15',
    note: 'Automated debit 1',
    tag: 'bills-6',
  },
  {
    id: 'txn-156',
    accountId: 'acc-main',
    title: 'Vault Market 156',
    merchant: 'Market 4',
    amount: 101,
    direction: 'credit',
    category: 'Investing',
    status: 'booked',
    date: '2026-03-16',
    note: 'Foreign exchange hold 2',
    tag: 'investing-1',
  },
  {
    id: 'txn-157',
    accountId: 'acc-save',
    title: 'Ledger Energy 157',
    merchant: 'Cafe 5',
    amount: 114.35,
    direction: 'debit',
    category: 'Shopping',
    status: 'pending',
    date: '2026-03-17',
    note: 'Reserve transfer 3',
    tag: 'shopping-2',
  },
  {
    id: 'txn-158',
    accountId: 'acc-travel',
    title: 'Delta Pharmacy 158',
    merchant: 'Atelier 6',
    amount: 127.7,
    direction: 'credit',
    category: 'Health',
    status: 'scheduled',
    date: '2026-03-18',
    note: 'Cashback settlement 4',
    tag: 'health-3',
  },
  {
    id: 'txn-159',
    accountId: 'acc-business',
    title: 'Horizon Terminal 159',
    merchant: 'Energy 7',
    amount: 140,
    direction: 'debit',
    category: 'Entertainment',
    status: 'booked',
    date: '2026-03-19',
    note: 'Subscription renewal 5',
    tag: 'entertainment-4',
  },
  {
    id: 'txn-160',
    accountId: 'acc-main',
    title: 'Aurora Market 160',
    merchant: 'Grocer 8',
    amount: 153.35,
    direction: 'credit',
    category: 'Travel',
    status: 'pending',
    date: '2026-03-20',
    note: 'Priority route 1',
    tag: 'travel-5',
  },
  {
    id: 'txn-161',
    accountId: 'acc-save',
    title: 'Atlas Energy 161',
    merchant: 'Studio 9',
    amount: 168.7,
    direction: 'debit',
    category: 'Food',
    status: 'scheduled',
    date: '2026-03-21',
    note: 'Client settlement 2',
    tag: 'food-6',
  },
  {
    id: 'txn-162',
    accountId: 'acc-travel',
    title: 'Beacon Pharmacy 162',
    merchant: 'Pharmacy 1',
    amount: 181,
    direction: 'credit',
    category: 'Salary',
    status: 'booked',
    date: '2026-03-22',
    note: 'Daily spend 3',
    tag: 'salary-1',
  },
  {
    id: 'txn-163',
    accountId: 'acc-business',
    title: 'Summit Terminal 163',
    merchant: 'Harbor 2',
    amount: 194.35,
    direction: 'debit',
    category: 'Bills',
    status: 'pending',
    date: '2026-03-23',
    note: 'Automated debit 4',
    tag: 'bills-2',
  },
  {
    id: 'txn-164',
    accountId: 'acc-main',
    title: 'Reserve Market 164',
    merchant: 'Cloud 3',
    amount: 207.7,
    direction: 'credit',
    category: 'Investing',
    status: 'scheduled',
    date: '2026-03-24',
    note: 'Foreign exchange hold 5',
    tag: 'investing-3',
  },
  {
    id: 'txn-165',
    accountId: 'acc-save',
    title: 'Signal Energy 165',
    merchant: 'Terminal 4',
    amount: 220,
    direction: 'debit',
    category: 'Shopping',
    status: 'booked',
    date: '2026-03-25',
    note: 'Reserve transfer 1',
    tag: 'shopping-4',
  },
  {
    id: 'txn-166',
    accountId: 'acc-travel',
    title: 'Vault Pharmacy 166',
    merchant: 'Transit 5',
    amount: 233.35,
    direction: 'credit',
    category: 'Health',
    status: 'pending',
    date: '2026-03-26',
    note: 'Cashback settlement 2',
    tag: 'health-5',
  },
  {
    id: 'txn-167',
    accountId: 'acc-business',
    title: 'Ledger Terminal 167',
    merchant: 'Cinema 6',
    amount: 246.7,
    direction: 'debit',
    category: 'Entertainment',
    status: 'scheduled',
    date: '2026-03-27',
    note: 'Subscription renewal 3',
    tag: 'entertainment-6',
  },
  {
    id: 'txn-168',
    accountId: 'acc-main',
    title: 'Delta Market 168',
    merchant: 'Market 7',
    amount: 261,
    direction: 'credit',
    category: 'Travel',
    status: 'booked',
    date: '2026-03-28',
    note: 'Priority route 4',
    tag: 'travel-1',
  },
  {
    id: 'txn-169',
    accountId: 'acc-save',
    title: 'Horizon Energy 169',
    merchant: 'Cafe 8',
    amount: 274.35,
    direction: 'debit',
    category: 'Food',
    status: 'pending',
    date: '2026-03-01',
    note: 'Client settlement 5',
    tag: 'food-2',
  },
  {
    id: 'txn-170',
    accountId: 'acc-travel',
    title: 'Aurora Pharmacy 170',
    merchant: 'Atelier 9',
    amount: 66.7,
    direction: 'credit',
    category: 'Salary',
    status: 'scheduled',
    date: '2026-03-02',
    note: 'Daily spend 1',
    tag: 'salary-3',
  },
  {
    id: 'txn-171',
    accountId: 'acc-business',
    title: 'Atlas Terminal 171',
    merchant: 'Energy 1',
    amount: 79,
    direction: 'debit',
    category: 'Bills',
    status: 'booked',
    date: '2026-03-03',
    note: 'Automated debit 2',
    tag: 'bills-4',
  },
  {
    id: 'txn-172',
    accountId: 'acc-main',
    title: 'Beacon Market 172',
    merchant: 'Grocer 2',
    amount: 92.35,
    direction: 'credit',
    category: 'Investing',
    status: 'pending',
    date: '2026-03-04',
    note: 'Foreign exchange hold 3',
    tag: 'investing-5',
  },
  {
    id: 'txn-173',
    accountId: 'acc-save',
    title: 'Summit Energy 173',
    merchant: 'Studio 3',
    amount: 105.7,
    direction: 'debit',
    category: 'Shopping',
    status: 'scheduled',
    date: '2026-03-05',
    note: 'Reserve transfer 4',
    tag: 'shopping-6',
  },
  {
    id: 'txn-174',
    accountId: 'acc-travel',
    title: 'Reserve Pharmacy 174',
    merchant: 'Pharmacy 4',
    amount: 118,
    direction: 'credit',
    category: 'Health',
    status: 'booked',
    date: '2026-03-06',
    note: 'Cashback settlement 5',
    tag: 'health-1',
  },
  {
    id: 'txn-175',
    accountId: 'acc-business',
    title: 'Signal Terminal 175',
    merchant: 'Harbor 5',
    amount: 133.35,
    direction: 'debit',
    category: 'Entertainment',
    status: 'pending',
    date: '2026-03-07',
    note: 'Subscription renewal 1',
    tag: 'entertainment-2',
  },
  {
    id: 'txn-176',
    accountId: 'acc-main',
    title: 'Vault Market 176',
    merchant: 'Cloud 6',
    amount: 146.7,
    direction: 'credit',
    category: 'Travel',
    status: 'scheduled',
    date: '2026-03-08',
    note: 'Priority route 2',
    tag: 'travel-3',
  },
  {
    id: 'txn-177',
    accountId: 'acc-save',
    title: 'Ledger Energy 177',
    merchant: 'Terminal 7',
    amount: 159,
    direction: 'debit',
    category: 'Food',
    status: 'booked',
    date: '2026-03-09',
    note: 'Client settlement 3',
    tag: 'food-4',
  },
  {
    id: 'txn-178',
    accountId: 'acc-travel',
    title: 'Delta Pharmacy 178',
    merchant: 'Transit 8',
    amount: 172.35,
    direction: 'credit',
    category: 'Salary',
    status: 'pending',
    date: '2026-03-10',
    note: 'Daily spend 4',
    tag: 'salary-5',
  },
  {
    id: 'txn-179',
    accountId: 'acc-business',
    title: 'Horizon Terminal 179',
    merchant: 'Cinema 9',
    amount: 185.7,
    direction: 'debit',
    category: 'Bills',
    status: 'scheduled',
    date: '2026-03-11',
    note: 'Automated debit 5',
    tag: 'bills-6',
  },
  {
    id: 'txn-180',
    accountId: 'acc-main',
    title: 'Aurora Market 180',
    merchant: 'Market 1',
    amount: 198,
    direction: 'credit',
    category: 'Investing',
    status: 'booked',
    date: '2026-03-12',
    note: 'Foreign exchange hold 1',
    tag: 'investing-1',
  },
  {
    id: 'txn-181',
    accountId: 'acc-save',
    title: 'Atlas Energy 181',
    merchant: 'Cafe 2',
    amount: 211.35,
    direction: 'debit',
    category: 'Shopping',
    status: 'pending',
    date: '2026-03-13',
    note: 'Reserve transfer 2',
    tag: 'shopping-2',
  },
  {
    id: 'txn-182',
    accountId: 'acc-travel',
    title: 'Beacon Pharmacy 182',
    merchant: 'Atelier 3',
    amount: 226.7,
    direction: 'credit',
    category: 'Health',
    status: 'scheduled',
    date: '2026-03-14',
    note: 'Cashback settlement 3',
    tag: 'health-3',
  },
  {
    id: 'txn-183',
    accountId: 'acc-business',
    title: 'Summit Terminal 183',
    merchant: 'Energy 4',
    amount: 239,
    direction: 'debit',
    category: 'Entertainment',
    status: 'booked',
    date: '2026-03-15',
    note: 'Subscription renewal 4',
    tag: 'entertainment-4',
  },
  {
    id: 'txn-184',
    accountId: 'acc-main',
    title: 'Reserve Market 184',
    merchant: 'Grocer 5',
    amount: 252.35,
    direction: 'credit',
    category: 'Travel',
    status: 'pending',
    date: '2026-03-16',
    note: 'Priority route 5',
    tag: 'travel-5',
  },
  {
    id: 'txn-185',
    accountId: 'acc-save',
    title: 'Signal Energy 185',
    merchant: 'Studio 6',
    amount: 265.7,
    direction: 'debit',
    category: 'Food',
    status: 'scheduled',
    date: '2026-03-17',
    note: 'Client settlement 1',
    tag: 'food-6',
  },
  {
    id: 'txn-186',
    accountId: 'acc-travel',
    title: 'Vault Pharmacy 186',
    merchant: 'Pharmacy 7',
    amount: 278,
    direction: 'credit',
    category: 'Salary',
    status: 'booked',
    date: '2026-03-18',
    note: 'Daily spend 2',
    tag: 'salary-1',
  },
  {
    id: 'txn-187',
    accountId: 'acc-business',
    title: 'Ledger Terminal 187',
    merchant: 'Harbor 8',
    amount: 70.35,
    direction: 'debit',
    category: 'Bills',
    status: 'pending',
    date: '2026-03-19',
    note: 'Automated debit 3',
    tag: 'bills-2',
  },
  {
    id: 'txn-188',
    accountId: 'acc-main',
    title: 'Delta Market 188',
    merchant: 'Cloud 9',
    amount: 83.7,
    direction: 'credit',
    category: 'Investing',
    status: 'scheduled',
    date: '2026-03-20',
    note: 'Foreign exchange hold 4',
    tag: 'investing-3',
  },
  {
    id: 'txn-189',
    accountId: 'acc-save',
    title: 'Horizon Energy 189',
    merchant: 'Terminal 1',
    amount: 98,
    direction: 'debit',
    category: 'Shopping',
    status: 'booked',
    date: '2026-03-21',
    note: 'Reserve transfer 5',
    tag: 'shopping-4',
  },
  {
    id: 'txn-190',
    accountId: 'acc-travel',
    title: 'Aurora Pharmacy 190',
    merchant: 'Transit 2',
    amount: 111.35,
    direction: 'credit',
    category: 'Health',
    status: 'pending',
    date: '2026-03-22',
    note: 'Cashback settlement 1',
    tag: 'health-5',
  },
  {
    id: 'txn-191',
    accountId: 'acc-business',
    title: 'Atlas Terminal 191',
    merchant: 'Cinema 3',
    amount: 124.7,
    direction: 'debit',
    category: 'Entertainment',
    status: 'scheduled',
    date: '2026-03-23',
    note: 'Subscription renewal 2',
    tag: 'entertainment-6',
  },
  {
    id: 'txn-192',
    accountId: 'acc-main',
    title: 'Beacon Market 192',
    merchant: 'Market 4',
    amount: 137,
    direction: 'credit',
    category: 'Travel',
    status: 'booked',
    date: '2026-03-24',
    note: 'Priority route 3',
    tag: 'travel-1',
  },
  {
    id: 'txn-193',
    accountId: 'acc-save',
    title: 'Summit Energy 193',
    merchant: 'Cafe 5',
    amount: 150.35,
    direction: 'debit',
    category: 'Food',
    status: 'pending',
    date: '2026-03-25',
    note: 'Client settlement 4',
    tag: 'food-2',
  },
  {
    id: 'txn-194',
    accountId: 'acc-travel',
    title: 'Reserve Pharmacy 194',
    merchant: 'Atelier 6',
    amount: 163.7,
    direction: 'credit',
    category: 'Salary',
    status: 'scheduled',
    date: '2026-03-26',
    note: 'Daily spend 5',
    tag: 'salary-3',
  },
  {
    id: 'txn-195',
    accountId: 'acc-business',
    title: 'Signal Terminal 195',
    merchant: 'Energy 7',
    amount: 176,
    direction: 'debit',
    category: 'Bills',
    status: 'booked',
    date: '2026-03-27',
    note: 'Automated debit 1',
    tag: 'bills-4',
  },
  {
    id: 'txn-196',
    accountId: 'acc-main',
    title: 'Vault Market 196',
    merchant: 'Grocer 8',
    amount: 191.35,
    direction: 'credit',
    category: 'Investing',
    status: 'pending',
    date: '2026-03-28',
    note: 'Foreign exchange hold 2',
    tag: 'investing-5',
  },
  {
    id: 'txn-197',
    accountId: 'acc-save',
    title: 'Ledger Energy 197',
    merchant: 'Studio 9',
    amount: 204.7,
    direction: 'debit',
    category: 'Shopping',
    status: 'scheduled',
    date: '2026-03-01',
    note: 'Reserve transfer 3',
    tag: 'shopping-6',
  },
  {
    id: 'txn-198',
    accountId: 'acc-travel',
    title: 'Delta Pharmacy 198',
    merchant: 'Pharmacy 1',
    amount: 217,
    direction: 'credit',
    category: 'Health',
    status: 'booked',
    date: '2026-03-02',
    note: 'Cashback settlement 4',
    tag: 'health-1',
  },
  {
    id: 'txn-199',
    accountId: 'acc-business',
    title: 'Horizon Terminal 199',
    merchant: 'Harbor 2',
    amount: 230.35,
    direction: 'debit',
    category: 'Entertainment',
    status: 'pending',
    date: '2026-03-03',
    note: 'Subscription renewal 5',
    tag: 'entertainment-2',
  },
  {
    id: 'txn-200',
    accountId: 'acc-main',
    title: 'Aurora Market 200',
    merchant: 'Cloud 3',
    amount: 243.7,
    direction: 'credit',
    category: 'Travel',
    status: 'scheduled',
    date: '2026-03-04',
    note: 'Priority route 1',
    tag: 'travel-3',
  },
  {
    id: 'txn-201',
    accountId: 'acc-save',
    title: 'Atlas Energy 201',
    merchant: 'Terminal 4',
    amount: 256,
    direction: 'debit',
    category: 'Food',
    status: 'booked',
    date: '2026-03-05',
    note: 'Client settlement 2',
    tag: 'food-4',
  },
  {
    id: 'txn-202',
    accountId: 'acc-travel',
    title: 'Beacon Pharmacy 202',
    merchant: 'Transit 5',
    amount: 269.35,
    direction: 'credit',
    category: 'Salary',
    status: 'pending',
    date: '2026-03-06',
    note: 'Daily spend 3',
    tag: 'salary-5',
  },
  {
    id: 'txn-203',
    accountId: 'acc-business',
    title: 'Summit Terminal 203',
    merchant: 'Cinema 6',
    amount: 284.7,
    direction: 'debit',
    category: 'Bills',
    status: 'scheduled',
    date: '2026-03-07',
    note: 'Automated debit 4',
    tag: 'bills-6',
  },
  {
    id: 'txn-204',
    accountId: 'acc-main',
    title: 'Reserve Market 204',
    merchant: 'Market 7',
    amount: 76,
    direction: 'credit',
    category: 'Investing',
    status: 'booked',
    date: '2026-03-08',
    note: 'Foreign exchange hold 5',
    tag: 'investing-1',
  },
  {
    id: 'txn-205',
    accountId: 'acc-save',
    title: 'Signal Energy 205',
    merchant: 'Cafe 8',
    amount: 89.35,
    direction: 'debit',
    category: 'Shopping',
    status: 'pending',
    date: '2026-03-09',
    note: 'Reserve transfer 1',
    tag: 'shopping-2',
  },
  {
    id: 'txn-206',
    accountId: 'acc-travel',
    title: 'Vault Pharmacy 206',
    merchant: 'Atelier 9',
    amount: 102.7,
    direction: 'credit',
    category: 'Health',
    status: 'scheduled',
    date: '2026-03-10',
    note: 'Cashback settlement 2',
    tag: 'health-3',
  },
  {
    id: 'txn-207',
    accountId: 'acc-business',
    title: 'Ledger Terminal 207',
    merchant: 'Energy 1',
    amount: 115,
    direction: 'debit',
    category: 'Entertainment',
    status: 'booked',
    date: '2026-03-11',
    note: 'Subscription renewal 3',
    tag: 'entertainment-4',
  },
  {
    id: 'txn-208',
    accountId: 'acc-main',
    title: 'Delta Market 208',
    merchant: 'Grocer 2',
    amount: 128.35,
    direction: 'credit',
    category: 'Travel',
    status: 'pending',
    date: '2026-03-12',
    note: 'Priority route 4',
    tag: 'travel-5',
  },
  {
    id: 'txn-209',
    accountId: 'acc-save',
    title: 'Horizon Energy 209',
    merchant: 'Studio 3',
    amount: 141.7,
    direction: 'debit',
    category: 'Food',
    status: 'scheduled',
    date: '2026-03-13',
    note: 'Client settlement 5',
    tag: 'food-6',
  },
  {
    id: 'txn-210',
    accountId: 'acc-travel',
    title: 'Aurora Pharmacy 210',
    merchant: 'Pharmacy 4',
    amount: 156,
    direction: 'credit',
    category: 'Salary',
    status: 'booked',
    date: '2026-03-14',
    note: 'Daily spend 1',
    tag: 'salary-1',
  },
  {
    id: 'txn-211',
    accountId: 'acc-business',
    title: 'Atlas Terminal 211',
    merchant: 'Harbor 5',
    amount: 169.35,
    direction: 'debit',
    category: 'Bills',
    status: 'pending',
    date: '2026-03-15',
    note: 'Automated debit 2',
    tag: 'bills-2',
  },
  {
    id: 'txn-212',
    accountId: 'acc-main',
    title: 'Beacon Market 212',
    merchant: 'Cloud 6',
    amount: 182.7,
    direction: 'credit',
    category: 'Investing',
    status: 'scheduled',
    date: '2026-03-16',
    note: 'Foreign exchange hold 3',
    tag: 'investing-3',
  },
  {
    id: 'txn-213',
    accountId: 'acc-save',
    title: 'Summit Energy 213',
    merchant: 'Terminal 7',
    amount: 195,
    direction: 'debit',
    category: 'Shopping',
    status: 'booked',
    date: '2026-03-17',
    note: 'Reserve transfer 4',
    tag: 'shopping-4',
  },
  {
    id: 'txn-214',
    accountId: 'acc-travel',
    title: 'Reserve Pharmacy 214',
    merchant: 'Transit 8',
    amount: 208.35,
    direction: 'credit',
    category: 'Health',
    status: 'pending',
    date: '2026-03-18',
    note: 'Cashback settlement 5',
    tag: 'health-5',
  },
  {
    id: 'txn-215',
    accountId: 'acc-business',
    title: 'Signal Terminal 215',
    merchant: 'Cinema 9',
    amount: 221.7,
    direction: 'debit',
    category: 'Entertainment',
    status: 'scheduled',
    date: '2026-03-19',
    note: 'Subscription renewal 1',
    tag: 'entertainment-6',
  },
  {
    id: 'txn-216',
    accountId: 'acc-main',
    title: 'Vault Market 216',
    merchant: 'Market 1',
    amount: 234,
    direction: 'credit',
    category: 'Travel',
    status: 'booked',
    date: '2026-03-20',
    note: 'Priority route 2',
    tag: 'travel-1',
  },
  {
    id: 'txn-217',
    accountId: 'acc-save',
    title: 'Ledger Energy 217',
    merchant: 'Cafe 2',
    amount: 249.35,
    direction: 'debit',
    category: 'Food',
    status: 'pending',
    date: '2026-03-21',
    note: 'Client settlement 3',
    tag: 'food-2',
  },
  {
    id: 'txn-218',
    accountId: 'acc-travel',
    title: 'Delta Pharmacy 218',
    merchant: 'Atelier 3',
    amount: 262.7,
    direction: 'credit',
    category: 'Salary',
    status: 'scheduled',
    date: '2026-03-22',
    note: 'Daily spend 4',
    tag: 'salary-3',
  },
  {
    id: 'txn-219',
    accountId: 'acc-business',
    title: 'Horizon Terminal 219',
    merchant: 'Energy 4',
    amount: 275,
    direction: 'debit',
    category: 'Bills',
    status: 'booked',
    date: '2026-03-23',
    note: 'Automated debit 5',
    tag: 'bills-4',
  },
  {
    id: 'txn-220',
    accountId: 'acc-main',
    title: 'Aurora Market 220',
    merchant: 'Grocer 5',
    amount: 288.35,
    direction: 'credit',
    category: 'Investing',
    status: 'pending',
    date: '2026-03-24',
    note: 'Foreign exchange hold 1',
    tag: 'investing-5',
  },
  {
    id: 'txn-221',
    accountId: 'acc-save',
    title: 'Atlas Energy 221',
    merchant: 'Studio 6',
    amount: 80.7,
    direction: 'debit',
    category: 'Shopping',
    status: 'scheduled',
    date: '2026-03-25',
    note: 'Reserve transfer 2',
    tag: 'shopping-6',
  },
  {
    id: 'txn-222',
    accountId: 'acc-travel',
    title: 'Beacon Pharmacy 222',
    merchant: 'Pharmacy 7',
    amount: 93,
    direction: 'credit',
    category: 'Health',
    status: 'booked',
    date: '2026-03-26',
    note: 'Cashback settlement 3',
    tag: 'health-1',
  },
  {
    id: 'txn-223',
    accountId: 'acc-business',
    title: 'Summit Terminal 223',
    merchant: 'Harbor 8',
    amount: 106.35,
    direction: 'debit',
    category: 'Entertainment',
    status: 'pending',
    date: '2026-03-27',
    note: 'Subscription renewal 4',
    tag: 'entertainment-2',
  },
  {
    id: 'txn-224',
    accountId: 'acc-main',
    title: 'Reserve Market 224',
    merchant: 'Cloud 9',
    amount: 121.7,
    direction: 'credit',
    category: 'Travel',
    status: 'scheduled',
    date: '2026-03-28',
    note: 'Priority route 5',
    tag: 'travel-3',
  },
  {
    id: 'txn-225',
    accountId: 'acc-save',
    title: 'Signal Energy 225',
    merchant: 'Terminal 1',
    amount: 134,
    direction: 'debit',
    category: 'Food',
    status: 'booked',
    date: '2026-03-01',
    note: 'Client settlement 1',
    tag: 'food-4',
  },
  {
    id: 'txn-226',
    accountId: 'acc-travel',
    title: 'Vault Pharmacy 226',
    merchant: 'Transit 2',
    amount: 147.35,
    direction: 'credit',
    category: 'Salary',
    status: 'pending',
    date: '2026-03-02',
    note: 'Daily spend 2',
    tag: 'salary-5',
  },
  {
    id: 'txn-227',
    accountId: 'acc-business',
    title: 'Ledger Terminal 227',
    merchant: 'Cinema 3',
    amount: 160.7,
    direction: 'debit',
    category: 'Bills',
    status: 'scheduled',
    date: '2026-03-03',
    note: 'Automated debit 3',
    tag: 'bills-6',
  },
  {
    id: 'txn-228',
    accountId: 'acc-main',
    title: 'Delta Market 228',
    merchant: 'Market 4',
    amount: 173,
    direction: 'credit',
    category: 'Investing',
    status: 'booked',
    date: '2026-03-04',
    note: 'Foreign exchange hold 4',
    tag: 'investing-1',
  },
  {
    id: 'txn-229',
    accountId: 'acc-save',
    title: 'Horizon Energy 229',
    merchant: 'Cafe 5',
    amount: 186.35,
    direction: 'debit',
    category: 'Shopping',
    status: 'pending',
    date: '2026-03-05',
    note: 'Reserve transfer 5',
    tag: 'shopping-2',
  },
  {
    id: 'txn-230',
    accountId: 'acc-travel',
    title: 'Aurora Pharmacy 230',
    merchant: 'Atelier 6',
    amount: 199.7,
    direction: 'credit',
    category: 'Health',
    status: 'scheduled',
    date: '2026-03-06',
    note: 'Cashback settlement 1',
    tag: 'health-3',
  },
  {
    id: 'txn-231',
    accountId: 'acc-business',
    title: 'Atlas Terminal 231',
    merchant: 'Energy 7',
    amount: 214,
    direction: 'debit',
    category: 'Entertainment',
    status: 'booked',
    date: '2026-03-07',
    note: 'Subscription renewal 2',
    tag: 'entertainment-4',
  },
  {
    id: 'txn-232',
    accountId: 'acc-main',
    title: 'Beacon Market 232',
    merchant: 'Grocer 8',
    amount: 227.35,
    direction: 'credit',
    category: 'Travel',
    status: 'pending',
    date: '2026-03-08',
    note: 'Priority route 3',
    tag: 'travel-5',
  },
  {
    id: 'txn-233',
    accountId: 'acc-save',
    title: 'Summit Energy 233',
    merchant: 'Studio 9',
    amount: 240.7,
    direction: 'debit',
    category: 'Food',
    status: 'scheduled',
    date: '2026-03-09',
    note: 'Client settlement 4',
    tag: 'food-6',
  },
  {
    id: 'txn-234',
    accountId: 'acc-travel',
    title: 'Reserve Pharmacy 234',
    merchant: 'Pharmacy 1',
    amount: 253,
    direction: 'credit',
    category: 'Salary',
    status: 'booked',
    date: '2026-03-10',
    note: 'Daily spend 5',
    tag: 'salary-1',
  },
  {
    id: 'txn-235',
    accountId: 'acc-business',
    title: 'Signal Terminal 235',
    merchant: 'Harbor 2',
    amount: 266.35,
    direction: 'debit',
    category: 'Bills',
    status: 'pending',
    date: '2026-03-11',
    note: 'Automated debit 1',
    tag: 'bills-2',
  },
  {
    id: 'txn-236',
    accountId: 'acc-main',
    title: 'Vault Market 236',
    merchant: 'Cloud 3',
    amount: 279.7,
    direction: 'credit',
    category: 'Investing',
    status: 'scheduled',
    date: '2026-03-12',
    note: 'Foreign exchange hold 2',
    tag: 'investing-3',
  },
  {
    id: 'txn-237',
    accountId: 'acc-save',
    title: 'Ledger Energy 237',
    merchant: 'Terminal 4',
    amount: 292,
    direction: 'debit',
    category: 'Shopping',
    status: 'booked',
    date: '2026-03-13',
    note: 'Reserve transfer 3',
    tag: 'shopping-4',
  },
  {
    id: 'txn-238',
    accountId: 'acc-travel',
    title: 'Delta Pharmacy 238',
    merchant: 'Transit 5',
    amount: 86.35,
    direction: 'credit',
    category: 'Health',
    status: 'pending',
    date: '2026-03-14',
    note: 'Cashback settlement 4',
    tag: 'health-5',
  },
  {
    id: 'txn-239',
    accountId: 'acc-business',
    title: 'Horizon Terminal 239',
    merchant: 'Cinema 6',
    amount: 99.7,
    direction: 'debit',
    category: 'Entertainment',
    status: 'scheduled',
    date: '2026-03-15',
    note: 'Subscription renewal 5',
    tag: 'entertainment-6',
  },
  {
    id: 'txn-240',
    accountId: 'acc-main',
    title: 'Aurora Market 240',
    merchant: 'Market 7',
    amount: 112,
    direction: 'credit',
    category: 'Travel',
    status: 'booked',
    date: '2026-03-16',
    note: 'Priority route 1',
    tag: 'travel-1',
  },
  {
    id: 'txn-241',
    accountId: 'acc-save',
    title: 'Atlas Energy 241',
    merchant: 'Cafe 8',
    amount: 125.35,
    direction: 'debit',
    category: 'Food',
    status: 'pending',
    date: '2026-03-17',
    note: 'Client settlement 2',
    tag: 'food-2',
  },
  {
    id: 'txn-242',
    accountId: 'acc-travel',
    title: 'Beacon Pharmacy 242',
    merchant: 'Atelier 9',
    amount: 138.7,
    direction: 'credit',
    category: 'Salary',
    status: 'scheduled',
    date: '2026-03-18',
    note: 'Daily spend 3',
    tag: 'salary-3',
  },
  {
    id: 'txn-243',
    accountId: 'acc-business',
    title: 'Summit Terminal 243',
    merchant: 'Energy 1',
    amount: 151,
    direction: 'debit',
    category: 'Bills',
    status: 'booked',
    date: '2026-03-19',
    note: 'Automated debit 4',
    tag: 'bills-4',
  },
  {
    id: 'txn-244',
    accountId: 'acc-main',
    title: 'Reserve Market 244',
    merchant: 'Grocer 2',
    amount: 164.35,
    direction: 'credit',
    category: 'Investing',
    status: 'pending',
    date: '2026-03-20',
    note: 'Foreign exchange hold 5',
    tag: 'investing-5',
  },
  {
    id: 'txn-245',
    accountId: 'acc-save',
    title: 'Signal Energy 245',
    merchant: 'Studio 3',
    amount: 179.7,
    direction: 'debit',
    category: 'Shopping',
    status: 'scheduled',
    date: '2026-03-21',
    note: 'Reserve transfer 1',
    tag: 'shopping-6',
  },
  {
    id: 'txn-246',
    accountId: 'acc-travel',
    title: 'Vault Pharmacy 246',
    merchant: 'Pharmacy 4',
    amount: 192,
    direction: 'credit',
    category: 'Health',
    status: 'booked',
    date: '2026-03-22',
    note: 'Cashback settlement 2',
    tag: 'health-1',
  },
  {
    id: 'txn-247',
    accountId: 'acc-business',
    title: 'Ledger Terminal 247',
    merchant: 'Harbor 5',
    amount: 205.35,
    direction: 'debit',
    category: 'Entertainment',
    status: 'pending',
    date: '2026-03-23',
    note: 'Subscription renewal 3',
    tag: 'entertainment-2',
  },
  {
    id: 'txn-248',
    accountId: 'acc-main',
    title: 'Delta Market 248',
    merchant: 'Cloud 6',
    amount: 218.7,
    direction: 'credit',
    category: 'Travel',
    status: 'scheduled',
    date: '2026-03-24',
    note: 'Priority route 4',
    tag: 'travel-3',
  },
  {
    id: 'txn-249',
    accountId: 'acc-save',
    title: 'Horizon Energy 249',
    merchant: 'Terminal 7',
    amount: 231,
    direction: 'debit',
    category: 'Food',
    status: 'booked',
    date: '2026-03-25',
    note: 'Client settlement 5',
    tag: 'food-4',
  },
  {
    id: 'txn-250',
    accountId: 'acc-travel',
    title: 'Aurora Pharmacy 250',
    merchant: 'Transit 8',
    amount: 244.35,
    direction: 'credit',
    category: 'Salary',
    status: 'pending',
    date: '2026-03-26',
    note: 'Daily spend 1',
    tag: 'salary-5',
  },
  {
    id: 'txn-251',
    accountId: 'acc-business',
    title: 'Atlas Terminal 251',
    merchant: 'Cinema 9',
    amount: 257.7,
    direction: 'debit',
    category: 'Bills',
    status: 'scheduled',
    date: '2026-03-27',
    note: 'Automated debit 2',
    tag: 'bills-6',
  },
  {
    id: 'txn-252',
    accountId: 'acc-main',
    title: 'Beacon Market 252',
    merchant: 'Market 1',
    amount: 272,
    direction: 'credit',
    category: 'Investing',
    status: 'booked',
    date: '2026-03-28',
    note: 'Foreign exchange hold 3',
    tag: 'investing-1',
  },
  {
    id: 'txn-253',
    accountId: 'acc-save',
    title: 'Summit Energy 253',
    merchant: 'Cafe 2',
    amount: 285.35,
    direction: 'debit',
    category: 'Shopping',
    status: 'pending',
    date: '2026-03-01',
    note: 'Reserve transfer 4',
    tag: 'shopping-2',
  },
  {
    id: 'txn-254',
    accountId: 'acc-travel',
    title: 'Reserve Pharmacy 254',
    merchant: 'Atelier 3',
    amount: 298.7,
    direction: 'credit',
    category: 'Health',
    status: 'scheduled',
    date: '2026-03-02',
    note: 'Cashback settlement 5',
    tag: 'health-3',
  },
  {
    id: 'txn-255',
    accountId: 'acc-business',
    title: 'Signal Terminal 255',
    merchant: 'Energy 4',
    amount: 90,
    direction: 'debit',
    category: 'Entertainment',
    status: 'booked',
    date: '2026-03-03',
    note: 'Subscription renewal 1',
    tag: 'entertainment-4',
  },
  {
    id: 'txn-256',
    accountId: 'acc-main',
    title: 'Vault Market 256',
    merchant: 'Grocer 5',
    amount: 103.35,
    direction: 'credit',
    category: 'Travel',
    status: 'pending',
    date: '2026-03-04',
    note: 'Priority route 2',
    tag: 'travel-5',
  },
  {
    id: 'txn-257',
    accountId: 'acc-save',
    title: 'Ledger Energy 257',
    merchant: 'Studio 6',
    amount: 116.7,
    direction: 'debit',
    category: 'Food',
    status: 'scheduled',
    date: '2026-03-05',
    note: 'Client settlement 3',
    tag: 'food-6',
  },
  {
    id: 'txn-258',
    accountId: 'acc-travel',
    title: 'Delta Pharmacy 258',
    merchant: 'Pharmacy 7',
    amount: 129,
    direction: 'credit',
    category: 'Salary',
    status: 'booked',
    date: '2026-03-06',
    note: 'Daily spend 4',
    tag: 'salary-1',
  },
  {
    id: 'txn-259',
    accountId: 'acc-business',
    title: 'Horizon Terminal 259',
    merchant: 'Harbor 8',
    amount: 144.35,
    direction: 'debit',
    category: 'Bills',
    status: 'pending',
    date: '2026-03-07',
    note: 'Automated debit 5',
    tag: 'bills-2',
  },
  {
    id: 'txn-260',
    accountId: 'acc-main',
    title: 'Aurora Market 260',
    merchant: 'Cloud 9',
    amount: 157.7,
    direction: 'credit',
    category: 'Investing',
    status: 'scheduled',
    date: '2026-03-08',
    note: 'Foreign exchange hold 1',
    tag: 'investing-3',
  },
  {
    id: 'txn-261',
    accountId: 'acc-save',
    title: 'Atlas Energy 261',
    merchant: 'Terminal 1',
    amount: 170,
    direction: 'debit',
    category: 'Shopping',
    status: 'booked',
    date: '2026-03-09',
    note: 'Reserve transfer 2',
    tag: 'shopping-4',
  },
  {
    id: 'txn-262',
    accountId: 'acc-travel',
    title: 'Beacon Pharmacy 262',
    merchant: 'Transit 2',
    amount: 183.35,
    direction: 'credit',
    category: 'Health',
    status: 'pending',
    date: '2026-03-10',
    note: 'Cashback settlement 3',
    tag: 'health-5',
  },
  {
    id: 'txn-263',
    accountId: 'acc-business',
    title: 'Summit Terminal 263',
    merchant: 'Cinema 3',
    amount: 196.7,
    direction: 'debit',
    category: 'Entertainment',
    status: 'scheduled',
    date: '2026-03-11',
    note: 'Subscription renewal 4',
    tag: 'entertainment-6',
  },
  {
    id: 'txn-264',
    accountId: 'acc-main',
    title: 'Reserve Market 264',
    merchant: 'Market 4',
    amount: 209,
    direction: 'credit',
    category: 'Travel',
    status: 'booked',
    date: '2026-03-12',
    note: 'Priority route 5',
    tag: 'travel-1',
  },
  {
    id: 'txn-265',
    accountId: 'acc-save',
    title: 'Signal Energy 265',
    merchant: 'Cafe 5',
    amount: 222.35,
    direction: 'debit',
    category: 'Food',
    status: 'pending',
    date: '2026-03-13',
    note: 'Client settlement 1',
    tag: 'food-2',
  },
  {
    id: 'txn-266',
    accountId: 'acc-travel',
    title: 'Vault Pharmacy 266',
    merchant: 'Atelier 6',
    amount: 237.7,
    direction: 'credit',
    category: 'Salary',
    status: 'scheduled',
    date: '2026-03-14',
    note: 'Daily spend 2',
    tag: 'salary-3',
  },
  {
    id: 'txn-267',
    accountId: 'acc-business',
    title: 'Ledger Terminal 267',
    merchant: 'Energy 7',
    amount: 250,
    direction: 'debit',
    category: 'Bills',
    status: 'booked',
    date: '2026-03-15',
    note: 'Automated debit 3',
    tag: 'bills-4',
  },
  {
    id: 'txn-268',
    accountId: 'acc-main',
    title: 'Delta Market 268',
    merchant: 'Grocer 8',
    amount: 263.35,
    direction: 'credit',
    category: 'Investing',
    status: 'pending',
    date: '2026-03-16',
    note: 'Foreign exchange hold 4',
    tag: 'investing-5',
  },
  {
    id: 'txn-269',
    accountId: 'acc-save',
    title: 'Horizon Energy 269',
    merchant: 'Studio 9',
    amount: 276.7,
    direction: 'debit',
    category: 'Shopping',
    status: 'scheduled',
    date: '2026-03-17',
    note: 'Reserve transfer 5',
    tag: 'shopping-6',
  },
  {
    id: 'txn-270',
    accountId: 'acc-travel',
    title: 'Aurora Pharmacy 270',
    merchant: 'Pharmacy 1',
    amount: 289,
    direction: 'credit',
    category: 'Health',
    status: 'booked',
    date: '2026-03-18',
    note: 'Cashback settlement 1',
    tag: 'health-1',
  },
  {
    id: 'txn-271',
    accountId: 'acc-business',
    title: 'Atlas Terminal 271',
    merchant: 'Harbor 2',
    amount: 302.35,
    direction: 'debit',
    category: 'Entertainment',
    status: 'pending',
    date: '2026-03-19',
    note: 'Subscription renewal 2',
    tag: 'entertainment-2',
  },
  {
    id: 'txn-272',
    accountId: 'acc-main',
    title: 'Beacon Market 272',
    merchant: 'Cloud 3',
    amount: 94.7,
    direction: 'credit',
    category: 'Travel',
    status: 'scheduled',
    date: '2026-03-20',
    note: 'Priority route 3',
    tag: 'travel-3',
  },
  {
    id: 'txn-273',
    accountId: 'acc-save',
    title: 'Summit Energy 273',
    merchant: 'Terminal 4',
    amount: 109,
    direction: 'debit',
    category: 'Food',
    status: 'booked',
    date: '2026-03-21',
    note: 'Client settlement 4',
    tag: 'food-4',
  },
  {
    id: 'txn-274',
    accountId: 'acc-travel',
    title: 'Reserve Pharmacy 274',
    merchant: 'Transit 5',
    amount: 122.35,
    direction: 'credit',
    category: 'Salary',
    status: 'pending',
    date: '2026-03-22',
    note: 'Daily spend 5',
    tag: 'salary-5',
  },
  {
    id: 'txn-275',
    accountId: 'acc-business',
    title: 'Signal Terminal 275',
    merchant: 'Cinema 6',
    amount: 135.7,
    direction: 'debit',
    category: 'Bills',
    status: 'scheduled',
    date: '2026-03-23',
    note: 'Automated debit 1',
    tag: 'bills-6',
  },
  {
    id: 'txn-276',
    accountId: 'acc-main',
    title: 'Vault Market 276',
    merchant: 'Market 7',
    amount: 148,
    direction: 'credit',
    category: 'Investing',
    status: 'booked',
    date: '2026-03-24',
    note: 'Foreign exchange hold 2',
    tag: 'investing-1',
  },
  {
    id: 'txn-277',
    accountId: 'acc-save',
    title: 'Ledger Energy 277',
    merchant: 'Cafe 8',
    amount: 161.35,
    direction: 'debit',
    category: 'Shopping',
    status: 'pending',
    date: '2026-03-25',
    note: 'Reserve transfer 3',
    tag: 'shopping-2',
  },
  {
    id: 'txn-278',
    accountId: 'acc-travel',
    title: 'Delta Pharmacy 278',
    merchant: 'Atelier 9',
    amount: 174.7,
    direction: 'credit',
    category: 'Health',
    status: 'scheduled',
    date: '2026-03-26',
    note: 'Cashback settlement 4',
    tag: 'health-3',
  },
  {
    id: 'txn-279',
    accountId: 'acc-business',
    title: 'Horizon Terminal 279',
    merchant: 'Energy 1',
    amount: 187,
    direction: 'debit',
    category: 'Entertainment',
    status: 'booked',
    date: '2026-03-27',
    note: 'Subscription renewal 5',
    tag: 'entertainment-4',
  },
  {
    id: 'txn-280',
    accountId: 'acc-main',
    title: 'Aurora Market 280',
    merchant: 'Grocer 2',
    amount: 202.35,
    direction: 'credit',
    category: 'Travel',
    status: 'pending',
    date: '2026-03-28',
    note: 'Priority route 1',
    tag: 'travel-5',
  },
  {
    id: 'txn-281',
    accountId: 'acc-save',
    title: 'Atlas Energy 281',
    merchant: 'Studio 3',
    amount: 215.7,
    direction: 'debit',
    category: 'Food',
    status: 'scheduled',
    date: '2026-03-01',
    note: 'Client settlement 2',
    tag: 'food-6',
  },
  {
    id: 'txn-282',
    accountId: 'acc-travel',
    title: 'Beacon Pharmacy 282',
    merchant: 'Pharmacy 4',
    amount: 228,
    direction: 'credit',
    category: 'Salary',
    status: 'booked',
    date: '2026-03-02',
    note: 'Daily spend 3',
    tag: 'salary-1',
  },
  {
    id: 'txn-283',
    accountId: 'acc-business',
    title: 'Summit Terminal 283',
    merchant: 'Harbor 5',
    amount: 241.35,
    direction: 'debit',
    category: 'Bills',
    status: 'pending',
    date: '2026-03-03',
    note: 'Automated debit 4',
    tag: 'bills-2',
  },
  {
    id: 'txn-284',
    accountId: 'acc-main',
    title: 'Reserve Market 284',
    merchant: 'Cloud 6',
    amount: 254.7,
    direction: 'credit',
    category: 'Investing',
    status: 'scheduled',
    date: '2026-03-04',
    note: 'Foreign exchange hold 5',
    tag: 'investing-3',
  },
  {
    id: 'txn-285',
    accountId: 'acc-save',
    title: 'Signal Energy 285',
    merchant: 'Terminal 7',
    amount: 267,
    direction: 'debit',
    category: 'Shopping',
    status: 'booked',
    date: '2026-03-05',
    note: 'Reserve transfer 1',
    tag: 'shopping-4',
  },
  {
    id: 'txn-286',
    accountId: 'acc-travel',
    title: 'Vault Pharmacy 286',
    merchant: 'Transit 8',
    amount: 280.35,
    direction: 'credit',
    category: 'Health',
    status: 'pending',
    date: '2026-03-06',
    note: 'Cashback settlement 2',
    tag: 'health-5',
  },
  {
    id: 'txn-287',
    accountId: 'acc-business',
    title: 'Ledger Terminal 287',
    merchant: 'Cinema 9',
    amount: 295.7,
    direction: 'debit',
    category: 'Entertainment',
    status: 'scheduled',
    date: '2026-03-07',
    note: 'Subscription renewal 3',
    tag: 'entertainment-6',
  },
  {
    id: 'txn-288',
    accountId: 'acc-main',
    title: 'Delta Market 288',
    merchant: 'Market 1',
    amount: 308,
    direction: 'credit',
    category: 'Travel',
    status: 'booked',
    date: '2026-03-08',
    note: 'Priority route 4',
    tag: 'travel-1',
  },
  {
    id: 'txn-289',
    accountId: 'acc-save',
    title: 'Horizon Energy 289',
    merchant: 'Cafe 2',
    amount: 100.35,
    direction: 'debit',
    category: 'Food',
    status: 'pending',
    date: '2026-03-09',
    note: 'Client settlement 5',
    tag: 'food-2',
  },
  {
    id: 'txn-290',
    accountId: 'acc-travel',
    title: 'Aurora Pharmacy 290',
    merchant: 'Atelier 3',
    amount: 113.7,
    direction: 'credit',
    category: 'Salary',
    status: 'scheduled',
    date: '2026-03-10',
    note: 'Daily spend 1',
    tag: 'salary-3',
  },
  {
    id: 'txn-291',
    accountId: 'acc-business',
    title: 'Atlas Terminal 291',
    merchant: 'Energy 4',
    amount: 126,
    direction: 'debit',
    category: 'Bills',
    status: 'booked',
    date: '2026-03-11',
    note: 'Automated debit 2',
    tag: 'bills-4',
  },
  {
    id: 'txn-292',
    accountId: 'acc-main',
    title: 'Beacon Market 292',
    merchant: 'Grocer 5',
    amount: 139.35,
    direction: 'credit',
    category: 'Investing',
    status: 'pending',
    date: '2026-03-12',
    note: 'Foreign exchange hold 3',
    tag: 'investing-5',
  },
  {
    id: 'txn-293',
    accountId: 'acc-save',
    title: 'Summit Energy 293',
    merchant: 'Studio 6',
    amount: 152.7,
    direction: 'debit',
    category: 'Shopping',
    status: 'scheduled',
    date: '2026-03-13',
    note: 'Reserve transfer 4',
    tag: 'shopping-6',
  },
  {
    id: 'txn-294',
    accountId: 'acc-travel',
    title: 'Reserve Pharmacy 294',
    merchant: 'Pharmacy 7',
    amount: 167,
    direction: 'credit',
    category: 'Health',
    status: 'booked',
    date: '2026-03-14',
    note: 'Cashback settlement 5',
    tag: 'health-1',
  },
  {
    id: 'txn-295',
    accountId: 'acc-business',
    title: 'Signal Terminal 295',
    merchant: 'Harbor 8',
    amount: 180.35,
    direction: 'debit',
    category: 'Entertainment',
    status: 'pending',
    date: '2026-03-15',
    note: 'Subscription renewal 1',
    tag: 'entertainment-2',
  },
  {
    id: 'txn-296',
    accountId: 'acc-main',
    title: 'Vault Market 296',
    merchant: 'Cloud 9',
    amount: 193.7,
    direction: 'credit',
    category: 'Travel',
    status: 'scheduled',
    date: '2026-03-16',
    note: 'Priority route 2',
    tag: 'travel-3',
  },
  {
    id: 'txn-297',
    accountId: 'acc-save',
    title: 'Ledger Energy 297',
    merchant: 'Terminal 1',
    amount: 206,
    direction: 'debit',
    category: 'Food',
    status: 'booked',
    date: '2026-03-17',
    note: 'Client settlement 3',
    tag: 'food-4',
  },
  {
    id: 'txn-298',
    accountId: 'acc-travel',
    title: 'Delta Pharmacy 298',
    merchant: 'Transit 2',
    amount: 219.35,
    direction: 'credit',
    category: 'Salary',
    status: 'pending',
    date: '2026-03-18',
    note: 'Daily spend 4',
    tag: 'salary-5',
  },
  {
    id: 'txn-299',
    accountId: 'acc-business',
    title: 'Horizon Terminal 299',
    merchant: 'Cinema 3',
    amount: 232.7,
    direction: 'debit',
    category: 'Bills',
    status: 'scheduled',
    date: '2026-03-19',
    note: 'Automated debit 5',
    tag: 'bills-6',
  },
  {
    id: 'txn-300',
    accountId: 'acc-main',
    title: 'Aurora Market 300',
    merchant: 'Market 4',
    amount: 245,
    direction: 'credit',
    category: 'Investing',
    status: 'booked',
    date: '2026-03-20',
    note: 'Foreign exchange hold 1',
    tag: 'investing-1',
  },
  {
    id: 'txn-301',
    accountId: 'acc-save',
    title: 'Atlas Energy 301',
    merchant: 'Cafe 5',
    amount: 260.35,
    direction: 'debit',
    category: 'Shopping',
    status: 'pending',
    date: '2026-03-21',
    note: 'Reserve transfer 2',
    tag: 'shopping-2',
  },
  {
    id: 'txn-302',
    accountId: 'acc-travel',
    title: 'Beacon Pharmacy 302',
    merchant: 'Atelier 6',
    amount: 273.7,
    direction: 'credit',
    category: 'Health',
    status: 'scheduled',
    date: '2026-03-22',
    note: 'Cashback settlement 3',
    tag: 'health-3',
  },
  {
    id: 'txn-303',
    accountId: 'acc-business',
    title: 'Summit Terminal 303',
    merchant: 'Energy 7',
    amount: 286,
    direction: 'debit',
    category: 'Entertainment',
    status: 'booked',
    date: '2026-03-23',
    note: 'Subscription renewal 4',
    tag: 'entertainment-4',
  },
  {
    id: 'txn-304',
    accountId: 'acc-main',
    title: 'Reserve Market 304',
    merchant: 'Grocer 8',
    amount: 299.35,
    direction: 'credit',
    category: 'Travel',
    status: 'pending',
    date: '2026-03-24',
    note: 'Priority route 5',
    tag: 'travel-5',
  },
  {
    id: 'txn-305',
    accountId: 'acc-save',
    title: 'Signal Energy 305',
    merchant: 'Studio 9',
    amount: 312.7,
    direction: 'debit',
    category: 'Food',
    status: 'scheduled',
    date: '2026-03-25',
    note: 'Client settlement 1',
    tag: 'food-6',
  },
  {
    id: 'txn-306',
    accountId: 'acc-travel',
    title: 'Vault Pharmacy 306',
    merchant: 'Pharmacy 1',
    amount: 104,
    direction: 'credit',
    category: 'Salary',
    status: 'booked',
    date: '2026-03-26',
    note: 'Daily spend 2',
    tag: 'salary-1',
  },
  {
    id: 'txn-307',
    accountId: 'acc-business',
    title: 'Ledger Terminal 307',
    merchant: 'Harbor 2',
    amount: 117.35,
    direction: 'debit',
    category: 'Bills',
    status: 'pending',
    date: '2026-03-27',
    note: 'Automated debit 3',
    tag: 'bills-2',
  },
  {
    id: 'txn-308',
    accountId: 'acc-main',
    title: 'Delta Market 308',
    merchant: 'Cloud 3',
    amount: 132.7,
    direction: 'credit',
    category: 'Investing',
    status: 'scheduled',
    date: '2026-03-28',
    note: 'Foreign exchange hold 4',
    tag: 'investing-3',
  },
  {
    id: 'txn-309',
    accountId: 'acc-save',
    title: 'Horizon Energy 309',
    merchant: 'Terminal 4',
    amount: 145,
    direction: 'debit',
    category: 'Shopping',
    status: 'booked',
    date: '2026-03-01',
    note: 'Reserve transfer 5',
    tag: 'shopping-4',
  },
  {
    id: 'txn-310',
    accountId: 'acc-travel',
    title: 'Aurora Pharmacy 310',
    merchant: 'Transit 5',
    amount: 158.35,
    direction: 'credit',
    category: 'Health',
    status: 'pending',
    date: '2026-03-02',
    note: 'Cashback settlement 1',
    tag: 'health-5',
  },
  {
    id: 'txn-311',
    accountId: 'acc-business',
    title: 'Atlas Terminal 311',
    merchant: 'Cinema 6',
    amount: 171.7,
    direction: 'debit',
    category: 'Entertainment',
    status: 'scheduled',
    date: '2026-03-03',
    note: 'Subscription renewal 2',
    tag: 'entertainment-6',
  },
  {
    id: 'txn-312',
    accountId: 'acc-main',
    title: 'Beacon Market 312',
    merchant: 'Market 7',
    amount: 184,
    direction: 'credit',
    category: 'Travel',
    status: 'booked',
    date: '2026-03-04',
    note: 'Priority route 3',
    tag: 'travel-1',
  },
  {
    id: 'txn-313',
    accountId: 'acc-save',
    title: 'Summit Energy 313',
    merchant: 'Cafe 8',
    amount: 197.35,
    direction: 'debit',
    category: 'Food',
    status: 'pending',
    date: '2026-03-05',
    note: 'Client settlement 4',
    tag: 'food-2',
  },
  {
    id: 'txn-314',
    accountId: 'acc-travel',
    title: 'Reserve Pharmacy 314',
    merchant: 'Atelier 9',
    amount: 210.7,
    direction: 'credit',
    category: 'Salary',
    status: 'scheduled',
    date: '2026-03-06',
    note: 'Daily spend 5',
    tag: 'salary-3',
  },
  {
    id: 'txn-315',
    accountId: 'acc-business',
    title: 'Signal Terminal 315',
    merchant: 'Energy 1',
    amount: 225,
    direction: 'debit',
    category: 'Bills',
    status: 'booked',
    date: '2026-03-07',
    note: 'Automated debit 1',
    tag: 'bills-4',
  },
  {
    id: 'txn-316',
    accountId: 'acc-main',
    title: 'Vault Market 316',
    merchant: 'Grocer 2',
    amount: 238.35,
    direction: 'credit',
    category: 'Investing',
    status: 'pending',
    date: '2026-03-08',
    note: 'Foreign exchange hold 2',
    tag: 'investing-5',
  },
  {
    id: 'txn-317',
    accountId: 'acc-save',
    title: 'Ledger Energy 317',
    merchant: 'Studio 3',
    amount: 251.7,
    direction: 'debit',
    category: 'Shopping',
    status: 'scheduled',
    date: '2026-03-09',
    note: 'Reserve transfer 3',
    tag: 'shopping-6',
  },
  {
    id: 'txn-318',
    accountId: 'acc-travel',
    title: 'Delta Pharmacy 318',
    merchant: 'Pharmacy 4',
    amount: 264,
    direction: 'credit',
    category: 'Health',
    status: 'booked',
    date: '2026-03-10',
    note: 'Cashback settlement 4',
    tag: 'health-1',
  },
  {
    id: 'txn-319',
    accountId: 'acc-business',
    title: 'Horizon Terminal 319',
    merchant: 'Harbor 5',
    amount: 277.35,
    direction: 'debit',
    category: 'Entertainment',
    status: 'pending',
    date: '2026-03-11',
    note: 'Subscription renewal 5',
    tag: 'entertainment-2',
  },
  {
    id: 'txn-320',
    accountId: 'acc-main',
    title: 'Aurora Market 320',
    merchant: 'Cloud 6',
    amount: 290.7,
    direction: 'credit',
    category: 'Travel',
    status: 'scheduled',
    date: '2026-03-12',
    note: 'Priority route 1',
    tag: 'travel-3',
  },
  {
    id: 'txn-321',
    accountId: 'acc-save',
    title: 'Atlas Energy 321',
    merchant: 'Terminal 7',
    amount: 303,
    direction: 'debit',
    category: 'Food',
    status: 'booked',
    date: '2026-03-13',
    note: 'Client settlement 2',
    tag: 'food-4',
  },
  {
    id: 'txn-322',
    accountId: 'acc-travel',
    title: 'Beacon Pharmacy 322',
    merchant: 'Transit 8',
    amount: 318.35,
    direction: 'credit',
    category: 'Salary',
    status: 'pending',
    date: '2026-03-14',
    note: 'Daily spend 3',
    tag: 'salary-5',
  },
  {
    id: 'txn-323',
    accountId: 'acc-business',
    title: 'Summit Terminal 323',
    merchant: 'Cinema 9',
    amount: 110.7,
    direction: 'debit',
    category: 'Bills',
    status: 'scheduled',
    date: '2026-03-15',
    note: 'Automated debit 4',
    tag: 'bills-6',
  },
  {
    id: 'txn-324',
    accountId: 'acc-main',
    title: 'Reserve Market 324',
    merchant: 'Market 1',
    amount: 123,
    direction: 'credit',
    category: 'Investing',
    status: 'booked',
    date: '2026-03-16',
    note: 'Foreign exchange hold 5',
    tag: 'investing-1',
  },
  {
    id: 'txn-325',
    accountId: 'acc-save',
    title: 'Signal Energy 325',
    merchant: 'Cafe 2',
    amount: 136.35,
    direction: 'debit',
    category: 'Shopping',
    status: 'pending',
    date: '2026-03-17',
    note: 'Reserve transfer 1',
    tag: 'shopping-2',
  },
  {
    id: 'txn-326',
    accountId: 'acc-travel',
    title: 'Vault Pharmacy 326',
    merchant: 'Atelier 3',
    amount: 149.7,
    direction: 'credit',
    category: 'Health',
    status: 'scheduled',
    date: '2026-03-18',
    note: 'Cashback settlement 2',
    tag: 'health-3',
  },
  {
    id: 'txn-327',
    accountId: 'acc-business',
    title: 'Ledger Terminal 327',
    merchant: 'Energy 4',
    amount: 162,
    direction: 'debit',
    category: 'Entertainment',
    status: 'booked',
    date: '2026-03-19',
    note: 'Subscription renewal 3',
    tag: 'entertainment-4',
  },
  {
    id: 'txn-328',
    accountId: 'acc-main',
    title: 'Delta Market 328',
    merchant: 'Grocer 5',
    amount: 175.35,
    direction: 'credit',
    category: 'Travel',
    status: 'pending',
    date: '2026-03-20',
    note: 'Priority route 4',
    tag: 'travel-5',
  },
  {
    id: 'txn-329',
    accountId: 'acc-save',
    title: 'Horizon Energy 329',
    merchant: 'Studio 6',
    amount: 190.7,
    direction: 'debit',
    category: 'Food',
    status: 'scheduled',
    date: '2026-03-21',
    note: 'Client settlement 5',
    tag: 'food-6',
  },
  {
    id: 'txn-330',
    accountId: 'acc-travel',
    title: 'Aurora Pharmacy 330',
    merchant: 'Pharmacy 7',
    amount: 203,
    direction: 'credit',
    category: 'Salary',
    status: 'booked',
    date: '2026-03-22',
    note: 'Daily spend 1',
    tag: 'salary-1',
  },
  {
    id: 'txn-331',
    accountId: 'acc-business',
    title: 'Atlas Terminal 331',
    merchant: 'Harbor 8',
    amount: 216.35,
    direction: 'debit',
    category: 'Bills',
    status: 'pending',
    date: '2026-03-23',
    note: 'Automated debit 2',
    tag: 'bills-2',
  },
  {
    id: 'txn-332',
    accountId: 'acc-main',
    title: 'Beacon Market 332',
    merchant: 'Cloud 9',
    amount: 229.7,
    direction: 'credit',
    category: 'Investing',
    status: 'scheduled',
    date: '2026-03-24',
    note: 'Foreign exchange hold 3',
    tag: 'investing-3',
  },
  {
    id: 'txn-333',
    accountId: 'acc-save',
    title: 'Summit Energy 333',
    merchant: 'Terminal 1',
    amount: 242,
    direction: 'debit',
    category: 'Shopping',
    status: 'booked',
    date: '2026-03-25',
    note: 'Reserve transfer 4',
    tag: 'shopping-4',
  },
  {
    id: 'txn-334',
    accountId: 'acc-travel',
    title: 'Reserve Pharmacy 334',
    merchant: 'Transit 2',
    amount: 255.35,
    direction: 'credit',
    category: 'Health',
    status: 'pending',
    date: '2026-03-26',
    note: 'Cashback settlement 5',
    tag: 'health-5',
  },
  {
    id: 'txn-335',
    accountId: 'acc-business',
    title: 'Signal Terminal 335',
    merchant: 'Cinema 3',
    amount: 268.7,
    direction: 'debit',
    category: 'Entertainment',
    status: 'scheduled',
    date: '2026-03-27',
    note: 'Subscription renewal 1',
    tag: 'entertainment-6',
  },
  {
    id: 'txn-336',
    accountId: 'acc-main',
    title: 'Vault Market 336',
    merchant: 'Market 4',
    amount: 283,
    direction: 'credit',
    category: 'Travel',
    status: 'booked',
    date: '2026-03-28',
    note: 'Priority route 2',
    tag: 'travel-1',
  },
  {
    id: 'txn-337',
    accountId: 'acc-save',
    title: 'Ledger Energy 337',
    merchant: 'Cafe 5',
    amount: 296.35,
    direction: 'debit',
    category: 'Food',
    status: 'pending',
    date: '2026-03-01',
    note: 'Client settlement 3',
    tag: 'food-2',
  },
  {
    id: 'txn-338',
    accountId: 'acc-travel',
    title: 'Delta Pharmacy 338',
    merchant: 'Atelier 6',
    amount: 309.7,
    direction: 'credit',
    category: 'Salary',
    status: 'scheduled',
    date: '2026-03-02',
    note: 'Daily spend 4',
    tag: 'salary-3',
  },
  {
    id: 'txn-339',
    accountId: 'acc-business',
    title: 'Horizon Terminal 339',
    merchant: 'Energy 7',
    amount: 322,
    direction: 'debit',
    category: 'Bills',
    status: 'booked',
    date: '2026-03-03',
    note: 'Automated debit 5',
    tag: 'bills-4',
  },
  {
    id: 'txn-340',
    accountId: 'acc-main',
    title: 'Aurora Market 340',
    merchant: 'Grocer 8',
    amount: 114.35,
    direction: 'credit',
    category: 'Investing',
    status: 'pending',
    date: '2026-03-04',
    note: 'Foreign exchange hold 1',
    tag: 'investing-5',
  },
]

const styles = `
:root {
  color-scheme: dark;
  font-family: 'Manrope', 'SF Pro Display', 'Segoe UI', sans-serif;
  background: #0b1020;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  min-width: 320px;
  background:
    radial-gradient(circle at top left, rgba(91, 141, 239, 0.12), transparent 28%),
    radial-gradient(circle at 90% 0%, rgba(112, 228, 194, 0.08), transparent 24%),
    linear-gradient(180deg, #0b1020 0%, #0d1324 52%, #0f172a 100%);
  color: #f7f9fc;
}
button, input, select, textarea { font: inherit; }
button { cursor: pointer; }
#root { min-height: 100vh; }
.app-shell {
  min-height: 100vh;
  padding: 24px;
}
.bank-app {
  max-width: 1480px;
  margin: 0 auto;
  display: grid;
  gap: 16px;
}
.theme-linen {
  color: #142033;
}
.theme-linen body {
  color: #142033;
}
.hero-panel, .section-panel, .side-panel, .feed-card, .stat-card, .account-card, .card-shell, .bill-card, .goal-card, .notice-card, .chat-card, .faq-card {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px);
  box-shadow: 0 12px 40px rgba(3, 10, 24, 0.16);
}
.theme-obsidian .hero-panel,
.theme-obsidian .section-panel,
.theme-obsidian .side-panel,
.theme-obsidian .feed-card,
.theme-obsidian .stat-card,
.theme-obsidian .account-card,
.theme-obsidian .card-shell,
.theme-obsidian .bill-card,
.theme-obsidian .goal-card,
.theme-obsidian .notice-card,
.theme-obsidian .chat-card,
.theme-obsidian .faq-card {
  background: linear-gradient(180deg, rgba(16, 23, 39, 0.86), rgba(11, 18, 32, 0.92));
}
.theme-linen .hero-panel,
.theme-linen .section-panel,
.theme-linen .side-panel,
.theme-linen .feed-card,
.theme-linen .stat-card,
.theme-linen .account-card,
.theme-linen .card-shell,
.theme-linen .bill-card,
.theme-linen .goal-card,
.theme-linen .notice-card,
.theme-linen .chat-card,
.theme-linen .faq-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(245, 248, 252, 0.96));
  color: #142033;
  border-color: rgba(20, 32, 51, 0.08);
}
.top-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(320px, 0.9fr);
  gap: 16px;
}
.hero-panel { padding: 32px; }
.side-panel { padding: 24px; }
.hero-panel::after, .section-panel::after, .side-panel::after {
  content: '';
  position: absolute;
  inset: auto -12% -32% auto;
  width: 280px;
  height: 280px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(91, 141, 239, 0.12), transparent 72%);
  pointer-events: none;
}
.eyebrow {
  display: inline-flex;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 700;
  opacity: 0.58;
  margin-bottom: 10px;
}
.hero-title {
  margin: 0;
  font-size: clamp(34px, 5vw, 64px);
  line-height: 0.96;
  letter-spacing: -0.05em;
  max-width: 10ch;
}
.hero-copy {
  max-width: 58ch;
  margin: 18px 0 24px;
  line-height: 1.65;
  color: rgba(247, 249, 252, 0.72);
}
.theme-linen .hero-copy {
  color: rgba(20, 32, 51, 0.68);
}
.personal-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: 16px;
  align-items: stretch;
}
.balance-card {
  padding: 20px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(91, 141, 239, 0.18), rgba(112, 228, 194, 0.08));
  border: 1px solid rgba(91, 141, 239, 0.18);
}
.theme-linen .balance-card {
  background: linear-gradient(135deg, rgba(91, 141, 239, 0.1), rgba(91, 141, 239, 0.03));
}
.balance-amount {
  font-size: clamp(36px, 5vw, 58px);
  letter-spacing: -0.06em;
  margin: 10px 0 6px;
}
.balance-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;
}
.shortcut-btn {
  text-align: left;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: inherit;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}
.shortcut-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(91, 141, 239, 0.28);
}
.theme-linen .shortcut-btn {
  background: rgba(20, 32, 51, 0.03);
  border-color: rgba(20, 32, 51, 0.08);
}
.shortcut-btn strong {
  display: block;
  margin-bottom: 4px;
  font-size: 15px;
}
.mini-stack {
  display: grid;
  gap: 12px;
}
.mini-card {
  padding: 16px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.03);
}
.theme-linen .mini-card {
  background: rgba(20, 32, 51, 0.03);
  border-color: rgba(20, 32, 51, 0.07);
}
.list-rows {
  display: grid;
  gap: 10px;
  margin-top: 10px;
}
.pay-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.theme-linen .pay-row {
  border-bottom-color: rgba(20, 32, 51, 0.07);
}
.pay-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.mini-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}
.mini-metric {
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.theme-linen .mini-metric {
  background: rgba(20, 32, 51, 0.03);
  border-color: rgba(20, 32, 51, 0.06);
}
.cabinet-list {
  display: grid;
  gap: 10px;
}
.cabinet-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.theme-linen .cabinet-item {
  background: rgba(20, 32, 51, 0.03);
  border-color: rgba(20, 32, 51, 0.06);
}
.hero-actions, .toolbar, .cluster, .bill-actions, .goal-actions, .card-actions, .notice-actions, .faq-actions, .support-actions, .insight-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.btn {
  border: 1px solid transparent;
  border-radius: 14px;
  padding: 11px 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  transition: transform 180ms ease, opacity 180ms ease, background 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}
.btn:hover { transform: translateY(-1px); }
.btn:active { transform: translateY(0); }
.btn-primary {
  background: #5b8def;
  color: #ffffff;
  box-shadow: 0 8px 24px rgba(91, 141, 239, 0.25);
}
.btn-secondary {
  background: rgba(255, 255, 255, 0.04);
  color: inherit;
  border-color: rgba(255, 255, 255, 0.08);
}
.theme-linen .btn-secondary {
  background: rgba(20, 32, 51, 0.03);
  border-color: rgba(20, 32, 51, 0.08);
}
.btn-accent {
  background: #e9eef8;
  color: #142033;
  border-color: rgba(91, 141, 239, 0.18);
}
.theme-obsidian .btn-accent {
  background: rgba(233, 238, 248, 0.1);
  color: #f7f9fc;
}
.btn-gold {
  background: transparent;
  color: inherit;
  border-color: rgba(112, 228, 194, 0.24);
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 12px;
  font-weight: 600;
}
.theme-linen .pill {
  background: rgba(20, 32, 51, 0.04);
  border-color: rgba(20, 32, 51, 0.08);
}
.section-panel { padding: 24px; }
.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(340px, 0.95fr);
  gap: 16px;
}
.stats-row, .notice-grid, .account-grid, .cards-grid, .bill-grid, .goal-grid, .faq-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 14px;
}
.stat-card { grid-column: span 3; padding: 20px; }
.notice-card { grid-column: span 6; padding: 18px; }
.account-card { grid-column: span 6; padding: 22px; }
.card-shell { grid-column: span 4; padding: 20px; min-height: 280px; }
.bill-card { grid-column: span 6; padding: 20px; }
.goal-card { grid-column: span 4; padding: 20px; }
.faq-card { grid-column: span 6; padding: 20px; }
.metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
.metric-label {
  font-size: 11px;
  opacity: 0.56;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 700;
}
.metric-value {
  font-size: clamp(24px, 3vw, 34px);
  margin: 8px 0 0;
  letter-spacing: -0.04em;
}
.nav-strip {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
}
.nav-button {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 14px 16px;
  text-align: left;
  background: rgba(255, 255, 255, 0.03);
  color: inherit;
  transition: background 180ms ease, border-color 180ms ease, transform 180ms ease;
}
.nav-button:hover {
  transform: translateY(-1px);
  border-color: rgba(91, 141, 239, 0.26);
}
.theme-linen .nav-button {
  background: rgba(20, 32, 51, 0.03);
  border-color: rgba(20, 32, 51, 0.08);
}
.nav-button.active {
  background: rgba(91, 141, 239, 0.12);
  border-color: rgba(91, 141, 239, 0.38);
}
.split-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 18px;
}
.section-title {
  margin: 0;
  font-size: clamp(24px, 2.2vw, 32px);
  letter-spacing: -0.04em;
}
.muted {
  opacity: 0.72;
  line-height: 1.6;
}
.sparkline {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  align-items: end;
  gap: 6px;
  height: 82px;
  margin-top: 18px;
}
.sparkline span {
  display: block;
  border-radius: 999px 999px 10px 10px;
  background: linear-gradient(180deg, rgba(91, 141, 239, 0.92), rgba(91, 141, 239, 0.22));
}
.theme-linen .sparkline span {
  background: linear-gradient(180deg, rgba(20, 32, 51, 0.82), rgba(20, 32, 51, 0.16));
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.field { display: grid; gap: 8px; }
.field label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  opacity: 0.58;
  font-weight: 700;
}
.field input, .field select, .field textarea {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.035);
  color: inherit;
  outline: none;
  transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
}
.theme-linen .field input, .theme-linen .field select, .theme-linen .field textarea {
  background: rgba(20, 32, 51, 0.03);
  border-color: rgba(20, 32, 51, 0.08);
}
.field input:focus, .field select:focus, .field textarea:focus {
  border-color: rgba(91, 141, 239, 0.44);
  box-shadow: 0 0 0 4px rgba(91, 141, 239, 0.12);
}
.ledger-list, .activity-list, .message-list {
  display: grid;
  gap: 12px;
  max-height: 520px;
  overflow: auto;
  padding-right: 4px;
}
.ledger-row, .activity-row, .message-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.theme-linen .ledger-row, .theme-linen .activity-row, .theme-linen .message-row {
  background: rgba(20, 32, 51, 0.03);
  border-color: rgba(20, 32, 51, 0.06);
}
.avatar-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #5b8def;
  box-shadow: 0 0 0 6px rgba(91, 141, 239, 0.12);
}
.negative { color: #ff8f8f; }
.positive { color: #70e4c2; }
.theme-linen .negative { color: #c74b5a; }
.theme-linen .positive { color: #17856b; }
.bar-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 10px;
  align-items: end;
  min-height: 220px;
}
.bar-stack { display: grid; gap: 8px; }
.bar {
  border-radius: 14px 14px 6px 6px;
  background: linear-gradient(180deg, rgba(91, 141, 239, 0.9), rgba(91, 141, 239, 0.18));
}
.theme-linen .bar {
  background: linear-gradient(180deg, rgba(20, 32, 51, 0.86), rgba(20, 32, 51, 0.14));
}
.ring {
  width: 112px;
  height: 112px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: conic-gradient(#5b8def var(--ring), rgba(255,255,255,0.08) 0);
}
.ring > span {
  width: 78px;
  height: 78px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #0f1628;
  font-weight: 700;
}
.theme-linen .ring > span { background: #ffffff; }
.chat-card { padding: 22px; }
.message-row.bank { grid-template-columns: 1fr auto; }
.message-row.user { grid-template-columns: auto 1fr; }
.message-bubble {
  border-radius: 18px;
  padding: 14px 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
}
.theme-linen .message-bubble {
  background: rgba(20,32,51,0.04);
  border-color: rgba(20,32,51,0.06);
}
.message-row.user .message-bubble {
  background: rgba(91, 141, 239, 0.12);
  border-color: rgba(91, 141, 239, 0.2);
}
.theme-linen .message-row.user .message-bubble {
  background: rgba(91, 141, 239, 0.08);
}
.footer-note {
  opacity: 0.54;
  font-size: 12px;
  line-height: 1.6;
}
@media (max-width: 1180px) {
  .top-grid, .dashboard-grid { grid-template-columns: 1fr; }
  .personal-shell { grid-template-columns: 1fr; }
  .stat-card { grid-column: span 6; }
  .card-shell { grid-column: span 6; }
  .goal-card { grid-column: span 6; }
}
@media (max-width: 820px) {
  .app-shell { padding: 14px; }
  .nav-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .stats-row, .notice-grid, .account-grid, .cards-grid, .bill-grid, .goal-grid, .faq-grid { grid-template-columns: repeat(6, 1fr); }
  .stat-card, .notice-card, .account-card, .card-shell, .bill-card, .goal-card, .faq-card { grid-column: span 6; }
  .form-grid, .metrics { grid-template-columns: 1fr; }
  .quick-actions-grid, .mini-metrics { grid-template-columns: 1fr; }
  .hero-panel { padding: 24px; }
  .section-panel, .side-panel, .chat-card { padding: 18px; }
}
`

function formatMoney(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value)
}

function formatCompact(value: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function calculateLoan(principal: number, annualRate: number, years: number) {
  const monthlyRate = annualRate / 12 / 100
  const totalPayments = years * 12
  if (monthlyRate === 0) {
    return principal / totalPayments
  }
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalPayments))
}

function App() {
  const [theme, setTheme] = useState<ThemeMode>('obsidian')
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [accounts, setAccounts] = useState<Account[]>(accountSeed)
  const [cards, setCards] = useState<Card[]>(cardSeed)
  const [bills, setBills] = useState<Bill[]>(billSeed)
  const [goals, setGoals] = useState<Goal[]>(goalSeed)
  const [notices, setNotices] = useState<Notice[]>(noticeSeed)
  const [transactions, setTransactions] = useState<Transaction[]>(transactionSeed)
  const [messages, setMessages] = useState<Message[]>(supportSeed)
  const [branchSlots, setBranchSlots] = useState<BranchSlot[]>(branchSeed)
  const [marketPulse, setMarketPulse] = useState<MarketPulse[]>(marketSeed)
  const [selectedAccountId, setSelectedAccountId] = useState<string>('acc-main')
  const [selectedCardId, setSelectedCardId] = useState<string>('card-1')
  const [search, setSearch] = useState('')
  const [activity, setActivity] = useState<string[]>([
    'Morning sync complete. All payment rails available.',
    'Cashback sweep posted to Reserve Checking.',
    'Travel wallet is flagged for elevated FX monitoring.',
  ])
  const [transferForm, setTransferForm] = useState({ from: 'acc-main', to: 'acc-save', amount: '240', memo: 'Reserve buffer' })
  const [paymentForm, setPaymentForm] = useState({ payee: payees[0], accountId: 'acc-main', amount: '164.18', memo: 'Monthly utility payment' })
  const [supportDraft, setSupportDraft] = useState('')
  const [fxAmount, setFxAmount] = useState('250')
  const [fxRate, setFxRate] = useState('0.92')
  const [loanAmount, setLoanAmount] = useState('18000')
  const [loanRate, setLoanRate] = useState('7.6')
  const [loanYears, setLoanYears] = useState('4')
  const [statementAccountId, setStatementAccountId] = useState<string>('acc-main')
  const deferredSearch = useDeferredValue(search)

  const transferFromId = useId()
  const transferToId = useId()
  const transferAmountId = useId()
  const transferMemoId = useId()
  const paymentPayeeId = useId()
  const paymentAmountId = useId()
  const paymentMemoId = useId()
  const supportId = useId()

  useEffect(() => {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as Partial<{
        theme: ThemeMode
        activeTab: TabId
        accounts: Account[]
        cards: Card[]
        bills: Bill[]
        goals: Goal[]
        notices: Notice[]
        transactions: Transaction[]
        messages: Message[]
        branchSlots: BranchSlot[]
        marketPulse: MarketPulse[]
        activity: string[]
      }>
      if (parsed.theme) setTheme(parsed.theme)
      if (parsed.activeTab) setActiveTab(parsed.activeTab)
      if (parsed.accounts) setAccounts(parsed.accounts)
      if (parsed.cards) setCards(parsed.cards)
      if (parsed.bills) setBills(parsed.bills)
      if (parsed.goals) setGoals(parsed.goals)
      if (parsed.notices) setNotices(parsed.notices)
      if (parsed.transactions) setTransactions(parsed.transactions)
      if (parsed.messages) setMessages(parsed.messages)
      if (parsed.branchSlots) setBranchSlots(parsed.branchSlots)
      if (parsed.marketPulse) setMarketPulse(parsed.marketPulse)
      if (parsed.activity) setActivity(parsed.activity)
    } catch {
      localStorage.removeItem(storageKey)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        theme,
        activeTab,
        accounts,
        cards,
        bills,
        goals,
        notices,
        transactions,
        messages,
        branchSlots,
        marketPulse,
        activity,
      }),
    )
  }, [theme, activeTab, accounts, cards, bills, goals, notices, transactions, messages, branchSlots, marketPulse, activity])

  const selectedAccount = useMemo(() => accounts.find((account) => account.id === selectedAccountId) ?? accounts[0], [accounts, selectedAccountId])
  const selectedCard = useMemo(() => cards.find((card) => card.id === selectedCardId) ?? cards[0], [cards, selectedCardId])

  const filteredTransactions = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase()
    return transactions
      .filter((txn) => (selectedAccountId === 'all' ? true : txn.accountId === selectedAccountId))
      .filter((txn) => {
        if (!query) return true
        return [txn.title, txn.merchant, txn.category, txn.note, txn.tag].some((value) => value.toLowerCase().includes(query))
      })
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 48)
  }, [deferredSearch, transactions, selectedAccountId])

  const totals = useMemo(() => {
    const allBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
    const allAvailable = accounts.reduce((sum, account) => sum + account.available, 0)
    const totalCardSpend = cards.reduce((sum, card) => sum + card.spent, 0)
    const unresolvedNotices = notices.filter((notice) => !notice.resolved).length
    return { allBalance, allAvailable, totalCardSpend, unresolvedNotices }
  }, [accounts, cards, notices])

  const monthlyInflow = useMemo(() => transactions.filter((txn) => txn.direction === 'credit').reduce((sum, txn) => sum + txn.amount, 0), [transactions])
  const monthlyOutflow = useMemo(() => transactions.filter((txn) => txn.direction === 'debit').reduce((sum, txn) => sum + txn.amount, 0), [transactions])
  const primaryAccount = useMemo(() => accounts.find((account) => account.id === 'acc-main') ?? accounts[0], [accounts])
  const dueBills = useMemo(() => bills.filter((bill) => bill.status !== 'paid').slice(0, 3), [bills])
  const personalFeed = useMemo(() => transactions.filter((txn) => txn.accountId === 'acc-main').slice(0, 4), [transactions])

  const categorySummary = useMemo(() => {
    const map = new Map<string, number>()
    for (const txn of transactions.slice(0, 120)) {
      const current = map.get(txn.category) ?? 0
      map.set(txn.category, current + txn.amount)
    }
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
  }, [transactions])

  const loanMonthly = useMemo(() => calculateLoan(Number(loanAmount || 0), Number(loanRate || 0), Number(loanYears || 1)), [loanAmount, loanRate, loanYears])
  const fxPreview = useMemo(() => Number(fxAmount || 0) * Number(fxRate || 0), [fxAmount, fxRate])

  function logAction(entry: string) {
    setActivity((current) => [entry, ...current].slice(0, 24))
  }

  function addNotice(title: string, detail: string, tone: NoticeTone) {
    setNotices((current) => [{ id: createId('note'), title, detail, tone, createdAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), resolved: false }, ...current].slice(0, 12))
  }

  function postTransaction(input: Omit<Transaction, 'id'>) {
    setTransactions((current) => [{ id: createId('txn'), ...input }, ...current])
  }

  function adjustAccount(accountId: string, deltaBalance: number, deltaAvailable = deltaBalance) {
    setAccounts((current) => current.map((account) => account.id === accountId ? { ...account, balance: Number((account.balance + deltaBalance).toFixed(2)), available: Number((account.available + deltaAvailable).toFixed(2)) } : account))
  }

  function toggleTheme() {
    setTheme((current) => current === 'obsidian' ? 'linen' : 'obsidian')
    logAction('Theme palette changed for the operations floor.')
  }

  function refreshMarket() {
    startTransition(() => {
      setMarketPulse((current) => current.map((item, index) => ({
        ...item,
        delta: Number((item.delta + ((index % 2 === 0 ? 1 : -1) * 0.07)).toFixed(2)),
        value: item.id === 'pulse-1' ? (0.9 + Math.random() * 0.08).toFixed(2) : item.value,
      })))
    })
    addNotice('Market pulse refreshed', 'Live benchmark tiles have been recalculated for this demo session.', 'info')
    logAction('Market pulse refreshed with a new benchmark snapshot.')
  }

  function simulateSalary() {
    const amount = 2840
    adjustAccount('acc-main', amount)
    postTransaction({ accountId: 'acc-main', title: 'Salary settlement', merchant: 'Northstar Payroll', amount, direction: 'credit', category: 'Salary', status: 'booked', date: '2026-03-14', note: 'Manual demo salary trigger', tag: 'salary-demo' })
    addNotice('Salary simulation posted', 'A payroll credit has been added to Reserve Checking.', 'success')
    logAction('Salary simulation increased Reserve Checking.')
  }

  function simulateExpense() {
    const amount = 24.5
    adjustAccount('acc-main', -amount)
    postTransaction({ accountId: 'acc-main', title: 'Cafe expense', merchant: 'Signal Cafe', amount, direction: 'debit', category: 'Food', status: 'booked', date: '2026-03-14', note: 'Quick expense simulation', tag: 'coffee-demo' })
    setCards((current) => current.map((card) => card.id === 'card-1' ? { ...card, spent: Number((card.spent + amount).toFixed(2)) } : card))
    logAction('Expense simulation posted to the primary card and checking account.')
  }

  function clearResolvedNotices() {
    setNotices((current) => current.filter((notice) => !notice.resolved))
    logAction('Resolved alerts were cleared from the queue.')
  }

  function resolveNotice(id: string) {
    setNotices((current) => current.map((notice) => notice.id === id ? { ...notice, resolved: true } : notice))
    logAction(`Alert ${id} marked as reviewed.`)
  }

  function submitTransfer() {
    const amount = Number(transferForm.amount)
    if (!amount || amount <= 0 || transferForm.from === transferForm.to) {
      addNotice('Transfer validation', 'Use different accounts and a positive amount.', 'warning')
      return
    }
    const fromAccount = accounts.find((account) => account.id === transferForm.from)
    const toAccount = accounts.find((account) => account.id === transferForm.to)
    if (!fromAccount || !toAccount) return
    if (fromAccount.available < amount) {
      addNotice('Transfer rejected', 'Available funds are too low for this transfer.', 'critical')
      return
    }
    adjustAccount(fromAccount.id, -amount)
    adjustAccount(toAccount.id, amount)
    postTransaction({ accountId: fromAccount.id, title: `Transfer to ${toAccount.name}`, merchant: 'Northstar Internal', amount, direction: 'debit', category: 'Bills', status: 'booked', date: '2026-03-14', note: transferForm.memo || 'Internal transfer', tag: 'transfer-out' })
    postTransaction({ accountId: toAccount.id, title: `Transfer from ${fromAccount.name}`, merchant: 'Northstar Internal', amount, direction: 'credit', category: 'Investing', status: 'booked', date: '2026-03-14', note: transferForm.memo || 'Internal transfer', tag: 'transfer-in' })
    addNotice('Transfer completed', `${formatMoney(amount, fromAccount.currency)} moved to ${toAccount.name}.`, 'success')
    logAction(`Transferred ${formatMoney(amount, fromAccount.currency)} from ${fromAccount.name} to ${toAccount.name}.`)
  }

  function applyPreset(index: number) {
    const preset = quickTransferPresets[index]
    setTransferForm({ from: preset.from, to: preset.to, amount: String(preset.amount), memo: preset.memo })
    logAction(`Transfer preset loaded: ${preset.label}.`)
  }

  function submitPayment() {
    const amount = Number(paymentForm.amount)
    if (!amount || amount <= 0) {
      addNotice('Payment validation', 'Payment amount must be positive.', 'warning')
      return
    }
    const account = accounts.find((item) => item.id === paymentForm.accountId)
    if (!account) return
    if (account.available < amount) {
      addNotice('Payment rejected', 'Selected account does not have enough available funds.', 'critical')
      return
    }
    adjustAccount(account.id, -amount)
    postTransaction({ accountId: account.id, title: paymentForm.payee, merchant: paymentForm.payee, amount, direction: 'debit', category: 'Bills', status: 'booked', date: '2026-03-14', note: paymentForm.memo || 'Manual bill pay', tag: 'bill-pay' })
    addNotice('Payment sent', `${paymentForm.payee} was paid from ${account.name}.`, 'success')
    logAction(`Bill payment posted to ${paymentForm.payee}.`)
  }

  function quickPay(payee: string, amount: number, memo: string, category = 'Bills') {
    const account = accounts.find((item) => item.id === 'acc-main')
    if (!account) return
    if (account.available < amount) {
      addNotice('Quick payment rejected', 'Reserve Checking does not have enough funds.', 'critical')
      return
    }
    adjustAccount(account.id, -amount)
    postTransaction({ accountId: account.id, title: payee, merchant: payee, amount, direction: 'debit', category, status: 'booked', date: '2026-03-14', note: memo, tag: 'quick-pay' })
    addNotice('Payment completed', `${payee} was paid instantly from Reserve Checking.`, 'success')
    logAction(`Quick payment sent to ${payee}.`)
  }

  function payBill(id: string) {
    const bill = bills.find((entry) => entry.id === id)
    if (!bill) return
    const account = accounts.find((entry) => entry.id === bill.accountId)
    if (!account) return
    if (account.available < bill.amount) {
      addNotice('Bill payment blocked', `${bill.name} could not be paid due to low available funds.`, 'critical')
      return
    }
    adjustAccount(account.id, -bill.amount)
    setBills((current) => current.map((entry) => entry.id === id ? { ...entry, status: 'paid' } : entry))
    postTransaction({ accountId: account.id, title: bill.name, merchant: bill.name, amount: bill.amount, direction: 'debit', category: 'Bills', status: 'booked', date: '2026-03-14', note: 'One-click bill payment', tag: 'bill-one-click' })
    logAction(`Bill ${bill.name} was paid immediately.`)
  }

  function snoozeBill(id: string) {
    setBills((current) => current.map((entry) => entry.id === id ? { ...entry, due: '2026-04-01', status: 'snoozed' } : entry))
    addNotice('Bill snoozed', 'The due date was shifted by this demo flow.', 'info')
    logAction(`Bill ${id} moved to a later due date.`)
  }

  function toggleAutopay(id: string) {
    setBills((current) => current.map((entry) => entry.id === id ? { ...entry, autopay: !entry.autopay } : entry))
    logAction(`Autopay preference changed for ${id}.`)
  }

  function selectAccount(accountId: string) {
    setSelectedAccountId(accountId)
    setStatementAccountId(accountId === 'all' ? 'acc-main' : accountId)
    logAction(`Ledger focus changed to ${accountId}.`)
  }

  function rewardInterest(accountId: string) {
    const account = accounts.find((entry) => entry.id === accountId)
    if (!account) return
    const amount = Number((account.balance * (account.rate / 100) / 12).toFixed(2))
    adjustAccount(accountId, amount)
    postTransaction({ accountId, title: 'Interest accrual', merchant: 'Northstar Reserve', amount, direction: 'credit', category: 'Investing', status: 'booked', date: '2026-03-14', note: 'Manual interest simulation', tag: 'interest' })
    logAction(`Interest reward posted to ${account.name}.`)
  }

  function exportStatement(accountId: string) {
    setStatementAccountId(accountId)
    setActiveTab('accounts')
    addNotice('Statement prepared', 'Ledger panel narrowed to the selected account.', 'info')
    logAction(`Statement preview focused on ${accountId}.`)
  }

  function toggleFreeze(cardId: string) {
    setCards((current) => current.map((card) => card.id === cardId ? { ...card, frozen: !card.frozen } : card))
    const card = cards.find((entry) => entry.id === cardId)
    if (card) {
      addNotice(card.frozen ? 'Card unlocked' : 'Card frozen', `${card.label} ending ${card.last4} changed status.`, card.frozen ? 'success' : 'warning')
    }
    logAction(`Freeze status toggled for ${cardId}.`)
  }

  function replaceCard(cardId: string) {
    setCards((current) => current.map((card) => card.id === cardId ? { ...card, last4: String(Math.floor(1000 + Math.random() * 9000)), frozen: false, spent: 0 } : card))
    addNotice('Replacement ordered', 'A demo replacement card was issued and spending reset.', 'success')
    logAction(`Replacement flow completed for ${cardId}.`)
  }

  function raiseLimit(cardId: string) {
    setCards((current) => current.map((card) => card.id === cardId ? { ...card, limit: card.limit + 1000 } : card))
    logAction(`Card limit increased by $1,000 for ${cardId}.`)
  }

  function simulateCardSpend(cardId: string) {
    const card = cards.find((entry) => entry.id === cardId)
    if (!card) return
    if (card.frozen) {
      addNotice('Card spend blocked', `${card.label} is frozen and cannot be used.`, 'critical')
      return
    }
    const amount = 73.4
    setCards((current) => current.map((entry) => entry.id === cardId ? { ...entry, spent: Number((entry.spent + amount).toFixed(2)) } : entry))
    adjustAccount(card.accountId, -amount)
    postTransaction({ accountId: card.accountId, title: `${card.label} purchase`, merchant: 'Terminal Atelier', amount, direction: 'debit', category: 'Shopping', status: 'booked', date: '2026-03-14', note: 'Simulated card transaction', tag: 'card-sim' })
    logAction(`Simulated card purchase on ${card.label}.`)
  }

  function contributeGoal(goalId: string, amount: number) {
    const goal = goals.find((entry) => entry.id === goalId)
    if (!goal) return
    const source = accounts[0]
    if (source.available < amount) {
      addNotice('Goal contribution blocked', 'Primary checking account lacks available funds.', 'critical')
      return
    }
    adjustAccount(source.id, -amount)
    setGoals((current) => current.map((entry) => entry.id === goalId ? { ...entry, current: clamp(entry.current + amount, 0, entry.target) } : entry))
    postTransaction({ accountId: source.id, title: `Goal contribution: ${goal.name}`, merchant: 'Northstar Vault', amount, direction: 'debit', category: 'Investing', status: 'booked', date: '2026-03-14', note: 'Vault contribution', tag: 'goal' })
    logAction(`Contributed ${formatMoney(amount)} to ${goal.name}.`)
  }

  function toggleGoalPause(goalId: string) {
    setGoals((current) => current.map((entry) => entry.id === goalId ? { ...entry, paused: !entry.paused } : entry))
    logAction(`Pause state toggled for ${goalId}.`)
  }

  function boostGoal(goalId: string) {
    setGoals((current) => current.map((entry) => entry.id === goalId ? { ...entry, pace: entry.pace + 75 } : entry))
    logAction(`Monthly pace increased for ${goalId}.`)
  }

  function trimSubscriptions() {
    const amount = 48
    adjustAccount('acc-main', amount)
    postTransaction({ accountId: 'acc-main', title: 'Subscription trim', merchant: 'Northstar Optimizer', amount, direction: 'credit', category: 'Bills', status: 'booked', date: '2026-03-14', note: 'Recovered from recurring spend review', tag: 'optimizer' })
    addNotice('Subscriptions trimmed', 'A recurring spend optimization credited your account.', 'success')
    logAction('Subscription trimming flow returned funds to checking.')
  }

  function rebalanceSavings() {
    contributeGoal('goal-2', 120)
    rewardInterest('acc-save')
    logAction('Savings rebalance flow completed.')
  }

  function exchangeFunds() {
    const amount = Number(fxAmount)
    const rate = Number(fxRate)
    if (!amount || !rate) {
      addNotice('FX validation', 'Both amount and rate are required.', 'warning')
      return
    }
    const source = accounts.find((entry) => entry.id === 'acc-main')
    const destination = accounts.find((entry) => entry.id === 'acc-travel')
    if (!source || !destination || source.available < amount) {
      addNotice('FX exchange failed', 'Primary account does not have enough funds.', 'critical')
      return
    }
    const converted = Number((amount * rate).toFixed(2))
    adjustAccount(source.id, -amount)
    adjustAccount(destination.id, converted)
    postTransaction({ accountId: source.id, title: 'FX conversion out', merchant: 'Northstar FX', amount, direction: 'debit', category: 'Travel', status: 'booked', date: '2026-03-14', note: `Converted at ${rate}`, tag: 'fx-out' })
    postTransaction({ accountId: destination.id, title: 'FX conversion in', merchant: 'Northstar FX', amount: converted, direction: 'credit', category: 'Travel', status: 'booked', date: '2026-03-14', note: `Converted from USD at ${rate}`, tag: 'fx-in' })
    addNotice('FX exchange complete', `${formatMoney(amount)} converted into ${converted.toFixed(2)} EUR.`, 'success')
    logAction('FX exchange updated both checking and travel wallet balances.')
  }

  function sendSupportMessage(text: string) {
    if (!text.trim()) return
    const userText = text.trim()
    setMessages((current) => [
      ...current,
      { id: createId('msg'), from: 'user', text: userText, createdAt: 'now' },
      { id: createId('msg'), from: 'bank', text: `Concierge logged: ${userText}`, createdAt: 'now' },
    ])
    setSupportDraft('')
    logAction('Support conversation extended with a new request.')
  }

  function bookBranchSlot(slotId: string) {
    setBranchSlots((current) => current.map((slot) => slot.id === slotId ? { ...slot, booked: true } : slot))
    addNotice('Branch visit booked', 'A concierge appointment was reserved from the support tab.', 'success')
    logAction(`Branch appointment booked for ${slotId}.`)
  }

  function injectFaqAnswer(answer: string) {
    setMessages((current) => [...current, { id: createId('msg'), from: 'bank', text: answer, createdAt: 'FAQ' }])
    logAction('FAQ answer inserted into the support conversation.')
  }

  const appClassName = `bank-app theme-${theme}`

  return (
    <div className='app-shell'>
      <style>{styles}</style>
      <div className={appClassName}>
        <section className='top-grid'>
          <article className='hero-panel'>
            <span className='eyebrow'>Personal account</span>
            <h1 className='hero-title'>Hi, Niki. Your money is all in one place.</h1>
            <p className='hero-copy'>
              Личный кабинет с актуальным балансом, быстрыми платежами, картами и движением денег. Это уже ближе к реальному интерфейсу современного банковского приложения, а не к абстрактному дашборду.
            </p>
            <div className='personal-shell'>
              <div>
                <div className='balance-card'>
                  <div className='eyebrow'>Main balance</div>
                  <div className='balance-amount'>{formatMoney(primaryAccount.balance, primaryAccount.currency)}</div>
                  <div className='muted'>Available {formatMoney(primaryAccount.available, primaryAccount.currency)} on {primaryAccount.name}</div>
                  <div className='balance-meta'>
                    <span className='pill'>**** {selectedCard.last4}</span>
                    <span className='pill'>{formatMoney(monthlyOutflow)} spent this month</span>
                    <span className='pill'>{totals.unresolvedNotices} alerts</span>
                  </div>
                </div>
                <div className='quick-actions-grid'>
                  <button className='shortcut-btn' onClick={() => setActiveTab('payments')}>
                    <strong>Transfer money</strong>
                    <span className='muted'>Open transfer form and send between accounts.</span>
                  </button>
                  <button className='shortcut-btn' onClick={() => quickPay('Harbor Rent', 1800, 'Monthly rent payment')}>
                    <strong>Pay rent</strong>
                    <span className='muted'>{formatMoney(1800)} from Reserve Checking.</span>
                  </button>
                  <button className='shortcut-btn' onClick={() => quickPay('Luna Wireless', 91.74, 'Mobile plan', 'Bills')}>
                    <strong>Pay mobile</strong>
                    <span className='muted'>{formatMoney(91.74)} in one tap.</span>
                  </button>
                  <button className='shortcut-btn' onClick={() => { applyPreset(1); setActiveTab('payments') }}>
                    <strong>Top up travel</strong>
                    <span className='muted'>Load the travel wallet preset.</span>
                  </button>
                </div>
                <div className='mini-metrics'>
                  <div className='mini-metric'>
                    <div className='metric-label'>Total balance</div>
                    <div style={{ fontSize: 24, marginTop: 6 }}>{formatMoney(totals.allBalance)}</div>
                  </div>
                  <div className='mini-metric'>
                    <div className='metric-label'>Income</div>
                    <div className='positive' style={{ fontSize: 24, marginTop: 6 }}>{formatMoney(monthlyInflow)}</div>
                  </div>
                  <div className='mini-metric'>
                    <div className='metric-label'>Expenses</div>
                    <div className='negative' style={{ fontSize: 24, marginTop: 6 }}>{formatMoney(monthlyOutflow)}</div>
                  </div>
                </div>
              </div>
              <div className='mini-stack'>
                <div className='mini-card'>
                  <div className='split-header'>
                    <div>
                      <div className='eyebrow'>Quick pay</div>
                      <h3 style={{ margin: 0 }}>Upcoming payments</h3>
                    </div>
                    <button className='btn btn-secondary' onClick={() => setActiveTab('payments')}>Open all</button>
                  </div>
                  <div className='list-rows'>
                    {dueBills.map((bill) => (
                      <div key={bill.id} className='pay-row'>
                        <div>
                          <div>{bill.name}</div>
                          <div className='muted'>Due {bill.due}</div>
                        </div>
                        <button className='btn btn-primary' onClick={() => payBill(bill.id)}>Pay {formatMoney(bill.amount)}</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className='mini-card'>
                  <div className='split-header'>
                    <div>
                      <div className='eyebrow'>Recent activity</div>
                      <h3 style={{ margin: 0 }}>Latest from your main account</h3>
                    </div>
                    <button className='btn btn-secondary' onClick={() => selectAccount('acc-main')}>Open feed</button>
                  </div>
                  <div className='cabinet-list'>
                    {personalFeed.map((txn) => (
                      <div key={`cabinet-${txn.id}`} className='cabinet-item'>
                        <span className='avatar-dot' style={{ background: txn.direction === 'credit' ? '#70e4c2' : '#5b8def' }} />
                        <div>
                          <div>{txn.title}</div>
                          <div className='muted'>{txn.merchant}</div>
                        </div>
                        <strong className={txn.direction === 'credit' ? 'positive' : 'negative'}>
                          {txn.direction === 'credit' ? '+' : '-'}{formatMoney(txn.amount)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </article>
          <aside className='side-panel'>
            <div className='split-header'>
              <div>
                <span className='eyebrow'>Cards and controls</span>
                <h2 className='section-title'>My wallet</h2>
              </div>
              <div className='toolbar'>
                <button className='btn btn-secondary' onClick={() => setActiveTab('cards')}>All cards</button>
                <button className='btn btn-secondary' onClick={toggleTheme}>{theme === 'obsidian' ? 'Light UI' : 'Dark UI'}</button>
              </div>
            </div>
            <div className='mini-card' style={{ marginBottom: 14 }}>
              <div className='eyebrow'>Selected card</div>
              <h3 style={{ marginTop: 0, marginBottom: 10 }}>{selectedCard.label}</h3>
              <div style={{ fontSize: 26, letterSpacing: '0.16em', marginBottom: 8 }}>•••• •••• •••• {selectedCard.last4}</div>
              <div className='muted'>{selectedCard.holder} • {selectedCard.network}</div>
              <div className='mini-metrics'>
                <div className='mini-metric'>
                  <div className='metric-label'>Limit</div>
                  <div style={{ marginTop: 6 }}>{formatMoney(selectedCard.limit)}</div>
                </div>
                <div className='mini-metric'>
                  <div className='metric-label'>Spent</div>
                  <div style={{ marginTop: 6 }}>{formatMoney(selectedCard.spent)}</div>
                </div>
                <div className='mini-metric'>
                  <div className='metric-label'>Status</div>
                  <div style={{ marginTop: 6 }}>{selectedCard.frozen ? 'Frozen' : 'Active'}</div>
                </div>
              </div>
              <div className='toolbar' style={{ marginTop: 14 }}>
                <button className='btn btn-secondary' onClick={() => toggleFreeze(selectedCard.id)}>{selectedCard.frozen ? 'Unlock' : 'Freeze'}</button>
                <button className='btn btn-primary' onClick={() => simulateCardSpend(selectedCard.id)}>Pay with card</button>
                <button className='btn btn-secondary' onClick={clearResolvedNotices}>Clear alerts</button>
              </div>
            </div>
            <div className='ledger-list'>
              {marketPulse.slice(0, 3).map((pulse) => (
                <div key={pulse.id} className='ledger-row'>
                  <span className='avatar-dot' />
                  <div>
                    <div>{pulse.label}</div>
                    <div className='muted'>Benchmark update</div>
                  </div>
                  <strong className={pulse.delta >= 0 ? 'positive' : 'negative'}>{pulse.value}</strong>
                </div>
              ))}
              <div className='ledger-row'>
                <span className='avatar-dot' />
                <div>
                  <div>Salary demo</div>
                  <div className='muted'>Add income to the account</div>
                </div>
                <button className='btn btn-secondary' onClick={simulateSalary}>Run</button>
              </div>
              <div className='ledger-row'>
                <span className='avatar-dot' />
                <div>
                  <div>Expense demo</div>
                  <div className='muted'>Create a real debit transaction</div>
                </div>
                <button className='btn btn-secondary' onClick={simulateExpense}>Run</button>
              </div>
            </div>
          </aside>
        </section>

        <section className='section-panel'>
          <div className='nav-strip'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className='eyebrow' style={{ marginBottom: 6 }}>{tab.eyebrow}</div>
                <div style={{ fontSize: 20 }}>{tab.label}</div>
              </button>
            ))}
          </div>
        </section>

        <section className='dashboard-grid'>
          <div className='section-panel'>
            {activeTab === 'overview' && (
              <>
                <div className='split-header'>
                  <div>
                    <span className='eyebrow'>Today at a glance</span>
                    <h2 className='section-title'>Operations overview</h2>
                    <p className='muted'>Immediate actions, liquidity posture, and alert review in one place.</p>
                  </div>
                  <div className='toolbar'>
                    <button className='btn btn-secondary' onClick={() => selectAccount('all')}>All accounts</button>
                    <button className='btn btn-secondary' onClick={() => setActiveTab('support')}>Open support</button>
                    <button className='btn btn-primary' onClick={rebalanceSavings}>Rebalance savings</button>
                  </div>
                </div>
                <div className='stats-row'>
                  <article className='stat-card'>
                    <div className='metric-label'>Monthly inflow</div>
                    <div className='metric-value positive'>{formatMoney(monthlyInflow)}</div>
                    <p className='muted'>Credits captured from seeded and simulated transactions.</p>
                  </article>
                  <article className='stat-card'>
                    <div className='metric-label'>Monthly outflow</div>
                    <div className='metric-value negative'>{formatMoney(monthlyOutflow)}</div>
                    <p className='muted'>Bills, card spend, and transfer debits hitting accounts.</p>
                  </article>
                  <article className='stat-card'>
                    <div className='metric-label'>Card utilization</div>
                    <div className='metric-value'>{formatCompact((totals.totalCardSpend / cards.reduce((sum, card) => sum + card.limit, 0)) * 100)}%</div>
                    <p className='muted'>Total spending versus active credit limits.</p>
                  </article>
                  <article className='stat-card'>
                    <div className='metric-label'>Focused account</div>
                    <div className='metric-value'>{selectedAccountId === 'all' ? 'All' : selectedAccount.name}</div>
                    <p className='muted'>The ledger and statement panels follow this selection.</p>
                  </article>
                </div>
                <div className='notice-grid' style={{ marginTop: 14 }}>
                  {notices.slice(0, 4).map((notice) => (
                    <article key={notice.id} className='notice-card'>
                      <div className='split-header'>
                        <div>
                          <div className='eyebrow'>{notice.tone}</div>
                          <h3 style={{ margin: 0 }}>{notice.title}</h3>
                        </div>
                        <span className='pill'>{notice.createdAt}</span>
                      </div>
                      <p className='muted'>{notice.detail}</p>
                      <div className='notice-actions'>
                        <button className='btn btn-secondary' onClick={() => resolveNotice(notice.id)}>Mark reviewed</button>
                        <button className='btn btn-secondary' onClick={() => setActiveTab('support')}>Escalate</button>
                        <button className='btn btn-primary' onClick={() => selectAccount('acc-main')}>Focus ledger</button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'accounts' && (
              <>
                <div className='split-header'>
                  <div>
                    <span className='eyebrow'>Balance architecture</span>
                    <h2 className='section-title'>Accounts and statement feed</h2>
                    <p className='muted'>Each account card can post demo interest, focus the ledger, or prepare a statement preview.</p>
                  </div>
                  <div className='toolbar'>
                    <button className='btn btn-secondary' onClick={() => selectAccount('all')}>Show combined</button>
                    <button className='btn btn-primary' onClick={() => rewardInterest('acc-save')}>Post savings interest</button>
                  </div>
                </div>
                <div className='account-grid'>
                  {accounts.map((account) => (
                    <article key={account.id} className='account-card' style={{ borderColor: `${account.accent}55` }}>
                      <div className='split-header'>
                        <div>
                          <div className='eyebrow'>{account.kind}</div>
                          <h3 style={{ margin: 0 }}>{account.name}</h3>
                        </div>
                        <span className='pill'>{account.currency}</span>
                      </div>
                      <div style={{ fontSize: 34, marginBottom: 8 }}>{formatMoney(account.balance, account.currency)}</div>
                      <div className='muted'>Available {formatMoney(account.available, account.currency)} • Rate {account.rate}% APY</div>
                      <div className='sparkline'>
                        {account.analytics.map((value, index) => <span key={`${account.id}-${index}`} style={{ height: `${value}%`, background: `linear-gradient(180deg, ${account.accent}, rgba(255,255,255,0.12))` }} />)}
                      </div>
                      <p className='muted'>{account.iban}</p>
                      <div className='toolbar'>
                        <button className='btn btn-secondary' onClick={() => selectAccount(account.id)}>Focus ledger</button>
                        <button className='btn btn-primary' onClick={() => rewardInterest(account.id)}>Add interest</button>
                        <button className='btn btn-accent' onClick={() => exportStatement(account.id)}>Prepare statement</button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'payments' && (
              <>
                <div className='split-header'>
                  <div>
                    <span className='eyebrow'>Money movement</span>
                    <h2 className='section-title'>Transfers and bill payments</h2>
                    <p className='muted'>Presets load forms instantly, then buttons post real debits and credits into the ledger.</p>
                  </div>
                </div>
                <div className='form-grid'>
                  <article className='feed-card' style={{ padding: 22 }}>
                    <div className='split-header'>
                      <div>
                        <div className='eyebrow'>Internal transfer</div>
                        <h3 style={{ margin: 0 }}>Move money between accounts</h3>
                      </div>
                      <div className='toolbar'>
                        {quickTransferPresets.map((preset, index) => (
                          <button key={preset.label} className='btn btn-secondary' onClick={() => applyPreset(index)}>{preset.label}</button>
                        ))}
                      </div>
                    </div>
                    <div className='form-grid'>
                      <div className='field'>
                        <label htmlFor={transferFromId}>From account</label>
                        <select id={transferFromId} value={transferForm.from} onChange={(event) => setTransferForm((current) => ({ ...current, from: event.target.value }))}>
                          {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                        </select>
                      </div>
                      <div className='field'>
                        <label htmlFor={transferToId}>To account</label>
                        <select id={transferToId} value={transferForm.to} onChange={(event) => setTransferForm((current) => ({ ...current, to: event.target.value }))}>
                          {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                        </select>
                      </div>
                      <div className='field'>
                        <label htmlFor={transferAmountId}>Amount</label>
                        <input id={transferAmountId} value={transferForm.amount} onChange={(event) => setTransferForm((current) => ({ ...current, amount: event.target.value }))} />
                      </div>
                      <div className='field'>
                        <label htmlFor={transferMemoId}>Memo</label>
                        <input id={transferMemoId} value={transferForm.memo} onChange={(event) => setTransferForm((current) => ({ ...current, memo: event.target.value }))} />
                      </div>
                    </div>
                    <div className='toolbar' style={{ marginTop: 16 }}>
                      <button className='btn btn-primary' onClick={submitTransfer}>Submit transfer</button>
                      <button className='btn btn-secondary' onClick={() => setTransferForm({ from: 'acc-main', to: 'acc-save', amount: '500', memo: 'Manual reserve build' })}>Reset form</button>
                    </div>
                  </article>
                  <article className='feed-card' style={{ padding: 22 }}>
                    <div className='split-header'>
                      <div>
                        <div className='eyebrow'>External payment</div>
                        <h3 style={{ margin: 0 }}>Pay a merchant or utility</h3>
                      </div>
                      <button className='btn btn-secondary' onClick={() => setPaymentForm({ payee: payees[1], accountId: 'acc-main', amount: '42.00', memo: 'Transit top-up' })}>Load transit preset</button>
                    </div>
                    <div className='form-grid'>
                      <div className='field'>
                        <label htmlFor={paymentPayeeId}>Payee</label>
                        <select id={paymentPayeeId} value={paymentForm.payee} onChange={(event) => setPaymentForm((current) => ({ ...current, payee: event.target.value }))}>
                          {payees.map((payee) => <option key={payee}>{payee}</option>)}
                        </select>
                      </div>
                      <div className='field'>
                        <label>Funding account</label>
                        <select value={paymentForm.accountId} onChange={(event) => setPaymentForm((current) => ({ ...current, accountId: event.target.value }))}>
                          {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                        </select>
                      </div>
                      <div className='field'>
                        <label htmlFor={paymentAmountId}>Amount</label>
                        <input id={paymentAmountId} value={paymentForm.amount} onChange={(event) => setPaymentForm((current) => ({ ...current, amount: event.target.value }))} />
                      </div>
                      <div className='field'>
                        <label htmlFor={paymentMemoId}>Memo</label>
                        <input id={paymentMemoId} value={paymentForm.memo} onChange={(event) => setPaymentForm((current) => ({ ...current, memo: event.target.value }))} />
                      </div>
                    </div>
                    <div className='toolbar' style={{ marginTop: 16 }}>
                      <button className='btn btn-accent' onClick={submitPayment}>Pay now</button>
                      <button className='btn btn-secondary' onClick={() => setActiveTab('accounts')}>Review balances</button>
                    </div>
                  </article>
                </div>
                <div className='bill-grid' style={{ marginTop: 16 }}>
                  {bills.map((bill) => (
                    <article key={bill.id} className='bill-card'>
                      <div className='split-header'>
                        <div>
                          <div className='eyebrow'>{bill.status}</div>
                          <h3 style={{ margin: 0 }}>{bill.name}</h3>
                        </div>
                        <strong>{formatMoney(bill.amount)}</strong>
                      </div>
                      <p className='muted'>Due {bill.due} • Funding account {accounts.find((account) => account.id === bill.accountId)?.name}</p>
                      <div className='bill-actions'>
                        <button className='btn btn-primary' onClick={() => payBill(bill.id)}>Pay bill</button>
                        <button className='btn btn-secondary' onClick={() => snoozeBill(bill.id)}>Snooze</button>
                        <button className='btn btn-secondary' onClick={() => toggleAutopay(bill.id)}>{bill.autopay ? 'Disable autopay' : 'Enable autopay'}</button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'cards' && (
              <>
                <div className='split-header'>
                  <div>
                    <span className='eyebrow'>Card controls</span>
                    <h2 className='section-title'>Physical and virtual cards</h2>
                    <p className='muted'>Lock, replace, raise limits, and simulate real spend. All actions update the balance layer.</p>
                  </div>
                  <div className='toolbar'>
                    <button className='btn btn-secondary' onClick={() => setSelectedCardId('card-1')}>Primary card</button>
                    <button className='btn btn-primary' onClick={() => setSelectedCardId('card-3')}>Business card</button>
                  </div>
                </div>
                <div className='cards-grid'>
                  {cards.map((card) => (
                    <article key={card.id} className='card-shell' style={{ borderColor: `${card.metal}44` }}>
                      <div className='split-header'>
                        <div>
                          <div className='eyebrow'>{card.network}</div>
                          <h3 style={{ margin: 0 }}>{card.label}</h3>
                        </div>
                        <span className='pill' style={{ background: card.metal, color: '#111' }}>{card.frozen ? 'Frozen' : 'Active'}</span>
                      </div>
                      <p style={{ fontSize: 28, letterSpacing: '0.2em' }}>•••• •••• •••• {card.last4}</p>
                      <p className='muted'>{card.holder}</p>
                      <div className='metrics'>
                        <div><div className='metric-label'>Limit</div><div>{formatMoney(card.limit)}</div></div>
                        <div><div className='metric-label'>Spent</div><div>{formatMoney(card.spent)}</div></div>
                        <div><div className='metric-label'>Left</div><div>{formatMoney(card.limit - card.spent)}</div></div>
                      </div>
                      <div className='card-actions' style={{ marginTop: 16 }}>
                        <button className='btn btn-secondary' onClick={() => toggleFreeze(card.id)}>{card.frozen ? 'Unlock' : 'Freeze card'}</button>
                        <button className='btn btn-primary' onClick={() => raiseLimit(card.id)}>Raise limit</button>
                        <button className='btn btn-accent' onClick={() => simulateCardSpend(card.id)}>Simulate spend</button>
                        <button className='btn btn-gold' onClick={() => replaceCard(card.id)}>Replace</button>
                      </div>
                    </article>
                  ))}
                </div>
                <article className='feed-card' style={{ padding: 22, marginTop: 16 }}>
                  <div className='split-header'>
                    <div>
                      <div className='eyebrow'>Focused card</div>
                      <h3 style={{ margin: 0 }}>{selectedCard.label}</h3>
                    </div>
                    <button className='btn btn-secondary' onClick={() => simulateCardSpend(selectedCard.id)}>One more purchase</button>
                  </div>
                  <p className='muted'>The focused card allows a single-CTA interaction from outside the card grid.</p>
                </article>
              </>
            )}

            {activeTab === 'vault' && (
              <>
                <div className='split-header'>
                  <div>
                    <span className='eyebrow'>Future funding</span>
                    <h2 className='section-title'>Vault goals and FX desk</h2>
                    <p className='muted'>Move money into goals, change monthly pace, and simulate a currency exchange for travel.</p>
                  </div>
                  <div className='toolbar'>
                    <button className='btn btn-primary' onClick={() => contributeGoal('goal-1', 90)}>Top up trip</button>
                    <button className='btn btn-secondary' onClick={exchangeFunds}>Run FX conversion</button>
                  </div>
                </div>
                <div className='goal-grid'>
                  {goals.map((goal) => {
                    const progress = Math.round((goal.current / goal.target) * 100)
                    return (
                      <article key={goal.id} className='goal-card'>
                        <div className='split-header'>
                          <div>
                            <div className='eyebrow'>{goal.paused ? 'paused' : 'active'}</div>
                            <h3 style={{ margin: 0 }}>{goal.name}</h3>
                          </div>
                          <div className='ring' style={{ ['--ring' as string]: `${progress}%` }}><span>{progress}%</span></div>
                        </div>
                        <p className='muted'>{formatMoney(goal.current)} of {formatMoney(goal.target)} • Monthly pace {formatMoney(goal.pace)}</p>
                        <div className='goal-actions'>
                          <button className='btn btn-primary' onClick={() => contributeGoal(goal.id, 75)}>Contribute</button>
                          <button className='btn btn-secondary' onClick={() => boostGoal(goal.id)}>Boost pace</button>
                          <button className='btn btn-accent' onClick={() => toggleGoalPause(goal.id)}>{goal.paused ? 'Resume' : 'Pause'}</button>
                        </div>
                      </article>
                    )
                  })}
                </div>
                <article className='feed-card' style={{ padding: 22, marginTop: 16 }}>
                  <div className='split-header'>
                    <div>
                      <div className='eyebrow'>FX desk</div>
                      <h3 style={{ margin: 0 }}>Convert into travel wallet</h3>
                    </div>
                    <span className='pill'>Preview {fxPreview.toFixed(2)} EUR</span>
                  </div>
                  <div className='form-grid'>
                    <div className='field'><label>USD amount</label><input value={fxAmount} onChange={(event) => setFxAmount(event.target.value)} /></div>
                    <div className='field'><label>USD / EUR rate</label><input value={fxRate} onChange={(event) => setFxRate(event.target.value)} /></div>
                  </div>
                  <div className='toolbar' style={{ marginTop: 16 }}>
                    <button className='btn btn-primary' onClick={exchangeFunds}>Exchange now</button>
                    <button className='btn btn-secondary' onClick={() => { setFxAmount('500'); setFxRate('0.94'); logAction('FX preset adjusted for a stronger euro scenario.') }}>Use stronger EUR rate</button>
                  </div>
                </article>
              </>
            )}

            {activeTab === 'insights' && (
              <>
                <div className='split-header'>
                  <div>
                    <span className='eyebrow'>Analysis engine</span>
                    <h2 className='section-title'>Spending insights and loan simulator</h2>
                    <p className='muted'>Category bars summarize recent transaction volume while the loan block recalculates instantly.</p>
                  </div>
                  <div className='insight-actions'>
                    <button className='btn btn-primary' onClick={trimSubscriptions}>Trim subscriptions</button>
                    <button className='btn btn-secondary' onClick={refreshMarket}>Refresh assumptions</button>
                  </div>
                </div>
                <article className='feed-card' style={{ padding: 22 }}>
                  <div className='bar-grid'>
                    {categorySummary.slice(0, 8).map((entry) => (
                      <div key={entry.label} className='bar-stack'>
                        <div className='bar' style={{ height: `${Math.max(48, entry.value / 8)}px` }} />
                        <div className='metric-label'>{entry.label}</div>
                        <div>{formatCompact(entry.value)}</div>
                      </div>
                    ))}
                  </div>
                  <div className='insight-actions' style={{ marginTop: 18 }}>
                    <button className='btn btn-secondary' onClick={() => selectAccount('acc-business')}>Focus business spend</button>
                    <button className='btn btn-secondary' onClick={() => selectAccount('acc-main')}>Focus personal spend</button>
                  </div>
                </article>
                <article className='feed-card' style={{ padding: 22, marginTop: 16 }}>
                  <div className='split-header'>
                    <div>
                      <div className='eyebrow'>Loan sandbox</div>
                      <h3 style={{ margin: 0 }}>Estimate monthly payment</h3>
                    </div>
                    <span className='pill'>{formatMoney(loanMonthly)} / month</span>
                  </div>
                  <div className='form-grid'>
                    <div className='field'><label>Principal</label><input value={loanAmount} onChange={(event) => setLoanAmount(event.target.value)} /></div>
                    <div className='field'><label>Annual rate</label><input value={loanRate} onChange={(event) => setLoanRate(event.target.value)} /></div>
                    <div className='field'><label>Years</label><input value={loanYears} onChange={(event) => setLoanYears(event.target.value)} /></div>
                    <div className='field'><label>Scenario notes</label><textarea value={`Estimated repayment over ${loanYears} years at ${loanRate}%`} readOnly rows={3} /></div>
                  </div>
                  <div className='insight-actions' style={{ marginTop: 16 }}>
                    <button className='btn btn-primary' onClick={() => { setLoanAmount('25000'); setLoanRate('6.9'); setLoanYears('5'); logAction('Loan scenario switched to medium-term plan.') }}>Load medium plan</button>
                    <button className='btn btn-secondary' onClick={() => { setLoanAmount('12000'); setLoanRate('5.2'); setLoanYears('2'); logAction('Loan scenario switched to short-term plan.') }}>Load short plan</button>
                  </div>
                </article>
              </>
            )}

            {activeTab === 'support' && (
              <>
                <div className='split-header'>
                  <div>
                    <span className='eyebrow'>Service operations</span>
                    <h2 className='section-title'>Concierge desk and branch booking</h2>
                    <p className='muted'>Chat, FAQ injections, and branch slots all perform stateful changes inside the app.</p>
                  </div>
                </div>
                <div className='form-grid'>
                  <article className='chat-card'>
                    <div className='message-list'>
                      {messages.map((message) => (
                        <div key={message.id} className={`message-row ${message.from}`}>
                          {message.from === 'user' && <span className='pill'>{message.createdAt}</span>}
                          <div className='message-bubble'>{message.text}</div>
                          {message.from === 'bank' && <span className='pill'>{message.createdAt}</span>}
                        </div>
                      ))}
                    </div>
                    <div className='field' style={{ marginTop: 14 }}>
                      <label htmlFor={supportId}>Message concierge</label>
                      <textarea id={supportId} rows={4} value={supportDraft} onChange={(event) => setSupportDraft(event.target.value)} />
                    </div>
                    <div className='support-actions' style={{ marginTop: 14 }}>
                      <button className='btn btn-primary' onClick={() => sendSupportMessage(supportDraft)}>Send message</button>
                      {cannedSupportReplies.map((reply) => (
                        <button key={reply} className='btn btn-secondary' onClick={() => sendSupportMessage(reply)}>{reply.slice(0, 18)}...</button>
                      ))}
                    </div>
                  </article>
                  <article className='feed-card' style={{ padding: 22 }}>
                    <div className='split-header'>
                      <div>
                        <div className='eyebrow'>Branch slots</div>
                        <h3 style={{ margin: 0 }}>Reserve an in-person session</h3>
                      </div>
                    </div>
                    <div className='ledger-list'>
                      {branchSlots.map((slot) => (
                        <div key={slot.id} className='ledger-row'>
                          <span className='avatar-dot' />
                          <div>
                            <div>{slot.branch}</div>
                            <div className='muted'>{slot.time}</div>
                          </div>
                          <button className='btn btn-secondary' onClick={() => bookBranchSlot(slot.id)}>{slot.booked ? 'Booked' : 'Book slot'}</button>
                        </div>
                      ))}
                    </div>
                  </article>
                </div>
                <div className='faq-grid' style={{ marginTop: 16 }}>
                  {faqItems.map((faq) => (
                    <article key={faq.q} className='faq-card'>
                      <h3 style={{ marginTop: 0 }}>{faq.q}</h3>
                      <p className='muted'>{faq.a}</p>
                      <div className='faq-actions'>
                        <button className='btn btn-primary' onClick={() => injectFaqAnswer(faq.a)}>Send to chat</button>
                        <button className='btn btn-secondary' onClick={() => setSupportDraft(faq.q)}>Use as draft</button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>

          <aside className='side-panel'>
            <div className='split-header'>
              <div>
                <span className='eyebrow'>Ledger</span>
                <h2 className='section-title'>Live activity feed</h2>
              </div>
              <div className='cluster'>
                <button className='btn btn-secondary' onClick={() => selectAccount('acc-main')}>Checking</button>
                <button className='btn btn-secondary' onClick={() => selectAccount('acc-save')}>Savings</button>
              </div>
            </div>
            <div className='field' style={{ marginBottom: 14 }}>
              <label>Search ledger</label>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder='merchant, category, note' />
            </div>
            <div className='ledger-list'>
              {filteredTransactions.map((txn) => (
                <div key={txn.id} className='ledger-row'>
                  <span className='avatar-dot' style={{ background: txn.direction === 'credit' ? '#9fd7b5' : '#f2c6c2' }} />
                  <div>
                    <div>{txn.title}</div>
                    <div className='muted'>{txn.date} • {txn.merchant} • {txn.note}</div>
                  </div>
                  <strong className={txn.direction === 'credit' ? 'positive' : 'negative'}>{txn.direction === 'credit' ? '+' : '-'}{formatMoney(txn.amount)}</strong>
                </div>
              ))}
            </div>
            <div className='split-header' style={{ marginTop: 20 }}>
              <div>
                <span className='eyebrow'>Statement focus</span>
                <h3 style={{ margin: 0 }}>{accounts.find((account) => account.id === statementAccountId)?.name}</h3>
              </div>
              <button className='btn btn-secondary' onClick={() => exportStatement(statementAccountId)}>Refresh statement</button>
            </div>
            <div className='activity-list'>
              {transactions.filter((txn) => txn.accountId === statementAccountId).slice(0, 8).map((txn) => (
                <div key={`statement-${txn.id}`} className='activity-row'>
                  <span className='avatar-dot' />
                  <div>
                    <div>{txn.tag}</div>
                    <div className='muted'>{txn.title}</div>
                  </div>
                  <span>{formatMoney(txn.amount)}</span>
                </div>
              ))}
            </div>
            <div className='split-header' style={{ marginTop: 20 }}>
              <div>
                <span className='eyebrow'>Ops log</span>
                <h3 style={{ margin: 0 }}>Recent actions</h3>
              </div>
              <button className='btn btn-secondary' onClick={() => setActivity([])}>Clear log</button>
            </div>
            <div className='activity-list'>
              {activity.map((entry, index) => (
                <div key={`${entry}-${index}`} className='activity-row'>
                  <span className='avatar-dot' />
                  <div>{entry}</div>
                  <span className='pill'>log</span>
                </div>
              ))}
            </div>
            <p className='footer-note'>All state is stored locally in the browser for this demo. Reloading keeps your simulated banking session intact.</p>
          </aside>
        </section>
      </div>
    </div>
  )
}

const container = document.getElementById('root')

if (!container) {
  throw new Error('Root container not found')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
