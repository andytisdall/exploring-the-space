import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { decode } from 'base64-arraybuffer';

import Playhead from './Playhead';
import greenhouse from '../../apis/greenhouse';
import AddRecording from './AddRecording';

const Editor = () => {
  const location = useLocation();

  const [audio, setAudio] = useState();
  const [songList, setSongList] = useState([]);

  useEffect(async () => {
    const { bounce } = location.state;
    const response = await greenhouse.get(`/audio/edit/${bounce.id}`);
    const decoded = decode(response.data);
    const arrayBuffer = new Uint8Array(decoded);
    const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
    setAudio(blob);
  }, []);

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

  const addToSongList = (song) => {
    setSongList([...songList, song]);
  };

  const renderSongList = () => {
    return songList.map((song, index) => {
      const url = URL.createObjectURL(song);
      return (
        <div className="recording-section-item" key={song.size}>
          <h2>{index + 1}: </h2>
          <audio controls src={url} />
          <AddRecording recording={song} />
        </div>
      );
    });
  };

  return (
    <div className="editor">
      {renderDetails()}
      {audio && (
        <Playhead
          audio={audio}
          isRecording={false}
          addToSongList={addToSongList}
        />
      )}
      {renderSongList()}
    </div>
  );
};

export default Editor;
