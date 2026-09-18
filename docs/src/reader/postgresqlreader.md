# PostgreSQL Reader

PostgreSQL Reader 插件用于从 [PostgreSQL](https://postgresql.org) 读取数据

## 示例

假定建表语句以及输入插入语句如下：

<<<@/public/assets/sql/postgresql.sql

配置一个从PostgreSQL数据库同步抽取数据到本地的作业:

<<<@/public/assets/jobs/pgreader.json

将上述配置文件保存为 `job/postgres2stream.json`

### 执行采集命令

执行以下命令进行数据采集

```bash
bin/addax.sh job/postgres2stream.json
```

## 参数说明

该插件基于 [RDBMS Reader](rdbmsreader) 实现，因此可以参考 RDBMS Reader 的所有配置项。

## 类型转换注意事项

- `bit(1)` 被视为布尔类型
- `bit(n)`（n > 1）被视为二进制类型，内容为位值打包后的字节：每 8 位一个字节，高位在前，例如 `bit(3)` 的 `b'101'` 得到单字节 `0x05`
- `bit varying` 被视为字符串，内容为位串本身，前导零保留
