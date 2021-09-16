import { PLAY_AUDIO, PAUSE_AUDIO, QUEUE_SONGS, NEXT_SONG, DELETE_BOUNCE, CHANGE_VOLUME, INITIALIZE_AUDIO } from "../actions/types";

const initialState = {
    play: false,
    volume: 75,
    queue: [],
    currentSong: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case PLAY_AUDIO:
            return { ...state, play: true, pause: false };
        case PAUSE_AUDIO:
            return { ...state, play: false, pause: true };
        case QUEUE_SONGS:
            const currentSong = action.payload.shift();
            return { ...state, queue: action.payload, currentSong, play: true };
        case NEXT_SONG:
            const queue = state.queue;
            const nextSong = queue.shift();
            return { ...state, queue, currentSong: nextSong };
        case DELETE_BOUNCE:
            if (action.payload.bounce.id === state.currentSong.audio) {
                return { ...initialState };
            }
            if (state.queue.length) {
                state.queue = state.queue.filter(song => song.audio !== action.payload.bounce.id);
                return { ...state };
            }
        case CHANGE_VOLUME:
            return { ...state, volume: action.payload };
        case INITIALIZE_AUDIO:
            return { ...initialState };
        default:
            return state;
    }
};