function _risField(key, value) {
    return key + ' - ' + value + '\r\n';
}

function _risType(pub) {
    return _risField(
        'TY',
        _get(getPubType(pub), 'misc', {
            book: 'CHAP',
            thesis: 'THES',
            article: 'JOUR',
            misc: 'MANSCPT',
            conference: 'CONF'
        }));
}

function _risAuthors(pub) {
    return pub.authors.map(function (authorName) {
        return _risField('AU', authorName.replace('!', ''));
    });
}

function onePubToRis(pub) {
    return [
        _risType(pub),
        _risAuthors(pub),
    ].join('\n');
}
