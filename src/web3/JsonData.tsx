export interface Props {
  data: any
}

export function JsonData({data}: Props) {
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
