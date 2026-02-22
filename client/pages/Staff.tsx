import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, DollarSign, Calendar, Settings, Clock, Plus, Dumbbell, X, 
  Pencil, Trash2, CheckCircle, AlertCircle, Eye, EyeOff, Building2, 
  Search, Filter, MoreVertical, Shield, BarChart3, CreditCard, Globe, 
  TrendingUp, FileText, HelpCircle, Menu, LogOut, User 
} from 'lucide-react';

// Storage utilities with gym-specific implementation
const createGymStorage = (key) => ({
  getAll: (gymId) => JSON.parse(localStorage.getItem(`${key}_${gymId}`) || '[]'),
  add: (gymId, item) => {
    const all = JSON.parse(localStorage.getItem(`${key}_${gymId}`) || '[]');
    all.push(item);
    localStorage.setItem(`${key}_${gymId}`, JSON.stringify(all));
  },
  update: (gymId, id, updates) => {
    const all = JSON.parse(localStorage.getItem(`${key}_${gymId}`) || '[]');
    const idx = all.findIndex(item => item.id === id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(`${key}_${gymId}`, JSON.stringify(all));
    }
  },
  remove: (gymId, id) => {
    const all = JSON.parse(localStorage.getItem(`${key}_${gymId}`) || '[]').filter(item => item.id !== id);
    localStorage.setItem(`${key}_${gymId}`, JSON.stringify(all));
  }
});

// Storage instances
const activityStorage = {
  ...createGymStorage('gym_activities'),
  getByUser: (gymId, userId) => createGymStorage('gym_activities').getAll(gymId).filter(a => a.userId === userId),
  getByDateRange: (gymId, startDate, endDate) => {
    const activities = createGymStorage('gym_activities').getAll(gymId);
    return activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      return activityDate >= startDate && activityDate <= endDate;
    });
  },
  getToday: (gymId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return activityStorage.getByDateRange(gymId, today, tomorrow);
  },
  add: (gymId, activity) => {
    const key = `gym_activities_${gymId}`;
    const activities = JSON.parse(localStorage.getItem(key) || '[]');
    activities.unshift({ 
      ...activity, 
      id: `activity-${Date.now()}`, 
      timestamp: new Date().toISOString(),
      gymAssigned: gymId // Add gym assignment tracking
    });
    localStorage.setItem(key, JSON.stringify(activities.slice(0, 1000)));
  }
};

const staffStorage = createGymStorage('gym_staff');
const payrollStorage = createGymStorage('gym_payroll');

// Utility functions
const getPaymentPeriod = (payrollEntry) => {
  const now = new Date();
  switch (payrollEntry.payrollType) {
    case 'hourly':
      return `Hour ending ${now.toLocaleTimeString()}`;
    case 'weekly':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      return `Week of ${weekStart.toLocaleDateString()}`;
    case 'monthly':
      return `Month of ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    case 'per_session':
      return `Session on ${now.toLocaleDateString()}`;
    default:
      return `Payment on ${now.toLocaleDateString()}`;
  }
};

const isPaymentDue = (payrollEntry) => {
  if (payrollEntry.status !== 'paid') return true;
  
  if (!payrollEntry.lastPaidDate) return true;
  
  const lastPaid = new Date(payrollEntry.lastPaidDate);
  const now = new Date();
  
  switch (payrollEntry.payrollType) {
    case 'hourly':
      return now.getTime() - lastPaid.getTime() > 60 * 60 * 1000;
    case 'weekly':
      return now.getTime() - lastPaid.getTime() > 7 * 24 * 60 * 60 * 1000;
    case 'monthly':
      return now.getTime() - lastPaid.getTime() > 30 * 24 * 60 * 60 * 1000;
    case 'per_session':
      return true;
    default:
      return true;
  }
};

// UI Components
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl'
  };

  return (
    <div className=" bg-background fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className={` rounded-lg shadow-2xl border border-white/10 w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col`}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', type = 'danger' }) => {
  const [inputValue, setInputValue] = useState('');
  const requiresTyping = type === 'danger';

  const handleConfirm = () => {
    if (requiresTyping && inputValue !== 'DELETE') return;
    onConfirm();
    setInputValue('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="p-6 space-y-4">
        <p className="text-white/80">{message}</p>
        {requiresTyping && (
          <div>
            <label className="block text-sm text-white/60 mb-2">Type DELETE to confirm</label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              placeholder="DELETE"
            />
          </div>
        )}
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={requiresTyping && inputValue !== 'DELETE'}
            className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const Input = ({ label, error, ...props }: { label?: string; error?: string; [key: string]: any }) => (
  <div>
    {label && <label className="block text-sm font-medium text-white/80 mb-2">{label}</label>}
    <input
      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500 transition-colors"
      {...props}
    />
    {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
  </div>
);

const Select = ({ label, options = [], error, ...props }: { label?: string; options?: { value: string; label: string }[]; error?: string; [key: string]: any }) => (
  <div>
    {label && <label className="block text-sm font-medium text-white/80 mb-2">{label}</label>}
    
    <select
      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
      {...props}
    >
      
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const Checkbox = ({ label, checked, onChange }) => (
  <label className="flex items-center space-x-2 cursor-pointer group">
    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
      checked ? 'bg-blue-600 border-blue-600' : 'border-white/30 group-hover:border-white/50'
    }`}>
      {checked && <CheckCircle className="h-4 w-4 text-white" />}
    </div>
    <span className="text-sm text-white/80">{label}</span>
  </label>
);

