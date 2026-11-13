# DuckDB Reader

The DuckDB Reader plugin reads data from a [DuckDB](https://duckdb.org/) database file. It is based on the [RDBMS Reader](rdbmsreader).

DuckDB is an embedded database with no server process, so the `jdbcUrl` points straight at a database file.

## Example

Create a sample database with the DuckDB CLI (the Python `duckdb` module or the `duckdb` command line both work):

```sql
$ duckdb /tmp/test.duckdb
D CREATE TABLE test(id INTEGER, name VARCHAR, salary DECIMAL(10,2));
D INSERT INTO test VALUES (1, 'foo', 12.13), (2, 'bar', 202.22);
D .quit
```

The following configuration reads that table to the terminal:

<<<@/public/assets/jobs/duckdbreader.json

Save the above configuration file as `job/duckdb2stream.json`

### Execute Collection Command

Execute the following command for data collection

```bash
bin/addax.sh job/duckdb2stream.json
```

## Parameters

This plugin is based on [RDBMS Reader](rdbmsreader), so you can refer to all parameters of RDBMS Reader. A DuckDB connection needs no credentials, so the `username` and `password` every other reader requires are not needed here.

Besides `table` you can read with an arbitrary statement through `querySql`, for example to read a file directly:

```
"querySql": [
  "SELECT * FROM read_parquet('/data/*.parquet')",
  "SELECT * FROM read_csv_auto('/data/*.csv')"
]
```

DuckDB supports `read_parquet`, `read_csv` and `read_json` as well as the `httpfs` and S3 extensions, so `querySql` reaches those files without a dedicated reader plugin.

## Connection Configuration

DuckDB connection options are appended to the `jdbcUrl` separated by `;` (not by `?` and `&`):

```
jdbc:duckdb:/data/test.duckdb;threads=4;memory_limit=4GB;temp_directory=/tmp
```

The options you are most likely to need:

| Option                | Description                                                         |
| --------------------- | ------------------------------------------------------------------- |
| `threads`             | number of parallel threads, defaults to the CPU count               |
| `memory_limit`        | memory ceiling, for example `4GB`                                   |
| `temp_directory`      | spill directory for the data that exceeds `memory_limit`            |
| `access_mode`         | `READ_ONLY` / `READ_WRITE` / `AUTOMATIC`                            |
| `jdbc_stream_results` | stream the result set; the plugin enables it by default (see below) |

### Connections to the same file must share one configuration

The driver caches database instances by the absolute path of the file (the instance cache is on by default), so connections to the same file inside one JVM reuse a single instance. The database level configuration is decided by the **first** connection that creates the instance, and a later connection asking for a different one fails outright:

```
Can't open a connection to same database file with a different configuration than existing connections
```

So when the reader and the writer of a job point at the same file, both `jdbcUrl` values must carry exactly the same options. The plugin already appends the same `jdbc_stream_results=true` on both sides; anything you add yourself has to match as well.

### About channel

Set `channel: 1` explicitly. DuckDB has no `splitPk` sharding, so a `channel` above 1 only runs the same query several times; the parallelism of the query itself comes from the `threads` option, not from more connections.

### About the precision of BIGINT UNSIGNED, HUGEINT and DECIMAL

`HUGEINT`/`UHUGEINT` are 128 bit integers and `DECIMAL` carries up to 38 significant digits, values a double cannot hold without losing precision. This plugin reads them as **strings**, which transfers them losslessly; the writer parses them back into a numeric type when the target column calls for one.

### About the text rendering of TIME

Writing a `TIME` column to a text sink can show a value that differs from the stored one by several hours. The text conversion uses the configurable `common.column.timeZone` of `ColumnCast` (default `GMT+8`) rather than the JVM timezone the read used, and every other RDBMS reader behaves the same way. To see the stored value in the text output, align the timezone of the job with that setting.

## Data Type Mapping

| DuckDB Type                         | Addax Type    | Notes                                                     |
| ----------------------------------- | ------------- | --------------------------------------------------------- |
| BOOLEAN                             | Boolean       |                                                           |
| TINYINT / SMALLINT / INTEGER        | Long          |                                                           |
| BIGINT                              | Long          |                                                           |
| UTINYINT / USMALLINT / UINTEGER     | Long          |                                                           |
| UBIGINT                             | Long / String | kept as a string, with full precision, above `Long`       |
| HUGEINT / UHUGEINT                  | String        | 128 bit integers, transferred as text to keep every digit |
| FLOAT / DOUBLE                      | Double        |                                                           |
| DECIMAL                             | String        | transferred as text to keep every digit                   |
| VARCHAR / ENUM                      | String        |                                                           |
| BLOB                                | Bytes         |                                                           |
| DATE                                | Date          |                                                           |
| TIME / TIME_NS                      | Date          |                                                           |
| TIMESTAMP(\_S/\_MS/\_NS)            | Timestamp     |                                                           |
| TIMESTAMP WITH TIME ZONE            | Timestamp     | converted to the instant it stands for                    |
| UUID / JSON / INTERVAL              | String        | the text form the driver returns                          |
| BIT                                 | String        | a bit string of any width, read as `0`/`1` text           |
| LIST / ARRAY / STRUCT / MAP / UNION | String        | converted to JSON text, recursively                       |

`LIST`, `STRUCT` and `MAP` become JSON, for example `[1,2,3]`, `{"a":1,"b":"x"}` and `{"p":1,"q":2}`.
