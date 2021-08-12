import React from 'react';
import { connect } from 'react-redux';
import { playAudio, pauseAudio, nextSong } from '../actions';


class AudioHeader extends React.Component {


    state = { volume: 50, sliderPosition: 0 };

    formatTime(time) {

        let minutes = time < 600 ? `0${Math.floor(time/60)}` : Math.floor(time/60);
        let seconds = time % 60 < 10 ? `0${Math.floor(time % 60)}` : Math.floor(time % 60);
        return `${minutes}:${seconds}`;
    }

    wrapUrl(id) {
        return `http://localhost:3001/audio/${id}.mp3`
    }



    updateSlider = () => {
        const position = (this.audio.currentTime / this.audio.duration) * 1000;
        this.time = this.formatTime(this.audio.currentTime);
        if (!isNaN(position)) {
            this.setState({
                sliderPosition: position
            });
        }
    }

    componentDidMount() {

        // if there's no audio element created, create one with the current song
        // add event listener to link the slider position to the time of the song


        
        this.audio = new Audio();
        this.audio.addEventListener('timeupdate', this.updateSlider);

        // if there's a queue, load next song

        this.audio.addEventListener('ended', this.nextSong);
        
    }

    componentDidUpdate(prevProps) {
        
        if (this.props.song) {
            // if the current song is changed to something other than what is already loaded, change the src url and play the audio
                        // if redux gets a signal to play, play if not already
            // reverse for pause
            if (this.props.song !== prevProps.song) {
                this.audio.src=this.wrapUrl(this.props.song.audio);
                this.audio.play();
            } else if (this.props.play && prevProps.pause) {
                this.audio.play();
            } else if (this.props.pause && prevProps.play) {
                this.audio.pause();
            } 
        }
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

    // componentWillUnmount() {
    //     if (this.audio) {
    //         this.audio.removeEventListener('timeupdate', () => {
    //             const position = (this.audio.currentTime / this.audio.duration) * 1000;
    //                 this.time = this.formatTime(this.audio.currentTime);
    //                 if (!isNaN(position)) {
    //                     this.setState({
    //                         sliderPosition: position
    //                     });
    //                 }
    //             });
    //         this.audio.addEventListener('ended', () => {
    //             if (this.props.queue.length) {
    //                 this.nextSong();
    //             }
    //         });
    //     }
    //   }

    onSliderChange = (e) => {

        const position = (e.target.value / 1000) * this.audio.duration;
        this.audio.currentTime = position;

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
                        <p className="playbar-title">
                            {this.props.song.title}
                        </p>
                        <div className="pause-container" onClick={this.onPauseButton}>
                            <img src={this.props.play ? "/images/pause.svg" : "/images/play.svg"} />
                        </div>
                        <div className="playbar-info">
                            <p>
                                {this.props.song.version}
                            </p>
                            <p>
                                {this.props.song.date}
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
        queue: state.audio.queue
    };
};

export default connect(mapStateToProps, { playAudio, pauseAudio, nextSong })(AudioHeader);