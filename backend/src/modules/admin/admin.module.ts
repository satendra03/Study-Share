import { AdminController } from './admin.controller.js';
import { AdminService } from './service/admin.service.js';
import { AdminRepository } from './repository/admin.repository.js';

const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository);
const adminController = new AdminController(adminService);

export { adminController, adminService, adminRepository };