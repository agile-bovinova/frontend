import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Info } from "../../dashboard/model/info";
import { dashboardService } from "../../dashboard/services/dashboard-service";
import { Stable } from "../../stables/model/stable";
import { stableService } from "../../stables/services/stable-service";
import { type Staff } from "../../staff/model/staff";
import {
    staffService,
    type CreateStaffWithNewUserPayload,
    type GrantAccessToExistingUserPayload,
    type UpdateStaffAccessPayload,
} from "../../staff/services/staff-service";
import { Campaign } from "../../campaigns/model/campaign";
import { campaignService } from "../../campaigns/services/campaigns-service";
import { Category } from "../../inventory/model/Category";
import { Product } from "../../inventory/model/Product";
import { inventoryService } from "../../inventory/services/inventory-service";
import { Animal } from "../../animals/model/animal";
import type { BovineBreed } from "../../animals/model/bovine-breed";
import { animalsService } from "../../animals/services/animals-service";

type StaffApiResponse = Staff & {
    employeeStatus?: Staff["status"];
};

interface GlobalState {
    // Dashboard
    info: Info;
    fetchInfo: () => Promise<void>;
    loadAppData: () => Promise<void>;

    // Animals
    animals: Animal[];
    breeds: BovineBreed[];
    fetchAnimals: () => Promise<void>;
    fetchBreeds: () => Promise<void>;
    addAnimal: (animal: Animal) => Promise<Animal | undefined>;
    deleteAnimal: (animal: Animal) => Promise<void>;
    updateAnimal: (animal: Animal) => Promise<void>;
    addBreed: (breed: { name: string; minTemperature: number; maxTemperature: number; minHeartRate: number; maxHeartRate: number }) => Promise<void>;
    updateBreed: (id: number, breed: { name: string; minTemperature: number; maxTemperature: number; minHeartRate: number; maxHeartRate: number }) => Promise<void>;
    deleteBreed: (id: number) => Promise<void>;

    // Stables
    stables: Stable[];
    fetchStables: () => Promise<void>;
    addStable: (stable: Stable) => Promise<void>;
    deleteStable: (stable: Stable) => Promise<void>;
    updateStable: (stable: Stable) => Promise<void>;

    // Campaigns
    campaigns: Campaign[];
    fetchCampaigns: () => Promise<void>;
    addCampaign: (campaign: Campaign) => Promise<void>;
    updateCampaign: (campaign: Campaign) => Promise<void>;
    deleteCampaign: (campaign: Campaign) => Promise<void>;

    // Staff
    staff: Staff[];
    fetchStaff: () => Promise<void>;
    addStaffWithNewUser: (payload: CreateStaffWithNewUserPayload) => Promise<void>;
    grantStaffAccessToExistingUser: (payload: GrantAccessToExistingUserPayload) => Promise<void>;
    updateStaffAccess: (staff: Staff, payload: UpdateStaffAccessPayload) => Promise<void>;
    deleteStaff: (staff: Staff) => Promise<void>;

    // Inventory
    categories: Category[];
    fetchCategories: () => Promise<void>;
    addCategory: (category: Category) => Promise<void>;
    updateCategory: (category: Category) => Promise<void>;
    deleteCategory: (category: Category) => Promise<void>;
    products: Product[];
    fetchProducts: () => Promise<void>;
    addProduct: (product: Product) => Promise<void>;
    updateProduct: (product: Product) => Promise<void>;
    deleteProduct: (product: Product) => Promise<void>;
}

