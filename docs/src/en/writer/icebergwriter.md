# Iceberg Writer

Iceberg Writer plugin implements writing data to Apache Iceberg.

## Configuration Example

This plugin is used to write data to Iceberg tables. For detailed configuration and parameters, please refer to the original Iceberg Writer documentation.

<<<@/public/assets/jobs/icebergwriter.json

The example writes to an `s3a://` warehouse. The distribution does not ship the `hadoop-aws` it needs, so read "Using the s3a protocol (S3 / MinIO)" below before running it. A job generated with `addax.sh gen` defaults to the local filesystem.

## Parameters

This plugin supports writing data to Iceberg with configurable catalog, table, and partition options.

`hadoopConfig` is optional. When it is left out, the plugin uses the hadoop configuration on the classpath, that is the defaults from `core-site.xml` and the like.

## Using the s3a protocol (S3 / MinIO)

The distribution does not ship `hadoop-aws`. Its only job is to provide `S3AFileSystem` for `s3a://`, but it drags in `aws-java-sdk-bundle`, a 297 MB jar holding every AWS SDK v1 service, growing this plugin's `libs` from about 95 MB to about 392 MB for every job, including the ones that write to HDFS or a local path.

To use an `s3a://` warehouse, copy these two jars into `plugin/writer/icebergwriter/libs/` (or into `shared/` when the distribution ran `shrink_package.sh`, with a symlink of the same name from the plugin's `libs/`):

```bash
mvn dependency:get -Dartifact=org.apache.hadoop:hadoop-aws:3.3.6
mvn dependency:get -Dartifact=com.amazonaws:aws-java-sdk-bundle:1.12.367

cp ~/.m2/repository/org/apache/hadoop/hadoop-aws/3.3.6/hadoop-aws-3.3.6.jar \
   plugin/writer/icebergwriter/libs/
cp ~/.m2/repository/com/amazonaws/aws-java-sdk-bundle/1.12.367/aws-java-sdk-bundle-1.12.367.jar \
   plugin/writer/icebergwriter/libs/
```

Both versions must match the plugin's Hadoop version (currently 3.3.6) and the SDK bundle that hadoop-aws declares (currently 1.12.367). Then configure `fs.s3a.*` through `hadoopConfig`; the MinIO example on the Chinese page shows the full job.

Without the jars, an `s3a://` job fails while loading the table with
`ClassNotFoundException: Class org.apache.hadoop.fs.s3a.S3AFileSystem not found`.

## Type mapping

The Chinese page carries the table that maps the Addax column types to the Iceberg types. For the Iceberg types that table does not list:

- `TIME` takes the time of day of a date or time column, `UUID` is parsed from a string, and `FIXED` is written from a bytes column.
- The element type of an `ARRAY`, and the key and value types of a `MAP`, are the ones the table declares, and the source text is parsed into them: `'1,2,3'` into an `array<int>`, `'{"a":"1"}'` into a `map<string,bigint>`.
- `struct`, `variant`, and a struct nested under an `array` or a `map`, are not written: a job that maps such a column fails at the first record instead of writing nulls.
- A row whose value does not fit the column it maps to is skipped and counted as dirty, rather than written with a null.
