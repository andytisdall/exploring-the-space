import React, { useEffect, useRef, useState } from 'react';
// import vmsg from 'vmsg';
import WebAudioRecorder from '../web-audio-recorder/WebAudioRecorder';

import Playhead from './Playhead';
import Timer from './Timer';
import DeviceControl from './DeviceControl';
import AddRecording from './AddRecording';

const Recorder = ({ match }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audio, setAudio] = useState();
  const [inputSource, setInputSource] = useState();
  const [error, setError] = useState('');

  const mediaRecorder = useRef();
  const audioContext = useRef(new AudioContext());

  useEffect(async () => {
    // Initialize vmsg recorder
    // mediaRecorder.current = new vmsg.Recorder({
    //   wasmURL: 'https://unpkg.com/vmsg@0.3.0/vmsg.wasm',
    // });
    if (inputSource) {
      const inputStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: inputSource.deviceId,
        },
      });
      const node = audioContext.current.createMediaStreamSource(inputStream);
      mediaRecorder.current = new WebAudioRecorder(node, {
        workerDir: process.env.PUBLIC_URL + '/web-audio-recorder/',
        encoding: 'mp3',
        options: {
          timeLimit: 18000,
        },
        encodeAfterRecord: true,
        onComplete: (recorder, blob) => {
          console.log(blob);
          setAudio(blob);
          setIsRecording(false);
        },
        onTimeout: (recorder) => {
          const time = recorder.recordingTime();
          setError(`timeout at ${time} seconds`);
        },
        onError: (recorder, message) => {
          setError(message);
        },
        onEncoderLoaded: () => {
          console.log('encoder loaded');
        },
      });
    }
  }, [inputSource]);

  const onRecord = async () => {
    // setError(isLoading);
    // if (!isLoading) {
    // setIsLoading(true);
    if (!isRecording) {
      try {
        mediaRecorder.current.startRecording();
        // await mediaRecorder.current.initAudio();
        // await mediaRecorder.current.initWorker();
        // mediaRecorder.current.startRecording();
        // setIsLoading(false);
        setIsRecording(true);
      } catch (e) {
        console.error(e);
        // setIsLoading(false);
        setError(e.message);
      }
    } else {
      mediaRecorder.current.finishRecording();
      // const blob = await mediaRecorder.current.stopRecording();
      // setAudio(blob);
      // setIsLoading(false);
      // setIsRecording(false);
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

  return (
    <div className={isRecording ? 'recorder recording' : 'recorder'}>
      <div>{error}</div>
      <div className="playhead-container">
        {audio && !isRecording && (
          <Playhead audio={audio} isRecording={isRecording} />
        )}
      </div>

      {renderButtons()}

      <Timer isRecording={isRecording} />

      <DeviceControl
        inputSource={inputSource}
        setInputSource={setInputSource}
      />

      <AddRecording bandName={match.params.bandName} audio={audio} />
    </div>
  );
};

export default Recorder;
