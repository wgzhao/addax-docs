# Redis Writer

Redis Writer provides the ability to restore Redis `dump` commands and write the result to a target Redis. Redis Cluster, proxy, and standalone deployments are supported.

## Configuration Example

<<<@/public/assets/jobs/rediswriter.json

## Parameters

| Configuration | Required | Data Type | Default Value | Description                                                              |
| :------------ | :------: | --------- | ------------- | ------------------------------------------------------------------------ |
| uri           | Yes      | string    | No            | Redis connection                                                         |
| redisCluster  | No       | boolean   | false         | Whether the target is a Redis Cluster; ignored for proxy or standalone   |
| flushDB       | No       | boolean   | false         | Whether to flush the target Redis before migration                       |
| batchSize     | No       | string    | 1000          | Number of records per batch; adjust when keys are too large or too small |
| timeout       | No       | string    | 60000         | Maximum timeout per execution, in milliseconds (ms)                      |
