import { readFileSync } from 'fs';
import { toSql, toConfig } from './sqlserverjsonConvert';

// 加载预设的配置文件（用于验证）
const raw = readFileSync('/tmp/fixed-config.json', 'utf8');
const config = JSON.parse(raw);

console.log('✅ 已加载配置：');
console.log(JSON.stringify(config.config.defaults.arg0.data.columns, null, 2));

// 步骤 1：配置 → SQL
const sql = toSql(config);
console.log('\n✅ 已生成 SQL：\n' + sql);

// 步骤 2：SQL → 配置（反向转换）
const roundtrip = toConfig(sql);
console.log('\n✅ 往返转换后配置（列字段部分，已截断）：');
console.log(JSON.stringify(roundtrip.config.defaults.arg0.data.columns, null, 2));

// ✅ 验证往返一致性：原始列定义是否与反向生成的列定义完全相同？
const cols1 = config.config.defaults.arg0.data.columns;
const cols2 = roundtrip.config.defaults.arg0.data.columns;
const same = cols1.length === cols2.length && 
  cols1.every((c, i) => c.expression === cols2[i].expression && c.alias === cols2[i].alias);

console.log('\n✅ 往返转换一致性校验结果：', same);
