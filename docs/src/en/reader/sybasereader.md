# Sybase Reader

SybaseReader plugin implements reading data from [Sybase][1].

## Example

We can use Docker container to start a Sybase database

```bash
docker run -tid --rm  -h dksybase --name sybase \
   -p 5000:5000  ifnazar/sybase_15_7 bash /sybase/start
```

The following configuration reads this table to terminal:

<<<@/public/assets/jobs/sybasereader.json

Save the above configuration file as `job/sybase2stream.json`

### Execute Collection Command

Execute the following command for data collection

```bash
bin/addax.sh job/sybase2stream.json
```

## Parameters

This plugin is based on [RDBMS Reader](rdbmsreader), so you can refer to all configuration items of RDBMS Reader.

### Configuration Structure

<!--@include: @/src/_partials/reader/rdbms-structure.md#base -->

The tree shows the hierarchy only; see the [RDBMS Reader](rdbmsreader) parameter table for required flags, types and default values. The driver class name goes under `connection.driver`; the top-level `driver` is a deprecated legacy form that still works but logs a warning.

[1]: https://en.wikipedia.org/wiki/Sybase
