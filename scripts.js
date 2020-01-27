<script type="text/javascript">
	function toggleYears() {
		var allYears = document.getElementsByClassName("pubYear");
		for(var i = 0; i < allYears.length; i++) {
			var visiblePubsInYear = [].filter.call(
				allYears[i].childNodes, 
				function(child) {
					return (child.className) &&
						   (child.className.indexOf("pubDetails") > -1) && 
					       (child.style.display !== "none");
				});
			if (visiblePubsInYear.length > 0) {
				allYears[i].style.display = "block";
			}
			else {
				allYears[i].style.display = "none";
			}
		}
	}

	function toggleVisibility(elmnt) {
		if (elmnt.style.display === "none") {
			elmnt.style.display = "block";
		} else {
			elmnt.style.display = "none";
		}
	}

	function togglePubType(pubType) {
		var allPubs = document.getElementsByClassName("pubType" + pubType);
		for(var i = 0; i < allPubs.length; i++) {
			toggleVisibility(allPubs[i])
		}
		toggleYears();
	}

    function selection() {
        var selDiv = document.getElementById('pubTypeSelection');
		selDiv.innerHTML += '<img' +
			' onclick=togglePubType("article")' + 
			' id="selectArticle"' + 
			' title="Article"' +
			' alt="Article"' +
			' src="/wp-content/uploads/2020/01/journal.png">' + 
		'</img>';
    }
</script>




<script type="text/javascript">
	function getPubTypeClass(pub) {
		return pub['type'] ? pub['type'] : 'unknownPubType';
	}

    function getAuthorsString(authors) {
        function toStylizedString(author) {
            const surname = author.split(" ").slice(-1);
            const initials = author.split(" ").slice(0, -1).map(function (s) {
                return s[0].toUpperCase() + '.';
            }).join(" ");
            return surname + ", " + initials;
        }

        return (typeof authors === 'string' ? authors : authors.map(toStylizedString).join(", ")) + "\n";
    }

	function getPubTypeImage(pubType) {
		imgs = {
			article: {src: "/wp-content/uploads/2020/01/journal.png", alt: 'Article'},
			techreport: {src: "/wp-content/uploads/2020/01/techreport.png", alt: 'Technical Report'},
			presentation: {src: "/wp-content/uploads/2020/01/presentation.png", alt: 'Presentation'},
			book: {src: "/wp-content/uploads/2020/01/book.png", alt: 'Book'},
			unknownPubType: {src: "/wp-content/uploads/2020/01/unknown_pubtype.png", alt: 'Publication'}
		};
		imgTag = '<img class=pubimg src=';
		imgTag += (imgs[pubType] ? imgs[pubType].src : imgs.unknownPubType.src);
		imgTag += ' alt=';
		imgTag += (imgs[pubType] ? imgs[pubType].alt : imgs.unknownPubType.alt);
		imgTag += ' title=';
		imgTag += (imgs[pubType] ? imgs[pubType].alt : imgs.unknownPubType.alt);
		imgTag += '>';
		return imgTag;
	}
	
    function onePubToHtml(pub) {
        function link(pub, linkKey, linkName) {
            return !pub.links[linkKey] ? '' : '<span class="pubLink"><a target="_blank" href="' +
                pub.links[linkKey] + '" rel="noopener noreferrer"> [' + linkName + ']</a></span>';
        }

        return '<div class="pubDetails pubType' + (pub.type ? pub.type : 'unknown') + '">\n' + 
			'<div class=pubTypeAndAuthors>' + 
				'<span class="pubType">' + getPubTypeImage(pub.type) + '</span>\n' +
				'<span class=space></span>\n' + 
				'<span class="authors">' + getAuthorsString(pub['authors']) + '</span>\n' +
			'</div>\n' + 
			'<div class="titleAndLinks">' +
				'<span class="pubTitle">' + pub.title + '</span>' +
				link(pub, 'pdf', 'PDF') +
				link(pub, 'code', 'Code') +
				link(pub, 'data', 'Data') +
			'</div>\n' +
			'<div class="pubWhereAndWhen">in ' + 
				pub.pub.where + ', ' + 
				pub.pub.year + 
			'</div>' +
			'</div>';
    }

    function groupByYear(pubs) {
        groups = {};
        for (var i = 0; i < pubs.length; i += 1) {
            var year = pubs[i].pub.year;
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
		items = '';
		for (var j = 0; j < pubs.length; j += 1) {
			items += onePubToHtml(pubs[j]);
		}
		return items;
	}
	
    function showPublications(pubs) {
        var pubsDiv = document.getElementById("publications");
        var pubsGroupedByYear = groupByYear(pubs);
        var yearsInDescendingOrder = Object
            .keys(pubsGroupedByYear)
            .sort(function (a, b) {
                return b - a;
            });
        for (var i = 0; i < yearsInDescendingOrder.length; i += 1) {
            var year = yearsInDescendingOrder[i];
            var pubsOfYear = pubsGroupedByYear[year];
			pubsDiv.innerHTML += '<div class=pubYear id=pubYear' + year + '>\n' + 
				'<h1 class="headerYear">' + year + '</h1>\n' +
				getItemsAsString(pubsOfYear) +
				'<div class="pub-su-divider pub-su-divider-style-default" style="margin:15px 0;border-width:3px;border-color:#990000"><a href="#" style="color:#990000">Go to top</a></div>' +
			'</div>';
        }
    }
</script>
