# HBase20 SQL Reader

HBase20 SQL Reader plugin implements reading data from [Phoenix(HBase SQL)](https://phoenix.apache.org), corresponding to HBase2.X and Phoenix5.X versions.

## Configuration Example

Configure a job to synchronize and extract data from Phoenix to local:

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
            "column": ["ID", "NAME"]
          }
        }
      }
    ]
  }
}
```

## Connection

This plugin supports the Phoenix Query Server thin protocol only. The thin client is bundled with the distribution, so no extra Phoenix client jar — in particular the ~144 MB thick `phoenix-client-hbase-2.1` — is required.

## Parameters

This plugin is based on [RDBMS Reader](rdbmsreader), so you can refer to all configuration items of RDBMS Reader.
