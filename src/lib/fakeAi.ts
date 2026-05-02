export type RiskLevel = 'Safe' | 'Risk' | 'Danger';

// Helper function to simulate slight fluctuations
const fluctuate = (val: number, percent: number) => {
  const variance = val * (percent / 100);
  return val + (Math.random() * variance * 2 - variance);
};

/**
 * AI-Based Risk Prediction Model (Simulated)
 * Processes multiple environmental sensor feeds to determine real-time risk level.
 */
export function predictRiskLevel(
  rainfallMm: number, 
  seismicActivity: number, 
  waterLevelMeters: number
): { level: RiskLevel, confidence: number, reasoning: string } {
  
  // Advanced Simulation: Weighted scoring mechanism instead of pure static thresholds
  // Add some realistic fluctuation to the readings
  const actualRain = fluctuate(rainfallMm, 5);
  const actualSeismic = fluctuate(seismicActivity, 10);
  const actualWater = fluctuate(waterLevelMeters, 5);

  const rainScore = actualRain / 150;      // max ~1.0
  const seismicScore = actualSeismic / 6.0; // max ~1.0
  const waterScore = actualWater / 5.5;     // max ~1.0

  const totalRiskScore = (rainScore * 0.4) + (seismicScore * 0.4) + (waterScore * 0.2);
  const confidenceScore = Math.min(0.99, 0.70 + (totalRiskScore * 0.2) + (Math.random() * 0.05));

  if (totalRiskScore > 0.85 || actualSeismic > 6.0 || actualWater > 5.5) {
    return {
      level: 'Danger',
      confidence: Number(confidenceScore.toFixed(2)),
      reasoning: `Critical multimodal risk detected. Weighted Risk Score: ${(totalRiskScore * 100).toFixed(1)}%. Immediate evacuation sequence recommended.`
    };
  }
  
  if (totalRiskScore > 0.5 || actualSeismic > 4.5 || actualWater > 3.0 || actualRain > 80) {
    return {
      level: 'Risk',
      confidence: Number((confidenceScore * 0.9).toFixed(2)),
      reasoning: `Elevated environmental stress detected. Weighted Risk Score: ${(totalRiskScore * 100).toFixed(1)}%. Preparatory alerts should be dispatched.`
    };
  }

  return {
    level: 'Safe',
    confidence: Number((confidenceScore * 0.8 + 0.1).toFixed(2)),
    reasoning: `All monitored environmental parameters within nominal ranges. Weighted Risk Score: ${(totalRiskScore * 100).toFixed(1)}%.`
  };
}

export function generateSmartEvacuationRoute(
  userLocation: { lat: number, lng: number },
  shelters: Array<{ id: string, name: string, lat: number, lng: number, capacity: number, currentOccupancy: number }>
) {
  // Mock AI: Find nearest shelter that isn't full and draw a direct safe path
  const availableShelters = shelters.filter(s => s.currentOccupancy < s.capacity);
  
  if (availableShelters.length === 0) return null;

  let nearest = availableShelters[0];
  let minDistance = Infinity;

  availableShelters.forEach(shelter => {
    // Simple Pythagorean distance for mock
    const dist = Math.sqrt(
      Math.pow(shelter.lat - userLocation.lat, 2) + Math.pow(shelter.lng - userLocation.lng, 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      nearest = shelter;
    }
  });

  return {
    shelter: nearest,
    estimatedTimeMinutes: Math.round(minDistance * 1000), // arbitrary multiplier for mock time
    routeStatus: 'Clear',
    alternativeBlocked: false
  };
}
