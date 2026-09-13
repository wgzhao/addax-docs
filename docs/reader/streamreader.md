# Stream Reader

Stream Reader 是一个从内存读取数据的插件， 他主要用来快速生成期望的数据并对写入插件进行测试

一个完整的 StreamReader 配置文件如下：

<<<@/public/assets/jobs/streamreader.json

上述配置文件将会生成 10条记录（假定channel为1），每条记录的内容如下：

`unique_id,'1989-06-04 08:12:13',1984,1989.64,true,'a long text'`

目前 StreamReader 支持的输出数据类型全部列在上面，分别是：

- `string` 字符类型
- `date` 日期类型
- `long` 所有整型类型
- `double` 所有浮点数
- `bool` 布尔类型
- `bytes` 字节类型

其中 `date` 类型还支持 `dateFormat` 配置，用来指定输入的日期的格式，默认为 `yyyy-MM-dd HH:mm:ss`。比如你的输入可以这样：

```json
{
  "value": "1989/06/04 12:13:14",
  "type": "date",
  "dateFormat": "yyyy/MM/dd HH:mm:ss"
}
```

注意，日期类型不管输入是何种格式，内部都转为 `yyyy-MM-dd HH:mm:ss` 格式。

日期格式中的小时请使用 `HH`（24 小时制）。`hh` 表示 12 小时制的小时，如果格式中没有 `AM/PM` 标记就无法确定具体时刻，插件会在作业启动时直接报错，提示改用 `HH`。

StreamReader 还支持随机输入功能，比如我们要随机得到0-10之间的任意一个整数，我们可以这样配置列：

```json
{
  "random": "0,10",
  "type": "long"
}
```

获得一个 0 至 100 之间的随机浮点数，可以这样配置：

```json
{
  "random": "0,100",
  "type": "double"
}
```

如果要指定浮点数的小数位数，比如指定小数位为2位，则可以这样设定

```json
{
  "random": "0,100,2",
  "type": "double"
}
```

注意： 并不能保证每次生成的小数恰好是2位，如果小数为数为0 ，则小数位数会少于指定的位数。

这里使用 `random` 这个关键字来表示其值为随机值，其值的范围为左右闭区间。

其他类型的随机类型配置如下：

- `long`: random 0, 10 0到10之间的随机数字
- `string`: random 0, 10 0到 10 长度之间的随机字符串
- `bool`: random 0, 10 false 和 true出现的比率
- `double`: random 0, 10 0到10之间的随机浮点数
- `double`: random 0, 10, 2 0到10之间的随机浮点数，小数位为2位
- `date`: random '2014-07-07 00:00:00', '2016-07-07 00:00:00' 开始时间->结束时间之间的随机时间，日期格式默认(不支持逗号)yyyy-MM-dd HH:mm:ss
- `BYTES`: random 0, 10 0到10长度之间的随机字符串获取其UTF-8编码的二进制串

StreamReader 还支持递增函数，比如我们要得到一个从1开始，每次加5的等差数列，可以这样配置：

```json
{
  "incr": "1,5",
  "type": "long"
}
```

如果需要获得一个递减的数列，则把第二个参数的步长（上例中的5）改为负数即可。步长默认值为1。

递增还支持日期类型( `4.0.1` 版本引入)，比如下面的配置：

```json
{
  "incr": "1989-06-04 09:01:02,2,d",
  "type": "date"
}
```

`incr` 由三部分组成，分别是开始日期，步长以及步长单位，中间用英文逗号(,)分隔。

- 开始日期：正确的日期字符串，默认格式为 `yyyy-MM-dd HH:mm:ss`，如果时间格式不同，则需要配置 `dateFormat` 来指定日期格式，这是必填项
- 步长：每次需要增加的长度，默认为1，如果希望是递减，则填写负数，这是可选项
- 步长单位：按什么时间单位进行递增/递减，默认为按天（day），这是可选项，可选的单位有
  - d/day
  - M/month
  - y/year
  - h/hour
  - m/minute
  - s/second
  - w/week

配置项 `sliceRecordCount` 用来指定要生成的数据条数，如果指定的 `channel`，则实际生成的记录数为 `sliceRecordCount * channel`

## 内置数据规则

除了按类型生成常量、随机值和递增数列，StreamReader 还可以按业务规则直接生成贴近真实数据的数据，比如身份证号码、银行卡号、地址、公司名称等。这类列使用 `rule` 配置项来指定规则，无需配置 `value`，例如：

```json
{
  "rule": "idCard"
}
```

