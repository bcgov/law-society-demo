import React from 'react';
import $ from 'jquery';
import _ from 'underscore';
import Moment from 'moment';

import { Form, FormGroup, Row, Col, ControlLabel, Radio, FormControl, ButtonGroup, Button, Well, Glyphicon } from 'react-bootstrap';
import DateTimePicker from 'react-bootstrap-datetimepicker';

/* Utilities */
/* Models and Collections */
import CaseSearchResponse from '../models/CaseSearchResponse';

/* Views and Components*/
import Spinner from '../components/Spinner.jsx';
import LocationsDropdown from '../components/LocationsDropdown.jsx';



export const SEARCH_MODE_PARAMS = [
  {
    id: 'file-number',
    label: 'File Number',
    mode: 'FILENO',
    paramName: 'fileNumberTxt',
    placeholder: '99999999',
  },
  {
    id: 'name',
    label: 'Surname',
    mode: 'PARTNAME',
    paramName: 'lastNm',
    placeholder: 'MacDonald',
  },
  {
    id: 'organization',
    label: 'Organisation',
    mode: 'PARTNAME',
    paramName: 'orgNm',
    placeholder: 'MegaCorp Inc.',
  },
];

export const OTHER_MODE_PARAMS = [
  {
    id: 'court-of-appeal',
    label: 'Court of Appeal',
    mode: 'OTHER',
    paramName: 'court-of-appeal',
    placeholder: '99999999',
  },
  {
    id: 'otr-sealed',
    label: 'OTR / Sealed',
    mode: 'OTHER',
    paramName: 'otr-sealed',
    placeholder: '99999999',
  },
  {
    id: 'ceremony',
    label: 'Ceremony',
    mode: 'OTHER',
    paramName: 'ceremony',
    placeholder: '',
    visibility: 'hidden',
  },
];


