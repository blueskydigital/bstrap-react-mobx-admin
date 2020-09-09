import React from 'react'
import PropTypes from 'prop-types'
import { observable } from 'mobx'
import { observer } from 'mobx-react'

import Datagrid from '../datagrid/datagrid'
import DatagridActions from 'react-mobx-admin/components/common/datagrid/actions'
import Filters from '../datagrid/filters'
import ListStore from 'react-mobx-admin/state/data_table'
import Pagination from '../datagrid/pagination'
import {
  Badge,
  Button,
  ButtonGroup,
  DropdownButton,
  MenuItem,
  Tooltip,
  OverlayTrigger
} from 'react-bootstrap'

const BStrapListView = ({
  store, onAddClicked, onAddClicked2, onAddClicked2text, onAddClicked2tip, onAddClickedFL, fields, filters, listActions, batchActions, renderOuter,
  perPageOptions, stableBatchActions, selectable = true, helper = null, batchMenuControl = false
}) => {
  const nbPages = parseInt(store.totalItems)
  const perPageTitle = store.router.queryParams._perPage || ''
  const shiftDown = observable.box(false)
  filters = filters && filters.call ? filters() : filters
  perPageOptions = perPageOptions || store.perPageOptions || [5, 10, 15, 20, 50, 100, 1000]

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
        } else if (selection === first) {
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
      store.selectAll(batchMenuControl)
    } else if (selection.length === 0) {
      store.updateSelection([])
    } else {
      // we have receive index of selected item
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
    <Filters.Controls state={store}
      hideFilter={store.hideFilter.bind(store)} filters={filters} />
  ) : null

  const perPageRender = (position = 'bottom') => (
    <DropdownButton className='per-page-select' title={perPageTitle} dropup={position === 'bottom'} dropdown={position === 'top'}
      id='dropdown' onSelect={(num) => store.setPerPage(num)}>
      {
        perPageOptions.map((i) => {
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
        {nbPages > 5 && perPageRender(position)}
      </div>
      <div className='pull-left'>
        <div><Pagination.PageInfo info={store} query={store.router.queryParams} /></div>
      </div>
    </div>
  )

  const filterRow = filters ? Filters.FilterRow(filters, store) : null
  const refFn = (node, row) => {
    if (row.id && store.scrollTo && row.id === store.scrollTo) {
      node && node.scrollIntoView(true)
      window.scrollBy(0, -100)
      delete store.scrollTo
    }
  }
  const selectedItems = store.selection && store.selection.length > 0 && (
    <Button bsStyle='defult'>
      <Badge variant="secondary">
        <i className='glyphicon glyphicon-check'></i> {store.selection.length}
      </Badge>
    </Button>)

  const result = (
    <div className='card'>
      <div className='card-block'>
        <div className='pull-right'>
          <ButtonGroup style={{ verticalAlign: 'top ', marginRight: '0.6em' }} className='btn-group-top-right'>
            <Filters.Apply state={store} label={'Apply filters'} apply={store.applyFilters.bind(store)} />
            {filters && (
              <Filters.Dropdown state={store} title='addfilter' filters={filters}
                showFilter={store.showFilter.bind(store)} />
            )}
          </ButtonGroup>
          {(batchActions || stableBatchActions) &&
            <ButtonGroup style={{ verticalAlign: 'top ', marginRight: '0.3em' }} className='btn-group-top-right'>
              {batchActions && (
                <DatagridActions
                  state={store}
                  actions={batchActions}
                  overlay={child =>
                    <OverlayTrigger placement='top' overlay={<Tooltip>{store.selection && store.selection.length
                      ? 'List of batch actions or deletions'
                      : 'To use actions, select the items using the checkboxes'
                    }</Tooltip>}>{child}</OverlayTrigger>}
                />)}
              {stableBatchActions && stableBatchActions()}
              {selectedItems}
            </ButtonGroup>
          }
          { typeof store.store.regionFilterEnable !== 'undefined' &&
            store.store.regionFilterEnable(store.attrs) &&
            store.store.regionFilter
          }
          { typeof store.store.dateFilterEnable !== 'undefined' &&
            store.store.dateFilterEnable(store.attrs) &&
            store.store.dateFilter
          }
          { typeof store.store.historicDataFilterEnable !== 'undefined' &&
            store.store.historicDataFilterEnable(store.attrs) &&
            store.store.historicDataFilter
          }
          {(onAddClicked || onAddClickedFL) &&
            <ButtonGroup style={{ verticalAlign: 'top', marginRight: '0.1em', marginLeft: '1em' }} className='btn-group-top-right'>
              {onAddClicked &&
                <OverlayTrigger placement='top' overlay={<Tooltip>{'Add new item'}</Tooltip>}>
                  <Button bsStyle='primary' style={{ textTransform: 'uppercase' }} onClick={() => onAddClicked(store)}>{store.addText || '+'}</Button>
                </OverlayTrigger>
              }
              {onAddClicked && onAddClicked2 && (
                <OverlayTrigger placement='top' overlay={onAddClicked2tip && <Tooltip>{onAddClicked2tip}</Tooltip>}>
                  <Button bsStyle='primary' onClick={() => onAddClicked2(store)}>
                    {(store.addText && store.addText[0]) || '+'} {onAddClicked2text || ''}
                  </Button>
                </OverlayTrigger>)
              }
              {onAddClickedFL && <Button bsStyle='primary' onClick={() => onAddClickedFL(store)}>{store.addText || '+'} {'from last'}</Button>}
            </ButtonGroup>
          }
        </div>
        {store.title
          ? <h4 className='card-title'>
            { store.title }
            { helper &&
            <OverlayTrigger
              placement='right'
              overlay={<Tooltip className='tooltip-autowidth'>
                <div style={{ whiteSpace: 'pre', textAlign: 'left' }}>{ helper }</div></Tooltip>}>
              <i style={{ fontSize: '14px', marginLeft: '5px' }} className='glyphicon glyphicon-question-sign' />
            </OverlayTrigger>
            }
          </h4>
          : null
        }
      </div>
      { filtersRender }
      { pagination('top') }
      <div className='card-block'>
        <Datagrid state={store} attrs={store.attrs}
          titles={store.headertitles} fields={fields}
          rowId={(row) => row[store.pkName]}
          listActions={listActions}
          onSort={store.updateSort.bind(store)} sortstate={store.router.queryParams}
          noSort={store.noSort}
          onRowSelection={selectable ? onSelectionChange : undefined}
          isSelected={isSelected}
          allSelected={allSelected}
          filters={filterRow}
          refFn={refFn}
          batchMenuControl={batchMenuControl}
        />
      </div>
      { pagination('bottom') }
    </div>
  )

  return renderOuter ? renderOuter(result) : result
}

BStrapListView.propTypes = {
  batchActions: PropTypes.func,
  fields: PropTypes.arrayOf(PropTypes.func).isRequired,
  filters: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  listActions: PropTypes.func,
  onAddClicked: PropTypes.func,
  onAddClickedFL: PropTypes.func,
  perPageOptions: PropTypes.arrayOf(PropTypes.number),
  renderOuter: PropTypes.func,
  stableBatchActions: PropTypes.func,
  store: PropTypes.instanceOf(ListStore).isRequired
}
export default observer(BStrapListView)
