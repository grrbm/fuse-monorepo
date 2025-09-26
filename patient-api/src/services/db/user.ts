import User from "../../models/User";

export const getUser = async (userId: string): Promise<User | null> => {
    return  User.findByPk(userId);
}

export const updateUser = async (userId: string, updateData: Partial<User>): Promise<[number]> => {
    return User.update(updateData, { where: { id: userId } });
}