import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { fetchBand, signOut, changeVolume } from '../actions';
import Main from './Main';
import AudioDisplay from './AudioDisplay';
import requireAuth from './requireAuth';

const Header = ({ fetchBand, band, match, authorized, handleUpdate, user, signOut, volume, changeVolume }) => {

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

    if (!band) {
        return (
            <div className="no-band">
                <h1>This band does not exist on Exploring the Space, but you can create it.</h1>
                <div className="home-buttons">
                    <Link to="/signin">
                        Sign In
                    </Link>
                    <Link to="/signup">
                        Sign Up
                    </Link>
                    <Link to="/help">
                        What Is It?
                    </Link>
                </div>
            </div>
        );
    }

    return <>
        
        <div className="header">
            <AudioDisplay />
            <div className="band-header">
                <div className="band-name">
                    <h1>{band && band.name}</h1>
                    <div className="menu-button" ref={menu} onClick={() => setExpand(!expand)}>
                        <img src="images/dots.png" />
                        {expand && (authorized ? renderAdmin() : renderHomeLink())}
                    </div>
                </div>
                <div className="volume-container">
                    <input
                        type="range"
                        min="0" max="100"
                        className="volume"
                        value={volume}
                        onInput={e => changeVolume(e.target.value)}
                    />
                    <img src="/images/volume.svg" />
                </div>
            </div>
        </div>

        <Main band={band} />

    </>;

};

const mapStateToProps = state => {
    return {
        band: state.bands.currentBand,
        user: state.auth.currentUser,
        volume: state.audio.volume
    }
}

export default connect(mapStateToProps, { fetchBand, signOut, changeVolume })(requireAuth(Header));