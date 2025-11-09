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
          <Link to="/dashboard" className="w-full">
            <Button variant="ghost" className="w-full flex flex-col items-center justify-center text-sidebar-foreground h-16 px-1 group">
              <Users className="h-5 w-5 mb-1" />
              <span className="text-xs text-sidebar-foreground/80">Dashboard</span>
            </Button>
          </Link>

          <Link to="/members" className="w-full">
            <Button variant="ghost" className="w-full flex flex-col items-center justify-center text-sidebar-foreground h-16 px-1 group">
              <Users className="h-5 w-5 mb-1" />
              <span className="text-xs text-sidebar-foreground/80">Members</span>
            </Button>
          </Link>

          <Link to={currentGym ? `/gyms/${currentGym.id}/billing` : '/gyms'} className="w-full">
            <Button variant="ghost" className="w-full flex flex-col items-center justify-center text-sidebar-foreground h-16 px-1 group">
              <DollarSign className="h-5 w-5 mb-1" />
              <span className="text-xs text-sidebar-foreground/80">Billing</span>
            </Button>
          </Link>

          <Link to={currentGym ? `/gyms/${currentGym.id}/settings` : '/gyms'} className="w-full">
            <Button variant="ghost" className="w-full flex flex-col items-center justify-center text-sidebar-foreground h-16 px-1 group">
              <Settings className="h-5 w-5 mb-1" />
              <span className="text-xs text-sidebar-foreground/80">Settings</span>
            </Button>
          </Link>

          <Link to="/help" className="w-full">
            <Button variant="ghost" className="w-full flex flex-col items-center justify-center text-sidebar-foreground h-16 px-1 group">
              <Users className="h-5 w-5 mb-1" />
              <span className="text-xs text-sidebar-foreground/80">Help</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-white/20 bg-white/5 backdrop-blur-sm p-6" style={{ marginLeft: '85px' }}>
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
      <div className="p-6 space-y-6">
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
              onClick={() => setShowEditMember('new')}
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
            if (showEditMember === 'new' && currentGym) {
              // Add new member to gym-specific storage
              const newMember: Member = {
                id: `member-${currentGym.id}-${Date.now()}`,
                gymId: currentGym.id,
                name: `${memberData.firstName} ${memberData.lastName}`,
                email: memberData.email,
                phone: memberData.phone,
                membershipType: memberData.membershipType,
                startDate: new Date().toISOString(),
                status: 'active'
              };

              gymMemberStorage.add(currentGym.id, newMember);

              // Refresh members list
              const updatedMembers = gymMemberStorage.getAll(currentGym.id);
              const membersWithCheckIn: MemberWithCheckIn[] = updatedMembers.map((member, index) => ({
                ...member,
                checkinCode: `${2000 + index}${member.id.slice(-2)}`,
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
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    checkinCode: Math.floor(1000 + Math.random() * 9000).toString(),
    membershipType: 'basic'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-white/20 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {memberId === 'new' ? 'Add New Member' : 'Edit Member'}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-white">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="lastName" className="text-white">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="text-white">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="phone" className="text-white">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateOfBirth" className="text-white">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="checkinCode" className="text-white">Check-in Code</Label>
              <Input
                id="checkinCode"
                value={formData.checkinCode}
                onChange={(e) => setFormData({ ...formData, checkinCode: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
                readOnly
              />
            </div>
          </div>
          
          <div>
            <Label className="text-white">Membership Type</Label>
            <Select value={formData.membershipType} onValueChange={(value) => setFormData({ ...formData, membershipType: value })}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="unlimited">Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex space-x-4 pt-4">
            <Button type="submit" className="bg-primary hover:bg-primary/80">
              {memberId === 'new' ? 'Add Member' : 'Update Member'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
