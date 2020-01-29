/* TODO:
* Aliasghar's thesis.
* MSc theses
*/

function _toPlainEnglishLowercase(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-z]/g, "")
        .toLowerCase()
}

function _get(item, dflt, collection) {
    return collection[item] ? collection[item] : dflt;
}

function _getFirstAuthorSurname(authors) {
    if (Array.isArray(authors)) {
        return _get(0, 'wxyz, wxyz', authors)
            .split(', ')
            [0];
    } else {
        return authors.split(',')[0]
    }
}

function _getFirstWordInTitleForBibIdentifier(title) {
    return _toPlainEnglishLowercase(
        _get(0, 'empty', title
            .toLowerCase()
            .split(' ')
            .filter(function (s) {
                return ![
                    'an',
                    'a',
                    'by',
                    'from',
                    'the',
                    'on',
                    'at',
                    'in']
                    .includes(s);
            })
        )
    );
}

function _getBibEntryIdentifier(pub) {
    return _toPlainEnglishLowercase(_getFirstAuthorSurname(_get('authors', '', pub))) +
        _get('year', '0000', pub) +
        _getFirstWordInTitleForBibIdentifier(_get('title', '', pub));
}


function _getAuthorsForBibEntry(pub) {
    function _joinAnd(authors) {
        return Array.isArray(authors) ?
            authors.join(' and ') :
            authors;
    }

    return _joinAnd(_get('authors', '', pub));
}

function _strOrEmpty(what, string) {
    return string ? ('    ' + what + ' = {' + string + '},\n') : '';
}

function _bibNoteLinks(links) {
    function _noteOrEmpty(what) {
        const string = _get(what, '', links);
        return string ? (what + '={' + string + '}') : '';
    }

    return [
        _noteOrEmpty('pdf'),
        _noteOrEmpty('code'),
        _noteOrEmpty('data')
    ].filter(function (e) {
        return e !== ''
    })
        .join(', ');
}

function _toBibArticle(pub) {
    return '@article{' +
        _getBibEntryIdentifier(pub) + ',\n' +
        _strOrEmpty('author', _getAuthorsForBibEntry(pub)) +
        _strOrEmpty('title', _get('title', '', pub)) +
        _strOrEmpty('journal', _get('where', '', pub)) +
        _strOrEmpty('publisher', _get('publisher', '', pub)) +
        _strOrEmpty('volume', _get('volume', '', pub)) +
        _strOrEmpty('number', _get('number', '', pub)) +
        _strOrEmpty('year', _get('year', '', pub)) +
        _strOrEmpty('DOI', _get('doi', '', _get('links', {}, pub))) +
        _strOrEmpty('note', _bibNoteLinks(_get('links', {}, pub))) +
        '}\n';
}

function _toBibPhdThesis(pub) {
    return '@phdthesis{' +
        _getBibEntryIdentifier(pub) + ',\n' +
        _strOrEmpty('author', _getAuthorsForBibEntry(pub)) +
        _strOrEmpty('title', _get('title', '', pub)) +
        _strOrEmpty('school', _get('where', '', pub)) +
        _strOrEmpty('year', _get('year', '', pub)) +
        _strOrEmpty('DOI', _get('doi', '', _get('links', {}, pub))) +
        _strOrEmpty('note', _bibNoteLinks(_get('links', {}, pub))) +
        '}\n';
}

function _toBibBook(pub) {
    return '@incollection{' +
        _getBibEntryIdentifier(pub) + ',\n' +
        _strOrEmpty('author', _getAuthorsForBibEntry(pub)) +
        _strOrEmpty('title', _get('title', '', pub)) +
        _strOrEmpty('booktitle', _get('where', '', pub)) +
        _strOrEmpty('publisher', _get('publisher', '', pub)) +
        _strOrEmpty('year', _get('year', '', pub)) +
        _strOrEmpty('DOI', _get('doi', '', _get('links', {}, pub))) +
        _strOrEmpty('note', _bibNoteLinks(_get('links', {}, pub))) +
        '}\n';
}

function _toBibConference(pub) {
    return '@conference{' +
        _getBibEntryIdentifier(pub) + ',\n' +
        _strOrEmpty('author', _getAuthorsForBibEntry(pub)) +
        _strOrEmpty('title', _get('title', '', pub)) +
        _strOrEmpty('booktitle', _get('where', '', pub)) +
        _strOrEmpty('year', _get('year', '', pub)) +
        _strOrEmpty('DOI', _get('doi', '', _get('links', {}, pub))) +
        _strOrEmpty('note', _bibNoteLinks(_get('links', {}, pub))) +
        '}\n';
}

function _toBibMisc(pub) {
    return '@misc{' +
        _getBibEntryIdentifier(pub) + ',\n' +
        _strOrEmpty('author', _getAuthorsForBibEntry(pub)) +
        _strOrEmpty('title', _get('title', '', pub)) +
        _strOrEmpty('howpublished', _get('where', '', pub)) +
        _strOrEmpty('publisher', _get('publisher', '', pub)) +
        _strOrEmpty('volume', _get('volume', '', pub)) +
        _strOrEmpty('number', _get('number', '', pub)) +
        _strOrEmpty('year', _get('year', '', pub)) +
        _strOrEmpty('DOI', _get('doi', '', _get('links', {}, pub))) +
        _strOrEmpty('note', _bibNoteLinks(_get('links', {}, pub))) +
        '}\n';
}

function _toBibOnePub(pub) {
    return {
        book: _toBibBook,
        conference: _toBibConference,
        article: _toBibArticle,
        phdthesis: _toBibPhdThesis,
        misc: _toBibMisc
    }[_get('type', 'misc', pub)](pub);
}

function allPubsToBib(publications) {
    return publications
        .map(_toBibOnePub)
        .join('\n');
}
