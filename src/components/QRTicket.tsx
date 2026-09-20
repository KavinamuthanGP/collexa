import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Ticket, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/date';

interface QRTicketProps {
  registrationId: string;
  eventTitle: string;
  attendeeName: string;
  eventDate: string;
}

export const QRTicket = ({ registrationId, eventTitle, attendeeName, eventDate }: QRTicketProps) => {
  const ticketData = JSON.stringify({ id: registrationId, event: eventTitle, name: attendeeName });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="glass-card-glow rounded-2xl p-6 max-w-sm mx-auto text-center"
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <Ticket className="h-5 w-5 text-primary icon-pulse" />
        <h3 className="text-lg font-bold text-foreground">Your Ticket</h3>
      </div>

      <div className="bg-foreground/5 rounded-xl p-4 mb-4 inline-block">
        <QRCodeSVG
          value={ticketData}
          size={180}
          bgColor="transparent"
          fgColor="hsl(210, 20%, 92%)"
          level="M"
        />
      </div>

      <div className="space-y-1 mb-4">
        <p className="text-sm font-semibold text-foreground">{eventTitle}</p>
        <p className="text-xs text-muted-foreground">{attendeeName}</p>
        <p className="text-xs text-muted-foreground">{formatDate(eventDate)}</p>
        <p className="text-[10px] font-mono text-muted-foreground/60 mt-2">ID: {registrationId.slice(0, 12)}...</p>
      </div>

      <Button variant="outline" size="sm" className="transition-all hover:scale-[1.03]">
        <Download className="mr-1.5 h-3.5 w-3.5" /> Save Ticket
      </Button>
    </motion.div>
  );
};
