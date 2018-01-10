import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { Checkbox, InputGroup, Button } from 'react-bootstrap'
import _ from 'lodash'
import * as TUtils from 'react-mobx-admin/components/common/datagrid/table'

const BStrapHeader = ({label, sort, name, onSort}) => {
  //
  function _onUpClick (e) {
    onSort(name, sort === 'ASC' ? null : 'ASC')
  }
  function _onDownClick (e) {
    onSort(name, sort === 'DESC' ? null : 'DESC')
  }
  return (
    <div>
      <div>{label}&nbsp;</div>
      {onSort && (
        <div className='sort-buttons-box'>
          <Button bsSize='xsmall' bsStyle={sort === 'ASC' ? 'primary' : 'default'} onClick={_onUpClick}>
            <span className='glyphicon glyphicon-chevron-up' />
          </Button>
          <Button bsSize='xsmall' bsStyle={sort === 'DESC' ? 'primary' : 'default'} onClick={_onDownClick}>
            <span className='glyphicon glyphicon-chevron-down' />
          </Button>
        </div>
      )}
    </div>
  )
}
BStrapHeader.propTypes = {
  label: PropTypes.string.isRequired,
  sort: PropTypes.string,
  name: PropTypes.string,
  onSort: PropTypes.func
}

const BStrapDatagrid = ({
  state, attrs, fields, titles, rowId, isSelected, noSort,
  onRowSelection, onSort, sortstate, listActions, listActionDelete, allSelected,
  filters
}) => {
  //
  function _renderHeader (name, label, sort, onSort) {
    return (
      <th key={`th_${name}`}>
        <BStrapHeader
          sort={sort} name={name} label={label}
          onSort={noSort && noSort.some(n => n === name) ? null : onSort} />
      </th>
    )
  }

  const listActionsRender = listActions ? (
    <th key={'_actions'}>{ listActions() }</th>
  ) : null

  const listActionDeleteRender = listActionDelete ? (
    <th key={'_actions-delete'}>{ listActionDelete() }</th>
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
    <tr><td><span className='glyphicon glyphicon-refresh glyphicon-refresh-animate' /> Loading...</td></tr>
  ) : state.items.length === 0 ? (
    <tr><td>EMPTY</td></tr>
  ) : state.items.map((r, i) => {
    const selected = selectable && isSelected(i)
    return (
      <tr selected={selected} key={i}>
        { selectable ? (
          <td key='chbox'>
            <Checkbox checked={selected} inline onChange={() => onRowSelection(i)} />
          </td>
        ) : null }
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
            {
              TUtils.buildHeaders(attrs, titles, _renderHeader, listActionsRender,
                onSort, sortstate, noSort, listActionDeleteRender)
            }
          </tr>
          {
            filters ? (
              <tr className='filter-row'>
                {
                  selectable ? <th key='0'></th> : null
                }
                {
                  filters.map((i, idx) => <th key={idx}>{i}</th>)
                }
                {
                  listActions ? <th key='0'></th> : null
                }
              </tr>
            ) : null
          }
        </thead>
      ) : null}
      <tbody>{tableChildren}</tbody>
    </table>
  )
}
export default observer(BStrapDatagrid)
