"use client";

import { useEffect, useState } from "react";
import { Lock, ExternalLink, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

import { DatabaseShowtime, DatabaseCinema } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  showtime: DatabaseShowtime | null;
  cinema: DatabaseCinema | null;
  movieTitle: string;
}

export function HandoffModal({ isOpen, onClose, showtime, cinema, movieTitle }: HandoffModalProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isOpen && showtime && showtime.ticket_url) {
      setCountdown(5);
      
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = showtime.ticket_url;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, showtime]);

  if (!showtime || !cinema) return null;

  const handleContinue = () => {
    if (showtime.ticket_url) {
      window.location.href = showtime.ticket_url;
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const isIMAX = showtime.format.includes("IMAX");
  const isDC = showtime.format.includes("Director's");
  let price = 350;
  if (isIMAX) price = 750;
  if (isDC) price = 600;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lock className="h-5 w-5 text-green-500" />
            Secure Redirect
          </DialogTitle>
          <DialogDescription>
            You are leaving SineHub to complete your booking on the official cinema website.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted p-4 rounded-xl space-y-4 my-2 border">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="space-y-1">
              <p className="font-semibold">{cinema.name}</p>
              <p className="text-sm text-muted-foreground">{cinema.brand}</p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="bg-background">
                {showtime.format}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Movie</p>
            <p className="font-semibold truncate" title={movieTitle}>{movieTitle}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Date & Time</p>
              <p className="font-semibold">{new Date(showtime.date).toLocaleDateString()} at {showtime.time.substring(0, 5)}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="font-semibold text-primary">₱{price}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-4 space-y-2">
          <div className="relative flex items-center justify-center w-16 h-16 mb-2">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="28" className="stroke-muted fill-none" strokeWidth="4" />
              <motion.circle 
                cx="32" cy="32" r="28" 
                className="stroke-primary fill-none" 
                strokeWidth="4" 
                strokeLinecap="round"
                initial={{ pathLength: 1 }}
                animate={{ pathLength: countdown / 5 }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </svg>
            <span className="text-primary font-bold text-xl">{countdown}</span>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="h-4 w-4" />
            Redirecting securely in {countdown} seconds...
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleContinue} className="w-full sm:w-auto gap-2" disabled={!showtime.ticket_url}>
            Continue Now <ExternalLink className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
