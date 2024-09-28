// import { characterBasicValueType } from "../../types/characterTypes";
// import EditableAttribute from "./Editables/EditableAttribute";

// export default function ListWithHeader({header, data, maxLength, attributeGroup, sectionClassName = 'list-section', disableDelete = false, liClass = 'text-left'}: props) {
export default function ListWithHeader({data}: props) {



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