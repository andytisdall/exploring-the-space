import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import audioEncoder from 'audio-encoder';
import { Lame } from 'node-lame';
import encoder from 'base64-arraybuffer';

import Playhead from './Playhead';
import greenhouse from '../apis/greenhouse';

const Editor = () => {
  const location = useLocation();
  const [audio, setAudio] = useState();
  const [src, setSrc] = useState();

  useEffect(async () => {
    const { bounce } = location.state;
    const response = await greenhouse.get(`/audio/edit/${bounce.id}`);
    // audioEncoder(response.data, 32, null, (blob) => {
    //   setAudio(blob);
    // });
    // const file = new File(response.data, 'file.mp3', {
    //   type: 'audio/mpeg',
    //   lastModified: Date(),
    // });
    // const ctx = new AudioContext();
    // ctx.decodeAudioData(response.data, (data) => {
    //   setAudio(data);
    // });
    // const blob = new Blob(response.data, { type: 'audio/mpeg' });
    // const url = URL.createObjectURL(blob);
    // console.log(response.data);
    const srcString = 'data:audio/wav;base64,' + response.data;
    setSrc(srcString);
    // setAudio(file);
    // const url = URL.createObjectURL(blob);
    // setSrc(url);
    // console.log(file);
    // setAudio(file);
    // const encoder = new Lame({
    //   output: 'buffer',
    //   bitrate: 192,
    // }).setBuffer(blob);

    // encoder
    //   .encode()
    //   .then(() => {
    //     // Encoding finished
    //     setSrc(encoder.getBuffer());
    //   })
    //   .catch((error) => {
    //     // Something went wrong
    //   });
  }, []);

  const setFile = (e) => {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setSrc(url);
    setAudio(file);
  };

  return (
    <div>
      <audio controls src={src} />
      <input type="file" onChange={setFile} />
      {audio && <Playhead audio={audio} isRecording={false} />}
    </div>
  );
};

export default Editor;
