import json


def get_authors_string(authors):
    def to_stylized_string(author):
        surname = author.split(' ')[-1]
        first_names_initials = ' '.join(map(lambda x: x[0].capitalize() + '.', author.split(' ')[:-1]))
        return ', '.join([surname, first_names_initials]
                        )
    return authors if type(authors) is str else ', '.join(map(to_stylized_string, authors))


def _one_pub_to_html(pub):
    def link(pub, link_key, link_name):
        try:
            url = pub['links'][link_key]
            return '' if len(url) == 0 else '<span class="pubLink"><a target="_blank" href="%s"> [%s]</a></span>' % \
                                                (url, link_name)
        except (KeyError, TypeError):
            return ''

    return \
        ('<span class="authors">%s</span>\n' % get_authors_string(pub['authors'])) + \
        ('<span class="pubTitle">%s</span>' % pub['title']) + \
        link(pub, 'pdf', 'PDF') + \
        link(pub, 'code', 'Code') + \
        link(pub, 'data', 'Data') + \
        ('\n<span class="pubWhereAndWhen">in %s, %s</span>' % (pub['pub']['where'], pub['pub']['year']))


def _group_by_year_and_ignore_entries_without_year(pubs):
    years = filter(lambda x: x is not None, map(lambda pub: pub['pub']['year'], pubs))
    return {year: list(filter(lambda x: x['pub']['year'] == year, pubs)) for year in years}


def main(json_path, output_path):
    with open(json_path) as pubs_f, open(output_path, 'w') as out_f:
        html = '<!--\n' \
               '***************************************************************\n' \
               '* DO NOT EDIT THIS AUTOMATICALLY GENERATED HTML, USE INSTEAD: *\n' \
               '* https://github.com/inon-peled/mlsm_website                  *\n' \
               '***************************************************************\n' \
               '-->\n\n'
        html += '<div class="publications">\n'
        grouped_and_sorted_by_year = sorted(
            _group_by_year_and_ignore_entries_without_year(json.load(pubs_f)).items(), reverse=True)
        for year, pubs in grouped_and_sorted_by_year:
            html += '<h1 class="headerYear">%s</h1>\n<ul>\n' % year
            for pub in pubs:
                html += '<li>\n%s\n</li>\n' % _one_pub_to_html(pub)
            html += '</ul>\n'
            html += '[su_divider top="yes" text="Go to top" style="default" divider_color="#990000" link_color="#990000" size="3" margin="15" class=""]\n'
        html += '</div>'
        out_f.write(html)
        print('Wrote HTML to %s' % output_path)

if __name__ == '__main__':
    main('publications.json', 'out.html')