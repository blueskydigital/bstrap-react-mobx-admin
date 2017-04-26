import React from 'react'
import Datagrid from '../datagrid/datagrid'
import Filters from '../datagrid/filters'
import Pagination from '../datagrid/pagination'
import DatagridActions from 'react-mobx-admin/components/common/datagrid/actions'
import { observer } from 'mobx-react'
import { DropdownButton, MenuItem, Button, ButtonGroup } from 'react-bootstrap'


const BStrapListView = ({
  state, onAddClicked, fields, filters, listActions, batchActions, renderOuter
}) => {

  const cv = state.currentView

  function onSelectionChange(selection) {
    if(selection === 'all') {
      state.selectAll(cv)
    } else if(selection === []) {
      state.updateSelection(cv, [])
    } else { // we have receive index of selected item
      // so toggle the selection of da index
      state.toggleIndex(cv, selection)
    }
  }

  function isSelected(idx) {
    return cv.selection.indexOf(idx) >= 0
  }

  const allSelected = cv.selection.length > 0 && cv.selection.length === cv.items.length

  const filtersRender = (filters && ! cv.loading) ? (
    <Filters.Controls state={state}
      hideFilter={(filter)=>state.hideFilter(cv, filter)} filters={filters} />
  ) : null
  const pagination = (
    <div className="card-block">
      <div className="pull-right">
        <Pagination.Pagination state={state} onChange={(page)=>state.updatePage(cv, page)} />
      </div>
      <div className="pull-left">
        <Pagination.PageInfo info={cv} />
      </div>
    </div>
  )

  const result = (
    <div className="card">
      <div className="card-block">
        <div className="pull-right">
          <ButtonGroup>
            <Filters.Apply state={state} label={'apply filters'} apply={()=>state.applyFilters(cv)} />
            {batchActions && (<DatagridActions state={state} actions={batchActions} />)}
            {filters && (
              <Filters.Dropdown state={state} title="addfilter" filters={filters}
                showFilter={(filter)=>state.showFilter(cv, filter)} />
            )}
            {onAddClicked && <Button onClick={()=>onAddClicked(state)}>{cv.addText || '+'}</Button>}
          </ButtonGroup>
        </div>
        {cv.title ? <h4 className="card-title">{cv.title}</h4> : null}
      </div>
      { filtersRender }
      <div className="card-block">
        <Datagrid state={cv} attrs={cv.attrs}
          titles={cv.headertitles} fields={fields}
          rowId={(row)=>row[cv.pkName]}
          listActions={listActions}
          onSort={(field, dir)=>state.updateSort(cv, field, dir)} sortstate={cv}
          onRowSelection={onSelectionChange} isSelected={isSelected}
          allSelected={allSelected} />
      </div>
      { pagination }
    </div>
  )

  return renderOuter ? renderOuter(result) : result
}

BStrapListView.propTypes = {
  state: React.PropTypes.object.isRequired,
  renderOuter: React.PropTypes.func
}
export default observer(BStrapListView)
