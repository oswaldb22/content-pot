/**
 * Semantic Release configuration for Chrome Extension
 *
 * This configuration:
 * 1. Analyzes commits to determine version bump
 * 2. Generates release notes
 * 3. Updates version in manifest.json
 * 4. Updates CHANGELOG.md
 * 5. Commits changes
 * 6. Creates GitHub release with extension package
 */
module.exports = {
  branches: ["main"],
  plugins: [
    // Analyze commits to determine version bump (patch by default)
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "angular",
        releaseRules: [
          // Force a patch release every time (for daily releases)
          { type: "build", release: "patch" },
          { type: "chore", release: "patch" },
          { type: "ci", release: "patch" },
          { type: "docs", release: "patch" },
          { type: "feat", release: "minor" },
          { type: "fix", release: "patch" },
          { type: "perf", release: "patch" },
          { type: "refactor", release: "patch" },
          { type: "revert", release: "patch" },
          { type: "style", release: "patch" },
          { type: "test", release: "patch" },
        ],
      },
    ],

    // Generate release notes
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "angular",
        writerOpts: {
          groupBy: "type",
          commitGroupsSort: "title",
          commitsSort: "header",
        },
      },
    ],

    // Update CHANGELOG.md
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
        changelogTitle:
          "# Changelog\n\nAll notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.\n",
      },
    ],

    // Update version in manifest.json
    [
      "@semantic-release/exec",
      {
        prepareCmd:
          "node -e \"const fs = require('fs'); const manifest = require('../../extension/manifest.json'); manifest.version = '${nextRelease.version}'; fs.writeFileSync('../../extension/manifest.json', JSON.stringify(manifest, null, 2));\"",
      },
    ],

    // Commit changes
    [
      "@semantic-release/git",
      {
        assets: ["extension/manifest.json", "CHANGELOG.md"],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],

    // Create GitHub release with extension package
    [
      "@semantic-release/github",
      {
        assets: [
          {
            path: "extension/extension.zip",
            label: "Chrome Extension v${nextRelease.version}",
          },
        ],
      },
    ],
  ],
};
