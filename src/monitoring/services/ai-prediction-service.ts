import http from "../../shared/services/http";
import type { BovineHealthPrediction } from "../model/health-prediction";

export class AiPredictionService {
    async getPrediction(bovineId: number): Promise<BovineHealthPrediction> {
        const response = await http.get<BovineHealthPrediction>(`/bovines/${bovineId}/health-prediction`);
        return response.data;
    }
}

export const aiPredictionService = new AiPredictionService();
