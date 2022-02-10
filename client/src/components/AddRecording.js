import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import createFileList from 'create-file-list';

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
}) => {
  const defaultItem = { name: 'choose...', id: '0' };
  const displayDate = () => {
    return new Date().toISOString().substring(0, 10);
  };

  const [selectedTitle, setSelectedTitle] = useState(defaultItem);
  const [selectedTier, setSelectedTier] = useState(defaultItem);
  const [selectedVersion, setSelectedVersion] = useState(defaultItem);
  const [selectedDate, setSelectedDate] = useState(displayDate());

  const [titleList, setTitleList] = useState([]);
  const [tierList, setTierList] = useState([]);
  const [versionList, setVersionList] = useState([]);

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
    }
  }, [versions]);

  useEffect(() => {
    if (selectedVersion.id !== '0') {
      fetchBounces(selectedVersion.id);
    }
  }, [selectedVersion]);

  const selector = (stateList, onSelect, selectedItem) => {
    const onChange = (e) => {
      const selected = stateList.find((item) => item.id === e.target.value);
      onSelect(selected);
    };
    const list = [defaultItem].concat(stateList);
    const options = list.map((item) => {
      if (item) {
        const name = item.name || item.title;
        return (
          <option value={item.id} key={item.id}>
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

    const file = new File([audio], 'recording.mp3', { lastModified: Date() });

    const form = {
      date: selectedDate,
      latest: true,
      file: [file],
    };
    // const form = new FormData();
    // form.append('date', selectedDate);
    // form.append('latest', true);
    // form.append('file', file, file.name);
    createBounce(form, selectedVersion.id);
  };

  const submitActive = () => {
    if (audio && selectedDate && selectedVersion.id !== '0') {
      return true;
    }
    return false;
  };

  return (
    <div className="add-recording">
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
          className={`${submitActive() ? 'submit-button' : 'submit-inactive'}`}
          type="submit"
        >
          Save Bounce
        </button>
      </form>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    tiers: state.tiers,
    titles: state.titles,
    versions: state.versions,
    currentBand: state.bands.currentBand,
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
