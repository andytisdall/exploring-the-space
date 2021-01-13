// Define the container and get an array of each class
// Elements in a tier will share an ID

const state = {
    addboxIsVisible: false
};


const toggleStorage = (key, id) => {
    if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key)
    } else {
        sessionStorage.setItem(key, id);
    }
};
const readStorage = () => {
    const rows = Object.keys(sessionStorage);
    // console.log(rows);
    rows.forEach(id => {
        if (id == 'scrollpos') {
            window.scrollTo(0, sessionStorage.getItem(id));
        } else {
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
};

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
    let selected = document.getElementById(target.id).childNodes[1];
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
};

const hideAddbox = (target) => {
    const addbox = state.addboxIsVisible;
    if (addbox && target.className !== 'add') {
        addbox.classList.toggle('hidden');
        state.addboxIsVisible = false;
    }
};


const formElements = ['INPUT', 'LABEL', 'FORM'];

document.addEventListener("DOMContentLoaded", () => { 
    readStorage();
});

window.onbeforeunload = () => {
    sessionStorage.setItem('scrollpos', window.scrollY);
};

// Add click event to container- 
// turn off any addboxes that are visible
// find nearest row, find the class of the row
// if the target is an add button, show the add box
// otherwise find the ID of the row and toggle the row underneath with the same ID
// to collapse or decollapse the items within that row

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
    });
});






