


export default (state = {}, action) => {
    if (!action.payload) {
        return { error: 'No Response!' }
    } else if (action.payload.errors) {
        return { error: action.payload.error };
    } else {
        return {};
    }

};