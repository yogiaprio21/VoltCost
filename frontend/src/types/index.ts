export type MaterialType = 'cable'|'mcb'|'switch'|'socket'|'panel'|'conduit'

export type Material = {
  id: number
  name: string
  type: MaterialType
  unit: string
  pricePerUnit: number
}

export type EstimateInput = {
  houseArea: number
  lampPoints: number
  socketPoints: number
  acCount: number
  pumpCount: number
  powerCapacity: 900|1300|2200|3500
  installationType: 'standard'|'premium'
}

export type CostLine = { name: string; unit: string; quantity: number; unitPrice: number }

export type EstimateResponse = {
  id: number
  totalCost: number
  breakdown: {
    metrics: {
      cableLength: number
      conduitLength: number
      circuits: number
      mcb: { main: { rating: number; count: number }; branch: { rating: number; count: number } }
      panelCount: number
      lampPoints: number
      socketPoints: number
    }
    cost: {
      lines: CostLine[]
      subtotal: number
      labor: number
      premium: number
      total: number
    }
  }
}

export type AnalyticsResponse = {
  totalEstimations: number
  averageCost: number
  mostCommonPowerCapacity: number|null
  monthlyTrends: { month: string; count: number; averageCost: number }[]
}
