import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { MemberCardModal } from '@/components/ui/MemberCardModal';
import { CheckIn } from '@/components/check-in/CheckIn';
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
  Eye,
  BarChart3,
  TrendingUp,
  Globe,
  Dumbbell,
  Building2,
  HelpCircle,
  Mail,
  Star,
  Crown,
  Trophy,
  Award,
  Zap,
  Target,
  IdCard
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutWithSidebar } from '@/components/ui/LayoutWithSidebar';
import { gymStorage } from '@/lib/storage';
import { gymMemberStorage, initializeGymData } from '@/lib/gym-storage';
import { Member } from '@shared/types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface MemberWithCheckIn extends Member {
  checkinCode: string;
  age: number;
  billingStatus: 'paid' | 'overdue' | 'pending';
  accountType: 'member' | 'visitor' | 'family';
  ranking?: string;
  attendanceCount?: number;
  performanceScore?: number;
  lastRankUpdate?: string;
}

type SortField = 'name' | 'age' | 'lastCheckin' | 'startDate' | 'ranking' | 'attendanceCount';
type SortOrder = 'asc' | 'desc';

export const Members: React.FC = () => {
  const { user, currentGym } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const tableRef = useRef<HTMLDivElement>(null);
  
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
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showMemberCardModal, setShowMemberCardModal] = useState<string | null>(null);
  const [selectedMemberForCard, setSelectedMemberForCard] = useState<MemberWithCheckIn | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [membershipFilter, setMembershipFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>('all');
  const [rankingFilter, setRankingFilter] = useState<string>('all');

  // Modal states
  const [inviteEmail, setInviteEmail] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive' | 'suspended'>('active');

  // Load gym-specific members data
  useEffect(() => {
    if (currentGym) {
      initializeGymData(currentGym.id);
      const gymMembers = gymMemberStorage.getAll(currentGym.id);

      const membersWithCheckIn: MemberWithCheckIn[] = gymMembers.map((member, index) => {
        const baseMember = member as any;
        return {
          ...member,
          checkinCode: baseMember.checkinCode || `${2000 + index}${member.id.slice(-2)}`,
          age: baseMember.age || Math.floor(Math.random() * 30) + 20,
          billingStatus: baseMember.billingStatus || (['paid', 'overdue', 'pending'][Math.floor(Math.random() * 3)] as 'paid' | 'overdue' | 'pending'),
          accountType: baseMember.accountType || 'member',
          ranking: baseMember.ranking || 'Bronze',
          attendanceCount: baseMember.attendanceCount || Math.floor(Math.random() * 100),
          performanceScore: baseMember.performanceScore || Math.floor(Math.random() * 100),
          lastRankUpdate: baseMember.lastRankUpdate || new Date().toISOString()
        };
      });

      setMembers(membersWithCheckIn);
    }
  }, [currentGym]);

  // Enhanced filtering and sorting
  const filteredAndSortedMembers = useMemo(() => {
    let filtered = members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (member as any).phone?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      const matchesMembership = membershipFilter === 'all' || member.membershipType.includes(membershipFilter);
      const matchesAccountType = accountTypeFilter === 'all' || member.accountType === accountTypeFilter;
      const matchesRanking = rankingFilter === 'all' || member.ranking === rankingFilter;

      return matchesSearch && matchesStatus && matchesMembership && matchesAccountType && matchesRanking;
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
        case 'ranking':
          const rankOrder = { 'Platinum': 5, 'Gold': 4, 'Silver': 3, 'Bronze': 2, 'New': 1 };
          aValue = rankOrder[a.ranking as keyof typeof rankOrder] || 0;
          bValue = rankOrder[b.ranking as keyof typeof rankOrder] || 0;
          break;
        case 'attendanceCount':
          aValue = a.attendanceCount || 0;
          bValue = b.attendanceCount || 0;
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
  }, [members, searchQuery, sortField, sortOrder, statusFilter, membershipFilter, accountTypeFilter, rankingFilter]);

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

  // Enhanced bulk actions
  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'send_message':
        setShowMessageModal(true);
        break;
      case 'change_status':
        setShowStatusModal(true);
        break;
      case 'export_selected':
        handleExportSelected('csv');
        break;
      case 'update_ranking':
        updateBulkRanking();
        break;
      case 'generate_cards':
        handleGenerateMemberCards();
        break;
      default:
        showToast({
          type: 'success',
          title: 'Action Applied',
          message: `${action} applied to ${selectedMembers.length} members`
        });
    }
    setShowBulkActions(false);
  };

  // Generate member cards for selected members
  const handleGenerateMemberCards = () => {
    if (selectedMembers.length === 0) {
      showToast({
        type: 'error',
        title: 'No Members Selected',
        message: 'Please select members to generate cards'
      });
      return;
    }

    if (selectedMembers.length === 1) {
      // Show single member card
      const member = members.find(m => m.id === selectedMembers[0]);
      if (member) {
        setSelectedMemberForCard(member);
        setShowMemberCardModal(member.id);
      }
    } else {
      // Generate PDF with multiple cards
      generateBulkMemberCardsPDF();
    }
  };

  // Generate PDF with multiple member cards
  const generateBulkMemberCardsPDF = async () => {
    const selectedMembersData = members.filter(member => selectedMembers.includes(member.id));
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    
    const cardWidth = 85;
    const cardHeight = 54;
    const margin = 10;
    const cardsPerRow = 3;
    const cardsPerPage = 6;
    
    let currentPage = 0;
    let cardIndex = 0;

    for (const member of selectedMembersData) {
      if (cardIndex % cardsPerPage === 0 && cardIndex > 0) {
        pdf.addPage();
        currentPage++;
      }
      
      const row = Math.floor((cardIndex % cardsPerPage) / cardsPerRow);
      const col = (cardIndex % cardsPerPage) % cardsPerRow;
      
      const x = margin + (col * (cardWidth + margin));
      const y = margin + (row * (cardHeight + margin));
      
      // Draw card background
      pdf.setFillColor(30, 30, 30);
      pdf.rect(x, y, cardWidth, cardHeight, 'F');
      
      // Add gym name and logo area
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text(currentGym?.name || 'GYM NAME', x + 5, y + 8);
      
      // Add member name
      pdf.setFontSize(8);
      pdf.text(member.name.toUpperCase(), x + 5, y + 15);
      
      // Add "MEMBERSHIP CARD" text
      pdf.setFontSize(6);
      pdf.text('MEMBERSHIP CARD', x + 5, y + 20);
      
      // Add separator line
      pdf.setDrawColor(100, 100, 100);
      pdf.line(x + 5, y + 22, x + cardWidth - 5, y + 22);
      
      // Add "SINCE" date
      const joinDate = new Date(member.startDate);
      const sinceText = `SINCE ${(joinDate.getMonth() + 1).toString().padStart(2, '0')}/${joinDate.getFullYear()}`;
      pdf.text(sinceText, x + 5, y + 28);
      
      // Add barcode area (simulated)
      pdf.setFillColor(50, 50, 50);
      pdf.rect(x + 5, y + 32, cardWidth - 10, 12, 'F');
      pdf.setTextColor(200, 200, 200);
      pdf.setFontSize(6);
      pdf.text(member.checkinCode, x + cardWidth / 2, y + 39, { align: 'center' });
      
      cardIndex++;
    }

    pdf.save(`member-cards-${new Date().toISOString().split('T')[0]}.pdf`);

    showToast({
      type: 'success',
      title: 'Member Cards Generated',
      message: `${selectedMembersData.length} member cards exported as PDF`
    });
  };

  // Generate single member card as image/PDF
  const generateSingleMemberCard = async (member: MemberWithCheckIn) => {
    const cardElement = document.getElementById(`member-card-${member.id}`);
    if (!cardElement) return;

    try {
      const canvas = await html2canvas(cardElement, {
        scale: 2,
        backgroundColor: '#1a1a1a',
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF
      const pdf = new jsPDF('landscape', 'mm', [54, 85]); // Card size
      pdf.addImage(imgData, 'PNG', 0, 0, 85, 54);
      pdf.save(`member-card-${member.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      
      showToast({
        type: 'success',
        title: 'Member Card Generated',
        message: `Member card for ${member.name} downloaded`
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to generate member card'
      });
    }
  };

  const sendBulkMessage = () => {
    showToast({
      type: 'success',
      title: 'Message Sent',
      message: `Message sent to ${selectedMembers.length} members`
    });
    setBulkMessage('');
    setShowMessageModal(false);
  };

  const updateBulkStatus = () => {
    const statusVal: 'active' | 'inactive' | 'suspended' = selectedStatus;
    const updatedMembers = members.map(member => 
      selectedMembers.includes(member.id) 
        ? { ...member, status: statusVal }
        : member
    );
    setMembers(updatedMembers);
    
    selectedMembers.forEach(memberId => {
      gymMemberStorage.update(currentGym!.id, memberId, { status: statusVal });
    });

    showToast({
      type: 'success',
      title: 'Status Updated',
      message: `Status updated for ${selectedMembers.length} members`
    });
    setShowStatusModal(false);
    setSelectedMembers([]);
  };

  const updateBulkRanking = () => {
    const updatedMembers = members.map(member => 
      selectedMembers.includes(member.id) 
        ? { 
            ...member, 
            ranking: calculateRanking(member.attendanceCount || 0, member.performanceScore || 0),
            lastRankUpdate: new Date().toISOString()
          }
        : member
    );
    setMembers(updatedMembers);
    
    selectedMembers.forEach(memberId => {
      const member = members.find(m => m.id === memberId);
      if (member) {
        gymMemberStorage.update(currentGym!.id, memberId, { 
          ranking: calculateRanking(member.attendanceCount || 0, member.performanceScore || 0),
          lastRankUpdate: new Date().toISOString()
        });
      }
    });

    showToast({
      type: 'success',
      title: 'Ranking Updated',
      message: `Ranking updated for ${selectedMembers.length} members`
    });
  };

  // Enhanced export functionality
  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      exportToCSV(filteredAndSortedMembers);
    } else {
      exportToPDF();
    }
  };

  const handleExportSelected = (format: 'csv' | 'pdf') => {
    const selectedMembersData = members.filter(member => selectedMembers.includes(member.id));
    if (format === 'csv') {
      exportToCSV(selectedMembersData);
    } else {
      exportToPDF(selectedMembersData);
    }
  };

  const exportToCSV = (data: MemberWithCheckIn[]) => {
    const headers = ['Name', 'Email', 'Phone', 'Age', 'Ranking', 'Membership', 'Status', 'Last Visit', 'Billing Status'];
    const csvContent = [
      headers.join(','),
      ...data.map(member => [
        `"${member.name}"`,
        `"${member.email}"`,
        `"${(member as any).phone || ''}"`,
        member.age,
        `"${member.ranking}"`,
        `"${member.membershipType}"`,
        `"${member.status}"`,
        `"${member.lastCheckin ? new Date(member.lastCheckin).toLocaleDateString() : 'Never'}"`,
        `"${member.billingStatus}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `members-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showToast({
      type: 'success',
      title: 'CSV Exported',
      message: `${data.length} members exported successfully`
    });
  };

  const exportToPDF = (data?: MemberWithCheckIn[]) => {
    const exportData = data || filteredAndSortedMembers;
    const pdf = new jsPDF();
    
    pdf.text('Members List', 20, 20);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    pdf.text(`Total Members: ${exportData.length}`, 20, 40);
    
    let yPosition = 60;
    exportData.forEach((member, index) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.text(`${index + 1}. ${member.name}`, 20, yPosition);
      pdf.text(`   Email: ${member.email}`, 25, yPosition + 5);
      pdf.text(`   Ranking: ${member.ranking}`, 25, yPosition + 10);
      pdf.text(`   Status: ${member.status}`, 25, yPosition + 15);
      yPosition += 25;
    });

    pdf.save(`members-${new Date().toISOString().split('T')[0]}.pdf`);

    showToast({
      type: 'success',
      title: 'PDF Exported',
      message: `${exportData.length} members exported successfully`
    });
  };

  const handlePrint = () => {
    const printContent = tableRef.current;
    if (printContent) {
      const originalContents = document.body.innerHTML;
      const printContents = printContent.innerHTML;
      
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }

    showToast({
      type: 'success',
      title: 'Print Started',
      message: 'Member list sent to printer'
    });
  };

  const handleInvite = () => {
    if (!inviteEmail) {
      showToast({ type: 'error', title: 'Error', message: 'Please enter an email address' });
      return;
    }

    showToast({
      type: 'success',
      title: 'Invitation Sent',
      message: `Invitation sent to ${inviteEmail}`
    });
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const handleMemberLogin = (member: MemberWithCheckIn) => {
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
    
    navigate('/member-portal');
  };

  // Ranking system
  const calculateRanking = (attendance: number, performance: number): string => {
    const score = (attendance * 0.6) + (performance * 0.4);
    
    if (score >= 90) return 'Platinum';
    if (score >= 75) return 'Gold';
    if (score >= 60) return 'Silver';
    if (score >= 30) return 'Bronze';
    return 'New';
  };

  const getRankingIcon = (ranking: string) => {
    switch (ranking) {
      case 'Platinum': return <Crown className="h-4 w-4 text-purple-400" />;
      case 'Gold': return <Trophy className="h-4 w-4 text-yellow-400" />;
      case 'Silver': return <Award className="h-4 w-4 text-gray-300" />;
      case 'Bronze': return <Star className="h-4 w-4 text-orange-400" />;
      default: return <Target className="h-4 w-4 text-blue-400" />;
    }
  };

  const getRankingColor = (ranking: string) => {
    switch (ranking) {
      case 'Platinum': return 'bg-purple-500/20 text-purple-400 border-purple-400/30';
      case 'Gold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      case 'Silver': return 'bg-gray-500/20 text-gray-300 border-gray-300/30';
      case 'Bronze': return 'bg-orange-500/20 text-orange-400 border-orange-400/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
    }
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">No Gym Selected</h1>
          <p className="text-white/70 mb-4">Please select a gym to view members.</p>
          <Button asChild className="bg-primary hover:bg-primary/80">
            <Link to="/gyms">Select Gym</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <LayoutWithSidebar>
      {/* Header */}
      <div className="border-b border-white/20 bg-white/5 backdrop-blur-sm p-6 -mx-6 mt-6">
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
      <div className="border-b border-white/20 px-6 -mx-6">
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
      <div className="space-y-6 pt-6">
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
              onClick={() => setShowInviteModal(true)}
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

        {/* Enhanced Filters Panel */}
        {showFilters && (
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <Label className="text-white">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Active</SelectItem>
                      <SelectItem value="active">Inactive</SelectItem>
                      <SelectItem value="inactive">Suspended</SelectItem>
                      {/* <SelectItem value="suspended">Suspended</SelectItem> */}
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
      {/* Membership Type Options */}
<SelectItem value="all">All Memberships</SelectItem>
<SelectItem value="Monthly">Monthly</SelectItem>
<SelectItem value="Annual">Annual</SelectItem>
<SelectItem value="No Active">No Active</SelectItem>

{/* Time Range Options */}
<SelectItem value="2weeks">Last 2 Weeks</SelectItem>
<SelectItem value="1month">Last 1 Month</SelectItem>
<SelectItem value="2months">Last 2 Months</SelectItem>
<SelectItem value="3months">Last 3 Months</SelectItem>
<SelectItem value="4months">Last 4 Months</SelectItem>
<SelectItem value="5months">Last 5 Months</SelectItem>
<SelectItem value="6months">Last 6 Months</SelectItem>
<SelectItem value="7months">Last 7 Months</SelectItem>
<SelectItem value="8months">Last 8 Months</SelectItem>
<SelectItem value="9months">Last 9 Months</SelectItem>
<SelectItem value="10months">Last 10 Months</SelectItem>
<SelectItem value="11months">Last 11 Months</SelectItem>
<SelectItem value="12months">Last 12 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-white">Account Type</Label>
                  <Select value={accountTypeFilter} onValueChange={setAccountTypeFilter}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="visitor">Visitor</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Ranking</Label>
                  <Select value={rankingFilter} onValueChange={setRankingFilter}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rankings</SelectItem>
                      <SelectItem value="Platinum">Platinum</SelectItem>
                      <SelectItem value="Gold">Gold</SelectItem>
                      <SelectItem value="Silver">Silver</SelectItem>
                      <SelectItem value="Bronze">Bronze</SelectItem>
                      <SelectItem value="New">New</SelectItem>
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
        <Card className="bg-white/10 border-white/20" ref={tableRef}>
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="flex items-center space-x-4 p-4 border-b border-white/20">
              <div className="flex items-center space-x-2">
                <Badge 
                  variant="secondary" 
                  className={`cursor-pointer ${accountTypeFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-white'}`} 
                  onClick={() => { setAccountTypeFilter('all'); setStatusFilter('all'); }}
                >
                  Members {filteredAndSortedMembers.filter(m => m.accountType !== 'visitor').length}
                </Badge>
                <Badge 
                  variant="secondary" 
                  className={`cursor-pointer ${accountTypeFilter === 'visitor' ? 'bg-blue-500 text-white' : 'bg-blue-500/20 text-blue-400'}`} 
                  onClick={() => setAccountTypeFilter('visitor')}
                >
                  Visitors {filteredAndSortedMembers.filter(m => m.accountType === 'visitor').length}
                </Badge>
              </div>
              
              {selectedMembers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-white">{selectedMembers.length} Selected</span>
                  <div className="relative">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/80"
                      onClick={() => setShowBulkActions(!showBulkActions)}
                    >
                      ACTIONS
                    </Button>
                    
                    {showBulkActions && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-background border border-white/20 rounded-lg shadow-lg z-50">
                        <div className="p-2 space-y-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-white hover:bg-white/10"
                            onClick={() => handleBulkAction('send_message')}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Send Message
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-white hover:bg-white/10"
                            onClick={() => handleBulkAction('change_status')}
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Change Status
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-white hover:bg-white/10"
                            onClick={() => handleBulkAction('update_ranking')}
                          >
                            <Trophy className="h-4 w-4 mr-2" />
                            Update Ranking
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-white hover:bg-white/10"
                            onClick={() => handleBulkAction('generate_cards')}
                          >
                            <IdCard className="h-4 w-4 mr-2" />
                            Generate Cards
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-white hover:bg-white/10"
                            onClick={() => handleBulkAction('export_selected')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export Selected
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
                    <th 
                      className="text-left p-4 text-white cursor-pointer hover:bg-white/5"
                      onClick={() => handleSort('ranking')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>RANK / LEVEL</span>
                        {getSortIcon('ranking')}
                      </div>
                    </th>
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
                            <AvatarImage src={member.profile} alt={member.name} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-green-400' : 'bg-red-500'}`} />
                              <p className="font-medium text-white">{member.name}</p>
                              {member.ranking && (
                                <div className="flex items-center space-x-1">
                                  {getRankingIcon(member.ranking)}
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-primary">{member.email}</p>
                            <p className="text-xs text-white/70">{(member as any).phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-white">{member.age}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getRankingColor(member.ranking || 'New')} border`}>
                            <div className="flex items-center space-x-1">
                              {getRankingIcon(member.ranking || 'New')}
                              <span>{member.ranking || 'New'}</span>
                            </div>
                          </Badge>
                          {member.attendanceCount !== undefined && (
                            <span className="text-xs text-white/70">({member.attendanceCount} visits)</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-white text-sm">
                          {member.membershipType}
                        </div>
                      </td>
                      <td className="p-4 text-white/70">
                        {member.lastCheckin ? new Date(member.lastCheckin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Badge className={getBillingStatusColor(member.billingStatus)}>
                            {member.billingStatus}
                          </Badge>
                          <div className="text-xs text-white/70">{member.accountType}</div>
                        </div>
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
                            variant="secondary"
                            onClick={() => handleMemberLogin(member)}
                          >
                            <LogIn className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedMemberForCard(member);
                              setShowMemberCardModal(member.id);
                            }}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <IdCard className="h-4 w-4" />
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

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-white/20 rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Invite Member</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowInviteModal(false)} className="text-white hover:bg-white/10">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label htmlFor="inviteEmail" className="text-white">Email Address</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
                <Button onClick={handleInvite} className="bg-primary">Send Invite</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-white/20 rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Send Message</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowMessageModal(false)} className="text-white hover:bg-white/10">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label htmlFor="bulkMessage" className="text-white">Message</Label>
                <Textarea
                  id="bulkMessage"
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  placeholder="Enter your message here..."
                  className="bg-white/10 border-white/20 text-white min-h-[100px]"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowMessageModal(false)}>Cancel</Button>
                <Button onClick={sendBulkMessage} className="bg-primary">Send to {selectedMembers.length} Members</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-white/20 rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Change Status</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowStatusModal(false)} className="text-white hover:bg-white/10">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label htmlFor="statusSelect" className="text-white">New Status</Label>
                <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as 'active' | 'inactive' | 'suspended')}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowStatusModal(false)}>Cancel</Button>
                <Button onClick={updateBulkStatus} className="bg-primary">Update {selectedMembers.length} Members</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Card Modal */}
  {showMemberCardModal && selectedMemberForCard && (
  <MemberCardModal
    member={selectedMemberForCard}
    gym={currentGym}
    onClose={() => {
      setShowMemberCardModal(null);
      setSelectedMemberForCard(null);
    }}
    onDownload={() => generateSingleMemberCard(selectedMemberForCard)}
  />
)}
      {/* Edit Member Modal */}
      {showEditMember && (
        <EditMemberModal
          memberId={showEditMember}
          onClose={() => setShowEditMember(null)}
          onSave={(memberData) => {
            if (!currentGym) return;

            // Handle deletion signal
            if ((memberData as any)._deleted && (memberData as any).id) {
              const idToDelete = (memberData as any).id as string;
              const assignment = user?.gymAssignments?.find(a => a.gymId === currentGym?.id);
              const canDelete = assignment?.permissions?.includes('edit_members') || user?.role === 'admin' || user?.role === 'owner';
              if (!canDelete) { showToast({ type: 'error', title: 'Permission denied', message: 'You do not have permission to delete members' }); return; }
              if (!confirm('Type DELETE to permanently remove this member from this gym')) return;
              gymMemberStorage.remove(currentGym.id, idToDelete);
              const updatedMembers = gymMemberStorage.getAll(currentGym.id);
              const membersWithCheckIn: MemberWithCheckIn[] = updatedMembers.map((member, index) => ({
                ...member,
                checkinCode: (member as any).checkinCode || `${2000 + index}${member.id.slice(-2)}`,
                age: Math.floor(Math.random() * 30) + 20,
                billingStatus: ['paid', 'overdue', 'pending'][Math.floor(Math.random() * 3)] as 'paid' | 'overdue' | 'pending',
                accountType: (member as any).accountType || 'member',
                ranking: (member as any).ranking || 'Bronze',
                attendanceCount: (member as any).attendanceCount || Math.floor(Math.random() * 100),
                performanceScore: (member as any).performanceScore || Math.floor(Math.random() * 100),
                lastRankUpdate: (member as any).lastRankUpdate || new Date().toISOString()
              }));
              setMembers(membersWithCheckIn);
              showToast({ type: 'success', title: 'Deleted', message: 'Member removed' });
              setShowEditMember(null);
              return;
            }

            // Calculate ranking for new/existing member
            const attendanceCount = memberData.attendanceCount || 0;
            const performanceScore = memberData.performanceScore || 0;
            const ranking = calculateRanking(attendanceCount, performanceScore);

            // Create or update
            if (showEditMember === 'new') {
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
                    status: memberData.accountStatus || 'active',
                    checkinCode: idx === 0 ? memberData.checkinCode : `${Math.floor(1000 + Math.random() * 9000)}`,
                    amountPaid: idx === 0 ? (memberData.amountPaid || 0) : 0,
                    amountStatus: memberData.amountStatus || 'paid',
                    accountType: 'family',
                    familyPrimaryId: undefined,
                    password: memberData.password || '',
                    ranking: idx === 0 ? ranking : 'New',
                    attendanceCount: idx === 0 ? attendanceCount : 0,
                    performanceScore: idx === 0 ? performanceScore : 0,
                    lastRankUpdate: new Date().toISOString()
                  };
                  gymMemberStorage.add(currentGym.id, memberObj);
                  createdIds.push(id);
                });
                if (createdIds.length > 0) {
                  const primary = createdIds[0];
                  createdIds.slice(1).forEach(cid => {
                    gymMemberStorage.update(currentGym.id, cid, { familyPrimaryId: primary });
                  });
                }
              } else {
                const id = `member-${currentGym.id}-${Date.now()}`;
                const newMember: any = {
                  id,
                  gymId: currentGym.id,
                  name: `${memberData.firstName} ${memberData.lastName}`.trim(),
                  email: memberData.email,
                  phone: memberData.phone,
                  membershipType: memberData.membershipType,
                  startDate: new Date().toISOString(),
                  status: memberData.accountStatus || 'active',
                  checkinCode: memberData.checkinCode || `${Math.floor(1000 + Math.random() * 9000)}`,
                  amountPaid: memberData.amountPaid || 0,
                  amountStatus: memberData.amountStatus || 'paid',
                  accountType: memberData.accountType || 'member',
                  password: memberData.password || '',
                  ranking: ranking,
                  attendanceCount: attendanceCount,
                  performanceScore: performanceScore,
                  lastRankUpdate: new Date().toISOString()
                };
                gymMemberStorage.add(currentGym.id, newMember);
              }
            } else {
              const idToUpdate = showEditMember;
              const updates: any = {
                name: `${memberData.firstName} ${memberData.lastName}`.trim(),
                email: memberData.email,
                phone: memberData.phone,
                membershipType: memberData.membershipType,
                amountPaid: memberData.amountPaid || 0,
                amountStatus: memberData.amountStatus || 'paid',
                accountType: memberData.accountType || 'member',
                status: memberData.accountStatus || 'active',
                ranking: ranking,
                attendanceCount: attendanceCount,
                performanceScore: performanceScore,
                lastRankUpdate: new Date().toISOString()
              };
              if (memberData.checkinCode) updates.checkinCode = memberData.checkinCode;
              if (memberData.password) updates.password = memberData.password;

              gymMemberStorage.update(currentGym.id, idToUpdate as string, updates);
            }

            // Refresh members list
            const updatedMembers = gymMemberStorage.getAll(currentGym.id);
            const membersWithCheckIn: MemberWithCheckIn[] = updatedMembers.map((member, index) => {
              const baseMember = member as any;
              return {
                ...member,
                checkinCode: baseMember.checkinCode || `${2000 + index}${member.id.slice(-2)}`,
                age: baseMember.age || Math.floor(Math.random() * 30) + 20,
                billingStatus: baseMember.billingStatus || (['paid', 'overdue', 'pending'][Math.floor(Math.random() * 3)] as 'paid' | 'overdue' | 'pending'),
                accountType: baseMember.accountType || 'member',
                ranking: baseMember.ranking || 'Bronze',
                attendanceCount: baseMember.attendanceCount || Math.floor(Math.random() * 100),
                performanceScore: baseMember.performanceScore || Math.floor(Math.random() * 100),
                lastRankUpdate: baseMember.lastRankUpdate || new Date().toISOString()
              };
            });
            setMembers(membersWithCheckIn);

            showToast({
              type: 'success',
              title: showEditMember === 'new' ? 'Member Added' : 'Member Updated',
              message: 'Member information has been saved successfully'
            });
            setShowEditMember(null);
          }}
        />
      )}
    </LayoutWithSidebar>
  );
};



