const fetch = require('node-fetch');

const url = 'https://circleci.com/api/v2/pipeline?org-slug=gh/rosieyohannan&mine=true';
const options = {method: 'GET', headers: {'Circle-Token': 'CIRCLE_TOKEN'}};

(async () => {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
})();
