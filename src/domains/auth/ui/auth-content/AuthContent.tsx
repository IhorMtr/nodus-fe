import type { ReactNode } from 'react';

import styles from './AuthContent.module.scss';

type AuthContentProps = {
  headingId: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthContent({
  headingId,
  title,
  description,
  children,
  footer,
}: AuthContentProps) {
  return (
    <section aria-labelledby={headingId}>
      <div className={styles.introduction}>
        <h1 id={headingId}>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
      <p className={styles.alternative}>{footer}</p>
    </section>
  );
}
