import java.util.HashSet;
import java.util.Scanner;

public class Class_3198e662_ae7a_49b8_83fa_0ca6b946f33a {
    public static String twoSum(int[] nums, int k) {
        HashSet<Integer> complements = new HashSet<>();
        for (int num : nums) {
            if (complements.contains(k - num)) {
                return "yes"; // Found two numbers that sum to k
            }
            complements.add(num);
        }
        return "no"; // No two numbers found
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt(); // Input size of array
        int k = scanner.nextInt(); // Input target k
        int[] nums = new int[n];

        for (int i = 0; i < n; i++) {
            nums[i] = scanner.nextInt(); // Input array elements
        }

        System.out.println(twoSum(nums, k)); // Output result
    }
}
