import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { createUserProfile } from '@/services/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Loader2, User, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { PageTransition } from '@/components/motion/PageTransition';
import { FloatingOrbs } from '@/components/motion/FloatingOrbs';
import { motion } from 'framer-motion';
import type { UserRole } from '@/types';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await createUserProfile({
        uid: cred.user.uid,
        email,
        displayName: name,
        role,
        createdAt: new Date().toISOString(),
      });
      // Re-read the profile from Firestore (the authoritative role source) so
      // the auth state reflects the chosen role before routing. Without this,
      // onAuthStateChanged — which fired at account creation, before the
      // profile doc existed — leaves the stale 'student' fallback in place.
      await refreshUser();
      navigate('/dashboard');
    } catch (err: any) {
      toast({ title: 'Registration failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="flex min-h-screen">
        <div className="hidden w-1/2 items-center justify-center animated-mesh relative overflow-hidden lg:flex">
          <FloatingOrbs />
          <div className="relative z-10 max-w-md px-8 text-center">
            <img src="/favicon.jpg" alt="Collexa" className="mx-auto mb-6 h-16 w-16 object-contain" />
            <h1 className="mb-4 text-4xl font-bold text-foreground">Collexa</h1>
            <p className="text-lg text-muted-foreground">Join your campus community today.</p>
          </div>
        </div>

        <div className="flex w-full items-center justify-center bg-background px-6 lg:w-1/2">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex items-center gap-2 lg:hidden">
              <img src="/favicon.jpg" alt="Collexa" className="h-8 w-8 object-contain" />
              <span className="text-xl font-bold text-foreground">Collexa</span>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">Create account</h2>
            <p className="mb-8 text-sm text-muted-foreground">Get started with Collexa</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="Jane Doe" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@university.edu" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className="mt-1" />
              </div>

              {/* Role Selection */}
              <div>
                <Label>I am a</Label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setRole('student')}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 ${
                      role === 'student'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    <User className="h-6 w-6" />
                    <span className="text-sm font-semibold">Student</span>
                    <span className="text-[10px] leading-tight opacity-70">Browse & register for events</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setRole('admin')}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 ${
                      role === 'admin'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    <Shield className="h-6 w-6" />
                    <span className="text-sm font-semibold">Admin</span>
                    <span className="text-[10px] leading-tight opacity-70">Create & manage events</span>
                  </motion.button>
                </div>
              </div>

              <Button type="submit" className="w-full transition-all hover:scale-[1.03]" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Register;
