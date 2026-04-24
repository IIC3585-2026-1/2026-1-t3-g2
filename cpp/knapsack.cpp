/*
 * Knapsack Problem - 0/1 Knapsack Solution
 * Versión Simple para pruebas
 */

#include <stdio.h>
#include <string.h>

// Límites máximos del problema
#define MAX_ITEMS 100
#define MAX_WEIGHT 100

// Array global para almacenar el resultado
int output[MAX_ITEMS + 3];

/*
 * Algoritmo simple: devuelve todos los items en el mismo orden
 * Solo para verificar que la comunicación WASM funciona
 */
extern "C" {
    int* solve_knapsack(int weights, int values, int n, int max_weight) {
        output[0] = 100;  // valor total
        output[1] = 50;   // peso total
        output[2] = 2;    // cantidad de items
        output[3] = 1;    // item 1
        output[4] = 2;    // item 2
        
        return output;
    }
}
