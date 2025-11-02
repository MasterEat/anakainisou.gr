# anakainisou.gr

## DNS & SSL Setup
- Point the apex (`anakainisou.gr`) and `www` records to GitHub Pages using the four A records and two AAAA records from [the official docs](https://docs.github.com/pages/configuring-a-custom-domain). 
- Add a `CNAME` record for `www` pointing to `anakainisou.github.io` if subdomain support is needed.
- After DNS propagates, enable HTTPS in the repository settings so GitHub can issue/renew the TLS certificate automatically.

## UptimeRobot Monitoring
- Create an UptimeRobot monitor targeting `https://anakainisou.gr` (type: HTTPS) with a 5-minute interval.
- Set alert contacts for the core team and verify notifications are delivered.
- Record maintenance windows in UptimeRobot to avoid false alarms during planned downtime.

## Releases & Rollback
- Use the `main` branch for production. Tag each deployment with a semantic version (e.g., `v1.0.0`).
- Keep release notes in GitHub Releases summarizing key changes and deployment date.
- To roll back, redeploy the previous tag via `git revert` or by triggering GitHub Pages to build from the earlier commit.
