import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { fetchBand } from '../actions';
import AuthControl from './AuthControl';
import BodyContainer from './BodyContainer';
import AudioHeader from './AudioHeader';

const BandHeader = ({ fetchBand, band, match }) => {

    useEffect(() => {
        fetchBand(match.params.bandName);
    }, []);

    return <>
        <AudioHeader />
        <div className="marqee header">
            <div className="band-name">
                <h1>{band && band.name}</h1>
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
                <input type="range" min="0" max="100" className="master-volume" />
            </div>
        </div>
        {band && <BodyContainer band={band}/>}

    </>;

};

const mapStateToProps = state => {
    return {
        band: state.bands.currentBand
    }
}

export default connect(mapStateToProps, { fetchBand })(BandHeader);