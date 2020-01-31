function addFiltering(pubs) {
    addPubTypeSelection(pubs);
    addAuthorFiltering(pubs);
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
    ).map(function (name) {
        return name.slice(1);
    }).sort();
}

function addAuthorFiltering(pubs) {
    const mlsmAuthors = getMlsmAuthors(pubs)
        .map(toStylizedString);
    let mlsmAuthorSelectionBox = document.createElement('select');
    mlsmAuthorSelectionBox.id = 'mlsmAuthorSelectionBox';
    for (let i = 0 ; i < mlsmAuthors.length ; i++) {
        let option = document.createElement('option');
        option.value = mlsmAuthors[i];
        option.text = mlsmAuthors[i];
        mlsmAuthorSelectionBox.appendChild(option);
    }
    document
        .getElementById('authorSelection')
        .appendChild(mlsmAuthorSelectionBox);
}

function isShown(element) {
    return element.classList.contains('shown');
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

function hideDiv(divElement) {
    removeClass(divElement, 'shown');
    addClass(divElement, 'hidden');
}

function showDiv(divElement) {
    removeClass(divElement, 'hidden');
    addClass(divElement, 'shown');
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

function downloadPubs(fileName, contents, contentType) {
    return navigator.msSaveBlob ?
        downloadPubsIE(fileName, contents, contentType) :
        downloadPubsNotIE(fileName, contents, contentType);
}

function downloadPubsAsBib(pubs) {
    return downloadPubs('mlsm.bib', allPubsToBib(pubs), 'text/plain;charset=utf-8,');
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

function downloadPubsAsJson(pubs) {
    return downloadPubs(
        'mlsm.json',
        JSON.stringify(
            removeExclamationMarksFromAuthorNames(addJsonIdentifiers(pubs)),
            null,
            '\t'),
        'text/plain;charset=utf-8,');
}

function addDownloadButton(btnId, btnText) {
    const pubDownloading = document.getElementById("pubDownloading");
    pubDownloading.innerHTML += '<button ' +
        ' class=downloadBtn' +
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
    addClickListernerToDownloadButton(pubs, 'bibDownloadBtn', downloadPubsAsBib);
    addClickListernerToDownloadButton(pubs, 'jsonDownloadBtn', downloadPubsAsJson)
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
    return item.type ? (typeNamesForDisplay[item.type] || item.type) : "other";
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
    let allYears = document.getElementsByClassName("pubYear");
    for (let i = 0; i < allYears.length; i++) {
        let visiblePubsInYear = [].filter.call(
            allYears[i].childNodes,
            function (child) {
                return child.classList && child.classList.contains('pubDetails') && isShown(child);
            });
        if (visiblePubsInYear.length > 0) {
            showDiv(allYears[i]);
        } else {
            hideDiv(allYears[i]);
        }
    }
}

function activateButton(pubType) {
    let allButtons = document.getElementsByClassName("filterBtn");
    for (let i = 0; i < allButtons.length; i++) {
        allButtons[i].classList.remove('active');
        if (allButtons[i].id === 'btn_' + pubType) {
            allButtons[i].classList.add('active');
        }
    }
}

function filterPubType(pubType) {
    let allPubs = document.getElementsByClassName("pubDetails");
    for (let i = 0; i < allPubs.length; i++) {
        if ((pubType === 'all') ||
            (allPubs[i].classList.contains('pubType_' + pubType))) {
            showDiv(allPubs[i]);
        } else {
            hideDiv(allPubs[i]);
        }
    }
    activateButton(pubType);
    toggleYears();
}

function capitalizeFirstLetter(string) {
    return string[0].toUpperCase() + string.slice(1);
}

function addPubTypeSelection(pubs) {
    function addSelection(elmnt, pubType, txt) {
        elmnt.innerHTML += '<button' +
            ' class="filterBtn"' +
            ' onclick=filterPubType("' + pubType + '")' +
            ' id=btn_' + pubType +
            '>' + txt +
            '</button>\n';
    }

    let selDiv = document.getElementById('pubTypeSelection');
    addSelection(selDiv, 'all', 'Show all');
    let pubTypesToFilter = publishedPubTypes(pubs);
    for (let i = 0; i < pubTypesToFilter.length; i++) {
        addSelection(selDiv, pubTypesToFilter[i],
            capitalizeFirstLetter(pubTypesToFilter[i]))
    }
    activateButton('all');
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
        ' class=' + (author[0] === '!' ? 'mlsmAuthor' : 'nonMlsmAuthor') +
        '>' +
        toStylizedString(author[0] === '!' ? author.slice(1) : author) +
        '</span>';
}

function getAuthorsString(authors) {
    return authors.map(getAuthorSpan).join(", ") + "\n";
}

function getPubTypeImage(pubType) {
    const imgs = {
        thesis: {src: "/wp-content/uploads/2020/01/graduate_cap.png", alt: 'PhDThesis'},
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
        (pub['where'] || ''),
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

    return '<div class="pubDetails pubType_' + getPubType(pub) + ' shown">\n' +
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
        pubsDiv.innerHTML += '<div class="pubYear shown" id=pubYear' + year + '>\n' +
            '<h1 class="headerYear">' + year + '</h1>\n' +
            getItemsAsString(pubsOfYear) +
            '<div class="pub-su-divider pub-su-divider-style-default">' +
            '   <a href="#">Go to top</a>' +
            '</div>' +
            '</div>';
    }
}

function main(pubs) {
    showPublications(pubs);
    addFiltering(pubs);
    showDownloading(pubs);
}
