function makeYearsClickable() {
    const yearControls = document.getElementsByClassName('yearControl');
    for (let i = 0; i < yearControls.length; i++) {
        const year = yearControls[i].getAttribute('data-year');
        yearControls[i].addEventListener("click", function () {
            _toggleClass(document.getElementById('pubsOfYear' + year), 'showMe', 'hideMe');
            document.getElementById('collapseYear' + year).innerHTML =
                document.getElementById('pubsOfYear' + year).classList.contains('showMe') ? '&#9660;' : '&#9654;';
        }, false);
    }
}


function _addResetFilteringButton(pubs) {
    document.getElementById('resetFiltering').appendChild(function () {
        let resetFilteringButton = document.createElement('button');
        resetFilteringButton.id = 'resetFilteringButton';
        resetFilteringButton.classList.add('pubBtn');
        resetFilteringButton.innerHTML = 'Reset';
        resetFilteringButton.addEventListener("click", function() {
            const selectionBoxes = document.getElementsByClassName('selectionBox');
            for (let i = 0; i < selectionBoxes.length; i++) {
                selectionBoxes[i].value = 'all';
            }
            filterAuthors(pubs);
        }, false);
        return resetFilteringButton;
    }());
}

function _createSelectionBox(parent, identifier, onChangeFunc) {
    let selectionBox = document.createElement('select');
    selectionBox.id = identifier;
    selectionBox.classList.add('selectionBox');
    selectionBox.classList.add('inactive');
    selectionBox.addEventListener("change", onChangeFunc, false);
    parent.appendChild(selectionBox);
    return selectionBox;
}

function _addOption(cls, text, value, parent) {
    let option = document.createElement('option');
    option.classList.add(cls);
    option.value = value;
    option.text = text;
    parent.appendChild(option);
    return option;
}

function _addPubWhereFiltering(pubs) {
    function _addWhereTypeOptions(optGroupLabel, whereType, pubWheres) {
        let optGroup = document.createElement('optGroup');
        optGroup.label = optGroupLabel;
        optGroup.classList.add('whereTypeOptGroup');
        for (let i = 0; i < pubWheres[whereType].length; i++) {
            _addOption(
            whereType + 'PubWhereOption',
            pubWheres[whereType][i],
            pubWheres[whereType][i],
            optGroup);
        }
        return optGroup;
    }

    const pubWheres = _getJournalsAndConferences(pubs);
    let pubWhereSelectionBox = _createSelectionBox(
        document.getElementById('pubWhereSelection'),
        'pubWhereSelectionBox',
        function () {
            toggleVisibilityOfPublications(pubs);
        }
    );
    _addOption('pubWhereOption', 'All J. and Conf.', 'all', pubWhereSelectionBox);
    pubWhereSelectionBox.appendChild(
        _addWhereTypeOptions('Journals', 'journal', pubWheres, pubWhereSelectionBox));
    pubWhereSelectionBox.appendChild(
        _addWhereTypeOptions('Conferences', 'conference', pubWheres, pubWhereSelectionBox));
}

function _getJournalsAndConferences(pubs) {
    function _getUniqueByType(pubs, pubType) {
        return _uniqueValues(pubs
            .filter(function (item) {
                return item['type'] === pubType;
            })
            .map(function (item) {
                return item['where'].abbreviated;
            }))
            .sort(function (a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });
    }

    return {
        'journal': _getUniqueByType(pubs, 'article'),
        'conference': _getUniqueByType(pubs, 'conference')
    };
}

function highlightChosenAuthor() {
    const authors = document.getElementsByClassName('authorName');
    for (let i = 0 ; i < authors.length ; i++) {
        authors[i].classList.remove('chosen');
        if (authors[i].getAttribute('data-js-author-name') === getActiveAuthor()) {
            authors[i].classList.add('chosen');
        }
    }
}

function makeAuthorNamesClickable(pubs) {
    const authorNameElements = document.getElementsByClassName('authorName');
    for (let i = 0; i < authorNameElements.length; i++) {
        const authorName = authorNameElements[i].getAttribute('data-js-author-name');
        authorNameElements[i].addEventListener("click", function () {
            const options = document.getElementById('mlsmAuthorSelectionBox').options;
            for (let j = 0; j < options.length; j++) {
                if (options[j].value === authorName) {
                    options[j].selected = true;
                    filterAuthors(pubs);
                }
            }
        }, false);
    }
}

