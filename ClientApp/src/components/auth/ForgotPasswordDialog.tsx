import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { Mail, Loader2, CheckCircle2, KeyRound } from 'lucide-react';
import { z } from 'zod';

import {
    requestPasswordOtp,
    verifyPasswordOtp,
} from '@/lib/otp-api';

const emailSchema = z.string().trim().email('Please enter a valid email address');

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'email' | 'otp' | 'success';

export const ForgotPasswordDialog = ({ open, onOpenChange }: ForgotPasswordDialogProps) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

    const handleRequestOtp = async () => {
        setError('');

        const result = emailSchema.safeParse(email);
        if (!result.success) {
            setError(result.error.errors[0].message);
            return;
        }

        try {
            setLoading(true);
            await requestPasswordOtp(email);
            toast.success(`OTP sent to ${email}`);
            setStep('otp');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to send OTP');
            toast.error('Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };


    const handleVerifyOtp = async () => {
        setError('');

        if (otp.length !== 6) {
            setError('Please enter the complete 6-digit OTP');
            return;
        }

        try {
            setLoading(true);

            const { resetToken } = await verifyPasswordOtp(email, otp);

            // 🔐 store reset token temporarily
            sessionStorage.setItem('resetToken', resetToken);
            sessionStorage.setItem('resetEmail', email);

            toast.success('OTP verified successfully!');
            setStep('success');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Invalid OTP');
            toast.error('Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

  const handleClose = () => {
    // Reset state when closing
    setStep('email');
    setEmail('');
    setOtp('');
    setError('');
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'email' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                Forgot Password
              </DialogTitle>
              <DialogDescription>
                Enter your email address and we'll send you an OTP to reset your password.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    onKeyDown={(e) => e.key === 'Enter' && handleRequestOtp()}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <Button 
                onClick={handleRequestOtp} 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Send OTP'
                )}
              </Button>
            </div>
          </>
        )}

        {step === 'otp' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                Verify OTP
              </DialogTitle>
              <DialogDescription>
                Enter the 6-digit OTP sent to <strong>{email}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Enter OTP</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
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
                </div>
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                <p className="text-xs text-muted-foreground text-center">
                  Hint: Use <code className="bg-muted px-1 py-0.5 rounded">123456</code> for demo
                </p>
              </div>
              <Button 
                onClick={handleVerifyOtp} 
                className="w-full" 
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Verify OTP'
                )}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setStep('email')} 
                className="w-full"
              >
                Back to Email
              </Button>
            </div>
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-5 w-5" />
                Password Reset Successful
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-foreground font-medium">
                  A temporary password has been sent to your email.
                </p>
                <p className="text-sm text-muted-foreground">
                  Please check your inbox at <strong>{email}</strong> and use the temporary password to sign in. Don't forget to change your password after logging in.
                </p>
              </div>
              <Button onClick={handleClose} className="w-full">
                Back to Sign In
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
