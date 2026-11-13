# DuckDB Writer

The DuckDB Writer plugin writes data to a [DuckDB](https://duckdb.org/) database file.

DuckDB is an embedded database with no server process, so the `jdbcUrl` points straight at a database file.

## Example

Assume the target table looks like this:

```sql
CREATE TABLE addax_tbl
(
    col1 VARCHAR,
    col2 INTEGER,
    col3 TIMESTAMP,
    col4 BOOLEAN,
    col5 BLOB
);
```

The following configuration writes data generated in memory to DuckDB.

<<<@/public/assets/jobs/duckdbwriter.json

Save the above configuration file as `job/stream2duckdb.json`

### Execute Collection Command

Execute the following command for data collection

```bash
bin/addax.sh job/stream2duckdb.json
```

## Parameters

This plugin is based on [RDBMS Writer](rdbmswriter), so you can refer to all parameters of RDBMS Writer. A DuckDB connection needs no credentials, so the `username` and `password` every other writer requires are not needed here.

The target table must **already exist**; the plugin does not create it. Note that `preSql` runs too late for that, because a job reads the column metadata of the table while it initializes.

## Bulk Loading

DuckDB offers an `Appender` interface that bypasses the SQL layer and is the recommended way to bulk load. The plugin uses it automatically when all of the following hold:

- `writeMode` is `insert`;
- the configured `column` list matches the physical column order of the table;
- every target column holds a scalar type.

Otherwise it falls back to the regular `INSERT` batch path and logs the reason, for example:

```
Falling back to the prepared statement, the configured columns [name, id, qty] do not match the physical order [id, name, qty]
```

The order is checked because the appender writes every column in the physical order of the table and cannot take a subset or a reordering; without the check a reordered column list would **silently write into the wrong columns**.

## Connection Configuration

DuckDB connection options are appended to the `jdbcUrl` separated by `;` (not by `?` and `&`):

```
jdbc:duckdb:/data/test.duckdb;threads=4;memory_limit=4GB;temp_directory=/tmp
```

### Connections to the same file must share one configuration

The driver caches database instances by the absolute path of the file, so connections to the same file inside one JVM reuse a single instance, and the database level configuration is decided by the **first** connection that creates it. A later connection asking for a different one fails outright:

```
Can't open a connection to same database file with a different configuration than existing connections
```

So when the reader and the writer of a job point at the same file, both `jdbcUrl` values must carry exactly the same options.

### About channel

Set `channel: 1` explicitly. DuckDB allows a single write transaction per file at a time, so concurrent channels only add write conflicts without adding throughput.

## writeMode

- `insert` uses `insert into`;
- `replace` uses `insert or replace into` and needs a primary key or a unique constraint on the target table;
- `update(col1,col2...)` uses `insert ... on conflict (col1,col2...) do update set ...`.

Neither `replace` nor `update` uses the appender; both go through the regular batch path.

## Platform Support

The `duckdb_jdbc` shipped with the distribution carries the native library for **Linux x86_64** only. On any other platform the job fails at startup because the driver cannot find its native library; replace the driver jar with the one built for your platform.

| Platform | Driver jar |
| --- | --- |
| macOS Apple Silicon | `duckdb_jdbc-<version>-macos_arm64.jar` |
| macOS Intel | `duckdb_jdbc-<version>-macos_amd64.jar` |
| Windows x64 | `duckdb_jdbc-<version>-windows_amd64.jar` |
| Windows ARM64 | `duckdb_jdbc-<version>-windows_arm64.jar` |
| Linux ARM64 | `duckdb_jdbc-<version>-linux_arm64.jar` |

`<version>` is the driver version the distribution already uses, shown by the original file name under `libs/`; the artifacts live at
`https://repo1.maven.org/maven2/org/duckdb/duckdb_jdbc/<version>/`.

Put the downloaded jar into the `libs/` directory of both the reader and the writer plugin, and delete the original Linux driver:

```
plugin/reader/duckdbreader/libs/duckdb_jdbc-<version>-linux_amd64.jar
plugin/writer/duckdbwriter/libs/duckdb_jdbc-<version>-linux_amd64.jar
```

In the official tar.gz those two files are symlinks to `shared/duckdb_jdbc-<version>-linux_amd64.jar`, so overwriting the contents of that file works as well and the name can stay. Windows extraction tools usually do not recreate symlinks, so replacing the files under `libs/` is the safer route there.

Alternatively, `bin/install_plugins.sh -f duckdbreader duckdbwriter` (needs Maven and network) downloads the driver matching the current platform from Maven Central.

A build from source needs no manual step: the build picks the jar for the host OS and architecture, and a cross-build can pass `-Dduckdb.jdbc.classifier=macos_arm64`. Use `linux_amd64_musl` / `linux_arm64_musl` on musl systems such as Alpine.

## Data Type Mapping

| Addax Type             | DuckDB Type                                            |
| ---------------------- | ------------------------------------------------------ |
| Long                   | TINYINT / SMALLINT / INTEGER / BIGINT                  |
| Double                 | FLOAT / DOUBLE                                         |
| String                 | VARCHAR, and any other type DuckDB converts implicitly |
| String / Double / Long | DECIMAL                                                |
| Date                   | DATE / TIME / TIMESTAMP                                |
| Boolean                | BOOLEAN                                                |
| Bytes                  | BLOB                                                   |

The appender binds by the **DuckDB type of the target column**: an integer column reads `asLong()`, a floating point column `asDouble()`, a DECIMAL column `asBigDecimal()` and a text column `asString()`. A DECIMAL target therefore lands exactly whatever the source is, text or numeric.

`LIST`, `STRUCT`, `MAP`, `UNION` and other nested types, as well as `GEOMETRY`, cannot be a write target yet; the plugin fails on them.
