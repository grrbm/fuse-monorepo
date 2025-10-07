import Clinic from "../../models/Clinic";
import User from "../../models/User";
import { Op } from "sequelize";

export const listClinicsWithOwners = async (options: { page: number; limit: number }) => {
  const { page, limit } = options;
  const offset = (page - 1) * limit;

  const { rows: clinics, count: total } = await Clinic.findAndCountAll({
    limit,
    offset,
    distinct: true,
    order: [['name', 'ASC']]
  });

  // Get owners for each clinic (only brand role users)
  const clinicsWithOwners = await Promise.all(
    clinics.map(async (clinic) => {
      const owner = await User.findOne({
        where: { 
          clinicId: clinic.id,
          role: 'brand'
        },
        attributes: [
          'id',
          'firstName', 
          'lastName',
          'email',
          'phoneNumber',
          'businessType'
        ]
      });

      return {
        ...clinic.toJSON(),
        owner: owner?.toJSON() || null
      };
    })
  );

  return {
    clinics: clinicsWithOwners,
    total,
    totalPages: Math.ceil(total / limit)
  };
};

export const getClinicWithOwner = async (clinicId: string) => {
  const clinic = await Clinic.findByPk(clinicId);
  if (!clinic) return null;

  const owner = await User.findOne({
    where: { 
      clinicId,
      role: 'brand'
    },
    attributes: [
      'id',
      'firstName', 
      'lastName',
      'email',
      'phoneNumber',
      'businessType'
    ]
  });

  return {
    ...clinic.toJSON(),
    owner: owner?.toJSON() || null
  };
};

export const listClinicsByUser = async (userId: string) => {
  return Clinic.findAll({
    where: {
      id: {
        [Op.in]: await User.findAll({
          where: { id: userId },
          attributes: ['clinicId']
        }).then(users => users.map(u => u.clinicId).filter(Boolean))
      }
    },
    order: [['name', 'ASC']]
  });
};