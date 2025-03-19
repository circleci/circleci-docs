import requests
from dateutil.parser import parse
from datetime import datetime, timedelta

# Replace these with your details
OWNER = 'your_username'
REPO = 'your_repository'
TOKEN = 'your_token'
HEADERS = {'Authorization': f'token {TOKEN}'}

# Get the current date and time
now = datetime.now()

# Get all commits from the master branch
url = f'https://api.github.com/repos/{OWNER}/{REPO}/commits?sha=master'
while url:
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()
    commits = response.json()

    for commit in commits:
        commit_date = parse(commit['commit']['committer']['date'])
        # Check if the commit is a merge commit and is less than a year old
        if 'merge' in commit and (now - commit_date) < timedelta(days=365):
            # Get the commit details
            commit_url = commit['url']
            commit_response = requests.get(commit_url, headers=HEADERS)
            commit_response.raise_for_status()
            commit_details = commit_response.json()

            # Calculate the total changes
            total_changes = commit_details['stats']['total']
            print(f"Commit {commit['sha']} is a merge commit made on {commit_date} with {total_changes} changes.")

    # Get the URL for the next page of commits
    url = response.links.get('next', {}).get('url')