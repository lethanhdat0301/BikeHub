/**
 * Script để reset và seed lại database với dữ liệu mới
 */
const { exec } = require('child_process');

async function resetDatabase() {
  console.log('🔄 Resetting database...');
  
  try {
    // 1. Reset migrations (this will recreate the database schema properly)
    await runCommand('yarn prisma migrate reset --force');
    console.log('✅ Database has been reset and migrations applied');
    
    // 2. Generate Prisma client
    await runCommand('yarn prisma generate');
    console.log('✅ Prisma client generated');
    
    // 3. Seed new data
    await runCommand('yarn run seed');
    console.log('✅ New data has been seeded');
    
    console.log('🎉 Complete! Database has been updated with new data');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      console.log(stdout);
      if (stderr) console.error(stderr);
      resolve();
    });
  });
}

resetDatabase();