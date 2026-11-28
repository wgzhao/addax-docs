# HBase20 SQL Reader

The HBase20 SQL Reader plugin reads data from [Phoenix(HBase SQL)](https://phoenix.apache.org); it corresponds to HBase2.X and Phoenix5.X.

## Configuration Example

Configure a job that extracts data from Phoenix to the local filesystem:

```json
{
  "job": {
    "content": [
      {
        "reader": {
          "name": "hbase20xsqlreader",
          "parameter": {
            "queryServerAddress": "http://127.0.0.1:8765",
            "serialization": "PROTOBUF",
            "table": "TEST",
            "column": ["ID", "NAME"],
            "splitKey": "ID"
          }
        },
        "writer": {
          "name": "streamwriter",
          "parameter": {
            "encoding": "UTF-8",
            "print": true
          }
        }
      }
    ],
    "setting": {
      "speed": {
        "channel": 3,
        "bytes": -1
      }
    }
  }
}
```

## Parameters

| Configuration      | Required | Data Type | Default Value | Description                                                                                                                                                                |
| :----------------- | :------: | --------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| queryServerAddress |   Yes    | string    | None          | Phoenix QueryServer address; the plugin connects through the PQS                                                                                                           |
| serialization      |    No    | string    | PROTOBUF      | Serialization protocol used by the QueryServer                                                                                                                             |
| table              |   Yes    | string    | None          | Name of the table to read                                                                                                                                                  |
| schema             |    No    | string    | None          | Schema the table belongs to                                                                                                                                                |
| column             |    No    | list      | ``            | Set of column names to read from the Phoenix table; an empty value means all columns are read                                                                              |
| splitKey           |   Yes    | string    | None          | Dynamically specifies the split points according to data characteristics, splitting the table data by the minimum and maximum values of the specified column; only integer and string types are supported |
| splitPoints        |    No    | string    | None          | Splits according to the table's splits                                                                                                                                     |
| where              |    No    | string    | None          | Adds a filter condition to the table query; every split carries this filter condition                                                                                      |
| querySql           |    No    | string    | None          | Multiple query statements can be specified, but the type and number of the queried columns must stay the same                                                              |

## Type Conversion

Most Phoenix types are supported at present, but a few individual types are not; please check your types.

| Addax Internal Type | Phoenix Data Type                  |
| ------------------- | ---------------------------------- |
| String              | CHAR, VARCHAR                      |
| Bytes               | BINARY, VARBINARY                  |
| Bool                | BOOLEAN                            |
| Long                | INTEGER, TINYINT, SMALLINT, BIGINT |
| Double              | FLOAT, DECIMAL, DOUBLE,            |
| Date                | DATE, TIME, TIMESTAMP              |

## Limitations

- When splitting the table, only a single column can be used as the split column, and that column must be the table's primary key
- If `splitPoint` is not set, automatic splitting is used by default; in that case the split column may only be an integer or a string type
- Table names, `SCHEMA` names and column names are case-sensitive; keep them consistent with the actual case in the Phoenix table
- Data can only be read through the Phoenix QueryServer, so your Phoenix deployment must have the QueryServer service started to use this plugin
- This plugin only uses the QueryServer thin client, whose driver (`phoenix-queryserver-client`) is bundled with the distribution; no additional Phoenix client or thick driver deployment is required
