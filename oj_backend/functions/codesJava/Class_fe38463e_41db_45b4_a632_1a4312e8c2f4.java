import java.util.HashSet;
import java.util.Scanner;

public class Class_fe38463e_41db_45b4_a632_1a4312e8c2f4 {
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
