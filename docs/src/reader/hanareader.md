# HANA Reader

HANA Reader 插件实现了从 SAP HANA 读取数据的能力

## 示例

下面的配置是读取该表到终端的作业:

<<<@/public/assets/jobs/hanareader.json

将上述配置文件保存为 `job/hana2stream.json`

### 执行采集命令

执行以下命令进行数据采集

```bash
bin/addax.sh job/hana2stream.json
```

## 参数说明

该插件基于 [RDBMS Reader](rdbmsreader) 实现，因此可以参考 RDBMS Reader 的所有参数。

### 配置结构

<!--@include: @/src/_partials/reader/rdbms-structure.md#derived-base -->

上图只表示配置层级；各参数的必填、类型和默认值见 [RDBMS Reader](rdbmsreader) 的参数说明。驱动类名写在 `connection.driver` 下。
