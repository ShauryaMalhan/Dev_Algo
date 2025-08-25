#include<bits/stdc++.h>
using namespace std;
 
#define int long long
 
signed main()
{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n, k;
    cin >> n; cin >> k;
    string s;
    cin >> s;
    vector<char> temp;
    for (int i = 0; i < n; i++) {
        temp.push_back(s[i]);
    }
    vector<bool> vis((n + 1) / 2, false);
    for (int i = 0; i <= (n - 1) / 2; i++) {
        char c1 = temp[i];
        char c2 = temp[n - i - 1];
        if (c1 == '?' && c2 == '?') {
            temp[i] = 'a';
            temp[n - i - 1] = 'a';
            vis[i] = true;
        } else if (c1 == '?') {
            temp[i] = temp[n - i - 1];
            vis[i] = true;
        } else if (c2 == '?') {
            temp[n - i - 1] = temp[i];
            vis[i] = true;
        } else {
            if (c1 != c2) {
                k--;
                vis[i] = true;
                temp[i] = min(temp[i], temp[n - i - 1]);
                temp[n - i - 1] = min(temp[i], temp[n - i - 1]);
            }
        }
    }
    if (k < 0) {
        cout << -1 << endl;
    } else {
        for (int i = 0; i <= (n - 1) / 2; i++) {
            char c1 = temp[i];
            char c2 = temp[n - i - 1];
            if (c1 != 'a') {
                int val = 2 - (vis[i] ? 1 : 0);
                if (i == n - i - 1) {
                    val--;
                }
                if (k >= val) {
                    k -= val;
                    temp[i] = 'a';
                    temp[n - i - 1] = 'a';
                }
            }
        }
        string ans = "";
        for (int i = 0; i < n; i++) {
            ans += temp[i];
        }
        cout << ans << endl;
    }
}
