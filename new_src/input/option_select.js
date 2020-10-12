import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { Radio, FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap'

const OptionSelect = ({
  attr, record, onChange, errors, label, disabled, options,
  labelattr = 'label', valueattr = 'value', value = null,
  extractOpt = (i) => i
}) => {
  const val = value || (attr && record.get(attr) ? record.get(attr).toString() : null)
  const errorText = errors.has(attr) ? errors.get(attr) : undefined
  const validationState = errorText ? 'error' : null

  return (
    <FormGroup validationState={validationState}>
      <ControlLabel>{label}</ControlLabel>
      <div>
        {
          options.map((i, idx) => {
            const isChecked = val === i[valueattr]
            return (
              <Radio key={idx} name={attr} checked={isChecked} inline
                disabled={disabled} className={isChecked && 'text-primary text-bold'}
                style={{ marginLeft: '0', marginRight: '1em' }}
                onChange={_ => { onChange(attr, i[valueattr]) }}>
                {i[labelattr]}
              </Radio>
            )
          })
        }
      </div>
      {errorText ? <HelpBlock>{errorText}</HelpBlock> : null}
    </FormGroup>
  )
}
OptionSelect.propTypes = {
  attr: PropTypes.string.isRequired,
  errors: PropTypes.object,
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  record: PropTypes.object.isRequired,
  options: PropTypes.array.isRequired,
  extractOpt: PropTypes.func
}
export default observer(OptionSelect)
