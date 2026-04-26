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
    this.solveCpp = null;

    this.setupEventListeners();
    this.loadExample();
  }

  setupEventListeners() {
    document
      .getElementById('maxWeight')
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

  async solve() {
    if (!this.validate()) return;

    try {
      // Esperar a que el WASM esté listo
      if (!this.wasmReady) {
        this.showError(
          'El módulo WASM aún no está cargado. Intenta de nuevo en un segundo.',
        );
        return;
      }

      const maxWeight = parseInt(document.getElementById('maxWeight').value);
      const n = this.items.length;

      // Llamar la función (con valores dummy por ahora)
      const resultPtr = this.solveCpp(0, 0, n, maxWeight);

      // Leer los resultados desde la memoria WASM
      const resultHeap = new Uint32Array(
        Module.HEAPU32.buffer,
        resultPtr,
        n + 3,
      );
      const totalValue = resultHeap[0];
      const totalWeight = resultHeap[1];
      const count = resultHeap[2];

      const selectedItems = [];
      for (let i = 0; i < count; i++) {
        selectedItems.push(resultHeap[3 + i] - 1); // Convertir a 0-based
      }

      this.displayResult(selectedItems, totalValue, totalWeight);
    } catch (error) {
      console.error('Error al resolver:', error);
      this.showError('Error al resolver el problema: ' + error.message);
    }
  }

  displayResult(selectedItems, totalValue, totalWeight) {
    const resultDiv = document.getElementById('result');
    resultDiv.classList.add('success');

    let html = `
            <div class="success-message">✓ Solución encontrada correctamente</div>
            <table class="result-table">
                <tr>
                    <th>Métrica</th>
                    <th>Valor</th>
                </tr>
                <tr>
                    <td>Valor Total</td>
                    <td><strong>${totalValue}</strong></td>
                </tr>
                <tr>
                    <td>Peso Total</td>
                    <td><strong>${totalWeight}</strong></td>
                </tr>
                <tr>
                    <td>Items Seleccionados</td>
                    <td><strong>${selectedItems.length}</strong></td>
                </tr>
            </table>
            <div class="solution-items">
                <h3>Items en la Solución:</h3>
                <div class="items-selected">
        `;

    if (selectedItems.length === 0) {
      html += '<p style="color: #999;">No se seleccionaron items</p>';
    } else {
      selectedItems.forEach((itemIdx, pos) => {
        const item = this.items[itemIdx];
        html += `
                    <div class="item-badge">
                        Item ${itemIdx + 1} <br>
                        P: ${item.weight} V: ${item.value}
                    </div>
                `;
      });
    }

    html += `
                </div>
            </div>
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

  // Crear referencia a la función C
  if (typeof Module.cwrap === 'function') {
    app.solveCpp = Module.cwrap('solve_knapsack', 'number', [
      'number',
      'number',
      'number',
      'number',
    ]);
    app.wasmReady = true;
    console.log('✓ Función WASM lista');
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
