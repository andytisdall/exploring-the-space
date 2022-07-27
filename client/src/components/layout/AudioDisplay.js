import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import {
  playAudio,
  pauseAudio,
  nextSong,
  prevSong,
  throwError,
  initializeAudio,
} from '../../actions';

class AudioDisplay extends React.Component {
  constructor(props) {
    super(props);
    if (process.env.NODE_ENV === 'production') {
      this.url = 'https://exploring-the-space.com';
    } else {
      this.url = 'http://localhost:3001';
    }
    this.audio = React.createRef();
  }

  state = { volume: 50, sliderPosition: 0 };

  formatTime(time) {
    let minutes =
      time < 600 ? `0${Math.floor(time / 60)}` : Math.floor(time / 60);
    let seconds =
      time % 60 < 10 ? `0${Math.floor(time % 60)}` : Math.floor(time % 60);
    return `${minutes}:${seconds}`;
  }

  displayDate = (date) => {
    return moment.utc(date).format('MM/DD/yy');
  };

  wrapUrl(id) {
    return `${this.url}/api/audio/${id}.mp3`;
  }

  updateSlider = () => {
    const position =
      (this.audio.current.currentTime / this.audio.current.duration) * 1000;
    this.time = this.formatTime(this.audio.current.currentTime);
    if (!isNaN(position)) {
      this.setState({
        sliderPosition: position,
      });
    }
  };

  setSpaceBarToPlay = (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (this.props.pause) {
        this.play();
      } else {
        this.pause();
      }
    }
  };

  audioError = () => {
    const message =
      "The audio player had an error, probably can't connect to server.";
    this.props.throwError(message);
  };

  componentDidMount() {
    // if there's no audio element created, create one with the current song
    // add event listener to link the slider position to the time of the song

    this.audio.current = new Audio();

    this.audio.current.addEventListener('timeupdate', this.updateSlider);

    this.audio.current.addEventListener('error', this.audioError);

    // load next song at song end

    this.audio.current.addEventListener('ended', this.nextSong);

    // space bar stop/start

    document.addEventListener('keydown', this.setSpaceBarToPlay);

    this.audio.current.addEventListener('loadedmetadata', this.playOnLoad);
  }

  componentDidUpdate(prevProps) {
    // scroll down to compensate for the playbar pushing content down

    if (!this.scrolled) {
      window.scroll(window.scrollX, window.scrollY + 96);
      this.scrolled = true;
    }

    if (this.props.song) {
      // if the current song is changed to something other than what is already loaded, change the src url and play the audio
      // if redux gets a signal to play, play if not already
      // reverse for pause
      if (this.props.song !== prevProps.song) {
        this.audio.current.src = this.wrapUrl(this.props.song.audio);
        this.audio.current.volume = this.props.volume / 100;
        // this.audio.current.play();
      } else if (this.props.play && prevProps.pause) {
        this.audio.current.play();
      } else if (this.props.pause && prevProps.play) {
        this.audio.current.pause();
      }
      if (this.props.volume !== prevProps.volume) {
        this.audio.current.volume = this.props.volume / 100;
      }
    } else {
      this.audio.current.pause();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.setSpaceBarToPlay);

    this.audio.current.src = '';
    this.audio.current.removeEventListener('timeupdate', this.updateSlider);
    this.audio.current.removeEventListener('error', this.audioError);
    this.audio.current.removeEventListener('ended', this.nextSong);
    this.audio.current.removeEventListener('loadedmetadata', this.playOnLoad);

    this.props.initializeAudio();
  }

  playOnLoad = () => {
    if (this.props.play) {
      this.audio.current.play();
    }
  };

  prevSong = () => {
    if (this.audio.current.currentTime < 1) {
      this.props.prevSong();
    } else {
      this.audio.current.currentTime = 0;
    }
  };

  nextSong = () => {
    this.props.nextSong();
  };

  play = () => {
    this.props.playAudio();
  };

  pause = () => {
    this.props.pauseAudio();
  };

  onSliderChange = (e) => {
    const position = (e.target.value / 1000) * this.audio.current.duration;
    this.audio.current.currentTime = position;
  };

  onPauseButton = () => {
    if (this.props.play) {
      this.pause();
    } else {
      this.play();
    }
  };

  render() {
    if (this.props.song) {
      return (
        <div className="playbar">
          <div className="playbar-header">
            <div className="playbar-title">
              <p>{this.props.song.title}</p>
            </div>
            <div className="big-play-container">
              <img
                src="/images/prev.svg"
                className="audio-controls"
                onClick={this.prevSong}
                alt="previous song"
              />
              <img
                className="big-play-btn"
                src={this.props.play ? '/images/pause.svg' : '/images/play.svg'}
                onClick={this.onPauseButton}
                alt="main play button"
              />
              <img
                src="/images/next.svg"
                className="audio-controls"
                onClick={this.nextSong}
                alt="next song"
              />
            </div>

            <div className="playbar-info">
              <div className="playbar-info-detail">
                <p>Version:</p>
                <p>{this.props.song.version}</p>
              </div>
              <div className="playbar-info-detail">
                <p>Date:</p>
                <p>{this.displayDate(this.props.song.date)}</p>
              </div>
            </div>
          </div>
          <div className="playslider-container">
            <div className="playslider-time">{this.time}</div>
            <input
              type="range"
              min="0"
              max="1000"
              value={this.state.sliderPosition}
              className="playslider"
              onInput={this.onSliderChange}
            />
            <div className="playslider-time">
              {this.formatTime(this.props.song.duration)}
            </div>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}

const mapStateToProps = (state) => {
  return {
    song: state.audio.currentSong,
    play: state.audio.play,
    pause: state.audio.pause,
    volume: state.audio.volume,
  };
};

export default connect(mapStateToProps, {
  playAudio,
  pauseAudio,
  nextSong,
  prevSong,
  throwError,
  initializeAudio,
})(AudioDisplay);
