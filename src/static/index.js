

// Elements in a tier will share an ID

// boolean for seeing if there's an open form somewhere on the page
// will also have a 'current song' attribute
// and a current playlist

const state = {
    addboxIsVisible: false
};

const masterVol = document.getElementById('mastervol');

const toggleStorage = (key, id) => {
    if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key)
    } else {
        sessionStorage.setItem(key, id);
    }
};
const readStorage = () => {
    // list of expanded rows that were saved
    // get each row from storage and expand them
    const rows = Object.keys(sessionStorage);
    rows.forEach(id => {
        if (id !== 'scrollpos' && id !== 'volume') {
            const row = document.getElementById(id);
            if (row) {
                row.classList.toggle('hidden');
                const arrow = sessionStorage.getItem(id);
                document.getElementById(arrow).setAttribute('src', 'down-arrow.svg');
            } else {
                sessionStorage.removeItem(id);
            }
        }
    });
    // scroll to saved scroll position
    window.scrollTo(0, sessionStorage.getItem('scrollpos'));
    // get volume from storage
    masterVol.value = sessionStorage.getItem('volume');
    
};

// Add click event to container- 
// turn off any addboxes that are visible
// find nearest row, find the class of the row
// if the target is an add button, show the add box
// otherwise find the ID of the row and toggle the row underneath with the same ID
// to collapse or expand the items within that row


const formElements = ['INPUT', 'LABEL', 'FORM', 'SELECT'];

const container = document.querySelector('.container');

container.addEventListener('click', e => {
    
    if (formElements.includes(e.target.tagName) || e.target.className === 'addbox') {
        return;
    }
    hideAddbox(e.target.parentNode);
    const button = e.target.closest('.row');
    if (e.target.parentNode.className.includes('add') || e.target.parentNode.className.includes('edit')) {
        showAddbox(e.target.parentNode);
    } else if (button && !state.addboxIsVisible) {   
        collapseButton(button);
    }

});


// stop propagation for the add item sumbit buttons and the delete links

document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', e => {
        e.stopPropagation();
    });
});

document.querySelectorAll('.delete').forEach(button => {
    button.addEventListener('click', e => {
        e.stopPropagation();
        // const parsedUrl = e.target.parentNode.href.split('/');
        // const itemType = parsedUrl[4];
        // const message = `This ${itemType} and all of its children will be deleted. Type the word delete to confirm`;
        // const deletion = prompt(message);
        // if (deletion !== 'delete') {
        //     e.preventDefault();
        // }
        const deleteForm = document.getElementById(button.id + '-form');
        deleteForm.submit();
    });
});

// toggles expansion of title and tier rows

const collapseButton = (button) => {
    let id;
    let arrow = `arrow-${button.id}`;
    let arrowEl = document.getElementById(arrow);
    if (button.classList.contains('tier')) {
        id = `title-${button.id}`;
    } else if (button.classList.contains('title')) {
        id = `version-${button.id}`;         
    } else if (button.classList.contains('version')) {
        id = `song-${button.id}`;   
    } else {
        return;
    }
    document.getElementById(id).classList.toggle('hidden');
    if (arrowEl.getAttribute('src') === 'right-arrow.svg') {
        arrowEl.setAttribute('src', 'down-arrow.svg');
    } else {
        arrowEl.setAttribute('src', 'right-arrow.svg')
    }
    toggleStorage(id, arrow);
};

// show and hide hidden forms

const showAddbox = (target) => {
    let selected = target.childNodes[1];
    let addbox = state.addboxIsVisible;
    if (addbox) {
        if (addbox !== selected) {
            addbox.classList.toggle('hidden');
            state.addboxIsVisible = selected;
        } else {
            state.addboxIsVisible = false;
        }
    } else {
        state.addboxIsVisible = selected;
    }
    selected.classList.toggle('hidden');
    selected.childNodes[0].childNodes[1].focus();
};

const hideAddbox = (target) => {
    const addbox = state.addboxIsVisible;
    if (addbox && target.className !== 'add' && target.className !== 'edit') {
        addbox.classList.toggle('hidden');
        state.addboxIsVisible = false;
    }
};


// Get session storage on page load and save the scroll position and volume level before reload

document.addEventListener("DOMContentLoaded", () => { 
    readStorage();
});

window.onbeforeunload = () => {
    sessionStorage.setItem('scrollpos', window.scrollY);
    sessionStorage.setItem('volume', masterVol.value);
};


// creates a playlist of all songs in a tier

