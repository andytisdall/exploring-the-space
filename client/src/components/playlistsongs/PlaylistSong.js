import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import { Draggable } from 'react-beautiful-dnd';

import AddButton from '../reusable/AddButton';
import DeleteButton from '../reusable/DeleteButton';
import {
  editPlaylistSong,
  fetchVersions,
  fetchBounces,
  deletePlaylistSong,
} from '../../actions';
import PlayContainer from '../titles/PlayContainer';
import requireAuth from '../reusable/requireAuth';

const PlaylistSong = ({
  playlist,
  playlists,
  song,
  playlistSongs,
  authorized,
  versions,
  bounces,
  titles,
  fetchBounces,
  fetchVersions,
  editPlaylistSong,
  deletePlaylistSong,
  audio,
  getTime,
  band,
  doUpdate,
}) => {
  const [playSong, setPlaySong] = useState(null);

  useEffect(() => {
    fetchVersions(song.title);
    titles[song.title].versions.forEach((id) => {
      fetchBounces(id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchBounces, song.title, fetchVersions]);

  useEffect(() => {
    if (titles[song.title]) {
      setPlaySong({
        playlist,
        title: titles[song.title],
        version: versions[song.version],
        bounce: bounces[song.bounce],
        position: song.position,
      });
    }
    if (bounces[song.bounce]) {
      getTime({ id: song.id, duration: bounces[song.bounce].duration });
    }
  }, [playlistSongs, bounces, titles, versions, song, getTime, playlist]);

  useEffect(() => {
    const updateToCurrent = () => {
      const thisTitle = titles[song.title];
      const titleVersions = thisTitle.versions.map((id) => versions[id]);
      const currentVersion = titleVersions.find((v) => v && v.current);
      if (currentVersion) {
        const versionBounces = currentVersion.bounces.map((id) => bounces[id]);
        const currentBounce = versionBounces.find((b) => b && b.latest);
        if (currentBounce) {
          editPlaylistSong(
            {
              bounce: currentBounce.id,
              version: currentVersion.id,
              position: song.position,
              playlistId: playlist.id,
            },
            song.id
          );
        }
      }
    };
    if (doUpdate) {
      updateToCurrent();
    }
  }, [doUpdate, bounces, song, titles, editPlaylistSong, versions, playlist]);

  const renderPlayContainer = () => {
    if (playSong && playSong.bounce && playSong.version) {
      return <PlayContainer song={playSong} parentType="playlist" />;
    } else {
      return (
        <div className="playlistsong-no-bounce">
          <p>
            {versions[song.version]
              ? `${versions[song.version].name}`
              : 'No Version Selected'}
          </p>
          <p>No Bounce Selected</p>
        </div>
      );
    }
  };

  const onEditSubmit = (formValues) => {
    const thisVersion = Object.values(versions).find((v) =>
      v.bounces.includes(formValues.bounce)
    );
    editPlaylistSong(
      {
        ...formValues,
        version: thisVersion.id,
        playlistId: playlist.id,
      },
      song.id
    );
  };

  const renderEditButton = () => {
    if (authorized && titles[song.title]) {
      const otherSongs = Object.values(playlistSongs)
        .filter((s) => playlist.songs.includes(s.id))
        .sort((a, b) => (a.position < b.position ? -1 : 1))
        .map((s) => {
          return { value: s.position, display: s.position };
        });

      const thisTitle = titles[song.title];

      const otherVersions = thisTitle.versions.map((id) => versions[id]);

      const otherBounces = otherVersions.map((v) => {
        if (v) {
          return v.bounces.map((id) => bounces[id]);
        }
        return null;
      });

      const editOptions = [];

      otherVersions.forEach((v, i) => {
        if (otherBounces[i]) {
          otherBounces[i].forEach((b) => {
            if (b) {
              let current = '';
              if (v.current && b.latest) {
                current = ' * current';
              }
              editOptions.push({
                value: b.id,
                display: `${v.name} -- ${moment
                  .utc(b.date)
                  .format('MM/DD/YY')}${current}`,
              });
            }
          });
        }
      });

      const bandPlaylists = band.playlists
        .filter((id) => id !== playlist.id)
        .map((id) => playlists[id]);

      const playlistOptions = bandPlaylists.map((pl) => {
        if (pl) {
          return { value: pl.id, display: pl.name };
        }
        return null;
      });

      playlistOptions.unshift({ value: null, display: '' });

      return (
        <AddButton
          image="/images/edit.png"
          title={`Edit ${titles[song.title].title}`}
          onSubmit={(formValues) => onEditSubmit(formValues)}
          fields={[
            {
              name: 'position',
              label: 'Position',
              type: 'select',
              options: otherSongs,
            },
            {
              name: 'bounce',
              label: 'Bounce',
              type: 'select',
              options: editOptions,
              required: true,
            },
            {
              label: 'Add to Playlist',
              name: 'move',
              type: 'select',
              options: playlistOptions,
            },
          ]}
          initialValues={
            song.bounce
              ? { ..._.pick(song, 'position', 'bounce'), move: null }
              : { position: song.position, move: null }
          }
          form={`edit-playlistsong-${song.id}`}
          enableReinitialize={true}
          addClass="add-right"
        />
      );
    }
  };

  const renderDeleteButton = () => {
    if (authorized) {
      return (
        <DeleteButton
          onSubmit={() => deletePlaylistSong(song.id, playlist.id)}
          displayName={titles[song.title].title}
        />
      );
    }
  };

  const renderPlaylistSong = (drag = null) => {
    const current = audio.currentSong ? audio.currentSong.audio : null;
    const parent = audio.parent ? audio.parent.id : null;

    let currentClass = '';

    if (current && song.bounce) {
      currentClass =
        parent === playlist.id && current === song.bounce ? 'current-song' : '';
    }
    return (
      <div className="title-margin">
        <div className={`row title playlistsong ${currentClass}`}>
          <div className="marqee">
            <div className="title-name">
              {drag && (
                <div
                  {...drag.dragHandleProps}
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src="images/drag-handle.svg"
                    alt="drag handle"
                    className="drag-handle"
                  />
                </div>
              )}
              <div className="song-position">
                <p>{song.position}</p>
              </div>
              <h3>{song && titles[song.title] && titles[song.title].title}</h3>
            </div>

            {renderPlayContainer()}
            <div className="tier-display">
              {renderEditButton()}
              {renderDeleteButton()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (authorized) {
    return (
      <Draggable index={song.position - 1} draggableId={song.id}>
        {(provided) => {
          return (
            <div {...provided.draggableProps} ref={provided.innerRef}>
              {renderPlaylistSong(provided)}
            </div>
          );
        }}
      </Draggable>
    );
  } else {
    return renderPlaylistSong();
  }
};

const mapStateToProps = (state) => {
  return {
    playlistSongs: state.playlistSongs,
    band: state.bands.currentBand,
    playlists: state.playlists,
    versions: state.versions,
    bounces: state.bounces,
    titles: state.titles,
    audio: state.audio,
  };
};

export default connect(mapStateToProps, {
  fetchBounces,
  fetchVersions,
  editPlaylistSong,
  deletePlaylistSong,
})(requireAuth(PlaylistSong));
