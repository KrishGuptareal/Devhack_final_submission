// DSA Questions Database - Organized by difficulty with topics and metadata

export const DSA_QUESTIONS = {
    easy: [
        { id: 1, title: "Two Sum", topics: ["Arrays", "Hashing"], platform: "LeetCode", link: "https://leetcode.com/problems/two-sum/", estimatedTime: 20 },
        { id: 2, title: "Palindrome Number", topics: ["Math"], platform: "LeetCode", link: "https://leetcode.com/problems/palindrome-number/", estimatedTime: 15 },
        { id: 3, title: "Roman to Integer", topics: ["Strings", "Hashing"], platform: "LeetCode", link: "https://leetcode.com/problems/roman-to-integer/", estimatedTime: 20 },
        { id: 4, title: "Longest Common Prefix", topics: ["Strings"], platform: "LeetCode", link: "https://leetcode.com/problems/longest-common-prefix/", estimatedTime: 20 },
        { id: 5, title: "Valid Parentheses", topics: ["Stack", "Strings"], platform: "LeetCode", link: "https://leetcode.com/problems/valid-parentheses/", estimatedTime: 20 },
        { id: 6, title: "Merge Two Sorted Lists", topics: ["Linked List"], platform: "LeetCode", link: "https://leetcode.com/problems/merge-two-sorted-lists/", estimatedTime: 25 },
        { id: 7, title: "Remove Duplicates from Sorted Array", topics: ["Arrays", "Two Pointers"], platform: "LeetCode", link: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/", estimatedTime: 20 },
        { id: 8, title: "Remove Element", topics: ["Arrays", "Two Pointers"], platform: "LeetCode", link: "https://leetcode.com/problems/remove-element/", estimatedTime: 15 },
        { id: 9, title: "Search Insert Position", topics: ["Arrays", "Binary Search"], platform: "LeetCode", link: "https://leetcode.com/problems/search-insert-position/", estimatedTime: 20 },
        { id: 10, title: "Length of Last Word", topics: ["Strings"], platform: "LeetCode", link: "https://leetcode.com/problems/length-of-last-word/", estimatedTime: 10 },
        { id: 11, title: "Maximum Subarray", topics: ["Arrays", "Dynamic Programming"], platform: "LeetCode", link: "https://leetcode.com/problems/maximum-subarray/", estimatedTime: 25 },
        { id: 12, title: "Binary Tree Inorder Traversal", topics: ["Trees", "DFS"], platform: "LeetCode", link: "https://leetcode.com/problems/binary-tree-inorder-traversal/", estimatedTime: 20 },
        { id: 13, title: "Symmetric Tree", topics: ["Trees", "BFS", "DFS"], platform: "LeetCode", link: "https://leetcode.com/problems/symmetric-tree/", estimatedTime: 25 },
        { id: 14, title: "Maximum Depth of Binary Tree", topics: ["Trees", "DFS"], platform: "LeetCode", link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", estimatedTime: 15 },
        { id: 15, title: "Same Tree", topics: ["Trees", "DFS"], platform: "LeetCode", link: "https://leetcode.com/problems/same-tree/", estimatedTime: 15 },
        { id: 16, title: "Balanced Binary Tree", topics: ["Trees", "DFS"], platform: "LeetCode", link: "https://leetcode.com/problems/balanced-binary-tree/", estimatedTime: 25 },
        { id: 17, title: "Path Sum", topics: ["Trees", "DFS"], platform: "LeetCode", link: "https://leetcode.com/problems/path-sum/", estimatedTime: 20 },
        { id: 18, title: "Convert Sorted Array to BST", topics: ["Trees", "Binary Search"], platform: "LeetCode", link: "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/", estimatedTime: 25 },
        { id: 19, title: "Implement Stack using Queues", topics: ["Stack", "Queue", "Design"], platform: "LeetCode", link: "https://leetcode.com/problems/implement-stack-using-queues/", estimatedTime: 25 },
        { id: 20, title: "Implement Queue using Stacks", topics: ["Stack", "Queue", "Design"], platform: "LeetCode", link: "https://leetcode.com/problems/implement-queue-using-stacks/", estimatedTime: 25 },
        { id: 21, title: "Min Stack", topics: ["Stack", "Design"], platform: "LeetCode", link: "https://leetcode.com/problems/min-stack/", estimatedTime: 25 },
        { id: 22, title: "Find Pivot Index", topics: ["Arrays", "Prefix Sum"], platform: "LeetCode", link: "https://leetcode.com/problems/find-pivot-index/", estimatedTime: 20 },
        { id: 23, title: "Find All Numbers Disappeared", topics: ["Arrays", "Hashing"], platform: "LeetCode", link: "https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/", estimatedTime: 25 },
        { id: 24, title: "Find All Duplicates", topics: ["Arrays", "Hashing"], platform: "LeetCode", link: "https://leetcode.com/problems/find-all-duplicates-in-an-array/", estimatedTime: 25 },
        { id: 25, title: "Island Perimeter", topics: ["Arrays", "Matrix", "DFS"], platform: "LeetCode", link: "https://leetcode.com/problems/island-perimeter/", estimatedTime: 20 },
        { id: 26, title: "Design HashMap", topics: ["Design", "Hashing"], platform: "LeetCode", link: "https://leetcode.com/problems/design-hashmap/", estimatedTime: 30 },
        { id: 27, title: "Design HashSet", topics: ["Design", "Hashing"], platform: "LeetCode", link: "https://leetcode.com/problems/design-hashset/", estimatedTime: 25 },
        { id: 28, title: "Binary Tree Preorder Traversal", topics: ["Trees", "DFS"], platform: "LeetCode", link: "https://leetcode.com/problems/binary-tree-preorder-traversal/", estimatedTime: 15 },
        { id: 29, title: "Binary Tree Postorder Traversal", topics: ["Trees", "DFS"], platform: "LeetCode", link: "https://leetcode.com/problems/binary-tree-postorder-traversal/", estimatedTime: 15 },
        { id: 30, title: "Minimum Depth of Binary Tree", topics: ["Trees", "BFS", "DFS"], platform: "LeetCode", link: "https://leetcode.com/problems/minimum-depth-of-binary-tree/", estimatedTime: 20 }
    ],
    medium: [
        { id: 101, title: "Add Two Numbers", topics: ["Linked List", "Math"], platform: "LeetCode", link: "https://leetcode.com/problems/add-two-numbers/", estimatedTime: 35 },
        { id: 102, title: "Longest Substring Without Repeating", topics: ["Strings", "Sliding Window", "Hashing"], platform: "LeetCode", link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", estimatedTime: 40 },
        { id: 103, title: "Longest Palindromic Substring", topics: ["Strings", "Dynamic Programming"], platform: "LeetCode", link: "https://leetcode.com/problems/longest-palindromic-substring/", estimatedTime: 45 },
        { id: 104, title: "3Sum", topics: ["Arrays", "Two Pointers", "Sorting"], platform: "LeetCode", link: "https://leetcode.com/problems/3sum/", estimatedTime: 45 },
        { id: 105, title: "Container With Most Water", topics: ["Arrays", "Two Pointers", "Greedy"], platform: "LeetCode", link: "https://leetcode.com/problems/container-with-most-water/", estimatedTime: 35 },
        { id: 106, title: "Letter Combinations of Phone", topics: ["Strings", "Backtracking"], platform: "LeetCode", link: "https://leetcode.com/problems/letter-combinations-of-a-phone-number/", estimatedTime: 40 },
        { id: 107, title: "Remove Nth Node From End", topics: ["Linked List", "Two Pointers"], platform: "LeetCode", link: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/", estimatedTime: 30 },
        { id: 108, title: "Generate Parentheses", topics: ["Strings", "Backtracking"], platform: "LeetCode", link: "https://leetcode.com/problems/generate-parentheses/", estimatedTime: 40 },
        { id: 109, title: "Swap Nodes in Pairs", topics: ["Linked List", "Recursion"], platform: "LeetCode", link: "https://leetcode.com/problems/swap-nodes-in-pairs/", estimatedTime: 30 },
        { id: 110, title: "Next Permutation", topics: ["Arrays", "Math"], platform: "LeetCode", link: "https://leetcode.com/problems/next-permutation/", estimatedTime: 40 },
        { id: 111, title: "Search in Rotated Sorted Array", topics: ["Arrays", "Binary Search"], platform: "LeetCode", link: "https://leetcode.com/problems/search-in-rotated-sorted-array/", estimatedTime: 40 },
        { id: 112, title: "Find First and Last Position", topics: ["Arrays", "Binary Search"], platform: "LeetCode", link: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/", estimatedTime: 35 },
        { id: 113, title: "Combination Sum", topics: ["Arrays", "Backtracking"], platform: "LeetCode", link: "https://leetcode.com/problems/combination-sum/", estimatedTime: 40 },
        { id: 114, title: "Combination Sum II", topics: ["Arrays", "Backtracking"], platform: "LeetCode", link: "https://leetcode.com/problems/combination-sum-ii/", estimatedTime: 45 },
        { id: 115, title: "Jump Game", topics: ["Arrays", "Greedy", "Dynamic Programming"], platform: "LeetCode", link: "https://leetcode.com/problems/jump-game/", estimatedTime: 35 },
        { id: 116, title: "Jump Game II", topics: ["Arrays", "Greedy", "Dynamic Programming"], platform: "LeetCode", link: "https://leetcode.com/problems/jump-game-ii/", estimatedTime: 45 },
        { id: 117, title: "Permutations", topics: ["Arrays", "Backtracking"], platform: "LeetCode", link: "https://leetcode.com/problems/permutations/", estimatedTime: 35 },
        { id: 118, title: "Rotate Image", topics: ["Arrays", "Matrix"], platform: "LeetCode", link: "https://leetcode.com/problems/rotate-image/", estimatedTime: 30 },
        { id: 119, title: "Group Anagrams", topics: ["Strings", "Hashing", "Sorting"], platform: "LeetCode", link: "https://leetcode.com/problems/group-anagrams/", estimatedTime: 35 },
        { id: 120, title: "Spiral Matrix", topics: ["Arrays", "Matrix"], platform: "LeetCode", link: "https://leetcode.com/problems/spiral-matrix/", estimatedTime: 40 },
        { id: 121, title: "Merge Intervals", topics: ["Arrays", "Sorting"], platform: "LeetCode", link: "https://leetcode.com/problems/merge-intervals/", estimatedTime: 35 },
        { id: 122, title: "Subsets", topics: ["Arrays", "Backtracking"], platform: "LeetCode", link: "https://leetcode.com/problems/subsets/", estimatedTime: 35 },
        { id: 123, title: "Word Search", topics: ["Arrays", "Backtracking", "Matrix"], platform: "LeetCode", link: "https://leetcode.com/problems/word-search/", estimatedTime: 50 },
        { id: 124, title: "Kth Largest Element", topics: ["Arrays", "Heap", "Quick Select"], platform: "LeetCode", link: "https://leetcode.com/problems/kth-largest-element-in-an-array/", estimatedTime: 40 },
        { id: 125, title: "Top K Frequent Elements", topics: ["Arrays", "Heap", "Hashing"], platform: "LeetCode", link: "https://leetcode.com/problems/top-k-frequent-elements/", estimatedTime: 40 },
        { id: 126, title: "Product of Array Except Self", topics: ["Arrays", "Prefix Sum"], platform: "LeetCode", link: "https://leetcode.com/problems/product-of-array-except-self/", estimatedTime: 35 },
        { id: 127, title: "Maximum Product Subarray", topics: ["Arrays", "Dynamic Programming"], platform: "LeetCode", link: "https://leetcode.com/problems/maximum-product-subarray/", estimatedTime: 40 },
        { id: 128, title: "Find Peak Element", topics: ["Arrays", "Binary Search"], platform: "LeetCode", link: "https://leetcode.com/problems/find-peak-element/", estimatedTime: 30 },
        { id: 129, title: "Validate BST", topics: ["Trees", "DFS"], platform: "LeetCode", link: "https://leetcode.com/problems/validate-binary-search-tree/", estimatedTime: 35 },
        { id: 130, title: "Binary Tree Level Order", topics: ["Trees", "BFS"], platform: "LeetCode", link: "https://leetcode.com/problems/binary-tree-level-order-traversal/", estimatedTime: 30 },
        { id: 131, title: "Lowest Common Ancestor BST", topics: ["Trees", "DFS"], platform: "LeetCode", link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/", estimatedTime: 30 },
        { id: 132, title: "Lowest Common Ancestor BT", topics: ["Trees", "DFS"], platform: "LeetCode", link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/", estimatedTime: 40 },
        { id: 133, title: "Implement Trie", topics: ["Trees", "Trie", "Design"], platform: "LeetCode", link: "https://leetcode.com/problems/implement-trie-prefix-tree/", estimatedTime: 45 },
        { id: 134, title: "Number of Islands", topics: ["Graph", "DFS", "BFS", "Matrix"], platform: "LeetCode", link: "https://leetcode.com/problems/number-of-islands/", estimatedTime: 35 },
        { id: 135, title: "Course Schedule", topics: ["Graph", "Topological Sort", "DFS"], platform: "LeetCode", link: "https://leetcode.com/problems/course-schedule/", estimatedTime: 45 },
        { id: 136, title: "Course Schedule II", topics: ["Graph", "Topological Sort", "DFS"], platform: "LeetCode", link: "https://leetcode.com/problems/course-schedule-ii/", estimatedTime: 50 },
        { id: 137, title: "Clone Graph", topics: ["Graph", "DFS", "BFS"], platform: "LeetCode", link: "https://leetcode.com/problems/clone-graph/", estimatedTime: 40 },
        { id: 138, title: "Word Ladder", topics: ["Graph", "BFS"], platform: "LeetCode", link: "https://leetcode.com/problems/word-ladder/", estimatedTime: 50 },
        { id: 139, title: "Longest Consecutive Sequence", topics: ["Arrays", "Hashing", "Union Find"], platform: "LeetCode", link: "https://leetcode.com/problems/longest-consecutive-sequence/", estimatedTime: 40 },
        { id: 140, title: "Task Scheduler", topics: ["Arrays", "Greedy", "Heap"], platform: "LeetCode", link: "https://leetcode.com/problems/task-scheduler/", estimatedTime: 50 }
    ],
    hard: [
        { id: 201, title: "Median of Two Sorted Arrays", topics: ["Arrays", "Binary Search"], platform: "LeetCode", link: "https://leetcode.com/problems/median-of-two-sorted-arrays/", estimatedTime: 75 },
        { id: 202, title: "Regular Expression Matching", topics: ["Strings", "Dynamic Programming", "Recursion"], platform: "LeetCode", link: "https://leetcode.com/problems/regular-expression-matching/", estimatedTime: 90 },
        { id: 203, title: "Merge k Sorted Lists", topics: ["Linked List", "Heap", "Divide and Conquer"], platform: "LeetCode", link: "https://leetcode.com/problems/merge-k-sorted-lists/", estimatedTime: 60 },
        { id: 204, title: "First Missing Positive", topics: ["Arrays", "Hashing"], platform: "LeetCode", link: "https://leetcode.com/problems/first-missing-positive/", estimatedTime: 60 },
        { id: 205, title: "Trapping Rain Water", topics: ["Arrays", "Two Pointers", "Stack", "Dynamic Programming"], platform: "LeetCode", link: "https://leetcode.com/problems/trapping-rain-water/", estimatedTime: 60 },
        { id: 206, title: "Wildcard Matching", topics: ["Strings", "Dynamic Programming", "Greedy"], platform: "LeetCode", link: "https://leetcode.com/problems/wildcard-matching/", estimatedTime: 75 },
        { id: 207, title: "N-Queens", topics: ["Arrays", "Backtracking"], platform: "LeetCode", link: "https://leetcode.com/problems/n-queens/", estimatedTime: 75 },
        { id: 208, title: "Longest Valid Parentheses", topics: ["Strings", "Stack", "Dynamic Programming"], platform: "LeetCode", link: "https://leetcode.com/problems/longest-valid-parentheses/", estimatedTime: 60 },
        { id: 209, title: "Minimum Window Substring", topics: ["Strings", "Sliding Window", "Hashing"], platform: "LeetCode", link: "https://leetcode.com/problems/minimum-window-substring/", estimatedTime: 75 },
        { id: 210, title: "Word Ladder II", topics: ["Graph", "BFS", "Backtracking"], platform: "LeetCode", link: "https://leetcode.com/problems/word-ladder-ii/", estimatedTime: 90 },
        { id: 211, title: "Word Search II", topics: ["Arrays", "Backtracking", "Trie"], platform: "LeetCode", link: "https://leetcode.com/problems/word-search-ii/", estimatedTime: 75 },
        { id: 212, title: "Largest Rectangle in Histogram", topics: ["Arrays", "Stack"], platform: "LeetCode", link: "https://leetcode.com/problems/largest-rectangle-in-histogram/", estimatedTime: 60 },
        { id: 213, title: "Maximal Rectangle", topics: ["Arrays", "Stack", "Dynamic Programming", "Matrix"], platform: "LeetCode", link: "https://leetcode.com/problems/maximal-rectangle/", estimatedTime: 75 },
        { id: 214, title: "Sliding Window Maximum", topics: ["Arrays", "Sliding Window", "Deque", "Heap"], platform: "LeetCode", link: "https://leetcode.com/problems/sliding-window-maximum/", estimatedTime: 60 },
        { id: 215, title: "Edit Distance", topics: ["Strings", "Dynamic Programming"], platform: "LeetCode", link: "https://leetcode.com/problems/edit-distance/", estimatedTime: 60 },
        { id: 216, title: "Longest Increasing Path in Matrix", topics: ["Arrays", "Matrix", "DFS", "Dynamic Programming"], platform: "LeetCode", link: "https://leetcode.com/problems/longest-increasing-path-in-a-matrix/", estimatedTime: 75 },
        { id: 217, title: "Binary Tree Maximum Path Sum", topics: ["Trees", "DFS", "Dynamic Programming"], platform: "LeetCode", link: "https://leetcode.com/problems/binary-tree-maximum-path-sum/", estimatedTime: 60 },
        { id: 218, title: "Serialize and Deserialize BT", topics: ["Trees", "BFS", "Design"], platform: "LeetCode", link: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", estimatedTime: 60 },
        { id: 219, title: "LRU Cache", topics: ["Design", "Linked List", "Hashing"], platform: "LeetCode", link: "https://leetcode.com/problems/lru-cache/", estimatedTime: 60 },
        { id: 220, title: "LFU Cache", topics: ["Design", "Linked List", "Hashing"], platform: "LeetCode", link: "https://leetcode.com/problems/lfu-cache/", estimatedTime: 90 }
    ]
};

// Topic categories for filtering
export const TOPICS = [
    "Arrays", "Strings", "Linked List", "Stack", "Queue", "Trees", "Graph",
    "Hashing", "Binary Search", "Two Pointers", "Sliding Window", "Dynamic Programming",
    "Greedy", "Backtracking", "Heap", "Trie", "Matrix", "Math", "Design",
    "DFS", "BFS", "Recursion", "Divide and Conquer", "Sorting", "Prefix Sum",
    "Union Find", "Topological Sort"
];

// Weekly schedule template
export const WEEKLY_SCHEDULE = {
    monday: { difficulty: "easy", message: "New week, new problems! Let's start strong 💻" },
    tuesday: { difficulty: "easy", message: "Keep the momentum going! 🚀" },
    wednesday: { difficulty: "easy", message: "Halfway through the week! 🔥" },
    thursday: { difficulty: "easy", message: "One more easy before the challenge! 💡" },
    friday: { difficulty: "medium", message: "Medium problem incoming! You're ready for this 💪" },
    saturday: { difficulty: "medium", message: "Weekend = Level up time! 🧠" },
    sunday: { difficulty: "hard", message: "Challenge day! Hard problems build strong programmers 🏆" }
};

// Streak milestones
export const STREAK_MILESTONES = {
    7: { message: "One week streak! 🎯", badge: "🎯" },
    14: { message: "Two weeks strong! 💪", badge: "💪" },
    30: { message: "One month! You're unstoppable! 🏆", badge: "🏆" },
    60: { message: "Two months of consistency! 🌟", badge: "🌟" },
    100: { message: "Century! You're in the top 5% of consistent coders! 👑", badge: "👑" }
};

// Contest platforms
export const CONTEST_PLATFORMS = [
    { name: "LeetCode", url: "https://leetcode.com/contest/", color: "#FFA116", icon: "🔶" },
    { name: "Codeforces", url: "https://codeforces.com/contests", color: "#318CE7", icon: "🔷" },
    { name: "CodeChef", url: "https://www.codechef.com/contests", color: "#5B4638", icon: "🍳" },
    { name: "AtCoder", url: "https://atcoder.jp/contests/", color: "#000000", icon: "⬛" }
];

export default DSA_QUESTIONS;
