export interface Props {
  data: any
  replacer?: (number | string)[] | null;
}

export function JsonData({data, replacer = null}: Props) {
  return <pre style={{whiteSpace: 'pre-wrap'}}>{JSON.stringify(data, replacer, 2)}</pre>
}
