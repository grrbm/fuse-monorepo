import User from "../../models/User";
import UserRoles from "../../models/UserRoles";

export const getUser = async (userId: string): Promise<User | null> => {
    return User.findByPk(userId, {
        include: [{ model: UserRoles, as: 'userRoles', required: false }]
    });
}

export const updateUser = async (userId: string, updateData: Partial<User>): Promise<[number]> => {
    return User.update(updateData, { where: { id: userId } });
}