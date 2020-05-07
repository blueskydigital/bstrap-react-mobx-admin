import React from 'react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import ManipStore from 'react-mobx-admin/state/data_manip'

const _SubmitButton = ({ errors, onSubmit, hasChanged, children, ...rest }) => {
  const disabled = errors.size > 0 || (hasChanged && !hasChanged())
  return errors ? (
    <button type='button' className='btn btn-primary' {...rest}
      disabled={disabled} onClick={onSubmit}>{children}</button>
  ) : null
}
const SubmitButton = observer(_SubmitButton)

const GlobalErrors = observer(({ errors }) => {
  return errors.has('_global')
    ? errors.get('_global').map(e => {
      return (Array.isArray(e) ? e : [e]).map((v, k) => (
        <div key={k} className='alert alert-danger'><strong>Error! </strong>{v} </div>
      ))
    })
    : null
})

@observer class EditView extends React.Component {
  static propTypes = {
    store: PropTypes.instanceOf(ManipStore).isRequired,
    onSave: PropTypes.func,
    onReturn2list: PropTypes.func,
    buttonOnTop: PropTypes.bool
  }

  constructor (props) {
    super(props)
    this.onKeyDownActions = this.onKeyDownActions.bind(this)
  }

  componentDidMount () {
    document.addEventListener('keydown', this.onKeyDownActions, false)
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.onKeyDownActions, false)
  }

  onKeyDownActions (event) {
    const e = event || window.event
    e.onKeyDownActions = false

    if (e.keyCode === 13) {
      // enter
      e.onKeyDownActions = true
    } else if (e.keyCode === 27) {
      // esc
      e.onKeyDownActions = true
      this.props.onReturn2list()
    } else if ((e.ctrlKey || e.metaKey) && e.keyCode === 69) {
      // ctrl+e
      e.onKeyDownActions = true
      if (this.props.store.isEntityChanged) {
        this.props.store.saveEntity(this.props.onReturn2list)
      } else {
        this.props.onReturn2list()
      }
    } else if ((e.ctrlKey || e.metaKey) && e.keyCode === 83) {
      // ctrl+s
      e.onKeyDownActions = true
      this.props.store.isEntityChanged && this.props.store.save()
    }

    e.onKeyDownActions && e.preventDefault() && e.stopPropagation()
  }

  render ({ store, onSave, onReturn2list, children, buttonOnTop, options = {}, showButtons = true } = this.props) {
    const loading = store.state === 'loading' || store.state === 'saving'
    onSave = onSave || store.save.bind(store)
    buttonOnTop = buttonOnTop !== undefined ? buttonOnTop : true

    if (loading) {
      return <span className='is-loading'>loading</span>
    }

    const title = store.origRecordId
      ? (store.edittitle || 'edit item')
      : (store.createtitle || 'create new item')
    const saveText = store.saveText || 'SAVE'
    const cancelText = store.cancelText || 'cancel'
    const hasChanged = () => (store.isEntityChanged)

    const actionButtons = (showCustomActionButtons = true) => ([
      (<div className='btn-group buttons-vertical-align' role='group' key={1}>
        <SubmitButton onSubmit={onSave} errors={store.errors} hasChanged={hasChanged}>
          <span className='glyphicon glyphicon-saved' />&nbsp; {saveText}
        </SubmitButton>
        {
          onReturn2list ? (
            <SubmitButton onSubmit={() => onSave().then(() => onReturn2list())}
              errors={store.errors} hasChanged={hasChanged}>
              <span className='glyphicon glyphicon-save' />&nbsp; {store.saveAndReturnText || 'SAVE and return'}
            </SubmitButton>
          ) : null
        }
        {
          onReturn2list ? (
            <button type='button' className='btn btn-default' onClick={onReturn2list}>
              <span className='glyphicon glyphicon-remove' />&nbsp; {cancelText}
            </button>
          ) : null
        }
      </div>
      ), (
        <div className='buttons-vertical-align' key={2}>
          {options.customActionButtons && showCustomActionButtons ? options.customActionButtons : null}
        </div>
      )]
    )

    return (
      <div className='card'>
        <div className='card-block'>
          <h4 className='card-title'>
            {title}
            <span className='right-float'>ID: {store.record.has('id') ? store.record.get('id') : <em>new</em>}</span>
          </h4>
          {buttonOnTop && showButtons ? actionButtons() : null}
        </div>

        <div className='card-block'>
          <form>{children}</form>
          <GlobalErrors errors={store.errors} /><br />
        </div>

        <div className='card-block'>
          { showButtons && actionButtons(false) }
        </div>
      </div>
    )
  }
}
export default EditView
export { SubmitButton, GlobalErrors, EditView }
