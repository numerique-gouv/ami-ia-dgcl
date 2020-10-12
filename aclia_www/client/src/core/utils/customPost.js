const customPost = (path, body) => {
    return fetch(path,{
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
};

export default customPost;
