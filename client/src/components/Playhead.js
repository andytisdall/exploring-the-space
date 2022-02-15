import React, { useState, useEffect, useRef } from 'react';

import Waveform from './Waveform';

const Playhead = ({ audio, isRecording }) => {
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editedAudio, setEditedAudio] = useState(audio);
  const [zoomIn, setZoomIn] = useState(false);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(1000);

  const player = useRef();

  useEffect(() => {
    player.current = new Audio();
    player.current.onended = () => {
      setIsPlaying(false);
    };
    player.current.onplay = () => {
      setIsPlaying(true);
    };
    player.current.onpause = () => {
      setIsPlaying(false);
    };
    player.current.ontimeupdate = updateSlider;
    return () => {
      player.current.ontimeupdate = null;
      player.current.onended = null;
      player.current.onplay = null;
      player.current.onpause = null;
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      setIsPlaying(false);
      if (player.current && !player.current.paused) {
        player.current.pause();
      }
    }
  }, [isRecording]);

  useEffect(() => {
    if (editedAudio) {
      const url = URL.createObjectURL(editedAudio);
      player.current.src = url;
    }
  }, [editedAudio]);

  const renderPlayButton = () => {
    if (!isRecording && audio && !isPlaying) {
      return (
        <img
          src="/images/play.svg"
          className="play-icon"
          onClick={() => player.current.play()}
        />
      );
    } else if (!isRecording && audio) {
      return (
        <img
          src="/images/pause.svg"
          className="play-icon"
          onClick={() => player.current.pause()}
        />
      );
    }
  };

  useEffect(() => {
    const blobStart = audio.size * (start * 0.001);
    const blobEnd = audio.size * (end * 0.001);
    if (zoomIn) {
      const edited = audio.slice(blobStart, blobEnd, audio.type);
      setEditedAudio(edited);
    } else {
      setEditedAudio(audio);
    }
  }, [zoomIn]);

  const updateSlider = () => {
    const position =
      (player.current.currentTime / player.current.duration) * 1000;
    if (!isNaN(position)) {
      setPlayheadPosition(position);
    }
  };

  const onSliderChange = (e) => {
    const position = (e.target.value / 1000) * player.current.duration;
    if (!isNaN(position)) {
      player.current.currentTime = position;
    }
  };

  const formatTime = (time) => {
    let minutes =
      time < 600 ? `0${Math.floor(time / 60)}` : Math.floor(time / 60);
    let seconds =
      time % 60 < 10 ? `0${Math.floor(time % 60)}` : Math.floor(time % 60);
    return `${minutes}:${seconds}`;
  };

  const renderAudioTime = () => {
    if (player.current) {
      return formatTime(player.current.currentTime);
    }
  };

  const onStartClick = () => {
    const start = playheadPosition;
    if (start < end) {
      setStart(start);
    }
  };

  const onEndClick = () => {
    const end = playheadPosition;
    if (end > start) {
      setEnd(end);
    }
  };

  const renderEditor = () => {
    return (
      <div className="editor-controls">
        <div onClick={onStartClick} className="editor-btn">
          Set start
        </div>
        <div onClick={onEndClick} className="editor-btn">
          Set end
        </div>
        <div>
          <input
            type="checkbox"
            onChange={() => setZoomIn(!zoomIn)}
            value={zoomIn}
          />
          <label>Zoom</label>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="playhead-controls">
        <div className="audio-controls">
          {renderPlayButton()}
          {renderAudioTime()}
        </div>
        {renderEditor()}
      </div>

      <div className="waveform-display">
        <Waveform audio={editedAudio} isRecording={isRecording} />
        {!zoomIn && (
          <input
            type="range"
            min="0"
            max="1000"
            value={start}
            className="playhead start-line"
            readOnly
          />
        )}
        {!zoomIn && (
          <input
            type="range"
            min="0"
            max="1000"
            value={end}
            className="playhead end-line"
            readOnly
          />
        )}
        <input
          type="range"
          min="0"
          max="1000"
          value={playheadPosition}
          className="playhead"
          onInput={onSliderChange}
        />
      </div>
    </>
  );
};

export default Playhead;
