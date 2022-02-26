import React from 'react';
import { connect } from 'react-redux';

import AddButton from '../reusable/AddButton';
import { createVersion } from '../../actions';

const AddVersion = ({ title, onSubmit, createVersion }) => {
  return (
    <AddButton
      title={`Add a Version of ${title.title}`}
      image="/images/add.png"
      fields={[
        {
          label: 'Name',
          name: 'name',
          type: 'input',
          required: true,
        },
        {
          label: 'Notes',
          name: 'notes',
          type: 'textarea',
        },
        {
          label: 'Current Version?',
          name: 'current',
          type: 'checkbox',
        },
      ]}
      onSubmit={(formValues) => {
        createVersion(formValues, title.id);
        if (onSubmit) {
          onSubmit();
        }
      }}
      form={`add-version-${title.id}`}
      initialValues={{ current: true }}
      enableReinitialize={true}
      addClass="add-version"
    />
  );
};

export default connect(null, { createVersion })(AddVersion);
