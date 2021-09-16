import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import { playAudio, pauseAudio, nextSong, throwError, initializeAudio } from '../actions';


class AudioHeader extends React.Component {

    constructor(props) {
        super(props);
        if (process.env.NODE_ENV === 'production') {
            this.url = 'https://exploring-the-space.com'
        } else {
            this.url = 'http://localhost:3001';
        }
        this.audio = React.createRef();
    }


    state = { volume: 50, sliderPosition: 0 };

    formatTime(time) {

        let minutes = time < 600 ? `0${Math.floor(time/60)}` : Math.floor(time/60);
        let seconds = time % 60 < 10 ? `0${Math.floor(time % 60)}` : Math.floor(time % 60);
        return `${minutes}:${seconds}`;
    }

    displayDate = date => {
        return moment.utc(date).format('MM/DD/yy');
    }

    wrapUrl(id) {
        return `${this.url}/api/audio/${id}.mp3`
    }

    updateSlider = () => {
        const position = (this.audio.current.currentTime / this.audio.current.duration) * 1000;
        this.time = this.formatTime(this.audio.current.currentTime);
        if (!isNaN(position)) {
            this.setState({
                sliderPosition: position
            });
        }
    }

    setSpaceBarToPlay = (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (this.props.pause) {
                this.play();
            } else {
                this.pause();
            }
        }
    }

    audioError = () => {
        const message = "The audio player had an error, probably can't connect to server."
        this.props.throwError(message);
    }

    componentDidMount() {

        // if there's no audio element created, create one with the current song
        // add event listener to link the slider position to the time of the song

        
        this.audio.current = new Audio();

        this.audio.current.addEventListener('timeupdate', this.updateSlider);

        this.audio.current.addEventListener('error', this.audioError);

        // if there's a queue, load next song

        this.audio.current.addEventListener('ended', this.nextSong);

        // space bar stop/start

        document.addEventListener('keydown', this.setSpaceBarToPlay);
        
    }

    componentDidUpdate(prevProps) {
        
        if (this.props.song) {
            // if the current song is changed to something other than what is already loaded, change the src url and play the audio
                        // if redux gets a signal to play, play if not already
            // reverse for pause
            if (this.props.song !== prevProps.song) {
                this.audio.current.src=this.wrapUrl(this.props.song.audio);
                this.audio.current.volume = this.props.volume / 120;
                this.audio.current.play();
            } else if (this.props.play && prevProps.pause) {
                this.audio.current.play();
            } else if (this.props.pause && prevProps.play) {
                this.audio.current.pause();
            }
            if (this.props.volume !== prevProps.volume) {
                this.audio.current.volume = this.props.volume / 120;

            }
        } else {
            this.audio.current.pause();
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.setSpaceBarToPlay);

        this.audio.current.src='';
        this.audio.current.removeEventListener('timeupdate', this.updateSlider);
        this.audio.current.removeEventListener('error', this.audioError);
        this.audio.current.removeEventListener('ended', this.nextSong);

        this.props.initializeAudio();
    }

    nextSong = () => {
        setTimeout(() => {
            if (this.props.queue.length) {
                this.props.nextSong();
            }
        }, 400);
    }

    play = () => {
        this.props.playAudio();
    }

    pause = () => {
        this.props.pauseAudio();
    }

    onSliderChange = (e) => {
        const position = (e.target.value / 1000) * this.audio.current.duration;
        this.audio.current.currentTime = position;
    }

    onPauseButton = () => {

        if (this.props.play) {
            this.pause();
        } else {
            this.play();
        }

    }

    render() {

        if (this.props.song) {

            return (
                <div className="playbar">
                    <div className="playbar-header">
                        <div className="playbar-title">
                            <p>{this.props.song.title}</p>
                        </div>
                        <div className="pause-container" onClick={this.onPauseButton}>
                            <img className="big-play-btn" src={this.props.play ? "/images/pause.svg" : "/images/play.svg"} />
                        </div>
                        <div className="playbar-info">
                            <div className="playbar-detail">
                                <p>Version:</p>
                                <p>{this.props.song.version}</p>
                            </div>
                            <div className="playbar-detail">
                                <p>Date:</p>
                                <p>{this.displayDate(this.props.song.date)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="playslidercontainer">
                        <div className="playslidertime">
                            {this.time}
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1000"
                            value={this.state.sliderPosition}
                            className='playslider'
                            onInput={this.onSliderChange}
                        />
                        <div className="playslidertime">
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

const mapStateToProps = state => {
    return {
        song: state.audio.currentSong,
        play: state.audio.play,
        pause: state.audio.pause,
        queue: state.audio.queue,
        volume: state.audio.volume
    };
};

export default connect(mapStateToProps, { playAudio, pauseAudio, nextSong, throwError, initializeAudio })(AudioHeader);