const https = require('https');

const projectId = "utopian-radar-28chg";
const databaseId = "ai-studio-c64e667b-a479-47ec-97d4-832937e96fe5";
const path = `projects/${projectId}/databases/${databaseId}/documents/appData/global`;

https.get(`https://firestore.googleapis.com/v1/${path}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log("CreateTime:", json.createTime);
    console.log("UpdateTime:", json.updateTime);
  });
}).on('error', err => console.log(err));
