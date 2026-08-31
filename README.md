# Transit — Homebrew tap

[Transit](https://transitai.app) is a cross-platform SSH client with an
embedded agentic AI for read-only investigation of network gear.

## Install

```sh
brew install --cask transitai-neteng/tap/transit
```

One command — no separate `brew tap` and no `brew trust`. Installing by
fully-qualified name taps and trusts this single cask automatically.
(Homebrew 6.0 requires explicit trust for third-party taps because a tap is
executable Ruby; the fully-qualified form scopes that to just this cask
rather than to everything the tap might ever ship.)

## Two things that look like bugs and are not

**"There is already an App at /Applications/Transit.app".** Homebrew refuses
to clobber an app it did not install. If you installed Transit by
downloading the `.dmg`, either move the existing app to the Trash first, or:

```sh
brew install --cask --force transitai-neteng/tap/transit
```

**`brew upgrade` does not update Transit.** Deliberate. Transit ships its own
signed updater, so the app keeps itself current and the cask declares
`auto_updates true` to stay out of its way. Take updates in-app, or force
Homebrew to re-install the newest published build with:

```sh
brew upgrade --cask --greedy transit
```

## Requirements

**Apple Silicon, macOS 11 Big Sur or newer.** The release builds a single
`aarch64-apple-darwin` target, so there is no Intel slice — the cask declares
that rather than letting an Intel Mac install a binary it cannot execute.

## Other platforms

Windows, Linux and Intel Macs: <https://downloads.transitai.app>

Linux also has a one-line installer that uses your own package manager
(`pacman`, `apt` or `dnf`):

```sh
curl -fsSL https://downloads.transitai.app/install.sh | sh
```

## Maintenance

`scripts/bump-cask.mjs` points the cask at the newest published prod build,
reading the same `versions.json` the downloads site and `install.sh` read, so
the three cannot disagree about what "latest" means. It takes the sha256 from
the manifest rather than re-hashing a local download — re-hashing a file
against itself proves nothing — and refuses to bump if the published filename
stops matching the URL template the cask builds.

```sh
node scripts/bump-cask.mjs           # newest prod build
node scripts/bump-cask.mjs 6.5.1     # a specific version
```
