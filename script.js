// 取得表單與歷史記錄區塊
const form = document.getElementById('recordForm');

// 讀取 localStorage 的資料
function loadRecords() {
  const records = JSON.parse(localStorage.getItem('healthRecords') || '[]');
  return records;
}

// 儲存資料到 localStorage
function saveRecords(records) {
  localStorage.setItem('healthRecords', JSON.stringify(records));
}

// 統計卡片計算
function updateStats() {
  const records = loadRecords();
  if (records.length === 0) {
    // 本周統計
    document.getElementById('weeklyAvgWeight').textContent = '-';
    document.getElementById('weeklyMaxWeight').textContent = '-';
    document.getElementById('weeklyMinWeight').textContent = '-';
    document.getElementById('weeklyTotalSteps').textContent = '-';
    document.getElementById('weeklyAvgWater').textContent = '-';
    // 本月統計
    document.getElementById('monthlyAvgWeight').textContent = '-';
    document.getElementById('monthlyMaxWeight').textContent = '-';
    document.getElementById('monthlyMinWeight').textContent = '-';
    document.getElementById('monthlyTotalSteps').textContent = '-';
    document.getElementById('monthlyAvgWater').textContent = '-';
    return;
  }
  
  // 計算本周的日期範圍
  const today = new Date();
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];
  
  // 計算本月的日期範圍
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayOfMonthStr = firstDayOfMonth.toISOString().split('T')[0];
  
  // 篩選本周和本月的記錄
  const weeklyRecords = records.filter(r => r.date >= oneWeekAgoStr);
  const monthlyRecords = records.filter(r => r.date >= firstDayOfMonthStr);
  
  // 更新本周統計
  if (weeklyRecords.length === 0) {
    document.getElementById('weeklyAvgWeight').textContent = '-';
    document.getElementById('weeklyMaxWeight').textContent = '-';
    document.getElementById('weeklyMinWeight').textContent = '-';
    document.getElementById('weeklyTotalSteps').textContent = '-';
    document.getElementById('weeklyAvgWater').textContent = '-';
  } else {
    const weeklyWeights = weeklyRecords.map(r => parseFloat(r.weight)).filter(Boolean);
    const weeklySteps = weeklyRecords.map(r => parseInt(r.steps)).filter(Boolean);
    const weeklyWaters = weeklyRecords.map(r => parseInt(r.water)).filter(Boolean);
    const avg = arr => arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : '-';
    document.getElementById('weeklyAvgWeight').textContent = avg(weeklyWeights);
    document.getElementById('weeklyMaxWeight').textContent = weeklyWeights.length ? Math.max(...weeklyWeights) : '-';
    document.getElementById('weeklyMinWeight').textContent = weeklyWeights.length ? Math.min(...weeklyWeights) : '-';
    document.getElementById('weeklyTotalSteps').textContent = weeklySteps.length ? weeklySteps.reduce((a,b)=>a+b,0) : '-';
    document.getElementById('weeklyAvgWater').textContent = avg(weeklyWaters);
  }
  
  // 更新本月統計
  if (monthlyRecords.length === 0) {
    document.getElementById('monthlyAvgWeight').textContent = '-';
    document.getElementById('monthlyMaxWeight').textContent = '-';
    document.getElementById('monthlyMinWeight').textContent = '-';
    document.getElementById('monthlyTotalSteps').textContent = '-';
    document.getElementById('monthlyAvgWater').textContent = '-';
  } else {
    const monthlyWeights = monthlyRecords.map(r => parseFloat(r.weight)).filter(Boolean);
    const monthlySteps = monthlyRecords.map(r => parseInt(r.steps)).filter(Boolean);
    const monthlyWaters = monthlyRecords.map(r => parseInt(r.water)).filter(Boolean);
    const avg = arr => arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : '-';
    document.getElementById('monthlyAvgWeight').textContent = avg(monthlyWeights);
    document.getElementById('monthlyMaxWeight').textContent = monthlyWeights.length ? Math.max(...monthlyWeights) : '-';
    document.getElementById('monthlyMinWeight').textContent = monthlyWeights.length ? Math.min(...monthlyWeights) : '-';
    document.getElementById('monthlyTotalSteps').textContent = monthlySteps.length ? monthlySteps.reduce((a,b)=>a+b,0) : '-';
    document.getElementById('monthlyAvgWater').textContent = avg(monthlyWaters);
  }
}

