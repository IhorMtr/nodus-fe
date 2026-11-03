'use client';

import { Search, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { Input } from '@/shared/ui/input';
import { Spinner } from '@/shared/ui/spinner';

import { useChannelSearch } from './use-channel-search';
import styles from './ChannelSearchPanel.module.scss';

// ==================== COMPONENT ====================

export function ChannelSearchPanel({
  workspaceId,
  channelId,
  onClose,
  onSelectMessage,
  withHeading = true,
}: {
  workspaceId: string;
  channelId: string;
  onClose: () => void;
  onSelectMessage: (messageId: string) => void;
  withHeading?: boolean;
}) {
  // ==================== CONTEXT AND STATE ====================

  const t = useTranslations('workspace.searchPanel');
  const locale = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const { input, setInput, query, results, items, isDebouncing } =
    useChannelSearch(workspaceId, channelId);
  const dateFormat = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // ==================== EFFECTS ====================

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ==================== RENDER ====================

  return (
    <section className={styles.panel} aria-label={t('title')}>
      {withHeading && (
        <div className={styles.heading}>
          <h2>{t('title')}</h2>
          <IconButton
            icon={<X />}
            variant="ghost"
            aria-label={t('close')}
            onClick={onClose}
          />
        </div>
      )}
      <div className={styles.search}>
        <Input
          data-autofocus
          ref={inputRef}
          type="search"
          value={input}
          onChange={event => setInput(event.currentTarget.value)}
          maxLength={200}
          aria-label={t('input')}
          placeholder={t('placeholder')}
          leftIcon={<Search size={16} />}
        />
      </div>
      <div className={styles.results} aria-live="polite">
        {!query && !isDebouncing && <p className={styles.state}>{t('hint')}</p>}
        {(isDebouncing || (query && results.isPending)) && (
          <div className={styles.loading}>
            <Spinner size="sm" label={t('loading')} />
          </div>
        )}
        {query && results.isError && !results.isFetchNextPageError && (
          <div className={styles.state} role="alert">
            <p>{t('error')}</p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void results.refetch()}
            >
              {t('retry')}
            </Button>
          </div>
        )}
        {query && results.isSuccess && items.length === 0 && (
          <p className={styles.state}>{t('empty')}</p>
        )}
        {items.length > 0 && (
          <ul className={styles.list}>
            {items.map(({ message }) => (
              <li key={message.id} className={styles.result}>
                <button
                  type="button"
                  className={styles.resultButton}
                  onClick={() => onSelectMessage(message.id)}
                >
                  <div className={styles.meta}>
                    <strong>
                      {[message.author.firstName, message.author.lastName]
                        .filter(Boolean)
                        .join(' ')}
                    </strong>
                    <time dateTime={message.createdAt}>
                      {dateFormat.format(new Date(message.createdAt))}
                    </time>
                  </div>
                  <p>{message.content}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
        {results.isFetchNextPageError && (
          <p className={styles.state} role="alert">
            {t('error')}
          </p>
        )}
        {results.hasNextPage && (
          <Button
            size="sm"
            variant="secondary"
            loading={results.isFetchingNextPage}
            onClick={() => void results.fetchNextPage()}
          >
            {results.isFetchNextPageError ? t('retry') : t('more')}
          </Button>
        )}
      </div>
    </section>
  );
}
