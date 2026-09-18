# Doris Writer

Doris Writer plugin writes data into [Apache Doris](https://doris.apache.org) through its native HTTP [Stream Load](https://doris.apache.org/docs/data-operate/import/import-way/stream-load-manual) interface (FE http_port, default 8030). Compared with `insert into` it is considerably faster and is the officially recommended way to load data in production.

Doris is MySQL protocol compatible, so it can be read with [MySQL Reader](../reader/mysqlreader).

## Example

Assume the target table is created as follows:

```sql
CREATE DATABASE example_db;
CREATE TABLE example_db.table1
(
  siteid INT DEFAULT '10',
  citycode SMALLINT,
  username VARCHAR(32) DEFAULT '',
  pv BIGINT SUM DEFAULT '0'
) AGGREGATE KEY(siteid, citycode, username)
DISTRIBUTED BY HASH(siteid) BUCKETS 10
PROPERTIES("replication_num" = "1");
```

The following configuration reads from memory and writes into the Doris table:

<<<@/public/assets/jobs/doriswriter.json

Save the configuration file as `job/stream2doris.json` and run it:

```bash
bin/addax.sh job/stream2doris.json
```

The output looks like:

:::details
<<<@/public/assets/output/doriswriter.txt
:::

## Parameters

| Item                     | Required | Type   | Default | Description                                                                            |
| :----------------------- | :------: | ------ | ------- | -------------------------------------------------------------------------------------- |
| loadUrl                  |   yes    | string | none    | Stream Load connection target                                                          |
| username                 |   yes    | string | none    | User name used to access the Doris database                                            |
| password                 |    no    | string | none    | Password used to access the Doris database                                             |
| flushInterval            |    no    | int    | 3000    | How often buffered data is written to the target table, in milliseconds                |
| flushQueueLength         |    no    | int    | 1       | Length of the queue holding the batches waiting to be uploaded                         |
| table                    |   yes    | List   | none    | The tables to be synchronized                                                          |
| column                   |   yes    | list   | none    | Columns to synchronize, see [RBDMS Writer][1] for details                              |
| batchSize                |    no    | int    | 2048    | Max rows of one batch; the batch is written as soon as this many rows are buffered     |
| connectTimeout           |    no    | int    | 5000    | Connection timeout in milliseconds                                                     |
| socketTimeout            |    no    | int    | 600000  | Response timeout in milliseconds; must cover the time a full sized batch takes to load |
| connectionRequestTimeout |    no    | int    | 5000    | Timeout for leasing a connection from the pool, in milliseconds                        |
| hostCooldownMs           |    no    | int    | 30000   | How long a `loadUrl` is skipped after a failed load, in milliseconds                   |
| loadProps                |    no    | map    | `csv`   | Stream Load request parameters, see the [StreamLoad page][2]                           |
| preSql                   |    no    | list   |         | SQL statements to execute before writing data into the target table                    |
| postSql                  |    no    | list   |         | SQL statements to execute after all data has been written                              |

[1]: ./rdbmswriter
[2]: https://github.com/apache/doris-streamloader/tree/master

## loadUrl

The Stream Load connection target, in the form `ip:port`, where the IP is a FE node and the port is its http_port. Entries prefixed with `http://` or `https://` are accepted as well.

Multiple entries may be configured. The plugin then picks FE nodes in round-robin order; a node that failed a load is skipped for `hostCooldownMs` (30 seconds by default) so that later batches do not keep hitting a broken node. When every node is cooling down the plugin still issues the request against the round-robin candidate and lets the batch level retry move to another node, instead of failing right away.

## column

Setting it to `["*"]` makes the plugin read the column list from the Doris table and assemble the records accordingly.

## loadProps

Stream Load request parameters, see [Stream load - Apache Doris](https://doris.apache.org/docs/data-operate/import/import-way/stream-load-manual) for the full list. This is also where the import format (`format`) is selected: `csv` is the default, `json` is supported as well.

## Type Conversion

All values are converted to strings by default and joined with `\t` as the column separator and `\n` as the line delimiter, producing the CSV file uploaded by Stream Load.

To change the delimiters, configure `loadProps`:

```json
{
  "loadProps": {
    "column_separator": "\\x01",
    "line_delimiter": "\\x02"
  }
}
```

To import JSON instead, configure `loadProps`:

```json
{
  "loadProps": {
    "format": "json",
    "strip_outer_array": true
  }
}
```

Note: in CSV mode the plugin does not escape the field content, so a field containing the column separator (`\t` by default) or a newline breaks the row. Use `format: json` for such data, or replace the special characters upstream.

## Performance tuning

Every Stream Load request creates one import transaction in Doris, so small batches produce a large number of small transactions, which adds version and compaction pressure. `batchSize` defaults to 2048 rows (the same default as the other writers in this project); raise it for jobs that write a lot of data.

Recommendations:

- Raising `batchSize` (50000 to 200000 rows for example) cuts the number of import transactions substantially. Keep in mind that it counts **rows**: for wide tables with large rows, work out what that means in bytes so a single batch does not take up too much memory.
- `flushInterval` is the longest time a record waits to be batched. Lower it when the write rate is low and latency matters; when the write rate is high the row limit triggers first, so raise `batchSize` instead to get bigger batches.
- `flushQueueLength` is the number of batches waiting to be uploaded and therefore also bounds the memory usage (roughly (queue length + 1) × bytes per batch). Keep the default of 1 when memory is tight.
- Every task reuses one HTTP connection pool, connections are no longer re-established per batch. On a low latency network `connectTimeout` can be lowered, while `socketTimeout` has to cover the load time of the largest batch or a big batch will be reported as timed out.
- While a job runs, the `rows[]` and `bytes[]` values in the log show the actual batch sizes.
- Note that measured end to end, the batch size only shifts the wall clock time as far as the Doris cluster and the network allow; on a slow load path the difference is small. The main benefit of a larger `batchSize` is fewer transactions and less compaction pressure.
