# Greenplum Writer

The Greenplum Writer plugin uses the `COPY FROM` syntax to write data to a [Greenplum](https://greenplum.org) database.

## Configuration Example

The following configuration demonstrates reading data from a specified table in Greenplum and inserting it into another table with the same table structure, in order to test the data types supported by this plugin.

<<<@/public/assets/sql/gp.sql

The statement to create the table to be inserted is as follows:

```sql
create table gp_test like addax_tbl;
```

### Task Configuration

The following is the configuration file

<<<@/public/assets/jobs/gpwriter.json

Save the above configuration file as `job/pg2gp.json`

### Execute Collection Command

Execute the following command for data collection

```bash
bin/addax.sh job/pg2gp.json
```

## Parameters

### Configuration Structure

<!--@include: @/src/_partials/writer/rdbms-structure.md#base -->

The tree shows the hierarchy only; see the [RDBMS Writer](rdbmswriter) parameter documentation for required flags, types and default values of each parameter. The driver class name goes under `connection.driver`; the top-level `driver` is a deprecated legacy form that still works but prints a deprecation warning.
