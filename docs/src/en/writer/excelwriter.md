# Excel Writer

Excel Writer implements the functionality of writing data to Excel files.

## Configuration Example

We assume reading data from memory and writing to Excel file:

<<<@/public/assets/jobs/excelwriter.json
Save the above content as `job/stream2excel.json`

Execute the following command:

```bash
bin/addax.sh job/stream2excel.sh
```

You should get output similar to the following:

:::details
<<<@/public/assets/output/excelwriter.txt

## Parameters

| Configuration | Required | Type   | Default Value | Description                                                            |
| :------------ | -------- | ------ | ------------- | ---------------------------------------------------------------------- |
| path          | Yes      | string | None          | Specify the directory to save files, create if directory doesn't exist |
| fileName      | Yes      | string | None          | Excel filename to generate, detailed description below                 |
| header        | No       | list   | None          | Excel header                                                           |

### fileName

For detailed fileName configuration, please refer to the original Excel Writer documentation.
