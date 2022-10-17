import React, { useRef } from 'react';
import zod from 'zod';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageTypeFormValues } from '@/types/StorageType';
import Box from '../Box';
import Button from '../Button';
import Input from '../Input';
import Stack from '../Stack';
import { generateId } from '@/utils/generateId';

type ValidatedFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.ADO; }>;
type Props = {
  values: Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.ADO; }>;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onCancel: () => void;
  onSubmit: (values: ValidatedFormValues) => void;
  hasErrored?: boolean;
  errorMessage?: string;
};

export default function ADOForm({
  onChange, onSubmit, onCancel, values, hasErrored, errorMessage,
}: Props) {
  const inputEl = useRef<HTMLInputElement | null>(null);

  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const zodSchema = zod.object({
      provider: zod.string(),
      name: zod.string().optional(),
      id: zod.string(),
      branch: zod.string(),
      filePath: zod.string(),
      baseUrl: zod.string(),
      secret: zod.string(),
      internalId: zod.string().optional(),
    });
    const validationResult = zodSchema.safeParse(values);
    if (validationResult.success) {
      const formFields = {
        ...validationResult.data,
        internalId: validationResult.data.internalId || generateId(24),
      } as ValidatedFormValues;
      onSubmit(formFields);
    }
  }, [values, onSubmit]);

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="column" gap={4}>
        <Input
          full
          label="Organization Url"
          value={values.baseUrl}
          placeholder="https://dev.azure.com/yourOrgName"
          onChange={onChange}
          type="text"
          name="baseUrl"
          required
        />
        <Box css={{ position: 'relative' }}>
          <Input
            full
            label="Personal Access Token"
            value={values.secret}
            onChange={onChange}
            inputRef={inputEl}
            isMasked
            type="password"
            name="secret"
            required
          />
        </Box>
        <Input
          full
          label="Repository name"
          value={values.id}
          onChange={onChange}
          type="text"
          name="id"
          required
        />
        <Input
          full
          label="Default Branch"
          value={values.branch}
          onChange={onChange}
          type="text"
          name="branch"
          required
        />
        <Input
          full
          label="File Path (e.g. data/tokens.json)"
          defaultValue=""
          value={values.filePath}
          onChange={onChange}
          type="text"
          name="filePath"
        />
        <Input
          full
          label="Project Name (optional)"
          value={values.name}
          onChange={onChange}
          type="text"
          name="name"
        />
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
