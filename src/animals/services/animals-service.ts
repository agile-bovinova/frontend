import http from "../../shared/services/http";
import type { Animal } from "../model/animal";
import type { BovineBreed } from "../model/bovine-breed";

export class AnimalsService {
  private endpoint = import.meta.env.VITE_API_BASE_URL + "/bovines";

  async getBreeds() {
    return await http.get<BovineBreed[]>(this.endpoint + "/breeds");
  }

  async createBreed(breed: { name: string; minTemperature: number; maxTemperature: number; minHeartRate: number; maxHeartRate: number }) {
    return await http.post<BovineBreed>(this.endpoint + "/breeds", breed);
  }

  async updateBreed(id: number, breed: { name: string; minTemperature: number; maxTemperature: number; minHeartRate: number; maxHeartRate: number }) {
    return await http.put<BovineBreed>(this.endpoint + "/breeds/" + id, breed);
  }

  async deleteBreed(id: number) {
    return await http.delete(this.endpoint + "/breeds/" + id);
  }

  async getAnimals() {
    return await http.get<Animal[]>(this.endpoint);
  }

  async addAnimal(animal: Animal) {
    const formData = this.toFormData(animal);
    return await http.post(this.endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async deleteAnimal(animal: Animal) {
    return await http.delete(`${this.endpoint}/${animal.id}`);
  }

  async updateAnimal(animal: Animal) {
    return await http.put(`${this.endpoint}/${animal.id}`, animal);
  }

  private toFormData(animal: Animal): FormData {
    const formData = new FormData();
    formData.append("name", animal.name);
    formData.append("gender", animal.gender);
    if (animal.code) {
      formData.append("code", animal.code);
    }
    formData.append("birthDate", animal.birthDate);
    formData.append("breed", animal.breed);
    formData.append("stableId", String(animal.stableId));
    formData.append("minTemperature", String(animal.minTemperature));
    formData.append("maxTemperature", String(animal.maxTemperature));
    formData.append("minHeartRate", String(animal.minHeartRate));
    formData.append("maxHeartRate", String(animal.maxHeartRate));

    if (animal.bovineImg instanceof File) {
      formData.append("FileData", animal.bovineImg);
    }

    return formData;
  }
}

export const animalsService = new AnimalsService();
