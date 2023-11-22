import { google } from 'googleapis';
import dayjs from "dayjs";
import { v4 as uuid } from 'uuid';




const calendar = google.calendar({
    version: "v3",
    auth: "AIzaSyD7iNJunIv1EKPWtJ_cyWdCR5DGjrqLrSc"  //api key
})


const oauth2Client = new google.auth.OAuth2(
    '1062770680928-uudekjrn4jmgcl5pjr78lh33pdht1jme.apps.googleusercontent.com',   //oauth client id
    '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',  //oauth client secret
    'http://localhost:5000/google/redirect'   //oauth redirect url
);

// generate a url that asks permissions for Google Calendar scopes
const scopes = [
    'https://www.googleapis.com/auth/calendar'
];

app.get("/google", async (req: Request, res: Response) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });
    res.redirect(url)
})

app.get("/google/redirect", async (req: Request, res: Response) => {
    const code = req.query.code;
    const { tokens } = await oauth2Client.getToken(code as string)
    oauth2Client.setCredentials(tokens);
    res.send("Successfully Log in");
})

app.get("/event", async (req: Request, res: Response) => {
    await calendar.events.insert({
        calendarId: "primary",
        auth: oauth2Client,
        conferenceDataVersion: 1,
        requestBody: {
            summary: "This is test event",
            description: "This is test event description",
            start: {
                dateTime: dayjs(new Date()).add(1, 'day').toISOString(),
                timeZone: "Asia/Dhaka"
            },
            end: {
                dateTime: dayjs(new Date()).add(1, 'day').add(1, 'hour').toISOString(),
                timeZone: "Asia/Dhaka"
            },
            conferenceData: {
                createRequest: {
                    requestId: uuid()
                }
            },
            attendees: [
                {
                    email: "nazmulnobel01885@gmail.com"
                },
                {
                    email: "nazmulbhuyian000@gmail.com"
                }
            ]
        }
    })
    res.send("Done")
})