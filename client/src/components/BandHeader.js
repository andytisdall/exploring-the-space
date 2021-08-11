import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { fetchBand } from '../actions';
import BodyContainer from './BodyContainer';
import AudioHeader from './AudioHeader';
import requireAuth from './requireAuth';

const BandHeader = ({ fetchBand, band, match, authorized, handleUpdate }) => {

    useEffect(() => {
        fetchBand(match.params.bandName);
    }, []);

    useEffect(() => {
        handleUpdate();
    }, [band]);

    const renderAdmin = () => {
        return (
            <div className="menu-button">
                <img src="images/dots.png" />
                <div className="menu">
                    <Link to="/signout">Sign Out</Link>
                </div>
            </div>
        );
    }

    return <>
        
        <AudioHeader />
        <div className="marqee header">
            <div className="band-name">
                <h1>{band && band.name}</h1>
                {authorized && renderAdmin()}
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

export default connect(mapStateToProps, { fetchBand })(requireAuth(BandHeader));