export default function ConditionForceOptions({maxNumber = 5}: props) {
    return(
            <>
                {[...Array(maxNumber + 1).keys()].map(forceValue => {
                    return(
                        <option key = {forceValue}>{forceValue}</option>
                        )
                    })}
            </>
        )
}   

type props = {
    maxNumber?: number
}
