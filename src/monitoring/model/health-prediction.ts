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

export interface ClinicalAdvice {
    bovineId: number;
    bovineName: string;
    clinicalSummary: string;
    prescribedMedicine: string;
    dosageAndRoute: string;
    inventoryStatus: "InStock" | "OutOfStock" | "NoInventory";
    inventoryDetails: string;
    firstAidMeasures: string[];
    followUpInstructions: string;
    source: "Gemini-AI" | "Embedded-Clinical-Engine";
    generatedAt: string;
}
