const generateMessage = (text) => { // her yerde tanımlamayalım diye burada tanımladık
    return {
        text,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage
}