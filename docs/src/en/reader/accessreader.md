# Access Reader

AccessReader implements the ability to read data from [Access](https://en.wikipedia.org/wiki/Microsoft_Access) databases, based on [Addax RDBMS Reader](rdbmsreader).

## Example

We download the test file [AccessThemeDemo.zip](http://www.databasedev.co.uk/downloads/AccessThemeDemo.zip), extract it to get the `AccessThemeDemo.mdb` file, which contains a `tbl_Users` table. We will synchronize the data from this table to the terminal.

The following configuration reads the table to the terminal:

<<<@/public/assets/jobs/accessreader.json
Save the above configuration file as `job/access2stream.json`

### Execute Collection Command

Execute the following command for data collection

```bash
bin/addax.sh job/access2stream.json
```

## Parameters

AccessReader is based on [RDBMS Reader](rdbmsreader), so you can refer to all configuration items of RDBMS Reader.

### Configuration Structure

<!--@include: @/src/_partials/reader/rdbms-structure.md#derived-base -->

The tree shows the hierarchy only; see the [RDBMS Reader](rdbmsreader) parameter table for required flags, types and default values. The driver class name goes under `connection.driver`.
