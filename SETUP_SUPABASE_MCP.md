# Project-Specific Supabase MCP Setup

To enable the Supabase MCP integration for THIS project only, I have created the configuration file at `.cursor/mcp.json`.

## Connection String
`postgresql://postgres:LtlM9kiV9PNcV4W8@db.ebostxmvyocypwqpgzct.supabase.co:5432/postgres`

## Configuration
The file `.cursor/mcp.json` has been created with the following content:

```json
{
  "mcpServers": {
    "supabase-cultengine": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres:LtlM9kiV9PNcV4W8@db.ebostxmvyocypwqpgzct.supabase.co:5432/postgres"
      ]
    }
  }
}
```

Cursor should automatically pick up this configuration for this workspace.

## Status
✅ **Configured**: `.cursor/mcp.json` created.

## Tools Included
Once connected, this will expose:
- `query`: Run read-only SQL queries against your live database.
- `schema`: Inspect table definitions (sketches, users, etc.).

> **Note:** The password provided was from your `login variables` file. Ensure this is kept secure.
