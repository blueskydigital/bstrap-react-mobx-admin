import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import { FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap'

const BStrapDateInput = ({attr, label, record, onChange, errors, validationSuccess, attrValue, ...rest}) => {

  const dateTimeFormat = 'YYYY-MM-DD'
  const errorText = errors ? errors.get(attr) : undefined
  const validationState = errorText ? 'error' : (validationSuccess ? 'success' : null)
  const value = (attrValue && moment(attrValue).isValid() && moment(attrValue)) ||
    (attr && record.get(attr) && moment(record.get(attr)).isValid() ? moment(record.get(attr)) : null)

  function handleChange (value) {
    onChange(attr, !value || !moment(value).isValid() ? null : moment(value).format(dateTimeFormat))
  }

  return (
    <FormGroup validationState={validationState}>
      <ControlLabel>{label} {dateTimeFormat ? <small> ({dateTimeFormat})</small> : ''}</ControlLabel>
      <DatePicker
        dateFormat={dateTimeFormat}
        dropdownMode='select'
        locale='en-gb'
        onChange={handleChange}
        peekNextMonth
        placeholderText='Click to open the calendar'
        selected={value}
        showMonthDropdown
        showWeekNumbers
        showYearDropdown
        utcOffset={0}
        {...rest}
        />
      {errorText ? <HelpBlock>{errorText}</HelpBlock> : null}
    </FormGroup>
  )
}

BStrapDateInput.propTypes = {
  attr: PropTypes.string.isRequired,
  record: PropTypes.object.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.object
}

export default observer(BStrapDateInput)
