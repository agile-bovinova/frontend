export class Animal {
    id: number = 0;
    code?: string = '';
    name: string = '';
    gender: string = '';
    birthDate: string = '';
    breed: string = '';
    bovineImg?: File | string;
    stableId: number = 0;
    minTemperature: number = 38.0;
    maxTemperature: number = 39.3;
    minHeartRate: number = 40;
    maxHeartRate: number = 80;

    constructor(data: Partial<Animal> = {}) {
        Object.assign(this, data);
    }
}