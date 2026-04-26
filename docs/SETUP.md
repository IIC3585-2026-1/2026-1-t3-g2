# Guía de Configuración

Instrucciones paso a paso para configurar y ejecutar el proyecto.

## 1. Requisitos Previos

### Instalaciones Requeridas

- **Node.js** (v16 o superior)

  ```bash
  # En Ubuntu/Debian
  sudo apt update && sudo apt install nodejs npm

  # Verificar instalación
  node --version
  npm --version
  ```

- **Python 3** (necesario para Emscripten)

  ```bash
  sudo apt install python3 python3-pip
  ```

- **Git** (para clonar repositorios)
  ```bash
  sudo apt install git
  ```

## 2. Instalación de Emscripten

Emscripten es el compilador que convierte C/C++ a WebAssembly.

### Opción A: Instalación Automática (Recomendado)

```bash
# Crear directorio para Emscripten
mkdir -p ~/dev
cd ~/dev

# Clonar el repositorio emsdk
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk

# Instalar la última versión
./emsdk install latest
./emsdk activate latest

# Agregar al PATH (bash)
echo 'source ~/dev/emsdk/emsdk_env.sh' >> ~/.bashrc
source ~/.bashrc

# Verificar instalación
emcc --version
```

### Opción B: Usando apt (Ubuntu/Debian)

```bash
sudo apt install emscripten
which emcc
```

## 3. Configuración del Proyecto

```bash
# Ir al directorio del proyecto
cd /home/vicho1950/Avanzada/2026-1-t3-g2

# Dar permisos al script de compilación
chmod +x compile.sh
```

## 4. Compilación del Código C/C++

```bash
# Compilar a WebAssembly
./compile.sh

# Los archivos generados estarán en la carpeta 'wasm/'
# - knapsack.js
# - knapsack.wasm
```

### Solución de Problemas en la Compilación

**Problema:** "emcc: command not found"

- Solución: Ejecutar `source ~/dev/emsdk/emsdk_env.sh` o reiniciar la terminal

**Problema:** Error de permisos

- Solución: `chmod +x compile.sh`

**Problema:** Otros errores de compilación

- Solución: Verificar que C++ esté instalado: `apt install build-essential`

## 5. Ejecutar la Aplicación Web

Necesitas un servidor web local para ejecutar la aplicación (no funciona con `file://` por CORS).

### Opción A: Python HTTP Server (Recomendado)

```bash
cd web
python3 -m http.server 8000
```

Luego accede a: **http://localhost:8000**

### Opción B: Node.js HTTP Server

```bash
# Instalar http-server
npm install -g http-server

# Ejecutar en la carpeta web
cd web
http-server -p 8000
```

Luego accede a: **http://localhost:8000**

### Opción C: VS Code Live Server

1. Instala la extensión "Live Server" en VS Code
2. Click derecho en `web/index.html`
3. Selecciona "Open with Live Server"

## 6. Estructura de Directorios

```
/home/vicho1950/Avanzada/2026-1-t3-g2/
├── cpp/                    # Código fuente C/C++
│   └── knapsack.cpp
├── wasm/                  # Código compilado
│   ├── knapsack.js
│   └── knapsack.wasm
├── web/                   # Aplicación web
│   ├── index.html
│   ├── app.js
│   └── style.css
├── docs/                  # Documentación
│   ├── SOURCES.md
│   └── SETUP.md
├── compile.sh             # Script de compilación
└── README.md
```

## 7. Flujo de Desarrollo

1. **Editar el código C/C++** en `cpp/knapsack.cpp`
2. **Compilar a WASM**: `./compile.sh`
3. **Probar en el navegador**: Refresh de la página (Ctrl+Shift+R)
4. **Modificar el frontend** en `web/` según sea necesario

## 8. Pruebas

El proyecto incluye un ejemplo predeterminado que puedes usar para probar:

**Ejemplo de Entrada:**

- Pesos: [12, 2, 1, 1, 4]
- Valores: [4, 2, 1, 2, 10]
- Peso Máximo: 15

**Salida Esperada:**

- Items Seleccionados: 2, 3, 4, 5
- Peso Total: 8
- Valor Total: 15

## 9. Troubleshooting

| Problema                   | Solución                                                       |
| -------------------------- | -------------------------------------------------------------- |
| Módulo WASM no carga       | Verifica que `knapsack.wasm` esté en la carpeta `wasm/`        |
| Error "Cannot find module" | Verifica que `knapsack.js` esté en la carpeta `wasm/`          |
| Puerto 8000 ya en uso      | Usa otro puerto: `python -m http.server 8001`                  |
| CORS error                 | Asegúrate de usar un servidor web, no `file://`                |
| Emscripten no compila      | Verifica que C++ esté instalado: `apt install build-essential` |

## 10. Recursos Útiles

- [Documentación Emscripten](https://emscripten.org/docs/)
- [WebAssembly MDN](https://developer.mozilla.org/es/docs/WebAssembly)
- [Problema de la Mochila](https://es.wikipedia.org/wiki/Problema_de_la_mochila)
