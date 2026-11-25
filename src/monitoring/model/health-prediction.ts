export interface BovineHealthPrediction {
    bovineId: number;
    bovineName: string;
    riskPercentage: number;
    riskLevel: string; // "Bajo" | "Moderado" | "Alto (Inminente)"
    badge: string; // "🟢" | "🟡" | "🔴"
    predictedClass: number; // 0 | 1
    timeHorizon: string;
    primaryFactor: string;
    recommendedAction: string;
    currentTemperature: number;
    currentHeartRate: number;
    tempSlope3h: number;
    hrSlope3h: number;
    tempVariability3h: number;
    thiIndex: number;
    readingsEvaluated: number;
    evaluatedAt: string;
}
