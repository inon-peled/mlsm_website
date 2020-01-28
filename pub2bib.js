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

// function toBibArticle(pub) {
//     return `
//     @article{${},
//         author  = {Peter Adams},
//         title   = {The title of the work},
//         journal = {The name of the journal},
//         year    = 1993,
//         number  = 2,
//         pages   = {201-213},
//         month   = 7,
//         note    = {An optional note},
//         volume  = 4
//     }
//     `;
// }
//
// function _onePubToBib(pub) {
//
//     return pub;
// }
//
// function convertToBib(publications) {
//     return publications;
// }