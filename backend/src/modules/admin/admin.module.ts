import { AdminController } from './admin.controller.js';
import { AdminService } from './service/admin.service.js';
import { AdminRepository } from './repository/admin.repository.js';
import { userService } from '@/modules/user/user.module.js';
import { materialService } from '@/modules/materials/material.module.js';

const adminRepository = new AdminRepository(userService, materialService);
const adminService = new AdminService(adminRepository);
const adminController = new AdminController(adminService);

export { adminController, adminService, adminRepository };