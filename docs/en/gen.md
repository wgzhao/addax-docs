# Job Config Generation (addax gen)

`addax gen` generates a runnable job JSON from connection strings — connection info, tables, columns and field mapping are filled in automatically, cutting job authoring time from minutes to seconds.

## Usage

```bash
addax gen mysql://user:pass@host:3306/ods --table users \
          --to clickhouse://default@host:8123/ods --table users \
          [--columns a,b,c] [--channel 2] \
          [--password-env SRC_PASS] [--output job.json] [--no-probe]
```

**RDBMS to HDFS** (high-frequency scenario) is also supported:

```bash
addax gen mysql://user:pass@host:3306/ods --table users \
          --to hdfs://namenode:8020/user/hive/warehouse/ods
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

## Writing to HDFS

`--to` takes an `hdfs://host:port/path` form (or a nameservice for HA, e.g. `hdfs://cluster/path`) and generates the hdfswriter config:

- `defaultFS` and `path` are parsed from the connection string; `fileName` defaults to the source table name
- `column` is generated from the source probe as a typed list (int→long, varchar→string, bool→boolean, double family→double, date/time→date; unmapped types fall back to string with a warning)
- The template's sample HA `hadoopConfig`, bloom filter and Kerberos entries are removed unless explicitly requested

| Option | Default | Description |
|---|---|---|
| `--file-type orc|parquet|text` | orc | output file type |
| `--write-mode append|overwrite|nonConflict` | overwrite | write mode |
| `--compress NONE|GZIP|SNAPPY|LZO|BZIP2` | SNAPPY | compression |
| `--field-delimiter <char>` | template default | text file delimiter |
| `--encoding <charset>` | — | text file encoding |
| `--file-name <name>` | source table | output file name |
| `--have-kerberos true|false` | false | enable Kerberos |
| `--kerberos-principal <p>` / `--kerberos-keytab <path>` | — | Kerberos credentials (with `--have-kerberos true`) |
| `--hadoop-config k=v` (repeatable) | — | extra hadoop config entries (HA nameservices etc.) |

## Limitations & fallback

- **Only two scenarios are supported**: RDBMS ↔ RDBMS and RDBMS → HDFS. Other plugins (txtfile, Excel, MongoDB, ...) should use the legacy `gen -r/-w` stitching
- v1 supports single-table sync only; multi-table, transformer and custom where clauses must be edited manually
- With `--no-probe`, behavior is identical to the legacy `addax.sh gen -r/-w`

## Error handling

| Scenario | Behavior |
|---|---|
| Connection failure | Distinguish unreachable host / refused port; suggest checking the address |
| Auth failure | Suggest checking credentials or `--password-env` |
| Source table missing | Report and list similarly-named candidates |
| Target table missing | Report and list candidates (no auto table creation in v1) |
