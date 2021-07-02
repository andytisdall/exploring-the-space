import React from 'react';

const Playbar = props => {

    return (

        <div className="playbar">
            <div className="playbar-header">
                <p className="playbar-title">
                    {props.currentSong.title}
                </p>
                <div className="pause-container">
                    <img src="pause.svg" />
                </div>
                <div className="playbar-info">
                    <p>
                        {props.currentSong.version}
                    </p>
                    <p>
                        {props.currentSong.bounce}
                    </p>
                </div>
            </div>
            <div className="playslidercontainer">
                <div className="playslidertime">

                </div>
                <input type="range" min="0" max="1000" value="0" class='playslider' id="playslider" />
                <div className="playslidertime">

                </div>
            </div>
        </div>

    );


};

export default Playbar;