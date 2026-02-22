import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Users,
  ShoppingCart,
  Clock,
  DollarSign,
  HelpCircle,
  Calendar
} from 'lucide-react';

// TypeScript Interfaces
interface RevenueData {
  date: string;
  payingMembers: number;
  memberships: number;
  sales: number;
  pending: number;
  total: number;
  perMember: number;
  isCurrent?: boolean;
}

interface ChartData {
  month: string;
  revenue: number;
  projected?: number;
}

interface YearlyData {
  [year: string]: {
    yearToDate: ChartData[];
    endOfYear: ChartData[];
    revenueGrowth: RevenueData[];
  };
}

// Demo data for multiple years
const yearlyData: YearlyData = {
  '2025': {
    yearToDate: [
      { month: 'Jan', revenue: 0 },
      { month: 'Feb', revenue: 0 },
      { month: 'Mar', revenue: 0 },
      { month: 'Apr', revenue: 0 },
      { month: 'May', revenue: 0 },
      { month: 'Jun', revenue: 0 },
      { month: 'Jul', revenue: 0 },
      { month: 'Aug', revenue: 0 },
      { month: 'Sep', revenue: 200 },
      { month: 'Oct', revenue: 400 },
      { month: 'Nov', revenue: 600 },
      { month: 'Dec', revenue: 0 }
    ],
    endOfYear: [
      { month: 'Jan', revenue: 0 },
      { month: 'Feb', revenue: 0 },
      { month: 'Mar', revenue: 0 },
      { month: 'Apr', revenue: 0 },
      { month: 'May', revenue: 0 },
      { month: 'Jun', revenue: 0 },
      { month: 'Jul', revenue: 0 },
      { month: 'Aug', revenue: 0 },
      { month: 'Sep', revenue: 200 },
      { month: 'Oct', revenue: 400 },
      { month: 'Nov', revenue: 600 },
      { month: 'Dec', revenue: 800, projected: 800 }
    ],
    revenueGrowth: [
      {
        date: '11/2025',
        payingMembers: 1,
        memberships: 0,
        sales: 0,
        pending: 200,
        total: 200,
        perMember: 200,
        isCurrent: true
      },
      {
        date: '10/2025',
        payingMembers: 1,
        memberships: 0,
        sales: 0,
        pending: 200,
        total: 200,
        perMember: 200
      },
      {
        date: '09/2025',
        payingMembers: 1,
        memberships: 0,
        sales: 0,
        pending: 200,
        total: 200,
        perMember: 200
      },
      {
        date: '08/2025',
        payingMembers: 1,
        memberships: 0,
        sales: 0,
        pending: 0,
        total: 0,
        perMember: 0
      },
      {
        date: '07/2025',
        payingMembers: 1,
        memberships: 0,
        sales: 0,
        pending: 0,
        total: 0,
        perMember: 0
      },
      {
        date: '06/2025',
        payingMembers: 0,
        memberships: 0,
        sales: 0,
        pending: 0,
        total: 0,
        perMember: 0
      },
      {
        date: '05/2025',
        payingMembers: 0,
        memberships: 0,
        sales: 0,
        pending: 0,
        total: 0,
        perMember: 0
      },
      {
        date: '04/2025',
        payingMembers: 0,
        memberships: 0,
        sales: 0,
        pending: 0,
        total: 0,
        perMember: 0
      },
      {
        date: '03/2025',
        payingMembers: 0,
        memberships: 0,
        sales: 0,
        pending: 0,
        total: 0,
        perMember: 0
      },
      {
        date: '02/2025',
        payingMembers: 0,
        memberships: 0,
        sales: 0,
        pending: 0,
        total: 0,
        perMember: 0
      },
      {
        date: '01/2025',
        payingMembers: 0,
        memberships: 0,
        sales: 0,
        pending: 0,
        total: 0,
        perMember: 0
      }
    ]
  },
  '2024': {
    yearToDate: [
      { month: 'Jan', revenue: 100 },
      { month: 'Feb', revenue: 150 },
      { month: 'Mar', revenue: 200 },
      { month: 'Apr', revenue: 180 },
      { month: 'May', revenue: 220 },
      { month: 'Jun', revenue: 250 },
      { month: 'Jul', revenue: 300 },
      { month: 'Aug', revenue: 280 },
      { month: 'Sep', revenue: 320 },
      { month: 'Oct', revenue: 350 },
      { month: 'Nov', revenue: 400 },
      { month: 'Dec', revenue: 450 }
    ],
    endOfYear: [
      { month: 'Jan', revenue: 100 },
      { month: 'Feb', revenue: 150 },
      { month: 'Mar', revenue: 200 },
      { month: 'Apr', revenue: 180 },
      { month: 'May', revenue: 220 },
      { month: 'Jun', revenue: 250 },
      { month: 'Jul', revenue: 300 },
      { month: 'Aug', revenue: 280 },
      { month: 'Sep', revenue: 320 },
      { month: 'Oct', revenue: 350 },
      { month: 'Nov', revenue: 400 },
      { month: 'Dec', revenue: 500, projected: 500 }
    ],
    revenueGrowth: [
      {
        date: '12/2024',
        payingMembers: 2,
        memberships: 1,
        sales: 150,
        pending: 50,
        total: 450,
        perMember: 225
      },
      {
        date: '11/2024',
        payingMembers: 2,
        memberships: 1,
        sales: 120,
        pending: 80,
        total: 400,
        perMember: 200
      },
      // ... more 2024 data
    ]
  },
  '2023': {
    yearToDate: [
      { month: 'Jan', revenue: 50 },
      { month: 'Feb', revenue: 75 },
      { month: 'Mar', revenue: 100 },
      { month: 'Apr', revenue: 120 },
      { month: 'May', revenue: 150 },
      { month: 'Jun', revenue: 180 },
      { month: 'Jul', revenue: 200 },
      { month: 'Aug', revenue: 220 },
      { month: 'Sep', revenue: 250 },
      { month: 'Oct', revenue: 280 },
      { month: 'Nov', revenue: 300 },
      { month: 'Dec', revenue: 350 }
    ],
    endOfYear: [
      { month: 'Jan', revenue: 50 },
      { month: 'Feb', revenue: 75 },
      { month: 'Mar', revenue: 100 },
      { month: 'Apr', revenue: 120 },
      { month: 'May', revenue: 150 },
      { month: 'Jun', revenue: 180 },
      { month: 'Jul', revenue: 200 },
      { month: 'Aug', revenue: 220 },
      { month: 'Sep', revenue: 250 },
      { month: 'Oct', revenue: 280 },
      { month: 'Nov', revenue: 300 },
      { month: 'Dec', revenue: 400, projected: 400 }
    ],
    revenueGrowth: [
      {
        date: '12/2023',
        payingMembers: 1,
        memberships: 0,
        sales: 100,
        pending: 50,
        total: 350,
        perMember: 350
      },
      // ... more 2023 data
    ]
  }
};

