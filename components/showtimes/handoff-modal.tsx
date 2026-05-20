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
      <DialogContent className="sm:max-w-md border-border/40 bg-card/65 backdrop-blur-xl shadow-2xl shadow-emerald-500/5 overflow-hidden rounded-3xl p-6">
        <DialogHeader className="space-y-0">
          <div className="relative flex flex-col items-center justify-center pt-2 pb-1">
            <div className="absolute top-0 size-24 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-2xl" />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative flex items-center justify-center size-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] mb-3"
            >
              <Lock className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </motion.div>
            <DialogTitle className="text-2xl font-heading font-black tracking-tight text-center">
              Secure Ticket Handoff
            </DialogTitle>
            <DialogDescription className="text-center text-xs mt-1.5 max-w-[280px]">
              You are being securely redirected to complete your purchase directly with <span className="font-bold text-foreground">{cinema.brand}</span>.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Physical Ticket Visual Container */}
        <div className="relative overflow-hidden bg-muted/30 dark:bg-background/40 p-5 rounded-2xl space-y-4 my-3 border border-border/40 shadow-inner">
          {/* Decorative Ticket Stubs (cutouts on the sides) */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-6 bg-card border-r border-border/40 rounded-r-full" />
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-6 bg-card border-l border-border/40 rounded-l-full" />
          
          <div className="flex items-center justify-between border-b border-border/30 pb-3">
            <div className="space-y-0.5">
              <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Cinema</p>
              <p className="font-heading font-extrabold text-base tracking-tight">{cinema.name}</p>
              <p className="text-xs text-muted-foreground font-semibold">{cinema.city}</p>
            </div>
            <div className="text-right">
              <Badge 
                variant="outline" 
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                  isIMAX 
                    ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]" 
                    : isDC 
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]" 
                    : "bg-muted border-border/80 text-muted-foreground"
                }`}
              >
                {showtime.format}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-0.5">
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Movie</p>
            <p className="font-heading font-black text-lg text-foreground leading-tight truncate" title={movieTitle}>
              {movieTitle}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="space-y-0.5">
              <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Date & Time</p>
              <p className="font-bold text-sm">
                {new Date(showtime.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}
              </p>
              <p className="font-extrabold text-xs text-primary">{showtime.time.substring(0, 5)}</p>
            </div>
            <div className="space-y-0.5 text-right">
              <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Estimated Ticket</p>
              <p className="font-heading font-black text-lg text-primary">₱{price}</p>
              <p className="text-[9px] font-semibold text-muted-foreground">Standard pricing</p>
            </div>
          </div>
        </div>

        {/* Elegant Glowing Circular Countdown */}
        <div className="flex flex-col items-center justify-center py-2 space-y-3">
          <div className="relative flex items-center justify-center w-20 h-20">
            {/* Background Ring Shadow Glow */}
            <div className="absolute inset-2 bg-primary/5 rounded-full blur-md" />
            
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              {/* Background track */}
              <circle 
                cx="40" 
                cy="40" 
                r="34" 
                className="stroke-muted/40 dark:stroke-muted/20 fill-none" 
                strokeWidth="3.5" 
              />
              {/* Active animated stroke */}
              <motion.circle 
                cx="40" 
                cy="40" 
                r="34" 
                className="stroke-primary fill-none" 
                strokeWidth="3.5" 
                strokeLinecap="round"
                initial={{ pathLength: 1 }}
                animate={{ pathLength: countdown / 5 }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </svg>
            
            {/* Centered Timer Content */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-primary font-heading font-black text-2xl leading-none">{countdown}</span>
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">sec</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 dark:text-emerald-400 text-xs font-bold tracking-tight">
            <ShieldCheck className="h-4 w-4 text-emerald-500 animate-pulse" />
            <span>Secure end-to-end booking active</span>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2.5 mt-4">
          <Button 
            variant="outline" 
            onClick={handleCancel} 
            className="w-full sm:w-1/2 border-border/80 hover:bg-muted/80 font-bold rounded-xl transition-all"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleContinue} 
            className="w-full sm:w-1/2 gap-2 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/95 hover:to-amber-500/95 text-primary-foreground font-black shadow-[0_4px_15px_rgba(235,94,40,0.25)] rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] border-none"
            disabled={!showtime.ticket_url}
          >
            Continue Now <ExternalLink className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

