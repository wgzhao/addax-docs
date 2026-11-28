# Excel Writer

Excel Writer implements the ability to write data to Excel files.

## Configuration Example

We assume reading data from memory and writing it to an Excel file:

<<<@/public/assets/jobs/excelwriter.json

Save the above content as `job/stream2excel.json`

Execute the following command:

```bash
bin/addax.sh job/stream2excel.sh
```

You should get output similar to the following:

:::details
<<<@/public/assets/output/excelwriter.txt
:::

## Parameters

| Configuration | Required | Type   | Default Value | Description                                                                      |
| :------------ | :------- | :----- | :------------ | :------------------------------------------------------------------------------- |
| path          | Yes      | string | None          | Directory where the file is saved; created if the specified directory is missing |
| fileName      | Yes      | string | None          | Name of the Excel file to generate, described below                              |
| header        | No       | list   | None          | Excel header                                                                     |

### fileName

If the configured `fileName` has no extension, `.xlsx` is appended automatically;
if the extension is `.xls`, an error is raised, because only the Excel 97 and later file format, i.e. files with the `.xlsx` extension, is generated at present.

### header

If `header` is not specified, the generated Excel file has no header, only data.
Note that the plugin does not care whether the number of header columns matches the number of columns in the data, that is, the number of header columns is not required to equal the number of columns in the following data.

## Limitations

1. Only one Excel file is generated at present, and whether the number of rows and columns exceeds Excel's limits is not considered
2. If a file with the same name exists in the specified directory, it is overwritten at present; the handling of the target directory will be unified later
3. For date-formatted data, the cell style is set to `yyyy-MM-dd HH:mm:ss` and cannot be customized
4. Writing binary data is not supported
