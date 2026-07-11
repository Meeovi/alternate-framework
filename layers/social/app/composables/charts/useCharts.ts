import type { ChartInput, ChartResponse } from '~/shared/types/charts'
import { executeMesh } from '@mframework/adapter-gateway/client'

export const useCharts = () => {
  const getCharts = async (): Promise<ChartResponse[]> => {
    const result = await executeMesh<{ charts: ChartResponse[] }>(`
      query GetCharts {
        charts {
          id
          name
          type
          data
          createdAt
          updatedAt
        }
      }
    `)
    return result?.charts ?? []
  }

  const getChartById = async (id: string): Promise<ChartResponse | null> => {
    const result = await executeMesh<{ chart: ChartResponse | null }>(`
      query GetChart($id: ID!) {
        chart(id: $id) {
          id
          name
          type
          data
          createdAt
          updatedAt
        }
      }
    `, { id })
    return result?.chart ?? null
  }

  const createChart = async (chart: ChartInput): Promise<ChartResponse> => {
    const result = await executeMesh<{ createChart: ChartResponse }>(`
      mutation CreateChart($input: ChartInput!) {
        createChart(input: $input) {
          id
          name
          type
          data
          createdAt
        }
      }
    `, { input: chart })
    return result!.createChart
  }

  const updateChart = async (id: string, chart: Partial<ChartInput>): Promise<ChartResponse> => {
    const result = await executeMesh<{ updateChart: ChartResponse }>(`
      mutation UpdateChart($id: ID!, $input: ChartInput!) {
        updateChart(id: $id, input: $input) {
          id
          name
          type
          data
          createdAt
        }
      }
    `, { id, input: chart })
    return result!.updateChart
  }

  const deleteChart = async (id: string): Promise<{ success: boolean }> => {
    const result = await executeMesh<{ deleteChart: { success: boolean } }>(`
      mutation DeleteChart($id: ID!) {
        deleteChart(id: $id) { success }
      }
    `, { id })
    return result?.deleteChart ?? { success: false }
  }

  return {
    getCharts,
    getChartById,
    createChart,
    updateChart,
    deleteChart
  }
}