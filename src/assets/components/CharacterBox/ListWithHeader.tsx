
export default function ListWithHeader({header, data}: props) {
  return (
    <section>
        {header && <div>{header}</div>}
        <ul>
            {data.map(input => {
              const containLetters = /[a-zA-Z]+/g.test(String(input.value));
              return(
                <li key = {input.name + input.value}>
                  <strong>{input.name}</strong> 
                  {!containLetters && <em className = 'numeric-value'>{input.value}</em>}
                  {containLetters && <em>{input.value}</em>}
                </li>)})}
        </ul>
    </section>
  )
}

type props = {
    header?: string
    data: {name: string, value: number | string}[];
}