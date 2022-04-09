import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { StorageProviderType } from '@/types/api';
import Modal from '../Modal';
import Heading from '../Heading';
import StorageItemForm from '../StorageItemForm';
import useRemoteTokens from '../../store/remoteTokens';
import { localApiStateSelector } from '@/selectors';
import Stack from '../Stack';

type Props = {
  isOpen: boolean
  onClose: (arg: boolean) => void
  onSuccess: () => void
};

// @TODO use hooks

export default function CreateStorageItemModal({ isOpen, onClose, onSuccess }: Props) {
  const localApiState = useSelector(localApiStateSelector);
  const { addNewProviderItem } = useRemoteTokens();
  const [hasErrored, setHasErrored] = React.useState(false);
  let defaultFields;
  switch (localApiState.provider) {
    case StorageProviderType.GITHUB:
    case StorageProviderType.GITLAB: {
      defaultFields = {
        secret: '',
        id: '',
        branch: '',
        filePath: '',
        baseUrl: '',
      };
      break;
    }
    case StorageProviderType.BITBUCKET: {
      defaultFields = {
        username: '',
        password: '',
        id: '',
        branch: '',
        filePath: '',
        baseUrl: '',
      };
      break;
    }
    default:
      defaultFields = { id: '', name: '', secret: '' };
      break;
  }
  const [formFields, setFormFields] = React.useState(defaultFields);
  const handleCreateNewClick = async () => {
    setHasErrored(false);
    const response = await addNewProviderItem({
      provider: localApiState.provider,
      ...formFields,
    });
    if (response) {
      onSuccess();
    } else {
      setHasErrored(true);
    }
  };

  const handleChange = (e) => {
    setFormFields({ ...formFields, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCreateNewClick();
  };

  return (
    <Modal large isOpen={isOpen} close={() => onClose(false)}>
      <Stack direction="column" gap={4}>
        <Heading>Add new credentials</Heading>
        <StorageItemForm
          isNew
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={() => onClose(false)}
          values={formFields}
          hasErrored={hasErrored}
        />
      </Stack>
    </Modal>
  );
}
