const sql = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

console.log('Starting database initialization for Render...');

try {
  // Check if database file exists
  const dbPath = path.join(process.cwd(), 'meals.db');
  const dbExists = fs.existsSync(dbPath);
  
  if (dbExists) {
    console.log('Database file already exists, checking if it needs initialization...');
  } else {
    console.log('Creating new database file...');
  }

  const db = sql('meals.db');

  // Create table if it doesn't exist
  db.prepare(`
    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      image TEXT NOT NULL,
      summary TEXT NOT NULL,
      instructions TEXT NOT NULL,
      creator TEXT NOT NULL,
      creator_email TEXT NOT NULL
    )
  `).run();

  // Check if meals already exist
  const existingMeals = db.prepare("SELECT COUNT(*) as count FROM meals").get();
  
  if (existingMeals.count > 0) {
    console.log(`Database already contains ${existingMeals.count} meals, skipping initialization`);
    process.exit(0);
  }

  // Import the dummy meals data
  const { dummyMeals } = require('./initdb.js');
  
  console.log('Adding initial meals to database...');
  
  const stmt = db.prepare(`
    INSERT INTO meals VALUES (
      null,
      @slug,
      @title,
      @image,
      @summary,
      @instructions,
      @creator,
      @creator_email
    )
  `);

  let addedCount = 0;
  for (const meal of dummyMeals) {
    try {
      stmt.run(meal);
      addedCount++;
      console.log(`✓ Added: ${meal.title}`);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        console.log(`⚠ Skipped (already exists): ${meal.title}`);
      } else {
        console.error(`✗ Error adding ${meal.title}:`, error.message);
      }
    }
  }
  
  console.log(`Database initialization completed. Added ${addedCount} meals.`);
  process.exit(0);
  
} catch (error) {
  console.error('Database initialization failed:', error.message);
  console.log('Continuing with deployment...');
  process.exit(0); // Don't fail the deployment
} 