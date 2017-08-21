import React from 'react'
import { observer } from 'mobx-react'
import { Checkbox, InputGroup, Button } from 'react-bootstrap'
import _ from 'lodash'
import HeaderBase from 'react-mobx-admin/components/common/datagrid/header'
import * as TUtils from 'react-mobx-admin/components/common/datagrid/table'

class BStrapHeader extends HeaderBase {
  renderIcon (sort) {
    return <span style={sort === 'ASC' ? { transform: 'rotate(180deg)' } : {}}>sort</span>
  }
}

const BStrapDatagrid = ({
  state, attrs, fields, titles, rowId, isSelected,
  onRowSelection, onSort, sortstate, listActions, allSelected,
  filters, updateFilterVal, applyFilters, hideFilter, isFilterApplied
}) => {
  function _renderHeader (name, label, sort, onSort) {
    let filtername = null
    const filter = filters && _.find(filters, (v, k) => {
      filtername = k
      return k.indexOf(name) >= 0
    })
    return (
      <th key={`th_${name}`}>
        <BStrapHeader sort={sort} name={name} label={label} onSort={onSort} />
        {filter ? (
          <InputGroup>
            {isFilterApplied(filtername) ?
              <Button onClick={() => hideFilter(filtername)} style={{float: 'left'}}>x</Button>
            : null}
            <div style={{float: 'right'}}>
              <filter.component record={state.filters}
                attr={filtername} onChange={updateFilterVal} onKeyPress={(e) => {
                  if (e.charCode === 13) {
                    e.preventDefault()
                    applyFilters()
                  }
                }} />
            </div>
          </InputGroup>
        ) : null}
      </th>
    )
  }

  const listActionsRender = listActions ? (
    <th key={'_actions'}>{ listActions() }</th>
  ) : null

  function _renderCell (row, name, creatorFn, rowId) {
    return (
      <td key={`td_${rowId}_${name}`}>
        {creatorFn(name, row)}
      </td>
    )
  }

  function _renderRowActions (row) {
    return listActions ? (
      <td key={'datagrid-actions'}>{listActions(row)}</td>
    ) : null
  }

  function _onSelectAll (e) {
    e.target.checked ? onRowSelection('all') : onRowSelection([])
  }

  const selectable = onRowSelection !== undefined && isSelected !== undefined

  let tableChildren = state.loading ? (
    <tr><td>loading</td></tr>
  ) : state.items.length === 0 ? (
    <tr><td>EMPTY</td></tr>
  ) : state.items.map((r, i) => {
    const id = rowId(r.id)
    const selected = selectable && isSelected(r.id)
    return (
      <tr selected={selected} key={i}>
        { selectable ?
          <td key='chbox'>
            <Checkbox checked={selected} inline
              onChange={() => onRowSelection(r.id)} />
          </td>
        : null }
        {TUtils.buildCells(attrs, fields, r, rowId, _renderCell, _renderRowActions)}
      </tr>
    )
  })

  return (
    <table className='table table-sm'>
      {titles ? (
        <thead>
          <tr>
            { selectable ? <th key='chbox'>
              <Checkbox checked={allSelected} inline bsClass='btn'
                onChange={_onSelectAll} />
            </th> : null }
            { TUtils.buildHeaders(attrs, titles, _renderHeader, listActionsRender, onSort, sortstate) }
          </tr>
        </thead>
      ) : null}
      <tbody>{tableChildren}</tbody>
    </table>
  )
}
export default observer(BStrapDatagrid)