// Enhanced Edit Member Modal with Ranking
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
    amountStatus: 'paid',
    accountType: 'member',
    accountStatus: 'active',
    familyMembers: [],
    password: '',
    passwordConfirm: '',
    attendanceCount: 0,
    performanceScore: 0
  });
  const [codeError, setCodeError] = useState<string | null>(null);

  useEffect(() => {
    if (memberId && memberId !== 'new' && currentGym) {
      const existing = gymMemberStorage.getById(currentGym.id, memberId);
      if (existing) {
        const baseExisting = existing as any;
        setFormData({
          firstName: existing.name.split(' ')[0] || existing.name,
          lastName: existing.name.split(' ').slice(1).join(' ') || '',
          email: existing.email || '',
          phone: existing.phone || '',
          dateOfBirth: baseExisting.dateOfBirth || '',
          checkinCode: baseExisting.checkinCode || '',
          membershipType: baseExisting.membershipType || '2_weeks',
          amountPaid: baseExisting.amountPaid || 0,
          amountStatus: baseExisting.amountStatus || 'paid',
          accountType: baseExisting.accountType || 'member',
          accountStatus: baseExisting.status || 'active',
          familyMembers: baseExisting.familyMembers || [],
          password: '',
          passwordConfirm: '',
          attendanceCount: baseExisting.attendanceCount || 0,
          performanceScore: baseExisting.performanceScore || 0
        });
      }
    }
  }, [memberId, currentGym]);

  useEffect(() => {
    const code = formData.checkinCode || '';
    if (code === '') { setCodeError(null); return; }
    if (!/^[0-9]{4}$/.test(code)) { setCodeError('Code must be exactly 4 digits'); return; }
    const existing = gymMemberStorage.getAll(gymId).find(m => (m as any).checkinCode === code && m.id !== (memberId === 'new' ? undefined : memberId));
    if (existing) { setCodeError('This code is already used by another member in this gym'); return; }
    setCodeError(null);
  }, [formData.checkinCode, gymId, memberId]);

  const calculateRanking = (attendance: number, performance: number): string => {
    const score = (attendance * 0.6) + (performance * 0.4);
    if (score >= 90) return 'Platinum';
    if (score >= 75) return 'Gold';
    if (score >= 60) return 'Silver';
    if (score >= 30) return 'Bronze';
    return 'New';
  };

  const getRankingColor = (ranking: string) => {
    switch (ranking) {
      case 'Platinum': return 'text-purple-400';
      case 'Gold': return 'text-yellow-400';
      case 'Silver': return 'text-gray-300';
      case 'Bronze': return 'text-orange-400';
      default: return 'text-blue-400';
    }
  };

  const currentRanking = calculateRanking(formData.attendanceCount, formData.performanceScore);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

            <div>
              <Label htmlFor="amountStatus" className="text-white">Amount Status</Label>
              <Select value={formData.amountStatus || 'paid'} onValueChange={(v)=>setFormData({...formData, amountStatus: v})}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ranking Section */}
            <div>
              <Label htmlFor="attendanceCount" className="text-white">Attendance Count</Label>
              <Input 
                id="attendanceCount" 
                type="number" 
                value={formData.attendanceCount} 
                onChange={(e)=>setFormData({...formData, attendanceCount: Number(e.target.value)})} 
                className="bg-white/10 border-white/20 text-white" 
              />
            </div>

            <div>
              <Label htmlFor="performanceScore" className="text-white">Performance Score (0-100)</Label>
              <Input 
                id="performanceScore" 
                type="number" 
                min="0"
                max="100"
                value={formData.performanceScore} 
                onChange={(e)=>setFormData({...formData, performanceScore: Number(e.target.value)})} 
                className="bg-white/10 border-white/20 text-white" 
              />
            </div>

            <div className="md:col-span-2">
              <div className="bg-white/5 p-4 rounded-lg border border-white/20">
                <Label className="text-white mb-2 block">Current Ranking</Label>
                <div className="flex items-center space-x-2">
                  <div className={`text-lg font-bold ${getRankingColor(currentRanking)}`}>
                    {currentRanking}
                  </div>
                  <div className="text-sm text-white/70">
                    (Based on {formData.attendanceCount} visits and {formData.performanceScore}% performance)
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <Label className="text-white">Account Type</Label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="text-white"><input type="radio" name="accountType" checked={formData.accountType!=='family' && formData.accountType!=='visitor'} onChange={()=>setFormData({...formData, accountType:'member'})} /> Member</label>
                <label className="text-white"><input type="radio" name="accountType" checked={formData.accountType==='visitor'} onChange={()=>setFormData({...formData, accountType:'visitor'})} /> Visitor</label>
                <label className="text-white"><input type="radio" name="accountType" checked={formData.accountType==='family'} onChange={()=>setFormData({...formData, accountType:'family'})} /> Family Account</label>
              </div>
            </div>

            <div className="md:col-span-2">
              <Label className="text-white">Account Status</Label>
              <Select value={formData.accountStatus || 'active'} onValueChange={(v)=>setFormData({...formData, accountStatus: v})}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
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
            {memberId !== 'new' && (
              <Button variant="destructive" onClick={() => {
                const assignment = user?.gymAssignments?.find(a => a.gymId === currentGym?.id);
                const canDelete = assignment?.permissions?.includes('edit_members') || user?.role === 'admin' || user?.role === 'owner';
                if (!canDelete) { showToast({ type: 'error', title: 'Permission denied', message: 'You do not have permission to delete members' }); return; }
                const typed = prompt('Type DELETE to permanently remove this member from this gym');
                if (typed !== 'DELETE') { showToast({ type: 'warning', title: 'Aborted', message: 'Deletion cancelled' }); return; }
                onSave({ _deleted: true, id: memberId });
                onClose();
              }}>Delete</Button>
            )}
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