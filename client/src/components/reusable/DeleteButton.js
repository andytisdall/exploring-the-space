import React, { useState } from 'react';
import Modal from './Modal';

const DeleteButton = ({ onSubmit, displayName, dataId }) => {
  const [visible, setVisible] = useState(false);

  const renderContent = () => {
    return `Seriously delete "${displayName}"?`;
  };

  const renderActions = () => {
    return (
      <>
        <button
          className="modal-button"
          onClick={() => {
            onSubmit();
            setVisible(false);
          }}
        >
          Delete
        </button>
        <button className="modal-button" onClick={() => setVisible(false)}>
          No Wait
        </button>
      </>
    );
  };

  const showModal = () => {
    return (
      <Modal
        content={renderContent()}
        actions={renderActions()}
        onDismiss={(e) => {
          e.stopPropagation();
          setVisible(false);
        }}
      />
    );
  };

  const onClick = (e) => {
    e.stopPropagation();
    setVisible(true);
  };

  const testId = dataId ? `delete-${dataId}` : '';

  return (
    <div>
      <img
        src="/images/delete.png"
        className="delete"
        onClick={onClick}
        alt="delete"
        data-testid={testId}
      />
      {visible && showModal()}
    </div>
  );
};

export default DeleteButton;
