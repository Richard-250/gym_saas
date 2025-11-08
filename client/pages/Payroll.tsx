import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { gymPayrollStorage, gymPaymentStorage } from '@/lib/gym-storage';
import { usersStorage } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDistanceToNow, addDays, differenceInCalendarDays } from 'date-fns';

const typeToDays: Record<string, number> = {
  hourly: 1,
  weekly: 7,
  monthly: 30,
  per_session: 0
};

const Payroll: React.FC = () => {
  const { currentGym } = useAuth();
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

    // load staff options from users assigned to this gym
    const users = usersStorage.getAll();
    const staff = users.filter(u => u.user.gymAssignments?.some((a:any) => a.gymId === gymId));
    setStaffOptions(staff.map(s => ({ id: s.user.id, name: s.user.name })));
  }, [gymId]);

  const refresh = () => {
    if (!gymId) return;
    setItems(gymPayrollStorage.getAll(gymId) || []);
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
      lastPaidDate: new Date().toISOString(),
      status: 'active',
      createdAt: new Date().toISOString()
    };
    gymPayrollStorage.add(gymId, entry);
    setName(''); setAssignToUserId(null); setRate(''); setPayrollType('monthly');
    refresh();
  };

  const markPaid = (id: string) => {
    if (!gymId) return;
    const now = new Date().toISOString();
    gymPayrollStorage.update(gymId, id, { lastPaidDate: now, status: 'paid' });
    // record a payment entry for audit
    gymPaymentStorage.add(gymId, { id: `pay-${Date.now()}`, gymId, memberId: '', amount: items.find(i=>i.id===id)?.rate || 0, currency: currentGym?.settings.currency || 'RWF', status: 'paid', dueDate: now, paidAt: now, description: `Payroll payment to ${items.find(i=>i.id===id)?.name}` });
    refresh();
  };

  const toggleActive = (id: string, next: boolean) => {
    if (!gymId) return;
    gymPayrollStorage.update(gymId, id, { status: next ? 'active' : 'paused' });
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

  return (
    <div className="min-h-screen bg-background p-6">
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
              {items.length === 0 && <p className="text-white/70">No payroll entries yet.</p>}
              {items.map(item => (
                <div key={item.id} className="bg-white/5 p-4 rounded flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">{item.name}</div>
                    <div className="text-sm text-white/60">Type: {item.payrollType} • Rate: {item.rate} {currentGym?.settings.currency || 'RWF'}</div>
                    <div className="text-xs text-white/60">Last Paid: {item.lastPaidDate ? new Date(item.lastPaidDate).toLocaleDateString() : 'Never'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white/80">Due in (days)</div>
                    <div className="font-medium text-white">{daysUntilNext(item) === '-' ? '-' : `${daysUntilNext(item)} days`}</div>
                    <div className="mt-2 flex items-center justify-end space-x-2">
                      <Button variant="outline" onClick={() => toggleActive(item.id, item.status !== 'active')}>{item.status === 'active' ? 'Pause' : 'Activate'}</Button>
                      <Button className="bg-primary" onClick={() => markPaid(item.id)}>Mark Paid</Button>
                    </div>
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

export default Payroll;
