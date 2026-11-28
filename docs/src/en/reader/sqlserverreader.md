# SQLServer Reader

SqlServerReader plugin is used to read data from SQLServer.

## Configuration Example

Configure a job to synchronize and extract data from SQLServer database to local:

<<<@/public/assets/jobs/sqlserverreader.json

## Parameters

This plugin is based on [RDBMS Reader](rdbmsreader), so you can refer to all configuration items of RDBMS Reader.

### Configuration Structure

<!--@include: @/src/_partials/reader/rdbms-structure.md#derived-base -->

The tree shows the hierarchy only; see the [RDBMS Reader](rdbmsreader) parameter table for required flags, types and default values. The driver class name goes under `connection.driver`.