export const useGlobalStore = create(immer<GlobalState>((set, get) => ({
    // Dashboard
    info: new Info(),
    fetchInfo: async () => {
        try {
            const res = await dashboardService.getData();

            if (res.data)
                set(state => { state.info = new Info(res.data); });
        } catch (error) {
            console.error(error);
        }
    },
    loadAppData: async () => {
        await Promise.all([
            get().fetchInfo(),
            get().fetchAnimals(),
            get().fetchBreeds(),
            get().fetchStables(),
            get().fetchCampaigns(),
            get().fetchCategories(),
            get().fetchProducts(),
        ]);
    },

    // Animals
    animals: [],
    breeds: [],
    fetchBreeds: async () => {
        try {
            const res = await animalsService.getBreeds();
            if (res.data) {
                set((state) => {
                    state.breeds = res.data;
                });
            }
        } catch (error) {
            console.error(error);
        }
    },
    fetchAnimals: async () => {
        try {
            const res = await animalsService.getAnimals();
            if (res.data) {
                set((state) => {
                    state.animals = res.data.map(a => new Animal(a));
                });
            }
        } catch (error) {
            console.error(error);
        }
    },
    addAnimal: async (animal: Animal) => {
        const res = await animalsService.addAnimal(animal);
        if (res.data) {
            const created = new Animal(res.data);
            set((state) => {
                state.animals.push(created);
            });
            return created;
        }
        return undefined;
    },
    deleteAnimal: async (animal: Animal) => {
        const res = await animalsService.deleteAnimal(animal);
        if (res.status === 200) {
            set((state) => {
                state.animals = state.animals.filter((a) => a.id != animal.id);
            });
        }
    },
    updateAnimal: async (animal: Animal) => {
        const res = await animalsService.updateAnimal(animal);
        if (res.data) {
            set((state) => {
                const index = state.animals.findIndex((a) => a.id === animal.id);
                if (index !== -1) state.animals[index] = new Animal(res.data);
            });
        }
    },
    addBreed: async (breed) => {
        const res = await animalsService.createBreed(breed);
        if (res.data) {
            set((state) => {
                state.breeds.push(res.data);
            });
        }
    },
    updateBreed: async (id, breed) => {
        const res = await animalsService.updateBreed(id, breed);
        if (res.data) {
            set((state) => {
                const index = state.breeds.findIndex((b) => b.id === id);
                if (index !== -1) state.breeds[index] = res.data;
            });
        }
    },
    deleteBreed: async (id) => {
        const res = await animalsService.deleteBreed(id);
        if (res.status === 200) {
            set((state) => {
                state.breeds = state.breeds.filter((b) => b.id !== id);
            });
        }
    },

    // Stables
    stables: [],
    fetchStables: async () => {
        try {
            const res = await stableService.getStables();
            if (res.data) {
                set((state) => {
                    state.stables = res.data.map(s => new Stable(s));
                });
            }
        } catch (error) {
            console.error(error);
        }
    },
    addStable: async (stable: Stable) => {
        try {
            const res = await stableService.addStable(stable);
            if (res.data) {
                set((state) => {
                    state.stables.push(new Stable(res.data));
                });
            }
        } catch (error) {
            console.error(error);
        }
    },
    deleteStable: async (stable: Stable) => {
        try {
            const res = await stableService.deleteStable(stable);
            if (res.status === 200) {
                set((state) => {
                    state.stables = state.stables.filter((s) => s.id != stable.id);
                });
            }
        } catch (error) {
            console.error(error);
        }
    },
    updateStable: async (stable: Stable) => {
        const res = await stableService.updateStable(stable);
        if (res.data) {
            set((state) => {
                const index = state.stables.findIndex((s) => s.id === stable.id);
                if (index !== -1) state.stables[index] = new Stable(res.data);
            });
        }
    },

    //Campaigns
    campaigns: [],
    fetchCampaigns: async () => {
        try {
            const res = await campaignService.getCampaigns();
            if (res.data) {
                set((state) => {
                    state.campaigns = res.data.map(c => new Campaign(c));
                });
            }
        } catch (error) {
            console.error(error);
        }
    },
    addCampaign: async (campaign) => {
        const res = await campaignService.addCampaign(campaign);
        if (res.data) {
            set((state) => {
                state.campaigns.push(new Campaign(res.data));
            });
        }
    },
    updateCampaign: async (campaign) => {
        const res = await campaignService.updateCampaign(campaign);
        if (res.data) {
            set((state) => {
                const index = state.campaigns.findIndex((c) => c.id === campaign.id);
                if (index !== -1) state.campaigns[index] = new Campaign(res.data);
            });
        }
    },
    deleteCampaign: async (campaign) => {
        const res = await campaignService.deleteCampaign(campaign);
        if (res.status === 200) {
            set((state) => {
                state.campaigns = state.campaigns.filter((c) => c.id != campaign.id);
            });
        }
    },

    // Staff
    staff: [],
    fetchStaff: async () => {
        try {
            const res = await staffService.getStaff();
            if (res.data) {
                const mappedStaff: Staff[] = (res.data as StaffApiResponse[]).map((s) => ({
                    ...s,
                    status: s.employeeStatus
                }));
                set(state => { state.staff = mappedStaff; });
            }
        } catch (error) {
            console.error(error);
        }
    },
    // The add/update staff flows rethrow so the dialog can show the API message
    // (duplicate email, user not found, etc.) instead of failing silently.
    addStaffWithNewUser: async (payload) => {
        const res = await staffService.createStaffWithNewUser(payload);
        if (res.data) {
            const mappedStaff: Staff = { ...res.data, status: res.data.employeeStatus };
            set((state) => {
                state.staff.push(mappedStaff);
            });
        }
    },
    grantStaffAccessToExistingUser: async (payload) => {
        const res = await staffService.grantAccessToExistingUser(payload);
        if (res.data) {
            const mappedStaff: Staff = { ...res.data, status: res.data.employeeStatus };
            set((state) => {
                state.staff.push(mappedStaff);
            });
        }
    },
    updateStaffAccess: async (staff, payload) => {
        const res = await staffService.updateStaffAccess(staff.id!, payload);
        if (res.data) {
            const mappedStaff: Staff = { ...res.data, status: res.data.employeeStatus };
            set((state) => {
                const index = state.staff.findIndex((s) => s.id === staff.id);
                if (index !== -1) state.staff[index] = mappedStaff;
            });
        }
    },
    deleteStaff: async (staff) => {
        try {
            const res = await staffService.deleteStaff(staff);
            if (res.status === 204 || res.status === 200) {
                set((state) => {
                    state.staff = state.staff.filter((s) => s.id != staff.id);
                });
            }
        } catch (error) {
            console.error(error);
        }
    },

    // Inventory
    categories: [],
    fetchCategories: async () => {
        try {
            const res = await inventoryService.getCategories();
            if (res.data) {
                set(state => { state.categories = res.data.map(c => new Category(c)); });
            }
        }
        catch (error) {
            console.error(error);
        }
    },
    addCategory: async (category) => {
        try {
            const res = await inventoryService.createCategory(category);
            if (res.data) {
                set((state) => {
                    state.categories.push(new Category(res.data));
                });
            }
        } catch (error) {
            console.error(error);
        }
    },
    updateCategory: async (category) => {
        try {
            const res = await inventoryService.updateCategory(category);
            if (res.data) {
                set((state) => {
                    const index = state.categories.findIndex((c) => c.id === category.id);
                    if (index !== -1) state.categories[index] = new Category(res.data);
                });
            }
        } catch (error) {
            console.error(error);
        }
    },
    deleteCategory: async (category) => {
        try {
            const res = await inventoryService.deleteCategory(category);
            if (res.status === 200) {
                set((state) => {
                    state.categories = state.categories.filter((c) => c.id != category.id);
                });
            }
        } catch (error) {
            console.error(error);
        }
    },
    products: [],
    fetchProducts: async () => {
        try {
            const res = await inventoryService.getProducts();
            if (res.data) {
                set(state => { state.products = res.data.map(p => new Product(p)); });
            }
        } catch (error) {
            console.error(error);
        }
    },
    addProduct: async (product) => {
        const res = await inventoryService.createProduct(product);
        if (res.data) {
            set(state => {
                state.products.push(new Product(res.data));
            });
        }
    },
    updateProduct: async (product) => {
        const res = await inventoryService.updateProduct(product);
        if (res.data) {
            set((state) => {
                const index = state.products.findIndex((p) => p.id === product.id);
                if (index !== -1) state.products[index] = new Product(res.data);
            });
        }
    },
    deleteProduct: async (product) => {
        try {
            const res = await inventoryService.deleteProduct(product);
            if (res.status === 200) {
                set(state => {
                    state.products = state.products.filter((p) => p.id != product.id);
                });
            }
        } catch (error) {
            console.error(error);
        }
    },
})));
