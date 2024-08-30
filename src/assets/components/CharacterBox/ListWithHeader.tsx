// import { characterBasicValueType } from "../../types/characterTypes";
import EditableAttribute from "./Editables/EditableAttribute";

export default function ListWithHeader({header, data, maxLength, attributeGroup, sectionClassName = 'list-section', disableDelete = false, liClass = 'text-left'}: props) {
  const DEFAULT_MAX_INPUT_LENGTH = 30;
  const MAX_INPUT_LENGTH_FOR_LABEL = 100;
  const editBlocked = [['pronounce', 'identity', 'origin', 'theme'], ['level', 'classes'], 
  ['agility', 'power', 'will', 'inside'], ['fabulaPoints', 'initiative', 'armor', 'magicalDefence'] ].flat();

  if (!data) return(<></>)
  if (!Array.isArray(data)) return(<></>)
  if (!data.length) return(<></>)


  const dataArray = data?? [];
  console.log(dataArray);

  return(
    <>
    </>
  )

  return (
    <section>
      {/* {gowno.map(input => {return(<>KOPYTO</>)})} */}
         {/* {header && <div>{header}</div>} */}
         {/* <ul className={sectionClassName}>
             {data.map(input => {
              const containLetters = /[a-zA-Z]+/g.test(String(input.value));
              const contentPayload = {text: String(input.value), label: input.name, id: '', socketOrderSuffix: 'description'};
              const headerPayload = {text: input.name, label: input.name, id: '', socketOrderSuffix: 'label'};
              return(
                <li  className={liClass}>
                   <strong><Content {...headerPayload} customMaxLength={MAX_INPUT_LENGTH_FOR_LABEL} /></strong> 
                   {!containLetters && <em className = 'numeric-value'><Content {...contentPayload} /></em>}
                   {containLetters && <em><Content {...contentPayload} /></em>}
                 </li>)})
              }
        </ul> */}
        <>
        {/* {toRead.map(input => {return(<></>)})} */}
        </>

    </section>
  )

  function Content({text, label, socketOrderSuffix, id, customMaxLength}: contentProps){
    const socketOrder = {attributesGroup: attributeGroup, attributeID: id, attributeSection: socketOrderSuffix};
    const editable = !editBlocked.includes(text);
    const length = customMaxLength || maxLength || DEFAULT_MAX_INPUT_LENGTH;
    return(
      <>
        {editable && <EditableAttribute text = {text} maxLength={length} title = {label} {...socketOrder} disableDelete = {disableDelete} />}
        {!editable && <span >{text} </span>}
      </>
    )
  }
}

type contentProps = {
  text: string,
  label: string,
  id: string,
  socketOrderSuffix: string,
  customMaxLength?: number
}

type props = {
    header?: string,
    maxLength?: number,
    attributeGroup: string,
    // data: characterBasicValueType[],
    data: {name: string, value: number | string}[];
    sectionClassName? :string,
    disableDelete?: boolean,
    liClass?: string
}