// 載入 Chart.js CDN
(function loadChartJs() {
  if (!window.Chart) {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = function() {
      console.log('Chart.js 載入成功');
      renderHistory();
    };
    document.head.appendChild(script);
  }
})();

// 體重變化趨勢圖
let weightChart;
function renderWeightChart(selectedMonth) {
  let records = loadRecords().filter(r => r.weight && r.date);
  if (selectedMonth) {
    records = records.filter(r => r.date.startsWith(selectedMonth));
  }
  records.sort((a,b)=>a.date.localeCompare(b.date));
  const labels = records.map(r=>r.date);
  const data = records.map(r=>parseFloat(r.weight));
  
  if (!window.Chart) {
    setTimeout(renderWeightChart, 300);
    return;
  }
  
  const ctx = document.getElementById('weightChart');
  if (!ctx) return;
  
  if (weightChart) weightChart.destroy();
  weightChart = new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '體重 (kg)',
        data,
        borderColor: 'var(--dark-gray)',
        backgroundColor: 'rgba(35, 39, 47, 0.1)',
        fill: false,
        tension: 0.2,
        pointRadius: 3,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      layout: {
        padding: 0
      },
      elements: {
        point: {
          borderWidth: 0
        }
      },
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { 
          title: { display: true, text: '日期', color: 'var(--dark-gray)' },
          ticks: { color: 'var(--dark-gray)' },
          grid: {
            display: false
          }
        },
        y: { 
          title: { display: true, text: '體重 (kg)', color: 'var(--dark-gray)' },
          ticks: { color: 'var(--dark-gray)' },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// 步數趨勢圖
let stepsChart;
function renderStepsChart(selectedMonth) {
  let records = loadRecords().filter(r => r.steps && r.date);
  if (selectedMonth) {
    records = records.filter(r => r.date.startsWith(selectedMonth));
  }
  records.sort((a,b)=>a.date.localeCompare(b.date));
  const labels = records.map(r=>r.date);
  const data = records.map(r=>parseInt(r.steps));
  
  if (!window.Chart) {
    setTimeout(renderStepsChart, 300);
    return;
  }
  
  const ctx = document.getElementById('stepsChart');
  if (!ctx) return;
  
  if (stepsChart) stepsChart.destroy();
  stepsChart = new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '步數',
        data,
        borderColor: 'var(--dark-gray)',
        backgroundColor: 'rgba(35, 39, 47, 0.1)',
        fill: false,
        tension: 0.2,
        pointRadius: 3,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      layout: {
        padding: 0
      },
      elements: {
        point: {
          borderWidth: 0
        }
      },
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { 
          title: { display: true, text: '日期', color: 'var(--dark-gray)' },
          ticks: { color: 'var(--dark-gray)' },
          grid: {
            display: false
          }
        },
        y: { 
          title: { display: true, text: '步數', color: 'var(--dark-gray)' },
          ticks: { color: 'var(--dark-gray)' },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// 圍度變化趨勢圖
let measurementsChart;
function renderMeasurementsChart(selectedMonth) {
  let records = loadRecords().filter(r => (r.leftCalf || r.rightCalf || r.leftThigh || r.rightThigh || r.waist) && r.date);
  if (selectedMonth) {
    records = records.filter(r => r.date.startsWith(selectedMonth));
  }
  records.sort((a,b)=>a.date.localeCompare(b.date));
  const labels = records.map(r=>r.date);
  const leftCalfData = records.map(r=>parseFloat(r.leftCalf) || null);
  const rightCalfData = records.map(r=>parseFloat(r.rightCalf) || null);
  const leftThighData = records.map(r=>parseFloat(r.leftThigh) || null);
  const rightThighData = records.map(r=>parseFloat(r.rightThigh) || null);
  const waistData = records.map(r=>parseFloat(r.waist) || null);
  
  if (!window.Chart) {
    setTimeout(renderMeasurementsChart, 300);
    return;
  }
  const ctx = document.getElementById('measurementsChart').getContext('2d');
  if (measurementsChart) measurementsChart.destroy();
  measurementsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: '左小腿',
          data: leftCalfData,
          borderColor: '#2d3436',
          backgroundColor: 'rgba(45, 52, 54, 0.1)',
          fill: false,
          tension: 0.2,
          pointRadius: 3,
          borderWidth: 2
        },
        {
          label: '右小腿',
          data: rightCalfData,
          borderColor: '#636e72',
          backgroundColor: 'rgba(99, 110, 114, 0.1)',
          fill: false,
          tension: 0.2,
          pointRadius: 3,
          borderWidth: 2
        },
        {
          label: '左大腿',
          data: leftThighData,
          borderColor: '#000000',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          fill: false,
          tension: 0.2,
          pointRadius: 3,
          borderWidth: 2
        },
        {
          label: '右大腿',
          data: rightThighData,
          borderColor: '#2f3640',
          backgroundColor: 'rgba(47, 54, 64, 0.1)',
          fill: false,
          tension: 0.2,
          pointRadius: 3,
          borderWidth: 2
        },
        {
          label: '腰圍',
          data: waistData,
          borderColor: '#34495e',
          backgroundColor: 'rgba(52, 73, 94, 0.1)',
          fill: false,
          tension: 0.2,
          pointRadius: 3,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      layout: {
        padding: 0
      },
      elements: {
        point: {
          borderWidth: 0
        }
      },
      plugins: {
        legend: { 
          display: true,
          position: 'top',
          labels: { color: 'var(--dark-gray)' }
        }
      },
      scales: {
        x: { 
          title: { display: true, text: '日期', color: 'var(--dark-gray)' },
          ticks: { color: 'var(--dark-gray)' },
          grid: {
            display: false
          }
        },
        y: { 
          title: { display: true, text: '圍度 (cm)', color: 'var(--dark-gray)' },
          ticks: { color: 'var(--dark-gray)' },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// 熱量趨勢圖
let caloriesChart;
function renderCaloriesChart(selectedMonth) {
  let records = loadRecords().filter(r => r.date);
  if (selectedMonth) {
    records = records.filter(r => r.date.startsWith(selectedMonth));
  }
  records.sort((a,b)=>a.date.localeCompare(b.date));
  const labels = records.map(r=>r.date);
  const data = records.map(r=>calculateTotalCalories(r));
  
  if (!window.Chart) {
    setTimeout(renderCaloriesChart, 300);
    return;
  }
  const ctx = document.getElementById('caloriesChart').getContext('2d');
  if (caloriesChart) caloriesChart.destroy();
  caloriesChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '總熱量 (kcal)',
        data,
        borderColor: 'var(--dark-gray)',
        backgroundColor: 'rgba(35, 39, 47, 0.1)',
        fill: false,
        tension: 0.2,
        pointRadius: 3,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      layout: {
        padding: 0
      },
      elements: {
        point: {
          borderWidth: 0
        }
      },
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { 
          title: { display: true, text: '日期', color: 'var(--dark-gray)' },
          ticks: { color: 'var(--dark-gray)' },
          grid: {
            display: false
          }
        },
        y: { 
          title: { display: true, text: '熱量 (kcal)', color: 'var(--dark-gray)' },
          ticks: { color: 'var(--dark-gray)' },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// 分頁變數
let currentPage = 1;
const itemsPerPage = 10;

// 計算總攝取熱量
function calculateTotalCalories(record) {
  const breakfastCal = parseInt(record.breakfastCal) || 0;
  const lunchCal = parseInt(record.lunchCal) || 0;
  const dinnerCal = parseInt(record.dinnerCal) || 0;
  const snackCal = parseInt(record.snackCal) || 0;
  return breakfastCal + lunchCal + dinnerCal + snackCal;
}

// 刪除記錄
function deleteRecord(date) {
  if (confirm('確定要刪除這筆記錄嗎？')) {
    const records = loadRecords();
    const filteredRecords = records.filter(r => r.date !== date);
    saveRecords(filteredRecords);
    renderHistory();
    populateMonthSelectors(); // 更新月份選單
  }
}

// 分頁控制
function updatePagination(records) {
  const totalPages = Math.ceil(records.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  document.getElementById('pageInfo').textContent = `第 ${currentPage} 頁，共 ${totalPages} 頁`;
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage === totalPages;
  
  return records.slice(startIndex, endIndex);
}

function renderHistoryTable() {
  const records = loadRecords();
  const tbody = document.querySelector('#historyTable tbody');
  if (!tbody) return;
  
  if (records.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10">尚無記錄</td></tr>';
    document.getElementById('pageInfo').textContent = '第 1 頁，共 1 頁';
    document.getElementById('prevPage').disabled = true;
    document.getElementById('nextPage').disabled = true;
    return;
  }
  
  // 按日期排序，由新到舊
  const sortedRecords = records.sort((a, b) => b.date.localeCompare(a.date));
  
  const pageRecords = updatePagination(sortedRecords);
  
  tbody.innerHTML = pageRecords.map(r => {
    const totalCalories = calculateTotalCalories(r);
    return `
      <tr>
        <td>${r.date || ''}</td>
        <td>${r.weight || ''}</td>
        <td>${r.breakfast || ''}${r.breakfastCal ? `<br><span style='color:#FFE066;'>${r.breakfastCal} kcal</span>` : ''}</td>
        <td>${r.lunch || ''}${r.lunchCal ? `<br><span style='color:#FFE066;'>${r.lunchCal} kcal</span>` : ''}</td>
        <td>${r.dinner || ''}${r.dinnerCal ? `<br><span style='color:#FFE066;'>${r.dinnerCal} kcal</span>` : ''}</td>
        <td>${r.snack || ''}${r.snackCal ? `<br><span style='color:#FFE066;'>${r.snackCal} kcal</span>` : ''}</td>
        <td>${r.water || ''}</td>
        <td>${r.steps || ''}</td>
        <td><span style='color:#FFE066; font-weight:bold;'>${totalCalories} kcal</span></td>
        <td><button class="delete-btn" onclick="deleteRecord('${r.date}')">刪除</button></td>
      </tr>
    `;
  }).join('');
}

// 分頁按鈕事件
document.getElementById('prevPage').addEventListener('click', function() {
  if (currentPage > 1) {
    currentPage--;
    renderHistoryTable();
  }
});

document.getElementById('nextPage').addEventListener('click', function() {
  const records = loadRecords().sort((a, b) => b.date.localeCompare(a.date));
  const totalPages = Math.ceil(records.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderHistoryTable();
  }
});

// 表單送出事件
form.addEventListener('submit', function(e) {
  e.preventDefault();
  const record = {
    date: document.getElementById('date').value,
    weight: document.getElementById('weight').value,
    leftCalf: document.getElementById('leftCalf').value,
    rightCalf: document.getElementById('rightCalf').value,
    leftThigh: document.getElementById('leftThigh').value,
    rightThigh: document.getElementById('rightThigh').value,
    waist: document.getElementById('waist').value,
    breakfast: document.getElementById('breakfast').value,
    breakfastCal: document.getElementById('breakfastCal').value,
    lunch: document.getElementById('lunch').value,
    lunchCal: document.getElementById('lunchCal').value,
    dinner: document.getElementById('dinner').value,
    dinnerCal: document.getElementById('dinnerCal').value,
    snack: document.getElementById('snack').value,
    snackCal: document.getElementById('snackCal').value,
    water: document.getElementById('water').value,
    steps: document.getElementById('steps').value
  };
  const records = loadRecords();
  // 若同一天已經有記錄則覆蓋
  const idx = records.findIndex(r => r.date === record.date);
  if (idx >= 0) {
    records[idx] = record;
  } else {
    records.push(record);
  }
  saveRecords(records);
  renderHistory();
  populateMonthSelectors(); // 更新月份選單
  form.reset();
});

// 資料備份與還原
document.getElementById('backupBtn').addEventListener('click', function() {
  const records = loadRecords();
  if (records.length === 0) {
    alert('沒有資料可備份！');
    return;
  }
  const dataStr = JSON.stringify(records, null, 2);
  const blob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `health-records-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

document.getElementById('restoreBtn').addEventListener('click', function() {
  document.getElementById('restoreFile').click();
});

document.getElementById('restoreFile').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const records = JSON.parse(e.target.result);
      if (Array.isArray(records)) {
        if (confirm('確定要還原資料嗎？目前的資料將會被覆蓋！')) {
          saveRecords(records);
          alert('資料還原成功！');
          location.reload(); // 重新載入頁面以顯示還原後的資料
        }
      } else {
        alert('檔案格式不正確！');
      }
    } catch (error) {
      alert('讀取檔案時發生錯誤，請確認檔案是否為正確的備份檔。');
    } finally {
      // 重設 file input，這樣才能重複上傳同一個檔案
      event.target.value = '';
    }
  };
  reader.readAsText(file);
});

function populateMonthSelectors() {
  const records = loadRecords();
  const months = [...new Set(records.map(r => r.date.substring(0, 7)))].sort().reverse();
  
  const selectors = [
    document.getElementById('weightChartMonth'),
    document.getElementById('stepsChartMonth'),
    document.getElementById('measurementsChartMonth'),
    document.getElementById('caloriesChartMonth')
  ];
  
  selectors.forEach(selector => {
    if (!selector) return;
    const currentVal = selector.value;
    selector.innerHTML = '<option value="">所有月份</option>';
    months.forEach(month => {
      selector.innerHTML += `<option value="${month}">${month}</option>`;
    });
    // 保持之前選擇的月份
    if (currentVal && months.includes(currentVal)) {
      selector.value = currentVal;
    }
  });
}

function setupChartMonthSelectors() {
    document.getElementById('weightChartMonth').addEventListener('change', (e) => renderWeightChart(e.target.value));
    document.getElementById('stepsChartMonth').addEventListener('change', (e) => renderStepsChart(e.target.value));
    document.getElementById('measurementsChartMonth').addEventListener('change', (e) => renderMeasurementsChart(e.target.value));
    document.getElementById('caloriesChartMonth').addEventListener('change', (e) => renderCaloriesChart(e.target.value));
}

// 顯示歷史記錄
function renderHistory() {
  updateStats();
  const selectedWeightMonth = document.getElementById('weightChartMonth')?.value;
  renderWeightChart(selectedWeightMonth);
  const selectedStepsMonth = document.getElementById('stepsChartMonth')?.value;
  renderStepsChart(selectedStepsMonth);
  const selectedMeasurementsMonth = document.getElementById('measurementsChartMonth')?.value;
  renderMeasurementsChart(selectedMeasurementsMonth);
  const selectedCaloriesMonth = document.getElementById('caloriesChartMonth')?.value;
  renderCaloriesChart(selectedCaloriesMonth);
  renderHistoryTable();
}

// 如果 Chart.js 已經載入，直接渲染
if (window.Chart) {
  populateMonthSelectors();
  renderHistory();
  setupChartMonthSelectors();
} else {
    // 確保Chart.js載入後才執行
    const originalOnload = document.querySelector('script[src*="chart.js"]').onload;
    document.querySelector('script[src*="chart.js"]').onload = function() {
        if(originalOnload) originalOnload();
        populateMonthSelectors();
        renderHistory();
        setupChartMonthSelectors();
    };
} 