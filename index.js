// Define the container and get an array of each class
// Elements in a tier will share an ID



const toggleStorage = (id) => {
    if (sessionStorage.getItem(id)) {
        sessionStorage.removeItem(id)
    } else {
        sessionStorage.setItem(id, id);
    }
};
const readStorage = () => {
    const rows = Object.keys(sessionStorage);
    console.log(rows);
    // console.log(rows);
    rows.forEach(id => {
        if (id == 'scrollpos') {
            window.scrollTo(0, sessionStorage.getItem(id));
        } else {
            const row = document.getElementById(id);
            if (row) {
                row.classList.toggle('hidden');
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
    if (!target) {
        return;
    }

    if (selected && target.id !== 'inputbox' && target.className !== 'add' && target.className !== 'addbox') {
        selected.classList.toggle('hidden');
        selected = 0;
    }
    // console.log(target);
    const button = target.closest('.row');

    if (target.className === 'add') {
        let addboxIsVisible;
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
        if (button.classList.contains('tier')) {
            id = 'title-' + button.id;
        // } else if (button.classList.contains('title')) {
        //     id = 'version-' + button.id;          
        // } else if (button.classList.contains('songCon')) {
        //     id = 'song-con-' + button.id;
        } else {
            return;
        }
        document.getElementById(id).classList.toggle('hidden');
        toggleStorage(id);
    }
});




