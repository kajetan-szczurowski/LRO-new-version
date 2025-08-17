export default function ConditionForceOptions({maxNumber = 5}: props) {
    return(
            <>
                {[...Array(maxNumber).keys()].map(forceValue => {
                    return(
                        <option key = {forceValue}>{forceValue + 1}</option>
                        )
                    })}
            </>
        )
}   

type props = {
    maxNumber?: number
}
