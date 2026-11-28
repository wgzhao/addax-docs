# SQLServer Reader

SqlServerReader 插件用于从从 SQLServer 读取数据。

## 配置样例

配置一个从 SQLServer 数据库同步抽取数据到本地的作业:

<<<@/public/assets/jobs/sqlserverreader.json

## 参数说明

该插件基于 [RDBMS Reader](rdbmsreader) 实现，因此可以参考 RDBMS Reader 的所有配置项。

### 配置结构

<!--@include: @/src/_partials/reader/rdbms-structure.md#base -->

上图只表示配置层级；各参数的必填、类型和默认值见 [RDBMS Reader](rdbmsreader) 的参数说明。驱动类名写在 `connection.driver` 下；顶层 `driver` 是已弃用的旧写法，仍兼容但会打印弃用警告。
