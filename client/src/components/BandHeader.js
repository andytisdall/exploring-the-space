import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { fetchBand, signOut } from '../actions';
import BodyContainer from './BodyContainer';
import AudioHeader from './AudioHeader';
import requireAuth from './requireAuth';

const BandHeader = ({ fetchBand, band, match, authorized, handleUpdate, user, signedIn, signOut }) => {

    useEffect(() => {
        fetchBand(match.params.bandName);
    }, []);

    useEffect(() => {
        handleUpdate();
    }, [band, user]);

    const renderAdmin = () => {
        return (
            <div className="menu-button">
                <img src="images/dots.png" />
                <div className="menu">
                    <div onClick={signOut}>Sign Out</div>
                </div>
            </div>
        );
    }

    const showBody = () => {
        if (!band) {
            return null
        }
        if (signedIn && !user) {
            return null
        }
        return <BodyContainer band={band}/>
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
        {showBody()}

    </>;

};

const mapStateToProps = state => {
    return {
        band: state.bands.currentBand,
        user: state.auth.currentUser,
        signedIn: state.auth.isSignedIn
    }
}

export default connect(mapStateToProps, { fetchBand, signOut })(requireAuth(BandHeader));