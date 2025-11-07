import { useEffect, useState, FC } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Gym } from '@shared/types';
import { usersStorage, gymStorage, userStorage } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/contexts/ToastContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Users, DollarSign, Calendar, Settings, Clock, Plus } from 'lucide-react';

type StoredUser = { user: any; password?: string };

const allPermissions = [
  'view_members','edit_members','member_checkin','view_invoices','modify_payments','billing_settings',
  'create_sale','manage_products','sales_settings','website_content','website_settings','marketing','manage_tasks',
  'manage_payroll','front_desk_mode','dashboard_notifications','gym_schedule','gym_settings','staff_management'
];

const generatePassword = () => Math.random().toString(36).slice(-8) + 'A1!';

export const Staff: FC = () => {
  const { gymId } = useParams<{ gymId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [gym, setGym] = useState<Gym | null>(null);
  const [staff, setStaff] = useState<StoredUser[]>([]);

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'manager'|'trainer'|'front-desk'>('manager');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [sendInvite, setSendInvite] = useState(true);
  const [payrollType, setPayrollType] = useState<'hourly'|'weekly'|'monthly'|'per_session'>('monthly');
  const [payrollRate, setPayrollRate] = useState<number | ''>('');
  const [passwordField, setPasswordField] = useState('');
  const [statusActive, setStatusActive] = useState(true);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);

  useEffect(() => {
    if (!gymId) return;
    const g = gymStorage.getById(gymId);
    setGym(g);
    refreshList();
  }, [gymId]);

  const refreshList = () => {
    if (!gymId) return;
    const all = usersStorage.getAll();
    const list = all.filter(su => su.user.gymAssignments?.some((a: any) => a.gymId === gymId));
    setStaff(list);
  };

  const togglePermission = (p: string) => {
    setPermissions(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const enableAllPermissions = () => setPermissions([...allPermissions]);

  const handleCreate = () => {
    if (!gymId) return;
    if (!email || !name) {
      showToast({ type: 'error', title: 'Missing fields', message: 'Name and email are required' });
      return;
    }

    // Check existing user
    const existing = usersStorage.findByEmail(email);
    const pwd = passwordField || generatePassword();

    const payrollInfo = { type: payrollType, rate: payrollRate };

    if (existing) {
      // user exists - add assignment if not present
      const u = existing.user;
      if (u.gymAssignments?.some((a: any) => a.gymId === gymId)) {
        showToast({ type: 'warning', title: 'Already assigned', message: 'User already assigned to this gym' });
        return;
      }
      const assignment = { gymId, role, permissions, paid: true, payrollInfo, active: statusActive };
      u.gymAssignments = u.gymAssignments || [];
      u.gymAssignments.push(assignment);
      usersStorage.updateUser(u.id, { gymAssignments: u.gymAssignments });
      showToast({ type: 'success', title: 'Staff Assigned', message: `${u.name} assigned to ${gym?.name}` });
      refreshList();
      return;
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      role: role === 'trainer' ? 'trainer' : 'manager',
      avatar: undefined,
      createdAt: new Date().toISOString(),
      gymAssignments: [{ gymId, role: role === 'trainer' ? 'trainer' : 'manager', permissions, paid: true, payrollInfo }]
    };

    usersStorage.add(newUser, pwd);

    showToast({ type: 'success', title: 'Staff Created', message: `Created ${name} with password ${pwd}` });
    if (sendInvite) {
      showToast({ type: 'info', title: 'Invitation', message: `Invitation (simulated) sent to ${email}` });
    }

    // Reset form
    setName(''); setEmail(''); setPhone(''); setPermissions([]); setRole('manager'); setPayrollRate(''); setPayrollType('monthly');
    refreshList();
  };

  const handleRemoveAssignment = (userId: string) => {
    // Double confirmation: first confirm, then require typing DELETE
    if (!confirm('Are you sure you want to remove this staff member from this gym?')) return;
    const typed = prompt('Type DELETE to confirm permanent removal from this gym');
    if (typed !== 'DELETE') {
      showToast({ type: 'warning', title: 'Aborted', message: 'Deletion cancelled' });
      return;
    }

    const all = usersStorage.getAll();
    const su = all.find(u => u.user.id === userId);
    if (!su) return;
    su.user.gymAssignments = su.user.gymAssignments.filter((a: any) => a.gymId !== gymId);
    if (su.user.gymAssignments.length === 0) {
      // remove user entirely
      usersStorage.remove(userId);
    } else {
      usersStorage.updateUser(userId, { gymAssignments: su.user.gymAssignments });
    }
    showToast({ type: 'success', title: 'Removed', message: 'Staff assignment removed' });
    refreshList();
  };

  const handleChangePassword = (userId: string) => {
    const newPwd = prompt('Enter new password');
    if (!newPwd) return;
    const all = usersStorage.getAll();
    const idx = all.findIndex(u => u.user.id === userId);
    if (idx === -1) return;
    const users = all;
    users[idx].password = newPwd;
    usersStorage.setAll(users);
    showToast({ type: 'success', title: 'Password Updated', message: 'Password changed successfully' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar (copied from Dashboard to keep navigation available) */}
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
              <Calendar className="h-5 w-5 mb-1" />
              <span className="text-xs text-sidebar-foreground/80">Members</span>
            </Button>
          </Link>

          <Link to={gym ? `/gyms/${gym.id}/staff` : '/gyms'} className="w-full">
            <Button variant="ghost" className="w-full flex flex-col items-center justify-center text-sidebar-foreground h-16 px-1 group">
              <Settings className="h-5 w-5 mb-1" />
              <span className="text-xs text-sidebar-foreground/80">Gym</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-[85px] p-6 text-foreground">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Managers & Staff</h1>
            <p className="text-white/70">Manage staff for {gym?.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild>
              <Link to="/gyms">Back to Gyms</Link>
            </Button>
          </div>
        </div>

        {/* Top navbar tabs */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <Button className="bg-primary">Managers & Staff</Button>
            <Button variant="ghost">Payroll</Button>
            <Button variant="ghost">Schedule</Button>
            <Button variant="ghost">Bookings</Button>
            <Button variant="ghost">Programs</Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Staff Member</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-white">Full name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Staff name" className="bg-white/5" />
              </div>
              <div>
                <Label className="text-white">Email</Label>
                <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="name@email.com" className="bg-white/5" />
              </div>
              <div>
                <Label className="text-white">Phone</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(xxx) xxx-xxxx" className="bg-white/5" />
              </div>
            </div>

            <div className="mt-4">
              <Label className="text-white">Role</Label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center space-x-2 text-white"><input type="radio" checked={role==='manager'} onChange={() => setRole('manager')} /> <span>Manager</span></label>
                <label className="flex items-center space-x-2 text-white"><input type="radio" checked={role==='trainer'} onChange={() => setRole('trainer')} /> <span>Trainer</span></label>
                <label className="flex items-center space-x-2 text-white"><input type="radio" checked={role==='front-desk'} onChange={() => setRole('front-desk')} /> <span>Front-Desk</span></label>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <Label className="text-white">Permissions</Label>
                <Button variant="ghost" onClick={enableAllPermissions}>Enable All</Button>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {allPermissions.map(p => (
                  <label key={p} className="flex items-center space-x-2 text-white/80">
                    <Checkbox id={p} checked={permissions.includes(p)} onCheckedChange={() => togglePermission(p)} />
                    <span className="text-sm capitalize">{p.replaceAll('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Payroll Type</Label>
                <Select onValueChange={(v) => setPayrollType(v as any)}>
                  <SelectTrigger className="w-full bg-white/5">
                    <SelectValue>{payrollType}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="per_session">Per Session</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Payroll Rate</Label>
                <Input value={payrollRate as any} onChange={e => setPayrollRate(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 5000" className="bg-white/5" />
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-white"><input type="checkbox" checked={sendInvite} onChange={(e) => setSendInvite(e.target.checked)} /> <span>Send Invitation</span></label>
              <Button onClick={handleCreate} className="bg-primary">Add Staff Member</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staff.length === 0 && <p className="text-white/70">No staff assigned to this gym yet.</p>}

              <div className="grid gap-2">
                {staff.map(su => {
                  const assignment = su.user.gymAssignments?.find((a:any) => a.gymId === gymId);
                  const otherGyms = su.user.gymAssignments?.filter((a:any) => a.gymId !== gymId) || [];
                  return (
                    <div key={su.user.id} className="bg-white/5 p-4 rounded-md flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={su.user.avatar} alt={su.user.name} />
                          <AvatarFallback>{su.user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-white font-medium">{su.user.name}</div>
                          <div className="text-sm text-white/60">{su.user.email}</div>
                          <div className="text-xs text-white/60 mt-1">{assignment?.permissions?.slice(0,4).join(', ') || 'No permissions'}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-right">
                        <div className="text-sm">
                          <div className="text-white/80">Role</div>
                          <div className="font-medium text-white">{assignment?.role || su.user.role}</div>
                        </div>

                        <div className="text-sm">
                          <div className="text-white/80">Date Added</div>
                          <div className="font-medium text-white">{formatDistanceToNow(new Date(su.user.createdAt), { addSuffix: true })}</div>
                        </div>

                        <div className="text-sm">
                          <div className="text-white/80">Gyms</div>
                          <div className="font-medium text-white">{1 + otherGyms.length}{otherGyms.length > 0 ? ` (+${otherGyms.length} more)` : ''}</div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="outline" onClick={() => handleChangePassword(su.user.id)} className="border-white/20 text-white">Change Password</Button>
                          <Button variant="destructive" onClick={() => handleRemoveAssignment(su.user.id)}>Remove</Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Staff;
