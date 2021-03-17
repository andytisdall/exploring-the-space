

// Define the container and get an array of each class
// Elements in a tier will share an ID

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
    window.scrollTo(0, sessionStorage.getItem('scrollpos'));
    masterVol.value = sessionStorage.getItem('volume');
    setMasterVolume();
};

// Add click event to container- 
// turn off any addboxes that are visible
// find nearest row, find the class of the row
// if the target is an add button, show the add box
// otherwise find the ID of the row and toggle the row underneath with the same ID
// to collapse or decollapse the items within that row

const formElements = ['INPUT', 'LABEL', 'FORM', 'SELECT'];
document.addEventListener('click', e => {

    // console.log(e.target);
    // console.log(state.addboxIsVisible);

    if (formElements.includes(e.target.tagName) || e.target.className === 'addbox') {
        return;
    }
    hideAddbox(e.target);
    const button = e.target.closest('.row');
    if (e.target.className === 'add') {
        showAddbox(e.target);
    } else if (e.target.className === 'edit') {
        showAddbox(e.target);
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
        if (!confirm('Confirm Deletion')) {
            e.preventDefault();
        }
    });
});



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




// Get session storage on page load and save the scroll position before reload

document.addEventListener("DOMContentLoaded", () => { 
    readStorage();
});

window.onbeforeunload = () => {
    sessionStorage.setItem('scrollpos', window.scrollY);
    sessionStorage.setItem('volume', masterVol.value);
};


// Playlist creation

const createPlaylist = (tier) => {
    let containerId = `title-${tier.id}`
    const children = document.getElementById(containerId).childNodes;
    const playlist = [];
    children.forEach(title => {
        let playerId = `player-${tier.id}-${title.id}`;
        let playElement = document.getElementById(playerId);
        playlist.push(playElement);
    });
    return playlist;
};

// On play, playlist is created.  On end, next song is played.

const allPlayers = document.querySelectorAll('.player');
allPlayers.forEach(player => {
    player.addEventListener('play', () => {
        let tierId = player.id.split('-')[1];
        let tier = document.getElementById(tierId);
        const playlist = createPlaylist(tier); 
        let index = playlist.indexOf(player);
        state.currentPlaylist = playlist.slice(index+1);
        if (state.currentSong && state.currentSong !== player) {
            state.currentSong.pause()
        }
        state.currentSong = player;
    });
    player.addEventListener('ended', () => {
        if (state.currentPlaylist) {
            let nextSong = state.currentPlaylist.shift();
            nextSong.play();
        }
    });
    player.addEventListener('canplaythrough', (mp3) => {

        // Get audio duration after mp3 has loaded
        // Add it to the total duration of that tier

        if (!player.className.includes('calculated')) {

            let tierId = player.id.split('-')[1];
            let tierTime = 'tiertime' + tierId;

            let duration = mp3.target.duration;
            let totalTime
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
            player.classList.add('calculated');
        }
    });
});

//Un-hide upload gif class and hide everyting else

const fileforms = document.querySelectorAll('.fileform');
fileforms.forEach(form => {
    form.addEventListener('submit', e => {
        document.querySelector('.upload-container').classList.remove('hidden');
        document.querySelector('.container').classList.add('hidden');
    });
});



const setMasterVolume = () => {
    allPlayers.forEach(player => {
        player.volume = masterVol.value / 100;
    });
};

masterVol.addEventListener('input', setMasterVolume);