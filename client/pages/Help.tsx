import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LayoutWithSidebar } from '@/components/ui/LayoutWithSidebar';
import { HelpCircle, Search, Book, MessageCircle, Phone, Mail } from 'lucide-react';

export const Help: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      id: 1,
      question: 'How do I add a new member?',
      answer: 'Go to the Members page and click the "Add Member" button. Fill in the required information and save.'
    },
    {
      id: 2,
      question: 'How can I process a payment?',
      answer: 'Navigate to the Billing section and use the "New Payment" option to record member payments.'
    },
    {
      id: 3,
      question: 'How do I schedule a class?',
      answer: 'In the Gym Management section, go to Classes and use the scheduling tool to set up new classes.'
    },
    {
      id: 4,
      question: 'Can I customize my gym website?',
      answer: 'Yes, go to the Website section where you can customize themes, colors, and content.'
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <LayoutWithSidebar>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <HelpCircle className="h-6 w-6 text-lime-500" />
              <h1 className="text-2xl font-bold text-white">Help & Support</h1>
            </div>
            <p className="text-sm text-white/70">Get help with using the gym management system</p>
          </div>
        </div>

        {/* Search */}
        <Card className="bg-white/10 border-white/20 mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
              <Input
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Options */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Contact Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start bg-primary hover:bg-primary/80">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Live Chat
                </Button>
                <Button className="w-full justify-start border-white/20 text-white hover:bg-white/10">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
                <Button className="w-full justify-start border-white/20 text-white hover:bg-white/10">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                  <Book className="h-4 w-4 mr-2" />
                  User Guide
                </Button>
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                  <Book className="h-4 w-4 mr-2" />
                  Video Tutorials
                </Button>
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                  <Book className="h-4 w-4 mr-2" />
                  API Documentation
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
                <CardDescription className="text-white/70">
                  Find answers to common questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFaqs.length === 0 ? (
                    <p className="text-white/70 text-center py-4">No FAQs found matching your search.</p>
                  ) : (
                    filteredFaqs.map((faq) => (
                      <div key={faq.id} className="p-4 bg-white/10 rounded-lg">
                        <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
                        <p className="text-white/70 text-sm">{faq.answer}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  );
};