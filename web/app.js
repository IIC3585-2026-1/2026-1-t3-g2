/*
 * Aplicación Web para el Problema de la Mochila
 * Interfaz con el módulo WASM compilado con Emscripten
 */

let app; // Variable global para la aplicación

class KnapsackApp {
  constructor() {
    this.items = [
      { weight: 12, value: 4 },
      { weight: 2, value: 2 },
      { weight: 1, value: 1 },
      { weight: 1, value: 2 },
      { weight: 4, value: 10 },
    ];

    this.wasmReady = false;
    // Funciones para cada algoritmo
    this.solveRecursive = null;
    this.solveMemo = null;
    this.solveDp = null;
    this.solveOptimized = null;

    this.setupEventListeners();
    this.loadExample();
  }

  setupEventListeners() {
    document
      .getElementById('maxWeight')
      .addEventListener('change', () => this.render());
    document
      .getElementById('algorithm')
      .addEventListener('change', () => this.render());
    document
      .getElementById('addItemBtn')
      .addEventListener('click', () => this.addItem());
    document
      .getElementById('solveBtn')
      .addEventListener('click', () => this.solve());
    document
      .getElementById('exampleBtn')
      .addEventListener('click', () => this.loadExample());
    document
      .getElementById('clearBtn')
      .addEventListener('click', () => this.clear());
  }

  addItem() {
    this.items.push({ weight: 1, value: 1 });
    this.render();
  }

  removeItem(index) {
    this.items.splice(index, 1);
    this.render();
  }

  updateItem(index, field, value) {
    const val = parseInt(value) || 0;
    if (field === 'weight') {
      this.items[index].weight = Math.min(Math.max(val, 1), 100);
    } else if (field === 'value') {
      this.items[index].value = Math.min(Math.max(val, 1), 100);
    }
    this.render();
  }

  loadExample() {
    this.items = [
      { weight: 12, value: 4 },
      { weight: 2, value: 2 },
      { weight: 1, value: 1 },
      { weight: 1, value: 2 },
      { weight: 4, value: 10 },
    ];
    document.getElementById('maxWeight').value = 15;
    this.render();
    this.clearResult();
  }

  clear() {
    this.items = [];
    document.getElementById('maxWeight').value = 10;
    this.render();
    this.clearResult();
  }

