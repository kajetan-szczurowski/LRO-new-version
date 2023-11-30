import {ComponentType, useState} from 'react'

export function withInputFilter<T>(Component: ComponentType<T>){
    
    return function ComponentWithData(hocProps: any){
        const [filter, setFilter] = useState("");
        const inputClass = "input-filter";
        
        return(
            <>
            <input type="text" className = {inputClass} value = {filter} onChange = {(e: React.FormEvent<HTMLInputElement>) => setFilter(e.currentTarget.value) }/>
            <Component {...hocProps} filter = {filter}/>
            </>
        )
    }
}
