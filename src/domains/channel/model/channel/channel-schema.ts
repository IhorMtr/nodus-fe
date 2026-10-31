import { object, string } from 'yup';

type ChannelValidationKey = 'nameRequired' | 'nameTooLong';

export function channelNameSchema(
  translate: (key: ChannelValidationKey) => string
) {
  return object({
    name: string()
      .trim()
      .required(translate('nameRequired'))
      .max(80, translate('nameTooLong')),
  });
}
