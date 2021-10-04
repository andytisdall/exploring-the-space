import React from 'react';
import { Link } from 'react-router-dom';

const Help = () => {
    return <>
        <div className="home-buttons">
            <Link to="/">Home</Link>
            <Link to="signin">Sign In</Link>
            <Link to="signin">Sign Up</Link>
        </div>
        <div className="help">
            <div className="help-header">
                Exploring the Space allows you to keep track of your musical recordings in an easy to navigate catalogue.
            </div>
            <h1>
                Here's How This Works
            </h1>
            <div className="tldr">
                TL;DR: Bands contain Tiers, which contain Titles (songs), which contain different versions, each of which can have one or more recordings. Bands also have Playlists which are collections of particular recordings.
            </div>
            <p>
                Each user can have 1 or more bands.  Each band has their own page.
            </p>

            <h2>
                The Band Page
            </h2>
            <p>
                The band page has a "Tiers" sections and a "Playlists" section. The tiers are used to catalogue your songs, and the playlists are used to combine different songs into a certain order.
            </p>
            <h3>
                Tiers
            </h3>
            <p>
                A tier is a collection of songs. Tiers can be separated by different genres, songs that you're currently rehearsing versus songs that are still being written, or any other criteria.  Within the band page, these songs are called "Titles." Click on a tier to reveal its titles.
            </p>
            <h3>
                Titles
            </h3>
            <p>
                Titles contain all the various versions and recordings of a particular song. On the title display, you will see the recording that is most up-to-date for this title, and a button to play it or download it. Click on the title to reveal the different versions it contains.
            </p>
            <h3>
                Versions
            </h3>
            <p>
                A version categorizes groups of recordings, and again you can use whatever criteria you want.  Maybe one version is band practice, and the other is a recording you're working on.  Each version contains one or more recordings, or "Bounces." One and only one version for each title is the "current" version.
            </p>
            <h3>
                Bounces
            </h3>
            <p>
                Bounces are the root component of a song, and they represent a particular recording.  They are represented by a date. Like versions, one bounce per version is designated "current."
            </p>
            <h3>
                Playlists
            </h3>
            <p>
                Playlists are where you can make ordered lists of particular bounces.  Each title has a display of its currently selected version and bounce, along with a button to add that recording to a playlist (you have to create the playlist first).
            </p>
            <p>
                If you change the version or bounce you're listening to, the song in the playlist will remain the same one you originally added. If you want to change which version and/or bounce a song in a playlist represents, you can change that by editing it within the playlist.
            </p>
            <h2>
                Controls
            </h2>
            <p>
                If you are on a band page of a band you own, you will see additional buttons where you can modify the catalogue and upload new recordings.
            </p>
            <p className="danger">
                If you delete an element, everything contained within that element will be deleted!
            </p>
            <a href="https://github.com/andytisdall/greenhouse">
                Github for this project
            </a>
        </div>
    </>;
};

export default Help;