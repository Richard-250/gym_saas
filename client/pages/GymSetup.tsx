import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutWithSidebar } from '@/components/ui/LayoutWithSidebar';
import { gymStorage, userStorage } from '@/lib/storage';
import { Gym } from '@shared/types';

export const GymSetup: React.FC = () => {
  const { user, refreshGyms } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [gymName, setGymName] = useState('');
  const [description, setDescription] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [country, setCountry] = useState('Rwanda');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [sector, setSector] = useState('');
  const [cell, setCell] = useState('');
  const [village, setVillage] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [timezone, setTimezone] = useState('Africa/Kigali');
  const [currency, setCurrency] = useState('RWF');
  const [features, setFeatures] = useState<string[]>([]);

  const availableFeatures = [
    'Aeorobics',
    'Boxing',
    'Circuit Training',
    'CrossFit',
    'Judo',
    'Personal Training',
    'Spin',
    'TRX',
    'Weight Training',
    'Pilates',
    'Strength & Conditioning',
    'Taekondo',
    'Adult Gymnastics',
    'Rhythmic Gymnastics',
  ];

  const handleFeatureChange = (feature: string, checked: boolean) => {
    if (checked) {
      setFeatures([...features, feature]);
    } else {
      setFeatures(features.filter(f => f !== feature));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const fullAddress = [addressLine, village, cell, sector, district, province, country].filter(Boolean).join(', ');

      const newGym: Gym = {
        id: `gym-${Date.now()}`,
        name: gymName,
        description,
        ownerId: user!.id,
        settings: {
          timezone,
          currency,
          address: fullAddress,
          location: {
            country,
            region: province,
            district,
            sector,
            cell,
            village,
            addressLine
          },
          phone,
          email,
          openingHours: {
            monday: { open: '06:00', close: '22:00' },
            tuesday: { open: '06:00', close: '22:00' },
            wednesday: { open: '06:00', close: '22:00' },
            thursday: { open: '06:00', close: '22:00' },
            friday: { open: '06:00', close: '22:00' },
            saturday: { open: '08:00', close: '20:00' },
            sunday: { open: '08:00', close: '20:00' }
          },
          features
        },
        subscription: {
          id: `sub-${Date.now()}`,
          planType: 'basic',
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          daysLeft: 30
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage
      gymStorage.add(newGym);

      // Update user's gym assignments to include the new gym and mark as paid (owner)
      const currentUser = userStorage.get();
      if (currentUser) {
        currentUser.gymAssignments.push({
          gymId: newGym.id,
          role: 'owner',
          permissions: ['all'],
          paid: true
        });
        userStorage.set(currentUser);

        // Also update the global users list if present
        try {
          const { usersStorage } = await import('@/lib/storage');
          usersStorage.updateUser(currentUser.id, { gymAssignments: currentUser.gymAssignments });
        } catch (e) {
          // ignore if module cannot be imported dynamically
        }
      }

      // Refresh gyms in context
      refreshGyms();

      showToast({
        type: 'success',
        title: 'Gym Created Successfully',
        message: `${gymName} has been set up and is ready to use!`
      });

      // Redirect to gyms page
      navigate('/gyms');
      
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Setup Failed',
        message: 'Unable to create your gym. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
              <CardDescription className="text-white/70">
                Let's start with the basics about your gym
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gym-name" className="text-white">Gym Name *</Label>
                <Input
                  id="gym-name"
                  placeholder="Enter your gym name"
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your gym"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
            </CardContent>
          </Card>
        );
      
      case 2:
        return (
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Contact Information</CardTitle>
              <CardDescription className="text-white/70">
                How can members reach your gym?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="addressLine" className="text-white">Address Line</Label>
                <Input
                  id="addressLine"
                  placeholder="Street address / PO Box"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="district" className="text-white">District</Label>
                  <Input id="district" placeholder="District" value={district} onChange={(e) => setDistrict(e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province" className="text-white">Province / Region</Label>
                  <Input id="province" placeholder="Province or Region" value={province} onChange={(e) => setProvince(e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="sector" className="text-white">Sector</Label>
                  <Input id="sector" placeholder="Sector" value={sector} onChange={(e) => setSector(e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cell" className="text-white">Cell</Label>
                  <Input id="cell" placeholder="Cell" value={cell} onChange={(e) => setCell(e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="village" className="text-white">Village</Label>
                <Input id="village" placeholder="Village" value={village} onChange={(e) => setVillage(e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-white">Country</Label>
                <Input id="country" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="Contact phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Contact email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
            </CardContent>
          </Card>
        );
      
      case 3:
        return (
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Settings & Features</CardTitle>
              <CardDescription className="text-white/70">
                Configure your gym's operational settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Kigali">GMT+2 (Rwanda)</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="RWF">RWF (Frw)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label className="text-white">Available Features</Label>
                <div className="grid grid-cols-2 gap-3 cursor-pointer">
                  {availableFeatures.map((feature) => (
                    <div key={feature} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        id={feature}
                        checked={features.includes(feature)}
                        onCheckedChange={(checked) => handleFeatureChange(feature, !!checked)}
                        className="border-white/20 data-[state=checked]:bg-primary"
                      />
                      <Label htmlFor={feature} className="text-white text-sm">
                        {feature}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <LayoutWithSidebar>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="outline" size="icon" className="border-white/20 text-white hover:bg-white/10" asChild>
              <Link to="/gyms">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Set Up Your Gym</h1>
              <p className="text-white/70">Step {currentStep} of 3</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form */}
        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
              disabled={currentStep === 1 && !gymName}
              className="bg-primary hover:bg-primary/80"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !gymName}
              className="bg-primary hover:bg-primary/80"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Gym
            </Button>
          )}
        </div>
      </div>
    </LayoutWithSidebar>
  );
};
