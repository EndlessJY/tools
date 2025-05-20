// 获取DOM元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const compressBtn = document.getElementById('compressBtn');
const downloadBtn = document.getElementById('downloadBtn');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const compressionControls = document.querySelector('.compression-controls');
const previewSection = document.querySelector('.preview-section');

// 当前处理的图片文件
let currentFile = null;
let compressedFile = null;

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 显示文件信息
function displayFileInfo(file, element) {
    element.textContent = formatFileSize(file.size);
}

// 处理文件上传
async function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件！');
        return;
    }

    currentFile = file;
    displayFileInfo(file, originalSize);

    // 显示原始图片预览
    const reader = new FileReader();
    reader.onload = (e) => {
        originalPreview.src = e.target.result;
    };
    reader.readAsDataURL(file);

    // 显示压缩控制区域
    compressionControls.style.display = 'block';
    previewSection.style.display = 'block';
}

// 压缩图片
async function compressImage() {
    if (!currentFile) return;

    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        quality: qualitySlider.value / 100
    };

    try {
        compressedFile = await imageCompression(currentFile, options);
        displayFileInfo(compressedFile, compressedSize);

        // 显示压缩后的图片预览
        const reader = new FileReader();
        reader.onload = (e) => {
            compressedPreview.src = e.target.result;
        };
        reader.readAsDataURL(compressedFile);
    } catch (error) {
        console.error('压缩失败:', error);
        alert('图片压缩失败，请重试！');
    }
}

