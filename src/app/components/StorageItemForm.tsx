import React from 'react';
import { useSelector } from 'react-redux';
import { StorageProviderType } from '@/types/api';
import GitForm from './StorageItemForm/GitForm';
import BitbucketForm from './StorageItemForm/BitbucketForm';
import JSONBinForm from './StorageItemForm/JSONBinForm';
import URLForm from './StorageItemForm/URLForm';
import { localApiStateSelector } from '@/selectors';

// @TODO typings

export default function StorageItemForm({
  isNew = false, handleChange, handleSubmit, handleCancel, values, hasErrored,
}) {
  const localApiState = useSelector(localApiStateSelector);

  switch (localApiState.provider) {
    case StorageProviderType.GITHUB:
    case StorageProviderType.GITLAB: {
      return (
        <GitForm
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          values={values}
          hasErrored={hasErrored}
        />
      );
    }
    case StorageProviderType.BITBUCKET: {
      return (
        <BitbucketForm
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          values={values}
          hasErrored={hasErrored}
        />
      );
    }
    case StorageProviderType.URL: {
      return (
        <URLForm
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          values={values}
          hasErrored={hasErrored}
        />
      );
    }
    default: {
      return (
        <JSONBinForm
          isNew={isNew}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
          values={values}
          hasErrored={hasErrored}
        />
      );
    }
  }
}
