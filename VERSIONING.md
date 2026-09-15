# Versioning and request records

The site uses semantic versions: `major.minor.patch`.

- **Major** — a redesign or major change in the website's purpose.
- **Minor** — a new section, feature, product family, or approved visual direction.
- **Patch** — a correction, content edit, or small visual refinement.

For every accepted user request, create a new file in `requests/` named `vX.Y.Z-brief.md`, summarize the requested work, and add the released changes to `CHANGELOG.md`. Update the version shown in the footer, `<meta name="version">`, and README at the same time.

## Git

Starting at v1.0.0, every release is also committed to git and tagged (`git tag vX.Y.Z`). To revert the whole project to an older version:

```
git checkout vX.Y.Z
```

To go back to the latest version afterwards:

```
git checkout master
```

Run `git tag` to list every version that can be restored this way, or `git log --oneline` to see the full history.