const createPlaylist = (tier) => {
    let containerId = `title-${tier.id}`
    const children = document.getElementById(containerId).childNodes;
    const playlist = [];
    children.forEach(title => {
        let mp3Id = document.getElementById(`mp3Id-${title.id}`);
        if (mp3Id) {
            mp3Id = mp3Id.textContent.trim();
        }
        let titleName = document.getElementById(`name-spot-${title.id}`).textContent;
        let versionName = document.getElementById(`version-name-${title.id}`);
        if (versionName) {
            versionName = versionName.textContent;
        }
        let bounceDate = document.getElementById(`bounce-date-${title.id}`);
        if (bounceDate) {
            bounceDate = bounceDate.textContent;
        }
        let duration = document.getElementById(`duration-${title.id}-${tier.id}`).textContent;
        playlist.push({
            audio: mp3Id,
            title: titleName,
            version: versionName,
            date: bounceDate,
            duration
        });
    });
    return playlist;
};

// On play, playlist is created that starts with the played song.  On end, next song is played.

const playerTag = document.getElementById('player-spot');




        // Get audio duration after mp3 has loaded
        // Add it to the total duration of that tier


// titles.forEach(async title => {
//     let mp3Id = document.getElementById(`mp3Id-${title.id}`);
//     if (mp3Id) {
//         mp3Id = mp3Id.textContent.trim();
//     } else {
//         return;
//     }
//     const mp3 = await axios.get(
//         `/audio/${mp3Id}.mp3`,
//         {
//         headers: {
//             'Range': 'bytes=0-'
//         },
//         responseType: 'arraybuffer'
//     });
//     const audioContext = new window.AudioContext;
//     audioContext.decodeAudioData(mp3.data, (buffer) => {
//         console.log(buffer.duration);
//     })
// });

const timeDisplays = document.querySelectorAll('.songtime');

timeDisplays.forEach(time => {


    let tierId = time.id.split('-')[[2]];
    let tierTime = 'tiertime' + tierId;
    
    let duration = time.textContent;

    let [durMin, durSec] = duration.split(':');
    duration = (parseInt(durMin) * 60) + parseInt(durSec);
    
    let totalTime;
    let currentTime = document.getElementById(tierTime).textContent;
    if (currentTime) {
        let [currentMin, currentSec] = currentTime.split(':');
        let totalCurrentSecs = (parseInt(currentMin) * 60) + parseInt(currentSec);
        totalTime = duration + totalCurrentSecs;
    } else {
        totalTime = duration;
    }
    
    let seconds = Math.floor(totalTime % 60);
    if (seconds < 10) {
        seconds = '0' + seconds.toString();
    }
    let minutes = Math.floor(totalTime/60);
    document.getElementById(tierTime).textContent = `${minutes}:${seconds}`;

});


// show upload gif and hide everything else

const fileforms = document.querySelectorAll('.fileform');
fileforms.forEach(form => {
    form.addEventListener('submit', e => {
        document.querySelector('.upload-container').classList.remove('hidden');
        document.querySelector('.container').classList.add('hidden');
    });
});

// link master volume to each audio element's volume

const setMasterVolume = (audioPlayer) => {
    masterVol.addEventListener('input', () => {
        audioPlayer.volume = masterVol.value / 100;
    });
};

// playbar

const playSlider = document.getElementById('playslider');
const playSliderCurrentTime = document.getElementById('playcurrenttime');
const playSliderTotalTime = document.getElementById('playtotaltime');
const currentSongHeader = document.getElementById('currentsongheader');
const currentVersion = document.getElementById('currentversion');
const currentDate = document.getElementById('currentdate');


const getPlaySlider = (audio) => {
    
    
    // displays song info on playbar
    currentSongHeader.textContent = state.currentSong.title;
    currentVersion.textContent = state.currentSong.version;
    currentDate.textContent = state.currentSong.date;
    playSliderTotalTime.textContent = state.currentSong.duration
 
    // updates current time on play slider
    audio.addEventListener('timeupdate', () => {
        const position = (audio.currentTime / audio.duration) * 1000;
        playSlider.value = position;
        let minutes = audio.currentTime < 600 ? `0${Math.floor(audio.currentTime/60)}` : Math.floor(audio.currentTime/60);
        let seconds = audio.currentTime % 60 < 10 ? `0${Math.floor(audio.currentTime % 60)}` : Math.floor(audio.currentTime % 60);
        playSliderCurrentTime.textContent = `${minutes}:${seconds}`;
    });

    // moving the slider will update the current position in the mp3
    playSlider.addEventListener('input', () => {
        audio.currentTime = (playSlider.value / 1000) * audio.duration;
    });

};

