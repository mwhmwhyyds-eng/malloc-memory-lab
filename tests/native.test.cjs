const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const {mkdirSync, writeFileSync} = require('node:fs');
const path = require('node:path');
const {validateTrace, snapshots} = require('../docs/model.js');

const executable = process.argv[2];
if (!executable) throw Error('Pass the compiled C executable path as the first argument.');
const output = path.resolve(__dirname, '../build');
mkdirSync(output, {recursive:true});
const normal = spawnSync(path.resolve(executable), [], {encoding:'utf8'});
assert.equal(normal.error, undefined);
assert.equal(normal.status, 0, normal.stderr);
assert.equal(normal.stderr, '');
const success = JSON.parse(normal.stdout);
assert.deepEqual(validateTrace(success), snapshots());
assert.equal(success.failure_injected, false);
const failure = spawnSync(path.resolve(executable), ['--simulate-failure'], {encoding:'utf8'});
assert.equal(failure.status, 1);
assert.equal(failure.stderr, '');
const injected = JSON.parse(failure.stdout);
assert.equal(injected.failure_injected, true);
assert.equal(validateTrace(injected).at(-1).phase, 'failed');
const invalid = spawnSync(path.resolve(executable), ['--unknown'], {encoding:'utf8'});
assert.equal(invalid.status, 1);
assert.equal(invalid.stdout, '');
assert.match(invalid.stderr, /Usage:/);
const extra = spawnSync(path.resolve(executable), ['--simulate-failure','extra'], {encoding:'utf8'});
assert.equal(extra.status, 1);
assert.equal(extra.stdout, '');
assert.match(extra.stderr, /Usage:/);
writeFileSync(path.join(output,'trace.json'), normal.stdout);
writeFileSync(path.join(output,'failure.json'), failure.stdout);
writeFileSync(path.join(output,'native-checks.json'), JSON.stringify({
  platform:process.platform, arch:process.arch, normal_exit:normal.status,
  injected_failure_exit:failure.status, invalid_argument_exit:invalid.status,
  extra_argument_exit:extra.status, sizeof_int:success.sizeof_int,
  normal_events:success.events.length, injected_events:injected.events.length,
  matches_web_model:true
},null,2));
console.log('PASS: compiled C success, injected failure, invalid arguments, valid JSON and exact agreement with web replay');
