import { SkipLink } from './components/SkipLink';
import { CapabilitiesSection } from './sections/CapabilitiesSection/CapabilitiesSection';
import { FinalCtaSection } from './sections/FinalCtaSection/FinalCtaSection';
import { Footer } from './sections/Footer/Footer';
import { Header } from './sections/Header/Header';
import { HeroSection } from './sections/HeroSection/HeroSection';
import { ProductPreviewSection } from './sections/ProductPreviewSection/ProductPreviewSection';
import { StructureSection } from './sections/StructureSection/StructureSection';

import styles from './LandingView.module.scss';

export function LandingView() {
  return (
    <div className={styles.root}>
      <SkipLink className={styles.skipLink} />
      <div className={styles.container}>
        <Header />
        <main id="main-content" tabIndex={-1}>
          <HeroSection />
          <ProductPreviewSection />
          <CapabilitiesSection />
          <StructureSection />
          <FinalCtaSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
