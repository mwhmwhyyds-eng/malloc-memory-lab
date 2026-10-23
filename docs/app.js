(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const model = MemoryJourney;
  let states = model.snapshots(), position = 0, savedPosition = 0, fault = null;
  let importGeneration = 0;
  const copy = [
    ['00 / 准备','从一个申请开始','程序需要保存四个整数。点击“开始申请”，观察空间与数据如何依次就位。'],
    ['01 / 申请','有了空间，还没有有效数据','成功申请后，p 指向可容纳 4 个 int 的空间。先检查返回值；问号表示内容尚未初始化。'],
    ['02 / 写入','第一个元素写入 1','执行 p[0] = 1。只有已写入的元素有了本案例设定的有效值，其余元素仍未初始化。'],
    ['02 / 写入','第二个元素写入 2','执行 p[1] = 2。初始化按元素进行，不会因为写了一个值就自动初始化整块空间。'],
    ['02 / 写入','第三个元素写入 3','执行 p[2] = 3。下标从 0 开始，p[2] 是第三个元素。'],
    ['02 / 写入','四个元素都已初始化','执行 p[3] = 4。现在四个元素依次保存 1、2、3、4，可在合法范围内读取。'],
    ['03 / 读取','p[3] 读取的是第四个元素','高亮下标 3，对应的值为 4。printf 输出 4；读取没有改变这四个元素的值。'],
    ['04 / 释放','对象的使用到这里结束','free(p) 之后不能再访问原对象。灰色表示访问失效，不表示数据清零，p 也不会自动变成 NULL。']
  ];
  const faults = {
    uninitialized:{position:1,index:0,attempt:'printf("%d\\n", p[0]);',title:'刚申请，就读取 p[0]？'},
    bounds:{position:5,index:4,attempt:'printf("%d\\n", p[4]);',title:'四个元素，能访问 p[4] 吗？'},
    freed:{position:7,index:0,attempt:'printf("%d\\n", p[0]);',title:'free 之后，还能再读取吗？'}
  };
  function render() {
    const state = states[position];
    const isFailed = state.phase === 'failed';
    const available = !['idle','failed','freed'].includes(state.phase);
    const info = isFailed ? ['01 / 申请失败','没有得到可用的空间','返回 NULL 后应停止这条使用路径。本示例直接退出，不执行后续写入和读取；此情境不代表当前机器真的内存不足。'] : copy[Math.min(position,7)];
    $('phase-number').textContent = info[0]; $('scene-title').textContent = fault ? faults[fault].title : info[1];
    $('explanation').textContent = info[2];
    $('pointer-state').textContent = available ? '指向分配对象' : state.phase === 'freed' ? '原指向已失效' : isFailed ? 'NULL' : '尚未赋值';
    $('pointer-link').style.opacity = available ? '1' : '0';
    $('memory-scene').dataset.phase = state.phase;
    const array = $('array'); array.replaceChildren();
    for (let i=0;i<4;i++) {
      const cell = document.createElement('div'); cell.className = 'cell'; cell.dataset.index = String(i);
      let value = '—';
      if (available) { value = state.values[i] === null ? '?' : String(state.values[i]); cell.classList.add(state.values[i] === null ? 'ready':'written'); }
      if (state.phase === 'freed') { value = '×'; cell.classList.add('released'); }
      if (state.active === i && available && !fault) cell.classList.add('active');
      if (fault && faults[fault].index === i) cell.classList.add('invalid');
      const number = document.createElement('span'); number.className = 'value'; number.textContent = value;
      const index = document.createElement('span'); index.className = 'index'; index.textContent = `[${i}]`;
      cell.append(number,index); cell.setAttribute('aria-label',`下标 ${i}：${value==='?'?'尚未初始化':value==='×'?'访问失效':value==='—'?'尚无可用对象':value}`);array.append(cell);
    }
    if (fault === 'bounds') {const hint=document.createElement('span');hint.className='out-of-bounds';hint.textContent='p[4] 在对象范围之外';array.append(hint);}
    $('program-output').textContent = state.output === null ? '—' : String(state.output);
    let lines = isFailed ? [2,3] : position===0 ? [] : position===1 ? [1,2] : position<=5 ? [5,6] : position===6 ? [8] : [9];
    document.querySelectorAll('[data-line]').forEach(el => {const n=Number(el.dataset.line);el.classList.toggle('active',lines.includes(n));});
    $('attempt').hidden=!fault;$('attempt-code').textContent=fault?faults[fault].attempt:'';
    document.querySelectorAll('[data-jump]').forEach((el,i)=>{const current=state.phase==='idle'?-1:isFailed||position===1?0:position<=5?1:position===6?2:3;if(current===i)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');el.disabled=states.length===2&&i>0;});
    $('previous').disabled=position===0||!!fault;$('next').disabled=position===states.length-1||!!fault;
    $('next').textContent=isFailed?'使用路径已停止':position===0?'开始申请 →':position===states.length-1?'旅程结束':'下一步 →';
    $('step-counter').textContent=`${position} / ${states.length-1}`;
    document.querySelectorAll('[data-fault]').forEach(el=>{el.setAttribute('aria-pressed',String(el.dataset.fault===fault));el.disabled=states.length===2;});
    $('return-main').hidden=!fault;
    const result=fault?model.diagnose(state,faults[fault].index):null;
    $('diagnostic').textContent=result?result.text+' 本页没有实际执行这个错误操作。':'错误探索只展示原因，不实际执行有未定义行为的 C 代码。';
    $('diagnostic').classList.toggle('warning',!!fault);
  }
  function leaveFault(){if(fault){position=savedPosition;fault=null;}}
  $('next').onclick=()=>{if(!fault&&position<states.length-1){position++;render();}};
  $('previous').onclick=()=>{if(!fault&&position>0){position--;render();}};
  function clearImportedRecord() {
    // Invalidate pending file reads when the user switches scenarios.
    importGeneration++;
    $('trace-status').textContent='';
    $('trace-file').value='';
  }
  $('reset').onclick=()=>{clearImportedRecord();states=model.snapshots();position=0;fault=null;$('data-origin').textContent='教学演示';$('allocation-label').textContent='4 × sizeof(int) 字节';render();};
  $('return-main').onclick=()=>{leaveFault();render();};
  $('simulate-failure').onclick=()=>{clearImportedRecord();states=model.snapshots([{kind:'allocation_failed'}]);position=1;fault=null;$('data-origin').textContent='失败情境 · 教学设定';$('allocation-label').textContent='申请未成功，没有可用对象';render();};
  document.querySelectorAll('[data-jump]').forEach(el=>el.onclick=()=>{leaveFault();position=Math.min(Number(el.dataset.jump),states.length-1);render();});
  document.querySelectorAll('[data-fault]').forEach(el=>el.onclick=()=>{if(!fault)savedPosition=position;fault=el.dataset.fault;position=faults[fault].position;render();});
  $('trace-file').onchange=async event=>{
    const request=++importGeneration;
    const file=event.target.files[0];if(!file)return;
    $('trace-status').textContent='正在读取记录…';
    try {
      if(file.size>32768)throw Error('记录文件不能超过 32 KB。');
      const text=await file.text();
      if(request!==importGeneration)return;
      const data=JSON.parse(text.replace(/^\uFEFF/, ''));const checked=model.validateTrace(data);
      states=checked;position=0;fault=null;$('data-origin').textContent='载入的事件记录';
      $('allocation-label').textContent=`记录中的请求大小：4 × ${data.sizeof_int} = ${4*data.sizeof_int} 字节`;
      $('trace-status').textContent=`已载入 ${data.events.length} 个事件。${data.failure_injected?'其中的分配失败为程序主动注入。':''} 文件来源由提供者说明。`;
      render();
    }catch(error){
      if(request!==importGeneration)return;
      const message=error instanceof SyntaxError?'JSON 无法解析，请重新导出配套 C 程序的运行记录。':error.message;
      $('trace-status').textContent=message+' 当前展示保持不变。';
    }
  };
  render();
})();
