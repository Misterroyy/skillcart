const db = require('../config/db');

class CommonController {
    static async getAllRecords(tableName) {
        try {
            const results = await db(tableName).select('*');
            return results;
        } catch (error) {
            if (error.message.includes('ER_NO_SUCH_TABLE')) {
                throw { status: 404, message: `Table "${tableName}" does not exist.` };
            }
            console.error('Unhandled error in getAllRecords:', error);
            throw { status: 500, message: 'An internal server error occurred.' };
        }
    }
    static async getRecords({ tableName, fields = ['*'], conditions = {}, limit, offset }) {
        try {
            let query = db(tableName).select(fields);
    
            // Apply conditions dynamically
            Object.entries(conditions).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    query.whereIn(key, value); // For WHERE key IN (...)
                } else {
                    query.where(key, value); // For WHERE key = value
                }
            });
    
            // Apply pagination (only if limit and offset are provided)
            if (limit) query.limit(limit);
            if (offset) query.offset(offset);
    
            return await query; // Await the final query
        } catch (error) {
            if (error.message.includes('ER_NO_SUCH_TABLE')) {
                throw { status: 404, message: `Table "${tableName}" does not exist.` };
            }
            console.error('Unhandled error in getRecords:', error);
            throw { status: 500, message: 'An internal server error occurred.' };
        }
    }
    
    static async getPostRecords({ tableName, fields = ['*'], conditions = {}, orderBy = 'createdAt', order = 'desc', limit, offset }) {
        try {
            let query = db(tableName).select(fields);
    
            // Apply conditions dynamically
            Object.entries(conditions).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    query.whereIn(key, value); // WHERE key IN (...)
                } else {
                    query.where(key, value); // WHERE key = value
                }
            });
    
            // Ensure orderBy field exists in selected fields
            if (fields.includes(orderBy) || orderBy === 'createdAt') {
                query.orderBy(orderBy, order);
            }
    
            // Apply pagination (only if limit and offset are provided)
            if (limit) query.limit(limit);
            if (offset) query.offset(offset);
    
            return await query; // Execute the query
        } catch (error) {
            if (error.message.includes('ER_NO_SUCH_TABLE')) {
                throw { status: 404, message: `Table "${tableName}" does not exist.` };
            }
            console.error('Unhandled error in getPostRecords:', error);
            throw { status: 500, message: 'An internal server error occurred.' };
        }
    }
    
    static async getAllRecordsWithPostDetails({ storyTable, postTable, storyFields, postFields }) {
        try {
            // Fetch all visual stories
            const stories = await db(storyTable).select(storyFields);
    
            // Process each story to replace `visual_post_ids` with full post details
            for (let story of stories) {
                if (story.visual_post_ids) {
                    // Convert JSON string to array of post IDs
                    const postIds = JSON.parse(story.visual_post_ids);
    
                    // Fetch post details based on selected fields
                    const posts = await db(postTable).select(postFields).whereIn('id', postIds);
    
                    // Replace post IDs with actual post details
                    story.visual_post_details = posts;
                    delete story.visual_post_ids; // Remove original `visual_post_ids`
                }
            }
    
            return stories;
        } catch (error) {
            console.error('Error in getAllRecordsWithPostDetails:', error);
            throw { status: 500, message: 'An internal server error occurred.' };
        }
    }
    
    

    static async getRecordByField(tableName, fieldName, fieldValue) {
        try {
            const result = await db(tableName)
                .where(fieldName, fieldValue)
                .first(); // Fetch the first record that matches the condition
            return result || null; // Return null if no record is found
        } catch (error) {
            console.error(`Error in getRecordByField: ${error.message}`);
            throw new Error(`Unable to fetch record from ${tableName}.`);
        }
    }

    static async getRecordById(tableName, id) {
        const result = await db(tableName).where('id', id).first();
        return result;
    }

    static async insertRecord(tableName, data) {
        const [id] = await db(tableName).insert(data);
        return id;
    }

    static async updateRecord(tableName, id, data) {
        return await db(tableName).where('id', id).update(data);
    }

    static async deleteRecord(tableName, id) {
        return await db(tableName).where('id', id).del();
    }
      
    static async getTableColumns(tableName) {
        try {
            const columns = await db(tableName).columnInfo();
            return Object.keys(columns);
        } catch (error) {
            console.error(`Error fetching columns for table ${tableName}:`, error);
            throw { status: 500, message: `Unable to fetch columns for table ${tableName}.` };
        }
    }
}

module.exports = CommonController;
