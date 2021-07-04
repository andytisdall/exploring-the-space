import React from 'react';
import connect from 'react-redux';
import moment from 'moment';

import AuthControl from './AuthControl';

const PlaylistSong = ({ props }) => {

    const renderPlaylistSongs = () => {

        return props.playlistsongs.map(playlistsong => {

            const displayDate = moment.utc(song.bounce.date).format('MM/DD/YY');
            const minutes = Math.floor(song.bounce.duration / 60);
            const seconds = Math.floor(song.bounce.duration % 60) < 10 ? '0' + Math.floor(song.bounce.duration % 60) : Math.floor(song.bounce.duration % 60);
            const displayTime = `${minutes}:${seconds}`

            return (
                <div className='title-margin'>
                    <div class="title">                    
                        <div className="marqee">
                            <div className='row-name'>
                                <div className="song-position">{playlistsong.position}</div>
                                <div className='name-spot'>
                                    <h3>{playlistsong.title.title}</h3>
                                </div>
                            </div>      

                            <div className='playcontainer'>                                   
                                <div className='songtime'>{displayTime}</div>
                                <div class='playbutton'>
                                    <img src='/images/play.svg' class='playicon' />
                                </div>
                                <div class='title-display'>
                                    <p>{song.version.name}</p>
                                    <p>{displayDate}</p>
                                </div>
                            </div>

                            <AuthControl>
                                <div className='tier-display'>
                                    <div class="add">
                                        <img src='/images/playlist.png' />
                                        <div className='addbox hidden'>
                                            <h3>Add to Playlist</h3>
                                            <form method='POST' action={band.name + '/create-playlist-song'} class='add-form'>
                                                <select name='playlistId'>
                                                    <option selected disabled value={playlist.id}>   
                                                        {playlist.name}
                                                    </option>
                                                    {band.playlists.filter(p => p !== playlist).map(pl => <option value={pl.id}>{pl.name}</option>)}
                                                </select>
                                                {/* input(type="hidden" name="title" value=song.title.id)
                                                input(type="hidden" name="version" value=song.version.id)
                                                input(type="hidden" name="bounce" value=song.bounce.id)
                                                button(type='submit') OK */}
                                            </form>
                                        </div>
                                    </div>
                                    <AddButton 
                                        image='/images/playlist.png'
                                        title='Add to Playlist'
                                    >
                                            <form method='POST' action={band.name + '/create-playlist-song'} class='add-form'>
                                                <select name='playlistId'>
                                                    <option selected disabled value={playlist.id}>   
                                                        {playlist.name}
                                                    </option>
                                                    {band.playlists.filter(p => p !== playlist).map(pl => <option value={pl.id}>{pl.name}</option>)}
                                                </select>
                                                {/* input(type="hidden" name="title" value=song.title.id)
                                                input(type="hidden" name="version" value=song.version.id)
                                                input(type="hidden" name="bounce" value=song.bounce.id)
                                                button(type='submit') OK */}
                                    
                                    
                                            </form>
                                    </AddButton>
                                    {/* div(class="add")
                                        img(src='/images/edit.png')
                                        div(class='addbox hidden')
                                            h3 Edit #{song.title.title}
                                            form(method='POST' action=band.name + '/change-position' class='add-form')
                                                label(for='titleName') Position:
                                                select(name='newPosition')
                                                    option(selected disabled) #{song.position}
                                                    - const positions = playlist.songs.filter(p => p.position !== song.position)
                                                    each item in positions
                                                        option(value=item.position) #{item.position}
                                                label(for='newBounce') Bounce:
                                                select(name='newBounce')
                                                    option(selected disabled)
                                                    each version in song.title.versions
                                                        option(disabled) #{version.name}
                                                        each date in version.songs
                                                            - const displayDate = moment.utc(date.date).format('MM/DD/YY')
                                                            option(value=version.id + '-' + date.id) --- #{displayDate}
                                                input(type='hidden' name='songId' value=song.id)
                                                button(type='submit') OK
                                    form(class='hidden' action=band.name + '/delete-playlist-song' method="POST" id='delete-' + song.id + '-form')
                                        input(type='hidden' name='songId' value=song.id)
                                        input(type='hidden' name='playlistId' value=playlist.id)
                                    img(src='/images/delete.png' class='delete' id='delete-' + song.
                                    id) */}
                                </div>
                            </AuthControl>
                            
                        </div>
                    </div>
                </div>
            );

        });

    }


    return (
        <div className='titlecontainer'>
            {renderPlaylistSongs()}
        </div>
    );
};

export default PlaylistSong;