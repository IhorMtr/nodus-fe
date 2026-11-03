import { SkipLink } from './components/SkipLink';
import { ChannelsSection } from './sections/channels-section/ChannelsSection';
import { ConversationsSection } from './sections/conversations-section/ConversationsSection';
import { FinalCtaSection } from './sections/final-cta-section/FinalCtaSection';
import { Footer } from './sections/footer/Footer';
import { Header } from './sections/header/Header';
import { HeroSection } from './sections/hero-section/HeroSection';
import { IntroductionSection } from './sections/introduction-section/IntroductionSection';
import { OverviewSection } from './sections/overview-section/OverviewSection';
import { TeamSection } from './sections/team-section/TeamSection';
import { UpdatesSection } from './sections/updates-section/UpdatesSection';

import styles from './LandingView.module.scss';

export function LandingView() {
  return (
    <div className={styles.root}>
      <SkipLink className={styles.skipLink} />
      <Header />

      <main id="main-content" tabIndex={-1}>
        {/* ==================== INTRODUCTION ==================== */}

        <HeroSection />
        <IntroductionSection />

        {/* ==================== FEATURE SECTIONS ==================== */}

        <OverviewSection />
        <ConversationsSection />
        <ChannelsSection />
        <TeamSection />
        <UpdatesSection />

        {/* ==================== INVITATION ==================== */}

        <FinalCtaSection />
      </main>

      <Footer />
    </div>
  );
}
