import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Printer,
  Mail,
  Trash2,
  Edit,
  RefreshCw,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  User,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Types
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
  status: 'paid' | 'scheduled' | 'overdue' | 'canceled';
  type: string;
  paymentMethod: string;
  scheduledDate?: string;
  paidDate?: string;
}

interface SortConfig {
  key: keyof Payment;
  direction: 'asc' | 'desc';
}

// Demo data
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
    status: 'scheduled',
    type: 'membership',
    paymentMethod: 'Manual Payment',
    scheduledDate: '13/11/2025',
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
    paidDate: '13/09/2025',
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
    paidDate: '13/08/2025',
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
    status: 'scheduled',
    type: 'membership',
    paymentMethod: 'Credit Card',
    scheduledDate: '15/12/2025',
  },
  {
    id: 'pay7',
    memberId: 'mem4',
    memberName: 'Mike Thompson',
    memberEmail: 'mike@example.com',
    amount: 180,
    description: 'Monthly membership fee',
    invoiceNumber: '#0000010',
    date: '2025-10-01',
    dueDate: '2025-10-15',
    status: 'canceled',
    type: 'membership',
    paymentMethod: 'Credit Card',
  },
];

// Utility functions
const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString()}`;
};

const getStatusConfig = (status: Payment['status']) => {
  const config = {
    paid: { variant: 'default' as const, text: 'Paid', icon: CheckCircle, color: 'text-green-400 bg-green-400/20' },
    scheduled: { variant: 'secondary' as const, text: 'Scheduled', icon: Clock, color: 'text-blue-400 bg-blue-400/20' },
    overdue: { variant: 'destructive' as const, text: 'Overdue', icon: AlertTriangle, color: 'text-red-400 bg-red-400/20' },
    canceled: { variant: 'outline' as const, text: 'Canceled', icon: XCircle, color: 'text-gray-400 bg-gray-400/20' },
  };
  return config[status];
};

// Main Payment Management Component
export default function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Payment['status'] | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<'delete' | 'email' | 'refund' | 'status'>();

  // Filter and sort payments
  const filteredAndSortedPayments = useMemo(() => {
    let filtered = payments.filter(payment => {
      const matchesSearch = 
        payment.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort payments
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [payments, searchQuery, statusFilter, sortConfig]);

  // Handle sort
  const handleSort = (key: keyof Payment) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedPayments.size === filteredAndSortedPayments.length) {
      setSelectedPayments(new Set());
    } else {
      setSelectedPayments(new Set(filteredAndSortedPayments.map(p => p.id)));
    }
  };

  const toggleSelectPayment = (paymentId: string) => {
    const newSelected = new Set(selectedPayments);
    if (newSelected.has(paymentId)) {
      newSelected.delete(paymentId);
    } else {
      newSelected.add(paymentId);
    }
    setSelectedPayments(newSelected);
  };

  // Bulk actions
  const handleBulkDelete = () => {
    setBulkAction('delete');
    setShowDeleteDialog(true);
  };

  const handleBulkEmail = () => {
    setBulkAction('email');
    setShowEmailDialog(true);
  };

  const handleBulkRefund = () => {
    setBulkAction('refund');
    setShowRefundDialog(true);
  };

  const confirmBulkAction = () => {
    if (bulkAction === 'delete') {
      setPayments(current => current.filter(p => !selectedPayments.has(p.id)));
      setSelectedPayments(new Set());
    }
    // Handle other bulk actions here
    
    setShowDeleteDialog(false);
    setShowEmailDialog(false);
    setShowRefundDialog(false);
    setBulkAction(undefined);
  };

  // Export functions
  const exportToCSV = () => {
    const headers = ['Member', 'Amount', 'Description', 'Invoice', 'Status', 'Date', 'Payment Method'];
    const csvData = filteredAndSortedPayments.map(payment => [
      payment.memberName,
      payment.amount,
      payment.description,
      payment.invoiceNumber,
      payment.status,
      payment.date,
      payment.paymentMethod,
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // In a real application, you would use a library like jsPDF
    alert('PDF export functionality would be implemented here');
  };

  const printPayments = () => {
    window.print();
  };

  // Status counts
  const statusCounts = useMemo(() => ({
    all: payments.length,
    scheduled: payments.filter(p => p.status === 'scheduled').length,
    overdue: payments.filter(p => p.status === 'overdue').length,
    canceled: payments.filter(p => p.status === 'canceled').length,
    paid: payments.filter(p => p.status === 'paid').length,
  }), [payments]);

  const SortableHeader: React.FC<{
    column: keyof Payment;
    children: React.ReactNode;
  }> = ({ column, children }) => (
    <th 
      className="text-left p-3 cursor-pointer hover:bg-white/10 transition-colors"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortConfig.key === column && (
          sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </th>
  );

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card className="bg-white/10 border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-xl font-bold text-white">Payment Management</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={printPayments}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={exportToPDF}>
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToCSV}>
                    Export as CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
            {[
              { key: 'all' as const, label: 'All', count: statusCounts.all },
              { key: 'scheduled' as const, label: 'Scheduled', count: statusCounts.scheduled },
              { key: 'overdue' as const, label: 'Overdue', count: statusCounts.overdue },
              { key: 'canceled' as const, label: 'Canceled', count: statusCounts.canceled },
              { key: 'paid' as const, label: 'Paid', count: statusCounts.paid },
            ].map(({ key, label, count }) => (
              <Button
                key={key}
                variant={statusFilter === key ? "default" : "ghost"}
                className={`flex-1 justify-center px-3 py-2 rounded text-sm font-medium transition-colors ${
                  statusFilter === key 
                    ? 'bg-lime-500 text-white' 
                    : 'text-white hover:bg-white/10'
                }`}
                onClick={() => setStatusFilter(key)}
              >
                {label} ({count})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card className="bg-white/10 border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
                <Input
                  placeholder="Search first or last name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/70"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={(value: Payment['status'] | 'all') => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>

            {selectedPayments.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm">
                  {selectedPayments.size} selected
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <MoreVertical className="h-4 w-4 mr-2" />
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleBulkEmail}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleBulkRefund}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refund Payments
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleBulkDelete}
                      className="text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Payments
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="bg-white/10 border-white/20">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="w-12 p-3">
                    <Checkbox
                      checked={selectedPayments.size === filteredAndSortedPayments.length && filteredAndSortedPayments.length > 0}
                      onCheckedChange={toggleSelectAll}
                      className="data-[state=checked]:bg-lime-500 data-[state=checked]:border-lime-500"
                    />
                  </th>
                  <SortableHeader column="memberName">MEMBER</SortableHeader>
                  <SortableHeader column="amount">AMOUNT</SortableHeader>
                  <SortableHeader column="description">DESCRIPTION</SortableHeader>
                  <SortableHeader column="invoiceNumber">INVOICE</SortableHeader>
                  <SortableHeader column="status">STATUS</SortableHeader>
                  <th className="text-left p-3">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedPayments.map((payment) => {
                  const statusConfig = getStatusConfig(payment.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <tr 
                      key={payment.id} 
                      className="border-b border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-3">
                        <Checkbox
                          checked={selectedPayments.has(payment.id)}
                          onCheckedChange={() => toggleSelectPayment(payment.id)}
                          className="data-[state=checked]:bg-lime-500 data-[state=checked]:border-lime-500"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{payment.memberName}</p>
                            <p className="text-white/50 text-sm">{payment.memberEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-white font-bold">{formatCurrency(payment.amount)}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-white">{payment.description}</p>
                        <p className="text-white/50 text-sm">{payment.paymentMethod}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-white font-mono">{payment.invoiceNumber}</p>
                        <p className="text-white/50 text-sm">{payment.date}</p>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={statusConfig.variant}
                          className={`${statusConfig.color} border-0`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.text}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-white/10"
                            >
                              <MoreVertical className="h-4 w-4 text-white" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Payment
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Refund Payment
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-400">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Payment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredAndSortedPayments.length === 0 && (
              <div className="text-center py-12">
                <p className="text-white/70 text-lg">No payments found</p>
                <p className="text-white/50 text-sm mt-2">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'No payments available'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Dialogs */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white/10 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Payments</DialogTitle>
          </DialogHeader>
          <p className="text-white/70">
            Are you sure you want to delete {selectedPayments.size} selected payment(s)? 
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBulkAction}
            >
              Delete Payments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="bg-white/10 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Send Email to Members</DialogTitle>
          </DialogHeader>
          <p className="text-white/70">
            Send email to {selectedPayments.size} selected member(s) regarding their payments.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium">Subject</label>
              <Input className="bg-white/10 border-white/20 text-white mt-1" />
            </div>
            <div>
              <label className="text-white text-sm font-medium">Message</label>
              <textarea 
                className="w-full h-32 bg-white/10 border border-white/20 rounded-md p-3 text-white mt-1 resize-none"
                placeholder="Enter your message here..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEmailDialog(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmBulkAction}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Send Emails
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent className="bg-white/10 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Refund Payments</DialogTitle>
          </DialogHeader>
          <p className="text-white/70">
            Process refunds for {selectedPayments.size} selected payment(s). 
            Refunds will be processed according to your payment gateway settings.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRefundDialog(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmBulkAction}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Process Refunds
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}