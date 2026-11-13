# Paimon Writer

The Paimon Writer plugin writes data into an existing [Apache Paimon](https://paimon.apache.org) table.

## Configuration Example

<<<@/public/assets/jobs/paimonwriter.json

## Parameters

| Configuration   | Required | Type   | Default Value | Description                                                                      |
| :-------------- | :------: | ------ | ------------- | -------------------------------------------------------------------------------- |
| dbName          |   Yes    | string | None          | Name of the Paimon database to write to                                          |
| tableName       |   Yes    | string | None          | Name of the Paimon table to write to                                             |
| writeMode       |   Yes    | string | None          | How the table is prepared before writing, see below                              |
| column          |    No    | array  | None          | Maps the reader columns to table columns by name, see below                      |
| writeBufferSize |    No    | string | 64 mb         | How much a single task may buffer before it writes a data file, see below        |
| paimonConfig    |   Yes    | json   | {}            | Catalog and Hadoop settings, for example HA or kerberos configuration, see below |

### writeMode

- `append` / `insert` writes into the table without touching the data that is already there.
- `truncate` empties the table first and then writes.

Any other value is refused instead of being treated as `append`.

### column

By default the reader columns are mapped to the table columns by position. When the reader emits
them in a different order, `column` names the table columns in the order the reader produces them:

```json
{
  "name": "paimonwriter",
  "parameter": {
    "dbName": "test",
    "tableName": "test2",
    "writeMode": "truncate",
    "column": ["name", "id"]
  }
}
```

The list has to hold exactly one name per reader column, in the order the reader produces them; a
name that the table does not have is refused, and table columns that `column` does not mention are
written as NULL.

### writeBufferSize

How much data one task buffers before it writes a data file; it is passed to Paimon as the table
option `write-buffer-size`. A task keeps a single writer, so the heap a job spends on those buffers
is about `number of channels × writeBufferSize`; the default is chosen for the 1 GB heap the
launcher gives a job by default.

The job parameter wins over the table option, which wins over the `64 mb` default.

### paimonConfig

`paimonConfig` holds catalog and Hadoop settings. Local file system:

```json
{
  "paimonConfig": {
    "warehouse": "file:///tmp/paimon",
    "metastore": "filesystem"
  }
}
```

S3 or MinIO:

```json
{
  "paimonConfig": {
    "warehouse": "s3a://my-bucket/paimon",
    "metastore": "filesystem",
    "fs.s3a.endpoint": "http://localhost:9000",
    "fs.s3a.access.key": "access-key",
    "fs.s3a.secret.key": "secret-key",
    "fs.s3a.path.style.access": "true",
    "fs.s3a.impl": "org.apache.hadoop.fs.s3a.S3AFileSystem"
  }
}
```

HDFS with kerberos, where `hadoop.security.authentication` set to `kerberos` turns the login on.
Both `hadoop.kerberos.principal` and `hadoop.kerberos.keytab` are then required:

```json
{
  "paimonConfig": {
    "warehouse": "hdfs://nameservice1/user/hive/paimon",
    "metastore": "filesystem",
    "fs.defaultFS": "hdfs://nameservice1",
    "hadoop.security.authentication": "kerberos",
    "hadoop.kerberos.principal": "hive/_HOST@EXAMPLE.COM",
    "hadoop.kerberos.keytab": "/tmp/hive.keytab",
    "dfs.nameservices": "nameservice1",
    "dfs.ha.namenodes.nameservice1": "namenode265,namenode371",
    "dfs.namenode.rpc-address.nameservice1.namenode265": "namenode265:8020",
    "dfs.namenode.rpc-address.nameservice1.namenode371": "namenode371:8020",
    "dfs.client.failover.proxy.provider.nameservice1": "org.apache.hadoop.hdfs.server.namenode.ha.ConfiguredFailoverProxyProvider"
  }
}
```

## Table requirements

- The table must already exist; the plugin only writes into it.
- **Buckets**: a primary key table has to use a fixed bucket number (`'bucket' = 'N'`). Since
  Paimon 1.2 the default of a primary key table is dynamic bucket mode (`'bucket' = '-1'`), where
  the bucket of a key is owned by Paimon's own assigner. An offline batch writer takes no part in
  that, so the plugin refuses such a table instead of writing a batch of duplicate primary keys.
  For a bulk import, postpone bucket mode (`'bucket' = '-2'`) is the alternative; its rows land in
  `bucket-postpone` and become visible once Paimon compacts them into regular buckets.

## Type conversion

| Addax type           | Paimon type                  |
| -------------------- | ---------------------------- |
| Integer              | TINYINT,SMALLINT,INT,INTEGER |
| Long                 | BIGINT                       |
| Double               | FLOAT,DOUBLE,DECIMAL         |
| String               | STRING,VARCHAR,CHAR          |
| Boolean              | BOOLEAN                      |
| Date                 | DATE,TIMESTAMP               |
| Bytes                | BINARY                       |
| String (comma split) | ARRAY                        |
| String (JSON object) | MAP                          |

Complex types (ARRAY and MAP) arrive as text: an ARRAY is a comma separated list such as `1,2,3`,
where the surrounding blanks of an element are dropped and an element may not contain a comma; a
MAP is a JSON object such as `{"a": 1}`. Elements, keys and values are converted to the types the
table declares.

## Dirty records

When a column cannot be converted, for example a malformed timestamp, the whole record is reported
as dirty and skipped: the plugin never sends a half filled row to the table. The `errorLimit` of the
job therefore covers these cases on its own.
