'use client';

import * as React from 'react';
import { useState, useEffect, useTransition } from 'react';
import { assessDriverReliability, type AssessDriverReliabilityOutput } from '@/ai/flows/driver-reliability-assessment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ApplePayLogo, GooglePayLogo, RushDropLogo } from '@/components/icons';
import {
  MapPin,
  Clock,
  Loader2,
  User,
  Car,
  ShieldCheck,
  Package,
  Bike,
  CheckCircle2,
  CreditCard,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type DeliveryStep = 'request' | 'matching' | 'matched' | 'tracking' | 'delivered';

const dummyDriverData = {
  driverHistory: 'Driver has completed 150 trips in the last 6 months. One minor incident reported 3 months ago: late delivery due to traffic. No other issues.',
  studentRatings: 'Average rating: 4.8/5. Recent comments: "Very friendly and on time!", "Quick delivery, thanks!", "A bit late but communicated well."',
};

export default function RushDropPage() {
  const [step, setStep] = useState<DeliveryStep>('request');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isAssessing, startAssessing] = useTransition();
  const [assessment, setAssessment] = useState<AssessDriverReliabilityOutput | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();

  const handleRequestDelivery = () => {
    if (pickupAddress && deliveryAddress) {
      setStep('matching');
      setTimeout(() => setStep('matched'), 3000);
    } else {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please enter both pickup and delivery addresses.',
      });
    }
  };

  const handleAssessReliability = () => {
    setIsSheetOpen(true);
    startAssessing(async () => {
      try {
        const result = await assessDriverReliability(dummyDriverData);
        setAssessment(result);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Assessment Failed',
          description: 'Could not assess driver reliability at this time.',
        });
        setIsSheetOpen(false);
      }
    });
  };

  const handlePayment = () => {
    setStep('tracking');
  };

  const handleReset = () => {
    setStep('request');
    setPickupAddress('');
    setDeliveryAddress('');
    setAssessment(null);
  };

  const trackingStatuses = [
    { name: 'Order Confirmed', completed: true },
    { name: 'Driver on the way to pickup', completed: true },
    { name: 'Item Picked Up', completed: false },
    { name: 'En Route to Destination', completed: false },
    { name: 'Arriving Soon', completed: false },
  ];
  const [currentTrackingStatus, setCurrentTrackingStatus] = useState(1);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'tracking' && currentTrackingStatus < trackingStatuses.length - 1) {
      interval = setInterval(() => {
        setCurrentTrackingStatus(prev => {
          const nextStatus = prev + 1;
          if (nextStatus === trackingStatuses.length - 1) {
            setTimeout(() => setStep('delivered'), 4000);
          }
          return nextStatus;
        });
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [step, currentTrackingStatus, trackingStatuses.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <header className="flex items-center gap-4 mb-8">
        <RushDropLogo className="w-12 h-12 text-primary" />
        <h1 className="text-4xl font-headline font-bold text-foreground">RushDrop</h1>
      </header>

      <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
        {step === 'request' && (
          <div key="request">
            <CardHeader>
              <CardTitle className="font-headline">Need Something Delivered?</CardTitle>
              <CardDescription>Enter the pickup and delivery locations below.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="pickup">
                  <MapPin className="inline-block mr-2 h-4 w-4" /> Pickup Address
                </Label>
                <Input id="pickup" placeholder="e.g., 123 Main St, Anytown" value={pickupAddress} onChange={e => setPickupAddress(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="delivery">
                  <MapPin className="inline-block mr-2 h-4 w-4" /> Delivery Address
                </Label>
                <Input id="delivery" placeholder="e.g., Student Union, University Campus" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Est. Time: <strong>30-45 mins</strong></span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold text-lg">$12.50</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleRequestDelivery} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Request Delivery</Button>
            </CardFooter>
          </div>
        )}

        {step === 'matching' && (
          <div key="matching" className="flex flex-col items-center justify-center p-12 gap-4 animate-in fade-in">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="font-headline text-xl font-semibold">Finding a driver...</p>
            <p className="text-muted-foreground text-center">We're searching our network for a trusted helper near you.</p>
          </div>
        )}

        {(step === 'matched' || step === 'tracking' || step === 'delivered') && (
          <div key="matched-flow" className="animate-in fade-in">
            <CardHeader>
              <CardTitle className="font-headline">
                {step === 'matched' && "We found a driver!"}
                {step === 'tracking' && "Your delivery is in progress!"}
                {step === 'delivered' && "Delivery Complete!"}
              </CardTitle>
              <CardDescription>
                {step === 'delivered' ? "Your item has been successfully delivered." : "Follow your order's progress below."}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <Avatar className="h-16 w-16 border-2 border-primary">
                  <AvatarImage src="https://placehold.co/100x100.png" alt="Driver" data-ai-hint="person portrait" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="font-semibold font-headline text-lg">John D.</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Car className="h-4 w-4" />
                    <span>Honda Civic - GFD321</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    <strong>4.8</strong>
                    <span className="text-muted-foreground">(150)</span>
                  </div>
                </div>
              </div>

              {step === 'matched' && (
                <>
                  <Separator />
                  <div className="grid gap-4">
                    <Button onClick={handleAssessReliability} variant="outline">
                      <ShieldCheck className="mr-2 h-4 w-4" /> AI Reliability Assessment
                    </Button>
                    <div className="flex items-center justify-between">
                      <p className="font-headline">Total Cost</p>
                      <p className="font-bold text-2xl">$12.50</p>
                    </div>
                    <Button onClick={handlePayment} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      <CreditCard className="mr-2 h-4 w-4" /> Confirm & Pay
                    </Button>
                    <div className="flex items-center gap-2">
                        <Separator className="flex-1"/>
                        <span className="text-xs text-muted-foreground">OR</span>
                        <Separator className="flex-1"/>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="w-full">
                            <ApplePayLogo className="h-6" />
                        </Button>
                        <Button variant="outline" className="w-full">
                            <GooglePayLogo className="h-6" />
                        </Button>
                    </div>
                  </div>
                </>
              )}

              {step === 'tracking' && (
                <div className="grid gap-4 pt-4">
                    <Progress value={(currentTrackingStatus / (trackingStatuses.length -1)) * 100} className="h-2" />
                    <ul className="space-y-4">
                        {trackingStatuses.map((status, index) => (
                            <li key={status.name} className="flex items-start gap-3">
                                <div className="flex flex-col items-center">
                                    <CheckCircle2 className={cn("h-6 w-6", index <= currentTrackingStatus ? "text-primary" : "text-muted-foreground/50")} />
                                    {index < trackingStatuses.length - 1 && <div className={cn("w-0.5 h-6 mt-1", index < currentTrackingStatus ? "bg-primary" : "bg-muted-foreground/50")}></div>}
                                </div>
                                <span className={cn("font-medium pt-0.5", index <= currentTrackingStatus ? "text-foreground" : "text-muted-foreground")}>{status.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
              )}

              {step === 'delivered' && (
                <div className="text-center p-8 bg-accent/20 rounded-lg animate-in fade-in zoom-in-95">
                    <Package className="h-16 w-16 text-accent-foreground mx-auto" />
                    <p className="font-headline mt-4 text-xl font-semibold text-accent-foreground">Enjoy!</p>
                    <Button onClick={handleReset} className="mt-6">Request Another Delivery</Button>
                </div>
              )}

            </CardContent>
          </div>
        )}
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="font-headline">Driver Reliability Assessment</SheetTitle>
            <SheetDescription>Our AI is analyzing the driver's history and ratings to ensure your safety and trust.</SheetDescription>
          </SheetHeader>
          <div className="py-8">
            {isAssessing && (
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p>Assessing...</p>
              </div>
            )}
            {assessment && (
              <div className="grid gap-6 text-sm animate-in fade-in">
                <div className="text-center">
                    <p className="text-muted-foreground">Reliability Score</p>
                    <p className="text-5xl font-bold text-primary font-headline">
                      {Math.round(assessment.reliabilityScore * 100)}%
                    </p>
                </div>
                <div className="grid gap-2">
                    <h4 className="font-semibold font-headline">Recommendation</h4>
                    <p className="p-3 bg-muted rounded-md">{assessment.recommendation}</p>
                </div>
                <div className="grid gap-2">
                    <h4 className="font-semibold font-headline">Risk Factors</h4>
                    <p className="p-3 bg-muted rounded-md">{assessment.riskFactors}</p>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
