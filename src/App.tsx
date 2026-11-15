import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SignatureModelSection } from './components/SignatureModelSection';
import { TelemetrySection } from './components/TelemetrySection';
import { ParallelsSection } from './components/ParallelsSection';
import { LogbookSection } from './components/LogbookSection';
import { InquiryFooterSection } from './components/InquiryFooterSection';

export default function App() {
  const [explodePercent, setExplodePercent] = useState<number>(24);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#060B19] text-[#F8FAFC]">
      <Navbar onInitiateInquiry={() => scrollToId('footer')} />

      <main>
        <HeroSection
          onEnterObservatory={() => scrollToId('models')}
          onExploreStack={() => {
            setExplodePercent(80);
            scrollToId('models');
          }}
        />

        <SignatureModelSection
          explodePercent={explodePercent}
          onExplodeChange={setExplodePercent}
        />

        <TelemetrySection />

        <ParallelsSection />

        <LogbookSection />

        <InquiryFooterSection />
      </main>
    </div>
  );
}
