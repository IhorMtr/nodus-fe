import { SkipLink } from './components/SkipLink';
import { CapabilitiesSection } from './sections/capabilities-section/CapabilitiesSection';
import { FinalCtaSection } from './sections/final-cta-section/FinalCtaSection';
import { Footer } from './sections/footer/Footer';
import { Header } from './sections/header/Header';
import { HeroSection } from './sections/hero-section/HeroSection';
import { ProductPreviewSection } from './sections/product-preview-section/ProductPreviewSection';
import { StructureSection } from './sections/structure-section/StructureSection';

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
