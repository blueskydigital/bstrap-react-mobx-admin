/* global marked */
import React from 'react'
import { observer } from 'mobx-react'
import DateInput from 'bstrap-react-mobx-admin/input/date'
import TextInput from 'bstrap-react-mobx-admin/input/text'
import SelectInput from 'bstrap-react-mobx-admin/input/select'
import EditView from 'bstrap-react-mobx-admin/view/edit'

const MDPreview = observer(({state}) => {
  const value = state.cv.record.get('content')
  return value ? <div dangerouslySetInnerHTML={{__html: marked(value)}} /> : null
})

const PostEditForm = ({store}) => {
  const record = store.cv.record
  const errors = store.cv.errors
  const updateField = store.cv.updateData.bind(store.cv)
  const disabled = Number(record.get('id')) % 2 === 0
  return (
    <div className='row'>
      <div className='col-xs-12 col-sm-12 col-md-6 col-lg-6'>
        <TextInput label={store.__('title')} attr={'title'} record={record}
          onChange={updateField} errors={errors} disabled={disabled} />
        <SelectInput label={store.__('Category')} attr={'category'} record={record}
          optionsrecord={store.options}
          optionsattr={'categories'}
          onChange={updateField}
          errors={errors} disabled={disabled} />
        <DateInput label={store.__('published')} attr={'published_at'} record={record}
          onChange={updateField} errors={errors} disabled={disabled} />
        <DateInput label={store.__('unpublished')} attr={'unpublished_at'} record={record}
          onChange={updateField} errors={errors} disabled={disabled} />
        <TextInput componentClass='textarea'
          label={store.__('content')} attr={'content'} record={record}
          onChange={updateField} errors={errors} disabled={disabled} />
      </div>
      <div className='col-xs-12 col-md-6 col-lg-6'>
        <MDPreview state={store} />
      </div>
    </div>
  )
}

const PostEditView = ({store}) => (
  <EditView store={store.cv} onReturn2list={store.onReturn2list.bind(store)}>
    <PostEditForm store={store} />
  </EditView>
)
export default PostEditView
