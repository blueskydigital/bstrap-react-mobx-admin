import React from 'react'
import { observer } from 'mobx-react'
import TextInput from 'bstrap-react-mobx-admin/input/text'
import BoolInput from 'bstrap-react-mobx-admin/input/bool'
import EditView from 'bstrap-react-mobx-admin/view/edit'


const TagEditForm = ({state}) => {

  const entity = state.currentView.entity
  const updateField = state.updateData.bind(state)

  return (
    <div className="row">
      <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
        <TextInput label={state.__('name')} attr={'name'} record={entity} onChange={updateField}
          errors={state.currentView.errors} /><br/>
        <BoolInput label={state.__('Published')} attr={'published'} record={entity} onChange={updateField} />
      </div>
    </div>
  )
}
TagEditForm.propTypes = {
  state: React.PropTypes.object.isRequired
}

const TagsEditView = ({state}) => (
  <EditView state={state}><TagEditForm state={state} /></EditView>
)
export default TagsEditView
