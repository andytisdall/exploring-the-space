import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';

import AddRecordingSelector from './AddRecordingSelector';
import AddTier from '../tiers/AddTier';
import AddTitle from '../titles/AddTitle';
import AddVersion from '../versions/AddVersion';
import {
  fetchTiers,
  fetchTitles,
  fetchVersions,
  fetchBounces,
  createBounce,
} from '../../actions';

const AddRecording = ({
  currentBand,
  tiers,
  titles,
  versions,
  fetchTiers,
  fetchTitles,
  fetchVersions,
  fetchBounces,
  createBounce,
  uploadStarted,
  error,
  user,
  recording,
  onSuccess,
}) => {
  const defaultItem = { name: 'choose...', id: '0' };
  const displayDate = () => {
    return new Date().toISOString().substring(0, 10);
  };

  const [selectedTitle, setSelectedTitle] = useState(defaultItem);
  const [selectedTier, setSelectedTier] = useState(defaultItem);
  const [selectedVersion, setSelectedVersion] = useState(defaultItem);
  const [selectedDate, setSelectedDate] = useState(displayDate());
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  const [titleList, setTitleList] = useState([]);
  const [tierList, setTierList] = useState([]);
  const [versionList, setVersionList] = useState([]);

  const location = useLocation();

  useEffect(() => {
    if (location.state) {
      setSelectedTier(location.state.tier);
      setSelectedTitle(location.state.title);
      setSelectedVersion(location.state.version);
    }
  }, []);

  useEffect(() => {
    if (currentBand) {
      fetchTiers(currentBand.id);
    }
  }, [currentBand]);

  useEffect(() => {
    if (currentBand) {
      const list = currentBand.tiers.map((id) => tiers[id]);
      setTierList(list);
    }
  }, [tiers]);

  useEffect(() => {
    if (selectedTier.id !== '0') {
      fetchTitles(selectedTier.id);
      setVersionList([]);
      // setSelectedVersion(defaultItem);
      // setSelectedTitle(defaultItem);
    }
  }, [selectedTier]);

  useEffect(() => {
    if (selectedTier.id !== '0') {
      const list = selectedTier.trackList.map((id) => titles[id]);
      setTitleList(list);
    }
  }, [titles]);

  useEffect(() => {
    if (selectedTitle.id !== '0') {
      fetchVersions(selectedTitle.id);
      // setSelectedVersion(defaultItem);
    }
  }, [selectedTitle]);

  useEffect(() => {
    if (selectedTitle.id !== '0') {
      const list = selectedTitle.versions.map((id) => versions[id]);
      setVersionList(list);
    }
  }, [versions]);

  useEffect(() => {
    if (selectedVersion.id !== '0') {
      fetchBounces(selectedVersion.id);
    }
  }, [selectedVersion]);

  useEffect(() => {
    if (uploadLoading && !uploadStarted) {
      setUploadLoading(false);
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
      }, 10000);
      onSuccess();
    }
    if (uploadStarted && !uploadLoading) {
      setUploadLoading(true);
    }
  }, [uploadStarted]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (submitActive()) {
      const file = new File([recording], 'recording.mp3', {
        lastModified: Date(),
      });
      const form = {
        date: selectedDate,
        latest: true,
        file: [file],
      };
      createBounce(form, selectedVersion.id);
    }
  };

  const submitActive = () => {
    if (recording && selectedDate && selectedVersion.id !== '0') {
      return true;
    }
    return false;
  };

  const renderUploadSuccess = () => {
    return <div className="upload-success">Recording Successfully Saved!</div>;
  };

  const renderUploadLoading = () => {
    return (
      <div className="upload-image">
        <p>Uploading...</p>
        <img src="/images/windmill.gif" className="windmill" />
      </div>
    );
  };

  if (!user || !currentBand || !user.bands.includes(currentBand.id)) {
    return (
      <div className="add-recording">
        Warning: you will not be able to save this recording because you are not
        signed in or this is not your band.
      </div>
    );
  }

  return (
    <div className="add-recording">
      <h2>Save recording for {currentBand.name}</h2>

      <AddRecordingSelector
        stateList={tierList}
        onSelect={setSelectedTier}
        selectedItem={selectedTier}
        label="Tier"
        addButton={<AddTier />}
      />

      {selectedTier.id !== '0' && (
        <AddRecordingSelector
          stateList={titleList}
          onSelect={setSelectedTitle}
          selectedItem={selectedTitle}
          label="Title"
          addButton={<AddTitle tier={selectedTier} />}
        />
      )}

      {selectedTitle.id !== '0' && (
        <AddRecordingSelector
          stateList={versionList}
          onSelect={setSelectedVersion}
          selectedItem={selectedVersion}
          label="Version"
          addButton={<AddVersion title={selectedTitle} />}
        />
      )}

      {selectedVersion.id !== '0' && (
        <AddRecordingSelector
          stateList={null}
          onSelect={setSelectedDate}
          selectedItem={selectedDate}
          label="Date"
          date={true}
        />
      )}

      <form onSubmit={onSubmit}>
        <button
          className={`${
            submitActive()
              ? 'submit-button submit-button-centered'
              : 'submit-inactive'
          }`}
          type="submit"
        >
          Save Bounce
        </button>
      </form>
      {uploadSuccess && renderUploadSuccess()}
      {uploadLoading && renderUploadLoading()}
      {error}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    tiers: state.tiers,
    titles: state.titles,
    versions: state.versions,
    currentBand: state.bands.currentBand,
    uploadStarted: state.bands.uploadStarted,
    error: state.error.error,
    user: state.auth.user,
  };
};

export default connect(mapStateToProps, {
  fetchTiers,
  fetchTitles,
  fetchVersions,
  createBounce,
  fetchBounces,
})(AddRecording);
