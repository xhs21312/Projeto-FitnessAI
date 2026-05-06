const db = require('../../config/database');
const bcrypt = require('bcryptjs');

async function seed() {
  const database = db.getDb();
  
  console.log('Creating seed data...');
  
  const hashedPassword = bcrypt.hashSync('password123', 10);
  
  database.run(
    `INSERT OR IGNORE INTO users (uuid, name, email, password, age, weight, height, goal, fitness_level) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['user-001', 'Test User', 'test@fitness.ai', hashedPassword, 28, 75.0, 180, 'strength', 'intermediate'],
    function(err) {
      if (err) console.log('User already exists or error:', err?.message);
      else console.log('Created test user: test@fitness.ai / password123');
    }
  );
  
  database.run(
    `INSERT OR IGNORE INTO workouts (uuid, user_id, name, type, duration, intensity, exercises, scheduled_date, completed) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['workout-001', 1, 'Chest Day', 'strength', 45, 'high', '[{"name":"Bench Press","sets":4,"reps":8},{"name":"Incline Dumbbell Press","sets":3,"reps":10}]', '2026-04-20', 1],
    function(err) {
      if (!err) console.log('Created sample workout');
    }
  );
  
  database.run(
    `INSERT OR IGNORE INTO workouts (uuid, user_id, name, type, duration, intensity, exercises, scheduled_date, completed) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['workout-002', 1, 'Leg Day', 'strength', 50, 'medium', '[{"name":"Squat","sets":4,"reps":8},{"name":"Leg Press","sets":3,"reps":12}]', '2026-04-22', 0],
    function(err) {
      if (!err) console.log('Created sample workout 2');
    }
  );
  
  database.run(
    `INSERT OR IGNORE INTO watch_data (user_id, device_type, heart_rate, calories, steps, distance, active_minutes) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [1, 'simulated', 72, 350, 6500, 4.2, 45],
    function(err) {
      if (!err) console.log('Created sample watch data');
    }
  );
  
  database.close();
  console.log('Seed complete!');
}

seed();
