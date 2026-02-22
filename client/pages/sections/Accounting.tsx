import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

// Mock data - expanded for different date ranges
const allRevenueData = [
  // Daily data (last 7 days)
  { date: '2025-11-21', revenue: 1200, memberships: 800, training: 300, classes: 100, day: 'Mon' },
  { date: '2025-11-22', revenue: 1800, memberships: 1000, training: 500, classes: 300, day: 'Tue' },
  { date: '2025-11-23', revenue: 1500, memberships: 900, training: 400, classes: 200, day: 'Wed' },
  { date: '2025-11-24', revenue: 2200, memberships: 1200, training: 600, classes: 400, day: 'Thu' },
  { date: '2025-11-25', revenue: 1900, memberships: 1100, training: 500, classes: 300, day: 'Fri' },
  { date: '2025-11-26', revenue: 2100, memberships: 1300, training: 500, classes: 300, day: 'Sat' },
  { date: '2025-11-27', revenue: 2400, memberships: 1400, training: 600, classes: 400, day: 'Sun' },
  
  // Weekly data (last 8 weeks)
  { date: '2025-10-01', revenue: 12500, memberships: 8500, training: 2500, classes: 1500, week: 'Week 1' },
  { date: '2025-10-08', revenue: 13200, memberships: 9200, training: 2600, classes: 1400, week: 'Week 2' },
  { date: '2025-10-15', revenue: 11800, memberships: 7800, training: 2400, classes: 1600, week: 'Week 3' },
  { date: '2025-10-22', revenue: 14200, memberships: 9800, training: 2800, classes: 1600, week: 'Week 4' },
  { date: '2025-11-01', revenue: 12800, memberships: 8800, training: 2500, classes: 1500, week: 'Week 5' },
  { date: '2025-11-08', revenue: 15600, memberships: 10800, training: 3000, classes: 1800, week: 'Week 6' },
  { date: '2025-11-15', revenue: 14900, memberships: 10200, training: 2800, classes: 1900, week: 'Week 7' },
  { date: '2025-11-22', revenue: 16200, memberships: 11200, training: 3200, classes: 1800, week: 'Week 8' },
  
  // Monthly data (last 12 months)
  { date: '2024-12-01', revenue: 45200, memberships: 31200, training: 8500, classes: 5500, month: 'Dec' },
  { date: '2025-01-01', revenue: 48500, memberships: 33500, training: 9200, classes: 5800, month: 'Jan' },
  { date: '2025-02-01', revenue: 51200, memberships: 35200, training: 9800, classes: 6200, month: 'Feb' },
  { date: '2025-03-01', revenue: 49800, memberships: 34200, training: 9500, classes: 6100, month: 'Mar' },
  { date: '2025-04-01', revenue: 52300, memberships: 36100, training: 10200, classes: 6000, month: 'Apr' },
  { date: '2025-05-01', revenue: 54100, memberships: 37200, training: 10800, classes: 6100, month: 'May' },
  { date: '2025-06-01', revenue: 52800, memberships: 36500, training: 10500, classes: 5800, month: 'Jun' },
  { date: '2025-07-01', revenue: 56200, memberships: 38800, training: 11200, classes: 6200, month: 'Jul' },
  { date: '2025-08-01', revenue: 57800, memberships: 39800, training: 11500, classes: 6500, month: 'Aug' },
  { date: '2025-09-01', revenue: 59100, memberships: 40800, training: 11800, classes: 6500, month: 'Sep' },
  { date: '2025-10-01', revenue: 61200, memberships: 42200, training: 12500, classes: 6500, month: 'Oct' },
  { date: '2025-11-01', revenue: 63500, memberships: 43800, training: 13000, classes: 6700, month: 'Nov' },
];

