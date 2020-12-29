// Define the container and get an array of each class
// Elements in a tier will share an ID



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

document.addEventListener("DOMContentLoaded", () => { 
    readStorage();
});

window.onbeforeunload = () => {
    sessionStorage.setItem('scrollpos', window.scrollY);
};



// Add click event to container- find nearest row, find the class of the row
// Find the ID of the row and toggle the row underneath with the same ID
let selected;
document.addEventListener('click', (e) => {

    const target = e.target;
    // console.log(e);

    if (selected && target.id !== 'inputbox' && target.className !== 'add' && target.className !== 'addbox') {
        selected.classList.toggle('hidden');
        selected = 0;
    }
    // console.log(target);
    const button = target.closest('.row');

    if (target.className === 'add') {
        let addboxIsVisible;
        selected = document.getElementById(target.id).childNodes[1];
        if (!selected.classList.contains('hidden')) {
            addboxIsVisible = true;
        }
        selected.classList.toggle('hidden');
        if (addboxIsVisible) {
            selected = 0;
        }
    } 
    else if (button && !selected) {   
        let id;
        let arrow = `arrow-${button.id}`;
        let arrowEl = document.getElementById(arrow);
        if (button.classList.contains('tier')) {
            id = `title-${button.id}`;

        // } else if (button.classList.contains('title')) {
        //     id = 'version-' + button.id;          
        // } else if (button.classList.contains('songCon')) {
        //     id = 'song-con-' + button.id;

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
    }
});

document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', (e) => {
        // console.log('clicked');
        e.stopPropagation();
    })
})






