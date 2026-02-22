import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentForms() {
  return (
    <Card className="bg-white/10 border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Payment Forms</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-white/70">Payment forms management coming soon...</p>
      </CardContent>
    </Card>
  );
}