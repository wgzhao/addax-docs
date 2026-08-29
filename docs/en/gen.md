# Job Config Generation (addax gen)

`addax gen` generates a runnable job JSON from connection strings — connection info, tables, columns and field mapping are filled in automatically, cutting job authoring time from minutes to seconds.

## Usage

```bash
addax gen mysql://user:pass@host:3306/ods --table users \
          --to clickhouse://default@host:8123/ods --table users \
          [--columns a,b,c] [--channel 2] \
          [--password-env SRC_PASS] [--output job.json] [--no-probe]
```

**Mixed endpoints** (JDBC connection string on one side, non-JDBC plugin name on the other) are also supported:

```bash
# database to text file
addax gen mysql://user:pass@host:3306/ods --table users --to txtfilewriter

# text file to database (reader column config generated from the target table)
addax gen txtfilereader --to postgresql://user:pass@host:5432/ods --table users
```

| Option | Default | Description |
|---|---|---|
| `<source connection string>` | required | Source datasource, see format below |
| `--to <target connection string>` | required | Target datasource |
| `--table <table>` | — | Table name for source and target, once each |
| `--columns a,b,c` | all probed | Explicit column list; defaults to all probed columns |
| `--channel N` | 1 | Parallel channels; splitPk is filled automatically when a primary key is found |
| `--password-env VAR` | — | Read password from an environment variable to keep it off the command line |
| `--output <file>` | stdout | Write to file; refuses to overwrite without `--overwrite` |
| `--overwrite` | — | Allow overwriting an existing output file |
| `--no-probe` | false | Skip probing, just stitch plugin templates (legacy behavior) |
| `-l` | — | List all reader/writer plugin names |

## Connection string format

```
scheme://user:password@host:port/database
```

- `scheme` uses the standard JDBC URL name (`mysql`, `postgresql`, `oracle`, `clickhouse`, ...), case-insensitive, no abbreviations
- `port` defaults per scheme when omitted
- `database` is the path segment; it is the service name for Oracle, and a file path for SQLite/Access
- Use `--password-env` or interactive input when the password contains special characters

| scheme | default port | generated JDBC URL |
|---|---|---|
| mysql | 3306 | `jdbc:mysql://host:3306/db?useUnicode=true&characterEncoding=utf-8` |
| postgresql | 5432 | `jdbc:postgresql://host:5432/db` |
| oracle | 1521 | `jdbc:oracle:thin:@//host:1521/db` |
| clickhouse | 8123 | `jdbc:clickhouse://host:8123/db` |
| sqlserver | 1433 | `jdbc:sqlserver://host:1433;DatabaseName=db` |
| db2 | 50000 | `jdbc:db2://host:50000/db` |
| sybase | 5000 | `jdbc:sybase:Tds:host:5000/db` |
| hana | 30015 | `jdbc:sap://host:30015/?databaseName=db` |
| sqlite | — | `jdbc:sqlite:db` (db is a file path) |
| tdengine | 6030 | `jdbc:TAOS-RS://host:6030/db` |
| databend | 8000 | `jdbc:databend://host:8000/db` |
| hive | 10000 | `jdbc:hive2://host:10000/db` |

## Behavior

1. **Probe**: connect to the source and probe table metadata (columns, types, precision, primary key)
2. **Columns**: `column` is filled with all probed columns (validated when `--columns` is given)
3. **Field mapping**: target columns are matched by name; missing columns or type mismatches are **reported as warnings**, never silent
4. **splitPk**: filled automatically when a primary key is found and `--channel` > 1
5. **Password encryption**: passwords are emitted as `${enc:...}` ciphertext (same logic as `encrypt_password.sh`), never plaintext in the generated config
6. **Write mode**: `insert` by default; update mode is not supported in v1
7. **Output**: full `job` JSON (`setting.speed.channel` + `content.reader/writer`), to stdout or a file (file mode 600)

## Non-JDBC plugins (mixed endpoints)

Either side may be a **bare plugin name** (e.g. `txtfilewriter`, `txtfilereader`, `excelwriter`) instead of a connection string:

- The JDBC side is probed as usual
- The non-JDBC side keeps its template defaults (`path`, `fileName`, ...) and a notice asks the user to review them
- The non-JDBC side's `column` config (when the template declares one) is auto-filled:
  - JDBC-style name list → filled with the probed column names
  - Positional config (e.g. txtfilereader's `index` + `type`) → generated from the probe, with JDBC type names mapped to Addax types (int→long, varchar→string, bool→boolean, double family→double, date/time→date; unmapped types fall back to string with a warning)

## Limitations & fallback

- At least one side must be a JDBC connection string (otherwise there is nothing to probe — use the legacy `gen -r/-w` stitching)
- v1 supports single-table sync only; multi-table, transformer and custom where clauses must be edited manually
- With `--no-probe`, behavior is identical to the legacy `addax.sh gen -r/-w`

## Error handling

| Scenario | Behavior |
|---|---|
| Connection failure | Distinguish unreachable host / refused port; suggest checking the address |
| Auth failure | Suggest checking credentials or `--password-env` |
| Source table missing | Report and list similarly-named candidates |
| Target table missing | Report and list candidates (no auto table creation in v1) |
