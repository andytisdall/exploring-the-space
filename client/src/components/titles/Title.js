import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';

import Version from '../versions/Version';
import AddButton from '../reusable/AddButton';
import {
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
  bounces,
  authorized,
  band,
  playlists,
  selectBounce,
  createPlaylistSong,
  editTitle,
  deleteTitle,
  audio,
  findLatest,
  tiers,
}) => {
  const [expand, setExpand] = useState(false);
  // const [versionList, setVersionList] = useState(null);
  const [bounceList, setBounceList] = useState(null);
  const [song, setSong] = useState(null);
  // const [showChords, setShowChords] = useState(false);

  // const chordButtonRef = useRef();

  useEffect(() => {
    // console.log('a');
    if (title.selectedBounce && title.selectedVersion) {
      setSong({
        parent: tier,
        title: titles[title.id],
        version: title.selectedVersion,
        bounce: title.selectedBounce,
      });
      if (title.selectedVersion.current) {
        if (title.selectedBounce) {
          if (
            title.selectedVersion.bounces.includes(title.selectedBounce.id) &&
            title.selectedBounce.latest
          ) {
            findLatest(title, title.selectedBounce);
          }
        } else {
          findLatest(title, null);
        }
      }
    } else if (
      song &&
      (!title.selectedVersion || !title.selectedVersion.bounces.length)
    ) {
      setSong(null);
      if (title.selectedVersion.current) {
        findLatest(title, null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title.selectedBounce, title.selectedVersion]);

  useEffect(() => {
    // console.log('c');
    if (title.selectedVersion) {
      if (title.selectedVersion.bounces[0]) {
        setBounceList(title.selectedVersion.bounces.map((id) => bounces[id]));
      } else if (title.selectedBounce !== null) {
        // console.log('set bounce list null');
        setBounceList(null);
        selectBounce(null, title.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectBounce, title.selectedVersion, bounces]);

  // useEffect(() => {
  //   const bodyClick = (e) => {
  //     if (chordButtonRef.current && chordButtonRef.current.contains(e.target)) {
  //       return;
  //     }
  //     if (showChords) {
  //       setShowChords(false);
  //     }
  //   };

  //   document.addEventListener('mousedown', bodyClick, { capture: true });
  //   return () => {
  //     document.removeEventListener('mousedown', bodyClick, { capture: true });
  //   };
  // }, [showChords]);

  useEffect(() => {
    // console.log('d');
    if (bounceList && bounceList[0]) {
      // set the title.selected bounce if the bounce list has been modified and no longer matches the current title.selected bounce

      let bounceToSelect;

      if (!title.selectedBounce || !bounceList.includes(title.selectedBounce)) {
        // if not found that means the selected version has changed so just select the latest bounce
        bounceToSelect = bounceList.find((b) => b && b.latest);
      }

      if (bounceToSelect) {
        selectBounce(bounceToSelect, title.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bounceList, selectBounce]);

  const renderPlayContainer = () => {
    if (song) {
      return <PlayContainer song={song} parentType="tier" />;
    }
  };

  const renderChordsButton = () => {
    if (title.chords) {
      return (
        <a className="chords-container" href={title.chords} target="blank">
          <img
            src="/images/clef.png"
            alt="song chords"
            className="chords-button"
            onClick={(e) => {
              e.stopPropagation();
              // setShowChords((state) => !state);
            }}
          />
          {/* {showChords && <div className="chords-box">{title.chords}</div>} */}
        </a>
      );
    }
  };

  // const renderAudioEditLink = () => {
  //   if (authorized && song) {
  //     const { tier, title, version, bounce } = song;
  //     return (
  //       <Link
  //         to={{
  //           pathname: `/${band.url}/edit`,
  //           state: {
  //             tier,
  //             title,
  //             version,
  //             bounce,
  //           },
  //         }}
  //         className="edit-link"
  //       >
  //         edit audio
  //       </Link>
  //     );
  //   }
  // };
  const renderVersion = () => {
    return <Version title={title} song={song} tier={tier} />;
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
      const playlistOptions = bandPlaylists
        .sort((a, b) => (a.position > b.position ? 1 : -1))
        .map((pl) => {
          if (pl) {
            return { value: pl.id, display: pl.name };
          }
          return null;
        });
      const bandTiers = band.tiers
        .filter((t) => t !== tier.id)
        .map((id) => tiers[id]);
      const tierOptions = bandTiers.map((t) => {
        if (t) {
          return { value: t.id, display: t.name };
        }
        return null;
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
              {
                label: 'Chords',
                name: 'chords',
                type: 'textarea',
              },
            ]}
            onSubmit={(formValues) => editTitle(formValues, title.id, tier.id)}
            initialValues={{
              title: title.title,
              move: null,
              chords: title.chords,
            }}
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
  const parent = audio.currentSong ? audio.currentSong.parent.id : null;

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
            <img
              className={`arrow ${arrow}`}
              src={`/images/right-arrow.svg`}
              alt="title arrow"
            />
            <h3>{title.title}</h3>
          </div>
          {renderChordsButton()}
          {/* {renderAudioEditLink()} */}
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
  selectBounce,
  createPlaylistSong,
  editTitle,
  deleteTitle,
  selectVersion,
})(requireAuth(Title));
