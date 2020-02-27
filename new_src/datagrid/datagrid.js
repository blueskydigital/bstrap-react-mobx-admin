import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { Checkbox, Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { buildTableHeaders } from 'react-mobx-admin/new_src/component_utils'

const BStrapHeader = ({ state, children, sort, name, onSort }) => {
  //
  function _onUpClick (e) {
    onSort(name, sort === 'ASC' ? null : 'ASC')

    state && state.store &&
    state.store.setEntityLastState(state.store.cv.entityname, state.store.router.queryParams)
  }
  function _onDownClick (e) {
    onSort(name, sort === 'DESC' ? null : 'DESC')

    state && state.store &&
    state.store.setEntityLastState(state.store.cv.entityname, state.store.router.queryParams)
  }
  return (
    <div className='header'>
      <div className='capt'>{children}</div>
      {onSort ? (
        <div className='sort-buttons-box'>
          <Button bsSize='xsmall' bsStyle={sort === 'ASC' ? 'primary' : 'default'} onClick={_onUpClick}>
            <span className='glyphicon glyphicon-chevron-up' />
          </Button>
          <Button bsSize='xsmall' bsStyle={sort === 'DESC' ? 'primary' : 'default'} onClick={_onDownClick}>
            <span className='glyphicon glyphicon-chevron-down' />
          </Button>
        </div>
      ) : (<div className='sort-buttons-box'/>)}
    </div>
  )
}
BStrapHeader.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]).isRequired,
  sort: PropTypes.string,
  name: PropTypes.string,
  onSort: PropTypes.func
}

const BStrapDatagrid = ({
  state, attrs, fieldCreator, headerCreator, rowId, isSelected, noSort,
  onRowSelection, onSort, sortstate, listActions, listActionLeft, allSelected,
  filters, TDComponent, TRComponent, TBodyComponent, refFn, options = {}
}) => {
  const _renderTD = ({ ...rest }) => TDComponent ? (
    <TDComponent {...rest} /> // custom
  ) : (
    <td {...rest} /> // or default
  )
  function _renderHeader (name, label, sort, onSort) {
    return (
      <th key={`th_${name}`}>
        <BStrapHeader
          sort={sort} name={name} state={state}
          onSort={noSort && noSort.some(n => n === name) ? null : onSort}>
          {headerCreator(name)}
        </BStrapHeader>
      </th>
    )
  }

  function _renderCell (attr, row, rowId) {
    const content = fieldCreator(attr, row)
    return _renderTD({ key: `td_${rowId}_${attr}`, children: content })
  }

  function _onSelectAll (e) {
    e.target.checked ? onRowSelection('all') : onRowSelection([])
  }

  function handleResetButton () {
    if (state.filters && state.filters.size > 0) {
      state.filters.forEach((val, key) => {
        state.filters.delete(key)
      })
      const newQPars = Object.assign({}, state._convertFilters(state.filters), {
        _page: state.router.queryParams._page,
        _perPage: state.router.queryParams._perPage,
        _sortField: state.router.queryParams._sortField,
        _sortDir: state.router.queryParams._sortDir
      })
      state.updateQPars(newQPars)
    }

    if (!sortstate._sortField) {
      if (state.defaultSort && state.defaultSort._sortField && state.defaultSort._sortField.split(',')) {
        state.defaultSort._sortField.split(',').forEach((f, idx) => {
          onSort(f, state.defaultSort._sortDir.split(',')[idx])
        })
        sortstate._sortField = state.defaultSort._sortField
        sortstate._sortDir = state.defaultSort._sortDir
      }
    } else {
      sortstate._sortField &&
        sortstate._sortField.split(',') &&
        sortstate._sortField.split(',').forEach(f => onSort(f, null))

      sortstate._sortField = ''
      sortstate._sortDir = ''
      delete state.store.entityLastState[state.store.cv.entityname]
    }

    state && state.store &&
      state.store.setEntityLastState(state.store.cv.entityname, state.store.router.queryParams)
  }

  const selectable = onRowSelection !== undefined && isSelected !== undefined

  const tableChildren = state.state === 'loading' ? (
    <tr><td>{
      options.loadingComponent ? options.loadingComponent() : (
        <div>
          <span className='glyphicon glyphicon-refresh glyphicon-refresh-animate' />
          &nbsp;Loading...
        </div>
      )
    }</td></tr>
  ) : state.items.length === 0 ? (
    <tr><td>{options.emptyComponent ? options.emptyComponent() : null}</td></tr>
  ) : state.items.map((row, rowIdx) => {
    const selected = selectable && isSelected(rowIdx)
    const timeRestricted = (state.store && state.store.timeRestriction && state.store.timeRestriction.checkRow(state.store, row, state)) || undefined
    let cells = []
    selectable && cells.push(_renderTD({
      key: 'chbox',
      children: (
        <div ref={(node) => refFn && refFn(node, row)}>
          { timeRestricted && timeRestricted > 0 // can't compare ( timeRestricted === 0 ) when > 0 than is restricted
            ? null
            : <Checkbox checked={selected} inline onChange={() => onRowSelection(rowIdx)} />
          }
        </div>
      )
    }))
    listActionLeft && cells.push(_renderTD({ key: 'lst-acts-l', children: listActionLeft(row) }))
    cells = cells.concat(attrs.map((attr, idx) => _renderCell(attr, row, idx)))
    listActions && cells.push(_renderTD({ key: 'lst-acts', children: listActions(row) }))

    return TRComponent ? (
      <TRComponent selected={selected} key={rowIdx} row={row}>{cells}</TRComponent>
    ) : (
      <tr selected={selected} key={rowIdx}>{cells}</tr>
    )
  })

  return (
    <table className='table table-sm'>
      {headerCreator ? (
        <thead>
          <tr>
            {
              selectable ? (
                <th key='chbox'>
                  <div className='sort-buttons-box'>
                    <Checkbox checked={allSelected} inline bsClass='btn' onChange={_onSelectAll} />
                    {' '}
                    <OverlayTrigger
                      placement='right'
                      overlay={<Tooltip>{
                        !sortstate._sortField
                          ? 'Sets filters and sorting to the default state'
                          : 'Reset filters and sorting to the clean state'
                      }</Tooltip>}>
                      <Button bsStyle={'default'} bsSize='xsmall' onClick={handleResetButton}>
                        <span className={'glyphicon glyphicon-ban-circle'} />
                      </Button>
                    </OverlayTrigger>
                  </div>
                </th>
              ) : null
            }
            {
              listActionLeft ? (
                <th key={'_actions-left'}>{ listActionLeft() }</th>
              ) : null
            }
            {
              buildTableHeaders(attrs, headerCreator, _renderHeader, onSort, sortstate, noSort)
            }
            {
              listActions ? (<th key={'_actions'}>{ listActions() }</th>) : null
            }
          </tr>
          {
            filters ? (
              <tr className='filter-row'>
                {
                  selectable ? <th key='s' /> : null
                }
                {
                  listActionLeft ? <th key='lid' /> : null
                }
                {
                  filters.map((i, idx) => <th key={idx}>{i}</th>)
                }
                {
                  listActions ? <th key='li' /> : null
                }
              </tr>
            ) : null
          }
        </thead>
      ) : null}
      {
        TBodyComponent
          ? <TBodyComponent>{tableChildren}</TBodyComponent>
          : <tbody>{tableChildren}</tbody>
      }
    </table>
  )
}
export default observer(BStrapDatagrid)
