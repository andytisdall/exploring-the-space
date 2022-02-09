import React, { useEffect, useRef, useState } from 'react';
import vmsg from 'vmsg';

const Recorder = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorder = useRef();
  const audio = useRef();

  useEffect(async () => {
    mediaRecorder.current = new vmsg.Recorder({
      wasmURL: 'https://unpkg.com/vmsg@0.3.0/vmsg.wasm',
    });
  }, []);

  const onRecord = async () => {
    setIsLoading(true);

    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        await mediaRecorder.current.initAudio();
        await mediaRecorder.current.initWorker();
        mediaRecorder.current.startRecording();
        setIsLoading(false);
        setIsRecording(true);
      } catch (e) {
        console.error(e);
        setIsLoading(false);
      }
    }
  };

  const onStop = async () => {
    if (isRecording) {
      const blob = await mediaRecorder.current.stopRecording();
      setIsLoading(false);
      setIsRecording(false);
      audio.current.src = URL.createObjectURL(blob);
    }
  };

  return (
    <div className="recorder">
      <div className="recorder-buttons">
        <div onClick={onRecord} className="recorder-btn">
          Record
        </div>
        <div onClick={onStop} className="recorder-btn">
          Stop
        </div>
      </div>
      <div className="recorder-player">
        <audio controls ref={audio} />
      </div>
    </div>
  );
};

export default Recorder;
