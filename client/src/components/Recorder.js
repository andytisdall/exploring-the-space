import React, { useEffect, useRef, useState } from 'react';
// import vmsg from 'vmsg';
import WebAudioRecorder from '../web-audio-recorder/WebAudioRecorder';

import Playhead from './Playhead';
import Timer from './Timer';
import DeviceControl from './DeviceControl';
import AddRecording from './AddRecording';
import _ from 'lodash';

const Recorder = ({ match }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audio, setAudio] = useState();
  const [inputSource, setInputSource] = useState();
  const [error, setError] = useState('');

  const mediaRecorder = useRef();
  const audioContext = useRef(new AudioContext());
  const chunks = useRef([]);

  useEffect(async () => {
    // if (inputSource) {
    //   const constraints = {
    //     audio: {
    //       deviceId: inputSource.deviceId,
    //     },
    //   };
    //   const stream = await navigator.mediaDevices.getUserMedia(constraints);

    //   mediaRecorder.current = new MediaRecorder(stream);
    //   mediaRecorder.current.ondataavailable = (e) => {
    //     chunks.current.push(e.data);
    //   };
    //   mediaRecorder.current.onstop = (e) => {
    //     const blob = new Blob(chunks.current, {
    //       type: 'audio/ogg; codecs=opus',
    //     });
    //     setAudio(blob);
    //     chunks.current = [];
    //   };
    // }

    // navigator.serviceWorker.register(
    //   process.env.PUBLIC_URL + '/web-audio-recorder/WebAudioRecorderMp3.js'
    // );
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
      // node.disconnect(audioContext.current.destination);
      mediaRecorder.current = new WebAudioRecorder(node, {
        workerDir: process.env.PUBLIC_URL + '/web-audio-recorder/',
        encoding: 'mp3',
        options: {
          timeLimit: 18000,
        },
        encodeAfterRecord: false,
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
        // const stream = await navigator.mediaDevices.getUserMedia(constraints);

        // var mediaRecorder = new MediaRecorder(stream);
        // mediaRecorder.current.start();
        // mediaRecorder.current.startRecording();
        // await mediaRecorder.current.initAudio();
        // await mediaRecorder.current.initWorker();
        mediaRecorder.current.startRecording();
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
      // mediaRecorder.current.stop();
      setIsRecording(false);
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

  const onCapture = (e) => {
    const file = e.target.files[0];
    setAudio(file);
  };

  return (
    <div className={isRecording ? 'recorder recording' : 'recorder'}>
      <div>{error}</div>
      <div className="playhead-container">
        {audio && !isRecording && (
          <Playhead
            audio={audio}
            isRecording={isRecording}
            audioContext={audioContext.current}
          />
        )}
      </div>
      {/* <input type="file" accept="audio/*" capture onChange={onCapture} /> */}
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
