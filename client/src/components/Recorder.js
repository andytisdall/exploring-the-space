import React, { useEffect, useRef, useState } from 'react';
import vmsg from '../vmsg';
import { connect } from 'react-redux';

import { clearRecordings, createRecording, fetchRecording } from '../actions';
import AddRecording from './AddRecording';
import Timer from './Timer';
import DeviceControl from './DeviceControl';

const Recorder = ({ recordings, createRecording, fetchRecording }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audio, setAudio] = useState();
  const [inputSource, setInputSource] = useState();
  const [error, setError] = useState('');

  const mediaRecorder = useRef();

  useEffect(() => {
    // Initialize vmsg recorder
    mediaRecorder.current = new vmsg.Recorder({
      wasmURL: 'https://unpkg.com/vmsg@0.4.0/vmsg.wasm',
    });

    const recordingList = JSON.parse(localStorage.getItem('recording-list'));
    if (recordingList) {
      recordingList.forEach((id, index) => {
        fetchRecording(id, index);
      });
    }
  }, []);

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
    } catch (err) {
      setError(err.message);
    }
  };

  const stopRecording = async () => {
    try {
      const blob = await mediaRecorder.current.stopRecording();
      createRecording(blob);
      setAudio(blob);
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
    if (audio && !isRecording) {
      const url = URL.createObjectURL(audio);
      display = <audio controls src={url} />;
    } else if (isRecording) {
      display = <Timer isRecording={isRecording} />;
    }
    return <div className="playhead-container">{display}</div>;
  };

  const renderList = () => {
    if (recordings) {
      return recordings.map((item, index) => {
        if (!item) {
          return <div key={index}>{`${index + 1}: ${item}`}</div>;
        }
        const selectedRecording = audio === item ? 'selected-recording' : '';
        const url = URL.createObjectURL(item);
        return (
          <div
            onClick={() => setAudio(item)}
            key={item.size}
            className={`recording-list-item ${selectedRecording}`}
          >
            {`${index + 1}: `}
            <audio
              src={url}
              controls
              onClick={(e) => e.preventDefault()}
              className="small-audio-player"
            />
          </div>
        );
      });
    }
  };

  const onCreateBounce = () => {
    clearRecordings();
    setAudio(null);
  };

  const renderAddRecording = () => {
    const consolidatedBlob = recordings.length
      ? new Blob(recordings, { type: 'audio/mpeg' })
      : null;
    return (
      <AddRecording recording={consolidatedBlob} onSuccess={onCreateBounce} />
    );
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
  };
};

export default connect(mapStateToProps, { createRecording, fetchRecording })(
  Recorder
);
