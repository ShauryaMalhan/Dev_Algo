#include <bits/stdc++.h>
using namespace std;#include <iostream>
#include <vector>
#include <unordered_map>

int main() {
    int target, n;
    std::cin >> target;
    std::cin >> n;
    
    std::vector<int> nums(n);
    for (int i = 0; i < n; ++i) {
        std::cin >> nums[i];
    }

    std::unordered_map<int, int> map;
    for (int i = 0; i < n; ++i) {
        int complement = target - nums[i];
        if (map.find(complement) != map.end()) {
            std::cout << "Yes" << std::endl;
            return 0;
        }
        map[nums[i]] = i;
    }

    std::cout << "No" << std::endl;
    return 0;
}


int main()
{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    cout.tie(NULL);
    // Your code here
    return 0;
}