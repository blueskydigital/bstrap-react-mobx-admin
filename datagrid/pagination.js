import React from 'react'
import { observer } from 'mobx-react'
import PaginationBase from 'react-mobx-admin/components/common/datagrid/pagination'

@observer
class Pagination extends PaginationBase {
  render () {
    const store = this.props.store
    const totalItems = store.totalItems
    const page = store.router.queryParams ? parseInt(store.router.queryParams._page) : 1
    const perPage = parseInt(store.router.queryParams._perPage) || 1
    const nbPages = Math.ceil(totalItems / perPage) || 1
    const offsetEnd = Math.min(page * perPage, totalItems)
    const offsetBegin = Math.min((page - 1) * perPage + 1, offsetEnd)
    const displayPagination = perPage < totalItems

    const pageRange = this.range(page, perPage, totalItems).map(pageNum =>
      (pageNum === '.') ? ''
        : <li key={pageNum} className={'page-item ' + (page === pageNum ? 'active' : '')}>
          <a className="page-link" href="javascript:void(0)" onClick={this.onChange(store, pageNum)}>{pageNum}</a>
        </li>
    )

    return (nbPages > 1) ? (
      <ul className="pagination">
        {page > 1 &&
        <li key="prev" className="page-item">
          <a className="page-link" href="javascript:void(0)" aria-label="Previous" onClick={this.onChange(store, page - 1)}>
            <span aria-hidden="true">&laquo;</span>
            <span className="sr-only">Previous</span>
          </a>
        </li>
        }
        {pageRange}
        {page !== nbPages &&
        <li key="next" className="page-item">
          <a className="page-link" href="javascript:void(0)" aria-label="Previous" onClick={this.onChange(store, page + 1)}>
            <span aria-hidden="true">&raquo;</span>
            <span className="sr-only">Previous</span>
          </a>
        </li>
        }
      </ul>
    ) : null
  }
}

const PageInfo = observer(({ info, query }) => {
  const totalItems = info.totalItems
  const page = query ? parseInt(query._page) : 1
  const perPage = parseInt(query._perPage) || 1
  const offsetEnd = Math.min(page * perPage, totalItems)
  const offsetBegin = Math.min((page - 1) * perPage + 1, offsetEnd)

  return (<p className="pagination">{offsetBegin}-{offsetEnd} of {totalItems}</p>)
})

export default { Pagination, PageInfo }
