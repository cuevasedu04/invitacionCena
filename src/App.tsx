import { useState } from 'react';
import Backdrop from './components/Backdrop';
import Brochure from './components/brochure/Brochure';

export default function App() {
  const [backdropPaused, setBackdropPaused] = useState(false);
  return (
    <main className="relative h-full w-full overflow-hidden bg-navy-950">
      <Backdrop paused={backdropPaused} />
      <Brochure onBackdropPausedChange={setBackdropPaused} />
    </main>
  );
}
