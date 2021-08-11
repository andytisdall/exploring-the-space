import React, { useEffect, useState, version } from 'react';
import { connect } from 'react-redux';

import Version from './Version';
import AddButton from './AddButton';
import { fetchVersions, fetchBounces, fetchPlaylists } from '../actions';
import PlayContainer from './PlayContainer';
import requireAuth from './requireAuth';

const Title = ({ tier, title, fetchVersions, versions, bounces, fetchBounces, authorized, band, playlists, fetchPlaylists }) => {

    const [expand, setExpand] = useState(false);

    const arrow = expand ? 'down' : 'right';

    useEffect(() => {
        fetchVersions(title.id);
        // fetchPlaylists(band.id);
    }, []);

    const versionList = title.versions.map(id => versions[id]);

    const currentVersion = versionList[0] ? versionList.find(v => v.current) : null;

    useEffect(() => {
        if (currentVersion) {
            fetchBounces(currentVersion.id);
        }
    }, [currentVersion]);

    const bounceList = currentVersion ? currentVersion.bounces.map(id => bounces[id]) : null;

    let currentBounce;

    if (bounceList && bounceList[0]) {

        currentBounce = bounceList.find(b => b.latest);
    
    }

    const renderPlayContainer = () => {

        if (currentVersion && currentBounce) {
            return <PlayContainer song={{
                tier,
                title,
                version: currentVersion,
                bounce: currentBounce
            }} />;
        }
    }

    const renderVersion = () => {
   
        return (
            <Version versions={versionList} />
        )
    }

    const onAddToPlaylist = () => {
        return null;
    }

    const renderButtons = () => {
        return null;
        if (authorized) {
            const bandPlaylists = band.playlists.map(id => playlists[id]);
            const playlistOptions = bandPlaylists.map(pl => {
                if (pl) {
                    return { value: pl.id, display: pl.name};
                }
            });
            return (
                <div className='tier-display'>
                    <AddButton
                        title="Add to a Playlist"
                        onSubmit={onAddToPlaylist}
                        image="image/playlist.png"
                        fields={[
                            {
                                type: 'select',
                                options: playlistOptions,
                                name: 'playlistId',
                                label: 'Playlist'
                            }
                        ]}
                    />
                    {/* <AddButton title={`Edit ${title.title}`}
                        onSubmit={onEditSubmit}
                    /> */}
                </div>
            )
        }
    }

    return (
        <div className="title-margin">
            <div className="row title">
                <div className="marqee">
                    <div className="row-name"  onClick={() => setExpand(!expand)} >
                        <img className="arrow" src={`/images/${arrow}-arrow.svg`} />
                        <div className="name-spot">
                            <h3>{title.title}</h3>
                        </div>
                    </div>
                    {renderPlayContainer()}
                    {renderButtons()}
                    {/* {download} */}
                </div>
            </div>
            {expand && renderVersion()}
        </div>
    );
};

const mapStateToProps = state => {
    return {
        versions: state.versions,
        bounces: state.bounces,
        band: state.bands.currentBand,
        playlists: state.playlists
    }
}

export default connect(mapStateToProps, { fetchVersions, fetchBounces })(requireAuth(Title));