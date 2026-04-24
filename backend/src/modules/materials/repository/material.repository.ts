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

  findAll = async (filters?: { branch?: string; subject?: string; semester?: string; year?: string; fileType?: string }): Promise<Material[]> => {
    const query: Record<string, any> = {};
    if (filters?.branch) query.branch = filters.branch;
    if (filters?.semester) query.semester = filters.semester;
    if (filters?.subject) query.subject = filters.subject;
    if (filters?.year) query.year = filters.year;
    if (filters?.fileType) query.fileType = filters.fileType;

    const materials = await MaterialModel.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return materials as Material[];
  };

  findExistingPyq = async (semester: string, subject: string, year: string): Promise<Material | null> => {
    const material = await MaterialModel.findOne({
      fileType: "PYQ",
      semester,
      subject,
      year,
    }).lean();
    return (material as Material) ?? null;
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

  searchFullText = async (
    text: string,
    filters: { branch?: string; subject?: string; semester?: string; year?: string },
    limit: number
  ): Promise<Material[]> => {
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(escaped, "i");
    const query: Record<string, unknown> = {
      $or: [
        { description: re },
        { fileName: re },
        { subject: re },
        { year: re },
        { title: re },
      ],
    };
    if (filters.branch) query.branch = filters.branch;
    if (filters.subject) query.subject = filters.subject;
    if (filters.semester) query.semester = filters.semester;
    if (filters.year) query.year = filters.year;

    const materials = await MaterialModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return materials as Material[];
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

  update = async (id: string, data: Partial<Material>): Promise<Material | null> => {
    const updated = await MaterialModel.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean();
    return updated as Material | null;
  };
}
