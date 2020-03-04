const iq = require('inquirer');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

/*
   /team/${team_key}/events/${year} (/keys ||/statuses )
   /events/${year}
   /event/${event_key}/teams (/keys)
 */

const getTBA = async (endpoint) => {
  const response = await fetch(`https://www.thebluealliance.com/api/v3${endpoint}?X-TBA-Auth-Key=${process.env.TBAKEY}`);
  return response.json();
};

iq
  .prompt([
    {
      name: 'endpoint',
      message: 'What endpoint would you like to fetch?',
      type: 'list',
      choices: [
        {
          name: '/team/{team_key}/events/{year}',
          value: 'Team Events',
        },
        {
          name: '/events/{year}',
          value: 'Annual Events',
        },
        {
          name: '/event/{event_key}/teams',
          value: 'Teams @ Event',
        },
      ],
    },
    {
      name: 'team_key',
      type: 'input',
      default: 'frc2202',
      when: (a) => a.endpoint === 'Team Events',
    },
    {
      name: 'event_key',
      type: 'input',
      default: '2019wimi',
      when: (a) => a.endpoint === 'Teams @ Event',
    },
    {
      name: 'year',
      type: 'input',
      default: '2020',
      when: (a) => a.endpoint === 'Team Events' || a.endpoint === 'Annual Events',
    },
  ])
  .then(async (answers) => {
    switch (answers.endpoint) {
      case 'Team Events':
        if (!fs.existsSync('data')) fs.mkdirSync('data');
        fs.writeFileSync(path.join(process.cwd(), 'data', 'teamEvents.json'), JSON.stringify(await getTBA(`/team/${answers.team_key}/events/${answers.year}`), null, 2));
        console.log('Success!');
        break;
        // case 'Annual Events':
        //     break;
        // case 'Teams @ Event':
        //     break;
      default:
        console.error('Bad Endpoint');
    }
  });
