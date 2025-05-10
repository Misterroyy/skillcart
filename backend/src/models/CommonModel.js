const db = require('../config/db');

class CommonModel {

    static async findOne(tableName, whereCondition) {
        return await db(tableName).where(whereCondition).first();
    }
   
 
    static async create(tableName, data) {
        const [id] = await db(tableName).insert(data);
        return { id, ...data };
    }

    static async findAll(tableName, options = {}) {
        const query = db(tableName);
        if (options.where) query.where(options.where);
        if (options.orderBy) query.orderBy(options.orderBy);
        if (options.limit) query.limit(options.limit);
        if (options.offset) query.offset(options.offset);

        return await query;
    }

    static async update(tableName, data, whereCondition) {
        return await db(tableName).where(whereCondition).update(data);
    }

    static async delete(tableName, whereCondition) {
        return await db(tableName).where(whereCondition).del();
    }
}

module.exports = CommonModel;
