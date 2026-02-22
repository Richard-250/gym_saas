import { useAuth } from '@/contexts/AuthContext';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Globe,
  Dumbbell,
  Building2,
  Settings,
  HelpCircle,
  FileText,
  ArrowLeft,
  Edit,
  Mail,
  Printer,
  X,
  Search,
  User,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { format } from 'date-fns';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LayoutWithSidebar } from '@/components/ui/LayoutWithSidebar';

// Billing Sections
import PaymentManagement from './sections/PaymentManagement';
// import RecurringBilling from './sections/RecurringBilling';
// import DiscountManagement from './sections/DiscountManagement';
import PaymentForms from './sections/PaymentForms';
import Accounting from './sections/Accounting';
import Growth from './sections/Growth';
// import BillingSettings from './sections/BillingSettings';

// TypeScript Interfaces
interface Member {
  id: string;
  name: string;
  status: string;
  type: string;
  avatar: string;
  email: string;
  phone?: string;
  membershipType: string;
  lastCheckin?: string;
  billingStatus: 'paid' | 'overdue' | 'pending';
  accountType: 'member' | 'visitor' | 'family';
  ranking?: string;
  attendanceCount?: number;
  performanceScore?: number;
}

interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  amount: number;
  description: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  status: 'paid' | 'overdue' | 'pending';
  type: string;
  paymentMethod: string;
  scheduled: string;
  paidDate?: string;
  updatedBy?: string;
  updatedAt?: string;
  lastSent?: string;
}

interface CurrentUser {
  name: string;
  email: string;
  avatar?: string;
}

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

// Demo data - This would typically come from your backend/API
const demoMembers: Member[] = [
  { 
    id: 'mem1', 
    name: 'Niyomugabo Fidela', 
    status: 'active', 
    type: 'Visitor', 
    avatar: '👤',
    email: 'fidela@example.com',
    membershipType: 'Monthly',
    billingStatus: 'overdue',
    accountType: 'visitor',
    ranking: 'Bronze',
    attendanceCount: 15,
    performanceScore: 75
  },
  { 
    id: 'mem2', 
    name: 'CYUBAHIRO Richard', 
    status: 'active', 
    type: 'Member', 
    avatar: '👤',
    email: 'richard@example.com',
    membershipType: 'Annual',
    billingStatus: 'paid',
    accountType: 'member',
    ranking: 'Gold',
    attendanceCount: 89,
    performanceScore: 92
  },
  { 
    id: 'mem3', 
    name: 'Sarah Johnson', 
    status: 'active', 
    type: 'Member', 
    avatar: '👤',
    email: 'sarah@example.com',
    membershipType: 'Monthly',
    billingStatus: 'pending',
    accountType: 'member',
    ranking: 'Silver',
    attendanceCount: 45,
    performanceScore: 82
  },
  { 
    id: 'mem4', 
    name: 'Mike Thompson', 
    status: 'active', 
    type: 'Member', 
    avatar: '👤',
    email: 'mike@example.com',
    membershipType: 'Monthly',
    billingStatus: 'paid',
    accountType: 'member',
    ranking: 'Bronze',
    attendanceCount: 22,
    performanceScore: 68
  },
  { 
    id: 'mem5', 
    name: 'Emily Davis', 
    status: 'active', 
    type: 'Member', 
    avatar: '👤',
    email: 'emily@example.com',
    membershipType: 'Annual',
    billingStatus: 'paid',
    accountType: 'member',
    ranking: 'Platinum',
    attendanceCount: 120,
    performanceScore: 96
  }
];

