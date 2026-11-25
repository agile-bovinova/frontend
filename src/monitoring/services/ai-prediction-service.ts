import http from "../../shared/services/http";
import type { BovineHealthPrediction, ClinicalAdvice } from "../model/health-prediction";

export class AiPredictionService {
    async getPrediction(bovineId: number): Promise<BovineHealthPrediction> {
        const response = await http.get<BovineHealthPrediction>(`/bovines/${bovineId}/health-prediction`);
        return response.data;
    }

    async getClinicalAdvice(bovineId: number): Promise<ClinicalAdvice> {
        const response = await http.get<ClinicalAdvice>(`/bovines/${bovineId}/health-prediction/clinical-advice`);
        return response.data;
    }
}

export const aiPredictionService = new AiPredictionService();