const availableYears = Object.keys(yearlyData).sort((a, b) => parseInt(b) - parseInt(a));

export default function Growth() {
  const [selectedView, setSelectedView] = useState<'year-to-date' | 'end-of-year'>('year-to-date');
  const [selectedYear, setSelectedYear] = useState<string>('2025');

  // Get data for selected year
  const currentYearData = yearlyData[selectedYear];
  const currentData = selectedView === 'year-to-date' ? currentYearData.yearToDate : currentYearData.endOfYear;
  const revenueGrowthData = currentYearData.revenueGrowth;

  // Calculate totals based on selected view and year
  const totalRevenue = currentData.reduce((sum, item) => sum + item.revenue, 0);
  const totalProjected = selectedView === 'end-of-year' 
    ? currentData.reduce((sum, item) => sum + (item.projected || item.revenue), 0)
    : totalRevenue;
  
  // Calculate stats from revenue growth data
  const totalPayingMembers = revenueGrowthData.reduce((sum, item) => sum + item.payingMembers, 0);
  const totalMemberships = revenueGrowthData.reduce((sum, item) => sum + item.memberships, 0);
  const totalSales = revenueGrowthData.reduce((sum, item) => sum + item.sales, 0);
  const totalPending = revenueGrowthData.reduce((sum, item) => sum + item.pending, 0);
  const totalRevenueFromData = revenueGrowthData.reduce((sum, item) => sum + item.total, 0);
  const avgPerMember = totalPayingMembers > 0 ? Math.round(totalRevenueFromData / totalPayingMembers) : 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-3">
          <p className="text-gray-900 font-semibold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header with Year Selection and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Calendar className="h-5 w-5 text-white" />
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {availableYears.map(year => (
              <option key={year} value={year} className="bg-gray-800 text-white">
                {year}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={selectedView === 'year-to-date' ? 'default' : 'outline'}
            onClick={() => setSelectedView('year-to-date')}
            className={selectedView === 'year-to-date' 
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-0' 
              : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}
          >
            Year-to-date
          </Button>
          <Button
            variant={selectedView === 'end-of-year' ? 'default' : 'outline'}
            onClick={() => setSelectedView('end-of-year')}
            className={selectedView === 'end-of-year' 
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-0' 
              : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}
          >
            End of year projection
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Revenue Card */}
        <Card className="bg-white/10 border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium">Total Revenue</p>
                  <p className="text-xs text-white/50">{selectedYear} {selectedView === 'year-to-date' ? 'Year to date' : 'Projected'}</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-0">
                {selectedView === 'year-to-date' ? 'YTD' : 'Projected'}
              </Badge>
            </div>
            <p className="text-4xl font-bold text-white mb-2">
              ${selectedView === 'year-to-date' ? totalRevenueFromData.toLocaleString() : totalProjected.toLocaleString()}
            </p>
            <div className="flex items-center space-x-4 text-sm text-white/70">
              <span>Actual: ${totalRevenueFromData.toLocaleString()}</span>
              {selectedView === 'end-of-year' && (
                <span>Projected: ${totalProjected.toLocaleString()}</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="bg-white/10 border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Revenue Overview - {selectedYear}</h3>
              <div className="flex items-center space-x-2 text-sm text-white/70">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-emerald-400 rounded"></div>
                  <span>Revenue</span>
                </div>
                {selectedView === 'end-of-year' && (
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-400 rounded"></div>
                    <span>Projected</span>
                  </div>
                )}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="revenue" 
                  name="Revenue"
                  fill="url(#colorRevenue)"
                  radius={[4, 4, 0, 0]}
                />
                {selectedView === 'end-of-year' && (
                  <Bar 
                    dataKey="projected" 
                    name="Projected"
                    fill="url(#colorProjected)"
                    radius={[4, 4, 0, 0]}
                  />
                )}
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#84cc16" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/10 border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/70 text-sm">Paying Members</p>
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{totalPayingMembers}</p>
            <p className="text-xs text-white/50 mt-1">Total active members</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/70 text-sm">Memberships</p>
              <ShoppingCart className="h-5 w-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">{totalMemberships}</p>
            <p className="text-xs text-white/50 mt-1">Membership sales</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/70 text-sm">Pending</p>
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">{totalPending}</p>
            <p className="text-xs text-white/50 mt-1">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/70 text-sm">Avg Per Member</p>
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">${avgPerMember}</p>
            <p className="text-xs text-white/50 mt-1">Average revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Growth Table */}
      <Card className="bg-white border-white/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900 text-xl font-bold">
              Revenue Growth - {selectedYear}
            </CardTitle>
            <Badge variant="outline" className="text-gray-600">
              {revenueGrowthData.length} months
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 uppercase">Paying Members</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 uppercase">Memberships</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 uppercase">Sales</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 uppercase">
                    <div className="flex items-center space-x-1">
                      <span>Pending</span>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 uppercase">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 uppercase">Per Member</th>
                </tr>
              </thead>
              <tbody>
                {/* Total Row */}
                <tr className="border-b border-gray-100 bg-gray-50 font-semibold">
                  <td className="py-3 px-4 text-gray-900">Total</td>
                  <td className="py-3 px-4 text-gray-900">{totalPayingMembers}</td>
                  <td className="py-3 px-4 text-gray-900">{totalMemberships}</td>
                  <td className="py-3 px-4 text-gray-900">{totalSales}</td>
                  <td className="py-3 px-4 text-gray-900">{totalPending}</td>
                  <td className="py-3 px-4 text-gray-900">${totalRevenueFromData.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-900">${avgPerMember.toLocaleString()}</td>
                </tr>

                {/* Data Rows */}
                {revenueGrowthData.map((row, index) => (
                  <tr 
                    key={index} 
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      row.isCurrent ? 'bg-emerald-50' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900">{row.date}</span>
                        {row.isCurrent && (
                          <Badge variant="secondary" className="bg-emerald-500 text-white text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{row.payingMembers}</td>
                    <td className="py-3 px-4 text-gray-900">{row.memberships}</td>
                    <td className="py-3 px-4 text-gray-900">${row.sales.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-900">${row.pending.toLocaleString()}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">${row.total.toLocaleString()}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">${row.perMember.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}