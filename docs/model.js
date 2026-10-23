(function (root) {
  'use strict';
  const events = Object.freeze([
    {kind:'allocate'},
    ...[0,1,2,3].map(index => ({kind:'write', index, value:index+1})),
    {kind:'read', index:3, value:4},
    {kind:'free'}
  ].map(event => Object.freeze(event)));

  // Compare fields by meaning; JSON object key order is not significant.
  function sameEvent(actual, expected) {
    if (!actual || typeof actual !== 'object' || Array.isArray(actual)) return false;
    const keys = Object.keys(expected);
    return Object.keys(actual).length === keys.length &&
      keys.every(key => Object.hasOwn(actual, key) && actual[key] === expected[key]);
  }

  function checkedEvents(trace, complete) {
    if (!Array.isArray(trace)) throw Error('事件记录必须是数组。');
    if (trace.length === 1 && sameEvent(trace[0], {kind:'allocation_failed'})) {
      return [{kind:'allocation_failed'}];
    }
    if (trace.length > events.length || (complete && trace.length !== events.length) ||
        !trace.every((event, i) => sameEvent(event, events[i]))) {
      throw Error('事件不匹配：本案例只回放配套的四元素旅程或分配失败记录。');
    }
    return trace.map((event, i) => ({...events[i]}));
  }

  function snapshots(trace = events) {
    let state = {phase:'idle', values:[null,null,null,null], active:-1, output:null};
    const result = [{...state, values:[...state.values]}];
    for (const event of checkedEvents(trace, false)) {
      state = {...state, values:[...state.values]};
      state.active = -1;
      if (event.kind === 'allocate') state.phase = 'allocated';
      if (event.kind === 'write') {
        state.values[event.index] = event.value;
        state.active = event.index;
        state.phase = 'writing';
      }
      if (event.kind === 'read') {
        state.phase = 'reading'; state.active = event.index; state.output = event.value;
      }
      if (event.kind === 'free') state.phase = 'freed';
      if (event.kind === 'allocation_failed') state.phase = 'failed';
      result.push(state);
    }
    return result;
  }
  function validateTrace(data) {
    if (!data || Array.isArray(data) || data.schema !== 1 || data.elements !== 4 ||
        !Number.isSafeInteger(data.sizeof_int) || data.sizeof_int < 1 ||
        !Number.isSafeInteger(4 * data.sizeof_int) || typeof data.failure_injected !== 'boolean') {
      throw Error('记录格式不匹配，请使用配套 C 程序生成的 JSON。');
    }
    const trace = checkedEvents(data.events, true);
    if (data.failure_injected && trace[0].kind !== 'allocation_failed') {
      throw Error('失败注入标记与事件不一致。');
    }
    return snapshots(trace);
  }
  function diagnose(state, index) {
    if (state.phase === 'idle') return {type:'missing', text:'尚未申请空间，不能访问元素。'};
    if (state.phase === 'failed') return {type:'null', text:'申请失败后不能通过空指针访问元素。'};
    if (state.phase === 'freed') return {type:'freed', text:'对象已经释放，继续访问属于未定义行为。'};
    if (!Number.isInteger(index) || index < 0 || index >= 4) return {type:'bounds', text:`4 个元素的合法下标为 0～3；下标 ${String(index)} 超出有效范围，访问会越界。`};
    if (state.values[index] === null) return {type:'uninitialized', text:'这个元素尚未初始化，应先写入有效值。问号是示意符号，不是读取结果。'};
    return {type:'ok', value:state.values[index], text:`p[${index}] 的值为 ${state.values[index]}。`};
  }
  const api = {events, snapshots, validateTrace, diagnose};
  root.MemoryJourney = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
