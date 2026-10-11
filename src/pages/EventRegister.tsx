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
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import type { CampusEvent } from '@/types';
import { formatDate } from '@/lib/date';
import { formatEventParticipationSummary, resolveEventConfig } from '@/lib/eventParticipation';
import {
  buildTeamParticipants,
  validateRegistrationSubmit,
  type ParticipantInput,
} from '@/lib/registrationValidation';

const emptyParticipant = (): ParticipantInput => ({
  name: '',
  email: '',
  college: '',
  department: '',
});

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

  const [leader, setLeader] = useState<ParticipantInput>(() => ({
    name: user?.displayName || '',
    email: user?.email || '',
    college: '',
    department: user?.department || '',
  }));
  const [teammates, setTeammates] = useState<ParticipantInput[]>([]);

  useEffect(() => {
    if (!user) return;
    setLeader((current) => ({
      ...current,
      name: current.name || user.displayName || '',
      email: current.email || user.email || '',
      department: current.department || user.department || '',
    }));
  }, [user]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const ev = await fetchEventById(id).catch(() => null);
      setEvent(ev);
      if (user) {
        const regs = await fetchRegistrationsByUser(user.uid).catch(() => []);
        const existing = regs.find((r) => r.eventId === id);
        if (existing) {
          setAlreadyRegistered(true);
          setRegistrationId(existing.id);
          setLeader({
            name: existing.name,
            email: existing.email,
            college: existing.college || '',
            department: existing.department,
          });
        }
      }
      setLoading(false);
    };
    load();
  }, [id, user]);

  const eventConfig = event ? resolveEventConfig(event) : null;
  const isTeamEvent = eventConfig?.participationType === 'team';
  const maxTeamSize = eventConfig?.maxTeamSize ?? 1;
  const canAddTeammate = isTeamEvent && 1 + teammates.length < maxTeamSize;

  const updateLeader = (field: keyof ParticipantInput, value: string) => {
    setLeader((current) => ({ ...current, [field]: value }));
  };

  const updateTeammate = (index: number, field: keyof ParticipantInput, value: string) => {
    setTeammates((current) =>
      current.map((member, i) => (i === index ? { ...member, [field]: value } : member)),
    );
  };

  const addTeammate = () => {
    if (!canAddTeammate) return;
    setTeammates((current) => [...current, emptyParticipant()]);
  };

  const removeTeammate = (index: number) => {
    setTeammates((current) => current.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !event) return;

    const validationError = validateRegistrationSubmit(event, leader, teammates);
    if (validationError) {
      toast({ title: validationError, variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = isTeamEvent
        ? {
            eventId: id,
            userId: user.uid,
            name: leader.name.trim(),
            email: leader.email.trim(),
            college: leader.college.trim(),
            department: leader.department.trim(),
            participants: buildTeamParticipants(leader, teammates),
          }
        : {
            eventId: id,
            userId: user.uid,
            name: leader.name.trim(),
            email: leader.email.trim(),
            college: leader.college.trim(),
            department: leader.department.trim(),
          };

      const regId = await registerForEvent(payload);
      setRegistrationId(regId);
      toast({ title: 'Registered successfully!' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  const renderParticipantFields = (
    participant: ParticipantInput,
    onChange: (field: keyof ParticipantInput, value: string) => void,
    idPrefix: string,
  ) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`${idPrefix}-name`}>Full Name</Label>
        <Input
          id={`${idPrefix}-name`}
          value={participant.name}
          onChange={(e) => onChange('name', e.target.value)}
          required
          className="mt-1"
          placeholder="Jane Doe"
        />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-email`}>Email</Label>
        <Input
          id={`${idPrefix}-email`}
          type="email"
          value={participant.email}
          onChange={(e) => onChange('email', e.target.value)}
          required
          className="mt-1"
          placeholder="jane@university.edu"
        />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-college`}>College</Label>
        <Input
          id={`${idPrefix}-college`}
          value={participant.college}
          onChange={(e) => onChange('college', e.target.value)}
          required
          className="mt-1"
          placeholder="Your college"
        />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-department`}>Department</Label>
        <Input
          id={`${idPrefix}-department`}
          value={participant.department}
          onChange={(e) => onChange('department', e.target.value)}
          required
          className="mt-1"
          placeholder="Computer Science"
        />
      </div>
    </div>
  );

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
                <p className="text-sm text-muted-foreground">Here&apos;s your digital ticket</p>
              </div>
              <QRTicket
                registrationId={registrationId}
                eventTitle={event.title}
                attendeeName={leader.name || user?.displayName || 'Attendee'}
                eventDate={event.date}
              />
            </ScrollReveal>
          ) : (
            <ScrollReveal>
              <div className="glass-card-glow rounded-2xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-1">Register for {event.title}</h2>
                <p className="text-sm text-muted-foreground mb-1">{formatDate(event.date)} · {event.category}</p>
                <p className="text-sm font-medium text-foreground mb-6">{formatEventParticipationSummary(event)}</p>

                {!isOnline && (
                  <div className="mb-6 rounded-xl border border-amber-200/60 bg-amber-400/20 px-4 py-3 text-sm font-medium text-amber-950">
                    Offline mode &mdash; reconnect to register for this event
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {isTeamEvent ? (
                    <>
                      <div className="rounded-xl border border-border/60 p-4">
                        <h3 className="mb-4 text-sm font-semibold text-foreground">Team leader (you)</h3>
                        {renderParticipantFields(leader, updateLeader, 'leader')}
                      </div>

                      {teammates.map((teammate, index) => (
                        <div key={index} className="rounded-xl border border-border/60 p-4">
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-foreground">Teammate {index + 1}</h3>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTeammate(index)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="mr-1 h-4 w-4" /> Remove
                            </Button>
                          </div>
                          {renderParticipantFields(
                            teammate,
                            (field, value) => updateTeammate(index, field, value),
                            `teammate-${index}`,
                          )}
                        </div>
                      ))}

                      {canAddTeammate && (
                        <Button type="button" variant="outline" className="w-full" onClick={addTeammate}>
                          <Plus className="mr-2 h-4 w-4" /> Add teammate
                        </Button>
                      )}
                    </>
                  ) : (
                    renderParticipantFields(leader, updateLeader, 'solo')
                  )}

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
