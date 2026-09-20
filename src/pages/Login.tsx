import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { PageTransition } from '@/components/motion/PageTransition';
import { FloatingOrbs } from '@/components/motion/FloatingOrbs';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Resolve the role from Firestore (authoritative source) before routing
      // so the correct dashboard renders immediately and consistently.
      await refreshUser();
      navigate('/dashboard');
    } catch (err: any) {
      toast({ title: 'Login failed', description: err.message, variant: 'destructive' });
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
            <p className="text-lg text-muted-foreground">Your campus community awaits.</p>
          </div>
        </div>

        <div className="flex w-full items-center justify-center bg-background px-6 lg:w-1/2">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex items-center gap-2 lg:hidden">
              <img src="/favicon.jpg" alt="Collexa" className="h-8 w-8 object-contain" />
              <span className="text-xl font-bold text-foreground">Collexa</span>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="mb-8 text-sm text-muted-foreground">Sign in to your account</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@university.edu" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="mt-1" />
              </div>
              <Button type="submit" className="w-full transition-all hover:scale-[1.03]" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Login;
