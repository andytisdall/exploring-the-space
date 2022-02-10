import React, { useState, useEffect, useRef } from 'react';

import Waveform from './Waveform';

const Playhead = ({ audio, isRecording }) => {
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

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
    }
  }, [isRecording]);

  useEffect(() => {
    if (audio) {
      const url = URL.createObjectURL(audio);
      player.current.src = url;
    }
  }, [audio]);

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

  const updateSlider = () => {
    const position =
      (player.current.currentTime / player.current.duration) * 1000;
    if (!isNaN(position)) {
      setPlayheadPosition(position + player.current.duration / 300);
    }
  };

  const onSliderChange = (e) => {
    const position = (e.target.value / 1000) * player.current.duration;
    if (!isNaN(position)) {
      player.current.currentTime = position;
    }
  };

  return (
    <>
      <div className="waveform-display">
        <Waveform audio={audio} isRecording={isRecording} />
        <input
          type="range"
          min="0"
          max="1000"
          value={playheadPosition}
          className="playhead"
          onInput={onSliderChange}
        />
      </div>
      {renderPlayButton()}
    </>
  );
};

export default Playhead;
