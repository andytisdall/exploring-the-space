import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import {
  fetchTiers,
  fetchTitles,
  fetchVersions,
  fetchBand,
  fetchBounces,
  createBounce,
} from '../actions';

const AddRecording = ({
  currentBand,
  tiers,
  titles,
  versions,
  bandName,
  fetchBand,
  fetchTiers,
  fetchTitles,
  fetchVersions,
  fetchBounces,
  createBounce,
  audio,
  uploadStarted,
  error,
  user,
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
    fetchBand(bandName);
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
      if (location.state) {
        setSelectedTier(location.state.tier);
      }
    }
  }, [tiers]);

  useEffect(() => {
    if (selectedTier !== defaultItem) {
      fetchTitles(selectedTier.id);
      setVersionList([]);
      setSelectedVersion(defaultItem);
    }
  }, [selectedTier]);

  useEffect(() => {
    if (selectedTier !== defaultItem) {
      const list = selectedTier.trackList.map((id) => titles[id]);
      setTitleList(list);
      if (location.state) {
        setSelectedTitle(location.state.title);
      }
    }
  }, [titles]);

  useEffect(() => {
    if (selectedTitle !== defaultItem) {
      fetchVersions(selectedTitle.id);
    }
  }, [selectedTitle]);

  useEffect(() => {
    if (selectedTitle !== defaultItem) {
      const list = selectedTitle.versions.map((id) => versions[id]);
      setVersionList(list);
      if (location.state) {
        setSelectedVersion(location.state.version);
      }
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
    }
    if (uploadStarted && !uploadLoading) {
      setUploadLoading(true);
    }
  }, [uploadStarted]);

  const selector = (stateList, onSelect, selectedItem) => {
    const onChange = (e) => {
      const selected = stateList.find((item) => item.id === e.target.value);
      onSelect(selected);
    };
    const list = [defaultItem, ...stateList];
    const options = list.map((item) => {
      if (item) {
        const name = item.name || item.title;
        return (
          <option value={item.id} key={item.id} disabled={item.id === '0'}>
            {name}
          </option>
        );
      }
    });
    return (
      <select onChange={onChange} value={selectedItem.id}>
        {options}
      </select>
    );
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (submitActive()) {
      const file = new File([audio], 'recording.mp3', { lastModified: Date() });
      const form = {
        date: selectedDate,
        latest: true,
        file: [file],
      };

      createBounce(form, selectedVersion.id);
    }
  };

  const submitActive = () => {
    if (audio && selectedDate && selectedVersion.id !== '0') {
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
      <div className="add-recording-select-row">
        <div className="add-recording-label">Tier:</div>
        <div>
          {currentBand &&
            tierList &&
            selector(tierList, setSelectedTier, selectedTier)}
        </div>
      </div>

      <div className="add-recording-select-row">
        <div className="add-recording-label">Title:</div>
        <div>
          {selectedTier &&
            titleList &&
            selector(titleList, setSelectedTitle, selectedTitle)}
        </div>
      </div>

      <div className="add-recording-select-row">
        <div className="add-recording-label">Version:</div>
        <div>
          {selectedTitle &&
            versionList &&
            selector(versionList, setSelectedVersion, selectedVersion)}
        </div>
      </div>

      <div className="add-recording-select-row">
        <div className="add-recording-label">Date:</div>
        <div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="calendar"
          />
        </div>
      </div>
      <form onSubmit={onSubmit}>
        <button
          className={`${
            submitActive() ? 'submit-button-centered' : 'submit-inactive'
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
  fetchBand,
  createBounce,
  fetchBounces,
})(AddRecording);
