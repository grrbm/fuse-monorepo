import { listClinicsWithOwners, getClinicWithOwner, listClinicsByUser } from './db/clinic';

class ClinicService {
  async listTenants(paginationParams: { page?: number; limit?: number } = {}) {
    const page = Math.max(1, paginationParams.page || 1);
    const limit = Math.min(100, Math.max(1, paginationParams.limit || 10));

    const result = await listClinicsWithOwners({ page, limit });

    return {
      success: true,
      message: `Retrieved ${result.clinics.length} tenants`,
      data: {
        tenants: result.clinics,
        pagination: { 
          page, 
          limit, 
          total: result.total, 
          totalPages: result.totalPages 
        }
      }
    };
  }

  async getTenantById(clinicId: string) {
    const clinic = await getClinicWithOwner(clinicId);

    if (!clinic) {
      return {
        success: false,
        message: 'Tenant not found'
      };
    }

    return {
      success: true,
      message: 'Tenant retrieved successfully',
      data: {
        tenant: clinic
      }
    };
  }

  async getTenantsByUser(userId: string) {
    const clinics = await listClinicsByUser(userId);

    return {
      success: true,
      message: `Retrieved ${clinics.length} tenants for user`,
      data: {
        tenants: clinics
      }
    };
  }
}

export default ClinicService;