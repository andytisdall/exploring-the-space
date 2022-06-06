import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import {
  fetchBounces,
  selectVersion,
  createVersion,
  editVersion,
  deleteVersion,
} from '../../actions';
import Bounce from '../bounces/Bounce';
import AddVersion from './AddVersion';
import AddButton from '../reusable/AddButton';
import DeleteButton from '../reusable/DeleteButton';
import requireAuth from '../reusable/requireAuth';
import DetailBox from '../reusable/DetailBox';

const Version = ({
  versions,
  bounces,
  fetchBounces,
  selectVersion,
  title,
  authorized,
  editVersion,
  deleteVersion,
  song,
  tier,
  band,
}) => {
  const [selectedVersion, setSelectedVersion] = useState(title.selectedVersion);
  const [bounceList, setBounceList] = useState(null);

  useEffect(() => {
    // console.log(selectedVersion);
    if (selectedVersion && selectedVersion !== title.selectedVersion) {
      selectVersion(selectedVersion, title.id);
      setBounceList(selectedVersion.bounces.map((id) => bounces[id]));
      fetchBounces(selectedVersion.id);
    }
  }, [
    selectedVersion,
    selectVersion,
    setBounceList,
    fetchBounces,
    title,
    bounces,
  ]);

  useEffect(() => {
    if (selectedVersion) {
      // console.log(title.selectedVersion)
      setBounceList(selectedVersion.bounces.map((id) => bounces[id]));
    }
  }, [bounces, selectedVersion]);

  useEffect(() => {
    if (selectedVersion !== title.selectedVersion) {
      setSelectedVersion(title.selectedVersion);
    }
  }, [title.selectedVersion, selectedVersion]);

  const renderBounces = () => {
    if (bounceList && selectedVersion) {
      return (
        <Bounce
          bounces={bounceList}
          title={title}
          version={selectedVersion}
          song={song}
        />
      );
    }
  };

  const renderArrow = () => {
    if (bounceList && selectedVersion) {
      return <div className="version-arrow">&rarr;</div>;
    }
  };

  // const renderRecordLink = () => {
  //   if (authorized && selectedVersion) {
  //     return (
  //       <Link
  //         to={{
  //           pathname: `/${band.url}/record`,
  //           state: {
  //             version: selectedVersion,
  //             title,
  //             tier,
  //           },
  //         }}
  //         className="record-link"
  //       >
  //         record a bounce
  //       </Link>
  //     );
  //   }
  // };

  const renderAddButton = () => {
    if (authorized) {
      return <AddVersion title={title} />;
    }
  };

  const renderEditButton = () => {
    if (authorized) {
      return (
        <AddButton
          title={`Edit ${selectedVersion.name}`}
          image="images/edit.png"
          fields={[
            {
              label: 'Name',
              name: 'name',
              type: 'input',
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
          onSubmit={(formValues) =>
            editVersion(formValues, selectedVersion.id, title.id)
          }
          initialValues={_.pick(selectedVersion, 'name', 'notes', 'current')}
          form={`edit-version-${title.id}`}
          enableReinitialize={true}
          addClass="add-version"
        />
      );
    }
  };

  const renderDeleteButton = () => {
    if (authorized) {
      return (
        <DeleteButton
          onSubmit={() => deleteVersion(selectedVersion.id, title.id)}
          displayName={selectedVersion.name}
        />
      );
    }
  };

  const itemList = () => {
    return versions.filter((v) => v.id !== selectedVersion.id);
  };

  const displayVersion = (v) => {
    return `${v.name}`;
  };

  return (
    <>
      <DetailBox
        selectedItem={selectedVersion}
        itemType="Version"
        itemList={itemList}
        displayItem={displayVersion}
        setSelected={setSelectedVersion}
        renderAddButton={renderAddButton}
        renderEditButton={renderEditButton}
        renderDeleteButton={renderDeleteButton}
      />
      <div className="detail-box-between">
        {/* {renderRecordLink()} */}
        {renderArrow()}
      </div>
      {renderBounces()}
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    bounces: state.bounces,
    band: state.bands.currentBand,
  };
};

export default connect(mapStateToProps, {
  fetchBounces,
  selectVersion,
  createVersion,
  editVersion,
  deleteVersion,
})(requireAuth(Version));
