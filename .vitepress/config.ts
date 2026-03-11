import { defineConfig } from 'vitepress'

const readerPlugins = [
  { path: 'reader/accessreader', name: 'Access Reader' },
  { path: 'reader/cassandrareader', name: 'Cassandra Reader' },
  { path: 'reader/clickhousereader', name: 'ClickHouse Reader' },
  { path: 'reader/databendreader', name: 'Databend Reader' },
  { path: 'reader/datareader', name: 'Data Reader' },
  { path: 'reader/dbfreader', name: 'DBF Reader' },
  { path: 'reader/elasticsearchreader', name: 'Elasticsearch Reader' },
  { path: 'reader/excelreader', name: 'Excel Reader' },
  { path: 'reader/ftpreader', name: 'FTP Reader' },
  { path: 'reader/hanareader', name: 'HANA Reader' },
  { path: 'reader/hbase11xreader', name: 'HBase 1.1.x Reader' },
  { path: 'reader/hbase11xsqlreader', name: 'HBase 1.1.x SQL Reader' },
  { path: 'reader/hbase20xreader', name: 'HBase 2.0.x Reader' },
  { path: 'reader/hbase20xsqlreader', name: 'HBase 2.0.x SQL Reader' },
  { path: 'reader/hdfsreader', name: 'HDFS Reader' },
  { path: 'reader/hivereader', name: 'Hive Reader' },
  { path: 'reader/httpreader', name: 'HTTP Reader' },
  { path: 'reader/influxdb2reader', name: 'InfluxDB 2 Reader' },
  { path: 'reader/influxdbreader', name: 'InfluxDB Reader' },
  { path: 'reader/jsonfilereader', name: 'JSON File Reader' },
  { path: 'reader/kafkareader', name: 'Kafka Reader' },
  { path: 'reader/kudureader', name: 'Kudu Reader' },
  { path: 'reader/mongodbreader', name: 'MongoDB Reader' },
  { path: 'reader/mysqlreader', name: 'MySQL Reader' },
  { path: 'reader/oraclereader', name: 'Oracle Reader' },
  { path: 'reader/postgresqlreader', name: 'PostgreSQL Reader' },
  { path: 'reader/rdbmsreader', name: 'RDBMS Reader' },
  { path: 'reader/redisreader', name: 'Redis Reader' },
  { path: 'reader/s3reader', name: 'S3 Reader' },
  { path: 'reader/sqlitereader', name: 'SQLite Reader' },
  { path: 'reader/sqlserverreader', name: 'SQL Server Reader' },
  { path: 'reader/streamreader', name: 'Stream Reader' },
  { path: 'reader/sybasereader', name: 'Sybase Reader' },
  { path: 'reader/tdenginereader', name: 'TDengine Reader' },
  { path: 'reader/txtfilereader', name: 'Text File Reader' },
]

const writerPlugins = [
  { path: 'writer/accesswriter', name: 'Access Writer' },
  { path: 'writer/cassandrawriter', name: 'Cassandra Writer' },
  { path: 'writer/clickhousewriter', name: 'ClickHouse Writer' },
  { path: 'writer/databendwriter', name: 'Databend Writer' },
  { path: 'writer/dbfwriter', name: 'DBF Writer' },
  { path: 'writer/doriswriter', name: 'Doris Writer' },
  { path: 'writer/elasticsearchwriter', name: 'Elasticsearch Writer' },
  { path: 'writer/excelwriter', name: 'Excel Writer' },
  { path: 'writer/ftpwriter', name: 'FTP Writer' },
  { path: 'writer/greenplumwriter', name: 'Greenplum Writer' },
  { path: 'writer/hanawriter', name: 'HANA Writer' },
  { path: 'writer/hbase11xsqlwriter', name: 'HBase 1.1.x SQL Writer' },
  { path: 'writer/hbase11xwriter', name: 'HBase 1.1.x Writer' },
  { path: 'writer/hbase20xsqlwriter', name: 'HBase 2.0.x SQL Writer' },
  { path: 'writer/hdfswriter', name: 'HDFS Writer' },
  { path: 'writer/icebergwriter', name: 'Iceberg Writer' },
  { path: 'writer/influxdb2writer', name: 'InfluxDB 2 Writer' },
  { path: 'writer/influxdbwriter', name: 'InfluxDB Writer' },
  { path: 'writer/kafkawriter', name: 'Kafka Writer' },
  { path: 'writer/kuduwriter', name: 'Kudu Writer' },
  { path: 'writer/mongodbwriter', name: 'MongoDB Writer' },
  { path: 'writer/mysqlwriter', name: 'MySQL Writer' },
  { path: 'writer/oraclewriter', name: 'Oracle Writer' },
  { path: 'writer/paimonwriter', name: 'Paimon Writer' },
  { path: 'writer/postgresqlwriter', name: 'PostgreSQL Writer' },
  { path: 'writer/rdbmswriter', name: 'RDBMS Writer' },
  { path: 'writer/rediswriter', name: 'Redis Writer' },
  { path: 'writer/s3writer', name: 'S3 Writer' },
  { path: 'writer/sqlitewriter', name: 'SQLite Writer' },
  { path: 'writer/sqlserverwriter', name: 'SQL Server Writer' },
  { path: 'writer/starrockswriter', name: 'StarRocks Writer' },
  { path: 'writer/streamwriter', name: 'Stream Writer' },
  { path: 'writer/sybasewriter', name: 'Sybase Writer' },
  { path: 'writer/tdenginewriter', name: 'TDengine Writer' },
  { path: 'writer/txtfilewriter', name: 'Text File Writer' },
]

