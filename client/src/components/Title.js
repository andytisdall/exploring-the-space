import React, { useEffect, useState, version } from 'react';
import { connect } from 'react-redux';

import Version from './Version';
import AddButton from './AddButton';
import { fetchVersions, fetchBounces, fetchPlaylists, selectBounce, selectVersion } from '../actions';
import PlayContainer from './PlayContainer';
import requireAuth from './requireAuth';

const Title = ({ tier, title, fetchVersions, versions, bounces, fetchBounces, authorized, band, playlists, fetchPlaylists, selectVersion, selectBounce }) => {

    const [expand, setExpand] = useState(false);
    const [versionList, setVersionList] = useState([]);
    const [bounceList, setBounceList] = useState([]);
    const [song, setSong] = useState(null);

    const arrow = expand ? 'down' : 'right';

    useEffect(() => {
        fetchVersions(title.id);
        // fetchPlaylists(band.id);
    }, []);

    useEffect(() => {
        if (!versionList[0]) {
            setVersionList(title.versions.map(id => versions[id])); 
        } else if (!bounceList[0] && title.selectedVersion) {
            setBounceList(title.selectedVersion.bounces.map(id => bounces[id]));
        }
    });

    useEffect(() => {
        if (title.selectedVersion) {
            fetchBounces(title.selectedVersion.id);
        } else if (versionList[0]) {
            const currentVersion = versionList.find(v => v.current);
            selectVersion(currentVersion, title);
            fetchBounces(currentVersion.id);
        }
    }, [versionList]);

    useEffect(() => {
        if (!title.selectedBounce && bounceList[0]) {
            selectBounce(bounceList.find(b => b.latest), title);
        }
        if (!song && title.selectedVersion && title.selectedBounce) {
            setSong({
                tier,
                title,
                version: title.selectedVersion,
                bounce: title.selectedBounce
            });
        }
    }, [bounceList]);

    const renderPlayContainer = () => {

        if (song) {
            return <PlayContainer song={song} />;
        }
    }

    const renderVersion = () => {
   
        return (
            <Version versions={versionList} title={title} />
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

export default connect(mapStateToProps, { fetchVersions, fetchBounces, selectVersion, selectBounce })(requireAuth(Title));