// 下载压缩后的图片
function downloadCompressedImage() {
    if (!compressedFile) return;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(compressedFile);
    link.download = `compressed_${currentFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 事件监听器
dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--primary-color)';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--border-color)';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--border-color)';
    
    if (e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
    }
});

qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = `${e.target.value}%`;
});

compressBtn.addEventListener('click', compressImage);
downloadBtn.addEventListener('click', downloadCompressedImage);

// ========== 常用工具功能实现 ==========
// 工具入口与卡片 DOM
const calcEntry = document.getElementById('calcEntry');
const convertEntry = document.getElementById('convertEntry');
const noteEntry = document.getElementById('noteEntry');
const calcCard = document.getElementById('calcCard');
const convertCard = document.getElementById('convertCard');
const noteCard = document.getElementById('noteCard');

// 工具卡片显示/隐藏逻辑
calcEntry.addEventListener('click', () => {
    calcCard.style.display = calcCard.style.display === 'none' ? 'block' : 'none';
    convertCard.style.display = 'none';
    noteCard.style.display = 'none';
});
convertEntry.addEventListener('click', () => {
    convertCard.style.display = convertCard.style.display === 'none' ? 'block' : 'none';
    calcCard.style.display = 'none';
    noteCard.style.display = 'none';
});
noteEntry.addEventListener('click', () => {
    noteCard.style.display = noteCard.style.display === 'none' ? 'block' : 'none';
    calcCard.style.display = 'none';
    convertCard.style.display = 'none';
});

// ========== 计算器功能 ==========
let calcInput = '';
const calcDisplay = document.getElementById('calcDisplay');
const calcBtns = document.querySelectorAll('.calc-btn');

calcBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const val = btn.textContent;
        if (val === 'C') {
            calcInput = '';
            calcDisplay.textContent = '0';
        } else if (val === '=') {
            try {
                // 只允许数字和运算符，防止注入
                if (/^[0-9+\-*/.]+$/.test(calcInput)) {
                    calcDisplay.textContent = eval(calcInput).toString();
                    calcInput = calcDisplay.textContent;
                } else {
                    calcDisplay.textContent = '错误';
                }
            } catch {
                calcDisplay.textContent = '错误';
            }
        } else {
            calcInput += val;
            calcDisplay.textContent = calcInput;
        }
    });
});

// ========== 单位换算器功能 ==========
const convertType = document.getElementById('convertType');
const convertFrom = document.getElementById('convertFrom');
const convertTo = document.getElementById('convertTo');
const convertInput = document.getElementById('convertInput');
const convertResult = document.getElementById('convertResult');

// 单位选项
const units = {
    length: [
        {name: '米', value: 'm'},
        {name: '厘米', value: 'cm'},
        {name: '毫米', value: 'mm'},
        {name: '千米', value: 'km'},
    ],
    weight: [
        {name: '千克', value: 'kg'},
        {name: '克', value: 'g'},
        {name: '吨', value: 't'},
    ],
    temp: [
        {name: '摄氏度', value: 'c'},
        {name: '华氏度', value: 'f'},
        {name: '开尔文', value: 'k'},
    ]
};

// 填充单位下拉框
function fillUnitOptions(type) {
    convertFrom.innerHTML = '';
    convertTo.innerHTML = '';
    units[type].forEach(u => {
        const opt1 = document.createElement('option');
        opt1.value = u.value;
        opt1.textContent = u.name;
        convertFrom.appendChild(opt1);
        const opt2 = document.createElement('option');
        opt2.value = u.value;
        opt2.textContent = u.name;
        convertTo.appendChild(opt2);
    });
    convertTo.selectedIndex = 1;
}

// 换算逻辑
function convertValue() {
    const type = convertType.value;
    const from = convertFrom.value;
    const to = convertTo.value;
    const val = parseFloat(convertInput.value);
    if (isNaN(val)) {
        convertResult.value = '';
        return;
    }
    let result = '';
    if (type === 'length') {
        // 统一转为米
        let m = val;
        if (from === 'cm') m = val / 100;
        if (from === 'mm') m = val / 1000;
        if (from === 'km') m = val * 1000;
        // 再从米转目标
        if (to === 'm') result = m;
        if (to === 'cm') result = m * 100;
        if (to === 'mm') result = m * 1000;
        if (to === 'km') result = m / 1000;
    } else if (type === 'weight') {
        // 统一转为千克
        let kg = val;
        if (from === 'g') kg = val / 1000;
        if (from === 't') kg = val * 1000;
        // 再从千克转目标
        if (to === 'kg') result = kg;
        if (to === 'g') result = kg * 1000;
        if (to === 't') result = kg / 1000;
    } else if (type === 'temp') {
        // 先转为摄氏度
        let c = val;
        if (from === 'f') c = (val - 32) * 5 / 9;
        if (from === 'k') c = val - 273.15;
        // 再从摄氏度转目标
        if (to === 'c') result = c;
        if (to === 'f') result = c * 9 / 5 + 32;
        if (to === 'k') result = c + 273.15;
    }
    convertResult.value = result ? result.toFixed(4) : '';
}

convertType.addEventListener('change', () => {
    fillUnitOptions(convertType.value);
    convertValue();
});
convertFrom.addEventListener('change', convertValue);
convertTo.addEventListener('change', convertValue);
convertInput.addEventListener('input', convertValue);

// 初始化单位下拉框
fillUnitOptions('length');

// ========== 记事本功能 ==========
const noteArea = document.getElementById('noteArea');
const noteCopy = document.getElementById('noteCopy');
const noteSave = document.getElementById('noteSave');
const noteLoad = document.getElementById('noteLoad');

// 复制全部内容
noteCopy.addEventListener('click', () => {
    noteArea.select();
    document.execCommand('copy');
    alert('内容已复制到剪贴板！');
});
// 保存到本地
noteSave.addEventListener('click', () => {
    localStorage.setItem('myNote', noteArea.value);
    alert('内容已保存到本地！');
});
// 读取本地内容
noteLoad.addEventListener('click', () => {
    noteArea.value = localStorage.getItem('myNote') || '';
    alert('内容已读取！');
});

// ========== 新增7个工具入口与卡片 DOM ==========
const timerEntry = document.getElementById('timerEntry');
const stopwatchEntry = document.getElementById('stopwatchEntry');
const calendarEntry = document.getElementById('calendarEntry');
const randomEntry = document.getElementById('randomEntry');
const todoEntry = document.getElementById('todoEntry');
const currencyEntry = document.getElementById('currencyEntry');
const translateEntry = document.getElementById('translateEntry');
const timerCard = document.getElementById('timerCard');
const stopwatchCard = document.getElementById('stopwatchCard');
const calendarCard = document.getElementById('calendarCard');
const randomCard = document.getElementById('randomCard');
const todoCard = document.getElementById('todoCard');
const currencyCard = document.getElementById('currencyCard');
const translateCard = document.getElementById('translateCard');

// 工具卡片显示/隐藏逻辑（扩展）
function hideAllToolCards() {
    [calcCard, convertCard, noteCard, timerCard, stopwatchCard, calendarCard, randomCard, todoCard, currencyCard, translateCard].forEach(card => {
        if(card) card.style.display = 'none';
    });
}
calcEntry.addEventListener('click', () => { hideAllToolCards(); calcCard.style.display = 'block'; });
convertEntry.addEventListener('click', () => { hideAllToolCards(); convertCard.style.display = 'block'; });
noteEntry.addEventListener('click', () => { hideAllToolCards(); noteCard.style.display = 'block'; });
timerEntry.addEventListener('click', () => { hideAllToolCards(); timerCard.style.display = 'block'; });
stopwatchEntry.addEventListener('click', () => { hideAllToolCards(); stopwatchCard.style.display = 'block'; });
calendarEntry.addEventListener('click', () => { hideAllToolCards(); calendarCard.style.display = 'block'; });
randomEntry.addEventListener('click', () => { hideAllToolCards(); randomCard.style.display = 'block'; });
todoEntry.addEventListener('click', () => { hideAllToolCards(); todoCard.style.display = 'block'; });
currencyEntry.addEventListener('click', () => { hideAllToolCards(); currencyCard.style.display = 'block'; });
translateEntry.addEventListener('click', () => { hideAllToolCards(); translateCard.style.display = 'block'; });

// ========== 计时器功能 ==========
const timerMinute = document.getElementById('timerMinute');
const timerSecond = document.getElementById('timerSecond');
const timerStart = document.getElementById('timerStart');
const timerReset = document.getElementById('timerReset');
const timerDisplay = document.getElementById('timerDisplay');
let timerInterval = null;
let timerTotal = 0;
function updateTimerDisplay() {
    const min = String(Math.floor(timerTotal / 60)).padStart(2, '0');
    const sec = String(timerTotal % 60).padStart(2, '0');
    timerDisplay.textContent = `${min}:${sec}`;
}
timerStart.addEventListener('click', () => {
    const min = parseInt(timerMinute.value) || 0;
    const sec = parseInt(timerSecond.value) || 0;
    timerTotal = min * 60 + sec;
    if (timerTotal <= 0) { alert('请输入有效时间！'); return; }
    updateTimerDisplay();
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (timerTotal > 0) {
            timerTotal--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            alert('时间到！');
        }
    }, 1000);
});
timerReset.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerMinute.value = '';
    timerSecond.value = '';
    timerTotal = 0;
    updateTimerDisplay();
});
updateTimerDisplay();

// ========== 秒表功能 ==========
const stopwatchDisplay = document.getElementById('stopwatchDisplay');
const stopwatchStart = document.getElementById('stopwatchStart');
const stopwatchPause = document.getElementById('stopwatchPause');
const stopwatchReset = document.getElementById('stopwatchReset');
let stopwatchInterval = null;
let stopwatchTime = 0;
let stopwatchRunning = false;
function updateStopwatchDisplay() {
    const min = String(Math.floor(stopwatchTime / 6000)).padStart(2, '0');
    const sec = String(Math.floor((stopwatchTime % 6000) / 100)).padStart(2, '0');
    const ms = String(stopwatchTime % 100).padStart(2, '0');
    stopwatchDisplay.textContent = `${min}:${sec}.${ms}`;
}
stopwatchStart.addEventListener('click', () => {
    if (stopwatchRunning) return;
    stopwatchRunning = true;
    stopwatchInterval = setInterval(() => {
        stopwatchTime++;
        updateStopwatchDisplay();
    }, 10);
});
stopwatchPause.addEventListener('click', () => {
    stopwatchRunning = false;
    clearInterval(stopwatchInterval);
});
stopwatchReset.addEventListener('click', () => {
    stopwatchRunning = false;
    clearInterval(stopwatchInterval);
    stopwatchTime = 0;
    updateStopwatchDisplay();
});
updateStopwatchDisplay();

// ========== 日历功能 ==========
const calendarMonth = document.getElementById('calendarMonth');
const calendarPrev = document.getElementById('calendarPrev');
const calendarNext = document.getElementById('calendarNext');
const calendarTable = document.getElementById('calendarTable');
let calDate = new Date();
function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    calendarMonth.textContent = `${year}年${month+1}月`;
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month+1, 0).getDate();
    let html = '<tr>';
    ['日','一','二','三','四','五','六'].forEach(d=>{html+=`<th>${d}</th>`});
    html+='</tr><tr>';
    for(let i=0;i<firstDay;i++) html+='<td></td>';
    let day=1;
    for(let i=firstDay;i<7;i++) {html+=`<td data-day="${day}">${day++}</td>`;}
    html+='</tr>';
    while(day<=days){html+='<tr>';
      for(let i=0;i<7;i++){
        if(day<=days) html+=`<td data-day="${day}">${day++}</td>`;
        else html+='<td></td>';
      }
      html+='</tr>';
    }
    calendarTable.innerHTML = html;
    // 点击高亮
    Array.from(calendarTable.querySelectorAll('td[data-day]')).forEach(td=>{
      td.onclick = function(){
        Array.from(calendarTable.querySelectorAll('td')).forEach(cell=>cell.classList.remove('selected'));
        td.classList.add('selected');
      }
    });
}
calendarPrev.addEventListener('click',()=>{calDate.setMonth(calDate.getMonth()-1);renderCalendar(calDate);});
calendarNext.addEventListener('click',()=>{calDate.setMonth(calDate.getMonth()+1);renderCalendar(calDate);});
renderCalendar(calDate);

// ========== 随机数生成器功能 ==========
const randomMin = document.getElementById('randomMin');
const randomMax = document.getElementById('randomMax');
const randomGen = document.getElementById('randomGen');
const randomResult = document.getElementById('randomResult');
randomGen.addEventListener('click',()=>{
  const min = parseInt(randomMin.value);
  const max = parseInt(randomMax.value);
  if(isNaN(min)||isNaN(max)||min>max){randomResult.textContent='请输入有效区间';return;}
  const val = Math.floor(Math.random()*(max-min+1))+min;
  randomResult.textContent = `结果：${val}`;
});

// ========== 待办清单功能 ==========
const todoInput = document.getElementById('todoInput');
const todoAdd = document.getElementById('todoAdd');
const todoList = document.getElementById('todoList');
function renderTodoList() {
  todoList.innerHTML = '';
  const todos = JSON.parse(localStorage.getItem('myTodos')||'[]');
  todos.forEach((item,idx)=>{
    const li = document.createElement('li');
    li.className = item.done ? 'completed' : '';
    const span = document.createElement('span');
    span.textContent = item.text;
    li.appendChild(span);
    const doneBtn = document.createElement('button');
    doneBtn.textContent = item.done?'未完成':'完成';
    doneBtn.onclick = ()=>{
      todos[idx].done = !todos[idx].done;
      localStorage.setItem('myTodos',JSON.stringify(todos));
      renderTodoList();
    };
    li.appendChild(doneBtn);
    const delBtn = document.createElement('button');
    delBtn.textContent = '删除';
    delBtn.onclick = ()=>{
      todos.splice(idx,1);
      localStorage.setItem('myTodos',JSON.stringify(todos));
      renderTodoList();
    };
    li.appendChild(delBtn);
    todoList.appendChild(li);
  });
}
todoAdd.addEventListener('click',()=>{
  const val = todoInput.value.trim();
  if(!val) return;
  const todos = JSON.parse(localStorage.getItem('myTodos')||'[]');
  todos.push({text:val,done:false});
  localStorage.setItem('myTodos',JSON.stringify(todos));
  todoInput.value = '';
  renderTodoList();
});
renderTodoList();

// ========== 货币换算器功能 ==========
const currencyAmount = document.getElementById('currencyAmount');
const currencyFrom = document.getElementById('currencyFrom');
const currencyTo = document.getElementById('currencyTo');
const currencyConvert = document.getElementById('currencyConvert');
const currencyResult = document.getElementById('currencyResult');
// 静态汇率表（示例，实际可扩展）
const currencyRates = {
  CNY: {CNY:1, USD:0.14, EUR:0.13},
  USD: {CNY:7.1, USD:1, EUR:0.92},
  EUR: {CNY:7.7, USD:1.09, EUR:1}
};
const currencyNames = {CNY:'人民币',USD:'美元',EUR:'欧元'};
function fillCurrencyOptions() {
  [currencyFrom,currencyTo].forEach(sel=>{
    sel.innerHTML = '';
    Object.keys(currencyRates).forEach(k=>{
      const opt = document.createElement('option');
      opt.value = k;
      opt.textContent = currencyNames[k];
      sel.appendChild(opt);
    });
  });
  currencyTo.selectedIndex = 1;
}
currencyConvert.addEventListener('click',()=>{
  const from = currencyFrom.value;
  const to = currencyTo.value;
  const amount = parseFloat(currencyAmount.value);
  if(isNaN(amount)||!currencyRates[from]||!currencyRates[from][to]){
    currencyResult.textContent = '请输入有效金额和币种';return;
  }
  const res = amount * currencyRates[from][to];
  currencyResult.textContent = `结果：${res.toFixed(2)} ${currencyNames[to]}`;
});
fillCurrencyOptions();

// ========== 英文单词翻译功能 ==========
const translateInput = document.getElementById('translateInput');
const translateBtn = document.getElementById('translateBtn');
const translateResult = document.getElementById('translateResult');
// 简单内置词库
const wordDict = {
  apple: '苹果',
  banana: '香蕉',
  cat: '猫',
  dog: '狗',
  hello: '你好',
  world: '世界',
  school: '学校',
  book: '书',
  computer: '电脑',
  water: '水',
  sun: '太阳',
  moon: '月亮',
  teacher: '老师',
  student: '学生',
  love: '爱',
  happy: '快乐',
  run: '跑',
  eat: '吃',
  play: '玩',
  read: '读'
};
translateBtn.addEventListener('click',()=>{
  const word = translateInput.value.trim().toLowerCase();
  if(!word){translateResult.textContent='请输入英文单词';return;}
  translateResult.textContent = wordDict[word] ? `中文：${wordDict[word]}` : '未收录该单词';
}); 