const enReaderNavItems = readerPlugins.map(plugin => ({
  text: plugin.name,
  link: `/en/${plugin.path}`
}))

const zhReaderNavItems = readerPlugins.map(plugin => ({
  text: plugin.name,
  link: `/${plugin.path}`
}))

const enWriterNavItems = writerPlugins.map(plugin => ({
  text: plugin.name,
  link: `/en/${plugin.path}`
}))

const zhWriterNavItems = writerPlugins.map(plugin => ({
  text: plugin.name,
  link: `/${plugin.path}`
}))

const enNav = [
  { text: 'Home', link: '/en/introduce' },
  { text: 'Quickstart', link: '/en/quickstart'}
]
const enSiderbar = [
  { text: 'Job Setup', link: '/en/setupJob' },
  { text: 'Command Line', link: '/en/commandline' },
  { text: 'Debug', link: '/en/debug' },
  { text: 'Encrypt Password', link: '/en/encrypt_password' },
  { text: 'Stats Report', link: '/en/statsreport' },
  { text: 'Transformer', link: '/en/transformer' },
  { text: 'Plugin Development', link: '/en/plugin_development' },
  { text: 'Server', link: '/en/server' },
  { text: 'Plugins', 
    items: [
      { text: 'Reader Plugins', collapsed: true, items: enReaderNavItems },
      { text: 'Writer Plugins', collapsed: true, items: enWriterNavItems },
    ]
  }
]

const zhNav = [
  { text: '首页', link: '/' },
  { text: '快速开始', link: '/quick-start' }
]

const zhSidebar = [
  { text: '作业配置', link: '/job-setup' },
  { text: '命令行', link: '/commandline' },
  { text: '调试', link: '/debug' },
  { text: '密码加密', link: '/encrypt-password' },
  { text: '统计报告', link: '/statistic-report' },
  { text: '数据转换', link: '/transformer' },
  { text: '插件开发', link: '/plugin-development' },
  { text: '服务端', link: '/server' },
  {
    text: '插件',
    items: [
      { text: '读取插件', collapsed: true, items: zhReaderNavItems },
      { text: '写入插件', collapsed: true, items: zhWriterNavItems }
    ]
  }
]

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: 'docs',
  title: 'Addax Documentation',
  description: 'A fast and versatile ETL tool that can transfer data between RDBMS and NoSQL seamlessly',
  locales: {
    root: {
      label: ' 中文',
      lang: 'zh',
      themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        logo: {src: '/images/logo.svg', width: 160, height: 160},
        nav: zhNav,
        sidebar: zhSidebar,
        socialLinks: [
          { icon: 'github', link: 'https://github.com/wgzhao/addax' }
        ]
      }
    },
    en: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: enNav,
        sidebar: enSiderbar,
        socialLinks: [
          { icon: 'github', link: 'https://github.com/wgzhao/addax' }
        ]
      }
    }
  },
  mermaid:{
    //mermaidConfig !theme here works for light mode since dark theme is forced in dark mode
  },
})


