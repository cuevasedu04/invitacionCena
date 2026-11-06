import Backdrop from './components/Backdrop';
import Brochure from './components/brochure/Brochure';

export default function App() {
  return (
    <main className="relative h-full w-full overflow-hidden bg-navy-950">
      <Backdrop />
      <Brochure />
    </main>
  );
}
