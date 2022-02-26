import React, { useState, useEffect } from 'react';

const Timer = ({ isRecording }) => {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer(timer + 1);
      }, 1000);
    } else {
      clearInterval(interval);
      setTimer(0);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isRecording, timer]);

  const formatTime = (time) => {
    let minutes =
      time < 600 ? `0${Math.floor(time / 60)}` : Math.floor(time / 60);
    let seconds =
      time % 60 < 10 ? `0${Math.floor(time % 60)}` : Math.floor(time % 60);
    return `${minutes}:${seconds}`;
  };

  return <div className="recorder-time">{formatTime(timer)}</div>;
};

export default Timer;
