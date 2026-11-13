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

To use an `s3a://` warehouse, copy these jars into `plugin/writer/icebergwriter/libs/` (or into `shared/` when the distribution ran `shrink_package.sh`, with a symlink of the same name from the plugin's `libs/`):

| File | Role |
| --- | --- |
| `hadoop-aws-3.3.6.jar` | the `S3AFileSystem` implementation |
| `aws-java-sdk-s3-1.12.367.jar` | S3 client |
| `aws-java-sdk-sts-1.12.367.jar` | temporary credentials |
| `aws-java-sdk-core-1.12.367.jar` | AWS SDK v1 core |
| `aws-java-sdk-kms-1.12.367.jar` | S3 encryption |
| `jmespath-java-1.12.367.jar` | endpoint resolution |
| `joda-time-2.15.1.jar` | time handling |
| `httpclient-4.5.14.jar` | HTTP client |
| `httpcore-4.4.16.jar` | HTTP core |

```bash
for a in \
  org.apache.hadoop:hadoop-aws:3.3.6 \
  com.amazonaws:aws-java-sdk-s3:1.12.367 \
  com.amazonaws:aws-java-sdk-sts:1.12.367 \
  com.amazonaws:aws-java-sdk-core:1.12.367 \
  com.amazonaws:aws-java-sdk-kms:1.12.367 \
  com.amazonaws:jmespath-java:1.12.367 \
  joda-time:joda-time:2.15.1 \
  org.apache.httpcomponents:httpclient:4.5.14 \
  org.apache.httpcomponents:httpcore:4.4.16; do
  mvn -q dependency:get -Dartifact="$a"
done

cp ~/.m2/repository/org/apache/hadoop/hadoop-aws/3.3.6/hadoop-aws-3.3.6.jar \
   ~/.m2/repository/com/amazonaws/aws-java-sdk-{s3,sts,core,kms}/1.12.367/aws-java-sdk-*-1.12.367.jar \
   ~/.m2/repository/com/amazonaws/jmespath-java/1.12.367/jmespath-java-1.12.367.jar \
   ~/.m2/repository/joda-time/joda-time/2.15.1/joda-time-2.15.1.jar \
   ~/.m2/repository/org/apache/httpcomponents/httpclient/4.5.14/httpclient-4.5.14.jar \
   ~/.m2/repository/org/apache/httpcomponents/httpcore/4.4.16/httpcore-4.4.16.jar \
   plugin/writer/icebergwriter/libs/
```

Do not add `aws-java-sdk-bundle-1.12.367.jar`. Hadoop 3.3.2+ supports the unshaded AWS SDK v1, and the set above is the modules hadoop-aws 3.3.6 actually uses, about 5.5 MB in total. The versions must match the plugin's Hadoop version (currently 3.3.6) and the AWS SDK v1 version that hadoop-aws was built against (currently 1.12.367).

Then configure `fs.s3a.*` through `hadoopConfig`; the MinIO example on the Chinese page shows the full job.

Without `hadoop-aws-3.3.6.jar`, an `s3a://` job fails while loading the table with
`ClassNotFoundException: Class org.apache.hadoop.fs.s3a.S3AFileSystem not found`.

## Type mapping

The Chinese page carries the table that maps the Addax column types to the Iceberg types. For the Iceberg types that table does not list:

- `TIME` takes the time of day of a date or time column, `UUID` is parsed from a string, and `FIXED` is written from a bytes column.
- The element type of an `ARRAY`, and the key and value types of a `MAP`, are the ones the table declares, and the source text is parsed into them: `'1,2,3'` into an `array<int>`, `'{"a":"1"}'` into a `map<string,bigint>`.
- `struct`, `variant`, and a struct nested under an `array` or a `map`, are not written: a job that maps such a column fails at the first record instead of writing nulls.
- A row whose value does not fit the column it maps to is skipped and counted as dirty, rather than written with a null.
