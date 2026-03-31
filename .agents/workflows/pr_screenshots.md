---
description: How to include Before/After screenshots in Pull Requests
---
When making feature changes that impact the UI, follow this workflow to ensure Before/After screenshots are included in the Pull Request body:

1. **Capture Screenshots:** Use the `browser_subagent` to capture UI screenshots of the component before your changes (e.g. from the `main` branch) and after your changes (on the specific feature branch).
// turbo
2. **Save Locally:** Make sure an `assets/screenshots` folder exists in the root of the repository. Name your screenshots clearly (e.g. `pr2_before.png` and `pr2_after.png`).
3. **Commit Images:** Commit these files to the feature branch.
4. **Reference in PR Description:** In the markdown body of your pull request (whether using `gh pr create` or `gh pr edit`), link these items using GitHub relative URLs or raw URLs based on the branch you're working on, exactly like this format: 

`![Before](https://github.com/kobemartin/feuliq/blob/<branch_name>/assets/screenshots/<before_filename>.png?raw=true)`
`![After](https://github.com/kobemartin/feuliq/blob/<branch_name>/assets/screenshots/<after_filename>.png?raw=true)`
