import dynamic from 'next/dynamic';
import Toolbar from '@/components/Toolbar';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-400">
      Loading map...
    </div>
  ),
});

export default function Home() {
  return (
    <div className="relative h-full w-full">
      <Toolbar />
      <Map />
    </div>
  );
}
