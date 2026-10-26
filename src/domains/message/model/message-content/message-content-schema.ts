import { object, string } from 'yup';

type MessageValidationKey = 'contentRequired' | 'contentTooLong';

export interface MessageContentForm {
  content: string;
}

export function messageContentSchema(
  translate: (key: MessageValidationKey) => string
) {
  return object({
    content: string()
      .trim()
      .required(translate('contentRequired'))
      .max(4000, translate('contentTooLong')),
  });
}
