// Naive Approach: Iterative
// Time Complexity: O(n)
// because we have to loop through all numbers from 1 to n
// Space Complexity: O(1)
// because we are using a constant amount of space
// not the best approach
function sum_to_n_a(n: number): number {
  let sum = 0;

  // iterate from 1 to n and accumulate the sum
  // 1 + 2 + 3 + ... + n
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

console.log("sum_to_n_a(5): ", sum_to_n_a(5)); // Output: 15

// Recursive Approach
// Time Complexity: O(n)
// because we have to make n recursive calls
// Space Complexity: O(n) due to call stack
// because each recursive call adds a new layer to the call stack
// not the best approach
function sum_to_n_b(n: number): number {
  // base case, we stop recursion when n is 1
	if (n === 1) {
    return 1;
  }

  // we are using recursion here utilizing the call stack
  // sum_to_n_b(n) = n + sum_to_n_b(n-1)
  return n + sum_to_n_b(n - 1);
}

console.log("sum_to_n_b(6): ", sum_to_n_b(6)); // Output: 21

// Mathematical Formula Approach
// Time Complexity: O(1)
// because it uses a direct formula without loop or using callstack, we got the result straight away
// Space Complexity: O(1)
// because we are using a constant amount of space
// The best approach out of the three
function sum_to_n_c(n: number): number {

  // we are using the formula n(n+1)/2 to calculate the sum directly
	return (n * (n + 1)) / 2;
}

console.log("sum_to_n_c(7): ", sum_to_n_c(7)); // Output: 28
