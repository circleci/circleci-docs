var lunr = require('lunr');
var React = require('react');
var ReactDOM = require('react-dom');


var SearchInput = React.createClass(
  {
    render: function () {
      var hardCodedTags = ['getting-started', 'reference', 'nodejs', 'docker', 'browser-testing', 'troubleshooting', 'language-guides', 'mobile'],
          tags = hardCodedTags.map(function (tag) {
            var boundClickHandler = this.props.handleTagClick.bind(null, tag),
                isActive = this.props.filters.tags.indexOf(tag) >= 0;
            return (
              <span key={'toggle-' + tag}><a className={'tag ' + (isActive ? 'active' : '')} href="#" onClick={boundClickHandler}>{tag}</a> </span>
            )
          }, this);
      return (
        <form className="doc-search form-horizontal">
          <div className="form-group">
            <label className="col-sm-2 control-label" htmlFor="search">Search by keyword:</label>
            <div className="col-sm-10">
              <input className="form-control" id="search" placeholder="Search..." type="text" onChange={this.props.handleTextChange} />
            </div>
          </div>
          <div className="form-group">
            <label className="col-sm-2">Filter by tags:</label>
            <div className="col-sm-10">
              <p>
                {tags}
                <b>more <i className="fa fa-caret-down"></i></b>
              </p>
            </div>
          </div>
        </form>
      );
    }
  }
);

var SearchResult = React.createClass(
  {
    render: function () {
      var tags = this.props.doc.tags.map(function (tag) {
        return (<span key={this.props.doc.slug + '-' + tag}><span className="tag">{tag}</span> </span>);
      }, this);
      var maybeHr;
      if (this.props.last) {
        maybeHr = '';
      } else {
        maybeHr = <hr/>;
      }
      return (
        <li>
          <h4>{this.props.doc.title}</h4>
          <p>{this.props.doc.excerpt}</p>
          {tags}
          {maybeHr}
        </li>
      );
    }
  }
);

var SearchResults = React.createClass(
  {
    render: function () {
      var results = this.props.results.map(function (result, idx, arr) {
        var isLast = idx + 1 === arr.length;
        return (<SearchResult doc={result} key={result.slug} last={isLast} />);
      });
      return (
        <ul className="article-list">
          {results}
        </ul>
      );
    }
  }
);

var filtersFromHash = function (hash) {
  var queryMatches = hash.match(/q=([^&]*)/),
      tagMatches = hash.match(/t=([^&]*)/);
  return {
    query: queryMatches ? decodeURIComponent(queryMatches[1]) : '',
    tags: tagMatches ? decodeURIComponent(tagMatches[1]).split(',') : []
  }
}

var hashFromFilters = function (filters) {
  var q = encodeURIComponent(filters.query),
      t = encodeURIComponent(filters.tags.join(',')),
      params = [];
  if (q) {
    params.push('q=' + q);
  }
  if (t) {
    params.push('t=' + t);
  }
  return '#' + params.join('&');
}

var scoreComparator = function (a, b) {
  if (a.score < b.score) {
    return 1;
  }
  if (a.score > b.score) {
    return -1;
  }
  return 0;
};

var lunrSearch = function (idx, query) {
  idx.search(query).reduce(function(prev, curr) {
    prev[curr.ref] = curr.score;
    return prev;
  }, {})
};

var filterByQuery = function (results, searchResults) {
  return results.map(function (doc) {
    doc.score = searchResults[doc.slug];
    return doc;
  }).filter(function (doc) {
    return doc.score;
  }).sort(scoreComparator);
};

var filterByTags = function (results, tags) {
  return results.filter(function (doc) {
    return tags.every(function (filterTag) {
      return doc.tags.indexOf(filterTag) >= 0;
    });
  });
};

var DocSearch = React.createClass(
  {
    getInitialState: function () {
      return filtersFromHash(window.location.hash);
    },
    handleTagClick: function (tag, e) {
      e.preventDefault();
      this.setState(function (state, props) {
        var tagIndex = state.tags.indexOf(tag);
        if (tagIndex < 0) {
          state.tags.push(tag);
        } else {
          state.tags.splice(tagIndex, 1);
        }
        return {tags: state.tags};
      });
    },
    handleTextChange: function (e) {
      this.setState({query: e.target.value });
    },
    componentDidUpdate: function (props, state) {
      history.pushState(null, null, hashFromFilters(this.state));
    },
    render: function () {
      var idx = this.props.provided.docSearchIndex,
          tags = this.state.tags,
          query = this.state.query,
          searchResults = idx && query ? lunrSearch(idx, query) : null,
          results = this.props.provided.docManifest;
      results = filterByTags(results, tags);
      if (searchResults) {
        results = filterByQuery(results, searchResults);
      }
      return (
        <div>
          <div className="search">
            <div className="container">
              <SearchInput handleTagClick={this.handleTagClick} handleTextChange={this.handleTextChange} filters={this.state} />
            </div>
          </div>
          <div className="container">
            <SearchResults results={results}/>
          </div>
        </div>
      )
    }
  }
);

ReactDOM.render(
  <DocSearch provided={window.provided} />,
  document.getElementById('DocSearch')
);

var xhr = new XMLHttpRequest();
xhr.open('GET', encodeURI('/dist/idx.json'));
xhr.onload = function() {
    if (xhr.status === 200) {
      window.provided.docSearchIndex = lunr.Index.load(JSON.parse(xhr.responseText));
    }
};
xhr.send();
