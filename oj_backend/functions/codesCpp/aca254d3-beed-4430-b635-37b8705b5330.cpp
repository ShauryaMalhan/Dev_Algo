#include <bits/stdc++.h>
using namespace std;

int main()
{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    cout.tie(NULL);
    int n;cin>>n;
bool flag = false;
int target;cin>>target;
unordered_map<int, int> mp;
    for(int i = 0;i < n;i++){
int d;cin>>d;
if(mp.count(target - d)){

}
mp[d]++;

}

    return 0;
}