var FileSearchForm = React.createClass({
  propTypes: {
    formState: React.PropTypes.object,
    onSearch: React.PropTypes.func,
    onEnterDetails: React.PropTypes.func,
    onChangeCaseSearchProgress: React.PropTypes.func,
    fileDivisionLocked: React.PropTypes.bool.isRequired,
  },

  getInitialState() {
    if (!_.contains(['criminal', 'civil', 'other'], this.props.formState.fileDivisionCd)) { throw 'fileDivisionCdError'; }

    var searchMode = _.findWhere(SEARCH_MODE_PARAMS, { mode: 'FILENO' });

    return _.defaults(
      { // default state properties
        errors: {},
        searching: false, // never load w/ searching true
      },
      this.props.formState, // this.state.fileDivisionCd initialized from this.props.formState.fileDivisionCd
      {
        selectedSearchMode: _.extend(searchMode, { value: null }),
        dates: [Moment().startOf('day')],
      }
    );
  },

  // Return true if the file division is set for a criminal search, false otherwise
  getDivisionFlag(division = 'criminal') {
    var fd = this.state.fileDivisionCd;
    if (fd === undefined) { throw 'fileDivisionCdError'; }
    return fd === division;
  },

  courtClassChanged(e) {
    this.setState({ courtClassCd: e.target.value });
  },

  locationChanged(location) {
    this.setState({ fileAgencyId: location.get('code') });
  },

  handleDivisonChange(event) {
    this.setState({ fileDivisionCd: event.target.value });
    if (event.target.value === 'other') {
      this.setState({ selectedSearchMode: OTHER_MODE_PARAMS[0] });
    } else {
      this.setState({ selectedSearchMode: SEARCH_MODE_PARAMS[0] });
    }
    this.props.onChangeCaseSearchProgress(event.target.value);
    this.setState({
      errors: {},
    });
  },

  handleSearchModeChange(param/*, event*/) {
    var selectedModeParam = $.extend({}, param);
    this.setState({ selectedSearchMode: selectedModeParam });
  },

  handleSearchModeParamValueChange(event) {
    this.setState({ selectedSearchMode: $.extend({}, this.state.selectedSearchMode, { value: event.target.value }) });
  },

  filePrefixChange(e) {
    this.setState({ filePrefix: e.target.value.trim() || null });
  },

  fileSequenceChange(e) {
    this.setState({ fileSequence: e.target.value.trim() || null });
  },

  fileTypeRefChange(e) {
    this.setState({ fileTypeRef: e.target.value.trim() || null });
  },

  givenNameChange(e) {
    this.setState({ givenName: e.target.value.trim() || null });
  },

  styleOfCauseChange(e) {
    this.setState({ styleOfCause: e.target.value.trim() || null });
  },

  ceremonyOfChange(e) {
    this.setState({ ceremonyOf: e.target.value.trim() || null });
  },

  judgeChange(e) {
    this.setState({ judge: e.target.value.trim() || null });
  },

  roomChange(e) {
    this.setState({ room: e.target.value.trim() || null });
  },

  dateChange(i, date) {
    let dates = [...this.state.dates];
    dates[i] = Moment(date, 'x').startOf('day');
    this.setState({ dates });
  },

  handleSubmit(e) {
    e.preventDefault();
    this.search();
  },

  search() {
    /* Merge all query parameters from:
      - static query parameters
      - search mode query parameters
    */
    var queryParams = {
      searchMode: this.state.selectedSearchMode.mode,
      fileHomeAgencyId: this.state.fileAgencyId,
      fileDivisionCd: this.state.fileDivisionCd,
      courtClassCd: this.state.courtClassCd,
      filePrefixTxt: this.state.filePrefix,
      fileSuffixNo: this.state.fileSequence,
      mdocRefTypeCd: this.state.fileTypeRef,
      givenNm: this.state.givenName,
      styleOfCause: this.state.styleOfCause,
      ceremonyOf: this.state.ceremonyOf,
      judge: this.state.judge,
      room: this.state.room,
      date: this.state.date,
    };
    queryParams[this.state.selectedSearchMode.paramName] = this.state.selectedSearchMode.value;

    // Clean empty values from the querystring. e.g `{ filePrefixTxt: null}` → `{ }`
    queryParams = _.omit(queryParams, _.isEmpty);
    queryParams.appearances = [];

    // Do not submit form if the mandatory query parameters have not been filled in.
    var errors = {};
    if (!this.state.selectedSearchMode.value && this.state.selectedSearchMode.paramName != 'ceremony') {
      errors[this.state.selectedSearchMode.paramName] = 'Field required';
    }

    if (!this.state.fileAgencyId) {
      errors.location = 'Location required';
    }

    if (this.getDivisionFlag('other')) {
      errors = _.extend(errors, this.validateOtherFields());
    }
    this.setState({
      errors: errors,
    });

    if (_.size(errors) > 0) { return; }

    this.setState({ searchParams: queryParams, searching: true });

    if (this.getDivisionFlag('other')) {
      if(this.state.selectedSearchMode.paramName === 'ceremony') {
        queryParams.caseFileId =  `CER_${this.state.ceremonyOf}`; 
      } else {
        queryParams.caseFileId = this.state.selectedSearchMode.value;
        queryParams.accused = this.state.styleOfCause;
      }


      _.sortBy(this.state.dates).forEach((date) => {
        queryParams.appearances.push({
          appearanceDt: date.format('YYYY-MM-DD'),
          appearanceTm: date.format('YYYY-MM-DD'),
          estimatedStartTime: date.format('YYYY-MM-DD'),
          courtAgencyId: this.state.fileAgencyId,
          appearanceReasonFt: this.state.selectedSearchMode.label,
          judgeFullNm: this.state.judge,
          courtRoomCd: this.state.room,
        });
      });
      this.setState({ searching: false });
      this.props.onEnterDetails(queryParams);
    } else {
      var searchPromise = new CaseSearchResponse({}, { isCriminal: this.getDivisionFlag('criminal') }).fetch({ data: queryParams }).finally(() => {
        this.setState({ searching: false });
      });

      this.props.onSearch(searchPromise, queryParams, _.clone(this.state));
    }
  },

  validateOtherFields() {
    var otherErrors = {};
    if (this.state.selectedSearchMode.paramName === 'ceremony') {
      if (!this.state.ceremonyOf) {
        otherErrors.ceremonyOf = 'Ceremony of required';
      }
    } else {
      if (!this.state.styleOfCause) {
        otherErrors.styleOfCause = 'Style of Cause required';
      }
      if (!this.state.judge) {
        otherErrors.judge = 'Judge required';
      }
    }

    if (!this.state.room) {
      otherErrors.room = 'Room required';
    }

    if (!this.state.dates || this.state.dates.length <= 0) {
      otherErrors.dates = 'At least one date required';
    }
    return otherErrors;
  },

  /**
   * Creates a DateTimePicker for every date in state.dates
   */
  renderDateTimePickers() {
    return this.state.dates.map((date, i) =>
      <div key={i} className='dynamic-date'>
        <DateTimePicker inputFormat="DD-MMM-YYYY" mode="date" dateTime={Moment(date) + ''} inputProps={{ placeholder: 'DD-MMM-YYYY' }} onChange={this.dateChange.bind(this, i)} />
        <Button className='remove-button' onClick={this.removeDateTimePicker.bind(this, i)}><Glyphicon glyph="remove-circle" /></Button>
      </div>
    );
  },

  /**
   * Remove rendered DateTimePickers.
   * @param {*} i index of 'dates' array to remove.
   */
  removeDateTimePicker(i) {
    let dates = [...this.state.dates];
    dates.splice(i, 1);
    this.setState({ dates });
  },

  addDateTimePicker() {
    this.setState(prevState => ({ dates: [...prevState.dates, Moment().startOf('day')] }));
  },

  render() {
    var isCriminal = this.getDivisionFlag('criminal');
    var isCivil = this.getDivisionFlag('civil');
    var isOther = this.getDivisionFlag('other');
    var searchLabel = 'File Number or Party Name: ';
    var buttonLabel = 'Search';
    var params = SEARCH_MODE_PARAMS;
    if (isOther) {
      params = OTHER_MODE_PARAMS;
      searchLabel = 'Type: ';
      buttonLabel = 'Enter Details of Request';
    }

    return <Form inline className="file-search-form" onSubmit={this.handleSubmit
    } mode="GET" >
      <div className="field-row">
        <label htmlFor="division">Division:</label>
        <ButtonGroup className="division">
          <Button value="criminal" onClick={this.handleDivisonChange}
            bsStyle={isCriminal ? 'info' : 'default'} active={isCriminal} disabled={this.props.fileDivisionLocked && !isCriminal} >Criminal</Button>
          <Button value="civil" onClick={this.handleDivisonChange}
            bsStyle={isCivil ? 'info' : 'default'} active={isCivil} disabled={this.props.fileDivisionLocked && !isCivil} >Civil</Button>
          <Button value="other" onClick={this.handleDivisonChange}
            bsStyle={isOther ? 'info' : 'default'} active={isOther} disabled={this.props.fileDivisionLocked && !isOther} >Other</Button>
        </ButtonGroup>
      </div>
      <div className="search-mode">
        <label className="search-mode-label" htmlFor={`mode-${this.state.selectedSearchMode.paramName}`}>{searchLabel}</label>
        <ul className="search-modes clearfix">
          {
            params.map((param) => {
              return <li key={param.paramName} className={`clearfix ${this.state.selectedSearchMode.paramName === param.paramName ? 'selected' : ''} ${this.state.errors[param.paramName] ? 'error' : ''}`}>
                <div className="pull-left">
                  <Radio name="searchModeParam" onChange={this.handleSearchModeChange.bind(this, param)} checked={this.state.selectedSearchMode.paramName === param.paramName}>
                    {param.label}
                  </Radio>
                  <FormControl maxLength={255} className={`search-input mode-${param.paramName}`} placeholder={'e.g. ' + param.placeholder}
                    value={this.state.selectedSearchMode.paramName === param.paramName ? this.state.selectedSearchMode.value || '' : ''}
                    onChange={this.handleSearchModeParamValueChange}
                    bsStyle={this.state.errors[param.paramName] ? 'error' : null}
                    style={{ visibility: param.visibility }} />
                  {
                    this.state.errors[param.paramName] ? <div className="error-message">{this.state.errors[param.paramName]}</div> : null
                  }
                </div>
                {(() => {
                  if (param.id === 'file-number' && isCriminal) {
                    // include UI for criminal file number modifiers
                    return <Well bsStyle="sm" className="optional-file-fields optional-fields">
                      <h5>Optional...</h5>
                      <FormGroup controlId="file-number-prefix">
                        <ControlLabel>Prefix</ControlLabel>
                        <FormControl placeholder="AH" defaultValue={this.state.filePrefix || ''} onChange={this.filePrefixChange} />
                      </FormGroup>
                      <FormGroup controlId="file-number-seq">
                        <ControlLabel>Seq Number</ControlLabel>
                        <FormControl placeholder="1" defaultValue={this.state.fileSequence || ''} onChange={this.fileSequenceChange} />
                      </FormGroup>
                      <FormGroup controlId="file-number-ref">
                        <ControlLabel>Type Ref</ControlLabel>
                        <FormControl placeholder="B" defaultValue={this.state.fileTypeRef || ''} onChange={this.fileTypeRefChange} />
                      </FormGroup>
                    </Well>;
                  } else if (param.id === 'name') {
                    return <FormControl className="optional-fields" placeholder="e.g. Mary (optional)" defaultValue={this.state.givenName || ''} style={{ marginLeft: 20 }} onChange={this.givenNameChange} />;
                  }
                })()}
              </li>;
            })
          }
        </ul>
      </div>
      <div className="field-row">
        {(() => {
          return isOther ? <FormGroup style={{ display: 'inline-grid' }}>
            {(() => {
              return this.state.selectedSearchMode.paramName === 'ceremony' ? <FormGroup validationState={this.state.errors.ceremonyOfChange ? 'error' : null}>
                <Row className="field-row">
                  <Col md={4}>
                    <ControlLabel>Ceremony of:</ControlLabel>
                  </Col>
                  <Col md={6}>
                    <FormControl maxLength={250} placeholder="eg. Madame Justice Smith" style={{ width: '500px' }} onChange={this.ceremonyOfChange}></FormControl>
                  </Col>
                </Row>
              </FormGroup> : <FormGroup style={{ display: 'inline-grid' }}>
                  <FormGroup validationState={this.state.errors.styleOfCause ? 'error' : null}>
                    <Row className="field-row">
                      <Col md={4}>
                        <ControlLabel>Style of Cause:</ControlLabel>
                      </Col>
                      <Col md={6}>
                        <FormControl placeholder="eg. R vs. MacDonald" style={{ width: '500px' }} onChange={this.styleOfCauseChange}></FormControl>
                      </Col>
                    </Row>
                  </FormGroup>
                  <FormGroup validationState={this.state.errors.judge ? 'error' : null}>
                    <Row className="field-row">
                      <Col md={4}>
                        <ControlLabel>Judge:</ControlLabel>
                      </Col>
                      <Col md={6}>
                        <FormControl placeholder="eg. Justice Smith" onChange={this.judgeChange}></FormControl>
                      </Col>
                    </Row>
                  </FormGroup>
                </FormGroup>;
            })()}
            <FormGroup validationState={this.state.errors.room ? 'error' : null}>
              <Row className="field-row">
                <Col md={4}>
                  <ControlLabel>Room:</ControlLabel>
                </Col>
                <Col md={6}>
                  <FormControl maxLength={20} placeholder="eg. 406" onChange={this.roomChange}></FormControl>
                </Col>
              </Row>
            </FormGroup>
            <FormGroup validationState={this.state.errors.dates ? 'error' : null}>
              <Row style={{ width: 750 }}>
                <Col md={4}>
                  <ControlLabel>Date of Proceeding:</ControlLabel>
                </Col>
                <Col md={6}>
                  {this.renderDateTimePickers()}
                  <Button style={{ display: 'block' }} onClick={this.addDateTimePicker}>Add Date</Button>
                </Col>
              </Row>
            </FormGroup>
          </FormGroup>
            :
            <FormGroup controlId="search-mode-class">
              <ControlLabel>Class:</ControlLabel>
              <FormControl componentClass="select" placeholder="" value={this.state.courtClassCd || ''} onChange={this.courtClassChanged}>
                <option value="">-All-</option>
                <option value="A">Adult</option>
                <option value="T">Ticket (Traffic/Bylaw)</option>
                <option value="Y">Youth Justice</option>
              </FormControl>
            </FormGroup>;
        })()}
      </div>

      <div className="locations field-row">
        <LocationsDropdown label="Initiating Registry:" defaultValue={this.state.fileAgencyId} onChange={this.locationChanged} />
      </div>
      <div className="form-group" style={{ paddingLeft: 215 }}>
        <Button bsStyle="primary" type="submit">
          {buttonLabel}
          <Spinner show={this.state.searching} />
        </Button>
      </div>
    </Form >;
  },
});

export default FileSearchForm;
