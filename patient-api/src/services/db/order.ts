import Order from "../../models/Order";
import User from "../../models/User";
import Treatment from "../../models/Treatment";

export const getOrder = async (orderId: string) => {
    return Order.findOne({
        where: {
            id: orderId,
        },
        include: [{
            model: Treatment,
            as: 'treatment',
            attributes: ['id', 'name', 'clinicId', 'orderItems']
        }]
    });
}

interface PaginationOptions {
    page: number;
    limit: number;
}

export const listOrdersByClinic = async (
    clinicId: string,
    options: PaginationOptions
): Promise<{ orders: Order[], total: number, totalPages: number }> => {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    const { rows: orders, count: total } = await Order.findAndCountAll({
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
                model: Treatment,
                as: 'treatment',
                where: { clinicId },
                attributes: ['id', 'name', 'clinicId']
            }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true
    });

    return {
        orders,
        total,
        totalPages: Math.ceil(total / limit)
    };
}

export const listOrdersByUser = async (
    userId: string,
    options: PaginationOptions
): Promise<{ orders: Order[], total: number, totalPages: number }> => {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    const { rows: orders, count: total } = await Order.findAndCountAll({
        where: { userId },
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
                model: Treatment,
                as: 'treatment',
                attributes: ['id', 'name', 'clinicId']
            }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true
    });

    return {
        orders,
        total,
        totalPages: Math.ceil(total / limit)
    };
}