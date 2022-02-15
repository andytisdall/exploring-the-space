import React, { useState, useEffect, useRef } from 'react';

import Waveform from './Waveform';

const Playhead = ({ audio, isRecording }) => {
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [half, setHalf] = useState(false);

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
    if (audio) {
      let source = audio;
      if (half) {
        source = audio.slice(0, audio.size / 2, audio.type);
      }
      const url = URL.createObjectURL(source);
      player.current.src = url;
    }
  }, [audio, half]);

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

  return (
    <>
      <div className="audio-controls">
        {renderPlayButton()}
        {renderAudioTime()}
      </div>
      <div onClick={() => setHalf(!half)}>{`Half: ${half}`}</div>
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
    </>
  );
};

export default Playhead;