  render() {
    const itemsList = document.getElementById('itemsList');
    itemsList.innerHTML = '';

    this.items.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'item-input';
      div.innerHTML = `
                <input type="number" min="1" max="100" value="${item.weight}" 
                    placeholder="Peso" 
                    onchange="app.updateItem(${index}, 'weight', this.value)">
                <input type="number" min="1" max="100" value="${item.value}" 
                    placeholder="Valor" 
                    onchange="app.updateItem(${index}, 'value', this.value)">
                <button onclick="app.removeItem(${index})">✕</button>
            `;
      itemsList.appendChild(div);
    });

    // Mostrar mensaje si no hay items
    if (this.items.length === 0) {
      const p = document.createElement('p');
      p.style.color = '#999';
      p.textContent = 'No hay items. Agrega uno con el botón arriba.';
      itemsList.appendChild(p);
    }
  }

  clearResult() {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML =
      '<p class="placeholder">Los resultados aparecerán aquí...</p>';
    resultDiv.classList.remove('success');
  }

  validate() {
    if (this.items.length === 0) {
      this.showError('Por favor, agrega al menos un item.');
      return false;
    }

    const maxWeight = parseInt(document.getElementById('maxWeight').value);
    if (isNaN(maxWeight) || maxWeight < 1 || maxWeight > 100) {
      this.showError('Peso máximo debe estar entre 1 y 100.');
      return false;
    }

    for (let item of this.items) {
      if (
        item.weight < 1 ||
        item.weight > 100 ||
        item.value < 1 ||
        item.value > 100
      ) {
        this.showError(
          'Todos los items deben tener peso y valor entre 1 y 100.',
        );
        return false;
      }
    }

    return true;
  }

  findSelectedItems(maxWeight, maxValue) {
    const n = this.items.length;
    const weights = this.items.map((item) => item.weight);
    const values = this.items.map((item) => item.value);
    const dp = Array(n + 1)
      .fill(null)
      .map(() => Array(maxWeight + 1).fill(0));

    for (let i = 1; i <= n; i++) {
      for (let w = 1; w <= maxWeight; w++) {
        if (weights[i - 1] <= w)
          dp[i][w] = Math.max(
            values[i - 1] + dp[i - 1][w - weights[i - 1]],
            dp[i - 1][w],
          );
        else dp[i][w] = dp[i - 1][w];
      }
    }

    const selected = [];
    let w = maxWeight;
    for (let i = n; i > 0 && w > 0; i--) {
      if (dp[i][w] !== dp[i - 1][w]) {
        selected.unshift(i - 1);
        w -= weights[i - 1];
      }
    }
    return selected;
  }

  async solve() {
    if (!this.validate()) return;

    // Esperar a que el WASM esté listo
    if (!this.wasmReady) {
      this.showError(
        'El módulo WASM aún no está cargado. Intenta de nuevo en un segundo.',
      );
      return;
    }

    const maxWeight = parseInt(document.getElementById('maxWeight').value);
    const algorithm = document.getElementById('algorithm').value;
    const n = this.items.length;

    // Asignar memoria en WASM para pesos y valores
    const weightsPtr = Module._malloc(n * 4); // 4 bytes por int
    const valuesPtr = Module._malloc(n * 4);

    try {
      // Crear views en la memoria de WASM
      const weightsData = new Int32Array(this.items.map((i) => i.weight));
      const valuesData = new Int32Array(this.items.map((i) => i.value));

      Module.HEAPU32.set(weightsData, weightsPtr >> 2);
      Module.HEAPU32.set(valuesData, valuesPtr >> 2);

      // Obtener la función según el algoritmo seleccionado
      let solveFunc;
      let algorithmName;

      switch (algorithm) {
        case 'recursive':
          solveFunc = this.solveRecursive;
          algorithmName = 'Recursión (Fuerza Bruta)';
          break;
        case 'memo':
          solveFunc = this.solveMemo;
          algorithmName = 'Memoización (Top-Down)';
          break;
        case 'dp':
          solveFunc = this.solveDp;
          algorithmName = 'DP Bottom-Up';
          break;
        case 'optimized':
          solveFunc = this.solveOptimized;
          algorithmName = 'DP Optimizado';
          break;
      }

      // Medir tiempo de ejecución
      const startTime = performance.now();

      // Llamar la función WASM con punteros directos
      const resultValue = solveFunc(n, weightsPtr, valuesPtr, maxWeight);

      const endTime = performance.now();
      const executionTime = (endTime - startTime).toFixed(3);

      const selectedIndices = this.findSelectedItems(maxWeight, resultValue);

      // Mostrar resultado
      this.displayResult(
        resultValue,
        maxWeight,
        algorithmName,
        executionTime,
        selectedIndices,
      );
    } catch (error) {
      console.error('Error al resolver:', error);
      this.showError('Error al resolver el problema: ' + error.message);
    } finally {
      // Liberar memoria
      Module._free(weightsPtr);
      Module._free(valuesPtr);
    }
  }

  displayResult(
    maxValue,
    maxWeight,
    algorithmName,
    executionTime,
    selectedIndices,
  ) {
    const resultDiv = document.getElementById('result');
    resultDiv.classList.add('success');
    let totalWeight = 0;
    selectedIndices.forEach((idx) => {
      totalWeight += this.items[idx].weight;
    });

    let html = `
            <div class="success-message">✓ Solución encontrada correctamente</div>
            <table class="result-table">
                <tr>
                    <th>Métrica</th>
                    <th>Valor</th>
                </tr>
                <tr>
                    <td>Algoritmo Usado</td>
                    <td><strong>${algorithmName}</strong></td>
                </tr>
                <tr>
                    <td>Valor Máximo</td>
                    <td><strong>${maxValue}</strong></td>
                </tr>
                <tr>
                  <td>Peso Total</td>
                  <td>${totalWeight} / ${maxWeight}</td>
                </tr>
                <tr>
                    <td>Tiempo de Ejecución</td>
                    <td><strong>${executionTime} ms</strong></td>
                </tr>
            </table>
            <h3 style="margin-top:20px">Items en la Mochila:</h3>
            <table class="result-table">
              <tr><th>#</th><th>Peso</th><th>Valor</th></tr>
              ${selectedIndices.map((idx, i) => `<tr><td>${i + 1}</td><td>${this.items[idx].weight}</td><td>${this.items[idx].value}</td></tr>`).join('')}
            </table>
        `;

    resultDiv.innerHTML = html;
  }

  showError(message) {
    const resultDiv = document.getElementById('result');
    resultDiv.classList.remove('success');
    resultDiv.innerHTML = `<div class="error">❌ ${message}</div>`;
  }
}

// Verificar si Module está disponible (lo proporciona Emscripten)
if (typeof Module === 'undefined') {
  window.Module = {};
}

Module.onRuntimeInitialized = function () {
  console.log('✓ Módulo WASM cargado exitosamente');

  // Cargar las 4 funciones de resolución
  // Firma en C++: int solve_X(int n, int* wt, int* val, int W)
  // Los punteros se pasan como números (obtenemos punteros de malloc)
  if (typeof Module.cwrap === 'function') {
    app.solveRecursive = Module.cwrap('solve_recursive', 'number', [
      'number',
      'number',
      'number',
      'number',
    ]);
    app.solveMemo = Module.cwrap('solve_memo', 'number', [
      'number',
      'number',
      'number',
      'number',
    ]);
    app.solveDp = Module.cwrap('solve_dp', 'number', [
      'number',
      'number',
      'number',
      'number',
    ]);
    app.solveOptimized = Module.cwrap('solve_optimized', 'number', [
      'number',
      'number',
      'number',
      'number',
    ]);

    app.wasmReady = true;
    console.log('✓ Todas las funciones WASM están listas');
    console.log('  - solve_recursive (Recursión)');
    console.log('  - solve_memo (Memoización)');
    console.log('  - solve_dp (DP Bottom-Up)');
    console.log('  - solve_optimized (DP Optimizado)');
  } else {
    console.error('cwrap no disponible');
  }

  if (!app) {
    app = new KnapsackApp();
  }
};

// Inicializar si el módulo ya está cargado
document.addEventListener('DOMContentLoaded', function () {
  setTimeout(() => {
    if (!app) {
      app = new KnapsackApp();
    }
  }, 100);
});
