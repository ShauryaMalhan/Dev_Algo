import java.util.*;

public class Main_4240ef7d_d0cf_40bc_81c4_dd3e40474981 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong();
        long k = sc.nextLong();
        String s = sc.next();
        char[] temp = s.toCharArray();
        boolean[] vis = new boolean[(int)((n + 1) / 2)];

        for (int i = 0; i <= (n - 1) / 2; i++) {
            char c1 = temp[i];
            char c2 = temp[(int)(n - i - 1)];
            if (c1 == '?' && c2 == '?') {
                temp[i] = 'a';
                temp[(int)(n - i - 1)] = 'a';
                vis[i] = true;
            } else if (c1 == '?') {
                temp[i] = temp[(int)(n - i - 1)];
                vis[i] = true;
            } else if (c2 == '?') {
                temp[(int)(n - i - 1)] = temp[i];
                vis[i] = true;
            } else {
                if (c1 != c2) {
                    k--;
                    vis[i] = true;
                    char minChar = (char)Math.min(temp[i], temp[(int)(n - i - 1)]);
                    temp[i] = minChar;
                    temp[(int)(n - i - 1)] = minChar;
                }
            }
        }

        if (k < 0) {
            System.out.println(-1);
        } else {
            for (int i = 0; i <= (n - 1) / 2; i++) {
                char c1 = temp[i];
                char c2 = temp[(int)(n - i - 1)];
                if (c1 != 'a') {
                    int val = 2 - (vis[i] ? 1 : 0);
                    if (i == n - i - 1) {
                        val--;
                    }
                    if (k >= val) {
                        k -= val;
                        temp[i] = 'a';
                        temp[(int)(n - i - 1)] = 'a';
                    }
                }
            }
            System.out.println(new String(temp));
        }

        sc.close();
    }
}
