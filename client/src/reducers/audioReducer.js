import { PLAY_AUDIO, PAUSE_AUDIO, QUEUE_SONGS, NEXT_SONG } from "../actions/types";

const initialState = {
    play: false,
    volume: 50,
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
        default:
            return state;
    }
};