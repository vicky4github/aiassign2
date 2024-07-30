const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const cors = require('cors');
const axios =require("axios")
// const getDocContent = require('./test');
const openai = require('openai');

const app = express();

const PORT = process.env.PORT || 3000;

const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/documents.readonly',
  'https://www.googleapis.com/auth/spreadsheets.readonly'
];


const TOKEN_PATH = 'tokens.json';
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

function createOAuth2Client() {
  const credentials = JSON.parse(fs.readFileSync(__dirname+'//credentials.json'));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

app.use((req, res, next) => {
  const userToken = req.cookies['user-token'];
  if (userToken) {
    req.userToken = userToken;
  }
  next();
});

app.get('/auth', (req, res) => {
  const oAuth2Client = createOAuth2Client();
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'online',
    scope: SCOPES,
  });
  res.redirect(authUrl);
});

app.get('/oauth2callback', (req, res) => {
  const code = req.query.code;
  const oAuth2Client = createOAuth2Client();
  oAuth2Client.getToken(code, (err, token) => {
    if (err) return res.status(400).send('Error retrieving access token');
    res.cookie('user-token', JSON.stringify(token), { httpOnly: true });
    res.redirect('http://localhost:5173'); 
  });
});



async function generateSummary(text) {
  try {

    console.log("++++++++++++++++++++++++++++")
    console.log(`prompt: Summarize the following text:\n\n${text}`)
    console.log("++++++++++++++++++++++++++++")

    const response = await axios.post('http://localhost:5000/generate', {
      prompt: `Summarize the following text: "${text}"}`,
      max_length: 50,
      num_return_sequences: 1
    });
    const summary =removeInitialSentence(response.data.generated_texts[0].trim())
    console.log("Response >>>>>>",summary)
    return summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    return null;
  }
}


app.get('/search', async (req, res) => {
  try {
    const query = req.query.query;
    const authorFilter = req.query.author;
    const docTypeFilter = req.query.doctype;
    const userToken = req.cookies['user-token'];

    if (!userToken) {
      return res.redirect('/auth');
    }

    const oAuth2Client = createOAuth2Client();
    oAuth2Client.setCredentials(JSON.parse(userToken));
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    let q = `name contains '${query}' and (mimeType='application/vnd.google-apps.document' or mimeType='application/vnd.google-apps.spreadsheet')`;

    if (authorFilter) {
      q += ` and '${authorFilter}' in owners`;
    }

    if (docTypeFilter) {
      q += ` and mimeType='${docTypeFilter}'`;
    }

    const response = await drive.files.list({
      q: q,
      fields: 'nextPageToken, files(id, name, mimeType, owners, modifiedTime)',
    });

    const files = response.data.files;
    if (files.length === 0) {
      return res.json({ message: 'No documents found.' });
    }

    const results = await Promise.all(files.map(async (file) => {
      let content = '';
      if (file.mimeType === 'application/vnd.google-apps.document') {
        content = await getDocContent(file.id, oAuth2Client);
      } else if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
        content = await getSheetContent(file.id, oAuth2Client);
      }

      const aiResponse = await axios.post('http://localhost:5000/generate', {
        prompt: `Search for the following query within the content: "${query}". Content: ${content}`,
        max_length: 50,
        num_return_sequences: 1
      });

      const matchingText = aiResponse.data.generated_texts[0];

      const summary = await generateSummary(content);

      return {
        id: file.id,
        title: file.name,
        description: file.mimeType,
        author: file.owners[0]?.displayName || 'Unknown',
        updated: `Updated ${formatUpdatedTime(file.modifiedTime)}`,
        matchingText: matchingText || 'No matching context found',
        summary: summary || 'Summary not available'
      };
    }));

    res.json(results);
  } catch (err) {
    res.status(400).send({ success: false, message: "Error Encountered: " + err.message });
  }
});

function removeInitialSentence(text) {
  const initialSentenceEnd = text.indexOf(': "') + 3;
  const summarizedText = text.substring(initialSentenceEnd);

  return summarizedText;
}


async function getDocContent(fileId, auth) {
  const docs = google.docs({ version: 'v1', auth });
  const doc = await docs.documents.get({ documentId: fileId });
  return doc.data.body.content.map(item => item.paragraph?.elements?.map(el => el.textRun?.content || '').join('') || '').join('\n');
}

async function getSheetContent(fileId, auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  const sheet = await sheets.spreadsheets.get({ spreadsheetId: fileId });
  const sheetData = await sheets.spreadsheets.values.get({ spreadsheetId: fileId, range: 'Sheet1' });
  return sheetData.data.values.map(row => row.join(', ')).join('\n');
}



function formatUpdatedTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return '1 week ago';

  return `${diffWeeks} weeks ago`;
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
