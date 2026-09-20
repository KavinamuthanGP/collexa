import { Link } from 'react-router-dom';
import { Calendar, Tag, MapPin } from 'lucide-react';
import type { CampusEvent } from '@/types';
import { TiltCard } from '@/components/motion/TiltCard';
import { formatDate } from '@/lib/date';

const categoryColors: Record<string, string> = {
  Academic: 'bg-primary/10 text-primary',
  Sports: 'bg-success/10 text-success',
  Cultural: 'bg-accent/10 text-accent-foreground',
  Tech: 'bg-primary/10 text-primary',
  Social: 'bg-destructive/10 text-destructive',
  Workshop: 'bg-muted text-muted-foreground',
};

export const EventCard = ({ event }: { event: CampusEvent }) => (
  <TiltCard>
    <Link
      to={`/events/${event.id}`}
      className="stat-card group block h-full"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${categoryColors[event.category] || 'bg-muted text-muted-foreground'}`}>
          <Tag className="h-3 w-3" />
          {event.category}
        </span>
      </div>
      <h3 className="mb-1.5 text-lg font-bold text-card-foreground transition-colors group-hover:text-primary">{event.title}</h3>
      <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(event.date)}
        </span>
        {event.location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {event.location}
          </span>
        )}
      </div>
    </Link>
  </TiltCard>
);
