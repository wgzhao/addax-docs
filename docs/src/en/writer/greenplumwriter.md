# GreenPlum Writer

GreenPlum Writer plugin implements writing data to GreenPlum database.

## Configuration Example

This plugin is used to write data to GreenPlum database. This plugin is based on [RDBMS Writer](rdbmswriter), so you can refer to all configuration items of RDBMS Writer.

<<<@/public/assets/jobs/gpwriter.json

## Parameters

### Configuration Structure

<!--@include: @/src/_partials/writer/rdbms-structure.md#derived-base -->

The tree shows the hierarchy only; see the [RDBMS Writer](rdbmswriter) parameter table for required flags, types and default values. The driver class name goes under `connection.driver`.
