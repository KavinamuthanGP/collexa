import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { GraduationCap, LogOut, Menu, X, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/events', label: 'Events' },
    { to: '/calendar', label: 'Calendar' },
    { to: '/my-events', label: 'My Events' },
    { to: '/teams', label: 'Teams' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <img src="/favicon.jpg" alt="Collexa" className="h-8 w-8 rounded-lg object-contain transition-transform duration-200 group-hover:scale-110" />
          <span className="text-lg font-bold text-foreground">Collexa</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                'relative rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                location.pathname === l.to
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {l.label}
              {location.pathname === l.to && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-lg bg-primary/10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
            </Link>
          ))}
          <div className="mx-2 h-5 w-px bg-border" />
          <Link to="/notifications" className="relative rounded-lg p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </Link>
          <div className="mx-1 h-5 w-px bg-border" />
          <span className="text-sm text-muted-foreground">{user.displayName || user.email}</span>
          <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            {user.role}
          </span>
          <Link
            to="/settings"
            className="flex items-center rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground"
          >
            <Settings className="mr-1.5 h-4 w-4" /> Settings
          </Link>
          <Button variant="ghost" size="sm" onClick={logout} className="ml-1 text-muted-foreground hover:text-foreground transition-all hover:scale-[1.03]">
            <LogOut className="mr-1.5 h-4 w-4" /> Logout
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="rounded-lg p-2 transition-colors hover:bg-secondary md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="border-t border-border/40 bg-background/90 backdrop-blur-xl px-4 pb-4 md:hidden"
        >
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={cn(
                'block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                location.pathname === l.to
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                {user.role}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Settings className="h-4 w-4" /> Settings
              </Link>
              <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground">
                <LogOut className="mr-1.5 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
};
