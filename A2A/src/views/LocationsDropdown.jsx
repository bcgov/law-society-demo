import PropTypes from 'prop-types';
import React from 'react';
import { ControlLabel, FormControl, FormGroup, HelpBlock } from 'react-bootstrap';

import currentUser from '../user';
import CodeLookups from '../utils/CodeLookups';

/* Utilities */
var LocationsDropdown = React.createClass({
  getDefaultProps() {
    return {
      onClick: function() {}
    };
  },

  propTypes: {
    label: PropTypes.string,
    defaultValue: PropTypes.string,
    placeholder: PropTypes.string,
    error: PropTypes.object,
    onChange: PropTypes.func
  },

  locationChange(e) {
    var location = CodeLookups.getCodeTable("locations").findWhere({ code: e.target.value });

    this.props.onChange(location);
  },

  render() {
    var currentUserLocationCode = currentUser.get("justinAgencyId");
    var currentUserLocation = CodeLookups.getCodeTable("locations").findWhere({ code: currentUserLocationCode });
    var currentUserRegionId = currentUserLocation.get("regionId");

    var locations = CodeLookups.getCodeTable("locations").filter(location => {
      if (currentUser.hasPermission("ORDER_PROVINCE")) {
        return true;
      } else if (currentUser.hasPermission("ORDER_REGION")) {
        return currentUserRegionId === location.get("regionId");
      } else {
        return location.get("code") === currentUserLocationCode;
      }
    });

    return (
      <FormGroup controlId="location-dropdown" validationState={this.props.error ? "error" : null}>
        <ControlLabel>{this.props.label ? this.props.label : "Location:"}</ControlLabel>
        <FormControl
          componentClass="select"
          defaultValue={this.props.defaultValue || ""}
          onChange={this.locationChange}
          readOnly={locations.length === 1}
        >
          {this.props.placeholder ? <option value="">{this.props.placeholder}</option> : null}
          {// Include the list of locations in the collection
          locations.map(locationItem => {
            return (
              <option key={locationItem.get("code")} value={locationItem.get("code")}>
                {locationItem.get("longDesc")}
              </option>
            );
          })}
        </FormControl>
        {this.props.error ? <HelpBlock>{this.props.error}</HelpBlock> : null}
      </FormGroup>
    );
  }
});

export default LocationsDropdown;
