import java.io.*;
import java.util.*;

public class WordCompletion {

    private TrieNode root;

    public WordCompletion() {
        root = new TrieNode();
    }

    public void buildTrie(File file) {
        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = br.readLine()) != null) {
                String[] tokens = line.toLowerCase().replaceAll("[^a-z\\s]", " ").split("\\s+");
                for (String token : tokens) {
                    if (token.length() > 2) {
                        insert(token);
                    }
                }
            }
        } catch (IOException e) {
            System.out.println("Error reading file for Trie: " + file.getName());
        }
    }

    private void insert(String word) {
        TrieNode current = root;
        for (char c : word.toCharArray()) {
            current.children.putIfAbsent(c, new TrieNode());
            current = current.children.get(c);
        }
        current.isEndOfWord = true;
    }

    public String getSuggestions(String prefix) {
        List<String> results = new ArrayList<>();
        TrieNode current = root;

        for (char c : prefix.toLowerCase().toCharArray()) {
            if (!current.children.containsKey(c)) {
                return "[]"; // No suggestions
            }
            current = current.children.get(c);
        }

        findAllWords(current, prefix.toLowerCase(), results);

        // Convert to JSON
        StringBuilder json = new StringBuilder("[");
        int limit = Math.min(5, results.size());
        for (int i = 0; i < limit; i++) {
            json.append("\"").append(results.get(i)).append("\"");
            if (i < limit - 1)
                json.append(",");
        }
        json.append("]");
        return json.toString();
    }

    private void findAllWords(TrieNode node, String currentWord, List<String> results) {
        if (node.isEndOfWord) {
            results.add(currentWord);
        }
        for (Map.Entry<Character, TrieNode> entry : node.children.entrySet()) {
            findAllWords(entry.getValue(), currentWord + entry.getKey(), results);
        }
    }

    static class TrieNode {
        Map<Character, TrieNode> children = new HashMap<>();
        boolean isEndOfWord = false;
    }
}
