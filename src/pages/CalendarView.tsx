import { useEffect, useState } from 'react';
import { fetchEvents } from '@/services/events';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { PageTransition } from '@/components/motion/PageTransition';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { CardGridSkeleton } from '@/components/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import type { CampusEvent } from '@/types';
import { formatDate } from '@/lib/date';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarView = () => {
  const isOnline = useOnlineStatus();
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents().then(setEvents).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const eventsByDate = events.reduce<Record<string, CampusEvent[]>>((acc, ev) => {
    const d = ev.date; // expected format: YYYY-MM-DD
    if (!acc[d]) acc[d] = [];
    acc[d].push(ev);
    return acc;
  }, {});

  const formatDateKey = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <div className="page-container">
          <div className="mb-6 flex items-center gap-3">
            <div className="feature-icon">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h1 className="section-title mb-0">Calendar</h1>
              <p className="text-sm text-muted-foreground">View events by date</p>
            </div>
          </div>

          {!isOnline && (
            <div className="mb-6 rounded-xl border border-amber-200/60 bg-amber-400/20 px-4 py-3 text-sm font-medium text-amber-950">
              Offline mode &mdash; showing saved events
            </div>
          )}

          {loading ? (
            <CardGridSkeleton count={1} />
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Calendar Grid */}
              <ScrollReveal>
                <div className="glass-card-glow rounded-2xl p-5 lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" size="sm" onClick={prevMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-lg font-semibold text-foreground">
                      {MONTH_NAMES[month]} {year}
                    </h2>
                    <Button variant="ghost" size="sm" onClick={nextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {DAY_NAMES.map((d) => (
                      <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
                    ))}
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateKey = formatDateKey(day);
                      const hasEvents = !!eventsByDate[dateKey];
                      const isToday = dateKey === todayKey;
                      const isSelected = dateKey === selectedDate;

                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDate(dateKey)}
                          className={`relative rounded-lg p-2 text-sm transition-all hover:bg-primary/10 ${
                            isSelected ? 'bg-primary/20 text-primary font-bold' :
                            isToday ? 'bg-accent/10 text-accent font-semibold' :
                            'text-foreground'
                          }`}
                        >
                          {day}
                          {hasEvents && (
                            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </ScrollReveal>

              {/* Selected Day Events */}
              <ScrollReveal delay={0.1}>
                <div className="glass-card-glow rounded-2xl p-5 h-fit">
                  <h3 className="text-base font-semibold text-foreground mb-3">
                    {selectedDate ? `Events on ${formatDate(selectedDate)}` : 'Select a date'}
                  </h3>
                  {!selectedDate ? (
                    <p className="text-sm text-muted-foreground">Click on a date to see events.</p>
                  ) : selectedEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No events on this date.</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedEvents.map((ev) => (
                        <Link
                          key={ev.id}
                          to={`/events/${ev.id}`}
                          className="block rounded-xl border border-border/40 p-3 transition-all hover:bg-muted/20 hover:-translate-y-0.5"
                        >
                          <p className="text-sm font-medium text-foreground">{ev.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Tag className="h-3 w-3" />
                            <span>{ev.category}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default CalendarView;
