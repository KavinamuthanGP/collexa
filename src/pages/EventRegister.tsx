import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchEventById } from '@/services/events';
import { registerForEvent, fetchRegistrationsByUser } from '@/services/registrations';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { PageTransition } from '@/components/motion/PageTransition';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { QRTicket } from '@/components/QRTicket';
import { DetailSkeleton } from '@/components/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import type { CampusEvent } from '@/types';
import { formatDate } from '@/lib/date';

const EventRegister = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const isOnline = useOnlineStatus();
  const [event, setEvent] = useState<CampusEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('1');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const ev = await fetchEventById(id).catch(() => null);
      setEvent(ev);
      if (user) {
        const regs = await fetchRegistrationsByUser(user.uid).catch(() => []);
        const existing = regs.find(r => r.eventId === id);
        if (existing) {
          setAlreadyRegistered(true);
          setRegistrationId(existing.id);
        }
      }
      setLoading(false);
    };
    load();
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    setSubmitting(true);
    try {
      const regId = await registerForEvent({
        eventId: id,
        userId: user.uid,
        name,
        email,
        department,
        year,
      });
      setRegistrationId(regId);
      toast({ title: 'Registered successfully!' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <div className="page-container max-w-xl">
          <Link to={`/events/${id}`} className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to Event
          </Link>

          {loading ? (
            <DetailSkeleton />
          ) : !event ? (
            <p className="text-muted-foreground">Event not found.</p>
          ) : registrationId ? (
            <ScrollReveal>
              <div className="text-center mb-6">
                <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-success" />
                <h2 className="text-xl font-bold text-foreground mb-1">
                  {alreadyRegistered ? 'Already Registered!' : 'Registration Complete!'}
                </h2>
                <p className="text-sm text-muted-foreground">Here's your digital ticket</p>
              </div>
              <QRTicket
                registrationId={registrationId}
                eventTitle={event.title}
                attendeeName={name || user?.displayName || 'Attendee'}
                eventDate={event.date}
              />
            </ScrollReveal>
          ) : (
            <ScrollReveal>
              <div className="glass-card-glow rounded-2xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-1">Register for {event.title}</h2>
                <p className="text-sm text-muted-foreground mb-6">{formatDate(event.date)} · {event.category}</p>

                {!isOnline && (
                  <div className="mb-6 rounded-xl border border-amber-200/60 bg-amber-400/20 px-4 py-3 text-sm font-medium text-amber-950">
                    Offline mode &mdash; reconnect to register for this event
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} required className="mt-1" placeholder="Jane Doe" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1" placeholder="jane@university.edu" />
                  </div>
                  <div>
                    <Label>Department</Label>
                    <Input value={department} onChange={e => setDepartment(e.target.value)} required className="mt-1" placeholder="Computer Science" />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['1', '2', '3', '4'].map(y => (
                          <SelectItem key={y} value={y}>Year {y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full transition-all hover:scale-[1.03]" disabled={submitting || !isOnline}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Register & Get Ticket
                  </Button>
                </form>
              </div>
            </ScrollReveal>
          )}
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default EventRegister;
