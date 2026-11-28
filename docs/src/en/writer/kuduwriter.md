# Kudu Writer

The Kudu Writer plugin provides the ability to write data to [kudu](https://kudu.apache.org). It is currently implemented by calling the native RPC interface.
In the future, we hope to implement it through the [impala](https://impala.apache.org) interface, so as to add more features.

## Configuration Example

The following example demonstrates how to read sample data from memory and write it into a kudu table.

### Table Structure

We use the [trino](https://trino.io) tool to connect to the kudu service, and then create the table with the following SQL statement.

```sql
CREATE TABLE kudu.default.users (
  user_id int WITH (primary_key = true),
  user_name varchar,
  salary double
) WITH (
  partition_by_hash_columns = ARRAY['user_id'],
  partition_by_hash_buckets = 2
);
```

### Job Configuration File

Create the `job/stream2kudu.json` file with the following content:

<<<@/public/assets/jobs/kuduwriter.json

### Run

Execute the following command to collect data.

```bash
bin/addax.sh job/stream2kudu.json
```

## Parameters

| Configuration          | Required | Data Type | Default Value | Description                                                                                              |
| :--------------------- | :------: | --------- | ------------- | -------------------------------------------------------------------------------------------------------- |
| masterAddress          |   Yes    | string    | None          | Kudu Master cluster RPC address, multiple addresses are separated by comma (,)                           |
| table                  |   Yes    | string    | None          | Kudu table name                                                                                          |
| writeMode              |    No    | string    | upsert        | Table data write mode, supports both upsert and insert                                                   |
| timeout                |    No    | int       | 100           | Write data timeout (seconds), 0 means unlimited                                                          |
| column                 |   Yes    | list      | None          | Table fields to write, see the example above for how to configure                                        |
| skipFail               |    No    | boolean   | false         | Whether to skip records that fail to insert; if set to true, the plugin will not treat failed inserts as exceptions |
| haveKerberos           |    No    | boolean   | false         | Whether to enable Kerberos authentication; if enabled, the following two items must also be configured   |
| kerberosKeytabFilePath |    No    | string    | None          | Credential file path for Kerberos authentication, e.g. `/your/path/addax.service.keytab`                 |
| kerberosPrincipal      |    No    | string    | None          | Credential principal for Kerberos authentication, e.g. `addax/node1@WGZHAO.COM`                          |

## column

`column` can directly specify the columns to write, as in the example above, or it can be set to `["*"]` to write all columns.
