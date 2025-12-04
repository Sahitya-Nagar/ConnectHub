import java.io.*;
import java.util.*;

public class SpellChecker {

    private Set<String> vocabulary = new HashSet<>();

    public void buildVocabulary(File file) {
        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = br.readLine()) != null) {
                String[] tokens = line.toLowerCase().replaceAll("[^a-z\\s]", " ").split("\\s+");
                for (String token : tokens) {
                    if (token.length() > 2) {
                        vocabulary.add(token);
                    }
                }
            }
        } catch (IOException e) {
            System.out.println("Error reading file for vocabulary: " + file.getName());
        }
    }

    public String check(String word) {
        String lowerWord = word.toLowerCase();
        if (vocabulary.contains(lowerWord)) {
            return lowerWord; // Correct
        }

        // Find closest match using Edit Distance
        String bestMatch = "";
        int minDistance = Integer.MAX_VALUE;

        for (String vocabWord : vocabulary) {
            int distance = computeEditDistance(lowerWord, vocabWord);
            if (distance < minDistance) {
                minDistance = distance;
                bestMatch = vocabWord;
            }
        }

        // Only return if it's a reasonable correction (e.g. distance <= 2)
        if (minDistance <= 2) {
            return bestMatch;
        }
        return lowerWord; // No good suggestion found
    }

    private int computeEditDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];

        for (int i = 0; i <= s1.length(); i++) {
            for (int j = 0; j <= s2.length(); j++) {
                if (i == 0) {
                    dp[i][j] = j;
                } else if (j == 0) {
                    dp[i][j] = i;
                } else {
                    dp[i][j] = min(
                            dp[i - 1][j - 1] + (s1.charAt(i - 1) == s2.charAt(j - 1) ? 0 : 1),
                            dp[i - 1][j] + 1,
                            dp[i][j - 1] + 1);
                }
            }
        }
        return dp[s1.length()][s2.length()];
    }

    private int min(int a, int b, int c) {
        return Math.min(a, Math.min(b, c));
    }
}
