cask "transit" do
  version "6.5.5"
  sha256 "b70e454d8ef310f2d9d1fc3c76f872fe97186aa19d3502f0146a7f6571e2f5d8"

  url "https://downloads.transitai.app/v#{version}/Transit_#{version}_aarch64.dmg",
      verified: "downloads.transitai.app/"
  name "Transit"
  desc "SSH client with an embedded agentic AI for read-only network investigation"
  homepage "https://transitai.app/"

  livecheck do
    url "https://downloads.transitai.app/versions.json"
    strategy :json do |json|
      json.select { |entry| entry["channel"] == "prod" }
          .map { |entry| entry["version"] }
    end
  end

  # One contiguous stanza group — Cask/StanzaGrouping rejects blank lines
  # inside it, so both notes live here rather than between the stanzas.
  #
  # auto_updates: Transit ships its own signed updater
  # (tauri-plugin-updater), so the installed app moves ahead of whatever
  # Homebrew recorded. Declaring it keeps `brew upgrade` from fighting the
  # in-app updater, and stops a normal self-update reading as breakage.
  #
  # arch: Apple Silicon only. The release builds a single
  # aarch64-apple-darwin target, so there is no Intel slice; without this an
  # Intel Mac installs a binary it cannot execute (Rosetta translates x86 for
  # ARM, not the reverse). Revisit only if the pipeline gains a universal or
  # x86_64 dmg.
  #
  # macos: matches the published requirement in the docs (macOS 12 Monterey or
  # newer). Declaring :big_sur here would have promised an OS the product does
  # not claim to support.
  auto_updates true
  depends_on arch: :arm64
  depends_on macos: :monterey

  app "Transit.app"

  # Everything Transit writes lives under one directory: dirs::config_dir()
  # on macOS is ~/Library/Application Support, and the app keeps its
  # inventory (transit.toml), config.toml, known_hosts.toml, chat history and
  # captures beneath Transit/ there.
  #
  # Deliberately NOT listed: Keychain entries. Zapping is opt-in, but the
  # credentials a user enrolled are reachable by other tooling and are not
  # ours to delete on an uninstall.
  zap trash: [
    "~/Library/Application Support/Transit",
    "~/Library/Caches/com.transit.app",
    "~/Library/HTTPStorages/com.transit.app",
    "~/Library/Preferences/com.transit.app.plist",
    "~/Library/Saved Application State/com.transit.app.savedState",
    "~/Library/WebKit/com.transit.app",
  ]
end