function getOnlyShownJsPubs(jsPubs) {
    const shownPubIds = [].filter.call(
        document.getElementsByClassName("pubDetails"),
        function (htmlPub) {
            return htmlPub.classList.contains('showMe');
        }
    ).map(getRefToPub);
    return [].filter.call(
        jsPubs,
        function (jsPub) {
            return shownPubIds.indexOf(_getBibEntryIdentifier(jsPub)) >= 0;
        });
}

function getActivePubType() {
    return document.getElementById('pubTypeSelectionBox').value;
}

function _pubMatchesWhereFilter(jsPubs, htmlPub) {
    const selectedPubWhere = document.getElementById('pubWhereSelectionBox').value;
    return (selectedPubWhere === 'all') || (selectedPubWhere === htmlPub.getAttribute('data-pub-where-abbrv'));
}

function pubMatchesActivePubType(jsPubs, htmlPub) {
    return (getActivePubType() === 'all') ||
        (getActivePubType() === getPubType(getJsPub(jsPubs, htmlPub)));
}

function getActiveAuthor() {
    const mlsmAuthorSelectionBox = document.getElementById('mlsmAuthorSelectionBox');
    return mlsmAuthorSelectionBox ?
        mlsmAuthorSelectionBox.options[mlsmAuthorSelectionBox.selectedIndex].value :
        null;
}

function pubMatchesActiveAuthor(jsPubs, htmlPub) {
    return (getActiveAuthor() === 'all') ||
        (getJsPub(jsPubs, htmlPub).authors.indexOf(getActiveAuthor()) >= 0);
}

function toggleVisibilityOfPublications(jsPubs) {
    let htmlPubs = document.getElementsByClassName("pubDetails");
    for (let i = 0; i < htmlPubs.length; i++) {
        ((
            _pubMatchesWhereFilter(jsPubs, htmlPubs[i]) &&
            pubMatchesActivePubType(jsPubs, htmlPubs[i]) &&
            pubMatchesActiveAuthor(jsPubs, htmlPubs[i])
            ) ? showElement : hideElement
        )(htmlPubs[i]);
    }
    toggleYears();
}

function addFiltering(pubs) {
    addPubTypeSelection(pubs);
    addAuthorFiltering(pubs);
    _addPubWhereFiltering(pubs);
}

function getMlsmAuthors(pubs) {
    return _uniqueValues(
        pubs.map(function (pub) {
            return [].filter.call(
                pub.authors,
                function (author) {
                    return author[0] === '!';
                }
            )
        }).reduce(function (a1, a2) {
            return a1.concat(a2);
        })
    ).sort();
}

function getJsPubByPubId(jsPubs, pubId) {
    for (let i = 0; i < jsPubs.length; i++) {
        if (_getBibEntryIdentifier(jsPubs[i]) === pubId) {
            return jsPubs[i];
        }
    }
}

function getRefToPub(htmlPub) {
    return htmlPub.getAttribute('data-pubref');
}

function getJsPub(jsPubs, htmlPub) {
    return getJsPubByPubId(jsPubs, getRefToPub(htmlPub));
}

function filterAuthors(pubs) {
    toggleVisibilityOfPublications(pubs);
    highlightChosenAuthor();
}

function addAuthorFiltering(pubs) {
    const mlsmAuthors = getMlsmAuthors(pubs);
    let mlsmAuthorSelectionBox = _createSelectionBox(
        document.getElementById('authorSelection'),
        'mlsmAuthorSelectionBox',
        function () {
            filterAuthors(pubs);
        }
    );
    _addOption('authorOption', 'All MLSM', 'all', mlsmAuthorSelectionBox);
    for (let i = 0; i < mlsmAuthors.length; i++) {
        _addOption(
            'authorOption',
            toStylizedString(mlsmAuthors[i].slice(1)).replace(',', ''),
            mlsmAuthors[i],
            mlsmAuthorSelectionBox);
    }
}

function isShown(element) {
    return element.classList.contains('showMe');
}

function addClass(element, cls) {
    if (~element.classList.contains(cls)) {
        element.classList.add(cls);
    }
}

