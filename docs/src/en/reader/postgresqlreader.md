# PostgreSQL Reader

The PostgreSQL Reader plugin is used to read data from [PostgreSQL](https://postgresql.org).

## Example

Assume the table creation statement and the insert statements are as follows:

<<<@/public/assets/sql/postgresql.sql

Configure a job to synchronously extract data from a PostgreSQL database to a local destination:

<<<@/public/assets/jobs/pgreader.json

Save the above configuration file as `job/postgres2stream.json`

### Execute Collection Command

Run the following command to collect data:

```bash
bin/addax.sh job/postgres2stream.json
```

## Parameters

This plugin is based on the [RDBMS Reader](rdbmsreader), so all configuration items of the RDBMS Reader apply.

### Configuration Structure

<!--@include: @/src/_partials/reader/rdbms-structure.md#base -->

The tree above only shows the configuration hierarchy; see the [RDBMS Reader](rdbmsreader) parameter documentation for the required status, type and default value of each parameter. The driver class name goes under `connection.driver`; the top-level `driver` is a deprecated legacy form that is still compatible but logs a deprecation warning.

## Data Type Mapping Notes

- `bit(1)` is treated as a boolean type
- `bit(n)` (n > 1) is treated as a binary type; the content is the bytes packed from the bit values: one byte for every 8 bits, most significant bit first. For example, `b'101'` of `bit(3)` yields the single byte `0x05`
- `bit varying` is treated as a string; the content is the bit string itself, with leading zeros preserved
