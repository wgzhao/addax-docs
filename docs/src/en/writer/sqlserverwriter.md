# SQLServer Writer

SQLServer Writer plugin implements the functionality of writing data to [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) database tables.

## Configuration Example

Here we use data generated from memory to import into SQL Server.

<<<@/public/assets/jobs/sqlserverwriter.json

## Parameters

This plugin is based on [RDBMS Writer](rdbmswriter), so you can refer to all configuration items of RDBMS Writer.

### Configuration Structure

<!--@include: @/src/_partials/writer/rdbms-structure.md#base -->

The tree shows the hierarchy only; see the [RDBMS Writer](rdbmswriter) parameter table for required flags, types and default values of the common parameters. The driver class name goes under `connection.driver`; the top-level `driver` is a deprecated legacy form that still works but logs a warning.

`writeMode` is not part of the common structure; it is an additional parameter supported by this plugin.

### writeMode

By default, `insert into` syntax is used to write to SQL Server tables. If you want to use the mode of updating when primary key exists and inserting when it doesn't exist, which is SQL Server's `MERGE INTO` syntax, you can use `update` mode. Assuming the table's primary key is `id`, the `writeMode` configuration method is as follows:

```json
{
  "writeMode": "update(id)"
}
```

If it's a composite unique index, the configuration method is as follows:

```json
{
  "writeMode": "update(col1, col2)"
}
```
