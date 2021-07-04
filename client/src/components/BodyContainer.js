import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchTiers, fetchPlaylists } from '../actions';
import Tier from './Tier';
import Playlist from './Playlist';
import AddButton from './AddButton';

const BodyContainer = ({ props }) => {

    useEffect(() => {
        props.fetchTiers();
        props.fetchPlaylists();
    })


    const renderTiers = () => {
        return props.tiers.map(tier => {
            return (
                <Tier 
                    tier={tier}
                />
            );
        });
    };

    const renderPlaylists = () => {
        return props.playlists.map(playlist => {
            return (
                // <Playlist />
                <p>This is a Playlist</p>
            )
        })
    };

    return (
        <>
            <hr />
            {renderTiers()}
            <AddButton />
            <div className="playlists">
                <h2>Playlists</h2>
                <hr />
                {renderPlaylists()}
            </div>
        </>


    );

};

const mapStateToProps = state => {
    return {
        tiers: Object.values(state.tiers),
        playlists: Object.values(state.playlists)
    };
};

export default connect(mapStateToProps, { fetchTiers, fetchPlaylists })(BodyContainer);