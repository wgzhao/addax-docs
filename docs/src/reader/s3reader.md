# S3 Reader

S3 Reader 插件用于读取 Amazon AWS S3 存储上的数据。在实现上，本插件基于 S3 官方的 [SDK 2.0](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/home.html) 编写。

同时本插件也支持读取兼容 S3 协议的存储服务，比如 [MinIO](https://min.io/)

## 配置样例

以下样例配置用于从 S3 存储上读取两个文件，并打印出来

<<<@/public/assets/jobs/s3reader.json

## 参数说明

| 配置项                 | 是否必须 | 数据类型 | 默认值 | 描述                                                                             |
| :--------------------- | :------: | -------- | ------ | -------------------------------------------------------------------------------- |
| endpoint               |    否    | string   | 无     | S3 Server的 EndPoint地址，例如 `s3.xx.amazonaws.com`；不填则按 `region` 自动推导 |
| region                 |    是    | string   | 无     | S3 Server的 Region 地址，例如 `ap-southeast-1`                                   |
| accessId               |    是    | string   | 无     | 访问 ID                                                                          |
| accessKey              |    是    | string   | 无     | 访问 Key                                                                         |
| bucket                 |    是    | string   | 无     | 要读取的 bucket                                                                  |
| object                 |    是    | list     | 无     | 要读取的 object，可以填写多个以及通配符方式，详见下面说明                        |
| column                 |    是    | list     | 无     | 读取的 object 的列信息，填写方式见[RDBMS Reader][1] 中 `column` 描述             |
| fieldDelimiter         |    否    | string   | `,`    | 读取的字段分隔符，仅支持单字符                                                   |
| compress               |    否    | string   | 无     | 文件压缩格式，不填则按文件内容自动识别                                           |
| fileFormat             |    否    | string   | 无     | 文件格式，仅支持 `csv` 和 `text`，填其他值会直接报错                             |
| encoding               |    否    | string   | `utf8` | 文件编码格式                                                                     |
| pathStyleAccessEnabled |    否    | boolean  | false  | 是否启用路径访问模式                                                             |

[1]: rdbmsreader

### endpoint

可选。S3 兼容服务（MinIO、Ceph 等）必须填写；使用 AWS 官方服务时可以留空，客户端会按
`region` 推导出访问地址。

### object

当指定单个 object，插件暂时只能使用单线程进行数据抽取。

当指定多个 object 时，插件按通道数把它们分成若干组并行读取，每组共用一个客户端连接。

通配符中只有 `*`（任意多个字符）和 `?`（一个字符）是通配符，其余字符都是 object 名字里的
普通字符，包括 `.`：

- `data/*.csv` 只会匹配 `data/a.csv`，不会匹配 `data/foo1csv`
- `data+old/*.csv` 中的 `+` 是字面量，不会当成正则的重复符号

匹配到的 object 会去重并排序，同一个 object 被多个条目覆盖时只会读取一次。

如果 `object` 指定的名字在 bucket 里不存在（通配符没有匹配到任何对象，或者写错了名字），
作业会直接报错退出，而不是产出空结果。

### compress

不配置时，插件按文件开头的魔数识别压缩格式（gzip、bzip2、xz、zstd 等，`.zip`/`.lzo` 按后缀
识别），自动解压；配置了就按配置的来。显式配置为 `none` 表示按原样读取、不做任何解压。

### pathStyleAccessEnabled

是否启用路径访问模式,如果启用，则访问 bucket 的路径为 `example.com/bucket-name`,否则为 `bucket-name.example.com` ，详细情况可以参观
[path vs virtual access](https://min.io/docs/minio/linux/administration/object-management.html#minio-object-management-path-virtual-access)

## 类型转换

读取到的是文本内容，每个字段的类型由 `column` 里配置的 `type` 决定，填写方式见
[RDBMS Reader][1] 中 `column` 的描述；`column` 填 `["*"]` 时所有字段按字符串读取。

## 限制说明

1. 仅支持读取文本文件（csv / text）
2. 只支持静态 AccessKey / AccessKeyId，不支持 IAM Role、环境变量、profile 或临时凭证
3. 不支持加密（口令保护）的 object
