import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Printer, 
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Edit,
  UserPlus,
  LogIn,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Calendar,
  DollarSign,
  FileText,
  CreditCard,
  UserCheck,
  Settings,
  Eye
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { gymStorage } from '@/lib/storage';
import { gymMemberStorage, initializeGymData } from '@/lib/gym-storage';
import { Member } from '@shared/types';

interface MemberWithCheckIn extends Member {
  checkinCode: string;
  age: number;
  billingStatus: 'paid' | 'overdue' | 'pending';
}

type SortField = 'name' | 'age' | 'lastCheckin' | 'startDate';
type SortOrder = 'asc' | 'desc';

export const Members: React.FC = () => {
  const { user, currentGym } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [members, setMembers] = useState<MemberWithCheckIn[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showEditMember, setShowEditMember] = useState<string | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [membershipFilter, setMembershipFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>('all');

  // Load gym-specific members data
  useEffect(() => {
    if (currentGym) {
      // Initialize gym data if needed
      initializeGymData(currentGym.id);

      // Get members from gym-specific storage
      const gymMembers = gymMemberStorage.getAll(currentGym.id);

      // Convert to MemberWithCheckIn format with additional data
      const membersWithCheckIn: MemberWithCheckIn[] = gymMembers.map((member, index) => ({
        ...member,
        checkinCode: `${2000 + index}${member.id.slice(-2)}`,
        age: Math.floor(Math.random() * 30) + 20, // Random age between 20-50
        billingStatus: ['paid', 'overdue', 'pending'][Math.floor(Math.random() * 3)] as 'paid' | 'overdue' | 'pending'
      }));

      setMembers(membersWithCheckIn);
    }
  }, [currentGym]);

  // Sorting and filtering logic
  const filteredAndSortedMembers = useMemo(() => {
    let filtered = members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      const matchesMembership = membershipFilter === 'all' || member.membershipType.includes(membershipFilter);
      
      return matchesSearch && matchesStatus && matchesMembership;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'age':
          aValue = a.age;
          bValue = b.age;
          break;
        case 'lastCheckin':
          aValue = new Date(a.lastCheckin || 0).getTime();
          bValue = new Date(b.lastCheckin || 0).getTime();
          break;
        case 'startDate':
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [members, searchQuery, sortField, sortOrder, statusFilter, membershipFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedMembers.length / itemsPerPage);
  const paginatedMembers = filteredAndSortedMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === paginatedMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(paginatedMembers.map(m => m.id));
    }
  };

  const handleBulkAction = (action: string) => {
    showToast({
      type: 'success',
      title: 'Action Applied',
      message: `${action} applied to ${selectedMembers.length} members`
    });
    setSelectedMembers([]);
    setShowActions(false);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    showToast({
      type: 'success',
      title: 'Export Started',
      message: `Exporting ${filteredAndSortedMembers.length} members as ${format.toUpperCase()}`
    });
  };

  const handlePrint = () => {
    window.print();
    showToast({
      type: 'success',
      title: 'Print Started',
      message: 'Member list sent to printer'
    });
  };

  const handleMemberLogin = (member: MemberWithCheckIn) => {
    // Store member login data
    localStorage.setItem('member_login', JSON.stringify({
      memberId: member.id,
      gymId: member.gymId,
      email: member.email,
      checkinCode: member.checkinCode
    }));
    
    showToast({
      type: 'success',
      title: 'Member Portal Access',
      message: `Logging in ${member.name} to member portal`
    });
    
    // Navigate to member portal
    navigate('/member-portal');
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const getBillingStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-primary/20 text-primary';
      case 'overdue': return 'bg-destructive/20 text-destructive';
      case 'pending': return 'bg-warning/20 text-warning';
      default: return 'bg-muted/20 text-muted-foreground';
    }
  };

  if (!currentGym) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Gym Selected</h1>
          <p className="text-muted-foreground mb-4">Please select a gym to view members.</p>
          <Button asChild>
            <Link to="/gyms">Select Gym</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar (persistent) */}
      <div className="fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border flex flex-col py-4 z-40 w-[85px] lg:w-[85px]">
        <div className="flex items-center justify-center px-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Users className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>

        <div className="flex flex-col space-y-1 px-2 flex-1">
          {[
            { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
            { icon: Users, label: 'Members', path: '/members' },
            { icon: CreditCard, label: 'Billing', path: currentGym ? `/gyms/${currentGym.id}/billing` : '/gyms' },
            { icon: TrendingUp, label: 'Marketing', path: currentGym ? `/gyms/${currentGym.id}/marketing` : '/gyms' },
            { icon: Globe, label: 'Website', path: currentGym ? `/gyms/${currentGym.id}/website` : '/gyms' },
            { icon: FileText, label: 'Sales', path: currentGym ? `/gyms/${currentGym.id}/sales` : '/gyms' },
            { icon: Dumbbell, label: 'Gym', path: currentGym ? `/gyms/${currentGym.id}/gym` : '/gyms' },
            { icon: Settings, label: 'Settings', path: currentGym ? `/gyms/${currentGym.id}/settings` : '/gyms' },
            { icon: Building2, label: 'Front Desk', path: currentGym ? `/gyms/${currentGym.id}/front-desk` : '/gyms' },
            { icon: HelpCircle, label: 'Help', path: '/help' }
          ].map((it, idx) => {
            const Icon = it.icon as any;
            return (
              <Link to={it.path} key={idx} className="w-full">
                <Button variant="ghost" className="w-full flex flex-col items-center justify-center text-sidebar-foreground h-16 px-1 group">
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs text-sidebar-foreground/80">{it.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-white/20 bg-white/5 backdrop-blur-sm p-6 lg:ml-[85px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Members</h1>
              <p className="text-white/70">{currentGym.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-white/20 px-6">
        <div className="flex space-x-8">
          {['Members', 'Check-in', 'Attendance', 'Memberships', 'Rosters', 'Documents', 'Content', 'Growth', 'Settings'].map((tab) => (
            <button
              key={tab}
              className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                tab === 'Members' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-white/70 hover:text-white hover:border-white/20'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-[85px] p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
              <Input
                placeholder="Search first or last name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Filter className="h-4 w-4 mr-2" />
              FILTER
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              className="bg-primary hover:bg-primary/80"
              onClick={() => {
                const assignment = user?.gymAssignments?.find(a => a.gymId === currentGym?.id);
                const canEdit = assignment?.permissions?.includes('edit_members') || user?.role === 'admin' || user?.role === 'owner';
                if (!canEdit) {
                  showToast({ type: 'error', title: 'Permission denied', message: 'You do not have permission to add members' });
                  return;
                }
                setShowEditMember('new');
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              ADD MEMBER
            </Button>
            
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              INVITE
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Printer className="h-4 w-4 mr-2" />
              PRINT
            </Button>
            
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowActions(!showActions)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Download className="h-4 w-4 mr-2" />
                EXPORT
              </Button>
              
              {showActions && (
                <div className="absolute top-full right-0 mt-2 w-32 bg-background border border-white/20 rounded-lg shadow-lg z-50">
                  <div className="p-2 space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-white hover:bg-white/10"
                      onClick={() => handleExport('csv')}
                    >
                      CSV
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-white hover:bg-white/10"
                      onClick={() => handleExport('pdf')}
                    >
                      PDF
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-white">Membership</Label>
                  <Select value={membershipFilter} onValueChange={setMembershipFilter}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Memberships</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Annual">Annual</SelectItem>
                      <SelectItem value="No Active">No Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-white">Join Date</Label>
                  <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="last30">Last 30 days</SelectItem>
                      <SelectItem value="last90">Last 90 days</SelectItem>
                      <SelectItem value="last365">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Members Table */}
        <Card className="bg-white/10 border-white/20">
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="flex items-center space-x-4 p-4 border-b border-white/20">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-primary text-primary-foreground">
                  Members {filteredAndSortedMembers.length}
                </Badge>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                  Visitors 0
                </Badge>
              </div>
              
              {selectedMembers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-white">{selectedMembers.length} Selected</span>
                  <div className="relative">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/80"
                      onClick={() => setShowActions(!showActions)}
                    >
                      ACTIONS
                    </Button>
                    
                    {showActions && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-background border border-white/20 rounded-lg shadow-lg z-50">
                        <div className="p-2 space-y-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-white hover:bg-white/10"
                            onClick={() => handleBulkAction('Change Status')}
                          >
                            Change Status
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-white hover:bg-white/10"
                            onClick={() => handleBulkAction('Prepare Membership Cards')}
                          >
                            Prepare Membership Cards
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-white hover:bg-white/10"
                            onClick={() => handleBulkAction('Send Message')}
                          >
                            Send Message
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMembers([])}
                    className="text-white hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-4">
                      <Checkbox
                        checked={selectedMembers.length === paginatedMembers.length && paginatedMembers.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="border-white/20"
                      />
                    </th>
                    <th className="text-left p-4 text-white">CONTACT</th>
                    <th 
                      className="text-left p-4 text-white cursor-pointer hover:bg-white/5"
                      onClick={() => handleSort('age')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>AGE</span>
                        {getSortIcon('age')}
                      </div>
                    </th>
                    <th className="text-left p-4 text-white">RANK / LEVEL</th>
                    <th className="text-left p-4 text-white">MEMBERSHIP</th>
                    <th 
                      className="text-left p-4 text-white cursor-pointer hover:bg-white/5"
                      onClick={() => handleSort('lastCheckin')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>LAST VISIT</span>
                        {getSortIcon('lastCheckin')}
                      </div>
                    </th>
                    <th className="text-left p-4 text-white">BILLING STATUS</th>
                    <th className="text-left p-4 text-white">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMembers.map((member) => (
                    <tr key={member.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedMembers.includes(member.id)}
                          onCheckedChange={() => handleSelectMember(member.id)}
                          className="border-white/20"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-white">{member.name}</p>
                            <p className="text-sm text-primary">{member.email}</p>
                            <p className="text-xs text-white/70">{member.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-white">{member.age}</td>
                      <td className="p-4 text-white/70">No Ranking</td>
                      <td className="p-4">
                        <div className="text-white text-sm">
                          {member.membershipType}
                        </div>
                      </td>
                      <td className="p-4 text-white/70">
                        {member.lastCheckin ? new Date(member.lastCheckin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="p-4">
                        <Badge className={getBillingStatusColor(member.billingStatus)}>
                          {member.billingStatus}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/80"
                            onClick={() => setShowEditMember(member.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleMemberLogin(member)}
                          >
                            <LogIn className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-white/20">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white/70">Show</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                  <SelectTrigger className="w-20 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-white/70">per page</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page 
                          ? 'bg-primary text-primary-foreground' 
                          : 'border-white/20 text-white hover:bg-white/10'
                        }
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Member Modal */}
      {showEditMember && (
        <EditMemberModal
          memberId={showEditMember}
          onClose={() => setShowEditMember(null)}
          onSave={(memberData) => {
            if (!currentGym) return;

            // Create or update
            if (showEditMember === 'new') {
              // If family account, create multiple members and link them
              if (memberData.accountType === 'family' && Array.isArray(memberData.familyMembers) && memberData.familyMembers.length > 0) {
                const createdIds: string[] = [];
                memberData.familyMembers.forEach((fm: any, idx: number) => {
                  const id = `member-${currentGym.id}-${Date.now()}-${idx}`;
                  const memberObj: any = {
                    id,
                    gymId: currentGym.id,
                    name: `${fm.firstName} ${fm.lastName}`.trim(),
                    email: fm.email || '',
                    phone: fm.phone || '',
                    membershipType: memberData.membershipType,
                    startDate: new Date().toISOString(),
                    status: 'active',
                    checkinCode: idx === 0 ? memberData.checkinCode : `${Math.floor(1000 + Math.random() * 9000)}`,
                    amountPaid: idx === 0 ? (memberData.amountPaid || 0) : 0,
                    accountType: 'family',
                    familyPrimaryId: undefined,
                    password: memberData.password || ''
                  };
                  gymMemberStorage.add(currentGym.id, memberObj);
                  createdIds.push(id);
                });
                // update familyPrimaryId for others
                if (createdIds.length > 0) {
                  const primary = createdIds[0];
                  createdIds.slice(1).forEach(cid => {
                    gymMemberStorage.update(currentGym.id, cid, { familyPrimaryId: primary });
                  });
                }
              } else {
                // single member or visitor
                const id = `member-${currentGym.id}-${Date.now()}`;
                const newMember: any = {
                  id,
                  gymId: currentGym.id,
                  name: `${memberData.firstName} ${memberData.lastName}`.trim(),
                  email: memberData.email,
                  phone: memberData.phone,
                  membershipType: memberData.membershipType,
                  startDate: new Date().toISOString(),
                  status: 'active',
                  checkinCode: memberData.checkinCode || `${Math.floor(1000 + Math.random() * 9000)}`,
                  amountPaid: memberData.amountPaid || 0,
                  accountType: memberData.accountType || 'member',
                  password: memberData.password || ''
                };
                gymMemberStorage.add(currentGym.id, newMember);
              }

              // Refresh members list
              const updatedMembers = gymMemberStorage.getAll(currentGym.id);
              const membersWithCheckIn: MemberWithCheckIn[] = updatedMembers.map((member, index) => ({
                ...member,
                checkinCode: (member as any).checkinCode || `${2000 + index}${member.id.slice(-2)}`,
                age: Math.floor(Math.random() * 30) + 20,
                billingStatus: ['paid', 'overdue', 'pending'][Math.floor(Math.random() * 3)] as 'paid' | 'overdue' | 'pending'
              }));
              setMembers(membersWithCheckIn);
            } else {
              // update existing member
              const idToUpdate = showEditMember;
              const updates: any = {
                name: `${memberData.firstName} ${memberData.lastName}`.trim(),
                email: memberData.email,
                phone: memberData.phone,
                membershipType: memberData.membershipType,
                amountPaid: memberData.amountPaid || 0,
                accountType: memberData.accountType || 'member'
              };
              if (memberData.checkinCode) updates.checkinCode = memberData.checkinCode;
              if (memberData.password) updates.password = memberData.password;

              gymMemberStorage.update(currentGym.id, idToUpdate as string, updates);

              // Refresh members list
              const updatedMembers = gymMemberStorage.getAll(currentGym.id);
              const membersWithCheckIn: MemberWithCheckIn[] = updatedMembers.map((member, index) => ({
                ...member,
                checkinCode: (member as any).checkinCode || `${2000 + index}${member.id.slice(-2)}`,
                age: Math.floor(Math.random() * 30) + 20,
                billingStatus: ['paid', 'overdue', 'pending'][Math.floor(Math.random() * 3)] as 'paid' | 'overdue' | 'pending'
              }));
              setMembers(membersWithCheckIn);
            }

            showToast({
              type: 'success',
              title: showEditMember === 'new' ? 'Member Added' : 'Member Updated',
              message: 'Member information has been saved successfully'
            });
            setShowEditMember(null);
          }}
        />
      )}
    </div>
  );
};

// Edit Member Modal Component
const EditMemberModal: React.FC<{
  memberId: string;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ memberId, onClose, onSave }) => {
  const { currentGym, user } = useAuth();
  const { showToast } = useToast();
  const gymId = currentGym?.id || '';

  const [formData, setFormData] = useState<any>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    checkinCode: '',
    membershipType: '2_weeks',
    amountPaid: 0,
    accountType: 'member',
    familyMembers: [],
    password: '',
    passwordConfirm: ''
  });
  const [codeError, setCodeError] = useState<string | null>(null);

  useEffect(() => {
    if (memberId && memberId !== 'new' && currentGym) {
      const existing = gymMemberStorage.getById(currentGym.id, memberId);
      if (existing) {
        setFormData({
          firstName: existing.name.split(' ')[0] || existing.name,
          lastName: existing.name.split(' ').slice(1).join(' ') || '',
          email: existing.email || '',
          phone: existing.phone || '',
          dateOfBirth: (existing as any).dateOfBirth || '',
          checkinCode: (existing as any).checkinCode || '',
          membershipType: (existing as any).membershipType || '2_weeks',
          amountPaid: (existing as any).amountPaid || 0,
          accountType: (existing as any).accountType || 'member',
          familyMembers: (existing as any).familyMembers || [],
          password: '',
          passwordConfirm: ''
        });
      }
    }
  }, [memberId, currentGym]);

  // realtime validation
  useEffect(() => {
    const code = formData.checkinCode || '';
    if (code === '') { setCodeError(null); return; }
    if (!/^[0-9]{4}$/.test(code)) { setCodeError('Code must be exactly 4 digits'); return; }
    const existing = gymMemberStorage.getAll(gymId).find(m => (m as any).checkinCode === code && m.id !== (memberId === 'new' ? undefined : memberId));
    if (existing) { setCodeError('This code is already used by another member in this gym'); return; }
    setCodeError(null);
  }, [formData.checkinCode, gymId, memberId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // permission check
    const assignment = user?.gymAssignments?.find(a => a.gymId === currentGym?.id);
    const canEdit = assignment?.permissions?.includes('edit_members') || user?.role === 'admin' || user?.role === 'owner';
    if (!canEdit) { showToast({ type: 'error', title: 'Permission denied', message: 'You do not have permission to modify members' }); return; }

    if ((formData.password || formData.passwordConfirm) && formData.password !== formData.passwordConfirm) {
      showToast({ type: 'error', title: 'Password mismatch', message: 'Passwords do not match' });
      return;
    }
    if (codeError) { showToast({ type: 'error', title: 'Invalid Check-in Code', message: codeError }); return; }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-white/20 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ maxWidth: '900px' }}>
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{memberId === 'new' ? 'Add New Member' : 'Edit Member'}</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10"><X className="h-4 w-4" /></Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-white">First Name *</Label>
              <Input id="firstName" value={formData.firstName} onChange={(e)=>setFormData({...formData, firstName: e.target.value})} className="bg-white/10 border-white/20 text-white" required />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-white">Last Name *</Label>
              <Input id="lastName" value={formData.lastName} onChange={(e)=>setFormData({...formData, lastName: e.target.value})} className="bg-white/10 border-white/20 text-white" required />
            </div>

            <div>
              <Label htmlFor="email" className="text-white">Email *</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} className="bg-white/10 border-white/20 text-white" required />
            </div>
            <div>
              <Label htmlFor="phone" className="text-white">Phone</Label>
              <Input id="phone" value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})} className="bg-white/10 border-white/20 text-white" />
            </div>

            <div>
              <Label htmlFor="dateOfBirth" className="text-white">Date of Birth</Label>
              <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e)=>setFormData({...formData, dateOfBirth: e.target.value})} className="bg-white/10 border-white/20 text-white" />
            </div>

            <div>
              <Label htmlFor="checkinCode" className="text-white">Check-in Code (4 digits)</Label>
              <Input id="checkinCode" value={formData.checkinCode} onChange={(e)=>setFormData({...formData, checkinCode: e.target.value})} className="bg-white/10 border-white/20 text-white" />
              {codeError && <div className="text-xs text-destructive mt-1">{codeError}</div>}
            </div>

            <div>
              <Label htmlFor="membershipType" className="text-white">Membership Type</Label>
              <Select value={formData.membershipType} onValueChange={(v)=>setFormData({...formData, membershipType: v})}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2_weeks">2 weeks</SelectItem>
                  {Array.from({length:12},(_,i)=>(<SelectItem key={i} value={`${i+1}_months`}>{`${i+1} month${i===0?'':'s'}`}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amountPaid" className="text-white">Amount Paid</Label>
              <Input id="amountPaid" type="number" value={formData.amountPaid||''} onChange={(e)=>setFormData({...formData, amountPaid: Number(e.target.value)})} className="bg-white/10 border-white/20 text-white" />
            </div>

            <div className="md:col-span-2">
              <Label className="text-white">Account Type</Label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="text-white"><input type="radio" name="accountType" checked={formData.accountType!=='family' && formData.accountType!=='visitor'} onChange={()=>setFormData({...formData, accountType:'member'})} /> Member</label>
                <label className="text-white"><input type="radio" name="accountType" checked={formData.accountType==='visitor'} onChange={()=>setFormData({...formData, accountType:'visitor'})} /> Visitor</label>
                <label className="text-white"><input type="radio" name="accountType" checked={formData.accountType==='family'} onChange={()=>setFormData({...formData, accountType:'family'})} /> Family Account</label>
              </div>
            </div>

            {formData.accountType==='family' && (
              <div className="md:col-span-2">
                <Label className="text-white">Family Members (first is primary)</Label>
                <FamilyMembersEditor initial={formData.familyMembers||[]} onChange={(list:any[])=>setFormData({...formData, familyMembers:list})} />
              </div>
            )}

            <div className="md:col-span-2">
              <div className="flex items-center space-x-4">
                <div>
                  <Label className="text-white">Password</Label>
                  <Input type="password" value={formData.password||''} onChange={(e)=>setFormData({...formData, password: e.target.value})} className="bg-white/10 border-white/20 text-white" />
                </div>
                <div>
                  <Label className="text-white">Confirm Password</Label>
                  <Input type="password" value={formData.passwordConfirm||''} onChange={(e)=>setFormData({...formData, passwordConfirm: e.target.value})} className="bg-white/10 border-white/20 text-white" />
                </div>
              </div>
            </div>

          </div>

          <div className="flex items-center justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-primary">Save Member</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FamilyMembersEditor: React.FC<{ initial: any[]; onChange: (list:any[]) => void }> = ({ initial, onChange }) => {
  const [list, setList] = useState<any[]>(initial && initial.length? initial : [{ firstName: '', lastName: '', email: '' }]);

  useEffect(() => onChange(list), [list]);

  return (
    <div className="space-y-2">
      {list.map((item, idx) => (
        <div key={idx} className="flex items-center space-x-2">
          <Input placeholder="First name" value={item.firstName} onChange={(e) => { const newList = [...list]; newList[idx].firstName = e.target.value; setList(newList); }} className="bg-white/10" />
          <Input placeholder="Last name" value={item.lastName} onChange={(e) => { const newList = [...list]; newList[idx].lastName = e.target.value; setList(newList); }} className="bg-white/10" />
          <Input placeholder="Email (optional)" value={item.email} onChange={(e) => { const newList = [...list]; newList[idx].email = e.target.value; setList(newList); }} className="bg-white/10" />
          <Button variant="destructive" onClick={() => { setList(list.filter((_, i) => i !== idx)); }}>Remove</Button>
        </div>
      ))}
      <Button onClick={() => setList([...list, { firstName: '', lastName: '', email: '' }])}>Add Family Member</Button>
    </div>
  );
};
