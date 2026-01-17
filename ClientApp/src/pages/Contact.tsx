import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, MapPin, Phone, Send, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const DUMMY_OTP = '123456';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate sending OTP
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast.success(`OTP sent to ${formData.email}! (Hint: Use ${DUMMY_OTP})`);
    setStep('otp');
    setSubmitting(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setSubmitting(true);
    
    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (otp === DUMMY_OTP) {
      toast.success('OTP verified! Sending your message...');
      
      // Simulate sending message
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setStep('success');
    } else {
      toast.error('Invalid OTP. Please try again.');
    }
    
    setSubmitting(false);
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', subject: '', message: '' });
    setOtp('');
    setStep('form');
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 gradient-subtle border-b border-border/50">
        <div className="container px-4 md:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions or want to get in touch? We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <Card className="elevated-card">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground mb-1">Email</h3>
                        <p className="text-sm text-muted-foreground">
                          contact@sacredconnect.org
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="elevated-card">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground mb-1">Phone</h3>
                        <p className="text-sm text-muted-foreground">
                          +1 (555) 123-4567
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="elevated-card">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground mb-1">Address</h3>
                        <p className="text-sm text-muted-foreground">
                          Global Community Center
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Form / OTP / Success */}
              <div className="md:col-span-2">
                <Card className="elevated-card">
                  {step === 'form' && (
                    <>
                      <CardHeader>
                        <CardTitle className="font-serif">Send us a Message</CardTitle>
                        <CardDescription>
                          Fill in the form and we'll send you an OTP to verify your email.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleRequestOtp} className="space-y-4">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Name</Label>
                              <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your name"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="your@email.com"
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                              id="subject"
                              name="subject"
                              value={formData.subject}
                              onChange={handleChange}
                              placeholder="How can we help?"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                              id="message"
                              name="message"
                              value={formData.message}
                              onChange={handleChange}
                              placeholder="Your message..."
                              rows={5}
                              required
                            />
                          </div>
                          <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                            {submitting ? (
                              'Sending OTP...'
                            ) : (
                              <>
                                <Mail className="h-4 w-4 mr-2" />
                                Get OTP & Send
                              </>
                            )}
                          </Button>
                        </form>
                      </CardContent>
                    </>
                  )}

                  {step === 'otp' && (
                    <>
                      <CardHeader>
                        <CardTitle className="font-serif">Verify Your Email</CardTitle>
                        <CardDescription>
                          We've sent a 6-digit OTP to <strong>{formData.email}</strong>. 
                          Enter it below to send your message.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex flex-col items-center gap-4">
                          <InputOTP
                            maxLength={6}
                            value={otp}
                            onChange={setOtp}
                          >
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                          <p className="text-sm text-muted-foreground">
                            Hint: The OTP is <code className="bg-muted px-1.5 py-0.5 rounded">{DUMMY_OTP}</code>
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setStep('form')}
                            className="sm:w-auto"
                          >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                          </Button>
                          <Button
                            onClick={handleVerifyOtp}
                            disabled={submitting || otp.length !== 6}
                            className="sm:w-auto"
                          >
                            {submitting ? 'Verifying...' : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Verify & Send Message
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </>
                  )}

                  {step === 'success' && (
                    <>
                      <CardHeader className="text-center">
                        <div className="mx-auto mb-4 p-3 rounded-full bg-green-100 dark:bg-green-900/30 w-fit">
                          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="font-serif">Message Sent!</CardTitle>
                        <CardDescription>
                          Thank you for reaching out. We'll get back to you soon at{' '}
                          <strong>{formData.email}</strong>.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex justify-center">
                        <Button onClick={handleReset} variant="outline">
                          Send Another Message
                        </Button>
                      </CardContent>
                    </>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