// play button
// creates playlist, pauses currently playing song, updates play slider



const play = (mp3Id) => {
    const audioHTML = `<audio src='/audio/${mp3Id}.mp3' class='player' id=${mp3Id}>`;
    const currentPlayer = playerTag.childNodes[0];
    if (currentPlayer) {
        playerTag.removeChild(currentPlayer);
    }
    playerTag.insertAdjacentHTML("beforeend", audioHTML);
    
    let audioPlayer = playerTag.childNodes[0];
    audioPlayer.play(); 
    
    
    audioPlayer.addEventListener('ended', () => {
        if (state.currentPlaylist) {
            let nextSong = state.currentPlaylist.shift();
            if (nextSong) {
                state.currentSong = nextSong;
                play(nextSong.audio);
            }
        }
    });

    audioPlayer.volume = masterVol.value / 100;
    setMasterVolume(audioPlayer);
    showPause(audioPlayer);

    getPlaySlider(audioPlayer);
};

const playButtons = document.querySelectorAll('.playbutton');
playButtons.forEach(playButton => {
    playButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const [mp3Id, tierId] = playButton.id.split('-');
        let tier = document.getElementById(tierId);
        const playlist = createPlaylist(tier);

        let currentSong = playlist.find(song => song.audio === mp3Id);
        let index = playlist.indexOf(currentSong);
        state.currentSong = currentSong;
        state.currentPlaylist = playlist.slice(index+1);
        if (state.currentSong && state.currentSong !== currentSong) {
            pausePlayer(state.currentSong.audio);
        }
        play(mp3Id);
    }); 
});

const bandName = document.getElementById('band-name').textContent;

const versionDropdowns = document.querySelectorAll('.change-version');
versionDropdowns.forEach(link => {
    link.addEventListener('click', async e => {
        const [currentVersion, changeVersion] = link.id.split('-');
        e.stopPropagation();
        await axios.post(`/${bandName}/change-version`, {
            currentVersion, changeVersion
        });
        window.location.reload();

    });
});



const songDropdowns = document.querySelectorAll('.change-song');
songDropdowns.forEach(link => {
    link.addEventListener('click', async e => {
        const [currentSong, changeSong] = link.id.split('-');
        e.stopPropagation();
        await axios.post(`/${bandName}/change-song`, {
            currentSong, changeSong
        });
        window.location.reload();

    });
});


const pause = document.getElementById('pause');
const unpause = document.getElementById('unpause');

const showPause = (player) => {
    pause.classList.remove('hidden');
    pause.addEventListener('click', () => {
        pausePlayer(player);
    });
};

const pausePlayer = (player) => {
    player.pause();
    pause.classList.add('hidden');
    unpause.classList.remove('hidden');
}

const unpausePlayer = (player) => {
    pause.classList.remove('hidden');
    player.play();
    unpause.classList.add('hidden');
}

unpause.addEventListener('click', () => {
    const audio = document.getElementById(state.currentSong.audio);
    unpausePlayer(audio);
});

// document.addEventListener('keydown', (e) => {
//     if (e.code === 'Space') {
//         e.preventDefault();
//         if (state.currentSong) {
//             const audio = document.getElementById(state.currentSong.audio);
//             if (audio.paused) {
//                 unpausePlayer(audio);
//             } else {
//                 pausePlayer(audio);
//             }
//         }
//     }
// });


const fileInputs = document.querySelectorAll('.fileform');
fileInputs.forEach(input => {
    input.addEventListener('submit', (e) => {

        const formFileList = input.childNodes[2].files;

        // Obtain the uploaded file, you can change the logic if you are working with multiupload
        if (formFileList.length) {
            e.preventDefault();
            const file = formFileList[0];
            
            // Create instance of FileReader
            const reader = new FileReader();

            // When the file has been succesfully read
            reader.onload = event => {

                // Create an instance of AudioContext
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();

                // Asynchronously decode audio file data contained in an ArrayBuffer.
                audioContext.decodeAudioData(event.target.result, buffer => {
                    // Obtain the duration in seconds of the audio file (with milliseconds as well, a float value)
                    const duration = parseInt(buffer.duration);

                    const formData = new FormData(input)
                    formData.append('duration', duration);
                    axios.post(`/${bandName}`, formData).then(() => {
                        window.location.reload();
                    });

                });
            };
                
    

            // In case that the file couldn't be read
            reader.onerror =  event => {
                console.error("An error ocurred reading the file: ", event);
            };

            // Read file as an ArrayBuffer, important !
            reader.readAsArrayBuffer(file);
        }
    });
});

