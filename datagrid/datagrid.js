import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { Checkbox, Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import { buildHeaders, buildCells } from 'react-mobx-admin/components/common/datagrid/table'

const BStrapHeader = ({ state, label, sort, name, onSort }) => {
  function _onUpClick (e) {
    onSort(name, sort === 'ASC' ? null : 'ASC')
    state && state.store && state.store.setEntityLastState(state.store.cv.entityname, state.store.router.queryParams)
  }

  function _onDownClick (e) {
    onSort(name, sort === 'DESC' ? null : 'DESC')

    state && state.store &&
    state.store.setEntityLastState(state.store.cv.entityname, state.store.router.queryParams)
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
  name: PropTypes.string,
  onSort: PropTypes.func,
  sort: PropTypes.string,
  state: PropTypes.object.isRequired
}

const BStrapDatagrid = ({
  state, attrs, fields, titles, rowId, isSelected, noSort,
  onRowSelection, onSort, sortstate, listActions, listActionDelete, allSelected,
  filters, dragbleListEntity, customRowStyleClass, dragbleHelperClass, refFn, batchMenuControl
}) => {
  const listActionsRender = listActions && (<th key={'_actions'}>{listActions()}</th>)
  const listActionDeleteRender = listActionDelete && (<th key={'_actions-delete'}>{listActionDelete()}</th>)

  function _renderHeader (name, label, sort, onSort) {
    return (
      <th key={`th_${name}`}>
        <BStrapHeader
          sort={sort} name={name} label={label} state={state}
          onSort={noSort && noSort.some(n => n === name) ? null : onSort} />
      </th>
    )
  }

  function _renderCell (row, name, creatorFn, rowId, disable = undefined) {
    return (
      <td key={`td_${rowId}_${name}`}>{creatorFn(name, row, disable)}</td>
    )
  }

  function _renderRowActions (row) {
    return listActions ? (
      <td key={'datagrid-actions'}>{listActions(row)}</td>
    ) : null
  }

  function _renderRowActionDelete (row) {
    return listActionDelete
      ? (<td key={'datagrid-actions-delete'}>{listActionDelete(row)}</td>)
      : null
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

  const noDelete = state && state.noDelete
  const selectable = onRowSelection !== undefined && isSelected !== undefined
  const SortableItem = SortableElement(({ row, children }) =>
    <tr className={customRowStyleClass ? customRowStyleClass(row) : 'noClass'} >{children}</tr>)
  const SortableWrapper = SortableContainer(({ items, buildCells }) => {
    return (<tbody>
      {
        items.map((r, index) => (
          <SortableItem
            key={index}
            row={r}
            index={dragbleListEntity.editIndex ? dragbleListEntity.editIndex(index) : index}
            disabled={dragbleListEntity.disableFn(r)}>
            {buildCells(attrs, fields, r, rowId, _renderCell, _renderRowActions, _renderRowActionDelete)}
          </SortableItem>
        ))
      }
    </tbody>
    )
  })
  let latestItem
  let tableChildren

  tableChildren = state.state === 'loading'
    ? <tr><td><span className='glyphicon glyphicon-refresh glyphicon-refresh-animate' /> Loading...</td></tr>
    : state.items.length === 0
      ? tableChildren = <tr><td>EMPTY</td></tr>
      : state.items.map((r, i) => {
        const selected = selectable && isSelected(i)
        const isScrollTo = state.store && state.store.cv && state.store.cv.scrollTo && r.id && state.store.cv.scrollTo
        const timeRestricted = (state.store && state.store.timeRestriction && state.store.timeRestriction.checkRow(state.store, r, state)) || undefined
        const disableAttrs = (r.id && latestItem && latestItem === r.id && state.store && state.store.cv && state.store.cv.disableAttrs) || undefined
        latestItem = r.id

        return (
          <tr selected={selected} key={i} className={customRowStyleClass
            ? customRowStyleClass(r)
            : 'noClass' + (isScrollTo && r.id && isScrollTo === r.id ? ' show-scrollto' : '')
          }>
            {
              selectable && (
                <td key='chbox'ref={i > 0 ? (node) => refFn && refFn(node, r) : undefined}>
                  { noDelete || disableAttrs || (!batchMenuControl && timeRestricted && timeRestricted > 0) // can't compare ( timeRestricted === 0 ) when > 0 than is restricted
                    ? null
                    : <Checkbox checked={selected} inline onChange={() => onRowSelection(i)} />
                  }
                </td>
              )
            }
            {
              buildCells(attrs, fields, r, rowId, _renderCell, _renderRowActions, _renderRowActionDelete, disableAttrs)
            }
          </tr>
        )
      })

  return (
    <table className='table table-sm'>
      {titles ? (
        <thead>
          <tr>
            { selectable && (
              <th>
                <div className='sort-buttons-box'>
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
            )}
            {
              buildHeaders(attrs, titles, _renderHeader, listActionsRender,
                onSort, sortstate, noSort, listActionDeleteRender)
            }
          </tr>
          {
            filters && (
              <tr className='filter-row'>
                {
                  selectable && !noDelete ? <th key='chbox'>
                    <Checkbox checked={allSelected} inline bsClass='btn' onChange={_onSelectAll} />
                  </th> : (!selectable ? '' : <th/>)
                }
                {
                  filters.map((i, idx) => <th key={idx}>{i}</th>)
                }
                {
                  listActions ? <th key='0' /> : null
                }
              </tr>
            )}
        </thead>
      ) : null}
      {
        dragbleListEntity
          ? <SortableWrapper
            helperClass={dragbleHelperClass}
            items={state.items}
            buildCells={buildCells}
            onSortEnd={dragbleListEntity.onDragEnd}
            pressDelay={dragbleListEntity.dragToggleDelay} />
          : <tbody>{tableChildren}</tbody>
      }
    </table>
  )
}
export default observer(BStrapDatagrid)
