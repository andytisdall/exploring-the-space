import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { fetchBand, signOut, changeVolume } from '../actions';
import BodyContainer from './BodyContainer';
import AudioHeader from './AudioHeader';
import requireAuth from './requireAuth';

const BandHeader = ({ fetchBand, band, match, authorized, handleUpdate, user, signedIn, signOut, volume, changeVolume }) => {

    const [expand, setExpand] = useState(false);
    const menu = useRef(null);

    useEffect(() => {
        fetchBand(match.params.bandName);
        document.addEventListener('click', clickToDismiss, { capture: true });
        return () => {
            document.removeEventListener('click', clickToDismiss, { capture: true });
        };
    }, []);

    useEffect(() => {
        handleUpdate();
    }, [band, user]);

    const clickToDismiss = (e) => {
        if (menu.current && menu.current.contains(e.target)) {
            return;
        }
        setExpand(false);
        
    };

    const renderAdmin = () => {
        return (
            <div className="menu">
                <Link className="menu-item" to="/user">User Home</Link>
                <Link className="menu-item" to="/help">Help</Link>
                <div className="menu-item" onClick={signOut}>Sign Out</div>
            </div>
        );
    };

    const renderHomeLink = () => {
        return (
            <div className="menu">
                <Link className="menu-item" to="/">Home</Link>
                <Link className="menu-item" to="/help">Help</Link>
                <Link className="menu-item" to="/signin">Sign In</Link>
            </div>
        );
    };

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
        
        <div className="header">
            <AudioHeader />
            <div className="band-header">
                <div className="band-name">
                    <h1>{band && band.name}</h1>
                    <div className="menu-button" ref={menu} onClick={() => setExpand(!expand)}>
                        <img src="images/dots.png" />
                        {expand && (authorized ? renderAdmin() : renderHomeLink())}
                    </div>
                </div>
                <div className="slidecontainer">
                    <input
                        type="range"
                        min="0" max="100"
                        className="master-volume"
                        value={volume}
                        onInput={e => changeVolume(e.target.value)}
                    />
                    <img src="/images/volume.svg" />
                </div>
            </div>
        </div>

        {showBody()}

    </>;

};

const mapStateToProps = state => {
    return {
        band: state.bands.currentBand,
        user: state.auth.currentUser,
        signedIn: state.auth.isSignedIn,
        volume: state.audio.volume
    }
}

export default connect(mapStateToProps, { fetchBand, signOut, changeVolume })(requireAuth(BandHeader));