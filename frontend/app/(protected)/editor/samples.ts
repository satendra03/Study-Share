export interface CodeSample {
  id: string;
  title: string;
  description: string;
  language: string;
  filename: string;
  code: string;
}

export interface SampleCategory {
  id: string;
  label: string;
  samples: CodeSample[];
}

export const SAMPLE_CATEGORIES: SampleCategory[] = [
  {
    id: "sorting",
    label: "Sorting Algorithms",
    samples: [
      {
        id: "bubble-sort",
        title: "Bubble Sort",
        description: "O(n²) comparison-based sort",
        language: "python",
        filename: "bubble_sort.py",
        code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

arr = [64, 34, 25, 12, 22, 11, 90]
print("Original:", arr)
print("Sorted:  ", bubble_sort(arr))`,
      },
      {
        id: "merge-sort",
        title: "Merge Sort",
        description: "O(n log n) divide and conquer",
        language: "python",
        filename: "merge_sort.py",
        code: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

arr = [38, 27, 43, 3, 9, 82, 10]
print("Original:", arr)
print("Sorted:  ", merge_sort(arr))`,
      },
      {
        id: "quick-sort",
        title: "Quick Sort",
        description: "O(n log n) avg, in-place sort",
        language: "python",
        filename: "quick_sort.py",
        code: `def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)
    return arr

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

arr = [10, 80, 30, 90, 40, 50, 70]
print("Original:", arr)
print("Sorted:  ", quick_sort(arr))`,
      },
      {
        id: "insertion-sort",
        title: "Insertion Sort",
        description: "O(n²) efficient for small data",
        language: "python",
        filename: "insertion_sort.py",
        code: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr

arr = [12, 11, 13, 5, 6]
print("Original:", arr)
print("Sorted:  ", insertion_sort(arr))`,
      },
    ],
  },
  {
    id: "data-structures",
    label: "Data Structures",
    samples: [
      {
        id: "linked-list",
        title: "Linked List",
        description: "Singly linked list with traversal",
        language: "python",
        filename: "linked_list.py",
        code: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        cur = self.head
        while cur.next:
            cur = cur.next
        cur.next = new_node

    def prepend(self, data):
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node

    def delete(self, data):
        cur = self.head
        if cur and cur.data == data:
            self.head = cur.next
            return
        while cur and cur.next:
            if cur.next.data == data:
                cur.next = cur.next.next
                return
            cur = cur.next

    def display(self):
        elements = []
        cur = self.head
        while cur:
            elements.append(str(cur.data))
            cur = cur.next
        print(" -> ".join(elements))

ll = LinkedList()
ll.append(1); ll.append(2); ll.append(3)
ll.prepend(0)
ll.display()
ll.delete(2)
ll.display()`,
      },
      {
        id: "stack",
        title: "Stack",
        description: "LIFO — push, pop, peek",
        language: "python",
        filename: "stack.py",
        code: `class Stack:
    def __init__(self):
        self._items = []

    def push(self, item):
        self._items.append(item)

    def pop(self):
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self._items.pop()

    def peek(self):
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self._items[-1]

    def is_empty(self):
        return len(self._items) == 0

    def size(self):
        return len(self._items)

    def __str__(self):
        return str(self._items)

# Balanced parentheses checker using stack
def is_balanced(expr):
    stack = Stack()
    pairs = {')': '(', ']': '[', '}': '{'}
    for ch in expr:
        if ch in '([{':
            stack.push(ch)
        elif ch in ')]}':
            if stack.is_empty() or stack.pop() != pairs[ch]:
                return False
    return stack.is_empty()

s = Stack()
s.push(10); s.push(20); s.push(30)
print("Stack:", s)
print("Pop:", s.pop())
print("Peek:", s.peek())
print()
print(is_balanced("({[]})"), "← balanced")
print(is_balanced("({[})"),  "← not balanced")`,
      },
      {
        id: "queue",
        title: "Queue",
        description: "FIFO — enqueue, dequeue",
        language: "python",
        filename: "queue_ds.py",
        code: `from collections import deque

class Queue:
    def __init__(self):
        self._items = deque()

    def enqueue(self, item):
        self._items.append(item)

    def dequeue(self):
        if self.is_empty():
            raise IndexError("Queue is empty")
        return self._items.popleft()

    def peek(self):
        if self.is_empty():
            raise IndexError("Queue is empty")
        return self._items[0]

    def is_empty(self):
        return len(self._items) == 0

    def size(self):
        return len(self._items)

    def __str__(self):
        return str(list(self._items))

q = Queue()
q.enqueue("Alice"); q.enqueue("Bob"); q.enqueue("Charlie")
print("Queue:", q)
print("Dequeue:", q.dequeue())
print("Peek:", q.peek())
print("Size:", q.size())`,
      },
      {
        id: "bst",
        title: "Binary Search Tree",
        description: "Insert, search, inorder traversal",
        language: "python",
        filename: "bst.py",
        code: `class Node:
    def __init__(self, key):
        self.key = key
        self.left = self.right = None

class BST:
    def __init__(self):
        self.root = None

    def insert(self, key):
        self.root = self._insert(self.root, key)

    def _insert(self, root, key):
        if not root:
            return Node(key)
        if key < root.key:
            root.left = self._insert(root.left, key)
        elif key > root.key:
            root.right = self._insert(root.right, key)
        return root

    def search(self, key):
        return self._search(self.root, key)

    def _search(self, root, key):
        if not root or root.key == key:
            return root
        if key < root.key:
            return self._search(root.left, key)
        return self._search(root.right, key)

    def inorder(self):
        result = []
        self._inorder(self.root, result)
        return result

    def _inorder(self, root, result):
        if root:
            self._inorder(root.left, result)
            result.append(root.key)
            self._inorder(root.right, result)

bst = BST()
for val in [50, 30, 70, 20, 40, 60, 80]:
    bst.insert(val)

print("Inorder (sorted):", bst.inorder())
print("Search 40:", "Found" if bst.search(40) else "Not found")
print("Search 99:", "Found" if bst.search(99) else "Not found")`,
      },
      {
        id: "hash-table",
        title: "Hash Table",
        description: "Custom hash map with chaining",
        language: "python",
        filename: "hash_table.py",
        code: `class HashTable:
    def __init__(self, size=10):
        self.size = size
        self.table = [[] for _ in range(size)]

    def _hash(self, key):
        return hash(key) % self.size

    def set(self, key, value):
        h = self._hash(key)
        for i, (k, _) in enumerate(self.table[h]):
            if k == key:
                self.table[h][i] = (key, value)
                return
        self.table[h].append((key, value))

    def get(self, key):
        h = self._hash(key)
        for k, v in self.table[h]:
            if k == key:
                return v
        raise KeyError(key)

    def delete(self, key):
        h = self._hash(key)
        self.table[h] = [(k, v) for k, v in self.table[h] if k != key]

    def __str__(self):
        return str({k: v for bucket in self.table for k, v in bucket})

ht = HashTable()
ht.set("name", "Alice")
ht.set("age", 20)
ht.set("grade", "A")
print(ht)
print("name:", ht.get("name"))
ht.delete("age")
print("After delete:", ht)`,
      },
    ],
  },
  {
    id: "algorithms",
    label: "Search & Recursion",
    samples: [
      {
        id: "binary-search",
        title: "Binary Search",
        description: "O(log n) search on sorted array",
        language: "python",
        filename: "binary_search.py",
        code: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

def binary_search_recursive(arr, target, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low > high:
        return -1
    mid = (low + high) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search_recursive(arr, target, mid + 1, high)
    return binary_search_recursive(arr, target, low, mid - 1)

arr = list(range(0, 100, 5))  # [0, 5, 10, ..., 95]
print("Array:", arr)
print("Search 35 (iterative):", binary_search(arr, 35))
print("Search 35 (recursive):", binary_search_recursive(arr, 35))
print("Search 99 (not found):", binary_search(arr, 99))`,
      },
      {
        id: "fibonacci",
        title: "Fibonacci — 3 Ways",
        description: "Recursive, memoized, iterative",
        language: "python",
        filename: "fibonacci.py",
        code: `import time
from functools import lru_cache

# 1. Simple recursion — O(2^n)
def fib_recursive(n):
    if n <= 1:
        return n
    return fib_recursive(n - 1) + fib_recursive(n - 2)

# 2. Memoized (top-down DP) — O(n)
@lru_cache(maxsize=None)
def fib_memo(n):
    if n <= 1:
        return n
    return fib_memo(n - 1) + fib_memo(n - 2)

# 3. Iterative (bottom-up DP) — O(n), O(1) space
def fib_iter(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

n = 30
print(f"Fibonacci({n})")
print(f"  Recursive : {fib_recursive(n)}")
print(f"  Memoized  : {fib_memo(n)}")
print(f"  Iterative : {fib_iter(n)}")

print()
print("First 10:", [fib_iter(i) for i in range(10)])`,
      },
      {
        id: "tower-of-hanoi",
        title: "Tower of Hanoi",
        description: "Classic recursion puzzle",
        language: "python",
        filename: "hanoi.py",
        code: `def hanoi(n, source, destination, auxiliary):
    if n == 1:
        print(f"Move disk 1 from {source} → {destination}")
        return
    hanoi(n - 1, source, auxiliary, destination)
    print(f"Move disk {n} from {source} → {destination}")
    hanoi(n - 1, auxiliary, destination, source)

def count_moves(n):
    return 2**n - 1

disks = 3
print(f"Tower of Hanoi with {disks} disks:")
print(f"Minimum moves required: {count_moves(disks)}")
print()
hanoi(disks, 'A', 'C', 'B')`,
      },
    ],
  },
  {
    id: "math",
    label: "Mathematics",
    samples: [
      {
        id: "primes",
        title: "Sieve of Eratosthenes",
        description: "Find all primes up to N",
        language: "python",
        filename: "sieve.py",
        code: `def sieve_of_eratosthenes(limit):
    is_prime = [True] * (limit + 1)
    is_prime[0] = is_prime[1] = False
    for i in range(2, int(limit**0.5) + 1):
        if is_prime[i]:
            for j in range(i * i, limit + 1, i):
                is_prime[j] = False
    return [i for i, prime in enumerate(is_prime) if prime]

primes = sieve_of_eratosthenes(100)
print(f"Primes up to 100 ({len(primes)} total):")
print(primes)

# Check if a number is prime
def is_prime(n):
    if n < 2: return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0: return False
    return True

print()
for n in [17, 100, 97, 1]:
    print(f"{n} is {'prime' if is_prime(n) else 'not prime'}")`,
      },
      {
        id: "gcd-lcm",
        title: "GCD & LCM",
        description: "Euclidean algorithm",
        language: "python",
        filename: "gcd_lcm.py",
        code: `def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

def lcm(a, b):
    return abs(a * b) // gcd(a, b)

def gcd_recursive(a, b):
    return a if b == 0 else gcd_recursive(b, a % b)

# Extended Euclidean — finds x, y such that: ax + by = gcd(a, b)
def extended_gcd(a, b):
    if b == 0:
        return a, 1, 0
    g, x, y = extended_gcd(b, a % b)
    return g, y, x - (a // b) * y

pairs = [(48, 18), (56, 98), (100, 75), (17, 13)]
for a, b in pairs:
    g = gcd(a, b)
    l = lcm(a, b)
    print(f"GCD({a}, {b}) = {g}   LCM({a}, {b}) = {l}")

print()
a, b = 35, 15
g, x, y = extended_gcd(a, b)
print(f"Extended GCD: {a}×({x}) + {b}×({y}) = {g}")`,
      },
      {
        id: "matrix-mult",
        title: "Matrix Multiplication",
        description: "Naive O(n³) matrix multiply",
        language: "python",
        filename: "matrix.py",
        code: `def matrix_multiply(A, B):
    rows_A, cols_A = len(A), len(A[0])
    rows_B, cols_B = len(B), len(B[0])
    if cols_A != rows_B:
        raise ValueError("Incompatible dimensions")
    C = [[0] * cols_B for _ in range(rows_A)]
    for i in range(rows_A):
        for j in range(cols_B):
            for k in range(cols_A):
                C[i][j] += A[i][k] * B[k][j]
    return C

def print_matrix(M, name=""):
    if name: print(f"{name}:")
    for row in M:
        print(" ", row)

def transpose(M):
    return [[M[j][i] for j in range(len(M))] for i in range(len(M[0]))]

A = [[1, 2, 3],
     [4, 5, 6]]

B = [[7,  8],
     [9, 10],
     [11, 12]]

C = matrix_multiply(A, B)
print_matrix(A, "A (2×3)")
print_matrix(B, "B (3×2)")
print_matrix(C, "A × B (2×2)")
print()
print_matrix(transpose(A), "Transpose of A (3×2)")`,
      },
    ],
  },
  {
    id: "strings",
    label: "String Problems",
    samples: [
      {
        id: "palindrome",
        title: "Palindrome Check",
        description: "Multiple approaches to palindrome",
        language: "python",
        filename: "palindrome.py",
        code: `import re

def is_palindrome_simple(s):
    s = s.lower()
    return s == s[::-1]

def is_palindrome_clean(s):
    # Ignore non-alphanumeric, case-insensitive
    s = re.sub(r'[^a-z0-9]', '', s.lower())
    return s == s[::-1]

def longest_palindrome_substr(s):
    # Expand around center — O(n²)
    n, result = len(s), ""
    for i in range(n):
        for start, end in [(i, i), (i, i + 1)]:  # odd, even length
            l, r = start, end
            while l >= 0 and r < n and s[l] == s[r]:
                l -= 1; r += 1
            sub = s[l + 1:r]
            if len(sub) > len(result):
                result = sub
    return result

words = ["racecar", "hello", "madam", "A man a plan a canal Panama", "Was it a car or a cat I saw"]
for w in words:
    print(f'"{w}" → {is_palindrome_clean(w)}')

print()
texts = ["babad", "cbbd", "racecar"]
for t in texts:
    print(f'Longest palindrome in "{t}": "{longest_palindrome_substr(t)}"')`,
      },
      {
        id: "anagram",
        title: "Anagram Detection",
        description: "Check and group anagrams",
        language: "python",
        filename: "anagram.py",
        code: `from collections import Counter

def is_anagram(s1, s2):
    return Counter(s1.lower()) == Counter(s2.lower())

def is_anagram_sort(s1, s2):
    return sorted(s1.lower()) == sorted(s2.lower())

def group_anagrams(words):
    groups = {}
    for word in words:
        key = "".join(sorted(word.lower()))
        groups.setdefault(key, []).append(word)
    return list(groups.values())

# Test is_anagram
pairs = [("listen", "silent"), ("hello", "world"), ("triangle", "integral"), ("Astronomer", "Moon starer")]
for s1, s2 in pairs:
    print(f'"{s1}" & "{s2}" → {is_anagram(s1, s2)}')

# Group anagrams
print()
words = ["eat", "tea", "tan", "ate", "nat", "bat"]
groups = group_anagrams(words)
print("Grouped anagrams:", groups)`,
      },
    ],
  },
  {
    id: "dp",
    label: "Dynamic Programming",
    samples: [
      {
        id: "knapsack",
        title: "0/1 Knapsack",
        description: "Classic DP optimization problem",
        language: "python",
        filename: "knapsack.py",
        code: `def knapsack(capacity, weights, values, n):
    # Bottom-up DP table
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        for w in range(capacity + 1):
            # Don't include item i
            dp[i][w] = dp[i - 1][w]
            # Include item i if it fits
            if weights[i - 1] <= w:
                dp[i][w] = max(dp[i][w], dp[i - 1][w - weights[i - 1]] + values[i - 1])

    return dp[n][capacity], dp

def trace_items(dp, weights, values, capacity, n):
    selected = []
    w = capacity
    for i in range(n, 0, -1):
        if dp[i][w] != dp[i - 1][w]:
            selected.append(i - 1)
            w -= weights[i - 1]
    return selected[::-1]

values  = [60, 100, 120]
weights = [10,  20,  30]
capacity = 50
n = len(values)

max_val, dp = knapsack(capacity, weights, values, n)
selected = trace_items(dp, weights, values, capacity, n)

print(f"Capacity: {capacity}")
print(f"Items (value, weight): {list(zip(values, weights))}")
print(f"Max value: {max_val}")
print(f"Selected items (0-indexed): {selected}")
print(f"  → values: {[values[i] for i in selected]}, weights: {[weights[i] for i in selected]}")`,
      },
      {
        id: "lcs",
        title: "Longest Common Subsequence",
        description: "Classic DP string problem",
        language: "python",
        filename: "lcs.py",
        code: `def lcs_length(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    return dp[m][n], dp

def lcs_string(s1, s2, dp):
    i, j = len(s1), len(s2)
    result = []
    while i > 0 and j > 0:
        if s1[i - 1] == s2[j - 1]:
            result.append(s1[i - 1])
            i -= 1; j -= 1
        elif dp[i - 1][j] > dp[i][j - 1]:
            i -= 1
        else:
            j -= 1
    return "".join(reversed(result))

pairs = [("ABCBDAB", "BDCAB"), ("AGGTAB", "GXTXAYB"), ("abcde", "ace")]
for s1, s2 in pairs:
    length, dp = lcs_length(s1, s2)
    sub = lcs_string(s1, s2, dp)
    print(f'LCS("{s1}", "{s2}") = "{sub}" (length {length})')`,
      },
      {
        id: "coin-change",
        title: "Coin Change",
        description: "Min coins to make amount",
        language: "python",
        filename: "coin_change.py",
        code: `def coin_change(coins, amount):
    # dp[i] = min coins to make amount i
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0

    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i], dp[i - coin] + 1)

    return dp[amount] if dp[amount] != float('inf') else -1

def coin_change_ways(coins, amount):
    # Count distinct ways to make amount
    dp = [0] * (amount + 1)
    dp[0] = 1
    for coin in coins:
        for i in range(coin, amount + 1):
            dp[i] += dp[i - coin]
    return dp[amount]

coins = [1, 5, 10, 25]
for amount in [11, 30, 41, 100]:
    min_c = coin_change(coins, amount)
    ways = coin_change_ways(coins, amount)
    print(f"Amount {amount:3d}: min coins = {min_c:2d}, ways = {ways}")`,
      },
    ],
  },
  {
    id: "oop",
    label: "OOP Concepts",
    samples: [
      {
        id: "classes-inheritance",
        title: "Classes & Inheritance",
        description: "OOP with polymorphism",
        language: "python",
        filename: "oop.py",
        code: `from abc import ABC, abstractmethod
import math

class Shape(ABC):
    @abstractmethod
    def area(self) -> float: ...

    @abstractmethod
    def perimeter(self) -> float: ...

    def __str__(self):
        return f"{self.__class__.__name__}: area={self.area():.2f}, perimeter={self.perimeter():.2f}"

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        return math.pi * self.radius ** 2

    def perimeter(self):
        return 2 * math.pi * self.radius

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)

class Square(Rectangle):
    def __init__(self, side):
        super().__init__(side, side)

shapes = [Circle(5), Rectangle(4, 6), Square(3)]
for shape in shapes:
    print(shape)

# Polymorphism
print()
total_area = sum(s.area() for s in shapes)
print(f"Total area of all shapes: {total_area:.2f}")`,
      },
      {
        id: "design-patterns",
        title: "Singleton & Observer",
        description: "Common design patterns",
        language: "python",
        filename: "patterns.py",
        code: `# --- Singleton Pattern ---
class Singleton:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.value = 0
        return cls._instance

s1 = Singleton(); s1.value = 42
s2 = Singleton()
print("Singleton:")
print(f"  s1 is s2: {s1 is s2}")
print(f"  s2.value: {s2.value}")  # 42 — same instance

# --- Observer Pattern ---
print()
class EventBus:
    def __init__(self):
        self._listeners = {}

    def subscribe(self, event, fn):
        self._listeners.setdefault(event, []).append(fn)

    def publish(self, event, data=None):
        for fn in self._listeners.get(event, []):
            fn(data)

bus = EventBus()
bus.subscribe("login", lambda d: print(f"  Logger: user '{d}' logged in"))
bus.subscribe("login", lambda d: print(f"  Email: Welcome back, {d}!"))
bus.subscribe("logout", lambda d: print(f"  Logger: user '{d}' logged out"))

print("Observer:")
bus.publish("login", "Alice")
bus.publish("logout", "Alice")`,
      },
    ],
  },
  {
    id: "graphs",
    label: "Graph Algorithms",
    samples: [
      {
        id: "bfs-dfs",
        title: "BFS & DFS",
        description: "Graph traversal algorithms",
        language: "python",
        filename: "bfs_dfs.py",
        code: `from collections import deque

graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F'],
    'D': ['B'],
    'E': ['B', 'F'],
    'F': ['C', 'E'],
}

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()
        if node not in visited:
            visited.add(node)
            order.append(node)
            queue.extend(n for n in graph[node] if n not in visited)
    return order

def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()
    visited.add(start)
    order = [start]
    for neighbor in graph[start]:
        if neighbor not in visited:
            order.extend(dfs(graph, neighbor, visited))
    return order

def has_path(graph, src, dst):
    visited = set()
    stack = [src]
    while stack:
        node = stack.pop()
        if node == dst: return True
        if node not in visited:
            visited.add(node)
            stack.extend(graph[node])
    return False

print("BFS from A:", bfs(graph, 'A'))
print("DFS from A:", dfs(graph, 'A'))
print("Path A→F:", has_path(graph, 'A', 'F'))
print("Path D→C:", has_path(graph, 'D', 'C'))`,
      },
      {
        id: "dijkstra",
        title: "Dijkstra's Algorithm",
        description: "Shortest path in weighted graph",
        language: "python",
        filename: "dijkstra.py",
        code: `import heapq

def dijkstra(graph, start):
    dist = {node: float('inf') for node in graph}
    dist[start] = 0
    prev = {node: None for node in graph}
    pq = [(0, start)]

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v, weight in graph[u]:
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                prev[v] = u
                heapq.heappush(pq, (dist[v], v))

    return dist, prev

def get_path(prev, target):
    path = []
    while target is not None:
        path.append(target)
        target = prev[target]
    return list(reversed(path))

graph = {
    'A': [('B', 4), ('C', 2)],
    'B': [('D', 3), ('C', 1)],
    'C': [('B', 1), ('D', 5)],
    'D': [],
}

dist, prev = dijkstra(graph, 'A')
print("Shortest distances from A:")
for node, d in dist.items():
    path = get_path(prev, node)
    print(f"  A → {node}: {d}  (path: {' → '.join(path)})")`,
      },
    ],
  },
];
