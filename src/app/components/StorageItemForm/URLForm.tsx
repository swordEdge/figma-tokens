import React from 'react';
import zod from 'zod';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageTypeFormValues } from '@/types/StorageType';
import Button from '../Button';
import Input from '../Input';
import Stack from '../Stack';
import { generateId } from '@/utils/generateId';

type ValidatedFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.URL; }>;
type Props = {
  values: Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.URL; }>;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onCancel: () => void;
  onSubmit: (values: ValidatedFormValues) => void;
  hasErrored?: boolean;
  errorMessage?: string;
};

export default function URLForm({
  onChange, onSubmit, onCancel, values, hasErrored, errorMessage,
}: Props) {
  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const zodSchema = zod.object({
      provider: zod.string(),
      name: zod.string().optional(),
      id: zod.string(),
      secret: zod.string().optional(),
      internalId: zod.string().optional(),
    });
    const validationResult = zodSchema.safeParse(values);
    if (validationResult.success) {
      const formFields = {
        ...validationResult.data,
        provider: StorageProviderType.URL,
        internalId: validationResult.data.internalId || generateId(24),
      } as ValidatedFormValues;
      onSubmit(formFields);
    }
  }, [values, onSubmit]);

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="column" gap={4}>
        <Input full label="Name" value={values.name} onChange={onChange} type="text" name="name" required />
        <Input full label="Headers (optional)" value={values.secret} onChange={onChange} type="text" name="secret" />
        <Input full label="URL" value={values.id} onChange={onChange} type="text" name="id" required />
        <Stack direction="row" gap={4}>
          <Button variant="secondary" size="large" onClick={onCancel}>
            Cancel
          </Button>

          <Button variant="primary" type="submit" disabled={!values.secret && !values.name}>
            Save
          </Button>
        </Stack>
        {hasErrored && (
        <div className="bg-red-200 text-red-700 rounded p-4 text-xs font-bold" data-cy="provider-modal-error">
          {errorMessage}
        </div>
        )}
      </Stack>
    </form>
  );
}
