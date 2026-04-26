#!/bin/bash

# Script para compilar el código C/C++ a WebAssembly usando Emscripten

set -e

echo "🔨 Compilando C/C++ a WebAssembly..."

# Verificar que emcc está disponible
if ! command -v emcc &> /dev/null; then
    echo "❌ Error: emcc (Emscripten Compiler) no se encuentra en el PATH"
    echo "Por favor, instala Emscripten: https://emscripten.org/docs/getting_started/index.html"
    exit 1
fi

echo "✓ Emscripten compiler encontrado"

# Crear directorio de salida si no existe
mkdir -p wasm
mkdir -p web/wasm

# Compilar el código C/C++ a WASM
emcc cpp/knapsack.cpp \
    -o wasm/knapsack.js \
    -s WASM=1 \
    -s EXPORTED_FUNCTIONS='["_solve_knapsack"]' \
    -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap", "HEAPU32"]' \
    -O3

# Copiar archivos compilados a la carpeta web
cp wasm/knapsack.js web/wasm/knapsack.js
cp wasm/knapsack.wasm web/wasm/knapsack.wasm

echo "✅ Compilación completada exitosamente!"
echo "📦 Archivos generados:"
echo "   - wasm/knapsack.js"
echo "   - wasm/knapsack.wasm"
echo "   - web/wasm/knapsack.js (para el servidor)"
echo "   - web/wasm/knapsack.wasm (para el servidor)"
