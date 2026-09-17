# MySQL Writer

MySQL Writer 插件实现了写入数据到 [MySQL](https://mysql.com) 目的表的功能。

## 示例

假定要写入的 MySQL 表建表语句如下：

create table test.addax_tbl
(
col1 varchar(20) ,
col2 int(4),
col3 datetime,
col4 boolean,
col5 binary
) default charset utf8;

这里使用一份从内存产生到 MySQL 导入的数据。

<<<@/public/assets/jobs/mysqlwriter.json
将上述配置文件保存为 `job/stream2mysql.json`

### 执行采集命令

执行以下命令进行数据采集

```bash
bin/addax.sh job/stream2mysql.json
```

## 参数说明

该插件基于 [RDBMS Writer](rdbmswriter) 实现，因此可以参考 RDBMS Writer 的所有配置项，并且增加了一些 MySQL 特有的配置项。

| 配置项    | 是否必须 | 类型   | 默认值 | 描述                                           |
| :-------- | :------: | ------ | ------ | ---------------------------------------------- |
| writeMode |    是    | string | insert | 数据写入表的方式，详见下文                     |
| batchSize |    否    | int    | 1024   | 定义了插件和数据库服务器端每次批量数据获取条数 |

### driver

当前采用的 MySQL JDBC 驱动为 8.0 以上版本，驱动类名使用的 `com.mysql.cj.jdbc.Driver`，而不是 `com.mysql.jdbc.Driver`。
如果你需要采集的 MySQL 服务低于 `5.6`，需要使用到 `Connector/J 5.1` 驱动，则可以采取下面的步骤：

1. 替换插件内置的驱动
   `rm -f plugin/writer/mysqlwriter/libs/mysql-connector-java-*.jar`

2. 拷贝老的驱动到插件目录
   `cp mysql-connector-java-5.1.48.jar plugin/writer/mysqlwriter/libs/`

3. 指定驱动类名称
   在你的 json 文件类，配置 `"driver": "com.mysql.jdbc.Driver"`

### writeMode

- `insert` 表示采用 `insert into`
- `replace`表示采用`replace into`方式
- `update` 表示采用 `ON DUPLICATE KEY UPDATE` 语句

## bit 类型写入

`bit(n)`（n > 1）列接受以下几种来源形式，按目标列声明的宽度精确存放：

| 来源列类型  | 含义                                                                           | 示例            |
| ----------- | ------------------------------------------------------------------------------ | --------------- |
| Bytes       | 打包的位值，每 8 位一个字节，高位在前，即 RDBMS reader 读 `bit` 列时给出的形式 | `0x05` → `101`  |
| String      | 逐字符的位串，只接受 `0` 和 `1`                                                | `"101"` → `101` |
| Long/Double | 数值本身，位模式即该数的二进制，且必须是整数                                   | `5` → `101`     |
| Boolean     | 单个位，`bit(1)` 列走这条路径                                                  | `true` → `1`    |

- 以下情况会被记为脏数据（受 `errorLimit` 控制）：位串中出现 `0`/`1` 以外的字符、数值带小数部分。位数超过目标列宽度时由 MySQL 按自身转换规则处理（严格模式下报错，非严格模式下截断）。
- 十进制数值写成字符串不会被按十进制解析，例如 `"255"` 不是 255 而是非法位串，请把源列声明为 long 或 double。
- `bit(1)` 列按布尔值写入；`tinyint(1)`（包括 `boolean`）按整数写入，Addax 已在 JDBC URL 中附加 `tinyInt1isBit=false`，不会把它识别为 `bit`。
