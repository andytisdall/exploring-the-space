import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';

import AddButton from '../reusable/AddButton';
import DeleteButton from '../reusable/DeleteButton';
import requireAuth from '../reusable/requireAuth';
import DetailBox from '../reusable/DetailBox';
import {
  selectBounce,
  createBounce,
  editBounce,
  deleteBounce,
  queueSongs,
} from '../../actions';

const Bounce = ({
  bounces,
  selectBounce,
  title,
  authorized,
  version,
  createBounce,
  editBounce,
  deleteBounce,
  song,
  queueSongs,
}) => {
  const [selectedBounce, setSelectedBounce] = useState(title.selectedBounce);

  const [uploadActive, setUploadActive] = useState(false);

  // const [playButtonVisible, setPlayButtonVisible] = useState(false);

  useEffect(() => {
    if (selectedBounce && selectedBounce !== title.selectedBounce) {
      selectBounce(selectedBounce, title.id);
      // setPlayButtonVisible(true);
    }
  }, [selectedBounce]);

  useEffect(() => {
    if (selectedBounce && selectedBounce !== title.selectedBounce) {
      selectBounce(title.selectedBounce, title.id);
    }
  }, [title.selectedBounce]);

  useEffect(() => {
    setSelectedBounce(title.selectedBounce);
    setUploadActive(false);
  }, [title.selectedBounce]);

  const displayDate = (date) => {
    return moment.utc(date).format('MM/DD/yy');
  };

  const displayBounce = (b) => {
    return `${displayDate(b.date)}`;
  };

  const itemList = () => {
    if (selectedBounce) {
      return bounces
        .filter((b) => b && b.id !== selectedBounce.id)
        .sort((a, b) => (a.date < b.date ? 1 : -1));
    }
  };

  const onAddSubmit = (formValues) => {
    createBounce(formValues, version.id);
    setUploadActive(true);
  };

  const onEditSubmit = (formValues) => {
    editBounce(formValues, selectedBounce.id, version.id);
    setUploadActive(true);
  };

  const uploadContent = () => {
    return (
      <div className="upload-image">
        <p>Uploading...</p>
        <img className="windmill" src="/images/windmill.gif" />
      </div>
    );
  };

  const renderAddButton = () => {
    if (authorized) {
      return (
        <AddButton
          title={`Add a Bounce of ${version.name}`}
          image="images/add.png"
          fields={[
            {
              label: 'File',
              name: 'file',
              type: 'file',
              required: true,
            },
            {
              label: 'Date',
              name: 'date',
              type: 'date',
              required: true,
            },
            {
              label: 'Comments',
              name: 'comments',
              type: 'textarea',
            },
            {
              label: 'Latest Bounce?',
              name: 'latest',
              type: 'checkbox',
            },
          ]}
          onSubmit={(formValues) => onAddSubmit(formValues)}
          form={`add-bounce-${title.id}`}
          initialValues={{ latest: true }}
          addClass="add-bounce"
        />
      );
    }
  };

  const renderEditButton = () => {
    if (authorized) {
      return (
        <AddButton
          title={'Edit this Bounce'}
          image="images/edit.png"
          fields={[
            {
              label: 'File',
              name: 'file',
              type: 'file',
            },
            {
              label: 'Date',
              name: 'date',
              type: 'date',
            },
            {
              label: 'Comments',
              name: 'comments',
              type: 'textarea',
            },
            {
              label: 'Current Bounce?',
              name: 'latest',
              type: 'checkbox',
            },
          ]}
          onSubmit={onEditSubmit}
          initialValues={{
            ..._.pick(selectedBounce, 'comments', 'latest'),
            date: moment.utc(selectedBounce.date).format('YYYY-MM-DD'),
          }}
          form={`edit-bounce-${title.id}`}
          enableReinitialize={true}
          addClass="add-bounce"
        />
      );
    }
  };

  const renderDeleteButton = () => {
    if (authorized) {
      return (
        <DeleteButton
          onSubmit={() => deleteBounce(selectedBounce.id, version.id, title.id)}
          displayName={displayDate(selectedBounce.date)}
        />
      );
    }
  };

  const showPlayButton = () => {
    // if (playButtonVisible) {

    return (
      <img
        src="/images/play.svg"
        className="play-icon"
        onClick={() => queueSongs(song)}
      />
    );
    // }
  };

  if (uploadActive) {
    return <div className="detail-box bounce">{uploadContent()}</div>;
  } else {
    if (version) {
      return (
        <DetailBox
          selectedItem={selectedBounce}
          itemType="Bounce"
          itemList={itemList}
          displayItem={displayBounce}
          setSelected={setSelectedBounce}
          renderAddButton={renderAddButton}
          renderEditButton={renderEditButton}
          renderDeleteButton={renderDeleteButton}
          playButton={showPlayButton}
        />
      );
    } else {
      return null;
    }
  }
};

export default connect(null, {
  selectBounce,
  createBounce,
  editBounce,
  deleteBounce,
  queueSongs,
})(requireAuth(Bounce));
