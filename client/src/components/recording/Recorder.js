import React, { useEffect, useRef, useState } from 'react';
import vmsg from '../../vmsg/vmsg';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import {
  clearRecordings,
  createRecording,
  fetchRecording,
  deleteRecording,
  combineRecordings,
  fetchBand,
} from '../../actions';
import AddRecording from './AddRecording';
import Timer from './Timer';
import DeviceControl from './DeviceControl';
import DeleteButton from '../reusable/DeleteButton';
import greenhouse from '../../apis/greenhouse';

const Recorder = ({
  recordings,
  createRecording,
  fetchRecording,
  clearRecordings,
  deleteRecording,
  combineRecordings,
  fetchBand,
  currentBand,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [inputSource, setInputSource] = useState();
  const [error, setError] = useState('');
  const [readyToSave, setReadyToSave] = useState(false);

  const mediaRecorder = useRef();
  const params = useParams();

  useEffect(() => {
    // Initialize vmsg recorder
    mediaRecorder.current = new vmsg.Recorder({
      wasmURL: 'https://unpkg.com/vmsg@0.4.0/vmsg.wasm',
    });

    fetchBand(params.bandName);
  }, []);

  useEffect(() => {
    if (currentBand) {
      const recordingList = JSON.parse(localStorage.getItem('recording-list'));
      if (recordingList) {
        recordingList.forEach((id, index) => {
          fetchRecording(id, index);
        });
      }
    }
  }, [currentBand]);

  const onRecord = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const startRecording = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: inputSource.deviceId,
        },
      });
      await mediaRecorder.current.init();
      mediaRecorder.current.startRecording();
      setIsRecording(true);
      setReadyToSave(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const stopRecording = async () => {
    try {
      const blob = await mediaRecorder.current.stopRecording();
      createRecording(blob);
      setIsRecording(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const renderButtons = () => {
    return (
      <div className="recorder-buttons">
        <div onClick={onRecord} className="recorder-btn">
          {isRecording ? 'Stop' : 'Record'}
        </div>
      </div>
    );
  };

  const renderDisplay = () => {
    let display = '';
    if (readyToSave && recordings.combinedRecording) {
      const url = URL.createObjectURL(recordings.combinedRecording);
      display = <audio controls src={url} />;
    } else if (isRecording) {
      display = <Timer isRecording={isRecording} />;
    }
    return <div className="playhead-container">{display}</div>;
  };

  const renderList = () => {
    if (recordings.recordingList && !readyToSave) {
      return recordings.recordingList.map((item, index) => {
        if (!item) {
          return <div key={index}>{`${index + 1}: ${item}`}</div>;
        }
        const url = greenhouse.defaults.baseURL + `/recordings/${item}`;
        return (
          <div key={item} className={`recording-list-item`}>
            {`${index + 1}: `}
            <audio
              src={url}
              controls
              onClick={(e) => e.preventDefault()}
              className="small-audio-player"
            />
            <DeleteButton
              onSubmit={() => {
                deleteRecording(item);
                setReadyToSave(false);
              }}
              displayName={`recording ${index + 1}`}
            />
          </div>
        );
      });
    }
  };

  const onCreateBounce = () => {
    clearRecordings();
    setReadyToSave(false);
  };

  const renderAddRecording = () => {
    if (!readyToSave) {
      return (
        <button
          onClick={() => {
            combineRecordings();
            setReadyToSave(true);
          }}
          className="submit-button submit-button-centered"
        >
          Save Combined Recording
        </button>
      );
    } else {
      return (
        <AddRecording
          recording={recordings.combinedRecording}
          onSuccess={onCreateBounce}
        />
      );
    }
  };

  return (
    <div className={isRecording ? 'recorder recording' : 'recorder'}>
      {error}
      {renderDisplay()}
      {renderButtons()}
      <DeviceControl
        inputSource={inputSource}
        setInputSource={setInputSource}
        isRecording={isRecording}
      />
      <div className="recording-list">
        {renderList()}
        {renderAddRecording()}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    recordings: state.recordings,
    currentBand: state.bands.currentBand,
  };
};

export default connect(mapStateToProps, {
  createRecording,
  fetchRecording,
  clearRecordings,
  deleteRecording,
  combineRecordings,
  fetchBand,
})(Recorder);
