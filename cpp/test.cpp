#include <iostream>
#include <vector>
using namespace std;

// Incluir los algoritmos
#include "knapsack_solvers.cpp"

void runTest(const char* name, int result, int expected) {
    if (result == expected) {
        cout << "✓ " << name << " PASÓ (resultado: " << result << ")" << endl;
    } else {
        cout << "✗ " << name << " FALLÓ (esperado: " << expected << ", obtuvo: " << result << ")" << endl;
    }
}

int main() {
    cout << "=== PRUEBAS DE ALGORITMOS DE MOCHILA ===" << endl << endl;

    // Caso de prueba 1: Ejemplo básico
    cout << "--- Test 1: Ejemplo Básico ---" << endl;
    int wt1[] = {2, 3, 4, 5};
    int val1[] = {3, 4, 5, 6};
    int W1 = 5;
    int n1 = 4;
    int expected1 = 7;  // Items 0+1: peso=5, valor=3+4=7

    runTest("Recursivo", knapsack_recursive(W1, wt1, val1, n1), expected1);
    
    // Reinicializar memo para el siguiente test
    for (int i = 0; i <= 100; i++)
        for (int j = 0; j <= 100; j++)
            memo[i][j] = -1;
    runTest("Memoización", knapsack_memo(W1, wt1, val1, n1), expected1);
    
    runTest("DP Bottom-Up", knapsack_dp(W1, wt1, val1, n1), expected1);
    runTest("DP Optimizado", knapsack_optimized(W1, wt1, val1, n1), expected1);

    cout << endl;

    // Caso de prueba 2: Del proyecto
    cout << "--- Test 2: Ejemplo del Proyecto ---" << endl;
    int wt2[] = {12, 2, 1, 1, 4};
    int val2[] = {4, 2, 1, 2, 10};
    int W2 = 15;
    int n2 = 5;
    int expected2 = 15;  // Items 1+2+3+4: peso=8, valor=2+1+2+10=15

    runTest("Recursivo", knapsack_recursive(W2, wt2, val2, n2), expected2);
    
    for (int i = 0; i <= 100; i++)
        for (int j = 0; j <= 100; j++)
            memo[i][j] = -1;
    runTest("Memoización", knapsack_memo(W2, wt2, val2, n2), expected2);
    
    runTest("DP Bottom-Up", knapsack_dp(W2, wt2, val2, n2), expected2);
    runTest("DP Optimizado", knapsack_optimized(W2, wt2, val2, n2), expected2);

    cout << endl;

    // Caso de prueba 3: Sin items (edge case)
    cout << "--- Test 3: Edge Case (W=0) ---" << endl;
    int wt3[] = {1, 2};
    int val3[] = {5, 10};
    int W3 = 0;
    int n3 = 2;
    int expected3 = 0;

    runTest("Recursivo", knapsack_recursive(W3, wt3, val3, n3), expected3);
    
    for (int i = 0; i <= 100; i++)
        for (int j = 0; j <= 100; j++)
            memo[i][j] = -1;
    runTest("Memoización", knapsack_memo(W3, wt3, val3, n3), expected3);
    
    runTest("DP Bottom-Up", knapsack_dp(W3, wt3, val3, n3), expected3);
    runTest("DP Optimizado", knapsack_optimized(W3, wt3, val3, n3), expected3);

    cout << endl << "=== PRUEBAS COMPLETADAS ===" << endl;
    return 0;
}
