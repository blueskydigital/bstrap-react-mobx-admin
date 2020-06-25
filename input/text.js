import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { FormGroup, ControlLabel, FormControl, HelpBlock, Checkbox } from 'react-bootstrap'

const TextInput = ({ attr, record, label, onChange, onHeaderCheckedChange, errors, validationSuccess, dateFormat, attrValue, ...rest }) => {
  function handleChange (event) {
    onChange(attr, event.target.value)
  }

  function formateDate ({ date = new Date(), separator = '-', order = ['year', 'month', 'day'] }) {
    const obj = {
      year: date.getUTCFullYear(),
      month: (date.getUTCMonth() + 1 < 10) ? ('0' + (date.getUTCMonth() + 1)) : (date.getUTCMonth() + 1),
      day: (date.getUTCDate() < 10) ? ('0' + date.getUTCDate()) : date.getUTCDate()
    }
    return `${obj[order[0]]}${separator}${obj[order[1]]}${separator}${obj[order[2]]}`
  }

  const errorText = errors ? errors.get(attr) : undefined
  const validationState = errorText ? 'error' : (validationSuccess ? 'success' : null)
  let value = attrValue || record.get(attr)

  if (dateFormat) {
    var date = new Date(value)
    if ((Object.prototype.toString.call(date) !== '[object Date]') || isNaN(date.getTime())) {
      // console.log('Invalid date format!')
    } else {
      value = formateDate({ date })
    }
  }

  return (
    <FormGroup controlId={attr} validationState={validationState}>
      <ControlLabel>
        {label}
        { onHeaderCheckedChange && Array.isArray(onHeaderCheckedChange) &&
          onHeaderCheckedChange[0] && onHeaderCheckedChange[1]
          ? <Checkbox
            inline
            style={{ marginLeft: '5px' }}
            onChange={e => onHeaderCheckedChange[1](attr, e.target.checked)} >
            {onHeaderCheckedChange[0]}
          </Checkbox>
          : null
        }
      </ControlLabel>
      <FormControl componentClass='input' name={attr}
        value={typeof value === 'undefined' || value === null ? '' : value}
        onChange={handleChange} {...rest} />
      <FormControl.Feedback />
      {errorText ? <HelpBlock>{errorText}</HelpBlock> : null}
    </FormGroup>
  )
}

TextInput.propTypes = {
  attr: PropTypes.string.isRequired,
  record: PropTypes.object.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.object
}

export default observer(TextInput)
