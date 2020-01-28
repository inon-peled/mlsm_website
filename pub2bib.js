/* TODO:
1. Aliasghar's thesis.
2. Add "thesis" publication type.
3. Enforce array of full author names.
4. Add optional publisher field.
5. Encode non-ascii characters in both html and bib.
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
        return _get(0, 'unknown unknown', authors)
            .split(' ')
            .slice(-1)
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
            .filter(function (s) { return !['the', 'on', 'at', 'in'].includes(s); })
        )
    );
}

function _getBibEntryIdentifier(pub) {
    return _toPlainEnglishLowercase(_getFirstAuthorSurname(_get('authors', '', pub))) +
        _get('year', '0000', _get('pub', {}, pub)) +
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
    return string ? ('    ' + what + ' = {' + string + '}\n') : '';
}

function toBibArticle(pub) {
    return '@article{' + _getBibEntryIdentifier(pub) + '\n' +
        _strOrEmpty('author', _getAuthorsForBibEntry(pub)) +
        _strOrEmpty('title', _get('title', '', pub)) +
        _strOrEmpty('journal', _get('where', '',
            _get('pub',  {}, pub))) +
        _strOrEmpty('year', _get('year', '',
            _get('pub',  {}, pub))) +
        _strOrEmpty('doi', _get('doi', '', pub)) +
        _strOrEmpty('pdf', _get('pdf', '', pub)) +
        _strOrEmpty('code', _get('code', '', pub)) +
        _strOrEmpty('data', _get('data', '', pub)) +
        '}\n';
}

function allPubsToBib(publications) {
    return publications
        .map(toBibArticle)
        .join('\n');
}
