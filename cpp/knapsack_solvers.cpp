#include <vector>
using namespace std;

// ------------------ RECURSIÓN (FUERZA BRUTA) ------------------
int knapsack_recursive(int W, int wt[], int val[], int n) {
    if (n == 0 || W == 0)
        return 0;

    if (wt[n - 1] > W)
        return knapsack_recursive(W, wt, val, n - 1);

    int include = val[n - 1] + knapsack_recursive(W - wt[n - 1], wt, val, n - 1);
    int exclude = knapsack_recursive(W, wt, val, n - 1);

    return (include > exclude) ? include : exclude;
}

// ------------------ MEMOIZACIÓN TOP-DOWN ------------------
int memo[101][101];

int knapsack_memo(int W, int wt[], int val[], int n) {
    if (n == 0 || W == 0)
        return 0;

    if (memo[n][W] != -1)
        return memo[n][W];

    if (wt[n - 1] > W)
        return memo[n][W] = knapsack_memo(W, wt, val, n - 1);

    int include = val[n - 1] + knapsack_memo(W - wt[n - 1], wt, val, n - 1);
    int exclude = knapsack_memo(W, wt, val, n - 1);

    return memo[n][W] = (include > exclude) ? include : exclude;
}

// ------------------ TABULACIÓN BOTTOM-UP ------------------
int knapsack_dp(int W, int wt[], int val[], int n) {
    int dp[101][101] = {0};

    for (int i = 1; i <= n; i++) {
        for (int w = 1; w <= W; w++) {
            if (wt[i - 1] <= w) {
                int include = val[i - 1] + dp[i - 1][w - wt[i - 1]];
                int exclude = dp[i - 1][w];
                dp[i][w] = (include > exclude) ? include : exclude;
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    return dp[n][W];
}

// ------------------ OPTIMIZADO EN ESPACIO ------------------
int knapsack_optimized(int W, int wt[], int val[], int n) {
    int dp[101] = {0};

    for (int i = 0; i < n; i++) {
        for (int w = W; w >= wt[i]; w--) {
            int candidate = dp[w - wt[i]] + val[i];
            if (candidate > dp[w])
                dp[w] = candidate;
        }
    }

    return dp[W];
}

// ------------------ WRAPPERS PARA USAR WASM ------------------

extern "C" {
int solve_recursive(int n, int* wt, int* val, int W) {
    return knapsack_recursive(W, wt, val, n);
}
int solve_memo(int n, int* wt, int* val, int W) {
    // inicializar memo
    for (int i = 0; i <= 100; i++)
        for (int j = 0; j <= 100; j++)
            memo[i][j] = -1;

    return knapsack_memo(W, wt, val, n);
}
int solve_dp(int n, int* wt, int* val, int W) {
    return knapsack_dp(W, wt, val, n);
}
int solve_optimized(int n, int* wt, int* val, int W) {
    return knapsack_optimized(W, wt, val, n);
}
}

// REFERENCIAS:
// Algoritmos de GeeksforGeeks: https://www.geeksforgeeks.org/cpp/cpp-program-to-solve-the-0-1-knapsack-problem/