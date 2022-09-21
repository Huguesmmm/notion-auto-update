const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

// map of status and stage
const statusToStage = [
    { id: 0, state: 'not Started', stage: 'Not started' },
    { id: 1, state: 'started', stage: 'In progress' },
    { id: 2, state: 'done', stage: 'Done' },
];

// map status to stage
function mapStatusToStage(status) {
    const stage = statusToStage.find((s) => s.state === status);
    if (stage !== undefined) {
        return stage.stage;
    } else {
        return statusToStage[0].stage;
    }
}

// Retrieve databases
async function getDatabases() {
    const res = await notion.databases.retrieve({
        database_id: databaseId,
    });
    console.log(res);
}

// Retrieve a state from propoerty 'StateInput' of a page
async function getStatusOf(pageId) {
    const res = await notion.pages.retrieve({
        page_id: pageId,
    });
    console.log(res.properties['StateInput'].formula.string);
    return res.properties['StateInput']?.formula?.string ?? 'not Started';
}

// Retrive a state from propoerty 'Stage' of a page
async function getStageOf(pageId) {
    const res = await notion.pages.retrieve({
        page_id: pageId,
    });
    return res.properties['Stage'].status?.name ?? 'Not Started';
}

// Set stage property of a page
async function setStageOf(pageId, stage) {
    const res = await notion.pages.update({
        page_id: pageId,
        properties: {
            Stage: {
                status: {
                    name: stage,
                },
            },
        },
    });
    // console log the page and the stage
    console.log(`Updated ${pageId} to ${stage}`);
}

// Retrieve a page
async function getPage(pageId) {
    const res = await notion.pages.retrieve({
        page_id: pageId,
    });
    return res;
}


// Check for updates in status on pages of a database
async function checkForUpdates() {
    const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
            and: [
                {
                    property: 'Stage',
                    status: {
                        does_not_equal: 'Cours',
                    },
                },
                {
                    property: 'Stage',
                    status: {
                        does_not_equal: 'Stuck',
                    },
                },
            ],
        },
    }).then((response) => {
        response.results.forEach((page) => {

            const status = page.properties['StateInput']?.formula?.string ?? 'not started';
            const stage = page.properties['Stage'].status?.name ?? 'Not started';

            // Console log last edited time
            // log the page name and the last edited time
            // console.log(page.properties.Name.title[0].plain_text, page.last_edited_time);

            // Check if formula status is same as stage, if not update stage
            if (mapStatusToStage(status) != stage) {
                setStageOf(page.id, mapStatusToStage(status));
             console.log(`Updated (${page.id}) ${page.properties.Name.title[0].plain_text} from ${stage} to ${mapStatusToStage(status)}`);
            }
        });
    });
}

// Check for pages to archive
//TODO: Integrate email notification
async function checkForArchives() {
    const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
            and: [
                // {
                //     property: 'Stage',
                //     status: {
                //         equals: 'Done',
                //     },
                // },
                {
                    property: 'Archive',
                    checkbox: {
                        equals: true,
                    },
                },
            ],
        },
    }).then((response) => {
        response.results.forEach((page) => {
            // Console log last edited time
            // log the page name and the last edited time
            console.log(page.properties.Name.title[0].plain_text, page.last_edited_time);
        });
    });
}


module.exports = {
    checkForUpdates,
    setStageOf
};