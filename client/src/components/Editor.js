import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import audioEncoder from 'audio-encoder';
import { Lame } from 'node-lame';
import { decode } from 'base64-arraybuffer';

import Playhead from './Playhead';
import greenhouse from '../apis/greenhouse';

const Editor = () => {
  const location = useLocation();
  const [audio, setAudio] = useState();
  const [src, setSrc] = useState();

  useEffect(async () => {
    const { bounce } = location.state;
    const response = await greenhouse.get(`/audio/edit/${bounce.id}`);
    const decoded = decode(response.data);
    const arrayBuffer = new Uint8Array(decoded);
    const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
    setAudio(blob);
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
    // const srcString = 'data:audio/mpeg;base64,' + response.data;
    // setSrc(srcString);

    // setAudio(srcString);
    // console.log(decoded);

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

  // const setFile = (e) => {
  //   const file = e.target.files[0];
  //   const url = URL.createObjectURL(file);
  //   setSrc(url);
  //   setAudio(file);
  // };

  const renderDetails = () => {
    const { title, version, bounce } = location.state;
    const date = new Date(bounce.date);
    return (
      <div className="editor-title">
        {title.title} {version.name} {date.getMonth()}/{date.getDate()}/
        {date.getFullYear()}
      </div>
    );
  };

  return (
    <div className="editor">
      {/* <audio controls src={src} /> */}
      {/* <input type="file" onChange={setFile} /> */}
      {renderDetails()}
      {audio && <Playhead audio={audio} isRecording={false} />}
    </div>
  );
};

export default Editor;
