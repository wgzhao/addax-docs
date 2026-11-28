# Cassandra Reader

The `CassandraReader` plugin implements the ability to read data from [Cassandra](https://cassandra.apache.org).

## Configuration Example

Below is an example configuration for reading data from Cassandra to the terminal:

<<<@/public/assets/jobs/cassandrareader.json

## Parameters

| Configuration    | Required | Data Type | Default Value | Description                                                                                                                                                                                             |
| :--------------- | :------: | --------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| host             |   Yes    | list      | None          | Connection domain name or IP; separate multiple nodes with commas                                                                                                                                       |
| port             |   Yes    | int       | 9042          | Port                                                                                                                                                                                                    |
| username         |    No    | string    | None          | Username                                                                                                                                                                                                |
| password         |    No    | string    | None          | Password                                                                                                                                                                                                |
| useSSL           |    No    | boolean   | false         | Whether to use an SSL connection                                                                                                                                                                        |
| keyspace         |   Yes    | string    | None          | Keyspace where the table to be synchronized is located                                                                                                                                                  |
| table            |   Yes    | string    | None          | Selected table to be synchronized                                                                                                                                                                       |
| column           |   Yes    | list      | None          | Collection of columns to be synchronized in the configured table; each element may specify the column name or `writetime(column_name)`, the latter form reads the timestamp of the `column_name` column instead of the data |
| where            |    No    | string    | None          | `cql` expression for the data filtering condition                                                                                                                                                       |
| allowFiltering   |    No    | boolean   | None          | Whether to filter data on the server side, see the [related description][1] in the official documentation for details                                                                                   |
| consistencyLevel |    No    | string    | LOCAL_QUORUM  | Data consistency level, options: `ONE, QUORUM, LOCAL_QUORUM, EACH_QUORUM, ALL, ANY, TWO, THREE, LOCAL_ONE`                                                                                              |

[1]: https://cassandra.apache.org/doc/latest/cql/dml.html#allowing-filtering

### Supported Data Types

Currently all types except `counter` and `Custom` are supported.

The type conversion list is as follows:

| Addax internal type | Cassandra data type                                                    |
| ------------------- | ---------------------------------------------------------------------- |
| Long                | int, tinyint, smallint,varint,bigint,time,counter                      |
| Double              | float, double, decimal                                                 |
| String              | ascii,varchar, text,uuid,timeuuid,duration,list,map,set,tuple,udt,inet |
| Date                | date, timestamp                                                        |
| Boolean             | bool                                                                   |
| Bytes               | blob                                                                   |