function removeClass(element, cls) {
    if (element.classList.contains(cls)) {
        element.classList.remove(cls);
    }
}

function hideElement(element) {
    removeClass(element, 'showMe');
    addClass(element, 'hideMe');
}

function showElement(element) {
    removeClass(element, 'hideMe');
    addClass(element, 'showMe');
}

function _toggleClass(element, cls1, cls2) {
    const classToAdd = element.classList.contains(cls1) ? cls2 : cls1;
    const classToRemove = element.classList.contains(cls1) ? cls1 : cls2;
    element.classList.add(classToAdd);
    element.classList.remove(classToRemove);
}


function downloadPubsNotIE(fileName, contents, contentType) {
    let element = document.createElement('a');
    element.style.display = 'none';
    element.setAttribute(
        'href',
        'data:' + contentType + encodeURIComponent(contents));
    element.setAttribute(
        'download',
        fileName);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function downloadPubsIE(fileName, contents, contentType) {
    return navigator
        .msSaveBlob(new Blob(
            [contents],
            {type: contentType}
        ), fileName);
}

function downloadPubs(pubs, contentConversionFunc, fileName, contentType) {
    const contents = contentConversionFunc(getOnlyShownJsPubs(pubs));
    return navigator.msSaveBlob ?
        downloadPubsIE(fileName, contents, contentType) :
        downloadPubsNotIE(fileName, contents, contentType);
}

function downloadPubsAsBib(pubs) {
    return downloadPubs(pubs, allPubsToBib, 'mlsm.bib', 'text/plain;charset=utf-8,');
}

function sortPubs(pubs) {
    function toComparisonString(pub) {
        return _get('year', '0000', pub) +
            _get('month', '00', pub) +
            _get('day', '00', pub) +
            _toPlainEnglishLowercase(_getFirstAuthorSurname(_get('authors', '', pub))) +
            _getFirstWordInTitleForBibIdentifier(_get('title', '', pub)) +
            _getPubtypeAsNumberForUniqueness(_get('type', 'unknownPubType', pub));
    }

    return pubs.sort(function (pub1, pub2) {
        const s1 = toComparisonString(pub1);
        const s2 = toComparisonString(pub2);
        return (s1 < s2) ? -1 : (s1 > s2 ? 1 : 0);
    }).reverse();

}

function sortObjectKeysShallow(obj) {
    let sortedObj = {};
    let keysSorted = Object.keys(obj).sort();
    for (let i = 0; i < keysSorted.length; i++) {
        sortedObj[keysSorted[i]] = obj[keysSorted[i]];
    }
    return sortedObj;
}

function addJsonIdentifiers(pubs) {
    return (pubs || []).map(
        function (pub) {
            let objCopy = JSON.parse(JSON.stringify(pub));
            objCopy['@id'] = _getBibEntryIdentifier(pub);
            return sortObjectKeysShallow(objCopy);
        });
}

function removeExclamationMarksFromAuthorNames(pubs) {
    return (pubs || []).map(
        function (pub) {
            let objCopy = JSON.parse(JSON.stringify(pub));
            for (let i = 0; i < objCopy.authors.length; i++) {
                objCopy.authors[i] = objCopy.authors[i].replace('!', '');
            }
            return objCopy;
        });
}

function downloadPubsAsRis(pubs) {
    return downloadPubs(pubs, pubsToRis, 'mlsm.ris', 'text/plain;charset=utf-8,');
}

function downloadPubsAsJson(pubs) {
    function toJson(chosenPubs) {
        return JSON.stringify(
            removeExclamationMarksFromAuthorNames(addJsonIdentifiers(chosenPubs)),
            null,
            '\t');
    }

    return downloadPubs(pubs, toJson, 'mlsm.json', 'text/plain;charset=utf-8,');
}

function addDownloadButton(btnId, btnText) {
    const pubDownloading = document.getElementById("pubDownloading");
    pubDownloading.innerHTML += '<button ' +
        ' class=pubBtn' +
        ' id=' + btnId +
        '>' + btnText +
        '</button>\n';
}

function addClickListernerToDownloadButton(pubs, btnId, func) {
    return document
        .getElementById(btnId)
        .addEventListener("click", function () {
            func(sortPubs(pubs));
        }, false);
}

function showDownloading(pubs) {
    addDownloadButton('bibDownloadBtn', 'Download BibTeX');
    addDownloadButton('jsonDownloadBtn', 'JSON');
    addDownloadButton('risDownloadBtn', 'RIS');
    addClickListernerToDownloadButton(pubs, 'bibDownloadBtn', downloadPubsAsBib);
    addClickListernerToDownloadButton(pubs, 'jsonDownloadBtn', downloadPubsAsJson);
    addClickListernerToDownloadButton(pubs, 'risDownloadBtn', downloadPubsAsRis);
}

function latexToHtml(string) {
    return string
        .replace("{\\'o}", "&oacute;")
        .replace("{\\o}", "&oslash;")
        .replace("{\\~a}", "&atilde;")
        .replace("{\\^a}", "&acirc;")
        .replace("{\\c{c}}", "&ccedil;")
}

function getPubType(item) {
    const typeNamesForDisplay = {
        'phdthesis': 'thesis',
    };
    return item.type ?
        (typeNamesForDisplay[item.type] || item.type) :
        "other";
}

function _uniqueValues(arr) {
    let uniques = [];
    for (let i = 0; i < arr.length; i++) {
        if (uniques.indexOf(arr[i]) < 0) {
            uniques.push(arr[i])
        }
    }
    return uniques;
}

function publishedPubTypes(pubsObj) {
    return _uniqueValues(pubsObj.map(function (item) {
        return getPubType(item);
    })).sort();
}

function toggleYears() {
    let allYears = document.getElementsByClassName("pubsOfYear");
    for (let i = 0; i < allYears.length; i++) {
        const visiblePubsInYear = [].filter.call(
            allYears[i].childNodes,
            function (child) {
                return child.classList && child.classList.contains('pubDetails') && isShown(child);
            });
        (visiblePubsInYear.length > 0 ? showElement : hideElement)(
            document.getElementById('pubYear' + allYears[i].getAttribute('data-year'))
        );
    }
}

function capitalizeFirstLetter(string) {
    return string[0].toUpperCase() + string.slice(1);
}

function addPubTypeSelection(pubs) {
    let pubTypeSelectionBox = _createSelectionBox(
        document.getElementById('pubTypeSelection'),
        'pubTypeSelectionBox',
        function () {
            toggleVisibilityOfPublications(pubs);
        }
    );
    _addOption(
        'pubTypeOption',
        'All Types',
        'all',
        pubTypeSelectionBox
    );
    for (let i = 0; i < publishedPubTypes(pubs).length; i++) {
        _addOption(
            'pubTypeOption',
            capitalizeFirstLetter(publishedPubTypes(pubs)[i]),
            publishedPubTypes(pubs)[i],
            pubTypeSelectionBox
        );
    }
}

function toStylizedString(author) {
    const surname = author.split(", ")[0];
    const initials = author.split(", ")[1].split(" ").map(function (s) {
        return s[0].toUpperCase() + '.';
    }).join(" ");
    return latexToHtml(surname) + ", " + latexToHtml(initials);
}

function getAuthorSpan(author) {
    return '<span' +
        ' data-js-author-name="' + author + '"' +
        ' class="authorName ' + (author[0] === '!' ? 'mlsmAuthor' : 'nonMlsmAuthor') + '"' +
        '>' +
        toStylizedString(author[0] === '!' ? author.slice(1) : author) +
        '</span>';
}

function getAuthorsString(authors) {
    return authors.map(getAuthorSpan).join(", ") + "\n";
}

function getPubTypeImage(pubType) {
    const imgs = {
        thesis: {src: "/wp-content/uploads/2020/02/graduate_cap_simple_bigger_gap.png", alt: 'PhDThesis'},
        article: {src: "/wp-content/uploads/2020/01/journal.png", alt: 'Article'},
        techreport: {src: "/wp-content/uploads/2020/01/techreport.png", alt: 'Technical Report'},
        conference: {src: "/wp-content/uploads/2020/01/presentation.png", alt: 'Conference'},
        book: {src: "/wp-content/uploads/2020/01/book_big.png", alt: 'Book'},
        unknownPubType: {src: "/wp-content/uploads/2020/01/unknown.png", alt: 'Publication'}
    };
    let imgTag = '<img class=pubimg src=';
    imgTag += (imgs[pubType] ? imgs[pubType].src : imgs.unknownPubType.src);
    imgTag += ' alt=';
    imgTag += (imgs[pubType] ? imgs[pubType].alt : imgs.unknownPubType.alt);
    imgTag += ' title=';
    imgTag += (imgs[pubType] ? imgs[pubType].alt : imgs.unknownPubType.alt);
    imgTag += '>';
    return imgTag;
}

function getWhereAndWhenPublished(pub) {
    return [
        (pub['where'] ? pub['where'].full : ''),
        (pub['volume'] ? ('Vol. ' + pub['volume']) : ''),
        (pub['number'] ? ('No. ' + pub['number']) : ''),
        (pub['pages'] ? ('pp. ' + pub['pages']) : ''),
        // (pub['publisher'] || ''),
        (pub['year'] || ''),
    ].filter(function (e) {
        return e;
    })
        .join(', ')
}

function onePubToHtml(pub) {
    function link(pub, linkKey, linkName) {
        return !pub.links[linkKey] ? '' : '<span class="pubLink"> <a target="_blank" href="' +
            pub.links[linkKey] + '" rel="noopener noreferrer">[' + linkName + ']</a></span>';
    }

    return '<div' +
        ' data-pub-where-abbrv="' + pub['where'].abbreviated + '"' +
        ' data-pub-type="' + getPubType(pub) + '"' +
        ' data-pubref="' + _getBibEntryIdentifier(pub) + '"' +
        ' class="pubDetails pubType_' + getPubType(pub) + ' showMe">\n' +
        '<div class=pubTypeAndAuthors>' +
        '<span class="pubType">' + getPubTypeImage(getPubType(pub)) + '</span>\n' +
        '<span class=space></span>\n' +
        '<span class="authors">' + getAuthorsString(pub['authors']) + '</span>\n' +
        '</div>\n' +
        '<div class="titleAndLinks">' +
        '<span class="pubTitle">' + pub.title + '</span>' +
        link(pub, 'pdf', 'PDF') +
        link(pub, 'code', 'Code') +
        link(pub, 'data', 'Data') +
        '</div>\n' +
        '<div class="pubWhereAndWhen">' +
        'in ' + getWhereAndWhenPublished(pub) +
        '</div>' +
        '</div>';
}

function groupByYear(pubs) {
    let groups = {};
    for (let i = 0; i < pubs.length; i += 1) {
        let year = pubs[i].year;
        if (year) {
            if (!(year in groups)) {
                groups[year] = [];
            }
            groups[year].push(pubs[i])
        }
    }
    return groups;
}

function getItemsAsString(pubs) {
    let items = '';
    for (let j = 0; j < pubs.length; j += 1) {
        items += onePubToHtml(pubs[j]);
    }
    return items;
}

function showPublications(pubs) {
    let pubsDiv = document.getElementById("publications");
    let pubsGroupedByYear = groupByYear(pubs);
    let yearsInDescendingOrder = Object
        .keys(pubsGroupedByYear)
        .sort(function (a, b) {
            return b - a;
        });
    for (let i = 0; i < yearsInDescendingOrder.length; i += 1) {
        let year = yearsInDescendingOrder[i];
        let pubsOfYear = pubsGroupedByYear[year];
        pubsDiv.innerHTML +=
            '<div data-year="' + year + '" class="pubYear showMe" id=pubYear' + year + '>\n' +
            '<div data-year="' + year + '" class="yearControl">' +
                '<h1 id="header' + year + '" class="headerYear">' + year + '</h1>\n' +
                '<h4 id="collapseYear' + year +'" class="collapseYear">' + '&#9660;' + '</h4>\n' +
            '</div>' +
            '<div data-year="' + year + '" class="pubsOfYear showMe" id="' + ("pubsOfYear" + year) + '">' +
                getItemsAsString(pubsOfYear) +
            '</div>' +
            '<div class="pub-su-divider pub-su-divider-style-default">' +
            '   <a href="#">Go to top</a>' +
            '</div>' +
            '</div>';
    }
}

function main(pubs) {
    _addResetFilteringButton(pubs);
    addFiltering(pubs);
    showDownloading(pubs);
    showPublications(pubs);
    makeAuthorNamesClickable(pubs);
    makeYearsClickable();
}
