// src/components/check-in/CheckIn.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Camera,
  CreditCard,
  Hash,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  X,
  Clock,
  AlertCircle,
  Scan,
  Smartphone,
  Users
} from 'lucide-react';
import { gymMemberStorage } from '@/lib/gym-storage';
import { Member } from '@shared/types';

interface MemberWithDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  checkinCode: string;
  membershipType: string;
  startDate: string;
  status: string;
  billingStatus: 'paid' | 'overdue' | 'pending';
  lastCheckin?: string;
  amountPaid: number;
  amountStatus: string;
}

interface CheckInRecord {
  id: string;
  memberId: string;
  memberName: string;
  checkinTime: string;
  gymId: string;
  method: 'barcode' | 'nfc' | 'manual' | 'search';
}

interface CheckInProps {
  onCheckInSuccess?: () => void;
}

export const CheckIn: React.FC<CheckInProps> = ({ onCheckInSuccess }) => {
  const { currentGym } = useAuth();
  const { showToast } = useToast();
  const [activeMethod, setActiveMethod] = useState<'barcode' | 'nfc' | 'manual' | 'search'>('manual');
  const [checkinCode, setCheckinCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [foundMember, setFoundMember] = useState<MemberWithDetails | null>(null);
  const [recentCheckins, setRecentCheckins] = useState<CheckInRecord[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load recent check-ins
  useEffect(() => {
    if (currentGym) {
      const stored = localStorage.getItem(`checkins-${currentGym.id}`);
      if (stored) {
        setRecentCheckins(JSON.parse(stored));
      }
    }
  }, [currentGym]);

  // Barcode scanning setup
  useEffect(() => {
    if (activeMethod === 'barcode' && isScanning) {
      startBarcodeScan();
    } else {
      stopBarcodeScan();
    }

    return () => {
      stopBarcodeScan();
    };
  }, [activeMethod, isScanning]);

  const startBarcodeScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Camera Error',
        message: 'Cannot access camera for barcode scanning'
      });
      setIsScanning(false);
    }
  };

  const stopBarcodeScan = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const findMemberByCode = (code: string) => {
    if (!currentGym) return;

    const members = gymMemberStorage.getAll(currentGym.id);
    const member = members.find(m => (m as { checkinCode?: string }).checkinCode === code);
    
    if (member) {
      const m = member as Member & { checkinCode?: string; amountPaid?: number; amountStatus?: string };
      setFoundMember({
        ...member,
        checkinCode: m.checkinCode ?? '',
        billingStatus: (m as { billingStatus?: 'paid' | 'overdue' | 'pending' }).billingStatus ?? 'paid',
        amountPaid: m.amountPaid ?? 0,
        amountStatus: m.amountStatus ?? 'paid'
      });
    } else {
      setFoundMember(null);
      showToast({
        type: 'error',
        title: 'Member Not Found',
        message: 'No member found with this check-in code'
      });
    }
  };

  const findMemberByName = (query: string) => {
    if (!currentGym || !query.trim()) return;

    const members = gymMemberStorage.getAll(currentGym.id);
    const matchedMembers = members.filter(m => 
      m.name.toLowerCase().includes(query.toLowerCase())
    );

    const toDetails = (m: typeof matchedMembers[0]): MemberWithDetails => {
      const x = m as typeof m & { checkinCode?: string; billingStatus?: 'paid' | 'overdue' | 'pending'; amountPaid?: number; amountStatus?: string };
      return {
        ...m,
        checkinCode: x.checkinCode ?? '',
        billingStatus: x.billingStatus ?? 'paid',
        amountPaid: x.amountPaid ?? 0,
        amountStatus: x.amountStatus ?? 'paid'
      };
    };
    if (matchedMembers.length === 1) {
      setFoundMember(toDetails(matchedMembers[0]));
      setSearchQuery(matchedMembers[0].name);
    } else if (matchedMembers.length > 1) {
      setFoundMember(toDetails(matchedMembers[0]));
      setSearchQuery(matchedMembers[0].name);
    } else {
      setFoundMember(null);
      showToast({
        type: 'error',
        title: 'Member Not Found',
        message: 'No member found with this name'
      });
    }
  };

  const handleCheckIn = async () => {
    if (!foundMember || !currentGym) return;

    // Check if already checked in today
    const today = new Date().toDateString();
    const alreadyCheckedIn = recentCheckins.some(checkin => 
      checkin.memberId === foundMember.id && 
      new Date(checkin.checkinTime).toDateString() === today
    );

    if (alreadyCheckedIn) {
      showToast({
        type: 'error',
        title: 'Already Checked In',
        message: `${foundMember.name} has already checked in today`
      });
      return;
    }

    // Check payment status
    if (foundMember.billingStatus === 'overdue') {
      showToast({
        type: 'warning',
        title: 'Payment Overdue',
        message: 'Member has overdue payments but can still check in'
      });
    }

    // Record check-in
    const checkinRecord: CheckInRecord = {
      id: `checkin-${Date.now()}`,
      memberId: foundMember.id,
      memberName: foundMember.name,
      checkinTime: new Date().toISOString(),
      gymId: currentGym.id,
      method: activeMethod
    };

    const updatedCheckins = [checkinRecord, ...recentCheckins.slice(0, 9)];
    setRecentCheckins(updatedCheckins);
    localStorage.setItem(`checkins-${currentGym.id}`, JSON.stringify(updatedCheckins));

    // Update member's last check-in
    gymMemberStorage.update(currentGym.id, foundMember.id, {
      lastCheckin: new Date().toISOString()
    });

    showToast({
      type: 'success',
      title: 'Check-In Successful',
      message: `${foundMember.name} has been checked in`
    });

    // Reset form and call success callback
    setFoundMember(null);
    setCheckinCode('');
    setSearchQuery('');
    onCheckInSuccess?.();
  };

  const handleKeypadInput = (digit: string) => {
    if (digit === 'clear') {
      setCheckinCode('');
    } else if (digit === 'enter') {
      if (checkinCode.length === 4) {
        findMemberByCode(checkinCode);
      }
    } else {
      if (checkinCode.length < 4) {
        setCheckinCode(prev => prev + digit);
      }
    }
  };

  const simulateNFCScan = () => {
    const mockCode = '1234';
    setCheckinCode(mockCode);
    findMemberByCode(mockCode);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-400';
      case 'overdue': return 'bg-red-500/20 text-red-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (!currentGym) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Gym Selected</h1>
          <p className="text-muted-foreground">Please select a gym to manage check-ins.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's Sessions */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Today's Sessions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Calendar className="h-8 w-8 text-white/30 mx-auto mb-2" />
            <p className="text-white/70">No upcoming sessions</p>
          </div>
        </CardContent>
      </Card>

      {/* Check-In Methods */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Check-In Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeMethod} onValueChange={(v) => setActiveMethod(v as any)} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="barcode" className="flex items-center space-x-2">
                <Camera className="h-4 w-4" />
                <span>Barcode</span>
              </TabsTrigger>
              <TabsTrigger value="nfc" className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span>NFC Card</span>
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center space-x-2">
                <Hash className="h-4 w-4" />
                <span>Manual</span>
              </TabsTrigger>
              <TabsTrigger value="search" className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Search</span>
              </TabsTrigger>
            </TabsList>

            {/* Barcode Scanner */}
            <TabsContent value="barcode" className="space-y-4">
              <div className="text-center">
                {!isScanning ? (
                  <Button
                    onClick={() => setIsScanning(true)}
                    className="bg-primary hover:bg-primary/80"
                    size="lg"
                  >
                    <Scan className="h-5 w-5 mr-2" />
                    Start Barcode Scanner
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 border-2 border-primary border-dashed rounded-lg pointer-events-none" />
                    </div>
                    <Button
                      onClick={() => setIsScanning(false)}
                      variant="outline"
                      className="border-white/20 text-white"
                    >
                      Stop Scanner
                    </Button>
                  </div>
                )}
                
                {/* Simulated barcode detection for demo */}
                <div className="mt-4 p-4 bg-white/5 rounded-lg">
                  <Label className="text-white mb-2 block">Simulate Barcode Scan (Demo)</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={checkinCode}
                      onChange={(e) => setCheckinCode(e.target.value)}
                      placeholder="Enter 4-digit code"
                      className="bg-white/10 border-white/20 text-white"
                      maxLength={4}
                    />
                    <Button
                      onClick={() => findMemberByCode(checkinCode)}
                      disabled={checkinCode.length !== 4}
                    >
                      Scan
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* NFC Card Reader */}
            <TabsContent value="nfc" className="space-y-4 text-center">
              <div className="bg-white/5 p-6 rounded-lg border-2 border-dashed border-white/20">
                <CreditCard className="h-12 w-12 text-white/30 mx-auto mb-3" />
                <p className="text-white/70 mb-3">Tap NFC card to reader</p>
                <Button
                  onClick={simulateNFCScan}
                  className="bg-primary hover:bg-primary/80"
                  size="lg"
                >
                  <Smartphone className="h-5 w-5 mr-2" />
                  Simulate NFC Scan (Demo)
                </Button>
              </div>
            </TabsContent>

            {/* Manual Entry */}
            <TabsContent value="manual" className="space-y-4">
              <div className="text-center">
                <Label className="text-white mb-3 block text-lg">Enter Check-in Code</Label>
                
                {/* Code Display */}
                <div className="bg-white/10 p-4 rounded-lg mb-4 max-w-xs mx-auto">
                  <div className="text-2xl font-mono text-white tracking-widest">
                    {checkinCode.padEnd(4, '•')}
                  </div>
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <Button
                      key={num}
                      onClick={() => handleKeypadInput(num.toString())}
                      className="h-12 bg-white/10 hover:bg-white/20 text-white border-white/20 text-lg font-semibold"
                    >
                      {num}
                    </Button>
                  ))}
                  <Button
                    onClick={() => handleKeypadInput('clear')}
                    className="h-12 bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-400/20"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={() => handleKeypadInput('0')}
                    className="h-12 bg-white/10 hover:bg-white/20 text-white border-white/20 text-lg font-semibold"
                  >
                    0
                  </Button>
                  <Button
                    onClick={() => handleKeypadInput('enter')}
                    disabled={checkinCode.length !== 4}
                    className="h-12 bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-400/20"
                  >
                    <CheckCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Name Search */}
            <TabsContent value="search" className="space-y-4">
              <div>
                <Label className="text-white mb-2 block text-lg">Search Member by Name</Label>
                <div className="flex space-x-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter member name..."
                    className="bg-white/10 border-white/20 text-white flex-1"
                  />
                  <Button
                    onClick={() => findMemberByName(searchQuery)}
                    disabled={!searchQuery.trim()}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Member Details & Check-in Button */}
      {foundMember && (
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Member Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={foundMember.avatar} alt={foundMember.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {foundMember.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-white text-lg">{foundMember.name}</h3>
                <p className="text-sm text-white/70">{foundMember.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/70">Membership:</span>
                <p className="text-white font-medium">{foundMember.membershipType}</p>
              </div>
              <div>
                <span className="text-white/70">Status:</span>
                <Badge className={getPaymentStatusColor(foundMember.billingStatus)}>
                  {foundMember.billingStatus.toUpperCase()}
                </Badge>
              </div>
            </div>

            {foundMember.billingStatus === 'overdue' && (
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-yellow-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Payment Overdue</span>
                </div>
                <p className="text-yellow-400/80 text-sm mt-1">
                  Member has overdue payments - consider resolving before check-in
                </p>
              </div>
            )}

            <Button
              onClick={handleCheckIn}
              className="w-full bg-primary hover:bg-primary/80 py-3 text-lg font-semibold"
              size="lg"
            >
              <CheckCircle className="h-6 w-6 mr-2" />
              Check In Member
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Check-ins */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recent Check-ins</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentCheckins.length === 0 ? (
            <div className="text-center py-6">
              <Clock className="h-8 w-8 text-white/30 mx-auto mb-2" />
              <p className="text-white/70">No check-ins yet today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCheckins.map((checkin) => (
                <div key={checkin.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{checkin.memberName}</p>
                    <p className="text-xs text-white/70">
                      {new Date(checkin.checkinTime).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {checkin.method}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};