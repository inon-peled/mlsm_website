import json


def _one_pub_to_html(pub):
    def link(pub, link_key, link_name):
        try:
            url = pub['links'][link_key]
            return '' if len(url) == 0 else '<span class="pubLink"><a target="_blank" href="%s"> [%s]</a></span>' % \
                                                (url, link_name)
        except (KeyError, TypeError):
            return ''

    return \
        ('<span class="authors">%s</span>\n' % pub['authors']) + \
        ('<span class="pubTitle">%s</span>' % pub['title']) + \
        link(pub, 'pdf', 'PDF') + \
        link(pub, 'code', 'Code') + \
        link(pub, 'data', 'Data') + \
        ('\n<span class="pubWhereAndWhen">in %s, %s</span>' % (pub['pub']['where'], pub['pub']['year']))


def _group_by_year(pubs):
    years = map(lambda pub: pub['pub']['year'], pubs)
    return {year: list(filter(lambda x: x['pub']['year'] == year, pubs)) for year in years}


def main(json_path, output_path):
    with open(json_path) as pubs_f, open(output_path, 'w') as out_f:
        html = '<!--\n' \
               '*********************************************************************************\n' \
               '* DO NOT EDIT THIS AUTOMATICALLY GENERATED HTML, INSTEAD EDIT publications.json *\n' \
               '*********************************************************************************\n' \
               '-->\n\n'
        html += '<div class="publications">\n'
        for year, pubs in sorted(_group_by_year(json.load(pubs_f)).items(), reverse=True):
            html += '<h1 class="header">%s</h1>\n<ul>\n' % year
            for pub in pubs:
                html += '<li>\n%s\n</li>\n' % _one_pub_to_html(pub)
            html += '</ul>\n'
        html += '</div>'
        out_f.write(html)

if __name__ == '__main__':
    main('publications.json', 'out.html')