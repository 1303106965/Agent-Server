export interface Tool {
  name: string
  run: (args: any) => Promise<any>
}