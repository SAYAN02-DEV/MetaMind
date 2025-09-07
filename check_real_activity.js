// Script to monitor real activity data changes
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const ACTIVITY_FILE = path.join(os.homedir(), '.metamind', 'activity_data.json');

async function monitorActivityFile() {
  console.log('Monitoring activity file for changes...');
  console.log('File location:', ACTIVITY_FILE);
  
  let lastContent = '';
  
  setInterval(async () => {
    try {
      const currentContent = await fs.readFile(ACTIVITY_FILE, 'utf8');
      
      if (currentContent !== lastContent) {
        console.log('\n=== ACTIVITY DATA UPDATED ===');
        console.log('Timestamp:', new Date().toISOString());
        
        const data = JSON.parse(currentContent);
        const today = new Date().toISOString().split('T')[0];
        
        if (data[today]) {
          console.log('Apps detected today:');
          Object.keys(data[today]).forEach(app => {
            const appData = data[today][app];
            console.log(`- ${app}: ${appData.sessions.length} sessions, ${appData.duration}s total`);
          });
        }
        
        lastContent = currentContent;
      }
    } catch (error) {
      console.log('Waiting for activity file to be created...');
    }
  }, 2000); // Check every 2 seconds
}

monitorActivityFile();
