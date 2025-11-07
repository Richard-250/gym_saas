import React, { useEffect, useState } from 'react';
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

type StoredUser = { user: any; password?: string };

const allPermissions = [
  'view_members','edit_members','member_checkin','view_invoices','modify_payments','billing_settings',
  'create_sale','manage_products','sales_settings','website_content','website_settings','marketing','manage_tasks',
  'manage_payroll','front_desk_mode','dashboard_notifications','gym_schedule','gym_settings','staff_management'
];

const generatePassword = () => Math.random().toString(36).slice(-8) + 'A1!';

export const Staff: React.FC = () => {
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

  const handleCreate = () => {
    if (!gymId) return;
    if (!email || !name) {
      showToast({ type: 'error', title: 'Missing fields', message: 'Name and email are required' });
      return;
    }

    // Check existing user
    const existing = usersStorage.findByEmail(email);
    const pwd = generatePassword();
    if (existing) {
      // user exists - add assignment if not present
      const u = existing.user;
      if (u.gymAssignments?.some((a: any) => a.gymId === gymId)) {
        showToast({ type: 'warning', title: 'Already assigned', message: 'User already assigned to this gym' });
        return;
      }
      const assignment = { gymId, role, permissions, paid: true };
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
      gymAssignments: [{ gymId, role: role === 'trainer' ? 'trainer' : 'manager', permissions, paid: true }]
    };

    usersStorage.add(newUser, pwd);

    // Optionally set as current user if creating for self - not necessary

    showToast({ type: 'success', title: 'Staff Created', message: `Created ${name} with password ${pwd}` });
    if (sendInvite) {
      // In real app we'd send email; here we just toast
      showToast({ type: 'info', title: 'Invitation', message: `Invitation (simulated) sent to ${email}` });
    }

    // Reset form
    setName(''); setEmail(''); setPhone(''); setPermissions([]); setRole('manager');
    refreshList();
  };

  const handleRemoveAssignment = (userId: string) => {
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
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Gym Staff</h1>
            <p className="text-white/70">Manage staff for {gym?.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link to="/gyms">Back to Gyms</Link>
            </Button>
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
              <Label className="text-white">Permissions</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {allPermissions.map(p => (
                  <label key={p} className="flex items-center space-x-2 text-white/80">
                    <Checkbox id={p} checked={permissions.includes(p)} onCheckedChange={() => togglePermission(p)} />
                    <span className="text-sm capitalize">{p.replaceAll('_', ' ')}</span>
                  </label>
                ))}
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
              {staff.map(su => (
                <div key={su.user.id} className="bg-white/5 p-4 rounded-md flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">{su.user.name} <span className="text-white/60">({su.user.email})</span></div>
                    <div className="text-xs text-white/60">Role: {su.user.gymAssignments?.find((a:any) => a.gymId===gymId)?.role}</div>
                    <div className="text-xs text-white/60 mt-1">Permissions: {su.user.gymAssignments?.find((a:any)=>a.gymId===gymId)?.permissions?.join(', ') || 'None'}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={() => handleChangePassword(su.user.id)} className="border-white/20 text-white">Change Password</Button>
                    <Button variant="destructive" onClick={() => handleRemoveAssignment(su.user.id)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Staff;
