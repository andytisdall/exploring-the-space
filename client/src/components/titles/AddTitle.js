import React from 'react';
import { connect } from 'react-redux';

import AddButton from '../reusable/AddButton';
import { createTitle } from '../../actions';

const AddTitle = ({ tier, onSubmit, createTitle }) => {
  return (
    <AddButton
      title={`Add a Title to ${tier.name}`}
      image="/images/add.png"
      fields={[
        {
          label: 'Title',
          name: 'title',
          type: 'input',
          required: true,
        },
      ]}
      onSubmit={(formValues) => {
        createTitle(formValues, tier.id);
        if (onSubmit) {
          onSubmit();
        }
      }}
      form={`add-title-${tier.id}`}
      addClass="add-left"
    />
  );
};

export default connect(null, { createTitle })(AddTitle);
