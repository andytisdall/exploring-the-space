import React from 'react';

const BandHeader = props => {

    return (

        <div className="marqee header">
            <div className="band-name">
                <h1>{props.band.name}</h1>
                <AuthControl>
                    <div className="menu-button">
                        <img src="dots.png" />
                        <div className="menu">
                            <a href="/signout">Sign Out</a>
                        </div>
                    </div>
                </AuthControl>
            </div>
            <div className="slidecontainer">
                <input type="range" min="0" max="100" value="50" class="master-volume" id="mastervol" />
            </div>
        </div>

    );

};

export default BandHeader;