import React from 'react'
import PropTypes from 'prop-types'
import Datagrid from '../datagrid/datagrid'
import Filters from '../datagrid/filters'
import Pagination from '../datagrid/pagination'
import { DropdownButton, MenuItem, Button, ButtonGroup } from 'react-bootstrap'
import { observable } from 'mobx'
import { observer } from 'mobx-react'

const DatagridActions = observer(({ actions, state }) => {
  return (state.selection.length > 0) ? actions(state) : null
})

const BStrapListView = ({
  store, onAddClicked, headerCreator, fieldCreator,
  filters, tableFilters, batchActions, options = {}, ...rest
}) => {
  //
  filters = filters && filters.call ? filters() : filters
  headerCreator = headerCreator || store.headerCreator.bind(store)
  const perPageTitle = store.router.queryParams._perPage || ''

  const shiftDown = observable.box(false)

  window.addEventListener('keydown', e => {
    if (e.keyCode === 16) {
      shiftDown.set(true)
      e.preventDefault()
      e.stopPropagation()
    }
  })

  function onSelectionChange (selection) {
    if (shiftDown.get() && store.selection && store.selection.length > 0) {
      if (store.selection.length > 0) {
        const first = store.selection[0]
        const newSelection = []

        if (selection < first) {
          for (let i = selection; i <= first; i++) {
            newSelection.push(i)
          }
        } else if (selection == first) {
          store.toggleIndex(selection)
        } else {
          for (let i = first; i <= selection; i++) {
            newSelection.push(i)
          }
        }
        store.updateSelection(newSelection)
        shiftDown.set(false)
        return
      }
    }
    if (selection === 'all') {
      store.selectAll()
    } else if (selection.length === 0) {
      store.updateSelection([])
    } else { // we have receive index of selected item
      // so toggle the selection of da index
      store.selectionAll = false
      store.toggleIndex(selection)
    }
  }

  function isSelected (idx) {
    return store.selection.indexOf(idx) >= 0
  }

  const allSelected = store.selectionAll || (store.selection.length > 0 && store.selection.length === store.items.length)

  const filtersRender = (filters && store.state === 'ready') ? (
    <Filters.Controls filters={filters} store={store} />
  ) : null

  const perPageRender = (position = 'bottom') => (
    <DropdownButton className='per-page-select' title={perPageTitle} dropup={position === 'bottom'} dropdown={position === 'top'}
      id='dropdown' onSelect={(num) => store.setPerPage(num)}>
      {
        store.perPageOptions.map((i) => {
          return <MenuItem eventKey={i} key={i}>{i}</MenuItem>
        })
      }
    </DropdownButton>
  )
  const pagination = (position = 'bottom') => (
    <div className='card-block breadcrumb pagination-group'>
      <div className='pull-right'>
        <ButtonGroup>
          <Pagination.Pagination store={store} onChange={store.updatePage.bind(store)} />
        </ButtonGroup>
        {perPageRender(position)}
      </div>
      <div className='pull-left'>
        <div><Pagination.PageInfo info={store} query={store.router.queryParams} /></div>
      </div>
    </div>
  )

  const filterRow = tableFilters ? Filters.FilterRow(tableFilters, store) : null
  const title = options.title ? options.title() : null
  const refFn = (node, row) => {
    if (row.id && store.scrollTo && row.id === store.scrollTo) {
      node && node.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
      delete store.scrollTo
    }
  }

  return (
    <div className='card'>
      <div className='card-block'>
        <div className='pull-right'>
          { batchActions &&
            <ButtonGroup style={{ verticalAlign: 'top ', marginRight: '0.3em' }} className='btn-group-top-right'>
              <DatagridActions state={store} actions={batchActions} />
            </ButtonGroup>
          }
          <ButtonGroup style={{ verticalAlign: 'top ', marginRight: '0.3em' }} className='btn-group-top-right'>
            {
              filters ? (
                <Filters.Dropdown store={store} filters={filters} />
              ) : null
            }
            {
              onAddClicked ? (
                <Button bsStyle='primary' className='new-button' onClick={() => onAddClicked(store)}>
                  {options.addText
                    ? options.addText()
                    : <span><em key={0} className='glyphicon glyphicon-plus-sign' />&nbsp;+ New</span>}
                </Button>
              ) : null
            }
          </ButtonGroup>
        </div>
        {title ? <h4 className='card-title'>{title}</h4> : null}
      </div>
      <div style={{ clear: 'both' }}>
        { filtersRender }
      </div>
      { pagination('top') }
      <div className='card-block'>
        <Datagrid state={store} attrs={store.attrs} {...rest}
          headerCreator={headerCreator} fieldCreator={fieldCreator}
          rowId={(row) => row[store.pkName]}
          onSort={store.updateSort.bind(store)}
          sortstate={store.router.queryParams}
          noSort={store.noSort}
          onRowSelection={onSelectionChange} isSelected={isSelected}
          allSelected={allSelected} filters={filterRow}
          options={options} refFn={refFn} />
      </div>
      { pagination('bottom') }
    </div>
  )
}

BStrapListView.propTypes = {
  store: PropTypes.object.isRequired,
  onAddClicked: PropTypes.func,
  headerCreator: PropTypes.func,
  fieldCreator: PropTypes.func.isRequired,
  filters: PropTypes.func,
  tableFilters: PropTypes.func,
  listActions: PropTypes.func,
  listActionLeft: PropTypes.func,
  batchActions: PropTypes.func,
  options: PropTypes.object
}
export default observer(BStrapListView)
