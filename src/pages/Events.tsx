import { useEffect, useState } from 'react';
import { fetchEvents, createEvent } from '@/services/events';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { EventCard } from '@/components/EventCard';
import { EventSearch } from '@/components/EventSearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/date-picker';
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EVENT_CATEGORIES, type CampusEvent, type EventCategory, type ParticipationType, type RegistrationFeeType } from '@/types';
import { isValidIsoDate } from '@/lib/date';
import { validateAdminEventParticipation } from '@/lib/registrationValidation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PageTransition } from '@/components/motion/PageTransition';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { CardGridSkeleton } from '@/components/LoadingSkeleton';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

const Events = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const isOnline = useOnlineStatus();
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<EventCategory>('Academic');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [participationType, setParticipationType] = useState<ParticipationType>('solo');
  const [maxTeamSize, setMaxTeamSize] = useState('3');
  const [registrationFeeType, setRegistrationFeeType] = useState<RegistrationFeeType>('free');
  const [feeAmount, setFeeAmount] = useState('');

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<EventCategory | 'All'>('All');

  const load = async () => {
    try {
      setEvents(await fetchEvents());
    } catch { /* Firebase may not be configured */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    // The picker stores ISO dates, but it is not a native form control, so the
    // browser's `required` validation no longer covers the date field.
    if (!isValidIsoDate(date)) {
      toast({ title: 'Please choose a date', variant: 'destructive' });
      return;
    }
    const parsedMaxTeamSize = participationType === 'team' ? Number.parseInt(maxTeamSize, 10) : 1;
    const parsedFeeAmount = registrationFeeType === 'paid' ? Number.parseFloat(feeAmount) : 0;
    const participationError = validateAdminEventParticipation({
      participationType,
      maxTeamSize: parsedMaxTeamSize,
      registrationFeeType,
      feeAmount: parsedFeeAmount,
    });
    if (participationError) {
      toast({ title: participationError, variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      await createEvent({
        title,
        date,
        category,
        description,
        location,
        createdBy: user.uid,
        participationType,
        ...(participationType === 'team' ? { maxTeamSize: parsedMaxTeamSize } : {}),
        registrationFeeType,
        ...(registrationFeeType === 'paid' ? { feeAmount: parsedFeeAmount } : {}),
      });
      toast({ title: 'Event created!' });
      setOpen(false);
      setTitle('');
      setDate('');
      setDescription('');
      setLocation('');
      setParticipationType('solo');
      setMaxTeamSize('3');
      setRegistrationFeeType('free');
      setFeeAmount('');
      await load();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

const filtered = events.filter((ev) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDate = new Date(ev.date + "T00:00:00");

  const notExpired = eventDate >= today;

  const matchesSearch =
    !search ||
    ev.title.toLowerCase().includes(search.toLowerCase()) ||
    ev.description.toLowerCase().includes(search.toLowerCase());

  const matchesCategory =
    filterCategory === 'All' || ev.category === filterCategory;

  return notExpired && matchesSearch && matchesCategory;
});

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <div className="page-container">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="section-title mb-0">Events</h1>
            {isAdmin && (
              <Dialog open={open} onOpenChange={setOpen}>
                {isOnline ? (
                  <DialogTrigger asChild>
                    <Button className="transition-all hover:scale-[1.03]"><Plus className="mr-1 h-4 w-4" /> Add Event</Button>
                  </DialogTrigger>
                ) : (
                  <span title="Offline mode - reconnect to create events">
                    <Button className="transition-all hover:scale-[1.03]" disabled><Plus className="mr-1 h-4 w-4" /> Add Event</Button>
                  </span>
                )}
                <DialogContent className="glass-card border-border">
                  <DialogHeader>
                    <DialogTitle>New Event</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input value={title} onChange={e => setTitle(e.target.value)} required className="mt-1" />
                    </div>
                    <div>
                      <Label>Date</Label>
                      <DatePicker value={date} onChange={setDate} className="mt-1" />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input value={location} onChange={e => setLocation(e.target.value)} className="mt-1" placeholder="Main Auditorium" />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={category} onValueChange={v => setCategory(v as EventCategory)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {EVENT_CATEGORIES.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={description} onChange={e => setDescription(e.target.value)} required className="mt-1" rows={3} />
                    </div>
                    <div>
                      <Label>Participation type</Label>
                      <RadioGroup
                        value={participationType}
                        onValueChange={(value) => setParticipationType(value as ParticipationType)}
                        className="mt-2 flex gap-4"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="solo" id="participation-solo" />
                          <Label htmlFor="participation-solo" className="font-normal">Solo</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="team" id="participation-team" />
                          <Label htmlFor="participation-team" className="font-normal">Team</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    {participationType === 'team' && (
                      <div>
                        <Label htmlFor="max-team-size">Maximum team size (1–5)</Label>
                        <Input
                          id="max-team-size"
                          type="number"
                          min={1}
                          max={5}
                          value={maxTeamSize}
                          onChange={(e) => setMaxTeamSize(e.target.value)}
                          required
                          className="mt-1"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          Students may register with fewer participants, up to this maximum.
                        </p>
                      </div>
                    )}
                    <div>
                      <Label>Registration fee</Label>
                      <RadioGroup
                        value={registrationFeeType}
                        onValueChange={(value) => setRegistrationFeeType(value as RegistrationFeeType)}
                        className="mt-2 flex gap-4"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="free" id="fee-free" />
                          <Label htmlFor="fee-free" className="font-normal">Free</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="paid" id="fee-paid" />
                          <Label htmlFor="fee-paid" className="font-normal">Paid</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    {registrationFeeType === 'paid' && (
                      <div>
                        <Label htmlFor="fee-amount">Fee amount (₹)</Label>
                        <Input
                          id="fee-amount"
                          type="number"
                          min={1}
                          step={1}
                          value={feeAmount}
                          onChange={(e) => setFeeAmount(e.target.value)}
                          required
                          className="mt-1"
                          placeholder="200"
                        />
                      </div>
                    )}
                    <Button type="submit" className="w-full transition-all hover:scale-[1.03]" disabled={submitting || !isOnline}>
                      {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Event
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="mb-6">
            <EventSearch
              search={search}
              onSearchChange={setSearch}
              selectedCategory={filterCategory}
              onCategoryChange={setFilterCategory}
            />
          </div>

          {loading ? (
            <CardGridSkeleton />
          ) : filtered.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="text-muted-foreground">
                {events.length === 0 ? 'No events yet.' : 'No events match your search.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((ev, i) => (
                <ScrollReveal key={ev.id} delay={i * 0.08}>
                  <EventCard event={ev} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default Events;