一个包含全部规则的完整示例：

<<<@/public/assets/jobs/streamreader-rules.json

执行该任务，输出结果类似如下：

<<<@/public/assets/output/streamreader-rules.txt

当前内置的规则如下：

| 规则名称       | 含义                                       | 示例                                   | 数据类型 | 说明                                             |
| -------------- | ------------------------------------------ | -------------------------------------- | -------- | ------------------------------------------------ |
| `address`      | 随机生成一条基本满足国内实际情况的地址信息 | `辽宁省兰州市徐汇区东山街176号`        | string   |                                                  |
| `bank`         | 随机生成一个国内银行名称                   | `华夏银行`                             | string   |                                                  |
| `company`      | 随机生成一个公司的名称                     | `万迅电脑科技有限公司`                 | string   |                                                  |
| `creditCard`   | 随机生成一个信用卡卡号                     | `6227544006180760`                     | string   | 16 位                                            |
| `debitCard`    | 随机生成一个储蓄卡卡号                     | `6216695638260308313`                  | string   | 19 位                                            |
| `email`        | 随机生成一个电子邮件地址                   | `ok2a@gmail.com`                       | string   |                                                  |
| `idCard`       | 随机生成一个国内身份证号码                 | `350600198508222018`                   | string   | 18 位，符合校验规则，头 6 位编码满足行政区划要求 |
| `job`          | 随机生成一个国内岗位名称                   | `系统工程师`                           | string   | 数据来源于招聘网站                               |
| `lat`          | 随机生成纬度数据                           | `48.6648764`                           | double   | 固定 7 位小数，也可以用 `latitude` 表示          |
| `lng`          | 随机生成经度数据                           | `120.6018163`                          | double   | 固定 7 位小数，也可以使用 `longitude` 表示       |
| `name`         | 随机生成一个国内名字                       | `池浩`                                 | string   | 暂没考虑姓氏在国内的占比度                       |
| `phone`        | 随机生成一个国内手机号码                   | `15292600492`                          | string   | 暂不考虑虚拟手机号                               |
| `stockAccount` | 随机生成一个 10 位的股票交易账户           | `0692522928`                           | string   | 完全随机，不满足账户规范                         |
| `stockCode`    | 随机生成一个 6 位的股票代码                | `687461`                               | string   | 前两位满足国内股票代码编号规范                   |
| `uuid`         | 随机生成一个 UUID 字符串                   | `bc1cf125-929b-43b7-b324-d7c4cc5a75d2` | string   |                                                  |
| `zipCode`      | 随机生成一个国内邮政编号                   | `411105`                               | long     | 6 位数字，不完全满足国内邮政编号规范             |

规则名称不区分大小写，也不区分下划线和横线，因此 `idCard`、`id_card`、`ID_CARD` 是同一条规则。

关于规则的几点说明：

- 规则的数据类型是固定的，无法通过 `type` 修改；如果配置的 `type` 与规则的类型不一致，作业会在启动时直接报错
- 数据由规则自己生成，配置的 `value` 会被忽略，并给出告警

## rule 配置项

`rule` 除了上面这些内置规则，还支持 `constant`、`random` 和 `incr` 三种通用规则，它们的参数写在 `value` 中，含义与本文档前面介绍的配置项完全一致：

```json
{ "rule": "constant", "value": "addax", "type": "string" }
{ "rule": "random", "value": "1,10", "type": "long" }
{ "rule": "incr", "value": "1,5", "type": "long" }
{ "rule": "incr", "value": "1989-06-04 09:01:02,2,d", "type": "date" }
```

也就是说，`{"random": "1,10"}` 与 `{"rule": "random", "value": "1,10"}` 等价，`{"incr": "1,5"}` 与 `{"rule": "incr", "value": "1,5"}` 等价。两种写法都支持，同一列同时配置 `rule` 与 `random`/`incr` 时以 `rule` 为准，被忽略的配置会有告警。

## 从 datareader 迁移

原 `datareader` 插件已合并到 StreamReader：它的内置规则（身份证、银行卡、地址等）现在由 StreamReader 提供，原先用于造数据的 `datareader` 插件不再单独发布。

迁移时只需要把作业配置中的插件名改掉，列的配置无需修改：

```json
{
  "reader": {
    "name": "streamreader",
    "parameter": {
      "column": [
        { "rule": "idCard" }
      ],
      "sliceRecordCount": 10
    }
  }
}
```

如果列配置中使用了 `hh` 这样的 12 小时制日期格式，需要一并改成 `HH`。
