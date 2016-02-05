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
              <input className="form-control" id="search" placeholder="Search..." type="text" />
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
      var doc = this.props.doc,
          tags = doc.tags.map(function (tag) {
        return (<span key={doc.slug + '-' + tag}><span className="tag">{tag}</span> </span>);
      });
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

var DocSearch = React.createClass(
  {
    getInitialState: function () {
      return filtersFromHash(window.location.hash);
    },
    handleTagClick: function (tag) {
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
    render: function () {
      var filterTags = this.state.tags,
         results = this.props.manifest.filter(function (doc) {
        return filterTags.every(function (filterTag) {
          return doc.tags.indexOf(filterTag) >= 0;
        });
      });
      return (
        <div className="search">
          <div className="container">
            <SearchInput handleTagClick={this.handleTagClick} filters={this.state} />
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
  <DocSearch manifest={window.docManifest} />,
  document.getElementById('DocSearch')
);
