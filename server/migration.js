// migration.js - Run this ONCE to fix existing data
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Form from './models/Form.js';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/formbuilder';

async function migrateData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    console.log('🔄 Starting migration...');
    
    const forms = await Form.find({});
    console.log(`📊 Found ${forms.length} forms to migrate`);
    
    let updatedCount = 0;
    
    for (const form of forms) {
      let needsUpdate = false;
      
      // Add slug if missing
      if (!form.slug) {
        form.slug = form.form_name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') + '-' + Date.now();
        needsUpdate = true;
        console.log(`  ➕ Added slug to form: ${form.form_name}`);
      }
      
      // Fix sections
      if (form.sections && form.sections.length > 0) {
        form.sections = form.sections.map(section => {
          let sectionNeedsUpdate = false;
          
          // Add section ID if missing
          if (!section.id) {
            section.id = uuidv4();
            sectionNeedsUpdate = true;
          }
          
          // Ensure repeatable is a boolean (not string or null)
          if (typeof section.repeatable !== 'boolean') {
            section.repeatable = false;
            sectionNeedsUpdate = true;
          }
          
          // Ensure maxEntries is a number
          if (typeof section.maxEntries !== 'number') {
            section.maxEntries = 0;
            sectionNeedsUpdate = true;
          }
          
          // Ensure addButtonText exists
          if (section.addButtonText === undefined || section.addButtonText === null) {
            section.addButtonText = '';
            sectionNeedsUpdate = true;
          }
          
          // Fix fields
          if (section.fields && section.fields.length > 0) {
            section.fields = section.fields.map(field => {
              // Add field ID if missing
              if (!field.id) {
                field.id = uuidv4();
                sectionNeedsUpdate = true;
              }
              
              // Ensure options is an array
              if (!Array.isArray(field.options)) {
                field.options = [];
                sectionNeedsUpdate = true;
              }
              
              return field;
            });
          }
          
          if (sectionNeedsUpdate) {
            needsUpdate = true;
          }
          
          return section;
        });
      }
      
      if (needsUpdate) {
        await form.save();
        updatedCount++;
        console.log(`  ✅ Updated form: ${form.form_name}`);
      }
    }
    
    console.log(`\n✅ Migration complete!`);
    console.log(`📊 Updated ${updatedCount} out of ${forms.length} forms`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  }
}

// Run migration
migrateData();