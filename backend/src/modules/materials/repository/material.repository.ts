import { MaterialModel } from "../material.model.js";
import { type Material } from "../material.types.js";
import { type MaterialRepositoryInterface } from "./material.repository.interface.js";

export class MaterialRepository implements MaterialRepositoryInterface {
  create = async (
    data: Omit<Material, "_id" | "createdAt" | "updatedAt" | "downloads">
  ): Promise<Material> => {
    const material = new MaterialModel({
      ...data,
      downloads: 0,
    });
    await material.save();
    return material.toObject() as Material;
  };

  findAll = async (): Promise<Material[]> => {
    const materials = await MaterialModel.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return materials;
  };

  findById = async (id: string): Promise<Material | null> => {
    const material = await MaterialModel.findById(id).lean();
    return material ?? null;
  };

  delete = async (id: string): Promise<void> => {
    await MaterialModel.findByIdAndDelete(id);
  };

  incrementDownload = async (id: string): Promise<void> => {
    await MaterialModel.findByIdAndUpdate(id, { $inc: { downloads: 1 } });
  };

  findByIds = async (ids: string[]): Promise<Material[]> => {
    const materials = await MaterialModel.find({ _id: { $in: ids } }).lean();
    return materials;
  };

  findByFilters = async (filters: { branch?: string; subject?: string; semester?: string }, limit: number): Promise<Material[]> => {
    const query: any = {};
    if (filters.branch) query.branch = filters.branch;
    if (filters.subject) query.subject = filters.subject;
    if (filters.semester) query.semester = filters.semester;

    const materials = await MaterialModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return materials;
  };

  findByUploaderPaginated = async (uid: string, page: number, limit: number): Promise<{ materials: Material[]; total: number; page: number; limit: number }> => {
    const skip = (page - 1) * limit;
    const [materials, total] = await Promise.all([
      MaterialModel.find({ uploaderId: uid })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MaterialModel.countDocuments({ uploaderId: uid })
    ]);

    return {
      materials,
      total,
      page,
      limit,
    };
  };
}
