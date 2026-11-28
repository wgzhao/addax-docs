# Sybase Reader

SybaseReader 插件实现了从 [Sybase][1] 读取数据

## 示例

我们可以用 Docker 容器来启动一个 Sybase 数据库

```bash
docker run -tid --rm  -h dksybase --name sybase  -p 5000:5000  ifnazar/sybase_15_7 bash /sybase/start
```

下面的配置是读取该表到终端的作业:

<<<@/public/assets/jobs/sybasereader.json

将上述配置文件保存为 `job/sybase2stream.json`

### 执行采集命令

执行以下命令进行数据采集

```bash
bin/addax.sh job/sybase2stream.json
```

## 参数说明

该插件基于 [RDBMS Reader](rdbmsreader) 实现，因此可以参考 RDBMS Reader 的所有配置项。

### 配置结构

<!--@include: @/src/_partials/reader/rdbms-structure.md#base -->

上图只表示配置层级；各参数的必填、类型和默认值见 [RDBMS Reader](rdbmsreader) 的参数说明。驱动类名写在 `connection.driver` 下；顶层 `driver` 是已弃用的旧写法，仍兼容但会打印弃用警告。

[1]: https://en.wikipedia.org/wiki/Sybase
