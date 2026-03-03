const https = require('https');
const fs = require('fs');
const path = require('path');

function download(url, dest) {
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    }
  };
  https.get(url, options, (res) => {
    if (res.statusCode === 301 || res.statusCode === 302) {
      return download(res.headers.location, dest);
    }
    const file = fs.createWriteStream(dest);
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${dest}`);
    });
  }).on('error', (err) => {
    console.error(`Error downloading ${dest}: ${err.message}`);
  });
}

const dir = path.join(__dirname, 'public', 'logos');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

download('https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/UiPath_Logo.svg/512px-UiPath_Logo.svg.png', path.join(dir, 'uipath.png'));
download('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Microsoft_Power_Automate.svg/512px-Microsoft_Power_Automate.svg.png', path.join(dir, 'power_automate.png'));
download('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/512px-Python-logo-notext.svg.png', path.join(dir, 'python.png'));
download('https://www.automationanywhere.com/sites/default/files/images/2021-09/logo-aa.svg', path.join(dir, 'automation_anywhere.svg'));
