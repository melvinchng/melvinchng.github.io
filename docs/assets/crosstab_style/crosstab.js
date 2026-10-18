// Cross Tabulation Tool - File Upload Version

// Simple natural sort implementation
function naturalSort(a, b) {
  const ax = [];
  const bx = [];

  a.replace(/(\d+)|(\D+)/g, (_, $1, $2) => {
    ax.push([$1 || Infinity, $2 || '']);
  });
  b.replace(/(\d+)|(\D+)/g, (_, $1, $2) => {
    bx.push([$1 || Infinity, $2 || '']);
  });

  while (ax.length && bx.length) {
    const an = ax.shift();
    const bn = bx.shift();
    const nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
    if (nn) return nn;
  }

  return ax.length - bx.length;
}

const CrosstabApp = {
  data: {
    selectedFile: null,
    data: [],
    rowFields: [],
    colFields: [],
    questions: [],
    questionValues: {},
    selectedCrossTabs: [],
    config: {
      tableType: 'crossTab',
      basePercentageType: 'column',
      mergedQuestionHeader: false,
      showPercentage: false,
      multipleChoiceQuestions: {}
    },
    loaded: false
  },

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const fileInput = document.getElementById('fileInput');
    const loadFileBtn = document.getElementById('loadFileBtn');
    const computeBtn = document.getElementById('computeBtn');
    const exportBtn = document.getElementById('exportBtn');
    const mergedHeader = document.getElementById('mergedHeader');
    const showPercentage = document.getElementById('showPercentage');
    const questionSelect = document.getElementById('questionSelect');

    fileInput.addEventListener('change', (e) => {
      this.data.selectedFile = e.target.files[0];
      loadFileBtn.disabled = !this.data.selectedFile;
    });

    mergedHeader.addEventListener('change', (e) => {
      this.data.config.mergedQuestionHeader = e.target.checked;
    });

    showPercentage.addEventListener('change', (e) => {
      this.data.config.showPercentage = e.target.checked;
      document.getElementById('percentageTypeGroup').style.display = e.target.checked ? 'block' : 'none';
      // Re-render tables when percentage setting changes if columns are selected
      if (this.data.loaded && this.data.colFields.length > 0) {
        this.renderTables();
      }
    });

    document.querySelectorAll('input[name="percentageType"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.data.config.basePercentageType = e.target.value;
        // Re-render tables when percentage type changes if columns are selected
        if (this.data.loaded && this.data.colFields.length > 0) {
          this.renderTables();
        }
      });
    });

    loadFileBtn.addEventListener('click', () => this.loadFile());
    computeBtn.addEventListener('click', () => this.computeCrossTabs());
    exportBtn.addEventListener('click', () => this.exportTable());
  },

  showLoading() {
    document.getElementById('loading').style.display = 'flex';
  },

  hideLoading() {
    document.getElementById('loading').style.display = 'none';
  },

  nextExcelColumnString(str) {
    if (!str) return 'A';
    
    let tail = '';
    let i = str.length - 1;
    let char = str[i];
    
    while (char === 'Z' && i > 0) {
      i--;
      char = str[i];
      tail = 'A' + tail;
    }
    
    if (char === 'Z') return 'AA' + tail;
    return str.slice(0, i) + String.fromCharCode(char.charCodeAt(0) + 1) + tail;
  },

  loadFile() {
    if (!this.data.selectedFile) return;

    this.showLoading();
    const mergedQuestionHeader = this.data.config.mergedQuestionHeader;

    const reader = new FileReader();
    reader.onload = (e) => {
      const bstr = e.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const sheetNameList = workbook.SheetNames;

      // Force read the first sheet only
      sheetNameList.length = 1;

      const data = [];
      const uniqueL1Headers = {};
      const L1Headers = {};
      const L2Headers = {};
      const multipleChoiceQuestions = {};

      sheetNameList.forEach((y) => {
        const worksheet = workbook.Sheets[y];

        for (let z in worksheet) {
          if (z[0] === '!') continue;

          let tt = 0;
          for (let i = 0; i < z.length; i++) {
            if (!isNaN(z[i])) {
              tt = i;
              break;
            }
          }

          const col = z.substring(0, tt);
          const row = parseInt(z.substring(tt));
          const value = worksheet[z].v;

          // Get unique questions
          if (row == 1 && value) {
            uniqueL1Headers[col] = value;

            if (mergedQuestionHeader == false) {
              L1Headers[col] = value;
            }

            continue;
          }

          if (mergedQuestionHeader == true && row == 2 && value) {
            const question = worksheet[`${col}${row - 1}`] ? worksheet[`${col}${row - 1}`].v : undefined;
            L1Headers[col] = question ? question : Object.values(L1Headers).slice(-1)[0];
            L2Headers[col] = value;
            continue;
          }

          if (!data[row]) {
            data[row] = {};
          }

          const currentL1HeaderExists = worksheet[`${col}1`] && worksheet[`${col}1`].v ? true : false;
          const nextL1HeaderExists = worksheet[`${this.nextExcelColumnString(col)}1`] && worksheet[`${this.nextExcelColumnString(col)}1`].v ? true : false;
          const nextL2HeaderExists = worksheet[`${this.nextExcelColumnString(col)}2`] && worksheet[`${this.nextExcelColumnString(col)}2`].v ? true : false;

          if (mergedQuestionHeader == false || (currentL1HeaderExists && nextL1HeaderExists) || (currentL1HeaderExists && !nextL1HeaderExists && !nextL2HeaderExists)) {
            data[row][L1Headers[col]] = value && value != "" ? value : undefined;
          } else {
            data[row][`${L1Headers[col]}__$$__${L2Headers[col]}`] = value && value != "" ? `${L1Headers[col]}__$$__${L2Headers[col]}` : undefined;

            if (!multipleChoiceQuestions[L1Headers[col]]) {
              multipleChoiceQuestions[L1Headers[col]] = {};
            }

            multipleChoiceQuestions[L1Headers[col]][`${L1Headers[col]}__$$__${L2Headers[col]}`] = `${L1Headers[col]}__$$__${L2Headers[col]}`;
          }
        }

        if (mergedQuestionHeader == true) {
          data.shift();
        }

        data.shift();
        data.shift();
      });

      this.data.colFields = [];
      this.data.questions = [];
      this.data.data = [];
      this.data.loaded = false;
      this.data.config.multipleChoiceQuestions = multipleChoiceQuestions;

      setTimeout(() => {
        this.data.questions = Object.values(uniqueL1Headers);
        this.data.data = data;
        this.data.loaded = true;
        this.hideLoading();
        this.populateQuestionSelector();
      }, 100);
    };

    reader.readAsBinaryString(this.data.selectedFile);
  },

  populateQuestionSelector() {
    const questionSelect = document.getElementById('questionSelect');
    questionSelect.innerHTML = '';

    this.data.questions.forEach(question => {
      const option = document.createElement('option');
      option.value = question;
      option.textContent = question;
      questionSelect.appendChild(option);
    });

    document.getElementById('questionSelector').style.display = 'block';
  },

  computeCrossTabs() {
    const questionSelect = document.getElementById('questionSelect');
    const selectedOptions = Array.from(questionSelect.selectedOptions).map(opt => opt.value);

    if (selectedOptions.length === 0) {
      alert('Please select at least one question to cross-tabulate.');
      return;
    }

    this.data.selectedCrossTabs = selectedOptions;

    const newSelectedFields = selectedOptions.map(question => ({
      getter: item => item[question],
      label: question
    }));

    this.data.colFields = newSelectedFields;
    this.data.loaded = false;

    setTimeout(() => {
      this.data.loaded = true;
      this.renderTables();
    }, 100);
  },

  renderTables() {
    const tableWrapper = document.getElementById('tableWrapper');
    tableWrapper.innerHTML = '';

    if (!this.data.colFields || this.data.colFields.length === 0) {
      document.getElementById('results').style.display = 'none';
      return;
    }

    // Create tables for all questions in the data
    this.data.questions.forEach((question, qIndex) => {
      const table = this.createCrossTabTable(question, qIndex);
      tableWrapper.appendChild(table);
    });

    document.getElementById('results').style.display = 'block';
  },

  createCrossTabTable(question, qIndex) {
    const table = document.createElement('table');
    table.className = 'blueTable';
    table.id = `table_${qIndex}`;

    const rowFields = [{ getter: item => item[question], label: question }];
    const colFields = this.data.colFields;

    const rows = this.calculateRows(rowFields, question);
    const cols = this.calculateCols(colFields);
    const values = this.calculateValues(rows, cols, rowFields, colFields, question);

    const thead = document.createElement('thead');
    
    // Row 0: Question title row
    const titleRow = document.createElement('tr');
    const titleTh = document.createElement('th');
    titleTh.colSpan = cols.length + 1;
    titleTh.innerHTML = question;
    titleRow.appendChild(titleTh);
    thead.appendChild(titleRow);

    const colorThemes = ['crosstab-theme-1', 'crosstab-theme-2', 'crosstab-theme-3', 'crosstab-theme-4', 'crosstab-theme-5'];

    // Row 1: Column headers with question labels
    const headerRow = document.createElement('tr');
    headerRow.className = 'bg-light';
    
    const questionLabelTh = document.createElement('th');
    questionLabelTh.textContent = 'Question';
    headerRow.appendChild(questionLabelTh);

    let currentThemeIndex = 0;
    let lastColTitle = null;
    const colThemeMap = {};

    cols.forEach((col, colIndex) => {
      const spanSize = this.calculateSpanSize(col, cols, colIndex, 0);
      if (spanSize > 0) {
        const th = document.createElement('th');
        if (spanSize > 1) {
          th.colSpan = spanSize;
        }
        th.innerHTML = this.computeDisplayText(col[0]);

        if (col[0] !== "Sample Size" && col[0] !== undefined) {
          if (lastColTitle !== col[0]) {
            lastColTitle = col[0];
            currentThemeIndex = (currentThemeIndex + 1) % colorThemes.length;
          }
          colThemeMap[col[0]] = colorThemes[currentThemeIndex];
          th.classList.add(colorThemes[currentThemeIndex]);
        }

        headerRow.appendChild(th);
      }
    });

    thead.appendChild(headerRow);
    
    // Row 2: Option values row
    const optionRow = document.createElement('tr');
    optionRow.className = 'bg-light';
    
    const emptyTh = document.createElement('th');
    emptyTh.textContent = 'Option';
    optionRow.appendChild(emptyTh);

    cols.forEach((col, colIndex) => {
      const th = document.createElement('th');
      th.innerHTML = this.computeDisplayText(col[1]);

      if (col[0] !== "Sample Size" && colThemeMap[col[0]]) {
        th.classList.add(colThemeMap[col[0]]);
      }

      optionRow.appendChild(th);
    });

    thead.appendChild(optionRow);
    table.appendChild(thead);

    // Create body
    const tbody = document.createElement('tbody');

    rows.forEach(row => {
      if (row[0] == 'Grand_Total_Internal') return;

      const tr = document.createElement('tr');

      rowFields.forEach((rowField, rowFieldIndex) => {
        const th = document.createElement('th');
        th.className = 'text-left';
        th.innerHTML = this.computeDisplayText(row[rowFieldIndex]);
        tr.appendChild(th);
      });

      cols.forEach(col => {
        const td = document.createElement('td');
        td.className = 'text-right';
        const key = JSON.stringify({ col, row });
        td.textContent = this.computeDisplayValue(this.data.config, values, row, col, question);
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    return table;
  },

  calculateCols(colFields) {
    const newCols = [];

    if (colFields.length > 0) {
      newCols.push({ 0: "Sample Size", 1: "Total" });

      colFields.forEach((col, depth) => {
        let values = [];

        if (col.label && this.data.config.multipleChoiceQuestions[col.label]) {
          for (let o in this.data.config.multipleChoiceQuestions[col.label]) {
            values.push(o.split("__$$__")[1]);
          }
          values = [...new Set(values)].sort(naturalSort);
        } else {
          const getter = col.getter;
          values = [...new Set(this.data.data.map(getter))].sort(naturalSort);
        }

        values.forEach(value => {
          if (value != undefined && value != null && value != "") {
            newCols.push({ 0: col.label, 1: value });
          }
        });
      });
    }

    return newCols;
  },

  calculateRows(rowFields, question) {
    const rows = [];
    rows.push({ 0: "Base (Count)" });
    rows.push({ 0: "Grand_Total_Internal" });

    const extractRowsRecursive = (data, depth, filters, getter = rowFields[depth].getter) => {
      const values = [...new Set(data.map(getter))].sort(naturalSort);

      values.forEach(value => {
        if (value != undefined && value != null && value != "") {
          const valueFilters = { ...filters, [depth]: value };
          const filteredData = this.filterDataByValue(data, getter, value);

          if (depth + 1 < rowFields.length) {
            extractRowsRecursive(filteredData, depth + 1, valueFilters);
          } else {
            rows.push(valueFilters);
          }
        }
      });
    };

    if (rowFields.length > 0) {
      extractRowsRecursive(this.data.data, 0, {});

      if (this.data.config.multipleChoiceQuestions[question]) {
        for (let o in this.data.config.multipleChoiceQuestions[question]) {
          const getters = [{ getter: item => item[o], label: o }];
          extractRowsRecursive(this.data.data, 0, {}, getters[0].getter);
        }
      }
    } else {
      rows.push({});
    }

    return rows;
  },

  filterDataByValue(data, getter, filter) {
    if (filter !== undefined) {
      return data.filter(item => getter(item) === filter);
    } else {
      return data.slice();
    }
  },

  calculateValues(rows, cols, rowFields, colFields, question) {
    const values = {};

    rows.forEach(row => {
      const rowData = this.filteredData(rowFields, colFields, row);

      cols.forEach(col => {
        const lookupCol = (JSON.stringify(col) == JSON.stringify({ 0: "Sample Size", 1: "Total" })) ? {} : col;
        const data = this.filteredData(rowFields, colFields, row, lookupCol);
        const key = JSON.stringify({ col, row });
        const value = data.reduce((sum, item) => sum + 1, 0);
        values[key] = value;
      });
    });

    for (let col of cols) {
      const baseCountKey = JSON.stringify({ col, row: { 0: 'Base (Count)' } });
      const value = this.data.config.multipleChoiceQuestions[question] 
        ? this.computeRowTotal(values, rows, cols, { 0: 'Base (Count)' }, col)
        : this.computeColumnTotal(values, rows, cols, { 0: 'Base (Count)' }, col);
      values[baseCountKey] = value;
    }

    for (let col of cols) {
      const grandTotalKey = JSON.stringify({ col, row: { 0: 'Grand_Total_Internal' } });
      const value = this.computeRowTotal(values, rows, cols, { 0: 'Base (Count)' }, col);

      if (this.data.config.multipleChoiceQuestions[question]) {
        const multipleBaseCountKey = JSON.stringify({ col: { 0: "Sample Size", 1: "Total" }, row: { 0: "Base (Count)" } });
        values[multipleBaseCountKey] = value;
      }

      values[grandTotalKey] = value;
    }

    return values;
  },

  filteredData(rowFields, colFields, rowFilters, colFilters = {}) {
    const rowGetters = {};

    for (const depth in rowFilters) {
      rowGetters[depth] = rowFields[depth] ? rowFields[depth].getter : undefined;
    }

    return this.data.data.filter(item => {
      let keep = true;

      if (Object.keys(colFilters).length > 0) {
        let title = colFilters[0];
        let answer = colFilters[1];

        if (this.data.config.multipleChoiceQuestions[title]) {
          title = answer = `${title}__$$__${answer}`;
        }

        if (item[title] != answer) {
          keep = false;
        }
      }

      if (keep) {
        for (const depth in rowFilters) {
          if (item[rowFilters[depth]] && rowFilters[depth] == "Base (Count)") {
            break;
          } else if ((this.data.config.multipleChoiceQuestions[rowFilters[0]] && rowFilters[depth] == "Base (Count)")) {
            for (let answeredQuestion in this.data.config.multipleChoiceQuestions[rowFilters[0]]) {
              keep = false;
              if (item[answeredQuestion]) {
                keep = true;
                break;
              }
            }
            break;
          }

          if (item[rowFilters[depth]] && rowFilters[depth]) {
            break;
          }

          if (rowGetters[depth](item) !== rowFilters[depth]) {
            keep = false;
            break;
          }
        }
      }

      return keep;
    });
  },

  computeRowTotal(values, rows, cols, toMatchRow, toMatchCol) {
    let value = 0;

    for (let row of rows) {
      if (row[0] == toMatchRow[0]) {
        for (let col of cols) {
          if (col[0] == toMatchCol[0]) {
            value += values[JSON.stringify({ col, row })];
          }
        }
      }
    }

    return value;
  },

  computeColumnTotal(values, rows, cols, toMatchRow, toMatchCol) {
    let value = 0;

    for (let row of rows) {
      if (JSON.stringify(row) != JSON.stringify(toMatchRow)) {
        for (let col of cols) {
          if (JSON.stringify(col) == JSON.stringify(toMatchCol)) {
            value += values[JSON.stringify({ col, row })];
          }
        }
      }
    }

    return value;
  },

  calculateSpanSize(col, cols, colIndex, rowIndex) {
    const colTitle = col[0];
    const duplicateColTitle = cols.filter(c => c[0] == colTitle);

    if (rowIndex == 0) {
      if (colIndex == 0 || (cols[colIndex - 1][0] != colTitle)) {
        return duplicateColTitle.length;
      } else {
        return 0;
      }
    } else {
      return 1;
    }
  },

  computeDisplayText(text) {
    return typeof text === 'string' && text.split("__$$__")[1] ? text.split("__$$__")[1] : (text !== undefined ? text : '');
  },

  computeDisplayValue(config, values, row, col, question) {
    const key = JSON.stringify({ col, row });
    const value = values[key];
    let total = 100;

    if (JSON.stringify(row) == JSON.stringify({ 0: "Base (Count)" })) {
      return value !== undefined ? value : 0;
    }

    const computeColumnAndRowKey = (colText, rowText) => {
      return JSON.stringify({ col: colText, row: rowText });
    };

    if (computeColumnAndRowKey(col, { 0: "Base (Count)" }) != computeColumnAndRowKey(col, row)) {
      if (config.basePercentageType == "column") {
        total = values[computeColumnAndRowKey(col, { 0: "Base (Count)" })];
      } else if (config.basePercentageType == "table") {
        if (this.data.config.multipleChoiceQuestions[question]) {
          total = values[computeColumnAndRowKey({ 0: "Sample Size", 1: "Total" }, row)];
        } else {
          total = values[computeColumnAndRowKey(col, { 0: "Grand_Total_Internal" })];
        }
      } else if (config.basePercentageType == "row") {
        total = values[computeColumnAndRowKey({ 0: "Sample Size", 1: "Total" }, row)];
      }
    }

    if (config.showPercentage && total > 0) {
      return Math.round(((value || 0) / total) * 100);
    }

    return value !== undefined ? value : 0;
  },

  exportTable() {
    const tableWrapper = document.getElementById('tableWrapper');
    if (!tableWrapper || tableWrapper.children.length === 0) return;

    const cloneWrapper = tableWrapper.cloneNode(true);
    const tables = cloneWrapper.querySelectorAll('table');
    
    tables.forEach(table => {
      const tbody = table.querySelector('tbody');
      const headerRow = table.querySelector('thead tr');
      const colCount = headerRow ? headerRow.cells.length : 1;
      
      if (tbody) {
        const spacerTr = document.createElement('tr');
        const spacerTd = document.createElement('td');
        spacerTd.colSpan = colCount;
        spacerTd.innerHTML = '&nbsp;';
        spacerTr.appendChild(spacerTd);
        tbody.appendChild(spacerTr);
      }
    });

    const workbook = XLSX.utils.table_to_book(cloneWrapper);
    const date = new Date();
    const filename = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}.xlsb`;
    
    XLSX.writeFile(workbook, filename);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  CrosstabApp.init();
});