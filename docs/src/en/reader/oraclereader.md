# Oracle Reader

Oracle Reader plugin is used to read data from Oracle.

## Configuration Example

Configure a job to synchronize and extract data from Oracle database to local:

<<<@/public/assets/jobs/oraclereader.json

## Parameters

This plugin is based on [RDBMS Reader](rdbmsreader), so you can refer to all configuration items of RDBMS Reader.

## Support for GEOMETRY Type

Starting from Addax `4.0.13`, experimental support for Oracle GEOMETRY type is provided. This plugin converts this type of data to JSON array strings.

Suppose you have such a table and data:

<<<@/public/assets/sql/oracle_geom.sql

The final output result of reading this table data is similar to the following:

<<<@/public/assets/output/oracle_geom_reader.txt

Note: This data type is currently in experimental support stage. The author's understanding of this data type is not deep, and it has not been comprehensively tested. Please do not use it directly in production environments.

## Support for Binary Types

Oracle `BLOB`, `RAW` and `LONG RAW` columns are represented as `Bytes` (the raw byte array) inside Addax, with no encoding conversion on the way out:

- A binary writer (oraclewriter, mysqlwriter, postgresqlwriter, ...) stores the raw bytes, reproducing them byte for byte; a NULL stays NULL.
- A text writer (txtfilewriter, ftpwriter) writes a base64 string, and a NULL is rendered by `nullFormat`.
- A single record, binary columns included, must fit in the channel `core.transport.channel.byteCapacity` (`conf/core.json` ships 64MB). Past that the task fails and points at the option instead of dropping the record; note that the limit is memory held per queued record.

An Oracle-to-Oracle BLOB transfer has been verified this way: payloads from 5 bytes up to 8.8MB round-tripped byte for byte in both `insert` and `update(id)` (MERGE) write modes.
