function _risEntryToString(arr) {
    function oneLine(pair) {
        return pair[0] + '  - ' + pair[1] + '\r\n';
    }
    return typeof arr[0] === 'string' ?
        oneLine(arr):
        arr.map(oneLine).join('');
}

function _last(arr) {
    return arr.length > 0 ? arr[arr.length - 1] : null;
}

function _risType(pub) {
    return [
        'TY',
        _get(getPubType(pub), 'misc', {
            book: 'CHAP',
            thesis: 'THES',
            article: 'JOUR',
            misc: 'MANSCPT',
            conference: 'CONF'
        })
    ];
}

function _risAuthors(pub) {
    return pub.authors ?
        pub.authors.map(function (authorName) {
            return ['AU', authorName.replace('!', '')];
        }) :
        null;
}

function _risDoi(pub) {
    return [
        'DO',
        _get('doi', '', _get('links', {}, pub))
    ];
}

function _risYear(pub) {
    return [
        'Y1',
        _get('year', '', pub)
    ];
}

function _risTitle(pub) {
    return [
        'TI',
        pub.title
    ];
}

function _risVolume(pub) {
    return ['VL', pub.volume]
}

function _risWherePublished(pub) {
    return ['JO', pub.where]
}

function _risIssueNumber(pub) {
    return ['IS', pub.number]
}

function _risPdfLink(pub) {
    return ['UR', _get('pdf', null, _get('links', {}, pub))];
}

function _risCodeLink(pub) {
    return ['UR', _get('code', null, _get('links', {}, pub))];
}

function _risDataLink(pub) {
    return ['UR', _get('data', null, _get('links', {}, pub))];
}

function _risPages(pub) {
    function nonEmptyPages() {
        const sep = pub.pages.replace(/[0-9]/gi, '');
        return [
            ['SP', pub.pages.split(sep)[0]],
            ['EP', _last(pub.pages.split(sep))]
        ];
    }
    return pub.pages ? nonEmptyPages(pub) : null;

}

function _risPublisher(pub) {
    return ['PB', pub.publisher];
}

function _risRecordEnd() {
    return 'ER  -\r\n';
}

function _onePubToRis(pub) {
    return [].filter.call(
        [
            _risType(pub),
            _risAuthors(pub),
            _risTitle(pub),
            _risWherePublished(pub),
            _risYear(pub),
            _risPublisher(pub),
            _risVolume(pub),
            _risPages(pub),
            _risIssueNumber(pub),
            _risDoi(pub),
            _risPdfLink(pub),
            _risCodeLink(pub),
            _risDataLink(pub)
        ],
        function (risPair) {
            return risPair && risPair[1];
        })
        .map(_risEntryToString)
        .join('') + _risRecordEnd();
}

function pubsToRis(pubs) {
    return pubs.map(_onePubToRis).join('');
}