const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createLog = async (data) => {
    return await prisma.auditLog.create({
        data: {
            action: data.action,
            entity: data.entity,
            entityId: data.entityId?.toString(),
            details: data.details || {},
            userId: data.userId,
        }
    });
};

const listLogs = async (limit = 100) => {
    return await prisma.auditLog.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: { name: true, email: true }
            }
        }
    });
};

module.exports = { createLog, listLogs };
