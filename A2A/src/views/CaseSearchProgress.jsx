import $ from 'jquery';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';

var CaseSearchProgress = React.createClass({
  propTypes: {
    searchParams: PropTypes.object,
    searchProgress: PropTypes.string,
    caseId: PropTypes.string
  },

  render: function() {
    var qs = "";
    if (this.props.searchParams) {
      qs = $.param(this.props.searchParams || {});
      if (qs) {
        qs = "?" + qs;
      }
    }

    var props = _.omit(_.clone(this.props), "searchProgress", "caseId", "searchParams");
    return (
      <div id="search-progress" {...props}>
        <ul className="nav nav-justified icon">
          <li role="presentation" className={this.props.searchProgress == "search" ? "active" : ""}>
            <div className="white-out"></div>
            <a href={`#/search${qs}`}>
              <span className="glyphicon glyphicon-search"></span>
              <br />
              Search
            </a>
          </li>
          {(() => {
            if (this.props.searchParams.fileDivisionCd != "other") {
              return (
                <li
                  role="presentation"
                  className={
                    this.props.searchProgress == "searchResults"
                      ? "active"
                      : this.props.searchProgress == "requestDetails"
                      ? ""
                      : "inactive"
                  }
                >
                  <div className="blue-line"></div>
                  {(content =>
                    this.props.caseId ? (
                      <Link
                        to={{
                          pathname: `/case-information/${this.props.caseId}`,
                          state: { searchParams: this.props.searchParams }
                        }}
                      >
                        {content}
                      </Link>
                    ) : (
                      <a>{content}</a>
                    ))(
                    // content of the <Link> or <a> element:
                    <div>
                      <span className="glyphicon glyphicon-th-list"></span>
                      <br />
                      Search Results
                    </div>
                  )}
                </li>
              );
            }
          })()}
          <li role="presentation" className={this.props.searchProgress == "requestDetails" ? "active" : "inactive"}>
            {this.props.searchProgress == "requestDetails" ? <div className="blue-line"></div> : null}
            <div className="white-out white-out-right"></div>
            <a>
              <span className="glyphicon glyphicon-pencil"></span>
              <br />
              Details of Request
            </a>
          </li>
        </ul>
      </div>
    );
  }
});

export default CaseSearchProgress;
