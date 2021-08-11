import React from 'react';
import { connect } from 'react-redux';
import { playAudio, pauseAudio } from '../actions';


class AudioHeader extends React.Component {


    state = { isPlaying: false, volume: 50, sliderPosition: 0 };

    formatTime(time) {

        let minutes = time < 600 ? `0${Math.floor(time/60)}` : Math.floor(time/60);
        let seconds = time % 60 < 10 ? `0${Math.floor(time % 60)}` : Math.floor(time % 60);
        return `${minutes}:${seconds}`;
    }

    wrapUrl(id) {
        return `http://localhost:3001/audio/${id}.mp3`
    }

    nextSong = () => {
        this.currentSong = this.props.queue.shift();
        this.audio.src=this.wrapUrl(this.currentSong.audio);
        this.audio.play();
    }


    componentDidUpdate() {
        
        // if there's no audio element created, create one with the current song
        // add event listener to link the slider position to the time of the song

        if (this.props.song && !this.audio) {
            this.currentSong = this.props.song;
            this.audio = new Audio(this.wrapUrl(this.currentSong.audio));
            this.audio.addEventListener('timeupdate', () => {
                const position = (this.audio.currentTime / this.audio.duration) * 1000;
                this.time = this.formatTime(this.audio.currentTime);
                if (!isNaN(position)) {
                    this.setState({
                        sliderPosition: position
                    });
                }
            });

            // if there's a queue, load next song

            this.audio.addEventListener('ended', () => {
                if (this.props.queue.length) {
                    this.nextSong();
                }
            });
        }

        // if redux gets a signal to play, play if not already

        if (this.props.play && !this.state.isPlaying) {
            this.play();
        }
        if (this.props.pause && this.state.isPlaying) {
            this.pause();
        }

        // if the current song is changed to something other than what is already loaded, change the src url and play the audio
        if (this.wrapUrl(this.props.song.audio) !== this.audio.src) {
            this.currentSong = this.props.song
            this.audio.src=this.wrapUrl(this.currentSong.audio);
            this.audio.play();
        }
    }

    play = () => {
        this.audio.play();
        this.props.playAudio();
        this.setState({ isPlaying: true }); 
    }

    pause = () => {
        this.audio.pause();
        this.props.pauseAudio();
        this.setState({ isPlaying: false });
    }

    componentWillUnmount() {
        if (this.audio) {
            this.audio.removeEventListener('timeupdate', () => {
                const position = (this.audio.currentTime / this.audio.duration) * 1000;
                    this.time = this.formatTime(this.audio.currentTime);
                    if (!isNaN(position)) {
                        this.setState({
                            sliderPosition: position
                        });
                    }
                });
            this.audio.addEventListener('ended', () => {
                if (this.props.queue.length) {
                    this.nextSong();
                }
            });
        }
      }

    onSliderChange = (e) => {

        const position = (e.target.value / 1000) * this.audio.duration;
        this.audio.currentTime = position;

    }

    onPauseButton = () => {

        if (this.state.isPlaying) {
            this.pause();
        } else {
            this.play();
        }

    }

    render() {

        if (this.currentSong) {

            return (


                <div className="playbar">
                    <div className="playbar-header">
                        <p className="playbar-title">
                            {this.currentSong.title}
                        </p>
                        <div className="pause-container" onClick={this.onPauseButton}>
                            <img src={this.state.isPlaying ? "/images/pause.svg" : "/images/play.svg"} />
                        </div>
                        <div className="playbar-info">
                            <p>
                                {this.currentSong.version}
                            </p>
                            <p>
                                {this.currentSong.date}
                            </p>
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
                            onChange={this.onSliderChange}
                        />
                        <div className="playslidertime">
                            {this.formatTime(this.currentSong.duration)}
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
        queue: state.audio.queue
    };
};

export default connect(mapStateToProps, { playAudio, pauseAudio })(AudioHeader);