const initialPayments: Payment[] = [
  {
    id: 'pay1',
    memberId: 'mem1',
    memberName: 'Niyomugabo Fidela',
    memberEmail: 'fidela@example.com',
    amount: 3150,
    description: 'Session fees',
    invoiceNumber: '#0000002',
    date: '2025-06-13',
    dueDate: '2025-06-13',
    status: 'overdue',
    type: 'session',
    paymentMethod: 'Manual Payment',
    scheduled: '13/06/2025'
  },
  {
    id: 'pay2',
    memberId: 'mem2',
    memberName: 'CYUBAHIRO Richard',
    memberEmail: 'richard@example.com',
    amount: 200,
    description: 'Monthly recurring - Unlimited Fees',
    invoiceNumber: '#0000007',
    date: '2025-10-13',
    dueDate: '2025-10-13',
    status: 'overdue',
    type: 'membership',
    paymentMethod: 'Manual Payment',
    scheduled: '13/10/2025'
  },
  {
    id: 'pay3',
    memberId: 'mem2',
    memberName: 'CYUBAHIRO Richard',
    memberEmail: 'richard@example.com',
    amount: 200,
    description: 'Monthly recurring - Unlimited Fees',
    invoiceNumber: '#0000008',
    date: '2025-11-13',
    dueDate: '2025-11-13',
    status: 'overdue',
    type: 'membership',
    paymentMethod: 'Manual Payment',
    scheduled: '13/11/2025'
  },
  {
    id: 'pay4',
    memberId: 'mem2',
    memberName: 'CYUBAHIRO Richard',
    memberEmail: 'richard@example.com',
    amount: 200,
    description: 'Monthly recurring - Unlimited Fees',
    invoiceNumber: '#0000006',
    date: '2025-09-13',
    dueDate: '2025-09-13',
    status: 'paid',
    type: 'membership',
    paymentMethod: 'Manual Payment',
    scheduled: '13/09/2025',
    paidDate: '13/09/2025'
  },
  {
    id: 'pay5',
    memberId: 'mem2',
    memberName: 'CYUBAHIRO Richard',
    memberEmail: 'richard@example.com',
    amount: 200,
    description: 'Monthly recurring - Unlimited Fees',
    invoiceNumber: '#0000005',
    date: '2025-08-13',
    dueDate: '2025-08-13',
    status: 'paid',
    type: 'membership',
    paymentMethod: 'Manual Payment',
    scheduled: '13/08/2025',
    paidDate: '13/08/2025'
  },
  {
    id: 'pay6',
    memberId: 'mem3',
    memberName: 'Sarah Johnson',
    memberEmail: 'sarah@example.com',
    amount: 150,
    description: 'Monthly membership fee',
    invoiceNumber: '#0000009',
    date: '2025-11-15',
    dueDate: '2025-12-15',
    status: 'pending',
    type: 'membership',
    paymentMethod: 'Credit Card',
    scheduled: '15/12/2025'
  }
];

// Utility Functions
const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString()}`;
};

const getStatusBadge = (status: Payment['status']) => {
  const statusConfig = {
    paid: { variant: 'default' as const, text: 'Paid', icon: CheckCircle, color: 'text-green-400' },
    overdue: { variant: 'destructive' as const, text: 'Overdue', icon: AlertTriangle, color: 'text-red-400' },
    pending: { variant: 'secondary' as const, text: 'Pending', icon: Clock, color: 'text-yellow-400' }
  };
  
  return statusConfig[status];
};

// Payment Row Component
const PaymentRow: React.FC<{
  payment: Payment;
  members: Member[];
  onViewInvoice: (payment: Payment) => void;
  onEditPayment: (payment: Payment) => void;
  getMemberBadge: (payment: Payment) => string;
}> = ({ payment, members, onViewInvoice, onEditPayment, getMemberBadge }) => {
  const statusConfig = getStatusBadge(payment.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="grid grid-cols-5 gap-4 items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{members.find((m) => m.id === payment.memberId)?.avatar || '👤'}</span>
        <div>
          <p className="text-white font-medium">{payment.memberName}</p>
          <Badge variant="secondary" className="mt-1 bg-green-500/20 text-green-400 text-xs">
            {getMemberBadge(payment)}
          </Badge>
        </div>
      </div>

      <div>
        <p className="text-white font-bold text-lg">{formatCurrency(payment.amount)}</p>
        <p className="text-white/50 text-xs">{payment.paymentMethod}</p>
      </div>

      <div>
        <p className="text-white">{payment.description}</p>
      </div>

      <div className="flex items-center space-x-2">
        <p className="text-white font-mono">{payment.invoiceNumber}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewInvoice(payment)}
          className="p-1 hover:bg-white/10"
        >
          <FileText className="h-4 w-4 text-white/70" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEditPayment(payment)}
          className="p-1 hover:bg-white/10"
        >
          <Edit className="h-4 w-4 text-white/70" />
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
        <div>
          <p className={`${statusConfig.color} font-medium`}>
            {payment.status === 'paid' ? payment.paidDate : payment.scheduled}
          </p>
          <p className={`${statusConfig.color} text-sm`}>
            {statusConfig.text}
          </p>
        </div>
      </div>
    </div>
  );
};

// Stats Overview Component
const StatsOverview: React.FC<{
  scheduledCount: number;
  paidCount: number;
  overdueCount: number;
  revenue: number;
  dateRange: DateRange;
  currentGym: any;
}> = ({ scheduledCount, paidCount, overdueCount, revenue, dateRange, currentGym }) => {
  return (
    <Card className="bg-white/10 border-white/20 mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-white">Totals</CardTitle>
          <div className="text-white text-sm">
            {dateRange.from && dateRange.to && (
              `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-8">
          <StatCircle count={scheduledCount} label="Scheduled" />
          <StatCircle count={paidCount} label="Paid" />
          <StatCircle count={overdueCount} label="Overdue" />
          <RevenueSection revenue={revenue} currentGym={currentGym} />
        </div>
      </CardContent>
    </Card>
  );
};

