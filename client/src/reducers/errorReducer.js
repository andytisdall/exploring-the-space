


export default (state = {}, action) => {
    if (action.payload && action.payload.error) {
        return { error: action.payload.error };
    } else {
        return {};
    }

};