const allTransactions = [
  { id: 'TX-7842', date: '2025-11-27', description: 'Monthly Membership - Premium', customer: 'John Smith', amount: 89.00, status: 'completed', category: 'memberships' },
  { id: 'TX-7841', date: '2025-11-26', description: 'Personal Training Session', customer: 'Sarah Johnson', amount: 65.00, status: 'completed', category: 'training' },
  { id: 'TX-7840', date: '2025-11-25', description: 'Annual Membership Renewal', customer: 'Michael Brown', amount: 950.00, status: 'pending', category: 'memberships' },
  { id: 'TX-7839', date: '2025-11-24', description: 'Yoga Class Package', customer: 'Emily Davis', amount: 120.00, status: 'completed', category: 'classes' },
  { id: 'TX-7838', date: '2025-11-23', description: 'Refund - Cancellation', customer: 'Robert Wilson', amount: -89.00, status: 'completed', category: 'refunds' },
  { id: 'TX-7837', date: '2025-11-22', description: 'Monthly Membership - Basic', customer: 'Lisa Anderson', amount: 49.00, status: 'failed', category: 'memberships' },
  { id: 'TX-7836', date: '2025-11-21', description: 'Personal Training Package', customer: 'David Lee', amount: 450.00, status: 'completed', category: 'training' },
  { id: 'TX-7835', date: '2025-11-20', description: 'Pilates Class', customer: 'Maria Garcia', amount: 25.00, status: 'completed', category: 'classes' },
  { id: 'TX-7834', date: '2025-11-19', description: 'Annual Membership', customer: 'James Wilson', amount: 899.00, status: 'completed', category: 'memberships' },
  { id: 'TX-7833', date: '2025-11-18', description: 'Refund - Service Issue', customer: 'Sarah Johnson', amount: -65.00, status: 'completed', category: 'refunds' },
  { id: 'TX-7832', date: '2025-11-17', description: 'Monthly Membership - Premium', customer: 'Mike Chen', amount: 89.00, status: 'completed', category: 'memberships' },
  { id: 'TX-7831', date: '2025-11-16', description: 'Group Class Package', customer: 'Emma Thompson', amount: 180.00, status: 'pending', category: 'classes' },
  { id: 'TX-7830', date: '2025-11-15', description: 'Personal Training Session', customer: 'Alex Rodriguez', amount: 65.00, status: 'completed', category: 'training' },
  { id: 'TX-7829', date: '2025-11-14', description: 'Monthly Membership - Basic', customer: 'Sophia Martinez', amount: 49.00, status: 'completed', category: 'memberships' },
  { id: 'TX-7828', date: '2025-11-13', description: 'Yoga Class Drop-in', customer: 'Daniel Kim', amount: 20.00, status: 'completed', category: 'classes' },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'completed': return 'default';
    case 'pending': return 'secondary';
    case 'failed': return 'destructive';
    default: return 'outline';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const calculateStats = (transactions: any[], dateRange: string) => {
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  const totalRevenue = completedTransactions.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0);
  const baseAmount = completedTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const refunds = Math.abs(completedTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0));
  const netRevenue = totalRevenue - refunds;
  const newMembers = transactions.filter(t => 
    t.category === 'memberships' && t.status === 'completed' && t.amount > 0
  ).length;

  // Calculate changes based on date range
  const getChange = (current: number, range: string) => {
    const previousMultipliers = {
      today: 0.85,
      yesterday: 0.92,
      week: 0.88,
      month: 0.78,
      quarter: 0.65,
      year: 0.45
    };
    const previous = current * (previousMultipliers[range as keyof typeof previousMultipliers] || 0.85);
    const change = ((current - previous) / previous) * 100;
    return {
      value: change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`,
      trend: change >= 0 ? 'up' : 'down'
    };
  };

  return [
    { 
      title: 'Total Revenue', 
      value: formatCurrency(totalRevenue), 
      ...getChange(totalRevenue, dateRange)
    },
    { 
      title: 'Base Amount', 
      value: formatCurrency(baseAmount), 
      ...getChange(baseAmount, dateRange)
    },
    { 
      title: 'Refunds', 
      value: formatCurrency(refunds), 
      ...getChange(refunds, dateRange)
    },
    { 
      title: 'Net Revenue', 
      value: formatCurrency(netRevenue), 
      ...getChange(netRevenue, dateRange)
    },
    { 
      title: 'New Members', 
      value: newMembers.toString(), 
      ...getChange(newMembers, dateRange)
    },
  ];
};

const getFilteredData = (dateRange: string) => {
  const today = new Date('2025-11-27'); // Fixed reference date for consistency
  
  switch (dateRange) {
    case 'today':
      return allRevenueData.filter(d => d.date === '2025-11-27').slice(0, 1);
    case 'yesterday':
      return allRevenueData.filter(d => d.date === '2025-11-26').slice(0, 1);
    case 'week':
      return allRevenueData.filter(d => {
        const date = new Date(d.date);
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return date >= startOfWeek && date <= today && d.day;
      });
    case 'month':
      return allRevenueData.filter(d => {
        const date = new Date(d.date);
        return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear() && d.day;
      });
    case 'quarter':
      return allRevenueData.filter(d => d.month && ['Oct', 'Nov', 'Dec'].includes(d.month));
    case 'year':
      return allRevenueData.filter(d => d.month);
    default:
      return allRevenueData.filter(d => d.day).slice(0, 7); // Default to current week
  }
};

const getFilteredTransactions = (dateRange: string) => {
  const today = new Date('2025-11-27');
  
  switch (dateRange) {
    case 'today':
      return allTransactions.filter(t => t.date === '2025-11-27');
    case 'yesterday':
      return allTransactions.filter(t => t.date === '2025-11-26');
    case 'week':
      return allTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return transactionDate >= startOfWeek && transactionDate <= today;
      });
    case 'month':
      return allTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === today.getMonth() && 
               transactionDate.getFullYear() === today.getFullYear();
      });
    case 'quarter':
      return allTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
        return transactionDate >= quarterStart && transactionDate <= today;
      });
    case 'year':
      return allTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getFullYear() === today.getFullYear();
      });
    default:
      return allTransactions;
  }
};

const getCategoryData = (transactions: any[]) => {
  const categories = {
    memberships: 0,
    training: 0,
    classes: 0,
    merchandise: 0,
    other: 0
  };

  transactions
    .filter(t => t.status === 'completed' && t.amount > 0)
    .forEach(t => {
      if (categories.hasOwnProperty(t.category)) {
        categories[t.category as keyof typeof categories] += t.amount;
      } else {
        categories.other += t.amount;
      }
    });

  const total = Object.values(categories).reduce((sum, value) => sum + value, 0);
  
  return [
    { name: 'Memberships', value: categories.memberships, percent: (categories.memberships / total) * 100, color: '#3b82f6' },
    { name: 'Personal Training', value: categories.training, percent: (categories.training / total) * 100, color: '#8b5cf6' },
    { name: 'Group Classes', value: categories.classes, percent: (categories.classes / total) * 100, color: '#06b6d4' },
    { name: 'Merchandise', value: categories.merchandise, percent: (categories.merchandise / total) * 100, color: '#10b981' },
    { name: 'Other', value: categories.other, percent: (categories.other / total) * 100, color: '#f59e0b' },
  ].filter(item => item.value > 0);
};

export default function Accounting() {
  const [dateRange, setDateRange] = useState('week');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  // Get filtered data based on date range
  const filteredRevenueData = useMemo(() => 
    getFilteredData(dateRange), 
    [dateRange]
  );

  const filteredTransactions = useMemo(() => 
    getFilteredTransactions(dateRange), 
    [dateRange]
  );

  const categoryData = useMemo(() => 
    getCategoryData(filteredTransactions), 
    [filteredTransactions]
  );

  const stats = useMemo(() => 
    calculateStats(filteredTransactions, dateRange), 
    [filteredTransactions, dateRange]
  );

  // Search and filters
  const searchedTransactions = useMemo(() => {
    let filtered = filteredTransactions.filter(transaction =>
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.category === categoryFilter);
    }

    return filtered;
  }, [filteredTransactions, searchQuery, statusFilter, categoryFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(searchedTransactions.length / transactionsPerPage);
  const paginatedTransactions = useMemo(() => 
    searchedTransactions.slice(
      (currentPage - 1) * transactionsPerPage,
      currentPage * transactionsPerPage
    ), 
    [searchedTransactions, currentPage, transactionsPerPage]
  );

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, categoryFilter, dateRange]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const getXAxisKey = () => {
    if (dateRange === 'today' || dateRange === 'yesterday') return 'date';
    if (dateRange === 'week') return 'day';
    if (dateRange === 'month') return 'date';
    if (dateRange === 'quarter' || dateRange === 'year') return 'month';
    return 'date';
  };

  const getXAxisFormatter = (value: string) => {
    if (dateRange === 'today' || dateRange === 'yesterday') {
      return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (dateRange === 'week') return value;
    if (dateRange === 'month') return new Date(value).getDate().toString();
    if (dateRange === 'quarter' || dateRange === 'year') return value;
    return value;
  };

  // Get unique categories and statuses for filters
  const uniqueCategories = useMemo(() => {
    const categories = [...new Set(filteredTransactions.map(t => t.category))];
    return categories.filter(Boolean);
  }, [filteredTransactions]);

  const uniqueStatuses = useMemo(() => {
    return [...new Set(filteredTransactions.map(t => t.status))];
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      {/* Header with Date Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Accounting</h1>
          <p className="text-white/70 mt-1">Manage and analyze your financial data</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={(value) => {
            setDateRange(value);
          }}>
            <SelectTrigger className="w-[180px] bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20 text-white">
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-white/5 border-white/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-white/70 mb-1">{stat.title}</p>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <Badge 
                  variant={stat.trend === 'up' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {stat.title}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart - FIXED: Only shows revenue once */}
        <Card className="lg:col-span-2 bg-white/5 border-white/20 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Revenue Overview - {dateRange}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('line')}
                className="text-white border-white/20"
              >
                Line
              </Button>
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
                className="text-white border-white/20"
              >
                Bar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={filteredRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey={getXAxisKey()} 
                      stroke="#9CA3AF"
                      tickFormatter={getXAxisFormatter}
                    />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: 'white' }}
                      labelFormatter={(value) => `Date: ${value}`}
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Total Revenue"
                    />
                
                    <Line 
                      type="monotone" 
                      dataKey="classes" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Classes"
                    />
                  </LineChart>
                ) : (
                  <BarChart data={filteredRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey={getXAxisKey()} 
                      stroke="#9CA3AF"
                      tickFormatter={getXAxisFormatter}
                    />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: 'white' }}
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Total Revenue" />
                    {/* <Bar dataKey="memberships" fill="#8b5cf6" name="Memberships" />
                    <Bar dataKey="training" fill="#06b6d4" name="Training" /> */}
                     <Bar dataKey="classes" fill="#10b981" name="Classes" /> 
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="bg-white/5 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: 'white' }}
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="bg-white/5 border-white/20 backdrop-blur-sm">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-white">All Transactions</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 bg-white/5 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32 bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20 text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20 text-white">
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-white/20">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Transaction ID</th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Description</th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-white/70 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-white/10 last:border-0 hover:bg-white/5">
                      <td className="py-3 px-4 text-green-400 font-medium">{transaction.id}</td>
                      <td className="py-3 px-4 text-white">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-white">{transaction.description}</td>
                      <td className="py-3 px-4 text-white">{transaction.customer}</td>
                      <td className={`py-3 px-4 font-medium ${
                        transaction.amount < 0 ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getStatusVariant(transaction.status)}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-white/70">
                      No transactions found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {searchedTransactions.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
              <p className="text-white/70 text-sm">
                Showing {((currentPage - 1) * transactionsPerPage) + 1} to {Math.min(currentPage * transactionsPerPage, searchedTransactions.length)} of {searchedTransactions.length} transactions
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-white/20 text-white"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {getPageNumbers().map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className={`border-white/20 text-white min-w-10 ${
                      currentPage === page ? 'bg-white/10' : ''
                    }`}
                    onClick={() => handlePageClick(page)}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-white/20 text-white"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}