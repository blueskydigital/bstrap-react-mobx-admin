import React from 'react'
import { observer } from 'mobx-react'
import { DropdownButton, MenuItem, Button, InputGroup, Tooltip, OverlayTrigger } from 'react-bootstrap'
import FilterBases from 'react-mobx-admin/components/common/datagrid/filters'

// dropdown with available filters
@observer
class Dropdown extends FilterBases.DropdownBase {
  renderItem (name, text, icon, onClick) {
    return (
      <MenuItem key={name} eventKey={name} onClick={onClick}>{text}</MenuItem>
    )
  }

  renderMenu (state, filters) {
    return (
      <OverlayTrigger placement='bottom' overlay={<Tooltip>{'List of availible filters to be selected'}</Tooltip>}>
        <DropdownButton title="filters" pullRight id="bg-nested-dropdown">
          {this.createItems(state, filters)}
        </DropdownButton>
      </OverlayTrigger>
    )
  }
}

const styles = {
  chip: {
    margin: 4
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap'
  }
}

// controls to set filter values
@observer
class Controls extends FilterBases.ControlsBase {
  renderControl (filter, name, state, onHide, onUpdateValue) {
    const toolTip = (
      <Tooltip id="tooltip"><strong>{filter.info}</strong></Tooltip>
    )

    return (
      <div className={`form-field form-group filter-${name}`} style={styles.chip} key={name}>
        <OverlayTrigger placement="right" overlay={toolTip}>
          <strong>{filter.title || name}</strong>
        </OverlayTrigger>
        <InputGroup>
          <Button onClick={onHide} style={{ float: 'left' }}>x</Button>
          <div style={{ float: 'right' }}>
            <filter.component record={state.filters} attr={name} onChange={onUpdateValue}
              onKeyPress={(e) => {
                if (e.charCode === 13) {
                  e.preventDefault()
                  state.applyFilters()
                }
              }} />
          </div>
        </InputGroup>
      </div>
    )
  }

  renderControls (controls, apply) {
    return (
      <div style={styles.wrapper}>
        {controls}
      </div>
    )
  }
}

const Apply = observer(({ apply, label, state }) => {
  let show = state.filters.size > 0 && !state.filtersApplied
  state.filters.forEach((val, key) => {
    // disable Apply if wrong date value
    if (key.indexOf('__from') > 0 || key.indexOf('__to') > 0) {
      if (val && !moment(val).isValid()) {
        show = false
      }
    }
  })
  return show && (
    <OverlayTrigger placement='bottom' overlay={<Tooltip>{'Apply selected filters'}</Tooltip>}>
      <Button onClick={apply}>{label}</Button>
    </OverlayTrigger>)
})

const FilterRow = (filters, store) => {
  return store.attrs.map(attr => {
    let filtername
    const filter = _.find(filters, (v, k) => {
      filtername = k
      return filtername.indexOf(attr) >= 0
    })
    const isApplied = filtername in store.appliedFilters || (filtername + '__to') in store.appliedFilters
    return filter ? (
      <InputGroup>
        {
          isApplied ? (
            <InputGroup.Button>
              <Button onClick={() => store.hideFilter(filtername)}>x</Button>
            </InputGroup.Button>
          ) : null
        }
        <filter.component record={store.filters}
          attr={filtername} onChange={store.updateFilterValue.bind(store)}
          onKeyPress={(e) => {
            if (e.charCode === 13) {
              e.preventDefault()
              store.applyFilters()
            }
          }} />
      </InputGroup>
    ) : null
  })
}

export default { Dropdown, Controls, Apply, FilterRow }