const StaffFormModal = ({ isOpen, onClose, onSubmit, editData, allPermissions, currentGym }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'manager',
    permissions: [],
    payrollType: 'monthly',
    payrollRate: '',
    password: '',
    active: true,
    gymAssigned: currentGym?.id || '' // Add gym assignment field
  });

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'manager',
        permissions: [],
        payrollType: 'monthly',
        payrollRate: '',
        password: '',
        active: true,
        gymAssigned: currentGym?.id || ''
      });
    }
  }, [editData, isOpen, currentGym]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      gymAssigned: currentGym?.id // Ensure gym assignment is set
    };
    onSubmit(finalData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Staff Member' : 'Add Staff Member'} size="lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Gym Assignment Display */}
        {currentGym && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-blue-400">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">Assigned to: {currentGym.name}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@email.com"
            required
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(xxx) xxx-xxxx"
          />
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={editData ? 'Leave blank to keep current' : 'Temporary password'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-3">Role</label>
          <div className="flex space-x-4">
            {['manager', 'trainer', 'front-desk'].map(role => (
              <label key={role} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={formData.role === role}
                  onChange={() => setFormData({ ...formData, role })}
                  className="w-4 h-4"
                />
                <span className="text-white/80 capitalize">{role.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Payroll Type"
            value={formData.payrollType}
            onChange={(e) => setFormData({ ...formData, payrollType: e.target.value })}
            options={[
              { value: 'hourly', label: 'Hourly' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'per_session', label: 'Per Session' }
            ]}
          />
          <Input
            label={`Payroll Rate (${currentGym?.settings?.currency || 'RWF'})`}
            type="number"
            value={formData.payrollRate}
            onChange={(e) => setFormData({ ...formData, payrollRate: e.target.value })}
            placeholder="5000"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-white/80">Permissions</label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, permissions: allPermissions })}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Enable All
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto bg-white/5 p-4 rounded-lg">
            {allPermissions.map(perm => (
              <Checkbox
                key={perm}
                label={perm.replace(/_/g, ' ')}
                checked={formData.permissions.includes(perm)}
                onChange={() => {
                  const newPerms = formData.permissions.includes(perm)
                    ? formData.permissions.filter(p => p !== perm)
                    : [...formData.permissions, perm];
                  setFormData({ ...formData, permissions: newPerms });
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Checkbox
            label="Active Status"
            checked={formData.active}
            onChange={() => setFormData({ ...formData, active: !formData.active })}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
          <button type="button" onClick={onClose} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">
            Cancel
          </button>
          <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            {editData ? 'Update' : 'Add'} Staff Member
          </button>
        </div>
      </form>
    </Modal>
  );
};

const PayrollFormModal = ({ isOpen, onClose, onSubmit, editData, staffOptions, currentGym }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    userId: null,
    payrollType: 'monthly',
    rate: '',
    workerType: 'staff',
    gymAssigned: currentGym?.id || '' // Add gym assignment field
  });

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      setFormData({
        name: '',
        userId: null,
        payrollType: 'monthly',
        rate: '',
        workerType: 'staff',
        gymAssigned: currentGym?.id || ''
      });
    }
  }, [editData, isOpen, currentGym]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      gymAssigned: currentGym?.id // Ensure gym assignment is set
    };
    onSubmit(finalData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Payroll Entry' : 'Add Payroll Entry'} size="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Gym Assignment Display */}
        {currentGym && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-blue-400">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">Assigned to: {currentGym.name}</span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white/80 mb-3">Worker Type</label>
          <div className="flex space-x-4">
            {['staff', 'other', 'instructor'].map(type => (
              <label key={type} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={formData.workerType === type}
                  onChange={() => setFormData({ ...formData, workerType: type, userId: type === 'staff' ? formData.userId : null })}
                  className="w-4 h-4"
                />
                <span className="text-white/80 capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {formData.workerType === 'staff' ? (
          <Select
            label="Select Staff Member"
            value={formData.userId || ''}
            onChange={(e) => {
              const staff = staffOptions.find(s => s.id === e.target.value);
              setFormData({ 
                ...formData, 
                userId: e.target.value,
                name: staff ? staff.name : formData.name
              });
            }}
            options={[
              { value: '', label: '-- Select Staff --' },
              ...staffOptions.map(s => ({ value: s.id, label: s.name }))
            ]}
          />
        ) : (
          <Input
            label="Worker Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter name"
            required
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Payroll Type"
            value={formData.payrollType}
            onChange={(e) => setFormData({ ...formData, payrollType: e.target.value })}
            options={[
              { value: 'hourly', label: 'Hourly' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'per_session', label: 'Per Session' }
            ]}
          />
          <Input
            label={`Rate (${currentGym?.settings?.currency || 'RWF'})`}
            type="number"
            value={formData.rate}
            onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
            placeholder="5000"
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
          <button type="button" onClick={onClose} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors">
            Cancel
          </button>
          <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            {editData ? 'Update' : 'Add'} Entry
          </button>
        </div>
      </form>
    </Modal>
  );
};

const ActivityFilter = ({ filters, onFiltersChange, staffMembers }) => {
  const [showFilters, setShowFilters] = useState(false);

  const timeRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const actions = [
    { value: 'all', label: 'All Actions' },
    { value: 'CREATE', label: 'Created' },
    { value: 'UPDATE', label: 'Updated' },
    { value: 'DELETE', label: 'Deleted' },
    { value: 'PAYMENT', label: 'Payments' }
  ];

  return (
    <div className="mb-4">
      <div className="flex items-center space-x-4">
        <Select
          label="select Day"
          value={filters.timeRange}
          onChange={(e) => onFiltersChange({ ...filters, timeRange: e.target.value })}
          options={timeRanges}
        />

        <Select
          label="select Action"
          value={filters.action}
          onChange={(e) => onFiltersChange({ ...filters, action: e.target.value })}
          options={actions}
        />

        <Select
          label="select user"
          value={filters.userId}
          onChange={(e) => onFiltersChange({ ...filters, userId: e.target.value })}
          options={[
            { value: 'all', label: 'All Users' },
            ...staffMembers.map(staff => ({ value: staff.id, label: staff.name }))
          ]}
        />
      </div>

      {showFilters && filters.timeRange === 'custom' && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={filters.startDate}
            onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })}
          />
          <Input
            label="End Date"
            type="date"
            value={filters.endDate}
            onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
          />
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen, currentGym }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Members', path: '/members' },
    { icon: CreditCard, label: 'Billing', path: currentGym ? `/gyms/${currentGym.id}/billing` : '/billing' },
    { icon: TrendingUp, label: 'Marketing', path: currentGym ? `/gyms/${currentGym.id}/marketing` : '/marketing' },
    { icon: Globe, label: 'Website', path: currentGym ? `/gyms/${currentGym.id}/website` : '/website' },
    { icon: FileText, label: 'Sales', path: currentGym ? `/gyms/${currentGym.id}/sales` : '/sales' },
    { 
      icon: Dumbbell, 
      label: 'Gym', 
      path: currentGym ? `/gyms/${currentGym.id}/staff` : '/gyms/staff'
    },
    { icon: Settings, label: 'Settings', path: currentGym ? `/gyms/${currentGym.id}/settings` : '/settings' },
    { icon: Building2, label: 'Front Desk', path: currentGym ? `/gyms/${currentGym.id}/front-desk` : '/front-desk' },
    { icon: HelpCircle, label: 'Help', path: '/help' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-[#1a1a1a] border-r border-white/10 flex flex-col py-4 z-40 transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'
      }`}>
        
        {/* Logo */}
        <div className="flex items-center justify-center px-3 mb-8">
          <Link to="/dashboard" className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            {isMobileMenuOpen && (
              <span className="ml-3 text-white font-semibold text-lg">Elite Fitness</span>
            )}
          </Link>
        </div>
        
        {/* Navigation Items */}
        <div className="flex flex-col space-y-1 px-2 flex-1">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={index}
                to={item.path}
                className={`w-full flex items-center text-white/80 hover:bg-white/10 rounded-lg transition-colors h-12 px-3 group ${
                  isActive ? 'bg-white/10 text-white' : ''
                } ${isMobileMenuOpen ? 'justify-start' : 'justify-center'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon className={`h-5 w-5 ${isMobileMenuOpen ? 'mr-3' : ''} ${isActive ? 'text-blue-400' : ''}`} />
                {isMobileMenuOpen && (
                  <span className="text-sm group-hover:text-white">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Section */}
        <div className="px-3 pt-4 border-t border-white/10">
          <div className={`flex items-center ${isMobileMenuOpen ? 'justify-start' : 'justify-center'} mb-4`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {isMobileMenuOpen && (
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-white/60 text-xs truncate">{user?.email || ''}</p>
                {currentGym && (
                  <p className="text-blue-400 text-xs truncate">{currentGym.name}</p>
                )}
              </div>
            )}
          </div>
          
          {isMobileMenuOpen && (
            <button 
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3" />
              <span className="text-sm">Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

// Main Component
const StaffPayrollManagement = () => {
  const { user, currentGym, logout, setCurrentGym, userGyms } = useAuth();
  const { gymId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('staff');
  const [staff, setStaff] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [expandedPerms, setExpandedPerms] = useState({});
  const [showActivities, setShowActivities] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activityFilters, setActivityFilters] = useState({
    timeRange: 'today',
    action: 'all',
    userId: 'all',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Set active tab based on current route - default to staff
  useEffect(() => {
    if (location.pathname.includes('/staff')) {
      setActiveTab('staff');
    }
  }, [location.pathname]);

  const allPermissions = [
    'view_members', 'edit_members', 'member_checkin', 'view_invoices', 'modify_payments', 'billing_settings',
    'create_sale', 'manage_products', 'sales_settings', 'website_content', 'website_settings', 'marketing',
    'manage_tasks', 'manage_payroll', 'front_desk_mode', 'dashboard_notifications', 'gym_schedule',
    'gym_settings', 'staff_management'
  ];

  useEffect(() => {
    loadData();
  }, [currentGym]);

  const loadData = () => {
    if (currentGym) {
      setStaff(staffStorage.getAll(currentGym.id));
      setPayroll(payrollStorage.getAll(currentGym.id));
    }
  };

  const logActivity = (action, details, entity = null) => {
    if (!currentGym || !user) return;
    
    activityStorage.add(currentGym.id, {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      gymId: currentGym.id,
      gymName: currentGym.name,
      action,
      details,
      entity: entity || activeTab,
      gymAssigned: currentGym.id // Track gym assignment in activities
    });
  };

  const handleAddStaff = (formData) => {
    if (!currentGym || !user) return;
    
    const newStaff = {
      id: `staff-${Date.now()}`,
      ...formData,
      gymId: currentGym.id,
      gymAssigned: currentGym.id, // Ensure gym assignment
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      createdByName: user.name,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
      updatedByName: user.name
    };
    staffStorage.add(currentGym.id, newStaff);
    logActivity('CREATE', `Added staff member: ${formData.name}`, 'staff');
    loadData();
  };

  const handleUpdateStaff = (formData) => {
    if (!currentGym || !user) return;
    
    const updates = {
      ...formData,
      gymAssigned: currentGym.id, // Ensure gym assignment on update
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
      updatedByName: user.name
    };
    staffStorage.update(currentGym.id, editingStaff.id, updates);
    logActivity('UPDATE', `Updated staff member: ${formData.name}`, 'staff');
    setEditingStaff(null);
    loadData();
  };

  const handleDeleteStaff = (staffMember) => {
    setConfirmAction({
      title: 'Delete Staff Member',
      message: `Are you sure you want to permanently delete ${staffMember.name}? This action cannot be undone.`,
      onConfirm: () => {
        if (!currentGym) return;
        staffStorage.remove(currentGym.id, staffMember.id);
        logActivity('DELETE', `Deleted staff member: ${staffMember.name}`, 'staff');
        loadData();
      }
    });
    setShowConfirmModal(true);
  };

  const handleAddPayroll = (formData) => {
    if (!currentGym || !user) return;
    
    const newPayroll = {
      id: `payroll-${Date.now()}`,
      ...formData,
      gymId: currentGym.id,
      gymAssigned: currentGym.id, // Ensure gym assignment
      status: 'unpaid',
      lastPaidDate: null,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      createdByName: user.name,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
      updatedByName: user.name,
      paymentHistory: []
    };
    payrollStorage.add(currentGym.id, newPayroll);
    logActivity('CREATE', `Added payroll entry: ${formData.name}`, 'payroll');
    loadData();
  };

  const handleUpdatePayroll = (formData) => {
    if (!currentGym || !user) return;
    
    const updates = {
      ...formData,
      gymAssigned: currentGym.id, // Ensure gym assignment on update
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
      updatedByName: user.name
    };
    payrollStorage.update(currentGym.id, editingPayroll.id, updates);
    logActivity('UPDATE', `Updated payroll entry: ${formData.name}`, 'payroll');
    setEditingPayroll(null);
    loadData();
  };

  const handleDeletePayroll = (payrollEntry) => {
    setConfirmAction({
      title: 'Delete Payroll Entry',
      message: `Are you sure you want to permanently delete the payroll entry for ${payrollEntry.name}?`,
      onConfirm: () => {
        if (!currentGym) return;
        payrollStorage.remove(currentGym.id, payrollEntry.id);
        logActivity('DELETE', `Deleted payroll entry: ${payrollEntry.name}`, 'payroll');
        loadData();
      }
    });
    setShowConfirmModal(true);
  };

  const handleMarkPaid = (payrollEntry) => {
    if (!currentGym || !user) return;
    
    const paymentRecord = {
      id: `payment-${Date.now()}`,
      amount: payrollEntry.rate,
      date: new Date().toISOString(),
      paidBy: user.id,
      paidByName: user.name,
      payrollType: payrollEntry.payrollType,
      period: getPaymentPeriod(payrollEntry),
      gymAssigned: currentGym.id // Track gym assignment in payment
    };

    const updates = {
      status: 'paid',
      lastPaidDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
      updatedByName: user.name,
      paymentHistory: [...(payrollEntry.paymentHistory || []), paymentRecord]
    };
    
    payrollStorage.update(currentGym.id, payrollEntry.id, updates);
    logActivity('PAYMENT', `Marked ${payrollEntry.name} as paid - ${payrollEntry.rate} ${currentGym.settings?.currency || 'RWF'}`, 'payroll');
    loadData();
  };

  const getFilteredActivities = () => {
    if (!currentGym) return [];
    
    let activities = activityStorage.getAll(currentGym.id);

    // Filter by time range
    switch (activityFilters.timeRange) {
      case 'today':
        activities = activityStorage.getToday(currentGym.id);
        break;
      case 'yesterday':
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const today = new Date(yesterday);
        today.setDate(today.getDate() + 1);
        activities = activityStorage.getByDateRange(currentGym.id, yesterday, today);
        break;
      case 'week':
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        activities = activityStorage.getByDateRange(currentGym.id, weekStart, new Date());
        break;
      case 'month':
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        activities = activityStorage.getByDateRange(currentGym.id, monthStart, new Date());
        break;
      case 'custom':
        if (activityFilters.startDate && activityFilters.endDate) {
          const start = new Date(activityFilters.startDate);
          const end = new Date(activityFilters.endDate);
          end.setHours(23, 59, 59, 999);
          activities = activityStorage.getByDateRange(currentGym.id, start, end);
        }
        break;
      default:
        break;
    }

    // Filter by action
    if (activityFilters.action !== 'all') {
      activities = activities.filter(activity => activity.action === activityFilters.action);
    }

    // Filter by user
    if (activityFilters.userId !== 'all') {
      activities = activities.filter(activity => activity.userId === activityFilters.userId);
    }

    return activities.slice(0, 100);
  };

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayroll = payroll.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activities = getFilteredActivities();

  if (!currentGym) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Gym Selected</h2>
          <p className="text-white/60">Please select a gym to manage staff and payroll.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Sidebar Navigation */}
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        currentGym={currentGym}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        isMobileMenuOpen ? 'lg:ml-20' : 'lg:ml-20'
      }`}>
        {/* Header */}
        <div className="bg-[#1a1a1a] border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {activeTab === 'staff' ? 'Staff Management' : 'Payroll Management'}
              </h1>
              <p className="text-white/60 text-sm mt-1">{currentGym.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowActivities(!showActivities)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Shield className="h-4 w-4" />
                <span>Activity Log</span>
              </button>
              
              {/* Navigation between staff and payroll */}
              <div className="flex bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('staff')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'staff' ? 'bg-blue-600 text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Staff
                </button>
                <button
                  onClick={() => setActiveTab('payroll')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'payroll' ? 'bg-blue-600 text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Payroll
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Sidebar */}
        {showActivities && (
          <div className="fixed right-0 top-0 h-full w-96 bg-[#1a1a1a] border-l border-white/10 z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Activity Log - {currentGym.name}</h2>
                <button onClick={() => setShowActivities(false)} className="text-white/60 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <ActivityFilter 
                filters={activityFilters}
                onFiltersChange={setActivityFilters}
                staffMembers={staff}
              />

              <div className="space-y-3">
                {activities.length === 0 ? (
                  <p className="text-white/40 text-sm">No activities found for the selected filters</p>
                ) : (
                  activities.map(activity => (
                    <div key={activity.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          activity.action === 'CREATE' ? 'bg-green-500/20 text-green-400' :
                          activity.action === 'UPDATE' ? 'bg-blue-500/20 text-blue-400' :
                          activity.action === 'DELETE' ? 'bg-red-500/20 text-red-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {activity.action === 'CREATE' && <Plus className="h-4 w-4" />}
                          {activity.action === 'UPDATE' && <Pencil className="h-4 w-4" />}
                          {activity.action === 'DELETE' && <Trash2 className="h-4 w-4" />}
                          {activity.action === 'PAYMENT' && <DollarSign className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white/90">{activity.details}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-white/40">
                              By: {activity.userName}
                            </p>
                            <p className="text-xs text-white/40">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="p-6">
          {/* Search and Action Bar */}
          <div className="mb-6 flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => activeTab === 'staff' ? setShowStaffModal(true) : setShowPayrollModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors ml-4"
            >
              <Plus className="h-4 w-4" />
              <span>Add {activeTab === 'staff' ? 'Staff' : 'Payroll Entry'}</span>
            </button>
          </div>

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <div className="space-y-3">
              {filteredStaff.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
                  <Users className="h-12 w-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">No staff members found</p>
                </div>
              ) : (
                filteredStaff.map(member => (
                  <div key={member.id} className="bg-white/5 rounded-lg border border-white/10 p-5 hover:bg-white/[0.07] transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                          {member.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-white text-lg">{member.name}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              member.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {member.active ? 'Active' : 'Inactive'}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 capitalize">
                              {member.role.replace('-', ' ')}
                            </span>
                          </div>
                          <p className="text-white/60 text-sm mb-3">{member.email}</p>
                          
                          <div className="flex items-center space-x-12 text-sm">
                            <div>
                              <span className="text-white/40">Payroll:</span>
                              <span className="text-white ml-2 font-medium">
                                {member.payrollRate} {currentGym.settings?.currency || 'RWF'}/{member.payrollType}
                              </span>
                            </div>
                            {member.phone && (
                              <div>
                                <span className="text-white/40">Phone:</span>
                                <span className="text-white ml-2">{member.phone}</span>
                              </div>
                            )}

                            <div className="mt-3 text-xs text-white/40">
                              <p>Created by {member.createdByName} on {new Date(member.createdAt).toLocaleDateString()}</p>
                              {member.updatedByName && member.updatedAt && (
                                <p>Last updated by {member.updatedByName} on {new Date(member.updatedAt).toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 flex">
                            <button
                              onClick={() => setExpandedPerms({ ...expandedPerms, [member.id]: !expandedPerms[member.id] })}
                              className="text-sm text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                            >
                              {expandedPerms[member.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              <span>{expandedPerms[member.id] ? 'Hide' : 'View'} Permissions ({member.permissions.length})</span>
                            </button>
                            {expandedPerms[member.id] && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {member.permissions.map(perm => (
                                  <span key={perm} className="px-2 py-1 bg-white/5 rounded text-xs text-white/70">
                                    {perm.replace(/_/g, ' ')}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingStaff(member);
                            setShowStaffModal(true);
                          }}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4 text-white/80" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(member)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Payroll Tab */}
          {activeTab === 'payroll' && (
            <div className="space-y-3">
              {filteredPayroll.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
                  <DollarSign className="h-12 w-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">No payroll entries found</p>
                </div>
              ) : (
                filteredPayroll.map(entry => {
                  const isDue = isPaymentDue(entry);
                  const canMarkPaid = entry.status !== 'paid' || isDue;

                  return (
                    <div key={entry.id} className="bg-white/5 rounded-lg border border-white/10 p-5 hover:bg-white/[0.07] transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-semibold text-lg">
                            {entry.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-white text-lg">{entry.name}</h3>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                entry.status === 'paid' && !isDue ? 'bg-green-500/20 text-green-400' :
                                isDue ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {entry.status === 'paid' && !isDue ? 'Paid' : isDue ? 'Payment Due' : 'Pending'}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 capitalize">
                                {entry.workerType || 'staff'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                              <div>
                                <p className="text-white/40 text-xs mb-1">Rate</p>
                                <p className="text-white font-medium">{entry.rate} {currentGym.settings?.currency || 'RWF'}</p>
                              </div>
                              <div>
                                <p className="text-white/40 text-xs mb-1">Type</p>
                                <p className="text-white capitalize">{entry.payrollType}</p>
                              </div>
                              <div>
                                <p className="text-white/40 text-xs mb-1">Last Paid</p>
                                <p className="text-white">
                                  {entry.lastPaidDate ? new Date(entry.lastPaidDate).toLocaleDateString() : 'Never'}
                                </p>
                              </div>
                            </div>

                            {/* Payment History */}
                            {entry.paymentHistory && entry.paymentHistory.length > 0 && (
                              <div className="mt-3">
                                <button
                                  onClick={() => setExpandedPerms({ ...expandedPerms, [entry.id]: !expandedPerms[entry.id] })}
                                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>Payment History ({entry.paymentHistory.length})</span>
                                </button>
                                {expandedPerms[entry.id] && (
                                  <div className="mt-2 space-y-2">
                                    {entry.paymentHistory.slice(-5).reverse().map(payment => (
                                      <div key={payment.id} className="bg-white/5 rounded p-2 text-xs">
                                        <div className="flex justify-between">
                                          <span className="text-white/70">{payment.period}</span>
                                          <span className="text-green-400">{payment.amount} {currentGym.settings?.currency || 'RWF'}</span>
                                        </div>
                                        <div className="text-white/40 mt-1">
                                          Paid by {payment.paidByName} on {new Date(payment.date).toLocaleDateString()}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Audit Information */}
                            <div className="mt-3 text-xs text-white/40">
                              <p>Created by {entry.createdByName} on {new Date(entry.createdAt).toLocaleDateString()}</p>
                              {entry.updatedByName && entry.updatedAt && (
                                <p>Last updated by {entry.updatedByName} on {new Date(entry.updatedAt).toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          {canMarkPaid && (
                            <button
                              onClick={() => handleMarkPaid(entry)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm font-medium flex items-center space-x-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Mark Paid</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingPayroll(entry);
                              setShowPayrollModal(true);
                            }}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4 text-white/80" />
                          </button>
                          <button
                            onClick={() => handleDeletePayroll(entry)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <StaffFormModal
        isOpen={showStaffModal}
        onClose={() => {
          setShowStaffModal(false);
          setEditingStaff(null);
        }}
        onSubmit={editingStaff ? handleUpdateStaff : handleAddStaff}
        editData={editingStaff}
        allPermissions={allPermissions}
        currentGym={currentGym}
      />

      <PayrollFormModal
        isOpen={showPayrollModal}
        onClose={() => {
          setShowPayrollModal(false);
          setEditingPayroll(null);
        }}
        onSubmit={editingPayroll ? handleUpdatePayroll : handleAddPayroll}
        editData={editingPayroll}
        staffOptions={staff}
        currentGym={currentGym}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onConfirm={() => {
          if (confirmAction?.onConfirm) confirmAction.onConfirm();
        }}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default StaffPayrollManagement;