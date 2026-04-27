# Knapsack Problem - WebAssembly Implementation

Solución del problema de la mochila (knapsack) implementada en C/C++ y compilada a WebAssembly para ser ejecutada en una aplicación web.

## 📋 Descripción

Este proyecto implementa un algoritmo para resolver el problema de la mochila (0/1 Knapsack Problem) de forma eficiente. El código está escrito en C/C++, compilado a WebAssembly (WASM) usando Emscripten, e integrado en una aplicación web frontend.

### El Problema

Dado un conjunto de `n` paquetes (n ≤ 100), donde cada paquete tiene:

- Peso: W[i] ≤ 100
- Valor: V[i] ≤ 100

Un ladrón necesita seleccionar qué paquetes llevar en su mochila para maximizar el valor total sin exceder un peso máximo M (M ≤ 100).

**Restricción**: No se puede tomar partes de un ítem ni repetir items.

### Ejemplo

```
Pesos:        [12, 2, 1, 1, 4]
Valores:      [4,  2, 1, 2, 10]
Peso Máximo:  15

Solución: Items [5, 4, 3, 2]
Peso Total: 8
Valor Total: 15
```

## 📁 Estructura del Proyecto

```
.
├── cpp/                    # Código fuente C/C++
│   ├── knapsack.cpp       # Implementación del algoritmo
│   └── knapsack.h         # Header del algoritmo
├── wasm/                  # Binarios compilados a WASM
│   ├── knapsack.js        # Glue code generado por Emscripten
│   ├── knapsack.wasm      # Módulo WebAssembly
│   └── knapsack.worker.js # Web worker (opcional)
├── web/                   # Aplicación web frontend
│   ├── index.html         # Página principal
│   ├── app.js             # Lógica de la aplicación
│   └── style.css          # Estilos
├── docs/                  # Documentación
│   ├── SOURCES.md         # Referencias del código C/C++
│   └── SETUP.md           # Instrucciones de setup
└── README.md
```

## 🚀 Requisitos Previos

- Node.js (v16+)
- Emscripten (para compilar C/C++ a WASM)
- Python 3 (requerido por Emscripten)

### Instalación de Emscripten

```bash
# Clonar el repositorio de Emscripten
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk

# Instalar la última versión
./emsdk install latest
./emsdk activate latest

# Agregar al PATH (bash)
source ./emsdk_env.sh
```

## 🔨 Compilación

Para compilar el código C/C++ a WebAssembly:

```bash
# Dar permisos de ejecución al script
chmod +x compile.sh

# Ejecutar la compilación
./compile.sh
```

Esto generará los archivos necesarios en la carpeta `wasm/`.

## ✅ Testing (C++ sin WASM)

Para probar los algoritmos C++ directamente sin WASM ni JavaScript:

```bash
# Navegar a la carpeta cpp
cd cpp

# Compilar y ejecutar las pruebas
g++ -o test test.cpp && ./test
```

Las pruebas verificarán que los 4 algoritmos (recursivo, memoización, DP, DP optimizado) den resultados correctos en diferentes casos:

- Ejemplo básico
- Ejemplo del proyecto
- Edge cases (W=0)

**Nota**: El binario `test` se ignora en git automáticamente

## 🌐 Ejecución

Para ejecutar la aplicación web, necesitas un servidor local (Emscripten genera archivos que requieren CORS):

```bash
# Opción 1: Python 3
cd web
python3 -m http.server 8000

# Opción 2: Node.js (http-server)
cd web
npx http-server

# Opción 3: Live Server en VS Code
# - Instala la extensión "Live Server"
# - Click derecho en index.html → "Open with Live Server"
```

Luego accede a `http://localhost:8000`

## 📚 Fuentes

El código C/C++ usado como base se encuentra documentado en [docs/SOURCES.md](docs/SOURCES.md).

## 👥 Integrantes del Grupo

- [Nombre del integrante 1]
- [Nombre del integrante 2]
- [Nombre del integrante 3]

## 📝 Notas

- El archivo [docs/SETUP.md](docs/SETUP.md) contiene instrucciones detalladas de configuración
- Para modificar el algoritmo, edita `cpp/knapsack.cpp` y recompila
- El frontend consume la funcionalidad WASM a través de la API generada por Emscripten

## 📄 Licencia

Educativo - 2026
