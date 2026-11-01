import * as yup from 'yup';

import { localDateTimeToIso } from './announcement-schedule';

// ==================== TYPES ====================

export interface AnnouncementFormValues {
  title: string;
  content: string;
  publication: 'now' | 'scheduled';
  publishAtLocal: string;
}

interface ValidationMessages {
  titleRequired: string;
  titleMax: string;
  contentRequired: string;
  contentMax: string;
  dateRequired: string;
  dateInvalid: string;
  dateFuture: string;
}

// ==================== VALIDATION ====================

export function createAnnouncementSchema(messages: ValidationMessages) {
  return yup.object({
    title: yup
      .string()
      .trim()
      .required(messages.titleRequired)
      .max(200, messages.titleMax),
    content: yup
      .string()
      .trim()
      .required(messages.contentRequired)
      .max(4000, messages.contentMax),
    publication: yup
      .mixed<'now' | 'scheduled'>()
      .oneOf(['now', 'scheduled'])
      .required(),
    publishAtLocal: yup
      .string()
      .defined()
      .when('publication', {
        is: 'scheduled',
        then: schema =>
          schema
            .required(messages.dateRequired)
            .test('valid-date', messages.dateInvalid, value =>
              Boolean(value && localDateTimeToIso(value))
            )
            .test('future-date', messages.dateFuture, value => {
              const iso = value && localDateTimeToIso(value);
              return Boolean(iso && new Date(iso).getTime() > Date.now());
            }),
      }),
  });
}
