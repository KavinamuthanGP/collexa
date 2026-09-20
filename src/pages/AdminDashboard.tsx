import { useEffect, useState } from 'react';
import { fetchEvents, deleteEvent } from '@/services/events';
import { fetchRegistrationsByEvent } from '@/services/registrations';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { PageTransition } from '@/components/motion/PageTransition';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { CardGridSkeleton } from '@/components/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Trash2, Users, Eye, CalendarDays, TrendingUp, Loader2 } from 'lucide-react';
import type { CampusEvent, EventRegistration } from '@/types';
import { formatDate } from '@/lib/date';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [regCounts, setRegCounts] = useState<Record<string, number>>({});
  const [selectedParticipants, setSelectedParticipants] = useState<EventRegistration[]>([]);
  const [participantDialog, setParticipantDialog] = useState(false);
  const [participantEventName, setParticipantEventName] = useState('');
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    try {
      const ev = await fetchEvents();
      setEvents(ev);
      const counts: Record<string, number> = {};
      await Promise.all(
        ev.map(async (e) => {
          const regs = await fetchRegistrationsByEvent(e.id);
          counts[e.id] = regs.length;
        })
      );
      setRegCounts(counts);
    } catch { /* Firebase may not be configured */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteEvent(id);
      toast({ title: 'Event deleted' });
      await load();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setDeleting(null);
  };

  const viewParticipants = async (eventId: string, eventTitle: string) => {
    setLoadingParticipants(true);
    setParticipantEventName(eventTitle);
    setParticipantDialog(true);
    try {
      const regs = await fetchRegistrationsByEvent(eventId);
      setSelectedParticipants(regs);
    } catch { setSelectedParticipants([]); }
    setLoadingParticipants(false);
  };

  const totalRegistrations = Object.values(regCounts).reduce((a, b) => a + b, 0);
  const mostPopular = events.reduce<CampusEvent | null>((best, e) =>
    (regCounts[e.id] || 0) > (best ? regCounts[best.id] || 0 : 0) ? e : best
  , null);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <div className="page-container">
          <div className="mb-6 flex items-center gap-3">
            <div className="feature-icon">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="section-title mb-0">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage events and view analytics</p>
            </div>
          </div>

          {loading ? (
            <CardGridSkeleton count={4} />
          ) : (
            <>
              {/* Stats Row */}
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <ScrollReveal delay={0}>
                  <div className="glass-card-glow rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <CalendarDays className="h-4 w-4 text-primary icon-pulse" />
                      <span className="text-sm">Total Events</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{events.length}</p>
                  </div>
                </ScrollReveal>
                <ScrollReveal delay={0.1}>
                  <div className="glass-card-glow rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Users className="h-4 w-4 text-accent icon-pulse" />
                      <span className="text-sm">Total Registrations</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{totalRegistrations}</p>
                  </div>
                </ScrollReveal>
                <ScrollReveal delay={0.2}>
                  <div className="glass-card-glow rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <TrendingUp className="h-4 w-4 text-success icon-pulse" />
                      <span className="text-sm">Most Popular</span>
                    </div>
                    <p className="text-lg font-bold text-foreground truncate">
                      {mostPopular?.title || '—'}
                    </p>
                    {mostPopular && (
                      <p className="text-xs text-muted-foreground">{regCounts[mostPopular.id]} registrations</p>
                    )}
                  </div>
                </ScrollReveal>
              </div>

              {/* Popularity Chart */}
              {events.length > 0 && (
                <ScrollReveal>
                  <div className="glass-card-glow rounded-2xl p-6 mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Event Popularity</h2>
                    <div className="space-y-3">
                      {events.map((ev) => {
                        const count = regCounts[ev.id] || 0;
                        const maxCount = Math.max(...Object.values(regCounts), 1);
                        const pct = (count / maxCount) * 100;
                        return (
                          <div key={ev.id}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-foreground font-medium truncate mr-4">{ev.title}</span>
                              <span className="text-muted-foreground flex-shrink-0">{count} registered</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {/* Event List */}
              <ScrollReveal>
                <div className="glass-card-glow rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-border/40">
                    <h2 className="text-lg font-semibold text-foreground">All Events</h2>
                  </div>
                  {events.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No events created yet.</div>
                  ) : (
                    <div className="divide-y divide-border/40">
                      {events.map((ev) => (
                        <div key={ev.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">{ev.title}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(ev.date)} · {ev.category} · {regCounts[ev.id] || 0} registrations</p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewParticipants(ev.id, ev.title)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(ev.id)}
                              disabled={deleting === ev.id}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              {deleting === ev.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            </>
          )}
        </div>

        <Dialog open={participantDialog} onOpenChange={setParticipantDialog}>
          <DialogContent className="glass-card border-border sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Participants — {participantEventName}</DialogTitle>
            </DialogHeader>
            {loadingParticipants ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : selectedParticipants.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No registrations yet.</p>
            ) : (
              <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
                {selectedParticipants.map((p) => (
                  <div key={p.id} className="py-3 px-1">
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.email} · {p.department} · Year {p.year}</p>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
