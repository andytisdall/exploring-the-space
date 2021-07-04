


export default (state = [], action) => {

    if (action.payload.errors) {
        return [...action.payload.errors];
    } else {
        return [];
    }

};