import React from 'react';

const BodyContainer = props => {
    const renderTiers = () => {
        return state.tiers.map(tier => {
            return (
                <Tier />
            );
        });
    };

    const renderPlaylists = () => {
        return playlists.map(playlist => {
            return (
                <Playlist />
            )
        })
    };

    return (
        <>
            <hr />
            {renderTiers()}
            <div className="playlists">
                <h2>Playlists</h2>
                <hr />
                {renderPlaylists()}
            </div>
        </>


    );

};

export default BodyContainer;