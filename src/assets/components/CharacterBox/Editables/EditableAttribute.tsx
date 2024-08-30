import { AttributeEditType, editSignal } from "./EditAttributeDialog"

export default function EditableAttribute({text, maxLength, attributesGroup = '', attributeID = '',  attributeSection = '', title = undefined, multiline = false, disableDelete = false}:AttributeEditType) {
  return(
    <span onClick={handleClick} className="clickable-editable">
       {text}
    </span>
  )
  function handleClick() {  
    editSignal.value = {text: text, maxLength: maxLength, attributesGroup: attributesGroup,
      attributeID: attributeID, attributeSection:attributeSection,  title: title, multiline: multiline,
      disableDelete: disableDelete};
  }
}

