/* eslint-disable no-restricted-syntax */
const iq = require('inquirer');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

/*
posting endpoints:
   /team/${team_key}/events/${year} (/keys ||/statuses )
   /events/${year}
   /event/${event_key}/teams (/keys)
   /team/${team_key}/matches/${year}
   /event/${event_key} (/oprs ||/rankings ||/insights )
   /team/${team_key}/event/${event_key}/matches

   TODO: alias these with names we can use everywhere like d.ts, function names, etc.
*/

const getTBA = async (endpoint) => {
    const response = await fetch(`https://www.thebluealliance.com/api/v3${endpoint}?X-TBA-Auth-Key=${process.env.TBAKEY}`);
    return response.json();
};

const strfy = (json) => JSON.stringify(json, null, 2);

const getFilePath = (fileName) => path.join(process.cwd(), 'data', `${fileName}.json`);

const writeFile = (fileName, json) => fs.writeFileSync(getFilePath(fileName), strfy(json));

const ansContains = (answers, ...searches) => searches.includes(answers.endpoint);

(async function () {
    const {
        endpoint, team_key, event_key, year, ks, k, ors,
    } = await iq.prompt([
        // big decision
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
                    value: 'Teams at Event',
                },
                {
                    name: '/team/{team_key}/matches/{year}',
                    value: 'Annual Team Matches',
                },
                {
                    name: '/event/{event_key}',
                    value: 'Event',
                },
                {
                    name: '/team/{team_key}/event/{event_key}/matches',
                    value: 'Team Matches at Event',
                },
            ],
        },
        // additional information
        {
            name: 'team_key',
            type: 'input',
            default: 'frc2202',
            when: (a) => ansContains(a, 'Team Events', 'Annual Team Matches', 'Team Matches at Event'),
        },
        {
            name: 'event_key',
            type: 'input',
            default: '2019wimi',
            when: (a) => ansContains(a, 'Teams at Event', 'Event', 'Team Matches at Event'),
        },
        {
            name: 'year',
            type: 'input',
            default: '2020',
            when: (a) => ansContains(a, 'Team Events', 'Annual Events', 'Annual Team Matches'),
        },
        // ending information
        {
            name: 'ks',
            message: 'Choose an endpoint suffix',
            type: 'list',
            choices: [
                {
                    name: 'n/a',
                    value: '',
                },
                {
                    name: '/keys',
                    value: '/keys',
                },
                {
                    name: '/statuses',
                    value: '/statuses',
                },
            ],
            when: (a) => ansContains(a, 'Team Events'),
        },
        {
            name: 'k',
            message: 'Choose an endpoint suffix',
            type: 'list',
            choices: [
                {
                    name: 'n/a',
                    value: '',
                },
                {
                    name: '/keys',
                    value: '/keys',
                },
            ],
            when: (a) => ansContains(a, 'Teams at Event'),
        },
        {
            name: 'ors',
            message: 'Choose an endpoint suffix',
            type: 'list',
            choices: [
                {
                    name: 'n/a',
                    value: '',
                },
                {
                    name: '/oprs',
                    value: '/oprs',
                },
                {
                    name: '/rankings',
                    value: '/rankings',
                },
                {
                    name: '/insights',
                    value: '/insights',
                },
            ],
            when: (a) => ansContains(a, 'Event'),
        },
    ]);

    if (!fs.existsSync('data')) fs.mkdirSync('data');
    switch (endpoint) {
        case 'Team Events':
            writeFile('teamEvents', await getTBA(`/team/${team_key}/events/${year}${ks}`));
            break;
        case 'Annual Events':
            writeFile('annualEvents', await getTBA(`/events/${year}`));
            break;
        case 'Teams at Event':
            writeFile('teamsAtEvent', await getTBA(`/event/${event_key}/teams${k}`));
            break;
        case 'Annual Team Matches':
            writeFile('annualTeamMatches', await getTBA(`/team/${team_key}/matches/${year}`));
            break;
        case 'Event':
            writeFile('event', await getTBA(`/event/${event_key}${ors}`));
            break;
        case 'Team Matches at Event':
            writeFile('teamsMatchesAtEvent', await getTBA(`/team/${team_key}/event/${event_key}/matches`));
            break;
        default:
            console.error('Bad Endpoint');
            process.exit(1);
    }
    console.log('Success! Closing now...');
    setTimeout(() => process.exit(0), 1000);
}());
