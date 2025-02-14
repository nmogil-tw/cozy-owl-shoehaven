// src/integrations/airtable/client.ts
import Airtable from 'airtable';

if (!import.meta.env.AIRTABLE_API_KEY) {
  throw new Error('Missing Airtable API key. Please check your environment variables.');
}

if (!import.meta.env.AIRTABLE_BASE_ID) {
  throw new Error('Missing Airtable Base ID. Please check your environment variables.');
}

const base = new Airtable({ apiKey: import.meta.env.AIRTABLE_API_KEY })
  .base(import.meta.env.AIRTABLE_BASE_ID);

// Functions to interact with Airtable
export const airtable = {
  // Get all records from a table
  async getAll(tableName: string) {
    try {
      const records = await base(tableName).select().all();
      return records.map(record => ({
        id: record.id,
        ...record.fields
      }));
    } catch (error) {
      console.error(`Error fetching from ${tableName}:`, error);
      throw error;
    }
  },

  // Get a single record by ID
  async getById(tableName: string, id: string) {
    try {
      const record = await base(tableName).find(id);
      return {
        id: record.id,
        ...record.fields
      };
    } catch (error) {
      console.error(`Error fetching ${id} from ${tableName}:`, error);
      throw error;
    }
  },

  // Create a new record
  async create(tableName: string, fields: Record<string, any>) {
    try {
      const record = await base(tableName).create(fields);
      return {
        id: record.id,
        ...record.fields
      };
    } catch (error) {
      console.error(`Error creating record in ${tableName}:`, error);
      throw error;
    }
  },

  // Update a record
  async update(tableName: string, id: string, fields: Record<string, any>) {
    try {
      const record = await base(tableName).update(id, fields);
      return {
        id: record.id,
        ...record.fields
      };
    } catch (error) {
      console.error(`Error updating ${id} in ${tableName}:`, error);
      throw error;
    }
  },

  // Delete a record
  async delete(tableName: string, id: string) {
    try {
      const record = await base(tableName).destroy(id);
      return {
        id: record.id,
        ...record.fields
      };
    } catch (error) {
      console.error(`Error deleting ${id} from ${tableName}:`, error);
      throw error;
    }
  },

  // Find records by a field value
  async findByField(tableName: string, field: string, value: any) {
    try {
      const records = await base(tableName)
        .select({
          filterByFormula: `{${field}} = "${value}"`
        })
        .all();
      
      return records.map(record => ({
        id: record.id,
        ...record.fields
      }));
    } catch (error) {
      console.error(`Error finding records in ${tableName} where ${field} = ${value}:`, error);
      throw error;
    }
  }
};