const StatCircle: React.FC<{ count: number; label: string }> = ({ count, label }) => (
  <div className="text-center">
    <div className="relative inline-flex items-center justify-center w-32 h-32 mb-2">
      <svg className="w-32 h-32 transform -rotate-90">
        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-white/20" />
        <circle 
          cx="64" 
          cy="64" 
          r="56" 
          stroke="currentColor" 
          strokeWidth="8" 
          fill="none" 
          className="text-teal-400" 
          strokeDasharray={`${count * 35.2} 352`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white">{count}</span>
      </div>
    </div>
    <p className="text-white font-medium">{label}</p>
  </div>
);

const RevenueSection: React.FC<{ revenue: number; currentGym: any }> = ({ revenue, currentGym }) => (
  <div className="flex flex-col justify-center">
    <p className="text-white/70 text-sm mb-2">Revenue</p>
    <p className="text-4xl font-bold text-white mb-4">{formatCurrency(revenue)}</p>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-white/70">{currentGym?.currency || 'USD'} {revenue * 0.8}</span>
        <span className="text-white/70">Previous Period</span>
      </div>
      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-green-400 to-lime-400" style={{width: '75%'}}></div>
      </div>
    </div>
  </div>
);

// Payment Section Component
const PaymentSection: React.FC<{
  title: string;
  payments: Payment[];
  members: Member[];
  onViewInvoice: (payment: Payment) => void;
  onEditPayment: (payment: Payment) => void;
  getMemberBadge: (payment: Payment) => string;
  emptyMessage: string;
  emptyIcon: React.ComponentType<any>;
}> = ({ title, payments, members, onViewInvoice, onEditPayment, getMemberBadge, emptyMessage, emptyIcon: EmptyIcon }) => {
  return (
    <Card className="bg-white/10 border-white/20 mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-white">{title}</CardTitle>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium">
            {title.toUpperCase()}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 pb-3 mb-4 border-b border-white/20">
          <div className="text-white/70 text-sm font-medium">MEMBER</div>
          <div className="text-white/70 text-sm font-medium">AMOUNT</div>
          <div className="text-white/70 text-sm font-medium">DESCRIPTION</div>
          <div className="text-white/70 text-sm font-medium">INVOICE #</div>
          <div className="text-white/70 text-sm font-medium">STATUS</div>
        </div>

        {/* Payment Rows */}
        <div className="space-y-3">
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <EmptyIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <p className="text-white/70 text-lg">{emptyMessage}</p>
            </div>
          ) : (
            payments.map((payment) => (
              <PaymentRow 
                key={payment.id} 
                payment={payment} 
                members={members}
                onViewInvoice={onViewInvoice}
                onEditPayment={onEditPayment}
                getMemberBadge={getMemberBadge}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Edit Payment Dialog Component
const EditPaymentDialog: React.FC<{
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: Payment) => void;
  members: Member[];
  currentUser: CurrentUser;
}> = ({ payment, isOpen, onClose, onSave, members, currentUser }) => {
  const [formData, setFormData] = useState<Payment | null>(null);

  React.useEffect(() => {
    if (payment) {
      setFormData({ ...payment });
    }
  }, [payment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Payment - {formData.invoiceNumber}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="member">Member</Label>
              <Select 
                value={formData.memberId} 
                onValueChange={(value) => {
                  const member = members.find(m => m.id === value);
                  setFormData({
                    ...formData, 
                    memberId: value, 
                    memberName: member?.name || '',
                    memberEmail: member?.email || ''
                  });
                }}
              >
                <SelectTrigger className="bg-white/10 border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {members.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                className="bg-white/10 border-white/20"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: 'paid' | 'overdue' | 'pending') => setFormData({...formData, status: value})}
              >
                <SelectTrigger className="bg-white/10 border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="bg-white/10 border-white/20"
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select 
                value={formData.paymentMethod} 
                onValueChange={(value) => setFormData({...formData, paymentMethod: value})}
              >
                <SelectTrigger className="bg-white/10 border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Manual Payment">Manual Payment</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="bg-white/10 border-white/20"
              />
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="bg-white/10 border-white/20"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="border-white/20">
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Email Dialog Component
const EmailDialog: React.FC<{
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onSend: (payment: Payment, message: string) => void;
  currentGym: any;
}> = ({ payment, isOpen, onClose, onSend, currentGym }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!payment) return;
    
    setIsSending(true);
    await onSend(payment, message);
    setIsSending(false);
    setMessage('');
    onClose();
  };

  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Invoice via Email</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 ">
          <div>
            <Label>To:</Label>
            <p className="text-white font-medium">{payment.memberName} &lt;{payment.memberEmail}&gt;</p>
          </div>

          <div>
            <Label>Subject:</Label>
            <p className="text-white">Invoice {payment.invoiceNumber} - {currentGym?.name || 'Avancia Fitness'}</p>
          </div>

          <div>
            <Label htmlFor="message">Additional Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message to the email..."
              className="bg-white/10 border-white/20 min-h-[120px]"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="border-white/20">
              Cancel
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={isSending}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isSending ? 'Sending...' : 'Send Invoice'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Invoice Dialog Component
const InvoiceDialog: React.FC<{
  invoice: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser;
  currentGym: any;
  onMarkPaid: () => void;
  onEdit: (invoice: Payment) => void;
  onPrint: (invoice: Payment) => void;
  onEmail: (invoice: Payment) => void;
}> = ({ invoice, isOpen, onClose, currentUser, currentGym, onMarkPaid, onEdit, onPrint, onEmail }) => {
  if (!invoice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto bg-white">
        <DialogHeader>
          <DialogTitle className="sr-only">Invoice Details</DialogTitle>
        </DialogHeader>
        
        <div className="bg-background/50 rounded-md text-white p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex items-center space-x-2 px-3 py-1.5 hover:bg-white/20 text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                onClick={() => onEdit(invoice)}
                className="flex items-center space-x-2 px-3 py-1.5 hover:bg-white/20 text-white"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => onEmail(invoice)}
                className="flex items-center space-x-2 px-3 py-1.5 hover:bg-white/20 text-white"
              >
                <Mail className="h-4 w-4" />
                <span>Send Email</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => onPrint(invoice)}
                className="flex items-center space-x-2 px-3 py-1.5 hover:bg-white/20 text-white"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">❤️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{currentGym?.name || 'Avancia Fitness'}</h2>
            </div>
            <div className="text-right">
              <h3 className="text-xl font-bold text-gray-900">Invoice {invoice.invoiceNumber}</h3>
              <p className="text-gray-500 text-sm">{invoice.date}</p>
              <p className="text-gray-900 font-medium mt-1">Due Date: {invoice.dueDate}</p>
            </div>
          </div>

          <div>
            <p className="text-gray-600 text-sm mb-1">Billed to</p>
            <p className="text-xl font-semibold text-gray-900">{invoice.memberName}</p>
            <p className="text-gray-600">{invoice.memberEmail}</p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-4 gap-4 mb-2 pb-2 border-b border-gray-200">
              <div className="text-gray-600 font-medium text-sm">SCHEDULED</div>
              <div className="text-gray-600 font-medium text-sm">DESCRIPTION</div>
              <div className="text-gray-600 font-medium text-sm">PAYMENT METHOD</div>
              <div className="text-gray-600 font-medium text-sm text-right">AMOUNT</div>
            </div>
            <div className="grid grid-cols-4 gap-4 py-3">
              <div className="text-gray-900">{invoice.scheduled}</div>
              <div className="text-gray-900">{invoice.description}</div>
              <div className="text-gray-900">{invoice.paymentMethod}</div>
              <div className="text-gray-900 font-bold text-right">{formatCurrency(invoice.amount)}</div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold text-gray-900">Total Remaining</span>
              <span className="font-bold text-gray-900 text-2xl">{formatCurrency(invoice.amount)}</span>
            </div>
          </div>

          {invoice.status === 'overdue' && (
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>CANCEL</span>
              </Button>
              <Button
                onClick={onMarkPaid}
                className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <CheckCircle className="h-4 w-4" />
                <span>MARK PAID</span>
              </Button>
            </div>
          )}

          {invoice.updatedBy && (
            <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
              Last updated by {invoice.updatedBy} {invoice.updatedAt && `on ${new Date(invoice.updatedAt).toLocaleString()}`}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Types
type BillingSection = 'overview' | 'payments' | 'recurring' | 'discounts' | 'payment-forms' | 'accounting' | 'growth' | 'settings';

// Main Billing Component
export default function Billing() {
  const { user, currentGym } = useAuth();
  const [currentSection, setCurrentSection] = useState<BillingSection>('overview');
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [members] = useState<Member[]>(demoMembers);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<Payment | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState<boolean>(false);
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [showEmailDialog, setShowEmailDialog] = useState<boolean>(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [emailingPayment, setEmailingPayment] = useState<Payment | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(2025, 10, 1),
    to: new Date(2025, 10, 30)
  });

  const tabs = [
    { id: 'overview' as BillingSection, label: 'Overview', icon: BarChart3 },
    { id: 'payments' as BillingSection, label: 'Payments', icon: CreditCard },
    { id: 'recurring' as BillingSection, label: 'Recurring', icon: TrendingUp },
    { id: 'discounts' as BillingSection, label: 'Discounts', icon: Users },
    { id: 'payment-forms' as BillingSection, label: 'Payment Forms', icon: FileText },
    { id: 'accounting' as BillingSection, label: 'Accounting', icon: Building2 },
    { id: 'growth' as BillingSection, label: 'Growth', icon: TrendingUp },
    { id: 'settings' as BillingSection, label: 'Settings', icon: Settings },
  ];

  // Payment Management Functions
  const updatePaymentStatus = (paymentId: string, newStatus: 'paid' | 'overdue' | 'pending'): void => {
    const updatedPayments = payments.map((payment) => {
      if (payment.id === paymentId) {
        return {
          ...payment,
          status: newStatus,
          updatedBy: user?.email || 'Unknown User',
          updatedAt: new Date().toISOString(),
          paidDate: newStatus === 'paid' ? new Date().toLocaleDateString('en-GB') : undefined
        };
      }
      return payment;
    });

    setPayments(updatedPayments);
  };

  const handleEditPayment = (payment: Payment): void => {
    setEditingPayment(payment);
    setShowEditDialog(true);
    setShowInvoiceDialog(false);
  };

  const handleSavePayment = (updatedPayment: Payment): void => {
    const updatedPayments = payments.map(p => 
      p.id === updatedPayment.id ? updatedPayment : p
    );
    setPayments(updatedPayments);
    setShowEditDialog(false);
    setEditingPayment(null);
  };

  const handlePrintInvoice = (payment: Payment): void => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${payment.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #dc2626; }
            .company { font-size: 24px; font-weight: bold; color: #dc2626; }
            .invoice-details { text-align: right; }
            .section { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .total { font-size: 18px; font-weight: bold; margin-top: 20px; padding-top: 20px; border-top: 2px solid #333; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: bold; }
            .status-overdue { background-color: #fef2f2; color: #dc2626; }
            .status-paid { background-color: #f0fdf4; color: #16a34a; }
            .status-pending { background-color: #fffbeb; color: #d97706; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="company">${currentGym?.name || 'Avancia Fitness'}</div>
              <p>${currentGym?.settings?.address || '123 Fitness Street'}<br />${currentGym?.settings?.location ? [currentGym.settings.location.region, currentGym.settings.location.district].filter(Boolean).join(', ') || 'Sports City' : 'Sports City'}<br />Phone: ${currentGym?.settings?.phone || '(555) 123-4567'}</p>
            </div>
            <div class="invoice-details">
              <h2>INVOICE ${payment.invoiceNumber}</h2>
              <p><strong>Date:</strong> ${payment.date}</p>
              <p><strong>Due Date:</strong> ${payment.dueDate}</p>
              <p class="status status-${payment.status}">${payment.status.toUpperCase()}</p>
            </div>
          </div>
          
          <div class="section">
            <strong>Billed To:</strong>
            <p>${payment.memberName}<br />${payment.memberEmail}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Payment Method</th>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${payment.description}</td>
                <td>${payment.paymentMethod}</td>
                <td>${payment.date}</td>
                <td>${formatCurrency(payment.amount)}</td>
              </tr>
            </tbody>
          </table>

          <div class="total" style="text-align: right;">
            Total Amount: ${formatCurrency(payment.amount)}
          </div>

          <div class="section">
            <p><strong>Payment Terms:</strong> Please pay within 15 days of receipt.</p>
            <p>Thank you for your business!</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 1000);
            }
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleSendEmail = async (payment: Payment, message: string): Promise<void> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update payment with last sent timestamp
    const updatedPayments = payments.map(p => 
      p.id === payment.id 
        ? { ...p, lastSent: new Date().toISOString() }
        : p
    );
    setPayments(updatedPayments);
    
    // Show success message
    alert(`✅ Invoice ${payment.invoiceNumber} has been sent to ${payment.memberName} at ${payment.memberEmail}`);
  };

  const handleEmailInvoice = (payment: Payment): void => {
    setEmailingPayment(payment);
    setShowEmailDialog(true);
    setShowInvoiceDialog(false);
  };

  const viewInvoice = (payment: Payment): void => {
    setSelectedInvoice(payment);
    setShowInvoiceDialog(true);
  };

  const markInvoicePaid = (): void => {
    if (selectedInvoice) {
      updatePaymentStatus(selectedInvoice.id, 'paid');
      setShowInvoiceDialog(false);
      setSelectedInvoice(null);
    }
  };

  // Filtering and Data Processing
  const filteredPayments = payments.filter((payment) =>
    payment.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const overduePayments = filteredPayments.filter((p) => p.status === 'overdue');
  const paidPayments = filteredPayments.filter((p) => p.status === 'paid');
  const pendingPayments = filteredPayments.filter((p) => p.status === 'pending');
  const scheduledCount = pendingPayments.length;
  const revenue = paidPayments.reduce((total, payment) => total + payment.amount, 0);

  const getMemberBadge = (payment: Payment): string => {
    const memberData = members.find((m) => m.id === payment.memberId);
    return memberData ? `${memberData.type} | Active` : 'Member | Active';
  };

  // Render the appropriate component based on current section
  const renderSection = () => {
    switch (currentSection) {
      case 'overview':
        return (
          <>
            <StatsOverview
              scheduledCount={scheduledCount}
              paidCount={paidPayments.length}
              overdueCount={overduePayments.length}
              revenue={revenue}
              dateRange={dateRange}
              currentGym={currentGym}
            />

            <PaymentSection
              title="Overdue Payments"
              payments={overduePayments}
              members={members}
              onViewInvoice={viewInvoice}
              onEditPayment={handleEditPayment}
              getMemberBadge={getMemberBadge}
              emptyMessage="No overdue payments"
              emptyIcon={CheckCircle}
            />

            <PaymentSection
              title="Recent Payments"
              payments={paidPayments}
              members={members}
              onViewInvoice={viewInvoice}
              onEditPayment={handleEditPayment}
              getMemberBadge={getMemberBadge}
              emptyMessage="No recent payments"
              emptyIcon={CreditCard}
            />

            <PaymentSection
              title="Scheduled Payments"
              payments={pendingPayments}
              members={members}
              onViewInvoice={viewInvoice}
              onEditPayment={handleEditPayment}
              getMemberBadge={getMemberBadge}
              emptyMessage="No scheduled payments"
              emptyIcon={Clock}
            />

            {/* Dialogs */}
            <InvoiceDialog
              invoice={selectedInvoice}
              isOpen={showInvoiceDialog}
              onClose={() => setShowInvoiceDialog(false)}
              currentUser={user || { name: 'Admin', email: 'admin@example.com' }}
              currentGym={currentGym}
              onMarkPaid={markInvoicePaid}
              onEdit={handleEditPayment}
              onPrint={handlePrintInvoice}
              onEmail={handleEmailInvoice}
            />

            <EditPaymentDialog
              payment={editingPayment}
              isOpen={showEditDialog}
              onClose={() => {
                setShowEditDialog(false);
                setEditingPayment(null);
              }}
              onSave={handleSavePayment}
              members={members}
              currentUser={user || { name: 'Admin', email: 'admin@example.com' }}
            />

            <EmailDialog
              payment={emailingPayment}
              isOpen={showEmailDialog}
              onClose={() => {
                setShowEmailDialog(false);
                setEmailingPayment(null);
              }}
              onSend={handleSendEmail}
              currentGym={currentGym}
            />
          </>
        );
      case 'payments':
        return <PaymentManagement />;
      case 'recurring':
        // return <RecurringBilling />;
      case 'discounts':
        // return <DiscountManagement />;
      case 'payment-forms':
        return <PaymentForms />;
      case 'accounting':
        return <Accounting />;
      case 'growth':
        return <Growth />;
      case 'settings':
        // return <BillingSettings user={user} currentGym={currentGym} />;
      default:
        return (
          <>
            <StatsOverview
              scheduledCount={scheduledCount}
              paidCount={paidPayments.length}
              overdueCount={overduePayments.length}
              revenue={revenue}
              dateRange={dateRange}
              currentGym={currentGym}
            />

            <PaymentSection
              title="Overdue Payments"
              payments={overduePayments}
              members={members}
              onViewInvoice={viewInvoice}
              onEditPayment={handleEditPayment}
              getMemberBadge={getMemberBadge}
              emptyMessage="No overdue payments"
              emptyIcon={CheckCircle}
            />

            <PaymentSection
              title="Recent Payments"
              payments={paidPayments}
              members={members}
              onViewInvoice={viewInvoice}
              onEditPayment={handleEditPayment}
              getMemberBadge={getMemberBadge}
              emptyMessage="No recent payments"
              emptyIcon={CreditCard}
            />

            <PaymentSection
              title="Scheduled Payments"
              payments={pendingPayments}
              members={members}
              onViewInvoice={viewInvoice}
              onEditPayment={handleEditPayment}
              getMemberBadge={getMemberBadge}
              emptyMessage="No scheduled payments"
              emptyIcon={Clock}
            />
          </>
        );
    }
  };

  return (
    <LayoutWithSidebar>
      <div>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 mb-2">
              <CreditCard className="h-6 w-6 text-lime-400" />
              <h1 className="text-2xl font-bold text-white">Billing</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                {user && (
                  <>
                    <User className="h-5 w-5" />
                    <span>{user.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <p className="text-lg font-bold text-white">{currentGym?.name || 'Avancia Fitness'}</p>
        </div>

        {/* Search and Filters */}
        {currentSection === 'overview' && (
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
              <Input
                placeholder="Search payments, members, or invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/70"
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => setDateRange(range as DateRange)}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white/10 p-1 rounded-lg w-fit">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentSection === tab.id;
              
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => setCurrentSection(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-sidebar-foreground/80 text-white' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Section Content */}
        {renderSection()}
      </div>
    </LayoutWithSidebar>
  );
}