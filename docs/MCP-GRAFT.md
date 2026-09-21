# Graft MCP — avoid ENOENT in Cursor

Cursor logs `spawn .../graft ENOENT` when the graft binary is missing or not executable. Use **explicit node + cli.js** in MCP config (not a bare `graft` command).

## Install CLI

```bash
bob-ensure graft
# or: npm install -g @nanonets/graft
```

## User MCP (`~/.cursor/mcp.json`)

```json
"graft": {
  "command": "/path/to/node",
  "args": [
    "/path/to/.local/lib/node_modules/@nanonets/graft/dist/cli.js",
    "mcp"
  ],
  "env": {
    "HOME": "/home/you",
    "PATH": "/home/you/.local/bin:/usr/bin:/bin"
  }
}
```

Replace `/path/to/node` with your Node binary (e.g. nvm `node`).

## Workspace MCP (optional — scopes graph to one repo)

In `<project>/.cursor/mcp.json`, add the repo root as the last arg:

```json
"args": [".../cli.js", "mcp", "/absolute/path/to/project"]
```

## After editing MCP config

Reload MCP servers in Cursor (Settings → MCP).
