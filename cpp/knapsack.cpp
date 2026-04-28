#include <emscripten/bind.h>
using namespace emscripten;

#include <iostream>
#include <vector>
using namespace std;

// Recursive function to solve 0/1 Knapsack problem
int knapsackRecursive(vector<int>& weight,
                      vector<int>& value, int W, int n)
{
    // Base case: no items left or capacity is 0
    if (n == 0 || W == 0)
        return 0;

    // If weight of the nth item is more than knapsack
    // capacity W, it cannot be included
    if (weight[n - 1] > W)
        return knapsackRecursive(weight, value, W, n - 1);

    // Return the maximum of two cases: (1) nth item
    // included (2) not included
    return max(value[n - 1]
                   + knapsackRecursive(weight, value,
                                       W - weight[n - 1],
                                       n - 1),
               knapsackRecursive(weight, value, W, n - 1));
}

// Function to solve 0/1 Knapsack problem using Memoization
int knapsackMemoization(vector<int>& weight,
                        vector<int>& value, int W, int n,
                        vector<vector<int> >& memo)
{
    // Base case: no items left or capacity is 0
    if (n == 0 || W == 0)
        return 0;

    // Check if the result is already in the memo table
    if (memo[n][W] != -1)
        return memo[n][W];

    // If weight of the nth item is more than knapsack
    // capacity W, it cannot be included
    if (weight[n - 1] > W) {
        memo[n][W] = knapsackMemoization(weight, value, W,
                                         n - 1, memo);
        return memo[n][W];
    }

    // Return the maximum of two cases: (1) nth item
    // included (2) not included
    memo[n][W] = max(
        value[n - 1]
            + knapsackMemoization(weight, value,
                                  W - weight[n - 1], n - 1,
                                  memo),
        knapsackMemoization(weight, value, W, n - 1, memo));
    return memo[n][W];
}

// Function to solve 0/1 Knapsack problem using Bottom-up
// approach
int knapsackBottomUp(vector<int>& weight,
                     vector<int>& value, int W)
{
    int N = weight.size();
    // Create a 2D vector to store the maximum value that
    // can be obtained dp[i][w] represents the maximum value
    // that can be obtained with the first i items and
    // capacity w
    vector<vector<int> > dp(N + 1, vector<int>(W + 1, 0));

    // Iterate over each item
    for (int i = 1; i <= N; ++i) {
        // Iterate over each capacity from 1 to W
        for (int w = 1; w <= W; ++w) {
            // Check if the weight of the current item is
            // less than or equal to the current capacity
            if (weight[i - 1] <= w) {
                // Max value by including the current item
                // or excluding it
                dp[i][w] = max(dp[i - 1][w],
                               dp[i - 1][w - weight[i - 1]]
                                   + value[i - 1]);
            }
            else {
                // If current item's weight is more than the
                // current capacity, exclude it
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    // Return the maximum value that can be obtained with
    // the given capacity W
    return dp[N][W];
}

// Function to solve 0/1 Knapsack problem with optimized
// space
int knapsackOptimized(vector<int>& weight,
                      vector<int>& value, int W)
{
    int N = weight.size();
    // Create a 1D vector to store the maximum value that
    // can be obtained for each weight capacity
    vector<int> dp(W + 1, 0);

    // Iterate over each item
    for (int i = 0; i < N; ++i) {
        // Iterate over each capacity from W to the weight
        // of the current item in reverse order
        for (int w = W; w >= weight[i]; --w) {
            // Update the dp array with the maximum value by
            // including the current item
            dp[w]
                = max(dp[w], dp[w - weight[i]] + value[i]);
        }
    }

    // Return the maximum value that can be obtained with
    // the given capacity W
    return dp[W];
}

// ---------------- WRAPPERS ----------------

// Recursive
int solve_recursive(vector<int> weight, vector<int> value, int W) {
    return knapsackRecursive(weight, value, W, weight.size());
}

// Memo
int solve_memo(vector<int> weight, vector<int> value, int W) {
    int n = weight.size();
    vector<vector<int>> memo(n + 1, vector<int>(W + 1, -1));
    return knapsackMemoization(weight, value, W, n, memo);
}

// Bottom-up
int solve_dp(vector<int> weight, vector<int> value, int W) {
    return knapsackBottomUp(weight, value, W);
}

// Optimized
int solve_optimized(vector<int> weight, vector<int> value, int W) {
    return knapsackOptimized(weight, value, W);
}

EMSCRIPTEN_BINDINGS(knapsack_module) {
    register_vector<int>("VectorInt");

    emscripten::function("solve_recursive", &solve_recursive);
    emscripten::function("solve_memo", &solve_memo);
    emscripten::function("solve_dp", &solve_dp);
    emscripten::function("solve_optimized", &solve_optimized);
}