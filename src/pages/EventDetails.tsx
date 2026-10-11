import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchEventById } from '@/services/events';
import { getRegistrationCount } from '@/services/registrations';
import { fetchUserProfile } from '@/services/users';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Tag, User, MapPin, Users } from 'lucide-react';
import type { CampusEvent } from '@/types';
import { PageTransition } from '@/components/motion/PageTransition';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { DetailSkeleton } from '@/components/LoadingSkeleton';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { formatDate } from '@/lib/date';
import { formatEventParticipationSummary } from '@/lib/eventParticipation';

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const isOnline = useOnlineStatus();
  const [event, setEvent] = useState<CampusEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [regCount, setRegCount] = useState(0);
  const [creatorName, setCreatorName] = useState('Event Organizer');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const ev = await fetchEventById(id).catch(() => null);
      setEvent(ev);
      if (ev) {
        const [count, profile] = await Promise.all([
          getRegistrationCount(id).catch(() => 0),
          fetchUserProfile(ev.createdBy).catch(() => null),
        ]);
        setRegCount(count);
        setCreatorName(profile?.displayName || 'Event Organizer');
      }
      setLoading(false);
    };
    load();
  }, [id]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <div className="page-container">
          <Link to="/events" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to Events
          </Link>

          {loading ? (
            <DetailSkeleton />
          ) : !event ? (
            <p className="text-muted-foreground">Event not found.</p>
          ) : (
            <ScrollReveal>
              <div className="glass-card-glow max-w-2xl rounded-2xl p-8">
                <h1 className="mb-4 text-3xl font-bold text-foreground">{event.title}</h1>
                <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(event.date)}</span>
                  <span className="flex items-center gap-1"><Tag className="h-4 w-4" />{event.category}</span>
                  {event.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{event.location}</span>}
                  <span className="flex items-center gap-1"><User className="h-4 w-4" />Created by {creatorName}</span>
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" />{regCount} registered</span>
                </div>
                <p className="mb-4 text-sm font-medium text-foreground">
                  {formatEventParticipationSummary(event)}
                </p>
                <p className="leading-relaxed text-foreground mb-6">{event.description}</p>
                {isOnline ? (
                  <Link to={`/events/${id}/register`}>
                    <Button className="w-full sm:w-auto transition-all hover:scale-[1.03]">
                      Register for Event
                    </Button>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <span title="Offline mode - reconnect to register for this event">
                      <Button className="w-full sm:w-auto transition-all hover:scale-[1.03]" disabled>
                        Register for Event
                      </Button>
                    </span>
                    <p className="text-sm text-muted-foreground">Registration requires an internet connection.</p>
                  </div>
                )}
              </div>
            </ScrollReveal>
          )}
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default EventDetails;
