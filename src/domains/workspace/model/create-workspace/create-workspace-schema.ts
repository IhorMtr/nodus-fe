import { object, string } from 'yup';

type WorkspaceValidationKey = 'nameRequired' | 'nameTooLong';

export function createWorkspaceSchema(
  translate: (key: WorkspaceValidationKey) => string
) {
  return object({
    name: string()
      .trim()
      .required(translate('nameRequired'))
      .max(100, translate('nameTooLong')),
  });
}
