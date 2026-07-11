export interface ChartInput {
  name: string
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter'
  data: Record<string, unknown>
  options?: ChartOptions
}

export interface ChartOptions {
  title?: string
  xAxis?: AxisOptions
  yAxis?: AxisOptions
  colors?: string[]
  responsive?: boolean
}

export interface AxisOptions {
  label?: string
  min?: number
  max?: number
}

export interface ChartResponse {
  id: string
  name: string
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter'
  data: Record<string, unknown>
  createdAt: string
  updatedAt?: string
}