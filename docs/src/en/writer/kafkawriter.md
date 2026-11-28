# Kafka Writer

The Kafka Writer plugin writes data to Kafka in JSON format.

## Configuration Example

The following configuration demonstrates how to read data from memory and write it to a specified topic in Kafka.

### Create the task file

First, create a task file `stream2kafka.json` with the following content:

<<<@/public/assets/jobs/stream2kafka.json

### Run

Execute the `bin/addax.sh stream2kafka.json` command to obtain output similar to the following:

<<<@/public/assets/output/stream2kafka.txt

We use Kafka's bundled `kafka-console-consumer.sh` to read the data, and the output is as follows:

```bash
$ bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test-1 --from-beginning

{"col8":"41.12,-71.34","col9":"2017-05-25 11:22:33","col6":"hello world","col7":"long text","col4":19890604,"col5":19890604,"col2":"1.1.1.1","col3":1.9890604E7,"col1":916}
{"col8":"41.12,-71.34","col9":"2017-05-25 11:22:33","col6":"hello world","col7":"long text","col4":19890604,"col5":19890604,"col2":"1.1.1.1","col3":1.9890604E7,"col1":572}
{"col8":"41.12,-71.34","col9":"2017-05-25 11:22:33","col6":"hello world","col7":"long text","col4":19890604,"col5":19890604,"col2":"1.1.1.1","col3":1.9890604E7,"col1":88}
{"col8":"41.12,-71.34","col9":"2017-05-25 11:22:33","col6":"hello world","col7":"long text","col4":19890604,"col5":19890604,"col2":"1.1.1.1","col3":1.9890604E7,"col1":33}
{"col8":"41.12,-71.34","col9":"2017-05-25 11:22:33","col6":"hello world","col7":"long text","col4":19890604,"col5":19890604,"col2":"1.1.1.1","col3":1.9890604E7,"col1":697}
{"col8":"41.12,-71.34","col9":"2017-05-25 11:22:33","col6":"hello world","col7":"long text","col4":19890604,"col5":19890604,"col2":"1.1.1.1","col3":1.9890604E7,"col1":381}
{"col8":"41.12,-71.34","col9":"2017-05-25 11:22:33","col6":"hello world","col7":"long text","col4":19890604,"col5":19890604,"col2":"1.1.1.1","col3":1.9890604E7,"col1":304}
{"col8":"41.12,-71.34","col9":"2017-05-25 11:22:33","col6":"hello world","col7":"long text","col4":19890604,"col5":19890604,"col2":"1.1.1.1","col3":1.9890604E7,"col1":103}
{"col8":"41.12,-71.34","col9":"2017-05-25 11:22:33","col6":"hello world","col7":"long text","col4":19890604,"col5":19890604,"col2":"1.1.1.1","col3":1.9890604E7,"col1":967}
{"col8":"41.12,-71.34","col9":"2017-05-25 11:22:33","col6":"hello world","col7":"long text","col4":19890604,"col5":19890604,"col2":"1.1.1.1","col3":1.9890604E7,"col1":147}
```

## Parameters

| Configuration | Required | Data Type | Default Value | Description                                                                                       |
| :------------ | :------: | --------- | ------------- | ------------------------------------------------------------------------------------------------- |
| brokerList    |   Yes    | string    | None          | Broker configuration for connecting to the Kafka service; separate multiple brokers with a comma (`,`) |
| topic         |   Yes    | string    | None          | The topic to write to                                                                             |
| batchSize     |    No    | int       | 1204          | Sets the Kafka `batch.size` parameter                                                             |
| column        |   Yes    | list      | None          | The set of column names in the configured table that need to be synchronized; `*` is not allowed   |
| properties    |    No    | map       | None          | Other Kafka connection parameters to set                                                          |

## Limitations

1. Only Kafka `1.0` and above are supported; whether versions below that can be written to cannot be determined
2. Kafka services with `kerberos` authentication enabled are currently not supported
