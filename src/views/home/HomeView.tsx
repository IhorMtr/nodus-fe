import { Stack, Text, Title } from '@mantine/core';

import styles from './HomeView.module.scss';

export function HomeView() {
  return (
    <main className={styles.root}>
      <Stack align="center">
        <Title order={1}>Nodus</Title>
        <Text c="dimmed" ta="center">
          Frontend initialized successfully.
        </Text>
      </Stack>
    </main>
  );
}
