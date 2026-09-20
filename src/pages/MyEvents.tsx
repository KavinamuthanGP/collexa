import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchRegistrationsByUser } from '@/services/registrations';
import { fetchEventById } from '@/services/events';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { PageTransition } from '@/components/motion/PageTransition';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { QRTicket } from '@/components/QRTicket';
import { CardGridSkeleton } from '@/components/LoadingSkeleton';
import { Ticket, CalendarDays, MapPin, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { EventRegistration, CampusEvent } from '@/types';
import { formatDate } from '@/lib/date';

interface EnrichedRegistration extends EventRegistration {
  event?: CampusEvent;
}

const MyEvents = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<EnrichedRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState<EnrichedRegistration | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const regs = await fetchRegistrationsByUser(user.uid);
        const enriched = await Promise.all(
          regs.map(async (reg) => {
            const event = await fetchEventById(reg.eventId).catch(() => null);
            return { ...reg, event: event || undefined };
          })
        );
        setRegistrations(enriched);
      } catch { /* Firebase may not be configured */ }
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <div className="page-container">
          <div className="mb-6 flex items-center gap-3">
            <div className="feature-icon">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <h1 className="section-title mb-0">My Events</h1>
              <p className="text-sm text-muted-foreground">Events you've registered for</p>
            </div>
          </div>

          {loading ? (
            <CardGridSkeleton count={3} />
          ) : registrations.length === 0 ? (
            <ScrollReveal>
              <div className="glass-card rounded-2xl p-12 text-center">
                <Ticket className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                <p className="text-lg font-medium text-foreground mb-1">No registrations yet</p>
                <p className="text-sm text-muted-foreground">Browse events and register to see your tickets here.</p>
              </div>
            </ScrollReveal>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {registrations.map((reg, i) => (
                <ScrollReveal key={reg.id} delay={i * 0.08}>
                  <div className="glass-card-glow rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1">
                    <h3 className="text-base font-semibold text-foreground mb-2">
                      {reg.event?.title || 'Unknown Event'}
                    </h3>
                    <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                      {reg.event?.date && (
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          <span>{formatDate(reg.event.date)}</span>
                        </div>
                      )}
                      {reg.event?.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{reg.event.location}</span>
                        </div>
                      )}
                      {reg.event?.category && (
                        <div className="flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5" />
                          <span>{reg.event.category}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full transition-all hover:scale-[1.03]"
                      onClick={() => setSelectedReg(reg)}
                    >
                      <Ticket className="mr-1.5 h-3.5 w-3.5" /> View Ticket
                    </Button>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>

        <Dialog open={!!selectedReg} onOpenChange={() => setSelectedReg(null)}>
          <DialogContent className="glass-card border-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Event Ticket</DialogTitle>
            </DialogHeader>
            {selectedReg && (
              <QRTicket
                registrationId={selectedReg.id}
                eventTitle={selectedReg.event?.title || 'Event'}
                attendeeName={selectedReg.name}
                eventDate={selectedReg.event?.date || ''}
              />
            )}
          </DialogContent>
        </Dialog>

        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default MyEvents;
