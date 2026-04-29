import { Dashboard } from '@/components/Dashboard';

export default function Home() {
  const now = new Date();
  const period = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getFullYear()).slice(-2)}`;
  const defaultGP = process.env.GP_NAME ?? 'Guilherme';

  return <Dashboard defaultGP={defaultGP} period={period} />;
}
