import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Link } from 'react-router-dom';

import Version from '../versions/Version';
import AddButton from '../reusable/AddButton';
import {
  fetchVersions,
  fetchBounces,
  selectBounce,
  selectVersion,
  createPlaylistSong,
  editTitle,
  deleteTitle,
} from '../../actions';
import PlayContainer from './PlayContainer';
import requireAuth from '../reusable/requireAuth';
import DeleteButton from '../reusable/DeleteButton';

const Title = ({
  tier,
  title,
  titles,
  fetchVersions,
  versions,
  bounces,
  fetchBounces,
  authorized,
  band,
  playlists,
  selectVersion,
  selectBounce,
  createPlaylistSong,
  editTitle,
  deleteTitle,
  getTime,
  audio,
  findLatest,
  tiers,
}) => {
  const [expand, setExpand] = useState(false);
  const [versionList, setVersionList] = useState(null);
  const [bounceList, setBounceList] = useState(null);
  const [song, setSong] = useState(null);

  useEffect(() => {
    fetchVersions(title.id);
  }, [fetchVersions, title.id]);

  useEffect(() => {
    setVersionList(title.versions.map((id) => versions[id]));
    // console.log('set version list')
  }, [versions, title.versions]);

  useEffect(() => {
    // console.log(versionList);
    if (versionList && versionList[0]) {
      let versionToSelect;

      const selectedVersion = title.selectedVersion;

      const versionIds = versionList.map((v) => v.id);

      if (!selectedVersion || !versionIds.includes(selectedVersion.id)) {
        versionToSelect = versionList.find((v) => v.current);
        selectVersion(versionToSelect, title.id);
      } else if (selectedVersion) {
        if (!versions[selectedVersion.id]) {
          versionToSelect = null;
        } else {
          versionToSelect = versions[selectedVersion.id];
        }
        selectVersion(versionToSelect, title.id);
      }
    }
  }, [versionList, selectVersion, title.id, versions, title.selectedVersion]);

  useEffect(() => {
    // console.log(title)
    if (title.selectedVersion && title.selectedVersion.id) {
      fetchBounces(title.selectedVersion.id);
      // console.log('fetch bounces')
    }
  }, [title.selectedVersion, fetchBounces]);

  useEffect(() => {
    if (title.selectedVersion) {
      if (title.selectedVersion.bounces[0]) {
        setBounceList(title.selectedVersion.bounces.map((id) => bounces[id]));
        // console.log('set bounce list')
      } else if (title.selectedBounce !== null) {
        // console.log('set bounce list null')
        setBounceList(null);
        selectBounce(null, title.id);
      }
    }
  }, [
    bounces,
    selectBounce,
    title.id,
    title.selectedBounce,
    title.selectedVersion,
  ]);

  useEffect(() => {
    if (bounceList && bounceList[0]) {
      let bounceToSelect;

      if (title.selectedBounce && bounceList.includes(title.selectedBounce)) {
        bounceToSelect = title.selectedBounce;
      } else {
        bounceToSelect = bounceList.find((b) => b.latest);
        findLatest(title, bounceToSelect);
      }

      if (bounceToSelect !== title.selectedBounce) {
        selectBounce(bounceToSelect, title.id);
        // console.log('select bounce');
      }
    } else if (song) {
      setSong(null);
    }
  }, [bounceList, findLatest, selectBounce, song, title]);

  useEffect(() => {
    if (title.selectedBounce && title.selectedVersion) {
      setSong({
        tier,
        title: titles[title.id],
        version: title.selectedVersion,
        bounce: title.selectedBounce,
      });
      // console.log('song update')
      getTime({ id: title.id, duration: title.selectedBounce.duration });
    } else if (song && !title.selectedBounce) {
      setSong(null);
      getTime({ id: title.id, duration: 0 });
    }
  }, [titles[title.id]]);

  const renderPlayContainer = () => {
    if (song) {
      return <PlayContainer song={song} parentType="tier" />;
    }
  };

  const renderAudioEditLink = () => {
    if (authorized && song) {
      const { tier, title, version, bounce } = song;
      return (
        <Link
          to={{
            pathname: `/${band.url}/edit`,
            state: {
              tier,
              title,
              version,
              bounce,
            },
          }}
          className="edit-link"
        >
          edit audio
        </Link>
      );
    }
  };
  const renderVersion = () => {
    return (
      <Version versions={versionList} title={title} song={song} tier={tier} />
    );
  };

  const onAddToPlaylist = (formValues) => {
    createPlaylistSong({
      ...formValues,
      bounce: title.selectedBounce.id,
      version: title.selectedVersion.id,
      title: title.id,
    });
  };

  const renderButtons = () => {
    if (authorized) {
      const bandPlaylists = band.playlists.map((id) => playlists[id]);
      const playlistOptions = bandPlaylists.map((pl) => {
        if (pl) {
          return { value: pl.id, display: pl.name };
        }
      });
      const bandTiers = band.tiers
        .filter((t) => t !== tier.id)
        .map((id) => tiers[id]);
      const tierOptions = bandTiers.map((t) => {
        if (t) {
          return { value: t.id, display: t.name };
        }
      });
      tierOptions.unshift({ value: null, display: '' });
      return (
        <div className="tier-display">
          {song && (
            <AddButton
              title="Add to a Playlist"
              onSubmit={(formValues) => onAddToPlaylist(formValues)}
              image="images/playlist.png"
              fields={[
                {
                  type: 'select',
                  options: playlistOptions,
                  name: 'playlistId',
                  label: 'Playlist',
                },
              ]}
              form={`add-to-playlist-${title.id}`}
              enableReinitialize={true}
            />
          )}
          <AddButton
            title={`Edit ${title.title}`}
            image="images/edit.png"
            fields={[
              {
                label: 'Title',
                name: 'title',
                type: 'input',
                required: true,
              },
              {
                label: 'Move to Tier',
                name: 'move',
                type: 'select',
                options: tierOptions,
              },
            ]}
            onSubmit={(formValues) => editTitle(formValues, title.id, tier.id)}
            initialValues={{ title: title.title, move: null }}
            form={`edit-title-${title.id}`}
            enableReinitialize={true}
          />
          <DeleteButton
            onSubmit={() => deleteTitle(title.id, tier.id)}
            displayName={title.title}
          />
        </div>
      );
    }
  };

  const arrow = expand ? 'down-arrow' : '';

  const current = audio.currentSong ? audio.currentSong.audio : null;
  const parent = audio.parent ? audio.parent.id : null;

  let currentClass = '';

  if (current && title.selectedBounce) {
    currentClass =
      parent === tier.id && current === title.selectedBounce.id
        ? 'current-song'
        : '';
  }

  let open = expand ? 'open' : 'closed';

  return (
    <div className="title-margin">
      <div className={`row title ${currentClass} ${expand ? 'row-open' : ''}`}>
        <div className="marqee" onClick={() => setExpand(!expand)}>
          <div className="title-name">
            <img className={`arrow ${arrow}`} src={`/images/right-arrow.svg`} />
            <h3>{title.title}</h3>
          </div>
          {renderAudioEditLink()}
          {renderPlayContainer()}
          {renderButtons()}
        </div>
      </div>
      <div className={`version-container ${open}`}>
        {expand && renderVersion()}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    versions: state.versions,
    bounces: state.bounces,
    band: state.bands.currentBand,
    playlists: state.playlists,
    titles: state.titles,
    audio: state.audio,
    tiers: state.tiers,
  };
};

export default connect(mapStateToProps, {
  fetchVersions,
  fetchBounces,
  selectVersion,
  selectBounce,
  createPlaylistSong,
  editTitle,
  deleteTitle,
})(requireAuth(Title));
