import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { gymPayrollStorage, gymPaymentStorage } from '@/lib/gym-storage';
import { usersStorage, gymStorage } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, addDays, differenceInCalendarDays } from 'date-fns';
import { Users, BarChart3, CreditCard, TrendingUp, Globe, FileText, Dumbbell, Settings, Building2, HelpCircle, User, Heart } from 'lucide-react';

const typeToDays: Record<string, number> = {
  hourly: 1,
  weekly: 7,
  monthly: 30,
  per_session: 0
};

const Payroll: React.FC = () => {
  const { currentGym, user: currentUser } = useAuth();
  const gymId = currentGym?.id;
  const [items, setItems] = useState<any[]>([]);
  const [staffOptions, setStaffOptions] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [assignToUserId, setAssignToUserId] = useState<string | null>(null);
  const [payrollType, setPayrollType] = useState<'hourly'|'weekly'|'monthly'|'per_session'>('monthly');
  const [rate, setRate] = useState<number | ''>('');

  useEffect(() => {
    if (!gymId) return;
    const list = gymPayrollStorage.getAll(gymId) || [];
    setItems(list);

    // load staff options from users assigned to this gym (exclude gym owner)
    const users = usersStorage.getAll();
    const staff = users.filter(u => u.user.gymAssignments?.some((a:any) => a.gymId === gymId));
    const filtered = staff.filter(s => s.user.id !== currentGym?.ownerId);
    setStaffOptions(filtered.map(s => ({ id: s.user.id, name: s.user.name })));
  }, [gymId, currentGym]);

  const refresh = () => {
    if (!gymId) return;
    setItems(gymPayrollStorage.getAll(gymId) || []);
  };

  const getUserById = (id?: string) => {
    if (!id) return null;
    const u = usersStorage.getAll().find(x => x.user.id === id);
    return u ? u.user : null;
  };

  const addWorker = () => {
    if (!gymId) return;
    if (!name) return;
    const id = `payroll-${Date.now()}`;
    const entry = {
      id,
      gymId,
      name,
      userId: assignToUserId,
      payrollType,
      rate: rate === '' ? 0 : Number(rate),
      lastPaidDate: null,
      status: 'unpaid',
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || 'system'
    };
    gymPayrollStorage.add(gymId, entry);
    setName(''); setAssignToUserId(null); setRate(''); setPayrollType('monthly');
    refresh();
  };

  const createPayrollForUser = (userId: string) => {
    if (!gymId) return null;
    const u = getUserById(userId);
    const id = `payroll-${Date.now()}`;
    const entry = {
      id,
      gymId,
      name: u?.name || 'Unknown',
      userId,
      payrollType: 'monthly',
      rate: 0,
      lastPaidDate: null,
      status: 'unpaid',
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || 'system'
    };
    gymPayrollStorage.add(gymId, entry);
    refresh();
    return id;
  };

  const markPaid = (id: string) => {
    if (!gymId) return;
    let localId = id;
    // If this is a virtual id (not yet persisted), create one
    if (localId.startsWith('virtual-')) {
      const userId = localId.replace('virtual-', '');
      const newId = createPayrollForUser(userId);
      if (newId) localId = newId;
    }
    const now = new Date().toISOString();
    gymPayrollStorage.update(gymId, localId, { lastPaidDate: now, status: 'paid', lastModifiedBy: currentUser?.id || 'system', lastModifiedAt: now });
    const entry = gymPayrollStorage.getAll(gymId).find(i => i.id === localId);
    gymPaymentStorage.add(gymId, { id: `pay-${Date.now()}`, gymId, memberId: '', amount: entry?.rate || 0, currency: currentGym?.settings.currency || 'RWF', status: 'paid', dueDate: now, paidAt: now, description: `Payroll payment to ${entry?.name}`, performedBy: currentUser?.id || 'system' });
    refresh();
  };

  const toggleActive = (id: string, next: boolean) => {
    if (!gymId) return;
    let localId = id;
    if (localId.startsWith('virtual-')) {
      const userId = localId.replace('virtual-', '');
      const newId = createPayrollForUser(userId);
      if (newId) localId = newId;
    }
    gymPayrollStorage.update(gymId, localId, { status: next ? 'active' : 'paused', lastModifiedBy: currentUser?.id || 'system', lastModifiedAt: new Date().toISOString() });
    refresh();
  };

  const daysUntilNext = (item: any) => {
    if (!item.lastPaidDate) return '-';
    const last = new Date(item.lastPaidDate);
    const days = typeToDays[item.payrollType] || 0;
    if (days === 0) return '-';
    const next = addDays(last, days);
    return differenceInCalendarDays(next, new Date());
  };

  if (!gymId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium">No gym selected</h3>
          <p className="text-muted-foreground">Please select a gym to view payroll.</p>
        </div>
      </div>
    );
  }

  // Build a combined view: include staff (excluding owner) and existing payroll entries
  const staffUsers = usersStorage.getAll().map(u => u.user).filter(u => u.gymAssignments?.some((a:any) => a.gymId === gymId) && u.id !== currentGym?.ownerId);
  const payrollByUser: Record<string, any> = {};
  items.forEach(it => { if (it.userId) payrollByUser[it.userId] = it; });

  const displayList = [
    // first, payroll entries that aren't attached to a user (contractors)
    ...items.filter(i => !i.userId),
    // then staff merged
    ...staffUsers.map(su => payrollByUser[su.id] ? payrollByUser[su.id] : { id: `virtual-${su.id}`, gymId, name: su.name, userId: su.id, payrollType: 'monthly', rate: 0, lastPaidDate: null, status: 'unpaid', createdAt: null, createdBy: su.gymAssignments?.find((a:any)=>a.gymId===gymId)?.addedBy || null })
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar copied from Dashboard to keep persistent navigation */}
      <div className="fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border flex flex-col py-4 z-40 w-[85px] lg:w-[85px]">
        <div className="flex items-center justify-center px-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Heart className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>

        <div className="flex flex-col space-y-1 px-2 flex-1">
          <Link to="/dashboard" className="w-full">
            <Button variant="ghost" className="w-full flex flex-col items-center justify-center text-sidebar-foreground h-16 px-1 group">
              <BarChart3 className="h-5 w-5 mb-1" />
              <span className="text-xs text-sidebar-foreground/80">Dashboard</span>
            </Button>
          </Link>

          <Link to="/members" className="w-full">
            <Button variant="ghost" className="w-full flex flex-col items-center justify-center text-sidebar-foreground h-16 px-1 group">
              <Users className="h-5 w-5 mb-1" />
              <span className="text-xs text-sidebar-foreground/80">Members</span>
            </Button>
          </Link>

          <Link to={gymId ? `/gyms/${gymId}/billing` : '/gyms'} className="w-full">
            <Button variant="ghost" className="w-full flex flex-col items-center justify-center text-sidebar-foreground h-16 px-1 group">
              <CreditCard className="h-5 w-5 mb-1" />
              <span className="text-xs text-sidebar-foreground/80">Billing</span>
            </Button>
          </Link>

          <Link to={gymId ? `/gyms/${gymId}/marketing` : '/gyms'} className="w-full">
            <Button variant="ghost" className="w-full flex flex-col items-center justify-center text-sidebar-foreground h-16 px-1 group">
              <TrendingUp className="h-5 w-5 mb-1" />
              <span className="text-xs text-sidebar-foreground/80">Marketing</span>
            </Button>
          </Link>

          <Link to={gymId ? `/gyms/${gymId}/website` : '/gyms'} className="w-full">
            <Button variant="ghost" className="w-full flex flex-col items-center justify-center text-sidebar-foreground h-16 px-1 group">
              <Globe className="h-5 w-5 mb-1" />
              <span className="text-xs text-sidebar-foreground/80">Website</span>
            </Button>
          </Link>

          <Link to={gymId ? `/gyms/${gymId}/sales` : '/gyms'} className="w-full">
            <Button variant="ghost" className="w-full flex flex-col items-center justify-center text-sidebar-foreground h-16 px-1 group">
              <FileText className="h-5 w-5 mb-1" />
              <span className="text-xs text-sidebar-foreground/80">Sales</span>
            </Button>
          </Link>

          <Link to={gymId ? `/gyms/${gymId}/gym` : '/gyms'} className="w-full">
            <Button variant="ghost" className="w-full flex flex-col items-center justify-center text-sidebar-foreground h-16 px-1 group">
              <Dumbbell className="h-5 w-5 mb-1" />
              <span className="text-xs text-sidebar-foreground/80">Gym</span>
            </Button>
          </Link>

          <Link to={gymId ? `/gyms/${gymId}/settings` : '/gyms'} className="w-full">
            <Button variant="ghost" className="w-full flex flex-col items-center justify-center text-sidebar-foreground h-16 px-1 group">
              <Settings className="h-5 w-5 mb-1" />
              <span className="text-xs text-sidebar-foreground/80">Settings</span>
            </Button>
          </Link>

          <Link to={gymId ? `/gyms/${gymId}/front-desk` : '/gyms'} className="w-full">
            <Button variant="ghost" className="w-full flex flex-col items-center justify-center text-sidebar-foreground h-16 px-1 group">
              <User className="h-5 w-5 mb-1" />
              <span className="text-xs text-sidebar-foreground/80">Front Desk</span>
            </Button>
          </Link>

          <Link to="/help" className="w-full">
            <Button variant="ghost" className="w-full flex flex-col items-center justify-center text-sidebar-foreground h-16 px-1 group">
              <HelpCircle className="h-5 w-5 mb-1" />
              <span className="text-xs text-sidebar-foreground/80">Help</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-[85px] p-6 text-foreground">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Payroll</h1>
              <p className="text-white/70">Manage payroll for {currentGym?.name}</p>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add Worker / Payroll Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <Label className="text-white">Worker name</Label>
                  <Input value={name} onChange={(e)=>setName(e.target.value)} className="bg-white/5" />
                </div>
                <div>
                  <Label className="text-white">Assign to user (optional)</Label>
                  <select value={assignToUserId || ''} onChange={e=>setAssignToUserId(e.target.value || null)} className="w-full bg-white/5 p-2 rounded">
                    <option value="">-- Unassigned / Contractor --</option>
                    {staffOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-white">Payroll Type</Label>
                  <select value={payrollType} onChange={e=>setPayrollType(e.target.value as any)} className="w-full bg-white/5 p-2 rounded">
                    <option value="hourly">Hourly</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="per_session">Per Session</option>
                  </select>
                </div>
                <div>
                  <Label className="text-white">Rate ({currentGym?.settings.currency || 'RWF'})</Label>
                  <Input value={rate as any} onChange={(e)=>setRate(e.target.value===''? '' : Number(e.target.value))} className="bg-white/5" />
                </div>
              </div>
              <div className="mt-4">
                <Button className="bg-primary" onClick={addWorker}>Add Worker</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payroll List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {displayList.length === 0 && <p className="text-white/70">No payroll entries yet.</p>}
                {displayList.map(item => (
                  <div key={item.id} className="bg-white/5 p-4 rounded flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white/80 font-medium">{item.name?.charAt(0)}</div>
                      <div>
                        <div className="text-white font-medium" title={(() => {
                          // show who created/added this record or assignment
                          const byId = item.createdBy || item.createdBy || (item.userId ? usersStorage.getAll().find(u=>u.user.id===item.userId)?.user.gymAssignments?.find((a:any)=>a.gymId===gymId)?.addedBy : undefined);
                          const author = usersStorage.getAll().find(u => u.user.id === byId);
                          return author ? `Added by: ${author.user.name}` : undefined;
                        })()}>{item.name}</div>
                        <div className="text-sm text-white/60">Type: {item.payrollType} • Rate: {item.rate} {currentGym?.settings.currency || 'RWF'}</div>
                        <div className="text-xs text-white/60">Last Paid: {item.lastPaidDate ? new Date(item.lastPaidDate).toLocaleDateString() : 'Never'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white/80">Due in (days)</div>
                      <div className="font-medium text-white">{daysUntilNext(item) === '-' ? '-' : `${daysUntilNext(item)} days`}</div>
                      <div className="mt-2 flex items-center justify-end space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${item.status === 'paid' ? 'bg-green-600 text-white' : item.status === 'active' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`}>{item.status === 'paid' ? 'Paid' : item.status === 'active' ? 'Active' : 'Unpaid'}</span>
                        <Button variant="outline" onClick={() => toggleActive(item.id, item.status !== 'active')}>{item.status === 'active' ? 'Pause' : 'Activate'}</Button>
                        <Button className="bg-primary" onClick={() => markPaid(item.id)}>Mark Paid</Button>
                      </div>
                      <div className="text-xs text-white/60 mt-2">{item.lastModifiedBy ? `Last action by ${getUserById(item.lastModifiedBy)?.name || item.lastModifiedBy}` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Payroll;
