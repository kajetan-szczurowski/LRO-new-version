import {ChangeEventHandler} from 'react'

export default function DropDownList({options, changeHandler, defaultOption = undefined} : props) {
    const optionArray = defaultOption? options : ['dummy', ...options]; 

    return(
        <select onChange = {changeHandler}>
            {optionArray.map(opt => {
                return(
                <option key = {opt}>
                    {opt}
                </option>)
            })}
        </select>
    )

}

type props = {
    options: string[],
    changeHandler: ChangeEventHandler<HTMLSelectElement>,
    defaultOption? :string
}