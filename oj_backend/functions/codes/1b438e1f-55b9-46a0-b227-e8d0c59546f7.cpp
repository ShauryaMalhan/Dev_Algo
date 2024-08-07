#include <iostream>
#include <vector>
#include <unordered_map>

int main() {
    int target, n;
    std::cin >> target; // Input the target number
    std::cin >> n; // Input the number of elements

    std::vector<int> nums(n);
    for (int i = 0; i < n; ++i) {
        std::cin >> nums[i]; // Input the elements
    }

    std::unordered_map<int, int> map;
    for (int i = 0; i < n; ++i) {
        int complement = target - nums[i];
        if (map.find(complement) != map.end()) {
            std::cout << "Yes" << std::endl; // Found two numbers that add up to target
            return 0;
        }
        map[nums[i]] = i;
    }

    std::cout << "No" << std::endl; // No such pair found
    return 0;
}
