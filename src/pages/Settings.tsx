import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { PageTransition } from '@/components/motion/PageTransition';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, Moon, Sun, Bell, LogOut, User, ArrowLeft, Info } from 'lucide-react';
import { version as APP_VERSION } from '../../package.json';

// localStorage keys. `collexa-theme` is also read by the inline theme script
// in index.html so the persisted theme applies before first paint.
const THEME_KEY = 'collexa-theme';
const EVENT_NOTIFICATIONS_KEY = 'collexa-event-notifications';

const Settings = () => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem(THEME_KEY) !== 'light');
  const [notifications, setNotifications] = useState(() => localStorage.getItem(EVENT_NOTIFICATIONS_KEY) !== 'false');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(EVENT_NOTIFICATIONS_KEY, notifications ? 'true' : 'false');
  }, [notifications]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <div className="page-container max-w-2xl">
          <Link to="/dashboard" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>

          <div className="mb-6 flex items-center gap-3">
            <div className="feature-icon">
              <SettingsIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="section-title mb-0">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your preferences</p>
            </div>
          </div>

          {/* Account (read-only) */}
          <ScrollReveal>
            <div className="glass-card-glow rounded-2xl p-6 mb-4">
              <h2 className="text-base font-semibold text-foreground mb-4">Account</h2>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-foreground">{user?.displayName || 'User'}</p>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      {user?.role === 'admin' ? 'Admin' : 'Student'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Account details are read-only.</p>
            </div>
          </ScrollReveal>

          {/* Appearance */}
          <ScrollReveal delay={0.1}>
            <div className="glass-card-glow rounded-2xl p-6 mb-4">
              <h2 className="text-base font-semibold text-foreground mb-4">Appearance</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {darkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-accent" />}
                  <div>
                    <Label className="text-sm font-medium">Dark Mode</Label>
                    <p className="text-xs text-muted-foreground">Toggle dark/light theme</p>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
            </div>
          </ScrollReveal>

          {/* Notifications */}
          <ScrollReveal delay={0.2}>
            <div className="glass-card-glow rounded-2xl p-6 mb-4">
              <h2 className="text-base font-semibold text-foreground mb-4">Notifications</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <div>
                    <Label className="text-sm font-medium">Event Notifications</Label>
                    <p className="text-xs text-muted-foreground">Get notified about upcoming events</p>
                  </div>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </div>
          </ScrollReveal>

          {/* About */}
          <ScrollReveal delay={0.3}>
            <div className="glass-card-glow rounded-2xl p-6 mb-4">
              <h2 className="text-base font-semibold text-foreground mb-4">About</h2>
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Collexa <span className="font-normal text-muted-foreground">v{APP_VERSION}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">University Event Management Platform</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Logout (reuses existing AuthContext/Firebase logout) */}
          <ScrollReveal delay={0.4}>
            <Button
              variant="destructive"
              className="w-full transition-all hover:scale-[1.01]"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </ScrollReveal>
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default Settings;
