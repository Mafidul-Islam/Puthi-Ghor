import { redirect } from 'next/navigation';

export default function Home() {
  // Simple redirect to the dashboard. 
  // In a real app with middleware, unauthenticated users would hit middleware and bounce to /login.
  redirect('/dashboard');
}
