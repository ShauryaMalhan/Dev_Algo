#include <iostream>
#include <vector>
#include <unordered_map>

bool hasPairWithSum(const std::vector<int>& nums, int target) {
    std::unordered_map<int, bool> numMap;

    for (int num : nums) {
        int complement = target - num;
        if (numMap[complement]) {
            return true;
        }
        numMap[num] = true;
    }
    return false;
}

int main() {
    int target, n;
    std::cin >> n;
    std::cin >> target;

    std::vector<int> nums(n);
    for (int i = 0; i < n; ++i) {
        std::cin >> nums[i];
    }

    if (hasPairWithSum(nums, target)) {
        std::cout << "Yes" << std::endl;
    } else {
        std::cout << "No" << std::endl;
    }

    return 0;
}
