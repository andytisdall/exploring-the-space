import React from 'react';
import { connect } from 'react-redux';

import AddButton from '../reusable/AddButton';
import { createTier } from '../../actions';

const AddTier = ({ createTier }) => {
  return (
    <AddButton
      onSubmit={(formValues) => createTier(formValues)}
      title="Add a Tier"
      image="/images/add.png"
      fields={[
        {
          label: 'Tier Name',
          name: 'tierName',
          type: 'input',
          required: true,
        },
      ]}
      addClass="add-left"
    />
  );
};

export default connect(null, { createTier })(AddTier);
