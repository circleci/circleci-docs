const fetch = require('node-fetch');

async function run() {
  const url = 'https://circleci.com/api/v2/project/github/rosieyohannan/rosie-yohannan-profile/pipeline/run';
  const options = {
    method: 'POST',
    headers: {'Circle-Token': 'YOUR_CIRCLE_TOKEN', 'Content-Type': 'application/json'},
    body: '{"definition_id":"e50fa3c8-8121-5c8d-b7f1-f435bba4d92e","config":{"branch":"circleci-project-setup"},"checkout":{"branch":"circleci-project-setup"}}'
  };
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

run();